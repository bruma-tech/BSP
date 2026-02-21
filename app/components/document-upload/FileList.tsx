'use client';

import Icon from '@/app/components/ui/AppIcon';

interface FileItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'paused';
  error?: string;
}

interface FileListProps {
  files: FileItem[];
  onRemove: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}

export default function FileList({ files, onRemove, onPause, onResume }: FileListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">Uploaded Files ({files.length})</h3>
      
      <div className="space-y-3">
        {files.map((file) => (
          <div key={file.id} className="border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                file.status === 'completed' ? 'bg-success/10' :
                file.status === 'error' ? 'bg-error/10' :
                file.status === 'paused'? 'bg-warning/10' : 'bg-primary/10'
              }`}>
                <Icon 
                  name={
                    file.status === 'completed' ? 'CheckCircleIcon' :
                    file.status === 'error'? 'XCircleIcon' : 'DocumentIcon'
                  }
                  size={20}
                  className={
                    file.status === 'completed' ? 'text-success' :
                    file.status === 'error' ? 'text-error' :
                    file.status === 'paused'? 'text-warning' : 'text-primary'
                  }
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatFileSize(file.size)}
                      {file.status === 'uploading' && ` • ${file.progress}% uploaded`}
                      {file.status === 'completed' && ' • Upload complete'}
                      {file.status === 'paused' && ' • Paused'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {file.status === 'uploading' && (
                      <button
                        onClick={() => onPause(file.id)}
                        className="p-1.5 rounded hover:bg-muted transition-colors duration-200"
                        aria-label="Pause upload"
                      >
                        <Icon name="PauseIcon" size={16} className="text-muted-foreground" />
                      </button>
                    )}
                    {file.status === 'paused' && (
                      <button
                        onClick={() => onResume(file.id)}
                        className="p-1.5 rounded hover:bg-muted transition-colors duration-200"
                        aria-label="Resume upload"
                      >
                        <Icon name="PlayIcon" size={16} className="text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemove(file.id)}
                      className="p-1.5 rounded hover:bg-muted transition-colors duration-200"
                      aria-label="Remove file"
                    >
                      <Icon name="XMarkIcon" size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {file.status === 'uploading' && (
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                {file.status === 'error' && file.error && (
                  <p className="text-xs text-error mt-2">{file.error}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}