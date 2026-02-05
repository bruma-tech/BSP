import type { Metadata } from 'next';
import DocumentReviewInteractive from '@/app/components/dashboard/tpa-dashboard/document-review/DocumentReviewInteractive';

export const metadata: Metadata = {
  title: 'Document Review - DocFlow Portal',
  description: 'Review and approve submitted documents from sponsors with detailed feedback capabilities and version comparison tools.'
};

export default function DocumentReviewPage() {
  const mockDocument = {
    id: 'doc-001',
    name: 'Q4_2024_Financial_Statement.pdf',
    type: 'pdf',
    url: "https://img.rocket.new/generatedImages/rocket_gen_img_1136fb591-1765366617744.png",
    pages: 12
  };

  const mockMetadata = {
    submittedDate: '12/14/2024 at 2:30 PM',
    sponsor: 'Acme Corporation',
    requirement: 'Q4 2024 Financial Statement',
    status: 'Pending Review',
    submissionCount: 2,
    fileSize: '2.4 MB',
    format: 'PDF'
  };

  const mockHistory = [
    {
      id: 'hist-003',
      date: '12/14/2024 2:30 PM',
      action: 'Document Resubmitted',
      reviewer: 'Sponsor User',
      comment: 'Updated financial figures based on previous feedback. Added missing Q4 revenue breakdown and corrected calculation errors in Section 3.',
      status: 'submitted' as const
    },
    {
      id: 'hist-002',
      date: '12/10/2024 11:15 AM',
      action: 'Document Rejected',
      reviewer: 'Sarah Johnson',
      comment: 'Missing Q4 revenue breakdown in Section 2. Please include detailed monthly figures and resubmit.',
      status: 'rejected' as const
    },
    {
      id: 'hist-001',
      date: '12/08/2024 9:00 AM',
      action: 'Initial Submission',
      reviewer: 'Sponsor User',
      comment: '',
      status: 'submitted' as const
    }];


  const mockComments = [
    {
      id: 'comment-001',
      author: 'Sarah Johnson',
      role: 'TPA Reviewer',
      timestamp: '12/10/2024 11:20 AM',
      content: 'Please ensure all financial figures are audited and include supporting documentation for major expenses listed in Section 4.',
      isRevisionRequest: true
    },
    {
      id: 'comment-002',
      author: 'Michael Chen',
      role: 'Compliance Officer',
      timestamp: '12/09/2024 3:45 PM',
      content: 'The document format looks good. Just need clarification on the revenue recognition method used.',
      isRevisionRequest: false
    }];


  const mockVersions = [
    {
      id: 'ver-002',
      version: 2,
      submittedDate: '12/14/2024 2:30 PM',
      status: 'Pending',
      changes: 'Added Q4 revenue breakdown, corrected calculation errors, included supporting documentation'
    },
    {
      id: 'ver-001',
      version: 1,
      submittedDate: '12/08/2024 9:00 AM',
      status: 'Rejected',
      changes: 'Initial submission of Q4 financial statement'
    }];


  return (
    <div className="min-h-screen bg-background">
      <main className="">
        <div className="max-w-3/4 mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="mt-4">
              <h1 className="text-3xl font-semibold text-foreground">Document Review</h1>
              <p className="text-muted-foreground mt-2">
                Review submitted documents and provide approval decisions with detailed feedback
              </p>
            </div>
          </div>

          <DocumentReviewInteractive
            initialDocument={mockDocument}
            initialMetadata={mockMetadata}
            initialHistory={mockHistory}
            initialComments={mockComments}
            initialVersions={mockVersions} />
        </div>
      </main>
    </div>);

}