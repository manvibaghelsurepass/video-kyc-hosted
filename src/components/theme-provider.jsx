// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { setModeTheme } from '../slices/appSlice';

// const ThemeProviderContext = createContext();
// export default function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'vite-ui-theme', ...props }) {
//   const dispatch = useDispatch()
//   // const [theme, setTheme] = useState('light');
//   const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) || defaultTheme);
//   useEffect(() => {
//     const root = document.documentElement;
//     root.classList.remove('light', 'dark');

//     if (theme === 'system') {
//       const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
//       root.classList.add(systemTheme);
//       return;
//     }

//     root.classList.add(theme);
//   }, [theme]);


//   const value = {
//     theme,
//     setTheme: (theme) => {
//       localStorage.setItem(storageKey, theme);
//       setTheme(theme);
//     },
//   };

//   return (
//     <ThemeProviderContext.Provider {...props} value={value}>
//       {children}
//     </ThemeProviderContext.Provider>
//   );
// }

// export const useTheme = () => {
//   const context = useContext(ThemeProviderContext);

//   if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

//   return context;
// };


import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setModeTheme } from '../slices/appSlice'; // Import the action

const ThemeProviderContext = createContext();

export default function ThemeProvider({ children, defaultTheme = 'light', storageKey = 'vite-ui-theme', ...props }) {
  const dispatch = useDispatch();
  
  // Get the initial theme from localStorage or use default
  const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) || defaultTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      dispatch(setModeTheme(systemTheme)); // Update Redux with system theme
      return;
    }

    root.classList.add(theme);
    dispatch(setModeTheme(theme)); // Update Redux with selected theme
  }, [theme, dispatch]); // Include dispatch as dependency

  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);  // Update local state
      dispatch(setModeTheme(newTheme));  // Dispatch action to update Redux
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
