import { useEffect, useRef, useState } from "react";
import { useLanguageCurrency } from "../context/LanguageCurrencyContext";

export default function LanguageCurrencyPicker() {
  const { language, currency, changeLanguage, changeCurrency, CURRENCIES, LANGUAGES } =
    useLanguageCurrency();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("langue"); // "langue" | "devise"
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language);
  const currentCurr = CURRENCIES.find((c) => c.code === currency);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-navy hover:text-navy"
      >
        <span>{currentLang?.flag}</span>
        <span>{currentCurr?.symbol}</span>
        <svg
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white shadow-xl">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {["langue", "devise"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-semibold capitalize transition ${
                  tab === t
                    ? "border-b-2 border-navy text-navy"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t === "langue" ? "Langue" : "Devise"}
              </button>
            ))}
          </div>

          <div className="p-2">
            {tab === "langue" &&
              LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => { changeLanguage(lang.code); setOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    language === lang.code
                      ? "bg-cloud font-semibold text-navy"
                      : "text-gray-600 hover:bg-cloud"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {language === lang.code && (
                    <svg viewBox="0 0 20 20" className="ml-auto h-4 w-4 text-sky" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}

            {tab === "devise" &&
              CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => { changeCurrency(curr.code); setOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    currency === curr.code
                      ? "bg-cloud font-semibold text-navy"
                      : "text-gray-600 hover:bg-cloud"
                  }`}
                >
                  <span className="w-8 font-mono text-base font-bold text-navy">
                    {curr.symbol}
                  </span>
                  <span>{curr.label}</span>
                  {currency === curr.code && (
                    <svg viewBox="0 0 20 20" className="ml-auto h-4 w-4 text-sky" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
