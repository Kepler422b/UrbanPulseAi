import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';
import {
  User,
  Shield,
  KeyRound,
  RotateCcw,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Lock,
  Database,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setIsChangingPass(true);
    try {
      await api.changePassword({ current_password: currentPassword, new_password: newPassword });
      setPasswordMsg({ type: 'success', text: 'Password has been updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm('Are you sure you want to reset all records back to default demo state?')) return;
    setIsResetting(true);
    setResetSuccess(null);
    try {
      const res = await api.resetDemoData();
      setResetSuccess(res.message);
    } catch (err: any) {
      alert(err.message || 'Failed to reset demo data');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-100">Account & Platform Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your profile, change security credentials, and inspect prototype configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Card (6 cols) */}
        <div className="md:col-span-6 p-6 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Profile Identity</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400">Full Name</span>
              <p className="font-semibold text-slate-100 text-sm mt-0.5">{user?.name || 'User'}</p>
            </div>

            <div>
              <span className="text-slate-400">Email Address</span>
              <p className="font-mono text-slate-200 text-sm mt-0.5">{user?.email || 'N/A'}</p>
            </div>

            <div>
              <span className="text-slate-400">Role Privilege</span>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 capitalize">
                  <Shield className="w-3 h-3" />
                  {user?.role}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400">Account Created</span>
              <p className="text-slate-300 mt-0.5 font-mono">{formatDate(user?.created_at)}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Session</span>
            </button>
          </div>
        </div>

        {/* Change Password Card (6 cols) */}
        <div className="md:col-span-6 p-6 rounded-2xl bg-[#101F33] border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <span>Security Credentials</span>
          </h2>

          {passwordMsg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {passwordMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">New Password (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full py-2.5 rounded-lg text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors disabled:opacity-50 mt-1"
            >
              {isChangingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Admin Demo Reset Tool (Full width if admin) */}
        {isAdmin && (
          <div className="md:col-span-12 p-6 rounded-2xl bg-[#101F33] border border-amber-500/30 space-y-3 shadow-xl">
            <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Academic Prototype Management (Development Tool)</span>
            </h2>

            <p className="text-xs text-slate-300">
              Reset the database back to standard sample records for Mira-Bhayandar. Useful when re-running test presentations or verifying fresh AI pattern detection.
            </p>

            {resetSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                {resetSuccess}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleResetDemoData}
                disabled={isResetting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Re-seeding...' : 'Reset Demo Data to Factory Baseline'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
