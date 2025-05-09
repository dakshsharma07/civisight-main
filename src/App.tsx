import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import CountyDashboard from './pages/county/CountyDashboard';
import StateAgencyDashboard from './pages/state/StateAgencyDashboard';
import { AuthProvider } from './contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [user] = useAuthState(auth);
  const [userType, setUserType] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserType = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserType(userDoc.data().userType);
          }
        } catch (error) {
          console.error('Error fetching user type:', error);
        }
      }
      setLoading(false);
    };

    fetchUserType();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                {userType === 'county' ? <CountyDashboard /> : <StateAgencyDashboard />}
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 