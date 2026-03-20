import { createContext, useContext } from 'react';

export const ImpersonationContext = createContext({
  isAdmin: false,
  isImpersonating: false,
  impersonateSubject: '',
  setImpersonation: () => {},
});

export const useImpersonation = () => useContext(ImpersonationContext);
