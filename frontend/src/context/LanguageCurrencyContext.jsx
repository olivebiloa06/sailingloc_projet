import { createContext, useContext, useState } from "react";

const RATES = { EUR: 1, USD: 1.08, GBP: 0.86, CHF: 0.96, CAD: 1.47 };

export const CURRENCIES = [
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "USD", symbol: "$", label: "Dollar américain" },
  { code: "GBP", symbol: "£", label: "Livre sterling" },
  { code: "CHF", symbol: "CHF", label: "Franc suisse" },
  { code: "CAD", symbol: "CA$", label: "Dollar canadien" },
];

export const LANGUAGES = [
  { code: "FR", flag: "🇫🇷", label: "Français" },
  { code: "EN", flag: "🇬🇧", label: "English" },
];

const LanguageCurrencyContext = createContext(null);

export function LanguageCurrencyProvider({ children }) {
  const load = () => {
    try { return JSON.parse(localStorage.getItem("sl_prefs") || "{}"); }
    catch { return {}; }
  };

  const [language, setLanguage] = useState(load().language || "FR");
  const [currency, setCurrency] = useState(load().currency || "EUR");

  const save = (lang, curr) =>
    localStorage.setItem("sl_prefs", JSON.stringify({ language: lang, currency: curr }));

  // Changement de langue → sauvegarde + rechargement complet de la page
  // pour que tous les composants relisent la nouvelle langue depuis localStorage.
  const changeLanguage = (lang) => {
    save(lang, currency);
    window.location.reload();
  };

  // Changement de devise → React re-render suffit, pas besoin de recharger.
  const changeCurrency = (curr) => {
    setCurrency(curr);
    save(language, curr);
  };

  // Convertit un prix en euros vers la devise choisie.
  const formatPrice = (euroAmount) => {
    if (euroAmount == null) return "";
    const c = CURRENCIES.find((x) => x.code === currency);
    const converted = Math.round(euroAmount * RATES[currency]);
    return `${converted} ${c?.symbol || "€"}`;
  };

  return (
    <LanguageCurrencyContext.Provider value={{
      language, currency, changeLanguage, changeCurrency,
      formatPrice, CURRENCIES, LANGUAGES,
    }}>
      {children}
    </LanguageCurrencyContext.Provider>
  );
}

export function useLanguageCurrency() {
  return useContext(LanguageCurrencyContext);
}
