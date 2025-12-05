import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";


const LoginPage = () => {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;


  const handleSubmit =async(e)=>{
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res=await axios.post(`${API}/api/auth/login`,{
        email,
        password
      });
      setLoading(false);
      console.log(res.data);
      localStorage.setItem('token',res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate('/');

    } catch (error) {
      
    }

  }
  return (
 <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-blue-500 mb-2">
          AI Support Platform
        </h1>
        <p className="text-sm text-gray-900 mb-6">
          Sign in to chat as a user or manage FAQs as admin.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 transition text-sm font-medium py-2.5 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>

           <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
           Admin Login
            <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
          
      </div>

    </div>)
}

export default LoginPage