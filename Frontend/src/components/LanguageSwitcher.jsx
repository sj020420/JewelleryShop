import { useLang } from '../context/LangContext';

export default function LanguageSwitcher() {
  const { lang, changeLang } = useLang();
  return (
    <div className="flex items-center rounded-full border border-gold/40 overflow-hidden text-xs font-medium">
      <button
        onClick={() => changeLang('en')}
        className={`px-3 py-1 transition-colors ${lang === 'en' ? 'bg-ink text-gold' : 'text-ink/70 hover:text-ink'}`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => changeLang('mr')}
        className={`px-3 py-1 transition-colors font-serif ${lang === 'mr' ? 'bg-ink text-gold' : 'text-ink/70 hover:text-ink'}`}
        aria-pressed={lang === 'mr'}
      >
        मर
      </button>
    </div>
  );
}
