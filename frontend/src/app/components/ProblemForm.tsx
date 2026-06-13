import { useState } from 'react';
import { User, Problem } from '../App';
import { AlertCircle, Upload, X, Image as ImageIcon } from 'lucide-react';

interface ProblemFormProps {
  user: User;
  onSubmit: (problem: Omit<Problem, 'id' | 'createdAt' | 'status'>) => void;
}

export function ProblemForm({ user, onSubmit }: ProblemFormProps) {
  const [formData, setFormData] = useState({
    studentId: user.studentId || '',
    studentName: user.name,
    email: user.email,
    roomNumber: user.roomNumber || '',
    category: '',
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
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Convert to base64 for storage
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
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      studentId: user.studentId || '',
      studentName: user.name,
      email: user.email,
      roomNumber: user.roomNumber || '',
      category: '',
      description: '',
      image: ''
    });
    setImagePreview('');
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle className="size-6 text-orange-600" />
        <h2>Report a Problem</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="roomNumber" className="block mb-2 text-gray-700">
              Room Number <span className="text-red-500">*</span>
            </label>
            <input
              id="roomNumber"
              name="roomNumber"
              type="text"
              value={formData.roomNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              placeholder="e.g., A-205"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block mb-2 text-gray-700">
              Problem Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select category</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Furniture">Furniture</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Internet/WiFi">Internet/WiFi</option>
              <option value="Air Conditioning">Air Conditioning</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 text-gray-700">
            Problem Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            rows={5}
            placeholder="Please describe the problem in detail..."
            required
          />
        </div>

        <div>
          <label htmlFor="image" className="block mb-2 text-gray-700">
            Upload Image (Optional)
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
                className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 cursor-pointer transition-colors"
              >
                <Upload className="size-5 text-gray-400" />
                <div>
                  <span className="text-gray-600">Click to upload an image of the problem</span>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative border-2 border-gray-300 rounded-lg p-4">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="size-4" />
              </button>
              <div className="flex items-center gap-4">
                <ImageIcon className="size-8 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">Image uploaded successfully</p>
                  <p className="text-xs text-gray-500">Click the X to remove</p>
                </div>
              </div>
              <img
                src={imagePreview}
                alt="Problem preview"
                className="mt-4 max-h-64 rounded-lg object-contain w-full"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Submit Problem Report
          </button>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Note:</strong> Your problem will be assigned to the maintenance staff and they will work to resolve it as soon as possible.
          </p>
        </div>
      </form>
    </div>
  );
}