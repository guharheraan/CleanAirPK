import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userAPI } from '../services/api'
import { alertsAPI } from '../services/alerts'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [formData, setFormData] = useState({
    age: '',
    has_chronic_conditions: false,
    is_smoker: false,
    daily_outdoor_hours: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadProfile()
    loadAlerts()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile()
      if (response.data.profile) {
        setProfile(response.data.profile)
        setFormData({
          age: response.data.profile.age || '',
          has_chronic_conditions: response.data.profile.has_chronic_conditions || false,
          is_smoker: response.data.profile.is_smoker || false,
          daily_outdoor_hours: response.data.profile.daily_outdoor_hours || ''
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const loadAlerts = async () => {
    try {
      const response = await alertsAPI.getAlerts()
      setAlerts(response.data.alerts)
    } catch (error) {
      console.error('Failed to load alerts:', error)
    }
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const response = await userAPI.updateProfile({
        age: parseInt(formData.age),
        has_chronic_conditions: formData.has_chronic_conditions,
        is_smoker: formData.is_smoker,
        daily_outdoor_hours: parseInt(formData.daily_outdoor_hours)
      })
      setMessage('Profile updated successfully!')
      setProfile(response.data.risk_assessment)
    } catch (error) {
      setMessage('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const markAlertRead = async (alertId) => {
    try {
      await alertsAPI.markAlertRead(alertId)
      setAlerts(alerts.filter(alert => alert.id !== alertId))
    } catch (error) {
      console.error('Failed to mark alert as read:', error)
    }
  }

  const markAllAlertsRead = async () => {
    try {
      await alertsAPI.markAllRead()
      setAlerts([])
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
          <Link to="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Back to Dashboard
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Update Your Profile</h2>
              
              {message && (
                <div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Daily outdoor hours
                    </label>
                    <input
                      type="number"
                      name="daily_outdoor_hours"
                      value={formData.daily_outdoor_hours}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="has_chronic_conditions"
                      checked={formData.has_chronic_conditions}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      I have chronic respiratory conditions
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_smoker"
                      checked={formData.is_smoker}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      I am a smoker
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Alerts History */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Alert History</h2>
                {alerts.length > 0 && (
                  <button
                    onClick={markAllAlertsRead}
                    className="text-sm bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
                  >
                    Mark All Read
                  </button>
                )}
              </div>
              
              {alerts.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No alerts yet. Configure alerts in the dashboard.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`p-3 rounded border-l-4 ${
                      alert.is_read 
                        ? 'border-gray-300 bg-gray-50' 
                        : 'border-red-500 bg-red-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className={`text-sm ${alert.is_read ? 'text-gray-600' : 'text-red-700'}`}>
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!alert.is_read && (
                          <button
                            onClick={() => markAlertRead(alert.id)}
                            className="ml-2 text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
              {profile ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profile.risk_score}/10</div>
                    <div className="text-sm text-blue-800">Risk Score</div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${
                      profile.risk_category === 'High Risk' ? 'bg-red-100 text-red-800' :
                      profile.risk_category === 'Moderate Risk' ? 'bg-yellow-100 text-yellow-800' :
                      profile.risk_category === 'Low Risk' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {profile.risk_category}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Health Advice:</span>
                    <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {profile.advice}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">Complete your profile to see risk assessment</p>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link 
                  to="/dashboard" 
                  className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded transition-colors"
                >
                  🏠 Dashboard
                </Link>
                <button 
                  onClick={() => window.scrollTo(0, 0)}
                  className="block w-full bg-gray-500 hover:bg-gray-600 text-white text-center py-2 px-4 rounded transition-colors"
                >
                  🔔 View Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}