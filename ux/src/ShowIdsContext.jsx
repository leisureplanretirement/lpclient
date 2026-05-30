import { createContext, useContext } from 'react';

export const ShowIdsContext = createContext({
  showIds: false,
  setShowIds: () => {},
});

export const useShowIds = () => useContext(ShowIdsContext);
