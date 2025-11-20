import React from 'react'

const CitySelector = ({ selectedCity, onCityChange }) => {
  const pakistaniCities = [
    "All Cities",
    "Islamabad",
    "Lahore", 
    "Karachi",
    "Rawalpindi",
    "Faisalabad",
    "Peshawar",
    "Quetta",
    "Multan",
    "Gujranwala",
    "Sialkot"
  ]

  return (
    <div className="min-w-[200px]">
      <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 mb-2 text-right">
        Select City for Forecast
      </label>
      <select
        id="city-select"
        value={selectedCity}
        onChange={(e) => onCityChange(e.target.value)}
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
      >
        {pakistaniCities.map(city => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CitySelector