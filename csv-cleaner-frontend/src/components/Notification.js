import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeNotification } from '../redux/slices/uiSlice';
import { selectNotifications } from '../redux/selectors/fileSelectors';
import './Notification.css';

function Notification() {
    const dispatch = useDispatch();
    const notifications = useSelector(selectNotifications);
    const [hoveredNotifications, setHoveredNotifications] = useState(new Set());

    // Auto-remove notifications after duration
    useEffect(() => {
        const timers = [];
        
        notifications.forEach(notification => {
            if (notification.duration && !hoveredNotifications.has(notification.id)) {
                const timer = setTimeout(() => {
                    dispatch(removeNotification(notification.id));
                }, notification.duration);
                
                timers.push(timer);
            }
        });

        // Cleanup timers on unmount or when notifications change
        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [notifications, hoveredNotifications, dispatch]);

    const handleMouseEnter = (notificationId) => {
        setHoveredNotifications(prev => new Set(prev).add(notificationId));
    };

    const handleMouseLeave = (notificationId) => {
        setHoveredNotifications(prev => {
            const newSet = new Set(prev);
            newSet.delete(notificationId);
            return newSet;
        });
    };

    const handleClose = (e, notificationId) => {
        e.stopPropagation();
        dispatch(removeNotification(notificationId));
    };

    if (notifications.length === 0) return null;

    const getIcon = (type) => {
        switch(type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '💬';
        }
    };

    const getProgressBarColor = (type) => {
        switch(type) {
            case 'success': return 'var(--success-color)';
            case 'error': return 'var(--error-color)';
            case 'warning': return 'var(--warning-color)';
            case 'info': return 'var(--info-color)';
            default: return 'var(--info-color)';
        }
    };

    return (
        <div className="notification-container">
            {notifications.map(notification => {
                const isPaused = hoveredNotifications.has(notification.id);
                
                return (
                    <div 
                        key={notification.id}
                        className={`notification notification-${notification.type}`}
                        onMouseEnter={() => handleMouseEnter(notification.id)}
                        onMouseLeave={() => handleMouseLeave(notification.id)}
                        onClick={() => dispatch(removeNotification(notification.id))}
                        role="alert"
                        aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
                    >
                        <div className="notification-header">
                            <div className="notification-icon-type">
                                <span className="notification-icon">
                                    {notification.icon || getIcon(notification.type)}
                                </span>
                                <span className="notification-type-text">
                                    {notification.type?.charAt(0).toUpperCase() + notification.type?.slice(1) || 'Notification'}
                                </span>
                            </div>
                            <button 
                                className="notification-close"
                                onClick={(e) => handleClose(e, notification.id)}
                                aria-label="Close notification"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className="notification-body">
                            <p className="notification-message">{notification.message}</p>
                            {notification.details && (
                                <div className="notification-details">
                                    <p className="notification-details-text">{notification.details}</p>
                                </div>
                            )}
                        </div>
                        
                        {notification.duration && (
                            <div className="notification-progress-container">
                                <div 
                                    className={`notification-progress-bar ${isPaused ? 'paused' : ''}`}
                                    style={{
                                        '--progress-color': getProgressBarColor(notification.type),
                                        '--duration': `${notification.duration}ms`
                                    }}
                                />
                            </div>
                        )}
                        
                        {notification.timestamp && (
                            <div className="notification-footer">
                                <span className="notification-timestamp">
                                    {new Date(notification.timestamp).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </span>
                                {notification.source && (
                                    <span className="notification-source">
                                        from {notification.source}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default Notification;