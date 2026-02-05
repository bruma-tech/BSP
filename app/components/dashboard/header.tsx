'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../ui/AppIcon';
import { wix } from '@/app/components/ui/fonts';

interface HeaderProps {
    userRole?: 'tpa' | 'sponsor';
    userName?: string;
    notificationCount?: number;
}


const Header = ({
    userRole = 'tpa',
    userName = 'User',
    notificationCount = 0
}: HeaderProps) => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const tpaNavigation = [
        { name: 'Dashboard', href: '/tpa-dashboard', icon: 'ChartBarIcon' },
        { name: 'Sponsors', href: '/tpa-dashboard/sponsor-management', icon: 'BuildingOfficeIcon' },
        { name: 'Requirements', href: '/tpa-dashboard/requirement-management', icon: 'DocumentTextIcon' },
        { name: 'Documents', href: '/tpa-dashboard/document-review', icon: 'FolderOpenIcon' },
    ];

    const sponsorNavigation = [
        { name: 'Dashboard', href: '/sponsor-dashboard', icon: 'ChartBarIcon' },
        { name: 'Documents', href: '/document-upload', icon: 'ArrowUpTrayIcon' },
    ];

    const navigation = userRole === 'tpa' ? tpaNavigation : sponsorNavigation;

    const quickActions = userRole === 'tpa'
        ? [
            { name: 'Create Requirement', icon: 'PlusCircleIcon', action: () => console.log('Create Requirement') },
            { name: 'Add Sponsor', icon: 'UserPlusIcon', action: () => console.log('Add Sponsor') },
        ]
        : [
            { name: 'Upload Document', icon: 'ArrowUpTrayIcon', action: () => console.log('Upload Document') },
        ];

    const notifications = [
        { id: 1, title: 'Document Approved', message: 'Compliance report has been approved', time: '5 min ago', type: 'success' },
        { id: 2, title: 'Requirement Due Soon', message: 'Q4 Financial Statement due in 2 days', time: '1 hour ago', type: 'warning' },
        { id: 3, title: 'New Document Submitted', message: 'Sponsor ABC submitted annual report', time: '3 hours ago', type: 'info' },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <header className="fixed top-0 left-0 right-0 z-100 bg-[#fcf9f6]">
            <div className="flex items-center shadow-lg justify-between h-16 px-6 border-b">
                <div className="flex items-center gap-8">
                    <Link href={userRole === 'tpa' ? '/tpa-dashboard' : '/sponsor-dashboard'} className="flex items-center gap-2">
                        <span className={`${wix.className} antialiased text-2xl font-bold text-[#02f4fa]`}>Bruma</span>
                    </Link>

                    <nav className="md:flex items-center gap-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-fast ${isActive(item.href)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/7.5'
                                    }`}
                            >
                                <Icon name={item.icon as any} size={18} />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <div className="md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                        <div className={`w-2 h-2 rounded-full ${userRole === 'tpa' ? 'bg-primary' : 'bg-accent'}`} />
                        <span className="text-xs font-medium text-foreground capitalize">{userRole}</span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                            className="p-2 rounded-md hover:bg-muted transition-colors duration-fast"
                            aria-label="Quick actions"
                        >
                            <Icon name="PlusIcon" size={20} className="text-foreground" />
                        </button>
                        {isQuickActionOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-modal py-2 z-[200]">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.name}
                                        onClick={() => {
                                            action.action();
                                            setIsQuickActionOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors duration-fast"
                                    >
                                        <Icon name={action.icon as any} size={18} />
                                        {action.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative p-2 rounded-md hover:bg-muted transition-colors duration-fast"
                            aria-label="Notifications"
                        >
                            <Icon name="BellIcon" size={20} className="text-foreground" />
                            {notificationCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-error text-error-foreground text-xs font-medium rounded-full flex items-center justify-center">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </button>
                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-modal z-[200]">
                                <div className="px-4 py-3 border-b border-border">
                                    <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className="px-4 py-3 border-b border-border hover:bg-muted transition-colors duration-fast cursor-pointer"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 ${notification.type === 'success' ? 'bg-success' :
                                                    notification.type === 'warning' ? 'bg-warning' : 'bg-primary'
                                                    }`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground">{notification.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-3 border-t border-border">
                                    <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-fast">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors duration-fast"
                            aria-label="User menu"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <Icon name="ChevronDownIcon" size={16} className="text-muted-foreground hidden md:block" />
                        </button>
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-modal py-2 z-[200]">
                                <div className="px-4 py-2 border-b border-border">
                                    <p className="text-sm font-medium text-foreground">{userName}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{userRole} User</p>
                                </div>
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors duration-fast">
                                    <Icon name="UserCircleIcon" size={18} />
                                    Profile
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors duration-fast">
                                    <Icon name="Cog6ToothIcon" size={18} />
                                    Settings
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors duration-fast">
                                    <Icon name="QuestionMarkCircleIcon" size={18} />
                                    Help
                                </button>
                                <div className="border-t border-border mt-2 pt-2">
                                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-muted transition-colors duration-fast">
                                        <Icon name="ArrowRightOnRectangleIcon" size={18} />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-md hover:bg-muted transition-colors duration-fast"
                        aria-label="Toggle menu"
                    >
                        <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} className="text-foreground" />
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-card">
                    <nav className="px-4 py-4 space-y-1">
                        <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-md bg-muted">
                            <div className={`w-2 h-2 rounded-full ${userRole === 'tpa' ? 'bg-primary' : 'bg-accent'}`} />
                            <span className="text-sm font-medium text-foreground capitalize">{userRole} User</span>
                        </div>
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-fast ${isActive(item.href)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <Icon name={item.icon as any} size={20} />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;