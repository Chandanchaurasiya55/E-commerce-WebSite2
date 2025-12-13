import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminToken) {
    return <Navigate to="/auth?role=admin" replace />;
  }
  
  return children;
};

export default ProtectedAdminRoute;
