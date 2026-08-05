import React, { useState, useEffect } from 'react';
import { fetchNotificationsApi, markNotificationReadApi, deleteNotificationApi, markAllNotificationsReadApi, clearAllNotificationsApi } from '../services/api';
import { Bell, CloudLightning, Droplets, TrendingUp, Bug, Sprout, BrainCircuit, Trash2, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await fetchNotificationsApi();
            setNotifications(data.results || data);
        } catch (err) {} finally {
            setIsLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationReadApi(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {}
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            await deleteNotificationApi(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {}
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsReadApi();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {}
    };

    const handleClearAll = async () => {
        try {
            await clearAllNotificationsApi();
            setNotifications([]);
        } catch (err) {}
    };

    const handleAskAi = (title, message, e) => {
        e.stopPropagation();
        const prompt = `${title}: ${message}. What should I do about this?`;
        navigate(`/assistant?prompt=${encodeURIComponent(prompt)}`);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">All Notifications</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage your alerts</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleMarkAllRead} className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4" /> Mark All Read
                    </button>
                    <button onClick={handleClearAll} className="px-4 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl font-bold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition flex items-center gap-2 text-sm">
                        <Trash2 className="w-4 h-4" /> Clear All
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                {isLoading ? (
                    <div className="p-10 text-center text-slate-500">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">You're all caught up!</h2>
                        <p className="text-slate-500">No notifications found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.map(notif => {
                            const { icon: Icon, color, bg } = getIconInfo(notif.type);
                            return (
                                <div 
                                    key={notif.id} 
                                    onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                                    className={`p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer flex gap-4 ${!notif.is_read ? 'bg-primary/5 dark:bg-primary/5' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex flex-shrink-0 items-center justify-center ${bg} ${color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <h3 className={`text-base ${!notif.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-xs text-slate-400">{formatTime(notif.created_at)}</span>
                                        </div>
                                        <p className={`mt-1 text-sm ${!notif.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500'}`}>
                                            {notif.message}
                                        </p>
                                        <div className="mt-4 flex items-center gap-3">
                                            <button 
                                                onClick={(e) => handleAskAi(notif.title, notif.message, e)}
                                                className="flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <BrainCircuit className="w-4 h-4" /> Ask AI About This
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <button 
                                            onClick={(e) => handleDelete(notif.id, e)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
