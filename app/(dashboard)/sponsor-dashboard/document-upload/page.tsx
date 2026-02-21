import type { Metadata } from 'next';
import DocumentUploadInteractive from '@/app/components/document-upload/DocumentUploadInteractive';

export const metadata: Metadata = {
  title: 'Document Upload - DocFlow Portal',
  description: 'Submit required documents with validation and progress tracking for requirement fulfillment in the DocFlow Portal.',
};

export default function DocumentUploadPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">Document Upload</h1>
            <p className="text-muted-foreground">
              Submit your required documents with proper validation and metadata
            </p>
          </div>
        <DocumentUploadInteractive />
      </div>
    </div>
  );
}