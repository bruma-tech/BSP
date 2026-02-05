'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './AppIcon';

interface BreadcrumbProps {
    customItems?: Array<{ label: string; href?: string }>;
}

const Breadcrumb = ({ customItems }: BreadcrumbProps) => {
    const pathname = usePathname();

    const routeLabels: Record<string, string> = {
        'tpa-dashboard': 'TPA Dashboard',
        'sponsor-management': 'Sponsor Management',
        'requirement-management': 'Requirement Management',
        'document-review': 'Document Review',
        'sponsor-dashboard': 'Sponsor Dashboard',
        'document-upload': 'Document Upload',
    };

    const generateBreadcrumbs = () => {
        if (customItems) {
            return customItems;
        }

        const paths = pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ label: 'Home', href: '/' }];

        paths.forEach((path, index) => {
            const href = '/' + paths.slice(0, index + 1).join('/');
            const label = routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
            breadcrumbs.push({ label, href });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    if (breadcrumbs.length <= 1) {
        return null;
    }

    return (
        <>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-md">
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <div key={crumb.href || crumb.label} className="flex items-center gap-2">
                            {index > 0 && (
                                <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
                            )}
                            {isLast ? (
                                <span className="font-medium text-foreground">{crumb.label}</span>
                            ) : (
                                <Link
                                    href={crumb.href || '#'}
                                    className="text-muted-foreground hover:text-foreground transition-colors duration-fast"
                                >
                                    {crumb.label}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </nav>
        </>
    );
};

export default Breadcrumb;