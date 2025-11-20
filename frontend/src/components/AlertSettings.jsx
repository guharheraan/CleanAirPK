import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { alertsAPI, requestNotificationPermission } from '../services/alerts'

const AlertSettings = () => {
  const { t } = useTranslation()
  const [threshold, setThreshold] = useState(150)
  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationEnabled(true)
    }
  }, [])

  const handleSaveThreshold = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      await alertsAPI.setThreshold(threshold)
      setMessage('Alert threshold updated successfully!')
      
      setTimeout(async () => {
        await alertsAPI.checkAlerts()
      }, 1000)
    } catch (error) {
      setMessage('Failed to update alert threshold.')
      console.error('Error setting threshold:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationToggle = async () => {
    if (!notificationEnabled) {
      const granted = await requestNotificationPermission()
      setNotificationEnabled(granted)
      if (granted) {
        setMessage(t('alerts.notifications_enabled'))
      } else {
        setMessage('Please enable notifications in your browser settings.')
      }
    } else {
      setNotificationEnabled(false)
      setMessage(t('alerts.notifications_disabled'))
    }
  }

  const testAlert = async () => {
    try {
      const testAlertMsg = "🧪 Test Alert: Your notification system is working correctly!"
      if (notificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('CleanAirPK Test', {
          body: testAlertMsg,
          icon: '/vite.svg'
        })
      }
      setMessage('Test alert sent! Check your notifications.')
    } catch (error) {
      setMessage('Failed to send test alert.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('alerts.alert_settings')}</h3>
        <p className="text-sm text-gray-600">{t('alerts.alert_tips')}</p>
      </div>

      {/* Alert Threshold */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3">{t('alerts.aqi_alert_threshold')}</h4>
        
        <form onSubmit={handleSaveThreshold}>
          <div className="flex items-center space-x-4 mb-3">
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-lg font-bold text-blue-700 min-w-[60px]">
              {threshold}
            </span>
          </div>
          
          <div className="flex justify-between text-xs text-blue-600 mb-4">
            <span>{t('alerts.recommended_threshold_150')}</span>
            <span>{t('alerts.threshold_100_respiratory')}</span>
          </div>

          <p className="text-sm text-blue-700 mb-4">
            {t('alerts.one_alert_per_city_6_hours')}
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </div>

      {/* Browser Notifications */}
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-3">{t('alerts.browser_notifications')}</h4>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-green-700">{t('alerts.enable_desktop_notifications')}</span>
          <button
            onClick={handleNotificationToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <p className="text-sm text-green-600 mb-4">
          {notificationEnabled 
            ? t('alerts.notifications_enabled')
            : t('alerts.notifications_disabled')
          }
        </p>

        <button
          onClick={testAlert}
          disabled={!notificationEnabled}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 font-medium"
        >
          {t('alerts.test_notification')}
        </button>
      </div>

      {/* Alert Tips */}
      <div className="bg-yellow-50 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">{t('alerts.alert_tips')}</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• {t('alerts.alerts_checked_every_5_minutes')}</li>
          <li>• {t('alerts.one_alert_per_city_6_hours')}</li>
          <li>• {t('alerts.recommended_threshold_150')}</li>
          <li>• {t('alerts.threshold_100_respiratory')}</li>
        </ul>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('successfully') || message.includes('enabled') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}

export default AlertSettings