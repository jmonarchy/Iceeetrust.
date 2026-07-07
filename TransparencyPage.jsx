import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search, DollarSign, Users, Activity, RefreshCw, Eye, Trash2,
  Upload, FileText, Database, Shield, LogOut, Bell, ChevronRight,
  Edit, Plus, Download, Filter, CheckCircle, XCircle, Clock,
  BarChart3, Folder, File, Image, Mail, Phone, Calendar,
  AlertCircle, Info, Loader2, Save, X, CreditCard, Newspaper,
  Globe, BookOpen, Award, Lightbulb,
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLLECTIONS = [
  { id: 'donations',              label: 'Donations',              icon: DollarSign },
  { id: 'contact_submissions',    label: 'Contact Submissions',    icon: Mail },
  { id: 'volunteer_signups',      label: 'Volunteer Signups',      icon: Users },
  { id: 'partnership_inquiries',  label: 'Partnership Inquiries',  icon: Users },
  { id: 'project_proposals',      label: 'Project Proposals',      icon: FileText },
  { id: 'files',                  label: 'Files',                  icon: File },
  { id: 'impact_stories',         label: 'Impact Stories',         icon: BarChart3 },
];

const CONTACT_PHONE = '+255717798351';

// ─── Utility helpers ──────────────────────────────────────────────────────────

const fmt = {
  date: (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A',
  currency: (v, c = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: c || 'USD' }).format(v || 0),
  bytes: (b) => {
    if (!b) return '0 B';
    const k = 1024, s = ['B','KB','MB','GB'], i = Math.floor(Math.log(b)/Math.log(k));
    return parseFloat((b/Math.pow(k,i)).toFixed(2)) + ' ' + s[i];
  },
};

const StatusBadge = ({ status }) => {
  const map = {
    COMPLETED: 'bg-green-500/10 text-green-700 border-green-500/20',
    PENDING:   'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    FAILED:    'bg-red-500/10 text-red-700 border-red-500/20',
    CANCELLED: 'bg-red-500/10 text-red-700 border-red-500/20',
  };
  return (
    <Badge className={map[status] || 'bg-gray-500/10 text-gray-700 border-gray-500/20'}>
      {status || 'Unknown'}
    </Badge>
  );
};

// ─── Action Log ───────────────────────────────────────────────────────────────

const actionLog = (() => {
  let entries = [];
  let listeners = [];
  return {
    add: (msg, user) => {
      entries.unshift({ msg, user, time: new Date() });
      if (entries.length > 100) entries.pop();
      listeners.forEach(fn => fn([...entries]));
    },
    subscribe: (fn) => { listeners.push(fn); return () => { listeners = listeners.filter(l => l !== fn); }; },
    get: () => [...entries],
  };
})();

