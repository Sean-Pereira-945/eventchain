import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_THEME, THEMES } from '../utils/constants';
import { storage } from '../utils/storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => storage.get('theme', DEFAULT_THEME));

  useEffect(() => {
    if (!THEMES.includes(theme)) {
      setTheme(DEFAULT_THEME);
      return;
    }
    storage.set('theme', theme);
    document.body.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
      setTheme
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
