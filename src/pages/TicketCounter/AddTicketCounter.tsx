import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import {
  EyeClosed,
  EyeOff
} from "lucide-react";import axios from "axios";
import config from "../../config"; // your API base URL
import Alert from "../../components/ui/alert/Alert";

export default function AddTicketCounter() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(""); // "enabled" or "disabled"
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password || !status) {
      alert("Please fill in all required fields");
      return;
    }

    if (!["enabled", "disabled"].includes(status)) {
      alert("Status must be 'enabled' or 'disabled'");
      return;
    }

    try {
      const response = await axios.post(
        `${config.baseURL}/ticketcounter`,
        { name, email, password, status },
        { withCredentials: true }
      );

      if (response.data.success) {
        setShowSuccess(true);

        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setStatus("");

        setTimeout(() => {
          navigate("/ticket-counter");
        }, 1500);
      } else {
        alert(response.data.message || "Failed to create ticket counter user");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <ComponentCard title="Add Ticket Counter User">
      <div className="space-y-6">
        {showSuccess && (
          <Alert
            variant="success"
            title="Ticket Counter Added"
            message="The ticket counter user was added successfully."
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
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="">Select status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
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
          Add Ticket Counter
        </button>
      </div>
    </ComponentCard>
  );
}
