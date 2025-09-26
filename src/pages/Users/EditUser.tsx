import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import {
  EyeClosed,
  EyeOff
} from "lucide-react";
import axios from "axios";
import config from "../../config";
import Alert from "../../components/ui/alert/Alert";
import CryptoJS from "crypto-js";

interface User {
  id: number | string;
  name: string;
  email: string;
  password: string;
}

// Fixed decrypt function to match backend encryption process
function decryptData(encryptedData: string): string {
  try {
    const key = "srihassanaambatemple@2024";
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData.trim(), key);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    // Check if decryption was successful
    if (!decryptedString || decryptedString.trim() === "") {
      console.error("Decryption failed - returning original");
      return encryptedData; // Return original if decryption fails
    }
    
    // Try to parse as JSON first (matching your backend encryptData function)
    try {
      const parsedData = JSON.parse(decryptedString);
      return parsedData; // This should be the actual password
    } catch (jsonError) {
      // If JSON parsing fails, return the raw decrypted string
      return decryptedString;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return encryptedData; // Return original if anything fails
  }
}

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<User>({
    id: "",
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<'success' | 'error'>('success');

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/users/${id}`, { withCredentials: true });
      
      console.log("=== FETCH USER DEBUG ===");
      console.log("1. Full API Response:", response.data);
      
      if (response.data.success) {
        const data = response.data.data;
        console.log("2. User data from API:", data);
        console.log("3. Password field value:", data.password);
        console.log("4. Password field type:", typeof data.password);

        // Create a copy to modify
        const processedData = { ...data };

        // Check if password exists and needs decryption
        if (data.password) {
          console.log("5. Attempting to decrypt password...");
          const decryptedPassword = decryptData(data.password);
          console.log("6. Decrypted password result:", decryptedPassword);
          console.log("7. Decrypted password type:", typeof decryptedPassword);
          
          processedData.password = decryptedPassword || "";
        } else {
          console.log("5. No password field found or password is empty");
          processedData.password = "";
        }

        console.log("8. Final processed data:", processedData);
        
        setUserData(processedData);
        
        console.log("9. State should be updated with:", processedData);
      }
    } catch (err) {
      console.error("=== FETCH ERROR ===", err);
      setAlertMessage("Error fetching user");
      setAlertVariant('error');
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  // Debug: Log userData changes
  useEffect(() => {
    console.log("=== USER DATA STATE CHANGE ===");
    console.log("Current userData:", userData);
    console.log("Password value:", userData.password);
    console.log("Password length:", userData.password?.length);
  }, [userData]);

  const handleChange = (field: keyof User, value: any) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!userData.name || !userData.email || !userData.password ) {
      setAlertMessage("Please fill all fields");
      setAlertVariant("error");
      return;
    }

    try {
      const response = await axios.put(`${config.baseURL}/users/${id}`, userData, { withCredentials: true });
      if (response.data.success) {
        setAlertMessage("User updated successfully");
        setAlertVariant("success");

        setTimeout(() => navigate("/users"), 1500);
      } else {
        setAlertMessage(response.data.message || "Failed to update user");
        setAlertVariant("error");
      }
    } catch (err: any) {
      setAlertMessage(err.response?.data?.message || err.message);
      setAlertVariant("error");
    }
  };

  return (
    <ComponentCard title="Edit User">
      <div className="space-y-6">
        {alertMessage && (
          <Alert
            variant={alertVariant}
            title={alertVariant === "success" ? "Success" : "Error"}
            message={alertMessage}
            showLink={false}
          />
        )}

        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={userData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter name"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={userData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Enter email"
          />
        </div>

     

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={userData.password}
              onChange={(e) => handleChange("password", e.target.value)}
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
          Update User
        </button>
      </div>
    </ComponentCard>
  );
}