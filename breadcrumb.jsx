import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

const FileGallery = ({ filename, fallback, alt, className }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        // If a specific filename is requested, filter by it directly in the query
        // instead of fetching all 50 and filtering client-side.
        // This avoids 404s from stale record IDs and works regardless of auth state.
        if (filename) {
          const res = await pb.collection('files').getList(1, 1, {
            filter: `filename = "${filename}"`,
            $autoCancel: false,
          });
          setFiles(res.items);
        } else {
          const res = await pb.collection('files').getList(1, 50, {
            sort: '-created',
            $autoCancel: false,
          });
          setFiles(res.items);
        }
      } catch (err) {
        console.warn('Could not fetch files:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [filename]);

  if (loading) {
    return <Skeleton className={className || 'w-full min-h-[200px]'} />;
  }

  // Render a specific named file
  if (filename) {
    const file = files[0]; // already filtered by filename above
    if (!file) {
      return fallback || (
        <div className="w-full h-full min-h-[200px] bg-muted flex items-center justify-center text-muted-foreground text-sm rounded-md border border-dashed">
          File "{filename}" not found
        </div>
      );
    }

    // PDF: render in an iframe with a download link
    if (file.fileType === 'application/pdf' || file.file?.match(/\.pdf$/i)) {
      const url = pb.files.getURL(file, file.file);
      return (
        <div className="w-full">
          <iframe
            src={url}
            title={alt || file.filename}
            className="w-full"
            style={{ height: '480px', border: 'none' }}
          />
          <a
            href={url}
            download={file.filename}
            className="block text-center text-sm text-primary hover:underline mt-3"
          >
            Download PDF
          </a>
        </div>
      );
    }

    // Image
    return (
      <img
        src={pb.files.getURL(file, file.file)}
        alt={alt || file.filename}
        className={className}
      />
    );
  }

  // Render a grid of all files
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map(f => {
        const isImage = f.fileType?.includes('image') || f.file?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        return (
          <div key={f.id} className="border border-border rounded-lg p-3 flex flex-col items-center bg-card">
            {isImage ? (
              <img
                src={pb.files.getURL(f, f.file, { thumb: '200x200' })}
                alt={f.filename}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
            ) : (
              <div className="w-full h-32 bg-muted rounded-md mb-3 flex items-center justify-center">
                <FileText className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <span className="text-sm text-center truncate w-full text-muted-foreground" title={f.filename}>
              {f.filename}
            </span>
          </div>
        );
      })}
      {files.length === 0 && (
        <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
          No files available in the gallery.
        </div>
      )}
    </div>
  );
};

export default FileGallery;