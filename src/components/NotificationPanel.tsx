import React from 'react';
import { Bell, AlertCircle, Info, AlertTriangle, Inbox } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { LoadingSpinner } from './LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

export function NotificationPanel() {
  const { notifications, loading, markAsRead } = useNotifications();

  const getIcon = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-500" />;
      default:
        return <Info className="h-4 sm:h-5 w-4 sm:w-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" />
            <h3 className="ml-2 text-base sm:text-lg font-medium text-gray-900">Notifications</h3>
          </div>
        </div>
        <div className="p-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" />
            <h3 className="ml-2 text-base sm:text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gray-100 mb-3 sm:mb-4">
            <Inbox className="h-5 sm:h-6 w-5 sm:w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No notifications yet</p>
          <p className="text-xs text-gray-400 mt-1">
            You'll see updates about patients and activities here
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 max-h-[350px] sm:max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-150 ${
                !notification.read ? 'bg-blue-50 hover:bg-blue-100/80' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start">
                {getIcon(notification.severity)}
                <div className="ml-3 flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'font-medium' : ''} text-gray-900 break-words`}>
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}