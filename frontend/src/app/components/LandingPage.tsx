import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  FileText, 
  Wrench, 
  ArrowRight, 
  BookOpen, 
  Shield, 
  Utensils, 
  Wifi, 
  Bell, 
  Calendar, 
  CreditCard, 
  Users, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
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
    <div className="min-h-screen bg-[#F5F7FA] text-[#1F2937] font-sans">
      {/* Top University Announcement Bar */}
      <div className="bg-[#10263D] text-slate-200 text-xs py-2 px-4 border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C59A45] animate-pulse"></span>
            <span className="font-medium text-amber-300">Pabna University of Science and Technology</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline">Residential Hall Directorate</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <span>Helpdesk: +880 731 66532</span>
            <span>Email: hall.provost@pust.ac.bd</span>
          </div>
        </div>
      </div>

      {/* Institutional Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#16324F] shadow-md border-b border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#087E8B] to-[#10263D] flex items-center justify-center text-white shadow-inner border border-white/20">
              <Building2 className="size-7 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                Shadhinota Hall
              </h1>
              <p className="text-xs text-teal-200 tracking-wide">
                Pabna University of Science and Technology (PUST)
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-200">
            <a href="#about" className="hover:text-amber-300 transition-colors">About Hall</a>
            <a href="#services" className="hover:text-amber-300 transition-colors">Services</a>
            <a href="#admissions" className="hover:text-amber-300 transition-colors">Seat Allocation</a>
            <a href="#notices" className="hover:text-amber-300 transition-colors">Notices</a>
            <a href="#contact" className="hover:text-amber-300 transition-colors">Administration</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin || onGetStarted}
              className="px-4 py-2 text-sm font-medium text-white hover:text-amber-300 transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={onOpenSignup || onGetStarted}
              className="px-5 py-2.5 rounded-md text-sm font-semibold bg-[#087E8B] hover:bg-[#066570] text-white shadow transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Student Portal</span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#10263D] text-white overflow-hidden py-16 lg:py-24">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay filter blur-[1px]"
          style={{ backgroundImage: `url(${hallImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#10263D] via-[#16324F]/95 to-[#10263D]/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#C59A45]/20 text-[#C59A45] border border-[#C59A45]/40">
                <Shield className="size-3.5" />
                <span>Official Residential Portal • Academic Year 2024-2025</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Modern Residential Life & Administrative Services
              </h2>
              
              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                Welcome to Shadhinota Hall Management System. A secure institutional portal providing online room and seat allocation, verified digital fee payment, complaint lifecycle tracking, and instant university notices for residents.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={onGetStarted}
                  className="px-6 py-3.5 rounded-md font-semibold text-white bg-[#087E8B] hover:bg-[#076b77] shadow-lg flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <span>Apply for Seat / Log In</span>
                  <ArrowRight className="size-5" />
                </button>
                <a
                  href="#notices"
                  className="px-6 py-3.5 rounded-md font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/20 transition-all flex items-center gap-2"
                >
                  <Bell className="size-4 text-amber-300" />
                  <span>View Official Notices</span>
                </a>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 border-t border-slate-700/80 grid grid-cols-3 gap-6 text-slate-300">
                <div>
                  <p className="text-2xl font-bold text-white">600+</p>
                  <p className="text-xs text-slate-400">Residential Capacity</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#C59A45]">SSLCommerz</p>
                  <p className="text-xs text-slate-400">Secured Fee Gateway</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-400">24/7</p>
                  <p className="text-xs text-slate-400">Maintenance Dispatch</p>
                </div>
              </div>
            </div>

            {/* Official Hall Card / Image Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-2xl">
                <div className="relative rounded-lg overflow-hidden h-80 bg-slate-900">
                  <img 
                    src={hallImage} 
                    alt="Shadhinota Hall PUST" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">PUST Campus</p>
                    <h3 className="text-lg font-bold text-white">Shadhinota Hall Building Complex</h3>
                    <p className="text-xs text-slate-300 mt-1">Providing residential accommodation for science & engineering students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities & Services Grid */}
      <section id="services" className="py-16 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#087E8B]">Key Institutional Facilities</h2>
            <p className="text-3xl font-extrabold text-[#16324F] mt-2">Comprehensive Residential Amenities</p>
            <p className="text-slate-600 mt-2 text-sm">
              Shadhinota Hall provides an academic atmosphere equipped with continuous utility and support services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded bg-[#16324F] text-amber-300 flex items-center justify-center mb-4">
                <BookOpen className="size-6" />
              </div>
              <h4 className="font-bold text-[#16324F] mb-1">Central Reading Hall</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Air-conditioned study spaces with academic journals and high-speed campus fiber Wi-Fi.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded bg-[#087E8B] text-white flex items-center justify-center mb-4">
                <Utensils className="size-6" />
              </div>
              <h4 className="font-bold text-[#16324F] mb-1">Dining & Cafeteria</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Subsidized student dining hall managed with hygiene supervision and digital mess coupons.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded bg-[#16324F] text-teal-300 flex items-center justify-center mb-4">
                <CreditCard className="size-6" />
              </div>
              <h4 className="font-bold text-[#16324F] mb-1">Online Fee Payment</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pay seat allocation and semester hall dues safely through integrated SSLCommerz sandbox payment gateway.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded bg-[#C59A45] text-white flex items-center justify-center mb-4">
                <Wrench className="size-6" />
              </div>
              <h4 className="font-bold text-[#16324F] mb-1">Maintenance Dispatch</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct complaint ticketing system for electrical, plumbing, carpentry, and network repairs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Notice Board Section */}
      <section id="notices" className="py-16 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#E2E8F0]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#087E8B]">PUST Administration</span>
              <h3 className="text-2xl font-bold text-[#16324F] mt-1">Official Notices & Circulars</h3>
            </div>
            <p className="text-xs text-slate-500 mt-2 md:mt-0">
              Authenticated notices issued by the Provost Office
            </p>
          </div>

          {loadingNotices ? (
            <div className="py-12 text-center text-slate-500 text-sm">Loading official notices...</div>
          ) : notices.length === 0 ? (
            <div className="p-8 text-center bg-white rounded border border-[#E2E8F0] text-slate-500 text-sm">
              No new circulars currently active.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notices.map((n) => (
                <div key={n._id} className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm hover:border-[#087E8B] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                      n.priority === 'urgent' 
                        ? 'bg-red-100 text-red-800 border border-red-200' 
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}>
                      {n.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {new Date(n.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#16324F] mb-2 leading-snug">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {n.content}
                  </p>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Provost Office, PUST</span>
                    <button 
                      onClick={onGetStarted}
                      className="text-[#087E8B] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Read full announcement &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seat Allocation Step-by-Step Workflow */}
      <section id="admissions" className="py-16 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#087E8B]">Clearance & Allocation</h2>
            <p className="text-3xl font-extrabold text-[#16324F] mt-2">How Hall Seat Allocation Works</p>
            <p className="text-xs text-slate-600 mt-2">
              Structured institutional workflow ensuring transparent seat distribution for eligible students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-lg border border-slate-200 bg-[#F5F7FA]">
              <span className="w-8 h-8 rounded-full bg-[#16324F] text-amber-300 font-bold text-sm flex items-center justify-center mb-4">1</span>
              <h5 className="font-bold text-[#16324F] text-sm mb-1">Submit Application</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log into portal, fill academic details (ID, department, session, CGPA), and submit residential request.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-[#F5F7FA]">
              <span className="w-8 h-8 rounded-full bg-[#087E8B] text-white font-bold text-sm flex items-center justify-center mb-4">2</span>
              <h5 className="font-bold text-[#16324F] text-sm mb-1">Administrative Review</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hall administration verifies academic records, assigns a room (Block, Floor, Bed), and reserves the seat.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-[#F5F7FA]">
              <span className="w-8 h-8 rounded-full bg-[#C59A45] text-white font-bold text-sm flex items-center justify-center mb-4">3</span>
              <h5 className="font-bold text-[#16324F] text-sm mb-1">Pay Hall Admission Fee</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete required admission and maintenance fee via integrated SSLCommerz Sandbox payment gateway.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-[#F5F7FA]">
              <span className="w-8 h-8 rounded-full bg-[#16803C] text-white font-bold text-sm flex items-center justify-center mb-4">4</span>
              <h5 className="font-bold text-[#16324F] text-sm mb-1">Download Clearance</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seat is marked active/occupied. Download official university seat confirmation letter and fee receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* University Institutional Footer */}
      <footer id="contact" className="bg-[#10263D] text-slate-300 pt-14 pb-8 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-700">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="size-6 text-amber-400" />
                <span className="text-lg font-bold text-white">Shadhinota Hall</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pabna University of Science and Technology (PUST)<br />
                Rajapur, Pabna-6600, Bangladesh.
              </p>
              <p className="text-xs text-slate-400">
                Official automated residential housing and student administration service.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={onGetStarted} className="hover:text-amber-300 cursor-pointer">Student Login</button></li>
                <li><button onClick={onGetStarted} className="hover:text-amber-300 cursor-pointer">Seat Application</button></li>
                <li><button onClick={onGetStarted} className="hover:text-amber-300 cursor-pointer">Maintenance Dispatch</button></li>
                <li><a href="#notices" className="hover:text-amber-300">Notice Circulars</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Administration</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Office of the Provost</li>
                <li>House Tutors & Resident Officers</li>
                <li>Hall Maintenance Division</li>
                <li>PUST ICT Cell Integration</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact & Support</h4>
              <div className="space-y-2 text-xs text-slate-400">
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-amber-400" />
                  <span>+880 731 66532 / Ext: 104</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-amber-400" />
                  <span>hall.shadhinota@pust.ac.bd</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-amber-400" />
                  <span>Block B, Provost Office, 1st Floor</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Pabna University of Science and Technology. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Shadhinota Hall Management System • Production Academic Build</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
