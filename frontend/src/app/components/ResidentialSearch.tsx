import { useState } from 'react';
import { Search, Home, MapPin, User } from 'lucide-react';
import { api } from '../../api';

export function ResidentialSearch() {
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
      const student = await api.get(`/users/search/${searchId.trim()}`);
      setSearchResult(student);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchId('');
    setSearchResult(null);
    setSearched(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-6">
          <Search className="size-6 text-indigo-600" />
          <h2>Search Residential Status</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Enter a student ID to check if they are residential and view their room assignment.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Student ID</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g., STU-2024-001234"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-indigo-300"
              >
                <Search className="size-5" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {searched && !loading && (
        <div className="bg-white p-6 rounded-lg shadow">
          {searchResult ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <User className="size-8 text-indigo-600" />
                  <div>
                    <h3 className="text-xl">{searchResult.name}</h3>
                    <p className="text-gray-600">{searchResult.studentId}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleReset}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Clear Search
                </button>
              </div>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-1">Department</p>
                  <p className="text-lg">{searchResult.department}</p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-2">Residential Status</p>
                  {searchResult.isResidential ? (
                    <div className="flex items-center gap-2">
                      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg inline-flex items-center gap-2">
                        <Home className="size-5" />
                        <span className="text-lg">Residential</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg inline-flex items-center gap-2">
                        <Home className="size-5" />
                        <span className="text-lg">Non-Residential</span>
                      </div>
                    </div>
                  )}
                </div>

                {searchResult.isResidential && searchResult.roomNumber && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="size-6 text-indigo-700" />
                      <div>
                        <p className="text-sm text-indigo-700">Room Number</p>
                        <p className="text-2xl text-indigo-900">{searchResult.roomNumber}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="mb-2">No Student Found</h3>
              <p className="text-gray-600 mb-4">
                No student found with ID: <span className="font-mono">{searchId}</span>
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Try Another Search
              </button>
            </div>
          )}
        </div>
      )}

      {!searched && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="mb-3 flex items-center gap-2">
            <Search className="size-5 text-blue-700" />
            Note:
          </h3>
          <p className="text-sm text-gray-600">
            Search for registered students using their unique Student ID to verify their hall assignment and department details.
          </p>
        </div>
      )}
    </div>
  );
}
