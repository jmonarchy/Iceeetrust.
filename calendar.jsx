import React, { useState, useEffect, useRef } from 'react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FileUploadManager = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await pb.collection('files').getList(1, 50, { sort: '-created', $autoCancel: false });
      setFiles(res.items);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size exceeds 20MB limit");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);

      const token = pb.authStore.token;
      if (!token) {
        toast.error("Authentication required. Please log in.");
        return;
      }

      const response = await apiServerClient.fetch('/files/upload', {
        method: 'POST',
        // BUG FIX: Do NOT set Content-Type here.
        // When sending FormData the browser must set it automatically so it
        // includes the multipart boundary — e.g. "multipart/form-data; boundary=----XYZ".
        // A manually set Content-Type header strips the boundary and the server
        // receives an empty body, causing the "No file provided" error.
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Authentication expired. Please log in again.");
          pb.authStore.clear();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      toast.success(`File ${data.filename} uploaded successfully`);
      fetchFiles(); // Refresh list to get the new file
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, filename) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      await pb.collection('files').delete(id, { $autoCancel: false });
      toast.success("File deleted successfully");
      setFiles(files.filter(f => f.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete file");
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Upload New File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              disabled={uploading}
              className="max-w-md cursor-pointer"
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            />
            {uploading && (
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Accepted formats: JPEG, PNG, GIF, WEBP, PDF. Max size: 20MB.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex justify-between items-center">
            <span>Uploaded Files</span>
            <Badge variant="secondary">{files.length} files</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No files uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(file => {
                const isImage = file.fileType?.includes('image') || file.file.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                return (
                  <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                    <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                      {isImage ? (
                        <img
                          src={pb.files.getURL(file, file.file, { thumb: '100x100' })}
                          alt={file.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium truncate" title={file.filename}>{file.filename}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{formatSize(file.fileSize)}</span>
                        <span>•</span>
                        <span>{new Date(file.created).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file.id, file.filename)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadManager;