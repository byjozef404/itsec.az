import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireDealer?: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({ children, requireAdmin, requireDealer }) => {
  const { user, loading, isAdmin, isDealer } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (requireDealer && !isDealer && !isAdmin) return <Navigate to="/user/dealer" replace />;

  return <>{children}</>;
};
