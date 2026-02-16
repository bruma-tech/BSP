'use client';

import { useState, useEffect } from 'react';
import Icon from '@/app/components/ui/AppIcon';
import { requirementSchema } from "@/lib/validation/requirementSchema";
import { ZodError } from "zod";
import { useEscape } from "@/hooks/useEscape";


useEscape({ isOpen, onClose });

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
    const [today, setToday] = useState("");


    useEffect(() => {
        const localToday = new Date();
        localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
        setToday(localToday.toISOString().split("T")[0]);
    }, []);

    const requirementTypes = [
        'Financial Report',
        'Compliance Document',
        'Plan Document',
        'Audit Report',
        'Tax Filing',
        'Legal Document',
        'Other',
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Requirement Submit Clicked");

        const result = requirementSchema.safeParse(formData);

        if (!result.success) {
            console.log("Requirement Validation Failed ❌");

            const fieldErrors: Partial<Record<keyof RequirementFormData, string>> = {};
            const zodError = result.error as ZodError;

            zodError.issues.forEach((issue) => {
                const field = issue.path[0] as keyof RequirementFormData;
                console.log(`Field: ${String(field)} | Error: ${issue.message}`);
                fieldErrors[field] = issue.message;
            });

            setErrors(fieldErrors);
            return;
        }

        console.log("Requirement Validation Passed ✅");
        console.log(JSON.stringify(result.data, null, 2));

        setErrors({});
        onSubmit(result.data);
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

                {}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">Create New Requirement</h2>
                    <button onClick={onClose} className="p-2 rounded-md hover:bg-muted">
                        <Icon name="XMarkIcon" size={24} className="text-muted-foreground" />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-6">

                        {/* TITLE */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Requirement Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-md ${errors.title ? 'border-error' : 'border-border'}`}
                            />
                            {errors.title && <p className="text-error text-sm mt-1">{errors.title}</p>}
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Description *</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-md ${errors.description ? 'border-error' : 'border-border'}`}
                            />
                            {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* TYPE + PRIORITY + DATE */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="px-4 py-2 border rounded-md"
                            >
                                {requirementTypes.map((type) => (
                                    <option key={type}>{type}</option>
                                ))}
                            </select>

                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                className="px-4 py-2 border rounded-md"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>

                            <input
                                type="date"
                                min={today}
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className={`px-4 py-2 border rounded-md ${errors.dueDate ? 'border-error' : 'border-border'}`}
                            />
                        </div>

                        {}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">
                                    Assign to Sponsors * ({formData.assignedSponsors.length} selected)
                                </span>

                                <div className="flex gap-2 text-xs">
                                    <button type="button" onClick={selectAllSponsors}>Select All</button>
                                    <button type="button" onClick={deselectAllSponsors}>Clear</button>
                                </div>
                            </div>

                            <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                                {sponsors.map((sponsor) => (
                                    <label key={sponsor.id} className="flex items-center gap-3 py-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.assignedSponsors.includes(sponsor.id)}
                                            onChange={() => toggleSponsor(sponsor.id)}
                                        />
                                        <div>
                                            <p className="text-sm font-medium">{sponsor.name}</p>
                                            <p className="text-xs text-muted-foreground">{sponsor.email}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.assignedSponsors && <p className="text-error text-sm mt-1">{errors.assignedSponsors}</p>}
                        </div>

                    </div>
                </form>

                {}
                <div className="flex justify-end gap-3 px-6 py-4 border-t">
                    <button onClick={onClose} className="px-6 py-2 border rounded-md">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-primary text-white rounded-md">
                        Create Requirement
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateRequirementModal;