// ─── Stat Cards ───────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, sub, color = 'text-primary' }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`w-4 h-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </CardContent>
  </Card>
);

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const OverviewTab = ({ currentUser }) => {
  const [stats, setStats] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [donations, contacts, volunteers] = await Promise.all([
        pb.collection('donations').getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection('contact_submissions').getList(1, 1, { $autoCancel: false }).catch(() => ({ totalItems: 0 })),
        pb.collection('volunteer_signups').getList(1, 1, { $autoCancel: false }).catch(() => ({ totalItems: 0 })),
      ]);
      const completed = donations.filter(d => d.payment_status === 'COMPLETED');
      const total = completed.reduce((s, d) => s + (d.amount || 0), 0);
      setStats({
        totalDonations: fmt.currency(total),
        donationCount: completed.length,
        contacts: contacts.totalItems,
        volunteers: volunteers.totalItems,
        pending: donations.filter(d => d.payment_status === 'PENDING').length,
      });
      setRecentDonations(donations.slice(0, 5));
    } catch (e) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time subscription
  useEffect(() => {
    load();
    let unsub;
    pb.collection('donations').subscribe('*', () => load(), { $autoCancel: false })
      .then(fn => { unsub = fn; }).catch(() => {});
    return () => { unsub?.(); };
  }, [load]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Raised" value={stats?.totalDonations} icon={DollarSign} sub={`${stats?.donationCount} completed donations`} />
        <StatCard title="Pending Payments" value={stats?.pending} icon={Clock} color="text-yellow-600" sub="Awaiting confirmation" />
        <StatCard title="Contact Inquiries" value={stats?.contacts} icon={Mail} color="text-blue-600" />
        <StatCard title="Volunteer Signups" value={stats?.volunteers} icon={Users} color="text-green-600" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Donations</CardTitle>
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDonations.map(d => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="font-medium">{d.donor_name}</div>
                    <div className="text-xs text-muted-foreground">{d.donor_email}</div>
                  </TableCell>
                  <TableCell className="font-medium">{fmt.currency(d.amount, d.currency)}</TableCell>
                  <TableCell className="text-sm">{d.payment_method || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmt.date(d.created)}</TableCell>
                  <TableCell><StatusBadge status={d.payment_status} /></TableCell>
                </TableRow>
              ))}
              {recentDonations.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No donations yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Database Tab ─────────────────────────────────────────────────────────────

const DatabaseTab = ({ currentUser }) => {
  const [activeCollection, setActiveCollection] = useState(COLLECTIONS[0].id);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [editRecord, setEditRecord] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const PER_PAGE = 15;

  const fetchRecords = useCallback(async (col = activeCollection, p = page, q = search) => {
    setLoading(true);
    try {
      const filter = q ? `donor_name ~ "${q}" || donor_email ~ "${q}" || name ~ "${q}" || email ~ "${q}"` : '';
      const res = await pb.collection(col).getList(p, PER_PAGE, {
        sort: '-created',
        filter: filter || undefined,
        $autoCancel: false,
      });
      setRecords(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (e) {
      toast.error(`Failed to load ${col}: ${e.message}`);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [activeCollection, page, search]);

  useEffect(() => {
    setPage(1);
    fetchRecords(activeCollection, 1, search);
  }, [activeCollection]);

  useEffect(() => {
    fetchRecords(activeCollection, page, search);
  }, [page]);

  // Real-time updates
  useEffect(() => {
    let unsub;
    pb.collection(activeCollection).subscribe('*', () => {
      fetchRecords(activeCollection, page, search);
    }, { $autoCancel: false }).then(fn => { unsub = fn; }).catch(() => {});
    return () => { unsub?.(); };
  }, [activeCollection]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecords(activeCollection, 1, search);
  };

  const handleDelete = async () => {
    try {
      await pb.collection(activeCollection).delete(deleteId, { $autoCancel: false });
      actionLog.add(`Deleted record ${deleteId} from ${activeCollection}`, currentUser?.email);
      toast.success('Record deleted');
      setDeleteOpen(false);
      fetchRecords(activeCollection, page, search);
    } catch (e) {
      toast.error(`Delete failed: ${e.message}`);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const { id, collectionId, collectionName, created, updated, expand, ...fields } = editRecord;
      await pb.collection(activeCollection).update(id, fields, { $autoCancel: false });
      actionLog.add(`Updated record ${id} in ${activeCollection}`, currentUser?.email);
      toast.success('Record updated');
      setEditOpen(false);
      fetchRecords(activeCollection, page, search);
    } catch (e) {
      toast.error(`Update failed: ${e.message}`);
    }
  };

  const columns = records.length > 0
    ? Object.keys(records[0]).filter(k => !['collectionId','collectionName','expand'].includes(k))
    : [];

  const displayCols = columns.slice(0, 5);

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0">
        <Card className="sticky top-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Collections</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {COLLECTIONS.map(col => {
              const Icon = col.icon;
              return (
                <button
                  key={col.id}
                  onClick={() => setActiveCollection(col.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCollection === col.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{col.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4">
        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>{COLLECTIONS.find(c => c.id === activeCollection)?.label}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{totalItems} records</p>
              </div>
              <div className="flex gap-2">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Search records..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-48"
                  />
                  <Button type="submit" size="icon" variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
                <Button size="icon" variant="outline" onClick={() => fetchRecords(activeCollection, page, search)} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : records.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {displayCols.map(c => <TableHead key={c} className="whitespace-nowrap">{c}</TableHead>)}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map(rec => (
                      <TableRow key={rec.id} className="hover:bg-muted/50">
                        {displayCols.map(col => (
                          <TableCell key={col} className="max-w-[160px] truncate text-sm" title={String(rec[col] ?? '')}>
                            {col === 'payment_status' ? <StatusBadge status={rec[col]} /> : String(rec[col] ?? '—').substring(0, 40)}
                          </TableCell>
                        ))}
                        <TableCell className="text-right whitespace-nowrap">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setViewRecord(rec); setViewOpen(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditRecord({ ...rec }); setEditOpen(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => { setDeleteId(rec.id); setDeleteOpen(true); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Record Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
            <DialogDescription>{viewRecord?.id}</DialogDescription>
          </DialogHeader>
          {viewRecord && (
            <div className="space-y-3">
              {Object.entries(viewRecord)
                .filter(([k]) => !['collectionId','collectionName','expand'].includes(k))
                .map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-2 py-2 border-b last:border-0">
                    <span className="text-sm font-medium text-muted-foreground">{k}</span>
                    <span className="col-span-2 text-sm break-all">{String(v ?? '—')}</span>
                  </div>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>ID: {editRecord?.id}</DialogDescription>
          </DialogHeader>
          {editRecord && (
            <div className="space-y-4 py-2">
              {Object.entries(editRecord)
                .filter(([k]) => !['id','collectionId','collectionName','created','updated','expand'].includes(k))
                .map(([k, v]) => (
                  <div key={k} className="space-y-1">
                    <Label htmlFor={k} className="text-sm font-medium">{k}</Label>
                    <Textarea
                      id={k}
                      value={String(v ?? '')}
                      onChange={e => setEditRecord(r => ({ ...r, [k]: e.target.value }))}
                      rows={1}
                      className="resize-none"
                    />
                  </div>
                ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete record <strong>{deleteId}</strong> from <strong>{activeCollection}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ─── File Manager Tab ─────────────────────────────────────────────────────────

const FileManagerTab = ({ currentUser }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [renameId, setRenameId] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const fileRef = useRef(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pb.collection('files').getFullList({ sort: '-created', $autoCancel: false });
      setFiles(res);
    } catch (e) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    let unsub;
    pb.collection('files').subscribe('*', fetchFiles, { $autoCancel: false })
      .then(fn => { unsub = fn; }).catch(() => {});
    return () => { unsub?.(); };
  }, [fetchFiles]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileRef.current) fileRef.current.value = '';
    if (file.size > 20 * 1024 * 1024) { toast.error('File exceeds 20MB limit'); return; }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const token = pb.authStore.token;
      const response = await apiServerClient.fetch('/files/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: ${response.status}`);
      }
      const data = await response.json();
      actionLog.add(`Uploaded file: ${data.filename}`, currentUser?.email);
      toast.success(`Uploaded: ${data.filename}`);
      fetchFiles();
    } catch (e) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRename = async () => {
    if (!renameName.trim()) return;
    try {
      await pb.collection('files').update(renameId, { filename: renameName.trim() }, { $autoCancel: false });
      actionLog.add(`Renamed file ${renameId} to "${renameName}"`, currentUser?.email);
      toast.success('File renamed');
      setRenameOpen(false);
      fetchFiles();
    } catch (e) {
      toast.error(`Rename failed: ${e.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      await pb.collection('files').delete(deleteId, { $autoCancel: false });
      actionLog.add(`Deleted file ${deleteId}`, currentUser?.email);
      toast.success('File deleted');
      setDeleteOpen(false);
      fetchFiles();
    } catch (e) {
      toast.error(`Delete failed: ${e.message}`);
    }
  };

  const filtered = files.filter(f =>
    !search || (f.filename || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" />Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input type="file" ref={fileRef} onChange={handleUpload} disabled={uploading} className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf" id="file-upload" />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading} variant="outline" className="gap-2">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4" />Choose File</>}
            </Button>
            <p className="text-sm text-muted-foreground">JPEG, PNG, GIF, WEBP, PDF — max 20MB</p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5" />Files
              <Badge variant="secondary">{files.length}</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} className="w-48" />
              <Button variant="outline" size="icon" onClick={fetchFiles} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <File className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">{search ? 'No files match your search' : 'No files uploaded yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(file => {
                const isImage = file.fileType?.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.file || '');
                return (
                  <div key={file.id} className="flex items-center gap-3 p-3 border rounded-xl bg-card hover:shadow-sm transition-all group">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                      {isImage ? (
                        <img src={pb.files.getURL(file, file.file, { thumb: '100x100' })} alt={file.filename} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.filename}</p>
                      <p className="text-xs text-muted-foreground">{fmt.bytes(file.fileSize)} • {new Date(file.created).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => { setRenameId(file.id); setRenameName(file.filename || ''); setRenameOpen(true); }}
                        title="Rename">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => { setDeleteId(file.id); setDeleteOpen(true); }}
                        title="Delete">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>New filename</Label>
            <Input value={renameName} onChange={e => setRenameName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRename()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button onClick={handleRename}><Save className="w-4 h-4 mr-2" />Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the file and cannot be undone. Any pages using this file will show a broken image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ─── Activity Log Tab ─────────────────────────────────────────────────────────

const ActivityTab = () => {
  const [entries, setEntries] = useState(actionLog.get());

  useEffect(() => {
    return actionLog.subscribe(setEntries);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Admin Activity Log</CardTitle>
        <CardDescription>All file and database actions performed by administrators in this session.</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No activity recorded yet in this session.</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {entries.map((e, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  <Activity className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{e.msg}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{e.user} • {fmt.date(e.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Content Management Tab ───────────────────────────────────────────────────

const CONTENT_SECTIONS = [
  {
    id: 'news_articles',
    label: 'News & Articles',
    icon: Newspaper,
    fields: [
      { key: 'title',          label: 'Title',            type: 'text',     required: true },
      { key: 'category',       label: 'Category',         type: 'select',   options: ['Community Story','News','Update','Announcement'] },
      { key: 'author',         label: 'Author',           type: 'text' },
      { key: 'excerpt',        label: 'Excerpt',          type: 'textarea' },
      { key: 'content',        label: 'Content',          type: 'textarea', required: true },
      { key: 'published_date', label: 'Published Date',   type: 'date' },
    ],
  },
  {
    id: 'events',
    label: 'Events',
    icon: Calendar,
    fields: [
      { key: 'title',               label: 'Title',             type: 'text',     required: true },
      { key: 'description',         label: 'Description',       type: 'textarea', required: true },
      { key: 'event_date',          label: 'Event Date',        type: 'date',     required: true },
      { key: 'event_time',          label: 'Event Time',        type: 'text',     placeholder: 'e.g. 10:00 AM' },
      { key: 'location',            label: 'Location',          type: 'text' },
      { key: 'registration_link',   label: 'Registration Link', type: 'text' },
    ],
  },
  {
    id: 'impact_stories',
    label: 'Impact Stories',
    icon: Award,
    fields: [
      { key: 'title',          label: 'Title',           type: 'text',     required: true },
      { key: 'story',          label: 'Story',           type: 'textarea', required: true },
      { key: 'beneficiary',    label: 'Beneficiary Name',type: 'text' },
      { key: 'location',       label: 'Location',        type: 'text' },
      { key: 'program',        label: 'Program',         type: 'text' },
      { key: 'published_date', label: 'Date',            type: 'date' },
    ],
  },
  {
    id: 'board_members',
    label: 'Board Members',
    icon: Users,
    fields: [
      { key: 'name',  label: 'Full Name', type: 'text',   required: true },
      { key: 'title', label: 'Title',     type: 'text',   required: true },
      { key: 'bio',   label: 'Bio',       type: 'textarea' },
      { key: 'order', label: 'Order',     type: 'text',   placeholder: 'e.g. 1' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    fields: [
      { key: 'title',    label: 'Title',    type: 'text',   required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Financial Report','Audited Statement','Policy','Registration'] },
      { key: 'year',     label: 'Year',     type: 'text',   placeholder: 'e.g. 2024' },
    ],
  },
];

const ContentTab = ({ currentUser }) => {
  const [activeSection, setActiveSection] = useState(CONTENT_SECTIONS[0].id);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null); // null = new record
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const section = CONTENT_SECTIONS.find(s => s.id === activeSection);

  const fetchRecords = useCallback(async (col = activeSection) => {
    setLoading(true);
    try {
      const res = await pb.collection(col).getFullList({
        sort: '-created', $autoCancel: false,
      });
      setRecords(res);
    } catch (e) {
      // Collection may not exist yet — treat as empty
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [activeSection]);

  useEffect(() => {
    fetchRecords(activeSection);
  }, [activeSection]);

  // Real-time subscription
  useEffect(() => {
    let unsub;
    pb.collection(activeSection).subscribe('*', () => fetchRecords(activeSection), { $autoCancel: false })
      .then(fn => { unsub = fn; }).catch(() => {});
    return () => { unsub?.(); };
  }, [activeSection, fetchRecords]);

  const openNew = () => {
    const empty = {};
    section.fields.forEach(f => { empty[f.key] = ''; });
    setFormData(empty);
    setEditingRecord(null);
    setFormOpen(true);
  };

  const openEdit = (rec) => {
    const data = {};
    section.fields.forEach(f => { data[f.key] = rec[f.key] ?? ''; });
    setFormData(data);
    setEditingRecord(rec);
    setFormOpen(true);
  };

  const handleSave = async () => {
    // Validate required fields
    const missing = section.fields.filter(f => f.required && !formData[f.key]?.trim());
    if (missing.length > 0) {
      toast.error(`Required: ${missing.map(f => f.label).join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      if (editingRecord) {
        await pb.collection(activeSection).update(editingRecord.id, formData, { $autoCancel: false });
        actionLog.add(`Updated ${section.label} record "${formData.title || formData.name || editingRecord.id}"`, currentUser?.email);
        toast.success('Record updated successfully');
      } else {
        await pb.collection(activeSection).create(formData, { $autoCancel: false });
        actionLog.add(`Created new ${section.label} record "${formData.title || formData.name || ''}"`, currentUser?.email);
        toast.success('Record created successfully');
      }
      setFormOpen(false);
      fetchRecords(activeSection);
    } catch (e) {
      toast.error(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await pb.collection(activeSection).delete(deleteId, { $autoCancel: false });
      actionLog.add(`Deleted ${section.label} record ${deleteId}`, currentUser?.email);
      toast.success('Record deleted');
      setDeleteOpen(false);
      fetchRecords(activeSection);
    } catch (e) {
      toast.error(`Delete failed: ${e.message}`);
    }
  };

  const getDisplayName = (rec) =>
    rec.title || rec.name || rec.id?.substring(0, 8) + '...';

  const getDisplaySub = (rec) => {
    if (rec.published_date || rec.event_date) {
      return new Date(rec.published_date || rec.event_date).toLocaleDateString();
    }
    if (rec.category) return rec.category;
    if (rec.title_role || rec.title) return rec.title;
    return new Date(rec.created).toLocaleDateString();
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0">
        <Card className="sticky top-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Website Content
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {CONTENT_SECTIONS.map(sec => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === sec.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{sec.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 space-y-4">
        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {section && <section.icon className="w-5 h-5 text-primary" />}
                  {section?.label}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {records.length} records — changes publish to website immediately
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => fetchRecords(activeSection)} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={openNew} className="gap-2">
                  <Plus className="w-4 h-4" />Add New
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : records.length === 0 ? (
              <div className="py-20 text-center">
                {section && <section.icon className="w-14 h-14 mx-auto mb-4 text-muted-foreground opacity-30" />}
                <p className="text-lg font-medium text-muted-foreground">No {section?.label} yet</p>
                <p className="text-sm text-muted-foreground mb-6">Click "Add New" to create the first one.</p>
                <Button onClick={openNew} className="gap-2">
                  <Plus className="w-4 h-4" />Create First {section?.label.replace(/s$/, '')}
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {records.map(rec => (
                  <div key={rec.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{getDisplayName(rec)}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {getDisplaySub(rec)}
                        {rec.category && <span className="ml-2"><Badge variant="outline" className="text-xs">{rec.category}</Badge></span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(rec)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => { setDeleteId(rec.id); setDeleteOpen(true); }} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? `Edit ${section?.label.replace(/s$/, '')}` : `New ${section?.label.replace(/s$/, '')}`}
            </DialogTitle>
            <DialogDescription>
              {editingRecord
                ? 'Update the fields below. Changes publish to the website immediately.'
                : 'Fill in the details below. The record will be visible on the website right away.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {section?.fields.map(field => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>

                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={formData[field.key] || ''}
                    onChange={e => setFormData(d => ({ ...d, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={field.key === 'content' || field.key === 'story' ? 8 : 3}
                    className="resize-y"
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={formData[field.key] || ''}
                    onValueChange={v => setFormData(d => ({ ...d, [field.key]: v }))}
                  >
                    <SelectTrigger id={field.key}>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={e => setFormData(d => ({ ...d, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />{editingRecord ? 'Save Changes' : 'Publish'}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {section?.label.replace(/s$/, '')}</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the record from the website. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet><title>Admin Dashboard — ICEEE TRUST</title></Helmet>

      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-background border-b shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">ICEEET Admin</p>
              <p className="text-xs text-muted-foreground mt-0.5">{currentUser?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex gap-1 text-green-700 border-green-500/30 bg-green-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <strong>{currentUser?.name || currentUser?.email}</strong>.
            Contact: <a href={`tel:${CONTACT_PHONE}`} className="text-primary hover:underline">{CONTACT_PHONE}</a>
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-5 gap-1 h-auto p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
              <BarChart3 className="w-4 h-4" /><span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 py-2">
              <Globe className="w-4 h-4" /><span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2 py-2">
              <Database className="w-4 h-4" /><span className="hidden sm:inline">Database</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2 py-2">
              <Folder className="w-4 h-4" /><span className="hidden sm:inline">Files</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2 py-2">
              <Activity className="w-4 h-4" /><span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="content">
            <ContentTab currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseTab currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="files">
            <FileManagerTab currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;