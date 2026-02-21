'use client';

import { useState, useRef } from 'react';
import Icon from '@/app/components/ui/AppIcon';

interface UploadZoneProps {
  onFileSelect: (files: File[]) => void;
  acceptedFormats: string[];
  maxSize: number;
}

export default function UploadZone({ onFileSelect, acceptedFormats, maxSize }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    validateAndProcessFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      validateAndProcessFiles(files);
    }
  };

  const validateAndProcessFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidFormat = acceptedFormats.includes(extension);
      const isValidSize = file.size <= maxSize;
      return isValidFormat && isValidSize;
    });

    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
        isDragging
          ? 'border-primary bg-primary/5' :'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${
          isDragging ? 'bg-primary/10' : 'bg-muted'
        }`}>
          <Icon 
            name="CloudArrowUpIcon" 
            size={32} 
            className={isDragging ? 'text-primary' : 'text-muted-foreground'} 
          />
        </div>

        <div>
          <p className="text-base font-medium text-foreground mb-1">
            Drag and drop your files here
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse from your computer
          </p>
          <button
            onClick={handleBrowseClick}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
          >
            Browse Files
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-border w-full max-w-md">
          <p className="text-xs text-muted-foreground mb-2">Accepted formats:</p>
          <p className="text-xs font-medium text-foreground">
            {acceptedFormats.join(', ')}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Maximum file size: {(maxSize / (1024 * 1024)).toFixed(0)} MB
          </p>
        </div>
      </div>
    </div>
  );
}