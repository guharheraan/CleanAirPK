import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LocaleToggle from './LocaleToggle'

const Header = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAuthenticated = !!localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            CleanAirPK
          </Link>
          
          <nav className="flex items-center space-x-4">
            <LocaleToggle />
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                  {t('navigation.dashboard')}
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                  {t('navigation.profile')}
                </Link>
                <span className="text-gray-500">{t('common.welcome')}, {user.email}</span>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  {t('common.login')}
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {t('common.register')}
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header