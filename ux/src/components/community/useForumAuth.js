import { useCallback, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchProfile } from '../../api';

// Shared auth helpers for the community pages:
// - getToken(): access token when logged in, undefined otherwise (reading works logged out)
// - requireAuth(): true when logged in; otherwise opens the gentle login prompt and returns false
// - myUserId: the current member's profile userId, used to decide where "Delete" appears
export default function useForumAuth() {
  const { isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect } = useAuth0();
  const [myUserId, setMyUserId] = useState(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const getToken = useCallback(async () => {
    if (!isAuthenticated) return undefined;
    try {
      return await getAccessTokenSilently();
    } catch {
      return undefined;
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const profile = await fetchProfile(token);
        if (!cancelled) setMyUserId(profile?.userId ?? null);
      } catch {
        // No profile yet (or offline): simply don't show delete buttons.
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, getAccessTokenSilently]);

  const requireAuth = useCallback(() => {
    if (isAuthenticated) return true;
    setLoginPromptOpen(true);
    return false;
  }, [isAuthenticated]);

  const login = useCallback(() => {
    loginWithRedirect({ appState: { returnTo: window.location.pathname } });
  }, [loginWithRedirect]);

  return {
    isAuthenticated,
    authLoading: isLoading,
    getToken,
    requireAuth,
    myUserId: isAuthenticated ? myUserId : null,
    loginPromptOpen,
    closeLoginPrompt: () => setLoginPromptOpen(false),
    login,
  };
}
