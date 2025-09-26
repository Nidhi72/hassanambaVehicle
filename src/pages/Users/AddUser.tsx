import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import {
  EyeClosed,
  EyeOff
} from "lucide-react";
import axios from "axios";
import config from "../../config"; // your API base URL
import Alert from "../../components/ui/alert/Alert";

export default function AddUser() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ Email validation function
  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      alert("Please fill in all required fields");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const response = await axios.post(
        `${config.baseURL}/users`,
        {
          name,
          email,
          password,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setShowSuccess(true);

        // Clear form
        setName("");
        setEmail("");
        setPassword("");

        setTimeout(() => {
          navigate("/users");
        }, 1500);
      } else {
        alert(response.data.message || "Failed to create user");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <ComponentCard title="Add User">
      <div className="space-y-6">
        {showSuccess && (
          <Alert
            variant="success"
            title="User Added"
            message="The user was added successfully."
            showLink={false}
          />
        )}

        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="info@gmail.com"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showPassword ? (
                <EyeOff className="fill-gray-500 dark:fill-gray-400 size-5" />
              ) : (
                <EyeClosed className="fill-gray-500 dark:fill-gray-400 size-5" />
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/80"
        >
          Add User
        </button>
      </div>
    </ComponentCard>
  );
}
