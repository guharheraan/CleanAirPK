import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getAqiInfo } from '../services/aqi'

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom colored markers based on AQI
const createCustomIcon = (aqi) => {
  const aqiInfo = getAqiInfo(aqi)
  
  const iconColor = {
    'Good': 'green',
    'Moderate': 'yellow',
    'Unhealthy for Sensitive Groups': 'orange',
    'Unhealthy': 'red',
    'Very Unhealthy': 'purple',
    'Hazardous': 'maroon'
  }[aqiInfo.level] || 'gray'

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

// Component to handle map view changes when selected city changes
const MapController = ({ selectedCity, cities }) => {
  const map = useMap()
  
  useEffect(() => {
    if (selectedCity && selectedCity !== 'All Cities') {
      const cityData = cities.find(city => city.city === selectedCity)
      if (cityData) {
        map.setView([cityData.latitude, cityData.longitude], 10, {
          animate: true,
          duration: 1
        })
      }
    }
  }, [selectedCity, cities, map])

  return null
}

const MapView = ({ cities, selectedCity, onCityClick, loading }) => {
  const [map, setMap] = useState(null)

  // Default center (Pakistan)
  const defaultCenter = [30.3753, 69.3451]
  const defaultZoom = 6

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center h-96 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!cities || cities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center h-96 flex items-center justify-center">
        <p className="text-gray-600">No station data available for the map</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">Pakistan Air Quality Map</h3>
        <p className="text-sm text-gray-600">Click on markers to view station details</p>
      </div>
      
      <div className="h-96 w-full relative">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          ref={setMap}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController selectedCity={selectedCity} cities={cities} />
          
          {cities.map((city) => {
            const aqiInfo = getAqiInfo(city.aqi)
            return (
              <Marker
                key={city.station_id}
                position={[city.latitude, city.longitude]}
                icon={createCustomIcon(city.aqi)}
                eventHandlers={{
                  click: () => {
                    onCityClick(city.city)
                  },
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h4 className="font-bold text-lg text-gray-800">{city.city}</h4>
                    <p className="text-sm text-gray-600 mb-2">{city.station_name}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">AQI:</span>
                        <span className={`font-bold ${aqiInfo.textColor}`}>
                          {city.aqi} - {aqiInfo.level}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">PM2.5:</span>
                        <span className="font-semibold">{city.pm25} μg/m³</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="text-xs text-gray-500">
                          {new Date(city.last_updated).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onCityClick(city.city)}
                      className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                    >
                      View Forecast
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 justify-center items-center text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Good (0-50)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Moderate (51-100)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>USG (101-150)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Unhealthy (151-200)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Very Unhealthy (201-300)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-800 rounded-full"></div>
            <span>Hazardous (301+)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapView