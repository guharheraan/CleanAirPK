import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { aqiAPI } from '../services/aqi'
import { forecastAPI } from '../services/forecast'
import ForecastChart from '../components/ForecastChart'
import CityCardsSlider from '../components/CityCardsSlider'
import CitySelector from '../components/CitySelector'
import MapView from '../components/MapView'
import AlertBanner from '../components/AlertBanner'
import AlertSettings from '../components/AlertSettings'

export default function Dashboard() {
  const { t } = useTranslation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [aqiData, setAqiData] = useState(null)
  const [forecastData, setForecastData] = useState(null)
  const [selectedCity, setSelectedCity] = useState('Islamabad')
  const [activeTab, setActiveTab] = useState('cards')
  const [loading, setLoading] = useState(true)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAqiData()
  }, [])

  useEffect(() => {
    if (selectedCity && selectedCity !== 'All Cities') {
      loadForecast(selectedCity)
    }
  }, [selectedCity])

  const loadAqiData = async () => {
    try {
      setLoading(true)
      const response = await aqiAPI.getCurrent()
      setAqiData(response.data)
      
      if (response.data.data && response.data.data.length > 0) {
        const islamabadCity = response.data.data.find(city => 
          city.city.toLowerCase() === 'islamabad'
        )
        if (islamabadCity) {
          setSelectedCity('Islamabad')
        } else {
          setSelectedCity(response.data.data[0].city)
        }
      }
    } catch (err) {
      setError('Failed to load AQI data')
      console.error('AQI data error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadForecast = async (city) => {
    try {
      setForecastLoading(true)
      const response = await forecastAPI.getForecast(city, 48)
      setForecastData(response.data)
    } catch (err) {
      console.error('Forecast data error:', err)
    } finally {
      setForecastLoading(false)
    }
  }

  const handleCityChange = (city) => {
    setSelectedCity(city)
  }

  const handleCityCardClick = (city) => {
    setSelectedCity(city)
  }

  const refreshData = () => {
    loadAqiData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.pakistan_air_quality')}</h1>
            <p className="text-gray-600">{t('common.welcome')}, {user.email}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <CitySelector 
              selectedCity={selectedCity}
              onCityChange={handleCityChange}
            />
            
            <div className="flex space-x-4">
              <button 
                onClick={refreshData}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? t('common.loading') : t('common.refresh')}
              </button>
              <Link to="/profile" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                {t('navigation.profile')}
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('token')
                  localStorage.removeItem('user')
                  window.location.href = '/'
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        <AlertBanner />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'cards'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('cards')}
            >
              📊 {t('dashboard.city_cards_view')}
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('map')}
            >
              🗺️ {t('dashboard.map_view')}
            </button>
          </div>
        </div>

        {/* City Cards or Map View */}
        {activeTab === 'cards' ? (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 mx-2">
            <CityCardsSlider 
              cities={aqiData?.data || []}
              selectedCity={selectedCity}
              onCityClick={handleCityCardClick}
              loading={loading}
            />
          </div>
        ) : (
          <div className="mb-8">
            <MapView 
              cities={aqiData?.data || []}
              selectedCity={selectedCity}
              onCityClick={handleCityCardClick}
              loading={loading}
            />
          </div>
        )}

        {/* Forecast Section */}
        {selectedCity !== 'All Cities' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {t('dashboard.pm25_forecast')} {selectedCity}
              </h2>
              <span className="text-sm text-gray-500">
                {forecastData ? `${t('dashboard.updated')}: ${new Date(forecastData.generated_at).toLocaleTimeString()}` : t('common.loading')}
              </span>
            </div>
            
            {forecastLoading ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">{t('common.loading')} {selectedCity}...</p>
              </div>
            ) : forecastData ? (
              <ForecastChart data={forecastData} city={selectedCity} />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">{t('dashboard.select_city_view_forecast')}</p>
              </div>
            )}
          </div>
        )}

        {/* Information Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* AQI Scale Guide */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">{t('dashboard.aqi_scale_guide')}</h3>
            <div className="space-y-2">
              {[
                { range: '0-50', level: t('aqi.good'), color: 'bg-green-500', description: t('health.good_air_quality') },
                { range: '51-100', level: t('aqi.moderate'), color: 'bg-yellow-500', description: t('health.moderate_air_quality') },
                { range: '101-150', level: t('aqi.unhealthy_sensitive'), color: 'bg-orange-500', description: t('health.sensitive_groups_warning') },
                { range: '151-200', level: t('aqi.unhealthy'), color: 'bg-red-500', description: t('health.reduce_outdoor_activities') },
                { range: '201-300', level: t('aqi.very_unhealthy'), color: 'bg-purple-500', description: t('health.avoid_outdoor_activities') },
                { range: '301+', level: t('aqi.hazardous'), color: 'bg-red-800', description: t('health.emergency_conditions') },
              ].map((item) => (
                <div key={item.level} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-start space-x-3">
                    <div className={`w-4 h-4 ${item.color} rounded mt-1 flex-shrink-0`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{item.level}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                  </div>
                  <span className="text-gray-500 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {item.range}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">{t('dashboard.quick_actions')}</h3>
            <div className="space-y-4">
              <Link 
                to="/profile" 
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-3 px-4 rounded-lg transition-colors font-medium"
              >
                {t('profile.update_profile')}
              </Link>
              
              <button 
                onClick={refreshData}
                disabled={loading}
                className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-3 px-4 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {loading ? t('common.loading') : t('common.refresh')}
              </button>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <span className="mr-2">💡</span> {t('dashboard.health_tips')}
                </h4>
                <p className="text-blue-700 text-sm">
                  {selectedCity && selectedCity !== 'All Cities' ? 
                    `${selectedCity}: ${getHealthAdvice(selectedCity, aqiData)}` :
                    t('dashboard.select_city_forecast')
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Alert Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <AlertSettings />
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function for health advice based on city and AQI
function getHealthAdvice(city, aqiData) {
  if (!aqiData || !aqiData.data) return "Loading air quality data..."
  
  const cityData = aqiData.data.find(c => c.city === city)
  if (!cityData) return "No data available for this city."
  
  const aqi = cityData.aqi
  
  if (aqi <= 50) {
    return "Air quality is good. Perfect for outdoor activities!"
  } else if (aqi <= 100) {
    return "Air quality is acceptable. Enjoy outdoor activities."
  } else if (aqi <= 150) {
    return "Sensitive groups should reduce prolonged outdoor exposure."
  } else if (aqi <= 200) {
    return "Everyone should reduce outdoor activities. Consider masks if outside."
  } else if (aqi <= 300) {
    return "Avoid outdoor activities. Use air purifiers indoors."
  } else {
    return "Emergency conditions. Stay indoors with windows closed."
  }
}