'use client';

import { useRouter } from 'next/navigation';
import { DocumentReviewLayout, type DocumentReviewData } from '@/app/components/dashboard/document-review';

interface SponsorDocumentReviewProps {
  data: DocumentReviewData;
}

const SponsorDocumentReviewInteractive = ({ data }: SponsorDocumentReviewProps) => {
  const router = useRouter();

  const handleAddComment = () => {
    router.refresh();
  };

  return (
    <DocumentReviewLayout
      data={data}
      showRevisionCheckbox={false}
      onAddComment={handleAddComment}
    />
  );
};

export default SponsorDocumentReviewInteractive;
