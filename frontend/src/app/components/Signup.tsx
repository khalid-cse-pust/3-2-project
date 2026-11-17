import { useState, useEffect } from 'react';
import { Building2, UserPlus, Mail, KeyRound, CheckCircle2, Clock, ArrowRight, Phone, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../api';

interface SignupProps {
  onSignup: (
    email: string, 
    password: string, 
    name: string, 
    role: 'student' | 'admin' | 'staff',
    studentId?: string,
    department?: string,
    roomNumber?: string,
    isResidential?: boolean,
    phone?: string
  ) => Promise<{ success: boolean; message?: string; isPending?: boolean } | void>;
  onLoginSuccess?: (user: any) => void;
  onSwitchToLogin: () => void;
  error?: string;
}

export function Signup({ onSignup, onLoginSuccess, onSwitchToLogin, error }: SignupProps) {
  const [step, setStep] = useState<'email' | 'otp' | 'details' | 'submitted' | 'pending_existing'>('email');
  
  // Step 1: Email
  const [email, setEmail] = useState('');
  
  // Step 2: OTP
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Step 3: Registration Details & Create Password
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'admin' | 'staff',
    studentId: '',
    department: '',
    roomNumber: '',
    phone: '',
    isResidential: false,
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [existingUserRole, setExistingUserRole] = useState<string>('student');

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setStatusMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/users/send-otp', { email: cleanEmail });
      setStatusMessage(res.message || '6-digit OTP code sent to your email.');
      setStep('otp');
      setTimer(60);
      setCanResend(false);
      setOtp('');
    } catch (err: any) {
      setValidationError(err.message || 'Failed to send OTP. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setStatusMessage('');

    if (otp.trim().length !== 6) {
      setValidationError('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/users/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      // If user ALREADY registered
      if (res.exists) {
        if (!res.isApproved) {
          // User exists but pending approval
          setExistingUserRole(res.role || 'student');
          setStep('pending_existing');
          return;
        }

        // User is registered and approved -> Go to home page directly!
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
          return;
        }
      }

      // If NOT registered -> proceed to create password & profile details
      setStep('details');
      setStatusMessage('OTP verified! Now create your password and set up your profile.');
    } catch (err: any) {
      setValidationError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setValidationError('');
    setStatusMessage('');
    setLoading(true);
    try {
      const res = await api.post('/users/send-otp', { email: email.trim().toLowerCase() });
      setStatusMessage(res.message || 'New OTP sent to your email.');
      setTimer(60);
      setCanResend(false);
      setOtp('');
    } catch (err: any) {
      setValidationError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 3: Create Password & Complete Registration
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setStatusMessage('');

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.role === 'student' && !formData.studentId.trim()) {
      setValidationError('Student ID is required for students');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        studentId: formData.role === 'student' ? formData.studentId.trim() : undefined,
        department: formData.department.trim(),
        roomNumber: formData.roomNumber.trim(),
        phone: formData.phone.trim(),
        isResidential: formData.isResidential,
      };

      const result = await api.post('/users', payload);

      if (result.isApproved && result.token) {
        // Auto-login if approved (e.g. admin)
        const user = {
          id: result._id,
          name: result.name,
          email: result.email,
          role: result.role,
          token: result.token,
          studentId: result.studentId,
          department: result.department,
          roomNumber: result.roomNumber,
          phone: result.phone,
          isResidential: result.isResidential,
        };
        localStorage.setItem('hall_management_user', JSON.stringify(user));
        if (onLoginSuccess) {
          onLoginSuccess(user);
        } else {
          window.location.reload();
        }
      } else {
        // Pending approval (Student needs Staff/Admin approval, Staff needs Admin approval)
        setStep('submitted');
      }
    } catch (err: any) {
      setValidationError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
    setValidationError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-8 my-8 border border-indigo-50">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-md mb-3">
            <Building2 className="size-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">Shadhinota Hall PUST</h1>
          <p className="text-gray-500 text-sm text-center mt-1">Student Hall Management System</p>
          
          {/* Progress Indicator */}
          {step !== 'submitted' && step !== 'pending_existing' && (
            <div className="flex items-center gap-2 mt-4">
              <span className={`size-2.5 rounded-full ${step === 'email' ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-indigo-400'}`} />
              <span className={`w-8 h-0.5 ${step === 'otp' || step === 'details' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              <span className={`size-2.5 rounded-full ${step === 'otp' ? 'bg-indigo-600 ring-4 ring-indigo-100' : (step === 'details' ? 'bg-indigo-400' : 'bg-gray-200')}`} />
              <span className={`w-8 h-0.5 ${step === 'details' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              <span className={`size-2.5 rounded-full ${step === 'details' ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-gray-200'}`} />
            </div>
          )}
        </div>

        {/* Global Error Banner */}
        {(validationError || error) && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-relaxed">{validationError || error}</p>
          </div>
        )}

        {/* Global Success Status Banner */}
        {statusMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="size-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700 leading-relaxed">{statusMessage}</p>
          </div>
        )}

        {/* STEP 1: Enter Email & Send 6-Digit OTP */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <div className="text-center mb-5">
                <h2 className="text-lg font-semibold text-gray-800">Email Verification</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your email address to receive a 6-digit verification code.
                </p>
              </div>

              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setValidationError('');
                  }}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800 transition-all placeholder:text-gray-400"
                  placeholder="e.g., student@gmail.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="size-5 animate-spin" />
                  Sending 6-Digit OTP...
                </>
              ) : (
                <>
                  Send 6-Digit OTP
                  <ArrowRight className="size-5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter 6-Digit OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <div className="inline-flex p-3 bg-indigo-50 rounded-full mb-3 text-indigo-600">
                <KeyRound className="size-6" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Enter 6-Digit OTP</h2>
              <p className="text-sm text-gray-500 mt-1">
                We sent a 6-digit code to <strong className="text-gray-700">{email}</strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setValidationError('');
                  setStatusMessage('');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline mt-1 inline-block"
              >
                Change email
              </button>
            </div>

            <div>
              <input
                id="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setOtp(val);
                  setValidationError('');
                }}
                className="w-full text-center text-3xl font-mono tracking-widest py-3 px-4 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 placeholder:tracking-widest"
                placeholder="000000"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Valid for 10 minutes. Enter the exact 6 numbers from your email.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="size-5 animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>

            {/* Resend Code Section */}
            <div className="text-center pt-2 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1">
                <Clock className="size-4" />
                {canResend ? 'Did not receive code?' : `Resend in ${timer}s`}
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || loading}
                className="text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Create Password & Complete Registration */}
        {step === 'details' && (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Create Password & Profile</h2>
              <p className="text-sm text-gray-500">
                Email <span className="font-semibold text-emerald-700">{email}</span> verified! Fill out the details below.
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block mb-1 text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., 01700000000"
                  required
                />
              </div>
            </div>

            {/* Account Type */}
            <div>
              <label htmlFor="role" className="block mb-1 text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                required
              >
                <option value="student">Student (Requires Staff/Admin Approval)</option>
                <option value="staff">Staff (Requires Admin Approval)</option>
              </select>
            </div>

            {/* Student Specific Fields */}
            {formData.role === 'student' && (
              <div className="space-y-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Student Details</h3>
                
                <div>
                  <label htmlFor="studentId" className="block mb-1 text-xs font-medium text-gray-700">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                    placeholder="e.g., 220133"
                    required={formData.role === 'student'}
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block mb-1 text-xs font-medium text-gray-700">
                    Department
                  </label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                    placeholder="e.g., Computer Science & Engineering"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="isResidential"
                    name="isResidential"
                    type="checkbox"
                    checked={formData.isResidential}
                    onChange={handleInputChange}
                    className="size-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="isResidential" className="text-xs text-gray-700 cursor-pointer">
                    Applying for residency in Shadhinota Hall
                  </label>
                </div>

                <div>
                  <label htmlFor="roomNumber" className="block mb-1 text-xs font-medium text-gray-700">
                    Preferred / Requested Room (Optional)
                  </label>
                  <input
                    id="roomNumber"
                    name="roomNumber"
                    type="text"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                    placeholder="e.g., B-224 (will be confirmed on approval)"
                  />
                </div>
              </div>
            )}

            {/* Staff Specific Fields */}
            {formData.role === 'staff' && (
              <div className="space-y-3 p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">Staff Details</h3>
                <div>
                  <label htmlFor="department" className="block mb-1 text-xs font-medium text-gray-700">
                    Designation / Department
                  </label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                    placeholder="e.g., Hall Maintenance / Office Staff"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
                Create Password (min. 6 characters)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Enter a secure password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Re-type your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow transition-all disabled:opacity-60 cursor-pointer mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="size-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="size-5" />
                  Complete Registration
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP: Submitted Successfully & Pending Approval */}
        {step === 'submitted' && (
          <div className="text-center py-4 space-y-4">
            <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-full">
              <CheckCircle2 className="size-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Registration Submitted!</h2>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-sm space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-900">
                <Clock className="size-4" />
                <span>Approval Required Before Login</span>
              </div>
              {formData.role === 'student' ? (
                <p className="text-amber-800 leading-relaxed">
                  Your student account has been registered and is pending approval from <strong>Hall Staff or Admin</strong>.
                  Once approved, you will receive an email confirmation with your room number:
                  <br />
                  <em className="block mt-2 p-2 bg-white rounded border border-amber-200 text-xs text-amber-900">
                    &ldquo;Congratulation, you are a member of shwadhinota hall, you room number is .., now you canlogin.&rdquo;
                  </em>
                </p>
              ) : (
                <p className="text-amber-800 leading-relaxed">
                  Your staff account has been registered and is pending approval from <strong>Admin</strong>.
                  Once approved, an email notification will be sent to your registered email address.
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Registered email: <strong className="text-gray-700">{email}</strong>
            </p>

            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* STEP: Existing Account But Pending Approval */}
        {step === 'pending_existing' && (
          <div className="text-center py-4 space-y-4">
            <div className="inline-flex p-4 bg-amber-100 text-amber-600 rounded-full">
              <Clock className="size-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Account Pending Approval</h2>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-sm space-y-2">
              <p className="text-amber-800 leading-relaxed">
                Your email <strong className="text-gray-900">{email}</strong> is already registered, but your account is currently pending approval.
              </p>
              {existingUserRole === 'student' ? (
                <p className="text-amber-800 leading-relaxed">
                  Student accounts require approval from <strong>Hall Staff or Admin</strong>. You will receive an email notification as soon as your account is approved and room is allocated.
                </p>
              ) : (
                <p className="text-amber-800 leading-relaxed">
                  Staff accounts require approval from <strong>Admin</strong>. You will receive an email notification once approved.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setEmail('');
                  setOtp('');
                }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
              >
                Try Another Email
              </button>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* Footer switch to login */}
        {step !== 'submitted' && step !== 'pending_existing' && (
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              Already have an approved account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline ml-1"
              >
                Sign in here
              </button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
