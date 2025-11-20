import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts'

const ForecastChart = ({ data, city }) => {
  if (!data || !data.forecast) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">Loading forecast data...</p>
      </div>
    )
  }

  // Format data for the chart
  const chartData = data.forecast.map(item => ({
    ...item,
    // Format time for display
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(item.timestamp).toLocaleDateString()
  }))

  // Calculate some statistics
  const pm25Values = data.forecast.map(item => item.pm25)
  const maxPM25 = Math.max(...pm25Values)
  const minPM25 = Math.min(...pm25Values)
  const avgPM25 = (pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length).toFixed(1)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          PM2.5 Forecast for {city} - Next {data.forecast_hours} hours
        </h3>
        <div className="text-sm text-gray-500">
          Generated: {new Date(data.generated_at).toLocaleTimeString()}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{avgPM25}</div>
          <div className="text-sm text-blue-800">Average PM2.5</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{maxPM25}</div>
          <div className="text-sm text-red-800">Peak PM2.5</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{minPM25}</div>
          <div className="text-sm text-green-800">Lowest PM2.5</div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            interval="preserveStartEnd"
            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ value: 'PM2.5 (μg/m³)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value) => [`${value} μg/m³`, 'PM2.5']}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return `Date: ${payload[0].payload.date} Time: ${label}`
              }
              return label
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="confidence_upper" 
            stroke="#82ca9d" 
            fill="#82ca9d" 
            fillOpacity={0.3}
            name="Upper Confidence"
          />
          <Area 
            type="monotone" 
            dataKey="confidence_lower" 
            stroke="#82ca9d" 
            fill="#ffffff" 
            name="Lower Confidence"
          />
          <Line 
            type="monotone" 
            dataKey="pm25" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={false}
            name="PM2.5 Forecast"
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Forecast Interpretation */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Forecast Analysis</h4>
        <p className="text-sm text-gray-600">
          {avgPM25 > 150 ? 
            "Poor air quality expected. Consider limiting outdoor activities and using air purifiers." :
           avgPM25 > 100 ?
            "Moderate air quality. Sensitive groups should take precautions." :
            "Good to moderate air quality expected. Generally safe for outdoor activities."
          }
        </p>
      </div>
    </div>
  )
}

export default ForecastChart