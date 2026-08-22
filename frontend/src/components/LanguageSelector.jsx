import React, { useState, useEffect } from 'react';
import { FaGlobe } from 'react-icons/fa';
import api from '../api';

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

  const changeGoogleTranslate = (langCode) => {
    const gtCombo = document.querySelector('.goog-te-combo');
    if (gtCombo) {
      gtCombo.value = langCode;
      gtCombo.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  };

  const handleLanguageChange = async (langCode) => {
    setSelectedLang(langCode);

    // 1. Python Backend Translation Service Call
    try {
      await api.post('support/translate/', {
        text: 'Language changed to ' + langCode,
        target_lang: langCode
      });
    } catch (err) {
      console.warn('Python translation API status:', err.message);
    }

    // 2. Save cookie for persistence across pages
    const domain = window.location.hostname;
    if (langCode === 'en') {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain};`;
    }

    // 3. Try live translation dispatch
    const success = changeGoogleTranslate(langCode);
    if (!success) {
      setTimeout(() => {
        const retrySuccess = changeGoogleTranslate(langCode);
        if (!retrySuccess) {
          window.location.reload();
        }
      }, 300);
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  return (
    <div className="dropdown d-inline-flex align-items-center me-2 notranslate" style={{ position: 'relative', zIndex: 1050 }}>
      <button 
        className="btn btn-sm d-inline-flex align-items-center gap-2 rounded-pill px-3 py-1.5 lang-selector-btn notranslate shadow-sm"
        type="button" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
        title="Select Language"
        style={{ fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        <FaGlobe size={15} style={{ color: '#0ea5e9', flexShrink: 0 }} />
        <span className="notranslate d-inline-flex align-items-center gap-1">
          <span>{currentLangObj.flag}</span>
          <span className="fw-bold">{currentLangObj.name}</span>
        </span>
      </button>
      <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 py-2 notranslate" style={{ maxHeight: '320px', overflowY: 'auto', zIndex: 1060 }}>
        <li><h6 className="dropdown-header text-uppercase small fw-bold notranslate">Select Website Language</h6></li>
        {LANGUAGES.map((lang) => (
          <li key={lang.code} className="notranslate">
            <button
              onClick={() => handleLanguageChange(lang.code)}
              className={`dropdown-item d-flex align-items-center gap-2 py-1.5 px-3 small notranslate ${selectedLang === lang.code ? 'active fw-bold' : ''}`}
            >
              <span className="notranslate">{lang.flag}</span>
              <span className="notranslate">{lang.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageSelector;
