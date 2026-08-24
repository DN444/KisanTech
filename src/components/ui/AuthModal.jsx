import React, { useState } from 'react';
import { X, Lock, Mail, Shield, LogOut, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, login, register, logout, updateProfile } = useAuth();
  const [mode, setMode] = useState('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [editingName, setEditingName] = useState(user?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = mode === 'register'
        ? await register(emailInput, passwordInput, usernameInput)
        : await login(emailInput, passwordInput);
      if (!result.success) {
        setError(result.error || 'Unable to continue.');
        return;
      }
      setPasswordInput('');
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const handleSaveName = () => {
    if (editingName.trim()) {
      updateProfile({ displayName: editingName.trim(), fullName: editingName.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-emerald-500/30 p-6 shadow-2xl bg-slate-950/90 space-y-5">
        
        {isAuthenticated && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {isAuthenticated ? 'Account' : mode === 'register' ? 'Create Account' : 'Sign In'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAuthenticated ? 'Your username is shown across KisanTech' : 'Use your Gmail address and a password you choose'}
            </p>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-emerald-500/20 flex items-center gap-4">
              <div className="relative">
                <img 
                  src={user.photoUrl} 
                  alt={user.displayName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[9px] text-black font-bold">
                  ✓
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="px-2 py-1 rounded bg-black/60 border border-emerald-500/40 text-xs text-white focus:outline-none"
                    />
                    <button 
                      onClick={handleSaveName}
                      className="px-2 py-1 bg-emerald-500 text-black text-[10px] font-bold rounded"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-100 truncate">{user.displayName}</h4>
                    <button 
                      onClick={() => { setEditingName(user.displayName); setIsEditing(true); }}
                      className="text-[10px] text-emerald-400 underline ml-2"
                    >
                      Edit
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Signed in
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { logout(); setMode('login'); setError(''); }}
              className="w-full h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center gap-2 text-xs font-bold text-rose-300 transition"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`h-9 rounded-xl text-xs font-bold border ${mode === 'login' ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/5 text-slate-300 border-white/10'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`h-9 rounded-xl text-xs font-bold border ${mode === 'register' ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/5 text-slate-300 border-white/10'}`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Username</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input 
                      type="text"
                      required
                      placeholder="Displayed on screen"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Gmail address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input 
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input 
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {error && (
                <p className="text-[11px] text-rose-400 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-extrabold text-xs transition"
              >
                {busy ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
