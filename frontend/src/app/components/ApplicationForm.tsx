import { useState } from 'react';
import { User, Application } from '../App';
import { FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface ApplicationFormProps {
  user?: User;
  onSubmit: (application: Omit<Application, 'id' | 'createdAt' | 'status'>) => void;
}

export function ApplicationForm({ user, onSubmit }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    studentId: user?.studentId || '',
    studentName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    program: user?.department || 'Computer Science & Engineering',
    year: '3rd Year',
    guardianName: '',
    guardianPhone: '',
    address: '',
    document: ''
  });

  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm max-w-3xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-lg bg-[#087E8B]/10 text-[#087E8B] flex items-center justify-center">
          <FileText className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#16324F]">Hall Seat Application Form</h2>
          <p className="text-xs text-slate-500">Pabna University of Science and Technology (PUST) • Shadhinota Hall</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="studentId" className="block mb-1 font-semibold text-slate-700">
              Student ID <span className="text-red-500">*</span>
            </label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#087E8B] focus:border-[#087E8B] outline-none"
              placeholder="e.g. 220133"
              required
            />
          </div>

          <div>
            <label htmlFor="studentName" className="block mb-1 font-semibold text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="studentName"
              name="studentName"
              type="text"
              value={formData.studentName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#087E8B] focus:border-[#087E8B] outline-none"
              placeholder="Full name as in university records"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-semibold text-slate-700">
              University / Personal Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#087E8B] focus:border-[#087E8B] outline-none"
              placeholder="student@gmail.com"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block mb-1 font-semibold text-slate-700">
              Mobile Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#087E8B] focus:border-[#087E8B] outline-none"
              placeholder="017xxxxxxxx"
              required
            />
          </div>

          <div>
            <label htmlFor="program" className="block mb-1 font-semibold text-slate-700">
              Department / Discipline <span className="text-red-500">*</span>
            </label>
            <select
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-[#087E8B] focus:border-[#087E8B] outline-none"
              required
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
              <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering (EEE)</option>
              <option value="Civil Engineering">Civil Engineering (CE)</option>
              <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
              <option value="Information & Communication Engineering">Information & Communication Engineering (ICE)</option>
              <option value="Architecture">Architecture</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Business Administration">Business Administration (BBA)</option>
              <option value="Economics">Economics</option>
            </select>
          </div>

          <div>
            <label htmlFor="year" className="block mb-1 font-semibold text-slate-700">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-[#087E8B] focus:border-[#087E8B] outline-none"
              required
            >
              <option value="1st Year">1st Year (Semester 1/2)</option>
              <option value="2nd Year">2nd Year (Semester 3/4)</option>
              <option value="3rd Year">3rd Year (Semester 5/6)</option>
              <option value="4th Year">4th Year (Semester 7/8)</option>
              <option value="Masters">Masters / Post-Graduate</option>
            </select>
          </div>

          <div>
            <label htmlFor="guardianName" className="block mb-1 font-semibold text-slate-700">
              Guardian's Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="guardianName"
              name="guardianName"
              type="text"
              value={formData.guardianName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#087E8B] focus:border-[#087E8B] outline-none"
              placeholder="e.g. Father/Mother/Guardian"
              required
            />
          </div>

          <div>
            <label htmlFor="guardianPhone" className="block mb-1 font-semibold text-slate-700">
              Guardian Emergency Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="guardianPhone"
              name="guardianPhone"
              type="tel"
              value={formData.guardianPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#087E8B] focus:border-[#087E8B] outline-none"
              placeholder="01xxxxxxxxx"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block mb-1 font-semibold text-slate-700">
            Permanent Address (Home District, Upazila, Post Code) <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#087E8B] focus:border-[#087E8B] outline-none"
            rows={2}
            placeholder="Village/Road, Post Office, Upazila, District"
            required
          />
        </div>

        <div>
          <label htmlFor="document" className="block mb-1 font-semibold text-slate-700">
            Upload Identification or Academic Slip (PDF, JPG, PNG)
          </label>
          <div className="relative">
            <input
              id="document"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label
              htmlFor="document"
              className="flex items-center gap-3 w-full px-4 py-3 border border-dashed border-slate-300 rounded-md hover:border-[#087E8B] cursor-pointer transition-colors bg-slate-50/50"
            >
              <Upload className="size-4 text-[#087E8B]" />
              <span className="text-slate-600">
                {fileName || 'Click to select university student ID card copy or grade transcript'}
              </span>
            </label>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-[#087E8B] hover:bg-[#066570] text-white font-semibold rounded-md shadow transition-colors cursor-pointer text-sm"
          >
            Submit Seat Allocation Application
          </button>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2 text-amber-900">
          <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Provost Verification:</strong> Once submitted, the administration checks your home district distance and academic CGPA, assigns your room (Block & Floor), and reserves your seat bed.
          </p>
        </div>
      </form>
    </div>
  );
}
