'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/AppIcon';
import AppImage from '@/app/components/ui/AppImage';

interface DocumentPreviewProps {
  fileName: string;
  fileType: string;
  previewUrl: string;
  totalPages?: number;
}

export default function DocumentPreview({ fileName, fileType, previewUrl, totalPages = 1 }: DocumentPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Icon name="DocumentIcon" size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {fileName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 50}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Zoom out"
          >
            <Icon name="MinusIcon" size={16} className="text-foreground" />
          </button>
          <span className="text-xs font-medium text-foreground min-w-[3rem] text-center">
            {zoomLevel}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 200}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Zoom in"
          >
            <Icon name="PlusIcon" size={16} className="text-foreground" />
          </button>
        </div>
      </div>

      <div className="p-6 bg-muted/20 min-h-[400px] flex items-center justify-center overflow-auto">
        <div
          className="bg-white shadow-lg"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transition: 'transform 0.2s ease',
          }}
        >
          {fileType.includes('pdf') ? (
            <div className="w-[600px] h-[800px] flex items-center justify-center bg-white border border-border">
              <div className="text-center">
                <Icon name="DocumentTextIcon" size={64} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-foreground font-medium mb-1">PDF Preview</p>
                <p className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</p>
              </div>
            </div>
          ) : (
            <AppImage
              src={previewUrl}
              alt={`Preview of ${fileName} document showing page ${currentPage}`}
              className="max-w-[600px] max-h-[800px] object-contain"
            />
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/30">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Icon name="ChevronLeftIcon" size={16} />
            Previous
          </button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Next
            <Icon name="ChevronRightIcon" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}