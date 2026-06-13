import { useState } from 'react';
import { Search, Home, MapPin, User, X } from 'lucide-react';
import { api } from '../../api';

interface StudentSearchBarProps {
  token?: string;
}

export function StudentSearchBar({ token }: StudentSearchBarProps) {
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<{
    studentId: string;
    name: string;
    isResidential: boolean;
    roomNumber: string | null;
    department: string;
  } | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setLoading(true);
    
    try {
      const student = await api.get(`/users/search/${searchId.trim()}`, token);
      setSearchResult(student);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchId('');
    setSearchResult(null);
    setSearched(false);
  };

  return (
    <div className="mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-3">
          <Search className="size-5 text-purple-600" />
          <h3>Search Student</h3>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Student ID (e.g., STU-2024-001234)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          {searched && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="size-5" />
            </button>
          )}
        </form>
      </div>

      {searched && !loading && searchResult && (
        <div className="mt-4 bg-white p-6 rounded-lg shadow border-2 border-purple-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="size-8 text-purple-600" />
              <div>
                <h3 className="text-xl">{searchResult.name}</h3>
                <p className="text-gray-600">{searchResult.studentId}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-32">Department:</span>
              <span>{searchResult.department}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-32">Status:</span>
              {searchResult.isResidential ? (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded inline-flex items-center gap-2">
                  <Home className="size-4" />
                  <span>Residential</span>
                </div>
              ) : (
                <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded inline-flex items-center gap-2">
                  <Home className="size-4" />
                  <span>Non-Residential</span>
                </div>
              )}
            </div>

            {searchResult.isResidential && searchResult.roomNumber && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-32">Room Number:</span>
                <div className="px-3 py-1 bg-purple-100 text-purple-900 rounded inline-flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span className="text-lg">{searchResult.roomNumber}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {searched && !searchResult && (
        <div className="mt-4 bg-red-50 border border-red-200 p-6 rounded-lg text-center">
          <Search className="size-12 text-red-400 mx-auto mb-3" />
          <h3 className="mb-2 text-red-900">No Student Found</h3>
          <p className="text-red-700">
            No student found with ID: <span className="font-mono">{searchId}</span>
          </p>
        </div>
      )}
    </div>
  );
}
