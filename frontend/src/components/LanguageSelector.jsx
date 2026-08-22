import React, { useState, useEffect } from 'react';
import { FaGlobe } from 'react-icons/fa';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' }
];

const LanguageSelector = ({ isCompact = false }) => {
  const [selectedLang, setSelectedLang] = useState(() => {
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      if (c.trim().startsWith('googtrans=')) {
        const parts = c.trim().split('/');
        return parts[parts.length - 1] || 'en';
      }
    }
    return 'en';
  });

  const handleLanguageChange = (langCode) => {
    setSelectedLang(langCode);
    
    // Set Google Translate cookie
    if (langCode === 'en') {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=` + window.location.hostname;
    }
    
    // Trigger iframe change or reload page for translation application
    window.location.reload();
  };

  return (
    <div className="dropdown d-inline-block me-1">
      <button 
        className="btn btn-sm d-flex align-items-center gap-1.5 rounded-pill px-2.5 py-1.5 border-0 bg-transparent text-body shadow-none"
        type="button" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
        title="Select Language"
        style={{ fontSize: '13px', fontWeight: '600' }}
      >
        <FaGlobe size={14} className="text-primary-sage" />
        <span>{LANGUAGES.find(l => l.code === selectedLang)?.flag || '🌐'}</span>
        {!isCompact && (
          <span className="d-none d-md-inline-block">
            {LANGUAGES.find(l => l.code === selectedLang)?.name || 'English'}
          </span>
        )}
      </button>
      <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 py-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <li><h6 className="dropdown-header text-uppercase small fw-bold">Select Website Language</h6></li>
        {LANGUAGES.map((lang) => (
          <li key={lang.code}>
            <button
              onClick={() => handleLanguageChange(lang.code)}
              className={`dropdown-item d-flex align-items-center gap-2 py-1.5 px-3 small ${selectedLang === lang.code ? 'active fw-bold' : ''}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageSelector;
