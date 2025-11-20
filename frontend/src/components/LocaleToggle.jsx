import React from 'react'
import { useTranslation } from 'react-i18next'

const LocaleToggle = () => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ur' : 'en'
    i18n.changeLanguage(newLang)
    
    // Update document direction for RTL support
    document.documentElement.dir = newLang === 'ur' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLang
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-lg text-sm font-medium transition-colors border border-gray-300"
      title={i18n.language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
    >
      <span className="text-sm">
        {i18n.language === 'en' ? 'اردو' : 'English'}
      </span>
      <span className="text-xs">🌐</span>
    </button>
  )
}

export default LocaleToggle