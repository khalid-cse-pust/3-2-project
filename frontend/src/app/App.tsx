import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { api } from '../api';

export type UserRole = 'student' | 'admin' | 'staff' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  roomNumber?: string;
  phone?: string;
  isResidential?: boolean;
  isApproved?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  password?: string;
  token?: string;
}

export interface Application {
  _id?: string;
  id?: string;
  user: string;
  studentId: string;
  studentName: string;
  email: string;
  phone: string;
  program: string;
  year: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  document: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  remarks?: string;
}

export interface Problem {
  _id?: string;
  id?: string;
  user: string;
  studentName: string;
  email: string;
  roomNumber: string;
  category: string;
  description: string;
  image?: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'resolved';
  createdAt: string;
  assignedTo?: string;
  staffRemarks?: string;
}

function App() {
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('hall_management_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [authError, setAuthError] = useState<string>('');
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);

  // Fetch data when user is logged in
  useEffect(() => {
    if (currentUser && currentUser.token) {
      const fetchData = async () => {
        try {
          const apps = await api.get('/applications', currentUser.token);
          setApplications(apps.map((app: any) => ({ ...app, id: app._id })));

          const probs = await api.get('/problems', currentUser.token);
          setProblems(probs.map((p: any) => ({ ...p, id: p._id })));
        } catch (err) {
          console.error('Error fetching data:', err);
        }
      };
      fetchData();
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('hall_management_user', JSON.stringify(user));
    setAuthError('');
  };

  const handleSignup = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'student' | 'admin' | 'staff',
    studentId?: string,
    department?: string,
    roomNumber?: string,
    isResidential?: boolean,
    phone?: string
  ) => {
    setAuthError('');
    try {
      const data = await api.post('/users', { 
        email, 
        password, 
        name, 
        role,
        studentId,
        department,
        roomNumber,
        isResidential,
        phone,
      });

      if (data.isApproved && data.token) {
        const user: User = {
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          token: data.token,
          studentId: data.studentId,
          department: data.department,
          roomNumber: data.roomNumber,
          phone: data.phone,
          isResidential: data.isResidential,
          isApproved: data.isApproved,
          approvalStatus: data.approvalStatus,
        };
        handleLoginSuccess(user);
        return { success: true, isPending: false };
      } else {
        return { 
          success: true, 
          isPending: true, 
          message: data.message || 'Registration submitted. Awaiting approval.' 
        };
      }
    } catch (err: any) {
      setAuthError(err.message || 'Signup failed');
      throw err;
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthError('');
    try {
      const data = await api.post('/users/login', { email, password });
      const user: User = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        studentId: data.studentId,
        department: data.department,
        roomNumber: data.roomNumber,
        phone: data.phone,
        isResidential: data.isResidential,
        isApproved: data.isApproved,
        approvalStatus: data.approvalStatus,
        token: data.token
      };
      handleLoginSuccess(user);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hall_management_user');
    setAuthError('');
    setView('login');
  };

  const handleApplicationSubmit = async (application: Omit<Application, 'id' | 'createdAt' | 'status'>) => {
    if (!currentUser?.token) return;
    try {
      const newApp = await api.post('/applications', application, currentUser.token);
      setApplications([...applications, { ...newApp, id: newApp._id }]);
    } catch (err) {
      console.error('Error submitting application:', err);
    }
  };

  const handleApplicationReview = (updatedApp: any) => {
    const appId = updatedApp._id || updatedApp.id;
    setApplications(prev =>
      prev.map(app => (app.id === appId || app._id === appId) ? { ...updatedApp, id: appId } : app)
    );
  };

  const handleProblemSubmit = async (problem: Omit<Problem, 'id' | 'createdAt' | 'status'>) => {
    if (!currentUser?.token) return;
    try {
      const newProblem = await api.post('/problems', problem, currentUser.token);
      setProblems([...problems, { ...newProblem, id: newProblem._id }]);
    } catch (err) {
      console.error('Error submitting problem:', err);
    }
  };

  const handleProblemUpdate = (updatedProblem: any) => {
    const pId = updatedProblem._id || updatedProblem.id;
    setProblems(prev =>
      prev.map(p => (p.id === pId || p._id === pId) ? { ...updatedProblem, id: pId } : p)
    );
  };

  // If not logged in, show login or signup
  if (!currentUser) {
    // Show landing page first
    if (showLanding) {
      return (
        <LandingPage
          onGetStarted={() => setShowLanding(false)}
          onOpenLogin={() => {
            setView('login');
            setShowLanding(false);
          }}
          onOpenSignup={() => {
            setView('signup');
            setShowLanding(false);
          }}
        />
      );
    }

    if (view === 'signup') {
      return (
        <Signup
          onSignup={handleSignup}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToLogin={() => {
            setView('login');
            setAuthError('');
          }}
          error={authError}
        />
      );
    }
    
    return (
      <Login
        onLogin={handleLogin}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => {
          setView('signup');
          setAuthError('');
        }}
        error={authError}
      />
    );
  }

  // Helper matching for student data
  const isMyApplication = (app: Application) => {
    const appUserId = typeof app.user === 'object' && app.user !== null ? (app.user as any)._id : app.user;
    return (
      appUserId === currentUser.id ||
      (currentUser.studentId && app.studentId === currentUser.studentId)
    );
  };

  const isMyProblem = (p: Problem) => {
    const pUserId = typeof p.user === 'object' && p.user !== null ? (p.user as any)._id : p.user;
    return (
      pUserId === currentUser.id ||
      (currentUser.studentId && p.studentId === currentUser.studentId)
    );
  };

  // Role-based access control - only show dashboard for user's role
  return (
    <div className="min-h-screen bg-gray-50">
      {currentUser.role === 'student' && (
        <StudentDashboard
          user={currentUser}
          applications={applications.filter(isMyApplication)}
          problems={problems.filter(isMyProblem)}
          onLogout={handleLogout}
          onApplicationSubmit={handleApplicationSubmit}
          onProblemSubmit={handleProblemSubmit}
        />
      )}
      {currentUser.role === 'admin' && (
        <AdminDashboard
          user={currentUser}
          applications={applications}
          onLogout={handleLogout}
          onApplicationReview={handleApplicationReview}
        />
      )}
      {currentUser.role === 'staff' && (
        <StaffDashboard
          user={currentUser}
          problems={problems}
          onLogout={handleLogout}
          onProblemUpdate={handleProblemUpdate}
        />
      )}
    </div>
  );
}

export default App;
