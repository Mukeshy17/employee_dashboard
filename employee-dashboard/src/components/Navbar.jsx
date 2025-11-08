import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";


const user = JSON.parse(localStorage.getItem("user"));
const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );
  const [userName, setUserName] = useState(
    user?.name || ""
  );
  const [isAdmin, setIsAdmin] = useState(
    user?.is_admin === "true"
  );
  const navigate = useNavigate();
  const location = useLocation();
console.log(user);

  // Update auth state on route change (covers same-tab login redirect)
  useEffect(() => {
    // console.log(user.name);
    
    setIsAuthenticated(Boolean(localStorage.getItem("token")));
    setUserName(user?.name || "");
    setIsAdmin(user?.is_admin === "true");
  }, [location]);

  // Update auth state across tabs/windows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") setIsAuthenticated(Boolean(e.newValue));
      if (e.key === "userName") setUserName(e.newValue || "");
      if (e.key === "isAdmin") setIsAdmin(e.newValue === "true");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // optional: notify backend to blacklist token
        await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Logout request failed", err);
      }
    }
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserName("");
    setIsAdmin(false);
    navigate("/login");
  };

  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <nav className="bg-white fixed top-0 left-0 w-full z-50 shadow-sm border-b border-slate-100">
  <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    <Link to="/" className="text-xl font-semibold text-emerald-600">
      Employee Dashboard
    </Link>
    <div className="flex items-center gap-4">
      <Link to="/employees" className="text-sm text-slate-700 hover:text-emerald-600">
        Employees
      </Link>
      {isAdmin && (
        <Link to="/admin" className="text-sm text-emerald-600 font-medium">
          Admin
        </Link>
      )}
      <div className="ml-4 flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Link
              to="/profile"
              title={userName}
              className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold"
            >
              {initial}
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md bg-rose-500 text-white text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1.5 rounded-md bg-slate-100 text-emerald-600 text-sm"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  </div>
</nav>

  );
};

export default Navbar;
