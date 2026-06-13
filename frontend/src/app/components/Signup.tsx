import { useState } from 'react';
import { Building2, UserPlus } from 'lucide-react';

interface SignupProps {
  onSignup: (
    email: string, 
    password: string, 
    name: string, 
    role: 'student' | 'admin' | 'staff',
    studentId?: string,
    department?: string,
    roomNumber?: string,
    isResidential?: boolean
  ) => void;
  onSwitchToLogin: () => void;
  error?: string;
}

export function Signup({ onSignup, onSwitchToLogin, error }: SignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'admin' | 'staff',
    studentId: '',
    department: '',
    roomNumber: '',
    isResidential: false
  });

  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.role === 'student' && !formData.studentId) {
      setValidationError('Student ID is required for students');
      return;
    }

    onSignup(
      formData.email, 
      formData.password, 
      formData.name, 
      formData.role,
      formData.role === 'student' ? formData.studentId : undefined,
      formData.role === 'student' ? formData.department : undefined,
      formData.role === 'student' ? formData.roomNumber : undefined,
      formData.role === 'student' ? formData.isResidential : undefined
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
    setValidationError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 my-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-full mb-4">
            <Building2 className="size-8 text-white" />
          </div>
          <h1 className="text-center">Student Hall Management</h1>
          <p className="text-gray-600 text-center mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block mb-2 text-gray-700 font-medium">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block mb-2 text-gray-700 font-medium">
              Account Type
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {formData.role === 'student' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Student Details</h3>
              <div>
                <label htmlFor="studentId" className="block mb-1 text-sm text-gray-600">
                  Student ID
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., STU-2024-001"
                  required={formData.role === 'student'}
                />
              </div>
              <div>
                <label htmlFor="department" className="block mb-1 text-sm text-gray-600">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="isResidential"
                  name="isResidential"
                  type="checkbox"
                  checked={formData.isResidential}
                  onChange={handleChange}
                  className="size-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isResidential" className="text-sm text-gray-600">
                  I am a residential student
                </label>
              </div>
              {formData.isResidential && (
                <div>
                  <label htmlFor="roomNumber" className="block mb-1 text-sm text-gray-600">
                    Room Number
                  </label>
                  <input
                    id="roomNumber"
                    name="roomNumber"
                    type="text"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="e.g., A-205"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block mb-2 text-gray-700 font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-2 text-gray-700 font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Confirm your password"
              required
            />
          </div>

          {(validationError || error) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{validationError || error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="size-5" />
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
