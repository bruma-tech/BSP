'use client';

import { useState, useEffect } from 'react';
import RequirementDetails from './RequirementDetails';
import UploadZone from './UploadZone';
import FileList from './FileList';
import DocumentMetadataForm from './DocumentMetadataForm';
import SubmissionHistory from './SubmissionHistory';
import DocumentPreview from './DocumentPreview';
import Icon from '@/app/components/ui/AppIcon';

interface FileItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'paused';
  error?: string;
}

interface DocumentMetadata {
  version: string;
  description: string;
  certifications: string[];
  effectiveDate: string;
  expirationDate: string;
}

export default function DocumentUploadInteractive() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const requirement = {
    id: 'REQ-2024-001',
    title: 'Annual Financial Statement',
    type: 'Financial Document',
    description: 'Submit your organization\'s audited annual financial statement for the fiscal year 2024. The document must include balance sheet, income statement, cash flow statement, and notes to financial statements.',
    deadline: '12/31/2024',
    status: 'Pending',
    formatRequirements: [
      'PDF format only',
      'Maximum file size: 25 MB',
      'Must be digitally signed',
      'All pages must be legible',
      'Color or black & white acceptable',
    ],
    maxFileSize: '25 MB',
    requiredFields: [
      'Document version number',
      'Effective date',
      'Compliance certifications',
      'Document description',
      'Authorized signatory',
    ],
  };

  const submissionHistory = [
    {
      id: 'SUB-001',
      submittedDate: '11/15/2024',
      version: '1.0',
      status: 'Rejected' as const,
      reviewedBy: 'John Smith, TPA Administrator',
      reviewDate: '11/18/2024',
      feedback: 'The submitted document is missing the cash flow statement section. Please resubmit with complete financial statements including all required sections.',
      resubmissionRequired: true,
    },
    {
      id: 'SUB-002',
      submittedDate: '10/20/2024',
      version: '0.9',
      status: 'In Review' as const,
      reviewedBy: 'Sarah Johnson, Compliance Officer',
      reviewDate: '10/22/2024',
      feedback: 'Document is under review. Expected completion by 10/30/2024.',
      resubmissionRequired: false,
    },
  ];

  const acceptedFormats = ['.pdf', '.doc', '.docx'];
  const maxFileSize = 25 * 1024 * 1024;

  const handleFileSelect = (selectedFiles: File[]) => {
    if (!isHydrated) return;

    const newFiles: FileItem[] = selectedFiles.map((file) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      simulateUpload(file.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    if (!isHydrated) return;

    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId && file.status === 'uploading') {
            const newProgress = Math.min(file.progress + 10, 100);
            return {
              ...file,
              progress: newProgress,
              status: newProgress === 100 ? 'completed' : 'uploading',
            };
          }
          return file;
        })
      );
    }, 500);

    setTimeout(() => clearInterval(interval), 5500);
  };

  const handleRemoveFile = (fileId: string) => {
    if (!isHydrated) return;
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handlePauseFile = (fileId: string) => {
    if (!isHydrated) return;
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, status: 'paused' as const } : file
      )
    );
  };

  const handleResumeFile = (fileId: string) => {
    if (!isHydrated) return;
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, status: 'uploading' as const } : file
      )
    );
    simulateUpload(fileId);
  };

  const handleMetadataSubmit = (metadata: DocumentMetadata) => {
    if (!isHydrated) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    }, 2000);
  };

  const handlePreviewFile = (file: FileItem) => {
    if (!isHydrated) return;
    setSelectedFile(file);
    setShowPreview(true);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <RequirementDetails requirement={requirement} />
       {/*TODO: This calc is manually set, make this equal to Document Metadata width  */}
      <div className="grid grid-cols-[calc(320px+35.5rem)_1fr] gap-6 mt-6">
        <div className="space-y-6">
          <UploadZone
            onFileSelect={handleFileSelect}
            acceptedFormats={acceptedFormats}
            maxSize={maxFileSize}
          />

          <FileList
            files={files}
            onRemove={handleRemoveFile}
            onPause={handlePauseFile}
            onResume={handleResumeFile}
          />

          {files.some((f) => f.status === 'completed') && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Uploaded Files</h3>
              <div className="space-y-2">
                {files
                  .filter((f) => f.status === 'completed')
                  .map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handlePreviewFile(file)}
                      className="w-full flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="DocumentIcon" size={20} className="text-primary" />
                        <span className="text-sm text-foreground">{file.name}</span>
                      </div>
                      <Icon name="EyeIcon" size={18} className="text-muted-foreground" />
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <SubmissionHistory submissions={submissionHistory} />
        </div>
      </div>

      <div className="mt-6 md:pr-[calc(320px+1.5rem)]">
        <DocumentMetadataForm onSubmit={handleMetadataSubmit} isSubmitting={isSubmitting} />
      </div>

      {showPreview && selectedFile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Document Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1.5 rounded hover:bg-muted transition-colors duration-200"
              >
                <Icon name="XMarkIcon" size={20} className="text-foreground" />
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-60px)]">
              <DocumentPreview
                fileName={selectedFile.name}
                fileType="application/pdf"
                previewUrl="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg"
                totalPages={5}
              />
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircleIcon" size={32} className="text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Submission Successful!</h3>
            <p className="text-sm text-muted-foreground">
              Your documents have been submitted successfully and are now under review.
            </p>
          </div>
        </div>
      )}
    </>
  );
}