import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import axios from "axios";
import config from "../../config";
import Alert from "../../components/ui/alert/Alert";

interface Notification {
  id: number | string;
  title: {
    en: string;
    kn: string;
  };
  message: {
    en: string;
    kn: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function EditNotification() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [notificationData, setNotificationData] = useState<Notification>({
    id: "",
    title: {
      en: "",
      kn: ""
    },
    message: {
      en: "",
      kn: ""
    },
  });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<'success' | 'error'>('success');

  const fetchNotification = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/notifications/${id}`, { withCredentials: true });
      if (response.data.success) {
        setNotificationData(response.data.data);
      } else {
        setAlertMessage(response.data.message || "Notification not found");
        setAlertVariant('error');
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404) {
        setAlertMessage("Notification not found");
      } else {
        setAlertMessage("Error fetching notification");
      }
      setAlertVariant('error');
    }
  };

  useEffect(() => {
    if (id) {
      fetchNotification();
    }
  }, [id]);

  const handleChange = (field: 'title' | 'message', lang: 'en' | 'kn', value: string) => {
    setNotificationData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!notificationData.title.en || !notificationData.title.kn || 
        !notificationData.message.en || !notificationData.message.kn) {
      setAlertMessage("Please fill all fields");
      setAlertVariant("error");
      return;
    }

    try {
      const response = await axios.put(
        `${config.baseURL}/notifications/${id}`, 
        {
          title: {
            en: notificationData.title.en,
            kn: notificationData.title.kn
          },
          message: {
            en: notificationData.message.en,
            kn: notificationData.message.kn
          }
        }, 
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setAlertMessage("Notification updated successfully");
        setAlertVariant("success");

        setTimeout(() => navigate("/notifications"), 1500);
      } else {
        setAlertMessage(response.data.message || "Failed to update notification");
        setAlertVariant("error");
      }
    } catch (err: any) {
      setAlertMessage(err.response?.data?.message || err.message);
      setAlertVariant("error");
    }
  };

  return (
    <ComponentCard title="Edit Notification">
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
          <Label htmlFor="title-en">Title (English)</Label>
          <Input
            type="text"
            id="title-en"
            value={notificationData.title.en}
            onChange={(e) => handleChange("title", "en", e.target.value)}
            placeholder="Enter title in English"
          />
        </div>

        <div>
          <Label htmlFor="title-kn">Title (Kannada)</Label>
          <Input
            type="text"
            id="title-kn"
            value={notificationData.title.kn}
            onChange={(e) => handleChange("title", "kn", e.target.value)}
            placeholder="ಕನ್ನಡದಲ್ಲಿ ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
          />
        </div>

        <div>
          <Label htmlFor="message-en">Message (English)</Label>
          <textarea
            id="message-en"
            value={notificationData.message.en}
            onChange={(e) => handleChange("message", "en", e.target.value)}
            placeholder="Enter message in English"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[100px] resize-vertical"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="message-kn">Message (Kannada)</Label>
          <textarea
            id="message-kn"
            value={notificationData.message.kn}
            onChange={(e) => handleChange("message", "kn", e.target.value)}
            placeholder="ಕನ್ನಡದಲ್ಲಿ ಸಂದೇಶ ನಮೂದಿಸಿ"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[100px] resize-vertical"
            rows={4}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/80"
        >
          Update Notification
        </button>
      </div>
    </ComponentCard>
  );
}