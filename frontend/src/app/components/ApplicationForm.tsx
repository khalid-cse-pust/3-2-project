import { useState } from 'react';
import { User, Application } from '../App';
import { FileText, Upload } from 'lucide-react';

interface ApplicationFormProps {
  user: User;
  onSubmit: (application: Omit<Application, 'id' | 'createdAt' | 'status'>) => void;
}

export function ApplicationForm({ user, onSubmit }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: user.name,
    email: user.email,
    phone: '',
    program: '',
    year: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    document: ''
  });

  const [fileName, setFileName] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFormData({
        ...formData,
        document: file.name
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      studentId: '',
      studentName: user.name,
      email: user.email,
      phone: '',
      program: '',
      year: '',
      guardianName: '',
      guardianPhone: '',
      address: '',
      document: ''
    });
    setFileName('');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="size-6 text-indigo-600" />
        <h2>Hall Seat Application Form</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="studentId" className="block mb-2 text-gray-700">
              Student ID <span className="text-red-500">*</span>
            </label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter your student ID"
              required
            />
          </div>

          <div>
            <label htmlFor="studentName" className="block mb-2 text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="studentName"
              name="studentName"
              type="text"
              value={formData.studentName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 text-gray-700">
              Email Address <span className="text-red-500">*</span>
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
            <label htmlFor="phone" className="block mb-2 text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div>
            <label htmlFor="program" className="block mb-2 text-gray-700">
              Program/Department <span className="text-red-500">*</span>
            </label>
            <select
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select program</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Engineering">Engineering</option>
              <option value="Medicine">Medicine</option>
              <option value="Law">Law</option>
              <option value="Arts">Arts</option>
              <option value="Science">Science</option>
            </select>
          </div>

          <div>
            <label htmlFor="year" className="block mb-2 text-gray-700">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
            </select>
          </div>

          <div>
            <label htmlFor="guardianName" className="block mb-2 text-gray-700">
              Guardian Name <span className="text-red-500">*</span>
            </label>
            <input
              id="guardianName"
              name="guardianName"
              type="text"
              value={formData.guardianName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter guardian's name"
              required
            />
          </div>

          <div>
            <label htmlFor="guardianPhone" className="block mb-2 text-gray-700">
              Guardian Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="guardianPhone"
              name="guardianPhone"
              type="tel"
              value={formData.guardianPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter guardian's phone"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block mb-2 text-gray-700">
            Permanent Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            rows={3}
            placeholder="Enter your permanent address"
            required
          />
        </div>

        <div>
          <label htmlFor="document" className="block mb-2 text-gray-700">
            Upload Document (ID Card/Admission Letter) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="document"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
            <label
              htmlFor="document"
              className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 cursor-pointer transition-colors"
            >
              <Upload className="size-5 text-gray-400" />
              <span className="text-gray-600">
                {fileName || 'Click to upload file (PDF, JPG, PNG)'}
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Submit Application
          </button>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Please ensure all information is accurate. Your application will be reviewed by the admin team within 3-5 business days.
          </p>
        </div>
      </form>
    </div>
  );
}
