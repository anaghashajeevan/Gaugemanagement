import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../src/api/api';
import { useAuth } from '../context/AuthContext';
import {
  KeyRound,
  Info,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword, confirmPassword);
      setSuccess('Password changed successfully! Redirecting...');
      await refreshUser();
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(180deg, #f7f5fb 0%, #eef4f5 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div
            className="h-1.5"
            style={{
              background:
                'linear-gradient(90deg, #4338ca 0%, #7c3aed 25%, #a855f7 45%, #10b981 70%, #eab308 100%)',
            }}
          />

          <div className="p-8">
            <div className="mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
              >
                <KeyRound className="w-7 h-7" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
              <p className="text-sm text-gray-500 mt-1">Hi {user?.full_name}</p>
            </div>

            {user?.must_change_password && (
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm flex items-start gap-2">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                You must change your password before continuing.
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 text-white font-semibold rounded-xl transition disabled:opacity-60 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
                {!user?.must_change_password && (
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}