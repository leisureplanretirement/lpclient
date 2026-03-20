import { createContext, useContext } from 'react';

export const ColorModeContext = createContext({
  mode: 'dark',
  setMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);
