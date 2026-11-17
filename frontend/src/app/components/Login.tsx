import { useState } from 'react';
import { Building2, Mail, Lock, KeyRound, ArrowRight, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { api } from '../../api';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onLoginSuccess?: (user: any) => void;
  onSwitchToSignup: () => void;
  error?: string;
}

export function Login({ onLogin, onLoginSuccess, onSwitchToSignup, error }: LoginProps) {
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  // Password login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP login state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [localError, setLocalError] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    onLogin(email.trim().toLowerCase(), password);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setOtpMessage('');

    if (!otpEmail.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/users/send-otp', { email: otpEmail.trim().toLowerCase() });
      setOtpMessage(res.message || '6-digit OTP code sent to your email.');
      setOtpStep('code');
      setOtpCode('');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setOtpMessage('');

    if (otpCode.trim().length !== 6) {
      setLocalError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/users/verify-otp', {
        email: otpEmail.trim().toLowerCase(),
        otp: otpCode.trim(),
      });

      if (!res.exists) {
        setLocalError('This email is not registered yet. Please create an account.');
        setTimeout(() => {
          onSwitchToSignup();
        }, 1500);
        return;
      }

      if (!res.isApproved) {
        setLocalError(res.message || 'Your account is pending approval from Staff or Admin.');
        return;
      }

      // Approved user -> log in immediately
      if (res.user && res.token) {
        const loggedInUser = {
          id: res.user._id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          studentId: res.user.studentId,
          department: res.user.department,
          roomNumber: res.user.roomNumber,
          phone: res.user.phone,
          isResidential: res.user.isResidential,
          isApproved: res.user.isApproved,
          token: res.token,
        };
        localStorage.setItem('hall_management_user', JSON.stringify(loggedInUser));
        if (onLoginSuccess) {
          onLoginSuccess(loggedInUser);
        } else {
          window.location.reload();
        }
      }
    } catch (err: any) {
      setLocalError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 border border-indigo-50">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-md mb-3">
            <Building2 className="size-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">Shadhinota Hall PUST</h1>
          <p className="text-gray-500 text-sm text-center mt-1">Student Hall Management System</p>
        </div>

        {/* Login Method Toggle */}
        <div className="flex border border-gray-200 rounded-lg p-1 mb-6 bg-gray-50">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('password');
              setLocalError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              loginMethod === 'password'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('otp');
              setLocalError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              loginMethod === 'otp'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email 6-Digit OTP
          </button>
        </div>

        {/* Error message */}
        {(localError || error) && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-relaxed">{localError || error}</p>
          </div>
        )}

        {/* OTP Success / Status message */}
        {otpMessage && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
            {otpMessage}
          </div>
        )}

        {/* Form 1: Password Login */}
        {loginMethod === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                  placeholder="Enter your registered email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow transition-all cursor-pointer"
            >
              Sign In
            </button>
          </form>
        )}

        {/* Form 2: Email OTP Login */}
        {loginMethod === 'otp' && (
          <div>
            {otpStep === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="otpEmail" className="block mb-1.5 text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      id="otpEmail"
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      placeholder="Enter your registered email"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    We will send a 6-digit OTP code to verify your identity.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send 6-Digit OTP
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit OTP code sent to <strong className="text-gray-800">{otpEmail}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setOtpStep('email')}
                    className="text-xs text-indigo-600 hover:underline mt-1"
                  >
                    Change email
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-3xl font-mono tracking-widest py-3 px-4 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="000000"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer switch to register */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-gray-600 text-sm">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline ml-1"
            >
              Register here
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
