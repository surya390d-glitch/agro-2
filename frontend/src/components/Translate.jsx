import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const cache = {};

export default function Translate({ text, className, style }) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (!text) return;
    if (language === 'en') {
      setTranslated(text);
      return;
    }

    const key = `${language}_${text}`;
    if (cache[key]) {
      setTranslated(cache[key]);
      return;
    }

    const fetchTranslation = async () => {
      try {
        const res = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
          params: { client: 'gtx', sl: 'en', tl: language, dt: 't', q: text }
        });
        const result = res.data[0].map(x => x[0]).join('');
        cache[key] = result;
        setTranslated(result);
      } catch (err) {
        setTranslated(text); // fallback
      }
    };

    fetchTranslation();
  }, [text, language]);

  return <span className={className} style={style}>{translated}</span>;
}
