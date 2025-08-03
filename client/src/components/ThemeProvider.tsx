
import { createContext, useContext, type ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light' });

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  theme: 'light' | 'dark';
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
