import { Building2, CheckCircle, FileText, Wrench, ArrowRight, BookOpen, Church, Utensils, Tv, Car, Bell, Calendar, AlertCircle } from 'lucide-react';
import hallImage from 'figma:asset/ad42a419c000cbb4adc47835d60b312d1e6bcd3f.png';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hallImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/75 via-indigo-900/60 to-indigo-900/50"></div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <header className="p-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Building2 className="size-8" />
              </div>
              <div>
                <h2 className="text-white">Hall Management</h2>
                <p className="text-sm text-indigo-200">Student Housing System</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl text-white mb-4">
                Welcome to Student Hall Management
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 mb-2 max-w-2xl mx-auto">
                Your one-stop solution for hall seat applications, problem reporting, and seamless communication with administration
              </p>
            </div>
          </div>

          {/* Hall Facilities - On Hero Image */}
          <div className="px-6 pb-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {/* Reading Room */}
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-amber-500 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <BookOpen className="size-6 text-white" />
                    </div>
                    <h4 className="text-sm text-amber-900">Reading Room</h4>
                  </div>
                </div>

                {/* Prayer Room */}
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Church className="size-6 text-white" />
                    </div>
                    <h4 className="text-sm text-green-900">Prayer Room</h4>
                  </div>
                </div>

                {/* Hall Dining */}
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Utensils className="size-6 text-white" />
                    </div>
                    <h4 className="text-sm text-orange-900">Hall Dining</h4>
                  </div>
                </div>

                {/* TV Room */}
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Tv className="size-6 text-white" />
                    </div>
                    <h4 className="text-sm text-blue-900">TV Room</h4>
                  </div>
                </div>

                {/* Garage */}
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-gray-500 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Car className="size-6 text-white" />
                    </div>
                    <h4 className="text-sm text-gray-900">Garage</h4>
                  </div>
                </div>
              </div>
              
              {/* Get Started Button */}
              <div className="text-center">
                <button
                  onClick={onGetStarted}
                  className="group inline-flex items-center gap-3 bg-white text-indigo-900 px-8 py-4 rounded-lg hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-xl"
                >
                  <span className="text-xl">Get Started</span>
                  <ArrowRight className="size-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hall Notice Board Section */}
      <section className="py-16 px-6 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 justify-center mb-8">
            <Bell className="size-8 text-indigo-600" />
            <h2 className="text-center">Hall Notice Board</h2>
          </div>
          <p className="text-center text-gray-600 mb-10 text-lg">
            Stay updated with the latest announcements and important notices
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Notice 1 - Important */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="size-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">IMPORTANT</span>
                  </div>
                  <h3 className="mb-2 text-red-900">Semester Break Notice</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    All students must vacate their rooms by December 20th, 2025 for the winter break. Halls will reopen on January 5th, 2026.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="size-4" />
                    <span>Posted: Nov 28, 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice 2 - Event */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <Bell className="size-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">EVENT</span>
                  </div>
                  <h3 className="mb-2 text-blue-900">Cultural Night 2025</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Annual cultural night will be held on December 15th at the hall auditorium. All residents are invited to participate and showcase their talents.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="size-4" />
                    <span>Posted: Nov 25, 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice 3 - Maintenance */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <Wrench className="size-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-amber-500 text-white text-xs rounded">MAINTENANCE</span>
                  </div>
                  <h3 className="mb-2 text-amber-900">Water Supply Maintenance</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Water supply will be temporarily suspended on December 2nd from 9 AM to 2 PM in Block A and B for pipeline maintenance.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="size-4" />
                    <span>Posted: Nov 27, 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice 4 - Application */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <FileText className="size-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">APPLICATION</span>
                  </div>
                  <h3 className="mb-2 text-green-900">New Seat Application Open</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Applications for the Spring 2026 semester are now open. Students can apply online through the portal until December 10th, 2025.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="size-4" />
                    <span>Posted: Nov 22, 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice 5 - General */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <Bell className="size-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded">GENERAL</span>
                  </div>
                  <h3 className="mb-2 text-purple-900">New Gym Equipment</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    The hall gym has been upgraded with new equipment including treadmills, weight machines, and yoga mats. Open daily 6 AM - 10 PM.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="size-4" />
                    <span>Posted: Nov 20, 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice 6 - Rules */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 border-l-4 border-gray-500 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="size-6 text-gray-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">REMINDER</span>
                  </div>
                  <h3 className="mb-2 text-gray-900">Quiet Hours Policy</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Reminder: Quiet hours are enforced from 10 PM to 7 AM daily. Please maintain noise levels to ensure a peaceful environment for all residents.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="size-4" />
                    <span>Posted: Nov 18, 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-4">Built for Everyone</h2>
          <p className="text-center text-gray-600 mb-16 text-lg max-w-2xl mx-auto">
            Whether you're a student, administrator, or staff member, our platform streamlines hall management
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Students */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Building2 className="size-7 text-blue-600" />
              </div>
              <h3 className="mb-4">For Students</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Apply for hall seats online</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Report maintenance issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Track application status</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Upload supporting documents</span>
                </li>
              </ul>
            </div>

            {/* For Admins */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <FileText className="size-7 text-purple-600" />
              </div>
              <h3 className="mb-4">For Admins</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Review student applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Approve or reject requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Manage seat allocations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>View detailed analytics</span>
                </li>
              </ul>
            </div>

            {/* For Staff */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-teal-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Wrench className="size-7 text-teal-600" />
              </div>
              <h3 className="mb-4">For Staff</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Receive problem reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Update task progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Manage work assignments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Track resolution status</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-gray-400 text-center">
        <p>&copy; 2025 Student Hall Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}