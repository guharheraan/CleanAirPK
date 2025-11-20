import api from './api'

export const forecastAPI = {
  getForecast: (city, hours = 48) => api.get('/api/forecast/', { params: { city, hours } }),
}