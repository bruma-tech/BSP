'use client';

import { useState, useEffect } from 'react';
import Icon from '@/app/components/ui/AppIcon';
interface AddSponsorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (sponsor: NewSponsor) => void;
}

interface NewSponsor {
    name: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    status: 'active' | 'pending';
}

export default function AddSponsorModal({ isOpen, onClose, onAdd }: AddSponsorModalProps) {
    const [formData, setFormData] = useState<NewSponsor>({
        name: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        status: 'pending'
    });

    const [errors, setErrors] = useState<Partial<Record<keyof NewSponsor, string>>>({});

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof NewSponsor, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Sponsor name is required';
        }

        if (!formData.contactEmail.trim()) {
            newErrors.contactEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
            newErrors.contactEmail = 'Invalid email format';
        }

        if (!formData.contactPhone.trim()) {
            newErrors.contactPhone = 'Phone number is required';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onAdd(formData);
            setFormData({
                name: '',
                contactEmail: '',
                contactPhone: '',
                address: '',
                status: 'pending'
            });
            setErrors({});
            onClose();
        }
    };

    const handleChange = (field: keyof NewSponsor, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-card rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">Add New Sponsor</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-muted transition-colors duration-fast"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={24} className="text-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                                Sponsor Name <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={`w-full px-4 py-2 rounded-md border ${errors.name ? 'border-error' : 'border-border'
                                    } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                                placeholder="Enter sponsor name"
                            />
                            {errors.name && <p className="text-sm text-error mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-foreground mb-1">
                                Contact Email <span className="text-error">*</span>
                            </label>
                            <input
                                type="email"
                                id="contactEmail"
                                value={formData.contactEmail}
                                onChange={(e) => handleChange('contactEmail', e.target.value)}
                                className={`w-full px-4 py-2 rounded-md border ${errors.contactEmail ? 'border-error' : 'border-border'
                                    } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                                placeholder="sponsor@example.com"
                            />
                            {errors.contactEmail && <p className="text-sm text-error mt-1">{errors.contactEmail}</p>}
                        </div>

                        <div>
                            <label htmlFor="contactPhone" className="block text-sm font-medium text-foreground mb-1">
                                Contact Phone <span className="text-error">*</span>
                            </label>
                            <input
                                type="tel"
                                id="contactPhone"
                                value={formData.contactPhone}
                                onChange={(e) => handleChange('contactPhone', e.target.value)}
                                className={`w-full px-4 py-2 rounded-md border ${errors.contactPhone ? 'border-error' : 'border-border'
                                    } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                                placeholder="(555) 123-4567"
                            />
                            {errors.contactPhone && <p className="text-sm text-error mt-1">{errors.contactPhone}</p>}
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1">
                                Address <span className="text-error">*</span>
                            </label>
                            <textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2 rounded-md border ${errors.address ? 'border-error' : 'border-border'
                                    } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none`}
                                placeholder="Enter full address"
                            />
                            {errors.address && <p className="text-sm text-error mt-1">{errors.address}</p>}
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1">
                                Initial Status
                            </label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value as 'active' | 'pending')}
                                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                            </select>
                        </div>
                    </div>
                </form>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-border text-foreground hover:bg-muted transition-colors duration-fast"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-fast"
                    >
                        Add Sponsor
                    </button>
                </div>
            </div>
        </div>
    );
}