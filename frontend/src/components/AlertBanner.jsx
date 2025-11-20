import React, { useState, useEffect } from 'react'
import { alertsAPI } from '../services/alerts'

const AlertBanner = () => {
  const [alerts, setAlerts] = useState([])
  const [visible, setVisible] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadAlerts()
    // Check for new alerts every 5 minutes
    const interval = setInterval(loadAlerts, 300000)
    return () => clearInterval(interval)
  }, [])

  const loadAlerts = async () => {
    try {
      const response = await alertsAPI.getAlerts()
      const unreadAlerts = response.data.alerts.filter(alert => !alert.is_read)
      setAlerts(unreadAlerts)
      setUnreadCount(unreadAlerts.length)
      
      // Show browser notification for new alerts
      if (unreadAlerts.length > 0) {
        const latestAlert = unreadAlerts[0]
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('CleanAirPK Alert', {
            body: latestAlert.message,
            icon: '/vite.svg'
          })
        }
      }
    } catch (error) {
      console.error('Failed to load alerts', error)
    }
  }

  const markAsRead = async (alertId) => {
    try {
      await alertsAPI.markAlertRead(alertId)
      setAlerts(alerts.filter(alert => alert.id !== alertId))
      setUnreadCount(unreadCount - 1)
    } catch (error) {
      console.error('Failed to mark alert as read', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await alertsAPI.markAllRead()
      setAlerts([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all alerts as read', error)
    }
  }

  if (!visible || unreadCount === 0) {
    return null
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 shadow-lg">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Air Quality Alerts ({unreadCount} unread)
            </h3>
          </div>
        </div>
        <div className="flex space-x-2">
          {unreadCount > 1 && (
            <button
              onClick={markAllAsRead}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded transition-colors"
            >
              Mark All Read
            </button>
          )}
          <button
            onClick={() => setVisible(false)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mt-2 space-y-2">
        {alerts.slice(0, 3).map((alert) => (
          <div key={alert.id} className="flex justify-between items-center bg-white p-3 rounded border border-red-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-700">{alert.message}</p>
            </div>
            <button
              onClick={() => markAsRead(alert.id)}
              className="text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        ))}
        
        {alerts.length > 3 && (
          <p className="text-xs text-red-600 text-center">
            +{alerts.length - 3} more alerts. Check your profile for details.
          </p>
        )}
      </div>
    </div>
  )
}

export default AlertBanner