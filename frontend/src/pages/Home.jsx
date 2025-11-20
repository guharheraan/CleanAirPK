import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">CleanAirPK</h1>
          <p className="text-xl text-gray-600 mb-12">Real-time Air Quality Monitoring for Pakistan</p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Real-time AQI</h3>
              <p className="text-gray-600">Get current air quality index for your location</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">PM2.5 Forecast</h3>
              <p className="text-gray-600">24-48 hour PM2.5 predictions</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Health Risk Assessment</h3>
              <p className="text-gray-600">Personalized exposure risk scoring</p>
            </div>
          </div>

          <div className="space-x-4">
            <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
              Login
            </Link>
            <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold">
              Register
            </Link>
            <Link to="/dashboard" className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}