import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  Wrench, 
  ArrowRight, 
  BookOpen, 
  Utensils, 
  Bell, 
  Calendar, 
  CreditCard, 
  ChevronRight
} from 'lucide-react';
import hallImage from 'figma:asset/ad42a419c000cbb4adc47835d60b312d1e6bcd3f.png';
import { api } from '../../api';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
}

interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  publishedAt: string;
}

export function LandingPage({ onGetStarted, onOpenLogin, onOpenSignup }: LandingPageProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState<boolean>(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await api.get('/notices');
        setNotices(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (err) {
        console.error('Failed to load notices:', err);
      } finally {
        setLoadingNotices(false);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans antialiased">
      {/* Top Bar */}
      <div className="bg-[#0F172A] text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-medium text-slate-200">
            Pabna University of Science and Technology
          </span>
          <div className="flex gap-4 text-slate-400">
            <span>Provost Office: +880 731 66532</span>
            <span>hall.provost@pust.ac.bd</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#16324F] flex items-center justify-center text-white">
              <Building2 className="size-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Shadhinota Hall</h1>
              <p className="text-[11px] text-slate-500">PUST Residence Portal</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-600">
            <a href="#facilities" className="hover:text-slate-900 transition-colors">Facilities</a>
            <a href="#workflow" className="hover:text-slate-900 transition-colors">Seat Allocation</a>
            <a href="#notices" className="hover:text-slate-900 transition-colors">Notices</a>
            <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLogin || onGetStarted}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={onOpenSignup || onGetStarted}
              className="px-4 py-1.5 rounded-md text-xs font-semibold bg-[#16324F] hover:bg-[#0F2236] text-white shadow-xs transition-colors cursor-pointer"
            >
              Student Portal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#16324F] text-white py-16 lg:py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${hallImage})` }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-block px-2.5 py-1 rounded-sm text-xs font-semibold bg-white/10 text-amber-300 border border-white/15">
                Official Residence Management
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Shadhinota Hall Residence & Administrative Portal
              </h2>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Online seat allocation, fee payment verification, room maintenance reporting, and official notices for resident students.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onGetStarted}
                  className="px-5 py-2.5 rounded-md text-xs font-semibold bg-[#087E8B] hover:bg-[#066570] text-white transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>Enter Student Portal</span>
                  <ArrowRight className="size-4" />
                </button>
                <a
                  href="#notices"
                  className="px-5 py-2.5 rounded-md text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/20 transition-colors"
                >
                  Notice Board
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-lg overflow-hidden border border-white/20 shadow-lg bg-slate-900">
                <img 
                  src={hallImage} 
                  alt="Shadhinota Hall" 
                  className="w-full h-64 object-cover"
                />
                <div className="p-3 bg-slate-900/95 text-xs text-slate-300">
                  <p className="font-semibold text-white">Shadhinota Hall Complex</p>
                  <p className="text-[11px] text-slate-400">Pabna University of Science and Technology</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Overview */}
      <section id="facilities" className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900">Hall Facilities</h3>
            <p className="text-xs text-slate-500">Core residential services provided to registered students.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-md border border-slate-200 bg-slate-50">
              <BookOpen className="size-5 text-[#087E8B] mb-2" />
              <h4 className="text-xs font-bold text-slate-900 mb-1">Study Hall</h4>
              <p className="text-xs text-slate-600">Quiet reading rooms equipped with campus Wi-Fi.</p>
            </div>

            <div className="p-4 rounded-md border border-slate-200 bg-slate-50">
              <Utensils className="size-5 text-[#087E8B] mb-2" />
              <h4 className="text-xs font-bold text-slate-900 mb-1">Dining Service</h4>
              <p className="text-xs text-slate-600">Daily meal management and clean dining spaces.</p>
            </div>

            <div className="p-4 rounded-md border border-slate-200 bg-slate-50">
              <CreditCard className="size-5 text-[#087E8B] mb-2" />
              <h4 className="text-xs font-bold text-slate-900 mb-1">Online Fees</h4>
              <p className="text-xs text-slate-600">Payment verification via SSLCommerz gateway.</p>
            </div>

            <div className="p-4 rounded-md border border-slate-200 bg-slate-50">
              <Wrench className="size-5 text-[#087E8B] mb-2" />
              <h4 className="text-xs font-bold text-slate-900 mb-1">Maintenance</h4>
              <p className="text-xs text-slate-600">Direct repair requests for electrical, plumbing, and fixtures.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Allocation Workflow */}
      <section id="workflow" className="py-12 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900">Seat Allocation Process</h3>
            <p className="text-xs text-slate-500">Standard steps for hall seat application and confirmation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white rounded-md border border-slate-200">
              <span className="font-bold text-[#16324F] block mb-1">1. Apply Online</span>
              <p className="text-slate-600">Submit student ID, academic details, and address.</p>
            </div>
            <div className="p-4 bg-white rounded-md border border-slate-200">
              <span className="font-bold text-[#16324F] block mb-1">2. Review & Bed Assignment</span>
              <p className="text-slate-600">Administration verifies records and reserves a room bed.</p>
            </div>
            <div className="p-4 bg-white rounded-md border border-slate-200">
              <span className="font-bold text-[#16324F] block mb-1">3. Pay Admission Fee</span>
              <p className="text-slate-600">Complete hall fee payment through the payment portal.</p>
            </div>
            <div className="p-4 bg-white rounded-md border border-slate-200">
              <span className="font-bold text-[#16324F] block mb-1">4. Confirmation Letter</span>
              <p className="text-slate-600">Seat marked active. Download allocation certificate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Notices Section */}
      <section id="notices" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Notices</h3>
              <p className="text-xs text-slate-500">Official circulars from the Provost Office.</p>
            </div>
            <button 
              onClick={onGetStarted}
              className="text-xs font-semibold text-[#087E8B] hover:underline cursor-pointer"
            >
              View all in portal &rarr;
            </button>
          </div>

          {loadingNotices ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading notices...</div>
          ) : notices.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-slate-200 rounded-md">
              No circulars currently published.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notices.map((n) => (
                <div key={n._id} className="p-4 rounded-md border border-slate-200 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 capitalize">{n.category.replace('_', ' ')}</span>
                    <span>{new Date(n.publishedAt || (n as any).createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{n.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#0F172A] text-slate-400 py-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-semibold text-white">Shadhinota Hall • PUST</p>
            <p className="text-slate-500">Pabna University of Science and Technology, Pabna-6600, Bangladesh</p>
          </div>
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} PUST. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
