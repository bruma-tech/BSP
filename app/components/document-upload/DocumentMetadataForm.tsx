'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/AppIcon';


interface DocumentMetadataFormProps {
  onSubmit: (metadata: DocumentMetadata) => void;
  isSubmitting: boolean;
}

interface DocumentMetadata {
  version: string;
  description: string;
  certifications: string[];
  effectiveDate: string;
  expirationDate: string;
}

export default function DocumentMetadataForm({ onSubmit, isSubmitting }: DocumentMetadataFormProps) {
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    version: '',
    description: '',
    certifications: [],
    effectiveDate: '',
    expirationDate: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DocumentMetadata, string>>>({});

  const certificationOptions = [
    'HIPAA Compliant',
    'SOC 2 Certified',
    'ISO 27001 Certified',
    'GDPR Compliant',
    'PCI DSS Compliant',
  ];

  const handleCertificationToggle = (cert: string) => {
    setMetadata(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DocumentMetadata, string>> = {};

    if (!metadata.version.trim()) {
      newErrors.version = 'Version is required';
    }
    if (!metadata.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (metadata.certifications.length === 0) {
      newErrors.certifications = 'At least one certification is required';
    }
    if (!metadata.effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(metadata);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-base font-semibold text-foreground mb-6">Document Information</h3>

      <div className="space-y-6">
        <div>
          <label htmlFor="version" className="block text-sm font-medium text-foreground mb-2">
            Document Version <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="version"
            value={metadata.version}
            onChange={(e) => setMetadata(prev => ({ ...prev, version: e.target.value }))}
            placeholder="e.g., 1.0, 2.1"
            className={`w-full px-4 py-2.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
              errors.version ? 'border-error' : 'border-input'
            }`}
          />
          {errors.version && (
            <p className="text-xs text-error mt-1.5 flex items-center gap-1">
              <Icon name="ExclamationCircleIcon" size={14} />
              {errors.version}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Description <span className="text-error">*</span>
          </label>
          <textarea
            id="description"
            value={metadata.description}
            onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Provide a detailed description of the document"
            rows={4}
            className={`w-full px-4 py-2.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none ${
              errors.description ? 'border-error' : 'border-input'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-error mt-1.5 flex items-center gap-1">
              <Icon name="ExclamationCircleIcon" size={14} />
              {errors.description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Compliance Certifications <span className="text-error">*</span>
          </label>
          <div className="space-y-2">
            {certificationOptions.map((cert) => (
              <label
                key={cert}
                className="flex items-center gap-3 p-3 border border-input rounded-md hover:bg-muted/50 cursor-pointer transition-colors duration-200"
              >
                <input
                  type="checkbox"
                  checked={metadata.certifications.includes(cert)}
                  onChange={() => handleCertificationToggle(cert)}
                  className="w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm text-foreground">{cert}</span>
              </label>
            ))}
          </div>
          {errors.certifications && (
            <p className="text-xs text-error mt-1.5 flex items-center gap-1">
              <Icon name="ExclamationCircleIcon" size={14} />
              {errors.certifications}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="effectiveDate" className="block text-sm font-medium text-foreground mb-2">
              Effective Date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              id="effectiveDate"
              value={metadata.effectiveDate}
              onChange={(e) => setMetadata(prev => ({ ...prev, effectiveDate: e.target.value }))}
              className={`w-full px-4 py-2.5 bg-background border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                errors.effectiveDate ? 'border-error' : 'border-input'
              }`}
            />
            {errors.effectiveDate && (
              <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                <Icon name="ExclamationCircleIcon" size={14} />
                {errors.effectiveDate}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="expirationDate" className="block text-sm font-medium text-foreground mb-2">
              Expiration Date
            </label>
            <input
              type="date"
              id="expirationDate"
              value={metadata.expirationDate}
              onChange={(e) => setMetadata(prev => ({ ...prev, expirationDate: e.target.value }))}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Icon name="CloudArrowUpIcon" size={18} />
                Submit Documents
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}