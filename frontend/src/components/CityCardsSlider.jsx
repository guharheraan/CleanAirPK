import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { getAqiInfo } from '../services/aqi'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const CityCardsSlider = ({ cities, selectedCity, onCityClick, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!cities || cities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">No city data available</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-2xl font-bold text-gray-800">Pakistan Air Quality</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {cities.length} cities monitoring
        </span>
      </div>

      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{ 
            clickable: true,
            el: '.swiper-pagination',
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
            1280: {
              slidesPerView: 4,
            },
          }}
          className="pb-12" // Extra padding for pagination
        >
          {cities.map((city) => {
            const aqiInfo = getAqiInfo(city.aqi)
            return (
              <SwiperSlide key={city.station_id}>
                <div 
                  className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg h-full border-2 ${
                    selectedCity === city.city 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-transparent hover:border-gray-200'
                  }`}
                  onClick={() => onCityClick(city.city)}
                >
                  <div className={`p-4 ${aqiInfo.color} text-white`}>
                    <h3 className="text-lg font-semibold">{city.city}</h3>
                    <p className="text-sm opacity-90">{city.station_name}</p>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-3xl font-bold text-gray-800">{city.aqi}</p>
                        <p className="text-gray-600 text-sm">AQI</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${aqiInfo.color} text-white`}>
                          {aqiInfo.level}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">PM2.5:</span>
                        <span className="font-semibold text-gray-800">{city.pm25} μg/m³</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Updated:</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(city.last_updated).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <button
                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          selectedCity === city.city
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedCity === city.city ? '✓ Viewing Forecast' : 'View Forecast'}
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>

        {/* Custom navigation buttons */}
        <div className="swiper-button-prev !text-blue-600 !left-0 after:!text-xl"></div>
        <div className="swiper-button-next !text-blue-600 !right-0 after:!text-xl"></div>
        
        {/* Custom pagination */}
        <div className="swiper-pagination !bottom-0 mt-4"></div>
      </div>
    </div>
  )
}

export default CityCardsSlider