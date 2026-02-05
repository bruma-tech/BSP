'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/AppIcon';
import AppImage from '@/app/components/ui/AppImage'

interface DocumentViewerProps {
    document: {
        id: string;
        name: string;
        type: string;
        url: string;
        pages: number;
    };
}

const DocumentViewer = ({ document }: DocumentViewerProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(100);

    const handleZoomIn = () => {
        if (zoom < 200) setZoom(zoom + 25);
    };

    const handleZoomOut = () => {
        if (zoom > 50) setZoom(zoom - 25);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < document.pages) setCurrentPage(currentPage + 1);
    };

    const handleDownload = () => {
        console.log('Downloading document:', document.name);
    };

    return (
        <div className="flex flex-col h-[45%] bg-muted rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <div className="flex items-center gap-3">
                    <Icon name="DocumentTextIcon" size={20} className="text-primary" />
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">{document.name}</h3>
                        <p className="text-xs text-muted-foreground">{document.type.toUpperCase()}</p>
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-fast"
                >
                    <Icon name="ArrowDownTrayIcon" size={18} />
                    Download
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                <div
                    className="bg-white shadow-lg rounded-lg overflow-hidden"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                >
                    <AppImage
                        src={document.url}
                        alt={`Page ${currentPage} of ${document.name} document showing compliance information`}
                        className="w-full h-auto"
                        width={800}
                        height={1000}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md hover:bg-muted transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                    >
                        <Icon name="ChevronLeftIcon" size={20} className="text-foreground" />
                    </button>
                    <span className="text-sm text-foreground font-medium px-3">
                        Page {currentPage} of {document.pages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === document.pages}
                        className="p-2 rounded-md hover:bg-muted transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next page"
                    >
                        <Icon name="ChevronRightIcon" size={20} className="text-foreground" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoom === 50}
                        className="p-2 rounded-md hover:bg-muted transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Zoom out"
                    >
                        <Icon name="MinusIcon" size={20} className="text-foreground" />
                    </button>
                    <span className="text-sm text-foreground font-medium px-3 min-w-[60px] text-center">
                        {zoom}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        disabled={zoom === 200}
                        className="p-2 rounded-md hover:bg-muted transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Zoom in"
                    >
                        <Icon name="PlusIcon" size={20} className="text-foreground" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;