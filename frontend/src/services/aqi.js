import api from './api'

export const aqiAPI = {
  getCurrent: (params = {}) => api.get('/api/aqi/current', { params }),
  getStations: () => api.get('/api/aqi/stations'),
  getHistorical: (stationId, days = 7) => api.get(`/api/aqi/historical/${stationId}?days=${days}`),
}

// Helper function to get AQI level and color
export const getAqiInfo = (aqi) => {
  if (aqi <= 50) {
    return { level: 'Good', color: 'bg-green-500', textColor: 'text-green-500' }
  } else if (aqi <= 100) {
    return { level: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-500' }
  } else if (aqi <= 150) {
    return { level: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500', textColor: 'text-orange-500' }
  } else if (aqi <= 200) {
    return { level: 'Unhealthy', color: 'bg-red-500', textColor: 'text-red-500' }
  } else if (aqi <= 300) {
    return { level: 'Very Unhealthy', color: 'bg-purple-500', textColor: 'text-purple-500' }
  } else {
    return { level: 'Hazardous', color: 'bg-red-800', textColor: 'text-red-800' }
  }
}