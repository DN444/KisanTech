import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const ACCOUNTS_KEY = 'kisantech_accounts';
const SESSION_KEY = 'kisantech_auth_user';

const isGmailAddress = (email) => /^[^\s@]+@(gmail\.com|googlemail\.com)$/i.test(email);

const loadAccounts = () => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed loading accounts:', e);
    return [];
  }
};

const saveAccounts = (accounts) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

const randomSalt = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

const hashPassword = async (password, salt) => {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
};

const initialsAvatar = (name) => {
  const initials = (name || 'U')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect fill="#059669" width="128" height="128" rx="24"/><text x="50%" y="54%" text-anchor="middle" dy=".1em" fill="white" font-family="system-ui,sans-serif" font-size="48" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const toSessionUser = (account) => ({
  id: account.id,
  displayName: account.displayName,
  fullName: account.displayName,
  email: account.email,
  photoUrl: account.photoUrl || initialsAvatar(account.displayName),
  provider: 'Email',
  role: 'Farmer',
  title: 'Farmer',
  badge: 'Farmer',
  subscriptionTier: 'Standard',
  farmLocation: account.farmLocation || 'Tamil Nadu, India',
  farmSize: account.farmSize || '10.0 Acres',
  cropPrimary: account.cropPrimary || 'Paddy (Rice)',
  aiTokens: '100,000 / 100,000',
  lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  online: true
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem(SESSION_KEY);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      if (!parsed?.email || !parsed?.displayName) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return parsed;
    } catch (e) {
      console.warn('Failed loading cached auth user:', e);
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!user);
  const [showAuthModal, setShowAuthModal] = useState(() => !user);

  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else if (!isAuthenticated) {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user, isAuthenticated]);

  const applySession = (account) => {
    const session = toSessionUser(account);
    setUser(session);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  };

  const register = async (email, password, displayName) => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedName = (displayName || '').trim();
    if (!isGmailAddress(trimmedEmail) || !password || !trimmedName) {
      return { success: false, error: 'Enter a username, Gmail address, and password.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const accounts = loadAccounts();
    if (accounts.some((account) => account.email === trimmedEmail)) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const salt = randomSalt();
    const passwordHash = await hashPassword(password, salt);
    const account = {
      id: `usr_${Date.now()}`,
      email: trimmedEmail,
      displayName: trimmedName,
      passwordHash,
      salt,
      photoUrl: initialsAvatar(trimmedName)
    };
    saveAccounts([...accounts, account]);
    return applySession(account);
  };

  const login = async (email, password) => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!isGmailAddress(trimmedEmail) || !password) {
      return { success: false, error: 'Enter your Gmail address and password.' };
    }

    const accounts = loadAccounts();
    const account = accounts.find((item) => item.email === trimmedEmail);
    if (!account) {
      return { success: false, error: 'No account found for this email. Create an account first.' };
    }

    const passwordHash = await hashPassword(password, account.salt);
    if (passwordHash !== account.passwordHash) {
      return { success: false, error: 'Incorrect password.' };
    }

    return applySession(account);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(SESSION_KEY);
    setShowAuthModal(true);
  };

  const updateProfile = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextName = (updates.displayName || updates.fullName || prev.displayName).trim();
      const next = {
        ...prev,
        ...updates,
        displayName: nextName,
        fullName: nextName,
        photoUrl: updates.photoUrl || initialsAvatar(nextName)
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));

      const accounts = loadAccounts().map((account) =>
        account.email === prev.email
          ? { ...account, displayName: nextName, photoUrl: next.photoUrl }
          : account
      );
      saveAccounts(accounts);
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      showAuthModal,
      setShowAuthModal,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
