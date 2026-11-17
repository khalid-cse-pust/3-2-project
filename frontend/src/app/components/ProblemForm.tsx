import { useState } from 'react';
import { User, Problem } from '../App';
import { AlertCircle, Upload, X, Image as ImageIcon } from 'lucide-react';

interface ProblemFormProps {
  user?: User;
  onSubmit: (problem: Omit<Problem, 'id' | 'createdAt' | 'status'>) => void;
}

export function ProblemForm({ user, onSubmit }: ProblemFormProps) {
  const [formData, setFormData] = useState({
    studentId: user?.studentId || '',
    studentName: user?.name || '',
    email: user?.email || '',
    roomNumber: user?.roomNumber || 'B-224',
    category: 'Electrical',
    description: '',
    image: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({
          ...formData,
          image: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData({
      ...formData,
      image: ''
    });
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      studentId: user?.studentId || '',
      studentName: user?.name || '',
      email: user?.email || '',
      roomNumber: user?.roomNumber || 'B-224',
      category: 'Electrical',
      description: '',
      image: ''
    });
    setImagePreview('');
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm max-w-2xl text-xs">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
          <AlertCircle className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#16324F]">Report Maintenance Problem</h2>
          <p className="text-xs text-slate-500">Shadhinota Hall Repair & Maintenance Dispatch Service</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="roomNumber" className="block mb-1 font-semibold text-slate-700">
              Room Number <span className="text-red-500">*</span>
            </label>
            <input
              id="roomNumber"
              name="roomNumber"
              type="text"
              value={formData.roomNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#087E8B] outline-none"
              placeholder="e.g. B-224"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block mb-1 font-semibold text-slate-700">
              Problem Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-[#087E8B] outline-none"
              required
            >
              <option value="Electrical">Electrical (Fan, Light, Switch)</option>
              <option value="Plumbing">Plumbing (Tap, Basin, Shower)</option>
              <option value="Carpentry">Carpentry / Furniture (Bed, Door, Table)</option>
              <option value="Cleaning">Cleaning & Sanitation</option>
              <option value="Internet/Wi-Fi">Internet & Wi-Fi Connectivity</option>
              <option value="Security">Security & Door Locks</option>
              <option value="Other">Other Maintenance</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block mb-1 font-semibold text-slate-700">
            Problem Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#087E8B] outline-none"
            rows={4}
            placeholder="Please detail the location and exact nature of the defect..."
            required
          />
        </div>

        <div>
          <label htmlFor="image" className="block mb-1 font-semibold text-slate-700">
            Upload Image / Photo (Optional)
          </label>
          
          {!imagePreview ? (
            <div className="relative">
              <input
                id="image"
                type="file"
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              <label
                htmlFor="image"
                className="flex items-center gap-3 w-full px-4 py-3 border border-dashed border-slate-300 rounded-md hover:border-[#087E8B] cursor-pointer transition-colors bg-slate-50/50"
              >
                <Upload className="size-4 text-[#087E8B]" />
                <span className="text-slate-600">Click to attach photo of broken fixture (up to 5MB)</span>
              </label>
            </div>
          ) : (
            <div className="relative border border-slate-200 rounded-lg p-3 bg-slate-50">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
              >
                <X className="size-3.5" />
              </button>
              <div className="flex items-center gap-3">
                <ImageIcon className="size-6 text-[#087E8B]" />
                <span className="text-xs text-slate-700 font-medium">Image attached</span>
              </div>
              <img
                src={imagePreview}
                alt="Problem preview"
                className="mt-3 max-h-48 rounded object-contain"
              />
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2.5 bg-[#087E8B] hover:bg-[#066570] text-white font-semibold rounded-md shadow transition-colors cursor-pointer text-xs"
          >
            Submit Maintenance Ticket
          </button>
        </div>
      </form>
    </div>
  );
}
