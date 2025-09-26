import { useState } from "react";
import { useNavigate } from "react-router";
import config from "../../config";
import Logo from '../../components/images/logo.png'
interface LoginProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

interface Credentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  message?: string;
}

interface ErrorResponse {
  message: string;
}

const Login = ({ setIsAuthenticated }: LoginProps) => {
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${config.baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        const loginData: LoginResponse = data;

        // Store the auth token and timestamps
        const currentTime = new Date().getTime().toString();
        localStorage.setItem("authToken", loginData.token);
        localStorage.setItem("loginTime", currentTime);
        localStorage.setItem("lastActivity", currentTime);

        // Update authentication state
        setIsAuthenticated(true);

        // Navigate to home page
        navigate("/");
      } else {
        const errorData: ErrorResponse = data;
        setError(errorData.message || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md border border-gray-300 rounded-lg bg-white p-6 shadow-md">
        <div className="text-center mb-6">
          <img className="mx-auto w-32" src={Logo} alt="Your Company" />
        </div>
  
        <form className="space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3">
              {error}
            </div>
          )}
  
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Email
            </label>
            <div className="mt-2">
              <input
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset 
                ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-igreen 
                sm:text-sm sm:leading-6 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>
          </div>
  
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <input
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset 
                ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-igreen 
                sm:text-sm sm:leading-6 focus:outline-none"
                placeholder="Enter your password"
              />
            </div>
          </div>
  
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-md border border-primary bg-white px-3 py-2 text-sm font-semibold 
              leading-6 text-primary hover:bg-primary hover:text-white shadow-sm focus-visible:outline 
              focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors duration-200 
              ${loading ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default Login;
