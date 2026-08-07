import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, Check, Trash2, X, CloudLightning, Droplets, 
    TrendingUp, Bug, Sprout, BrainCircuit, CheckCircle2 
} from 'lucide-react';
import { 
    fetchNotificationsApi, markNotificationReadApi, deleteNotificationApi,
    markAllNotificationsReadApi, clearAllNotificationsApi, generateSmartNotificationsApi, generateTestNotificationApi
} from '../services/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const initNotifications = async () => {
            // First immediately load what we already have in the database
            await loadNotifications();
            
            // Then trigger background generation
            try {
                const response = await generateSmartNotificationsApi();
                // If it successfully generated NEW notifications, fetch again to update the UI
                if (response && response.new_count > 0) {
                    loadNotifications();
                }
            } catch (err) {
                console.error("Failed to generate new notifications", err);
            }
        };
        initNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await fetchNotificationsApi();
            const results = data.results || data;
            setNotifications(results);
            setUnreadCount(results.filter(n => !n.is_read).length);
        } catch (err) {
            console.error("Failed to fetch notifications");
        }
    };

    const handleMarkRead = async (id, e) => {
        e.stopPropagation();
        try {
            await markNotificationReadApi(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {}
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            await deleteNotificationApi(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => prev - (notifications.find(n => n.id === id)?.is_read ? 0 : 1));
        } catch (err) {}
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsReadApi();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {}
    };

    const handleClearAll = async () => {
        try {
            await clearAllNotificationsApi();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {}
    };

    const handleNotificationClick = (notif) => {
        setIsOpen(false);
        if (!notif.is_read) {
            handleMarkRead(notif.id, { stopPropagation: () => {} });
        }
        if (notif.link) {
            navigate(notif.link);
        }
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hr ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    const getIconInfo = (type) => {
        switch(type) {
            case 'weather': return { icon: CloudLightning, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10' };
            case 'irrigation': return { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' };
            case 'market': return { icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' };
            case 'disease': return { icon: Bug, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' };
            case 'crop': return { icon: Sprout, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
            default: return { icon: Bell, color: 'text-primary', bg: 'bg-primary/10' };
        }
    };

    // Show latest 20 in dropdown
    const displayNotifs = notifications.slice(0, 20);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-400 hover:text-primary bg-slate-100 dark:bg-slate-800 rounded-full transition-colors relative cursor-pointer"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-slate-100 dark:border-slate-800 px-1 animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[120] flex flex-col max-h-[85vh] dropdown-menu"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                Notifications {unreadCount > 0 && <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">{unreadCount} New</span>}
                            </h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer" title="Mark all as read">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button onClick={handleClearAll} className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer" title="Clear all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {displayNotifs.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-500">
                                        <Bell className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">You're all caught up!</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">No new notifications.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {displayNotifs.map((notif) => {
                                        const { icon: NotifIcon, color, bg } = getIconInfo(notif.type);
                                        return (
                                            <div 
                                                key={notif.id}
                                                onClick={() => handleNotificationClick(notif)}
                                                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group relative ${!notif.is_read ? 'bg-emerald-500/[0.02] dark:bg-emerald-500/[0.05]' : ''}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2.5 rounded-xl ${bg} ${color} shrink-0 mt-0.5`}>
                                                        <NotifIcon className="w-4 h-4" />
                                                    </div>

                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className={`text-xs font-bold text-slate-800 dark:text-white truncate ${!notif.is_read ? 'font-black' : ''}`}>
                                                                {notif.title}
                                                            </h4>
                                                            {!notif.is_read && (
                                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 animate-pulse"></span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                                                            {notif.message}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-medium">
                                                            <span>{getTimeAgo(notif.created_at)}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Side Actions */}
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                                                        <button 
                                                            onClick={(e) => handleDelete(notif.id, e)}
                                                            className="text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 p-1 rounded-md shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 space-y-2">
                            {notifications.length > 0 && (
                                <button 
                                    onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                                    className="w-full py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-center cursor-pointer"
                                >
                                    View All Notifications
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
