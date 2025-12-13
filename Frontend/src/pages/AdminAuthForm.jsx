import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/UserAuthForm.css";
import avatar from "../assets/avtar.png";

const API = import.meta.env.VITE_API_URL;

export default function AdminAuthForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch(`${API}/api/auth/admin/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            Fullname: fullName,
            Email: email,
            Password: password,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Registration failed");
        
        // Save admin info in localStorage
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminEmail", email);
        localStorage.setItem("adminName", fullName);
        
        // Remove user/seller tokens if admin logs in
        localStorage.removeItem("userToken");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("sellerToken");
        localStorage.removeItem("sellerEmail");
        localStorage.removeItem("sellerName");
        
        window.dispatchEvent(new Event("adminLoggedIn"));
        
        setMessage({ type: "success", text: data.message || "Registered successfully" });
        setTimeout(() => navigate("/admin-dashboard"), 1000);
      } else {
        const res = await fetch(`${API}/api/auth/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ Email: email, password: password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");

        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminEmail", email);
        localStorage.setItem("adminName", data.admin?.Fullname || "Admin");
        
        // Remove user/seller tokens if admin logs in
        localStorage.removeItem("userToken");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("sellerToken");
        localStorage.removeItem("sellerEmail");
        localStorage.removeItem("sellerName");
        
        window.dispatchEvent(new Event("adminLoggedIn"));
        
        setMessage({ type: "success", text: data.message || "Logged in successfully" });
        setTimeout(() => navigate("/admin-dashboard"), 1000);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <div className="welcome">
            <h2>
              Welcome to
              <br /> Admin Panel
            </h2>
          </div>
        </div>

        <div className="auth-right">
          <div className="lock-icon">
            <img src={avatar} alt="avatar" />
          </div>

          <p className="subtitle">
            {mode === "login"
              ? "ADMIN LOGIN"
              : "Create admin account"}
          </p>

          <form className="form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="field">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div className="field">
              <input
                type="email"
                placeholder="Admin Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="btn-grad" type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Register"}
            </button>
          </form>

          {message && (
            <div
              className={`auth-message ${
                message.type === "error" ? "error" : "success"
              }`}
            >
              {message.text}
            </div>
          )}

          <p className="switch">
            {mode === "login" ? (
              <>
                New Admin?{" "}
                <button
                  type="button"
                  className="link"
                  onClick={() => setMode("register")}
                >
                  Register here.
                </button>
              </>
            ) : (
              <>
                Already have account?{" "}
                <button
                  type="button"
                  className="link"
                  onClick={() => setMode("login")}
                >
                  Login.
                </button>
              </>
            )}
          </p>
        </div>
       
      </div>
    </div>
  );
}
