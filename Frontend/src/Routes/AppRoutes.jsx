import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Home from "../pages/Home";
import AdminAuthForm from "../pages/AdminAuthForm.jsx";
import SellerUpload from "../pages/SellerUpload";
import AdminDashboard from "../pages/AdminDashboard";
import AdminOrders from "../pages/AdminOrders";
import AdminProducts from "../pages/AdminProducts";
import ProductDetail from "../pages/ProductDetail";
import ProtectedAdminRoute from "../Components/ProtectedAdminRoute";
import SearchResults from "../pages/SearchResults.jsx";
import AllProducts from "../pages/AllProducts";
import Orders from "../pages/Orders";
import OrderPlaced from "../pages/OrderPlaced";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";






const AppRoutes = () => {

  return (
    <div className="app-root">
      <Router>
        <Routes>
          {/* Public layout with Navbar + Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/products" element={<AllProducts />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order-placed" element={<OrderPlaced />} />
            <Route path="/Auth" element={<AdminAuthForm />}></Route>
          </Route>

          {/* Admin routes */}
          <Route element={<div className="site-container"><Outlet /></div>}>
            <Route path="/seller" element={<ProtectedAdminRoute><SellerUpload /></ProtectedAdminRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin-orders" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
            <Route path="/admin-products" element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

  function PublicLayout() {
    return (
      <>
        <Navbar />
        <div className="site-container"><Outlet /></div>
        <Footer />
      </>
    );
  }

export default AppRoutes