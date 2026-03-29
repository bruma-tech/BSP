'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../ui/AppIcon';
import { wix } from '@/app/components/ui/fonts';
import { modalBus } from "@/app/lib/modalBus";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { signout } from '@/app/auth/actions/signout';
import { useNotifications} from '@/hooks/useNotifications';

type NotifType = 'new_requirement' | 'deadline_approaching' | 'review_decision' | 'feedback_received';

const TYPE_CONFIG: Record<NotifType, { icon: string; dotClass: string; labelClass: string }> = {
    new_requirement:      { icon: 'DocumentPlusIcon',           dotClass: 'bg-primary', labelClass: 'text-primary bg-primary/10' },
    deadline_approaching: { icon: 'ClockIcon',                  dotClass: 'bg-warning', labelClass: 'text-warning bg-warning/10' },
    review_decision:      { icon: 'CheckBadgeIcon',             dotClass: 'bg-success', labelClass: 'text-success bg-success/10' },
    feedback_received:    { icon: 'ChatBubbleLeftEllipsisIcon', dotClass: 'bg-accent',  labelClass: 'text-accent bg-accent/10'   },
};

function relativeTime(isoString: string): string {
    const s = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


interface HeaderProps {
    userRole?: 'tpa' | 'sponsor';
    userName?: string;
}


const Header = ({ userRole = 'tpa', userName = 'User' }: HeaderProps) => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const {
        notifications,
        unreadCount,
        loading,
        markRead,
        markAllRead,
        clear,
        clearAll,
    } = useNotifications();

    const isAnyPopupOpen = isQuickActionOpen || isNotificationOpen || isUserMenuOpen;
    const closeAllPopups = () => {
        setIsQuickActionOpen(false);
        setIsNotificationOpen(false);
        setIsUserMenuOpen(false);
    };
    useEscapeKey(isAnyPopupOpen, closeAllPopups);

    const handleBellClick = () => {
        setIsNotificationOpen((prev) => !prev);
        setIsQuickActionOpen(false);
        setIsUserMenuOpen(false);
    };

    const tpaNavigation = [
        { name: 'Dashboard',    href: '/tpa-dashboard',                        icon: 'ChartBarIcon' },
        { name: 'Sponsors',     href: '/tpa-dashboard/sponsor-management',     icon: 'BuildingOfficeIcon' },
        { name: 'Requirements', href: '/tpa-dashboard/requirement-management', icon: 'DocumentTextIcon' },
        { name: 'Documents',    href: '/tpa-dashboard/document-review',        icon: 'FolderOpenIcon' },
    ];

    const sponsorNavigation = [
        { name: 'Dashboard', href: '/sponsor-dashboard',                 icon: 'ChartBarIcon' },
        { name: 'Documents', href: '/sponsor-dashboard/document-upload', icon: 'ArrowUpTrayIcon' },
    ];

    const navigation = userRole === 'tpa' ? tpaNavigation : sponsorNavigation;

    const quickActions = userRole === 'tpa'
        ? [
            { name: 'Create Requirement', icon: 'PlusCircleIcon', action: () => modalBus.open("requirement"), disabled: false },
            { name: 'Add Sponsor',        icon: 'UserPlusIcon',   action: () => modalBus.open("sponsor"),      disabled: true  },
          ]
        : [
            { name: 'Upload Document', icon: 'ArrowUpTrayIcon', action: () => console.log('Upload Document'), disabled: false },
          ];

    const isActive = (href: string) => pathname === href;

    return (
        <header className="fixed top-0 left-0 right-0 z-100 bg-[#fcf9f6]">
            <div className="flex items-center shadow-lg justify-between h-16 px-6 border-b">

                {/* ── Left: Logo + Nav ── */}
                <div className="flex items-center gap-8">
                    <Link href={userRole === 'tpa' ? '/tpa-dashboard' : '/sponsor-dashboard'} className="flex items-center gap-2">
                        <span className={`${wix.className} antialiased text-2xl font-bold text-[#02f4fa]`}>Bruma</span>
                    </Link>

                    <nav className="md:flex items-center gap-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-fast ${
                                    isActive(item.href)
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

                {/* ── Right: Actions ── */}
                <div className="flex items-center gap-3">
                    {isAnyPopupOpen && (
                        <div className="fixed inset-0 z-[199]" aria-hidden onClick={closeAllPopups} />
                    )}

                    {/* Role badge */}
                    <div className="md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                        <div className={`w-2 h-2 rounded-full ${userRole === 'tpa' ? 'bg-primary' : 'bg-accent'}`} />
                        <span className="text-xs font-medium text-foreground capitalize">{userRole}</span>
                    </div>

                    {/* Quick actions */}
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
                                        disabled={action.disabled}
                                        onClick={() => {
                                            if (action.disabled) return;
                                            action.action();
                                            setIsQuickActionOpen(false);
                                        }}
                                        className={
                                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors duration-fast" +
                                            (action.disabled ? " opacity-50 cursor-not-allowed" : " hover:bg-muted cursor-pointer")
                                        }
                                    >
                                        <Icon name={action.icon as any} size={18} />
                                        {action.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notifications bell + inline panel */}
                    <div className="relative">
                        <button
                            onClick={handleBellClick}
                            className="relative p-2 rounded-md hover:bg-muted transition-colors duration-fast"
                            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                        >
                            <Icon name="BellIcon" size={20} className="text-foreground" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-error text-error-foreground text-[10px] font-semibold rounded-full flex items-center justify-center leading-none">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-96 bg-popover border border-border rounded-lg shadow-modal z-[200] overflow-hidden">

                                {/* Panel header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <span className="px-1.5 py-0.5 bg-error text-error-foreground text-xs font-semibold rounded-full min-w-[20px] text-center">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllRead}
                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors duration-fast"
                                            >
                                                <Icon name="CheckIcon" size={13} />
                                                All read
                                            </button>
                                        )}
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={clearAll}
                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-error hover:bg-error/10 rounded transition-colors duration-fast"
                                            >
                                                <Icon name="TrashIcon" size={13} />
                                                Clear all
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Panel body */}
                                <div className="max-h-[420px] overflow-y-auto">
                                    {loading ? (
                                        <div className="flex flex-col gap-3 px-4 py-6">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex gap-3 animate-pulse">
                                                    <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-3 bg-muted rounded w-3/4" />
                                                        <div className="h-2.5 bg-muted rounded w-full" />
                                                        <div className="h-2 bg-muted rounded w-1/3" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                                <Icon name="BellSlashIcon" size={22} className="text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">All caught up</p>
                                            <p className="text-xs text-muted-foreground mt-1">No notifications right now.</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => {
                                            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.feedback_received;
                                            return (
                                                <div
                                                    key={n.id}
                                                    className={`px-4 py-3 border-b border-border transition-colors duration-fast group ${
                                                        n.read ? 'opacity-60' : 'bg-primary/[0.02] hover:bg-muted'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {/* Unread dot */}
                                                        <div className="flex-shrink-0 mt-1.5">
                                                            <div className={`w-2 h-2 rounded-full ${n.read ? 'opacity-0' : cfg.dotClass}`} />
                                                        </div>
                                                        {/* Type icon */}
                                                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${cfg.labelClass}`}>
                                                            <Icon name={cfg.icon as any} size={14} />
                                                        </div>
                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className="text-sm font-medium text-foreground leading-snug">{n.title}</p>
                                                                <button
                                                                    onClick={() => clear(n.id)}
                                                                    className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all duration-fast"
                                                                    aria-label="Dismiss"
                                                                >
                                                                    <Icon name="XMarkIcon" size={14} className="text-muted-foreground" />
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                                                            <div className="flex items-center justify-between mt-1.5 gap-2">
                                                                <span className="text-xs text-muted-foreground">{relativeTime(n.createdAt)}</span>
                                                                <div className="flex items-center gap-2">
                                                                    {n.actionRequired && (
                                                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                                                                            Action needed
                                                                        </span>
                                                                    )}
                                                                    {!n.read && (
                                                                        <button
                                                                            onClick={() => markRead(n.id)}
                                                                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors duration-fast"
                                                                        >
                                                                            Mark read
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Panel footer */}
                                {notifications.length > 0 && (
                                    <div className="px-4 py-2.5 border-t border-border bg-muted/30">
                                        <p className="text-xs text-muted-foreground text-center">
                                            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                                            {unreadCount > 0 ? ` · ${unreadCount} unread` : ' · all read'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User menu */}
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
                                    <form action={signout}>
                                        <button
                                            type="submit"
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-muted transition-colors duration-fast"
                                        >
                                            <Icon name="ArrowRightOnRectangleIcon" size={18} />
                                            Sign out
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-md hover:bg-muted transition-colors duration-fast"
                        aria-label="Toggle menu"
                    >
                        <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} className="text-foreground" />
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
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
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-fast ${
                                    isActive(item.href)
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