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
  isResidential?: boolean;
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
    const stored = localStorage.getItem('hall_management_user');
    return stored ? JSON.parse(stored) : null;
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

  const handleSignup = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'student' | 'admin' | 'staff',
    studentId?: string,
    department?: string,
    roomNumber?: string,
    isResidential?: boolean
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
        isResidential
      });
      const user = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
        studentId: data.studentId,
        department: data.department,
        roomNumber: data.roomNumber,
        isResidential: data.isResidential
      };
      setCurrentUser(user);
      localStorage.setItem('hall_management_user', JSON.stringify(user));
      setAuthError('');
    } catch (err: any) {
      setAuthError(err.message || 'Signup failed');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthError('');
    try {
      const data = await api.post('/users/login', { email, password });
      const user = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        studentId: data.studentId,
        department: data.department,
        roomNumber: data.roomNumber,
        isResidential: data.isResidential,
        token: data.token
      };
      setCurrentUser(user);
      localStorage.setItem('hall_management_user', JSON.stringify(user));
      setAuthError('');
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

  const handleApplicationReview = async (id: string, status: 'approved' | 'rejected', remarks: string) => {
    if (!currentUser?.token) return;
    try {
      const updatedApp = await api.put(`/applications/${id}`, { status, remarks }, currentUser.token);
      setApplications(applications.map(app => app.id === id ? { ...updatedApp, id: updatedApp._id } : app));
    } catch (err) {
      console.error('Error reviewing application:', err);
    }
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

  const handleProblemUpdate = async (id: string, status: Problem['status'], staffRemarks?: string) => {
    if (!currentUser?.token) return;
    try {
      const updatedProblem = await api.put(`/problems/${id}`, { status, staffRemarks }, currentUser.token);
      setProblems(problems.map(p => p.id === id ? { ...updatedProblem, id: updatedProblem._id } : p));
    } catch (err) {
      console.error('Error updating problem:', err);
    }
  };

  // If not logged in, show login or signup
  if (!currentUser) {
    // Show landing page first
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }

    if (view === 'signup') {
      return (
        <Signup
          onSignup={handleSignup}
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
        onSwitchToSignup={() => {
          setView('signup');
          setAuthError('');
        }}
        error={authError}
      />
    );
  }

  // Role-based access control - only show dashboard for user's role
  return (
    <div className="min-h-screen bg-gray-50">
      {currentUser.role === 'student' && (
        <StudentDashboard
          user={currentUser}
          applications={applications.filter(app => app.user === currentUser.id)}
          problems={problems.filter(p => p.user === currentUser.id)}
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