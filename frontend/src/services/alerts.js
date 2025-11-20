import api from './api'

export const alertsAPI = {
  getAlerts: () => api.get('/api/alerts/'),
  setThreshold: (threshold) => api.post('/api/alerts/threshold', { threshold }),
  checkAlerts: () => api.post('/api/alerts/check'),
  markAlertRead: (alertId) => api.post(`/api/alerts/mark-read/${alertId}`),
  markAllRead: () => api.post('/api/alerts/mark-all-read'),
}

// Browser notifications
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  return false
}

export const showBrowserNotification = (title, message) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/vite.svg',
      badge: '/vite.svg'
    })
  }
}