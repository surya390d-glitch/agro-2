import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  if (loading) return (
    <div className="loading-overlay" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
      <p>Loading AgroGuardian...</p>
    </div>
  );

  return user ? children : null;
}
