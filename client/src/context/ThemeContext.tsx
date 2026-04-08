import React, { createContext, useContext, useEffect, useState } from 'react';

interface Theme {
  name: 'light' | 'dark' | 'blue' | 'green';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeName: 'light' | 'dark' | 'blue' | 'green') => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes = {
  light: { name: 'light' as const, colors: { primary: '#ffffff', secondary: '#f0f0f0', accent: '#25D366' } },
  dark: { name: 'dark' as const, colors: { primary: '#0a0e27', secondary: '#1a1f3a', accent: '#25D366' } },
  blue: { name: 'blue' as const, colors: { primary: '#e3f2fd', secondary: '#bbdefb', accent: '#2196f3' } },
  green: { name: 'green' as const, colors: { primary: '#e8f5e9', secondary: '#c8e6c9', accent: '#25D366' } },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(themes.light);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const newTheme = themes[savedTheme as keyof typeof themes] || themes.light;
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme.name);
    // Apply dark class for Tailwind dark mode
    if (newTheme.name === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setTheme = (themeName: 'light' | 'dark' | 'blue' | 'green') => {
    const newTheme = themes[themeName];
    setThemeState(newTheme);
    localStorage.setItem('theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);
    // Apply dark class for Tailwind dark mode
    if (themeName === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDarkMode: theme.name === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
