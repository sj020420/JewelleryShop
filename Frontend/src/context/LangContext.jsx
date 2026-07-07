import { createContext, useContext, useState } from 'react';
import en from '../i18n/en.json';
import mr from '../i18n/mr.json';

const dictionaries = { en, mr };
const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('sajLang') || 'en');

  function changeLang(next) {
    setLang(next);
    localStorage.setItem('sajLang', next);
  }

  function t(key) {
    return dictionaries[lang][key] || dictionaries.en[key] || key;
  }

  return (
    <LangContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
