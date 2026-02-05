'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/AppIcon';

interface Sponsor {
    id: string;
    name: string;
    email: string;
}

interface CreateRequirementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RequirementFormData) => void;
    sponsors: Sponsor[];
}

export interface RequirementFormData {
    title: string;
    description: string;
    type: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    assignedSponsors: string[];
    documentSpecs: string;
    approvalWorkflow: string;
    notifyOnSubmission: boolean;
    allowResubmission: boolean;
}

const CreateRequirementModal = ({ isOpen, onClose, onSubmit, sponsors }: CreateRequirementModalProps) => {
    const [formData, setFormData] = useState<RequirementFormData>({
        title: '',
        description: '',
        type: 'Financial Report',
        priority: 'medium',
        dueDate: '',
        assignedSponsors: [],
        documentSpecs: '',
        approvalWorkflow: 'single-reviewer',
        notifyOnSubmission: true,
        allowResubmission: true,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof RequirementFormData, string>>>({});

    const requirementTypes = [
        'Financial Report',
        'Compliance Document',
        'Plan Document',
        'Audit Report',
        'Tax Filing',
        'Legal Document',
        'Other',
    ];

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof RequirementFormData, string>> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!formData.dueDate) {
            newErrors.dueDate = 'Due date is required';
        }
        if (formData.assignedSponsors.length === 0) {
            newErrors.assignedSponsors = 'At least one sponsor must be selected';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
            setFormData({
                title: '',
                description: '',
                type: 'Financial Report',
                priority: 'medium',
                dueDate: '',
                assignedSponsors: [],
                documentSpecs: '',
                approvalWorkflow: 'single-reviewer',
                notifyOnSubmission: true,
                allowResubmission: true,
            });
            setErrors({});
        }
    };

    const toggleSponsor = (sponsorId: string) => {
        setFormData((prev) => ({
            ...prev,
            assignedSponsors: prev.assignedSponsors.includes(sponsorId)
                ? prev.assignedSponsors.filter((id) => id !== sponsorId)
                : [...prev.assignedSponsors, sponsorId],
        }));
    };

    const selectAllSponsors = () => {
        setFormData((prev) => ({
            ...prev,
            assignedSponsors: sponsors.map((s) => s.id),
        }));
    };

    const deselectAllSponsors = () => {
        setFormData((prev) => ({
            ...prev,
            assignedSponsors: [],
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex mt-10 items-center justify-center p-4 bg-black/50">
            <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">Create New Requirement</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={24} className="text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                                Requirement Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={`w-full px-4 py-2 rounded-md border ${errors.title ? 'border-error' : 'border-border'
                                    } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                                placeholder="Enter requirement title"
                            />
                            {errors.title && <p className="text-sm text-error mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className={`w-full px-4 py-2 rounded-md border ${errors.description ? 'border-error' : 'border-border'
                                    } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none`}
                                placeholder="Describe the requirement in detail"
                            />
                            {errors.description && <p className="text-sm text-error mt-1">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                                    Type
                                </label>
                                <select
                                    id="type"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {requirementTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                                    className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-foreground mb-2">
                                    Due Date *
                                </label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-md border ${errors.dueDate ? 'border-error' : 'border-border'
                                        } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                                />
                                {errors.dueDate && <p className="text-sm text-error mt-1">{errors.dueDate}</p>}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-foreground">
                                    Assign to Sponsors * ({formData.assignedSponsors.length} selected)
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={selectAllSponsors}
                                        className="text-xs text-primary hover:text-primary/80 transition-colors duration-200"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-xs text-muted-foreground">|</span>
                                    <button
                                        type="button"
                                        onClick={deselectAllSponsors}
                                        className="text-xs text-primary hover:text-primary/80 transition-colors duration-200"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            </div>
                            <div className={`border ${errors.assignedSponsors ? 'border-error' : 'border-border'} rounded-md p-4 max-h-48 overflow-y-auto bg-background`}>
                                {sponsors.map((sponsor) => (
                                    <label
                                        key={sponsor.id}
                                        className="flex items-center gap-3 py-2 hover:bg-muted px-2 rounded-md cursor-pointer transition-colors duration-200"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.assignedSponsors.includes(sponsor.id)}
                                            onChange={() => toggleSponsor(sponsor.id)}
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{sponsor.name}</p>
                                            <p className="text-xs text-muted-foreground">{sponsor.email}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.assignedSponsors && <p className="text-sm text-error mt-1">{errors.assignedSponsors}</p>}
                        </div>

                        <div>
                            <label htmlFor="documentSpecs" className="block text-sm font-medium text-foreground mb-2">
                                Document Specifications
                            </label>
                            <textarea
                                id="documentSpecs"
                                value={formData.documentSpecs}
                                onChange={(e) => setFormData({ ...formData, documentSpecs: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Specify document format, size limits, naming conventions, etc."
                            />
                        </div>

                        <div>
                            <label htmlFor="approvalWorkflow" className="block text-sm font-medium text-foreground mb-2">
                                Approval Workflow
                            </label>
                            <select
                                id="approvalWorkflow"
                                value={formData.approvalWorkflow}
                                onChange={(e) => setFormData({ ...formData, approvalWorkflow: e.target.value })}
                                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="single-reviewer">Single Reviewer</option>
                                <option value="multi-reviewer">Multiple Reviewers</option>
                                <option value="sequential">Sequential Approval</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.notifyOnSubmission}
                                    onChange={(e) => setFormData({ ...formData, notifyOnSubmission: e.target.checked })}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-sm text-foreground">Notify me when documents are submitted</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.allowResubmission}
                                    onChange={(e) => setFormData({ ...formData, allowResubmission: e.target.checked })}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-sm text-foreground">Allow document resubmission after rejection</span>
                            </label>
                        </div>
                    </div>
                </form>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-md border border-border text-foreground hover:bg-muted transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
                    >
                        Create Requirement
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateRequirementModal;