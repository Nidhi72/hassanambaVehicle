import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import axios from "axios";
import config from "../../config"; // your API base URL
import Alert from "../../components/ui/alert/Alert";

export default function AddNotification() {
  const navigate = useNavigate();

  const [titleEn, setTitleEn] = useState("");
  const [titleKn, setTitleKn] = useState("");
  const [messageEn, setMessageEn] = useState("");
  const [messageKn, setMessageKn] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!titleEn || !titleKn || !messageEn || !messageKn) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${config.baseURL}/notifications`,
        {
          title: {
            en: titleEn,
            kn: titleKn
          },
          message: {
            en: messageEn,
            kn: messageKn
          }
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setShowSuccess(true);

        // Clear form
        setTitleEn("");
        setTitleKn("");
        setMessageEn("");
        setMessageKn("");

        setTimeout(() => {
          navigate("/notifications");
        }, 1500);
      } else {
        alert(response.data.message || "Failed to create notification");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="Add Notification">
      <div className="space-y-6">
        {showSuccess && (
          <Alert
            variant="success"
            title="Notification Added"
            message="The notification was added successfully."
            showLink={false}
          />
        )}

        {/* Title Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Title
          </h3>
          
          <div>
            <Label htmlFor="title-en">Title (English)</Label>
            <Input
              type="text"
              id="title-en"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Enter title in English"
            />
          </div>

          <div>
            <Label htmlFor="title-kn">Title (Kannada)</Label>
            <Input
              type="text"
              id="title-kn"
              value={titleKn}
              onChange={(e) => setTitleKn(e.target.value)}
              placeholder="ಕನ್ನಡದಲ್ಲಿ ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
            />
          </div>
        </div>

        {/* Message Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Message
          </h3>
          
          <div>
            <Label htmlFor="message-en">Message (English)</Label>
            <textarea
              id="message-en"
              value={messageEn}
              onChange={(e) => setMessageEn(e.target.value)}
              placeholder="Enter message in English"
              rows={4}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <Label htmlFor="message-kn">Message (Kannada)</Label>
            <textarea
              id="message-kn"
              value={messageKn}
              onChange={(e) => setMessageKn(e.target.value)}
              placeholder="ಕನ್ನಡದಲ್ಲಿ ಸಂದೇಶ ನಮೂದಿಸಿ"
              rows={4}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add Notification"}
        </button>
      </div>
    </ComponentCard>
  );
}