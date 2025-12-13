import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Home from "../pages/Home";
import AdminAuthForm from "../pages/AdminAuthForm.jsx";
import SellerUpload from "../pages/SellerUpload";
import AdminDashboard from "../pages/AdminDashboard";
import AdminOrders from "../pages/AdminOrders";
import AdminProducts from "../pages/AdminProducts";
import Orders from "../pages/Orders";
import ProductDetail from "../pages/ProductDetail";
import ProtectedAdminRoute from "../Components/ProtectedAdminRoute";
import SearchResults from "../pages/SearchResults.jsx";






const AppRoutes = () => {

  return (
    <div className="app-root">
      
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
           <Route path="/search" element={<SearchResults />} />
          {/* All other routes use a centered container layout */}
          <Route element={<div className="site-container"><Outlet /></div>}>
            <Route path="/Auth" element={<AdminAuthForm />}></Route>
            <Route path="/seller" element={<ProtectedAdminRoute><SellerUpload /></ProtectedAdminRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin-orders" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
            <Route path="/admin-products" element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default AppRoutes