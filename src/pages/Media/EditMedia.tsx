import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import axios from "axios";
import config from "../../config";
import Alert from "../../components/ui/alert/Alert";

interface MediaItem {
  id: number | string;
  type: string;
  category: string;
  mediaUrl?: string;
  date?: string;
}

// Categories are just strings now
type Category = string;

export default function EditMedia() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mediaData, setMediaData] = useState<MediaItem>({
    id: "",
    type: "",
    category: "",
    mediaUrl: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(true);

  // Media base path
  const MEDIA_BASE_URL = `${config.baseURL}/uploads/media`;

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/media/category`, { withCredentials: true });
      if (response.data.success) {
        setCategories(response.data.data); // array of strings
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchMedia = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/media/${id}`, { withCredentials: true });
      if (response.data.success) {
        setMediaData(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setAlertMessage("Error fetching media");
      setAlertVariant("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCategories(), fetchMedia()]);
    };
    loadData();
  }, [id]);

  const handleChange = (field: keyof MediaItem, value: any) => {
    setMediaData({ ...mediaData, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setNewFile(file);
    if (file) {
      setRemoveExistingFile(false); // If uploading new file, don't remove existing
    }
  };

  const handleRemoveFile = () => {
    setRemoveExistingFile(true);
    setNewFile(null); // Clear any selected new file
  };

  const handleSubmit = async () => {
    if (removeExistingFile && !newFile) {
      setAlertMessage("You cannot remove the existing file without uploading a new one");
      setAlertVariant("error");
      return;
    }

    try {
      const form = new FormData();
      form.append("type", mediaData.type);
      form.append("category", mediaData.category);

      if (newFile) {
        form.append("mediaUrl", newFile);
      }

      // ✅ Always send one of these flags
      if (removeExistingFile) {
        form.append("removeExisting", "true");
      } else if (!newFile) {
        form.append("keepExisting", "true");
      }

      const response = await axios.put(`${config.baseURL}/media/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.data.success) {
        setAlertMessage("Media updated successfully");
        setAlertVariant("success");
        setTimeout(() => navigate("/media"), 1500);
      } else {
        setAlertMessage(response.data.message || "Failed to update media");
        setAlertVariant("error");
      }
    } catch (err: any) {
      setAlertMessage(err.response?.data?.message || err.message);
      setAlertVariant("error");
    }
  };

  const renderCurrentMedia = () => {
    if (!mediaData.mediaUrl || removeExistingFile) return null;

    const fullUrl = `${MEDIA_BASE_URL}/${mediaData.mediaUrl}`;

    if (mediaData.mediaUrl.match(/\.(jpeg|jpg|png|gif)$/i)) {
      return (
        <img
          src={fullUrl}
          alt="current media"
          className="max-w-xs max-h-48 rounded object-contain border shadow-sm"
        />
      );
    } else if (mediaData.mediaUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <video
          src={fullUrl}
          className="max-w-xs max-h-48 rounded border shadow-sm"
          controls
        />
      );
    } else {
      return (
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-700"
        >
          View Current File: {mediaData.mediaUrl}
        </a>
      );
    }
  };

  return (
    <ComponentCard title="Edit Media">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading media data...</div>
        </div>
      ) : (
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
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={mediaData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Current Media Display */}
          {mediaData.mediaUrl && !removeExistingFile && (
            <div>
              <Label>Current Media</Label>
              <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                {renderCurrentMedia()}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove Current File
                  </button>
                </div>
              </div>
            </div>
          )}

          {removeExistingFile && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                Current file will be removed. Please upload a new file below.
              </p>
              <button
                type="button"
                onClick={() => setRemoveExistingFile(false)}
                className="mt-2 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
              >
                Cancel Removal
              </button>
            </div>
          )}

          {/* File Upload */}
          <div>
            <Label htmlFor="mediaFile">
              {mediaData.mediaUrl && !removeExistingFile
                ? "Replace File (Optional)"
                : removeExistingFile
                ? "Upload New File (Required)"
                : "Upload New File"}
            </Label>
            <input
              type="file"
              id="mediaFile"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              Supported formats: Images (JPEG, PNG, GIF) and Videos (MP4, WebM, OGG)
            </p>
            {newFile && (
              <p className="text-sm text-green-600 mt-1">
                New file selected: {newFile.name}
              </p>
            )}
          </div>

          {newFile && (
            <div>
              <Label>New File Preview</Label>
              <div className="mt-2 p-4 border rounded-lg bg-green-50">
                {newFile.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(newFile)}
                    alt="new file preview"
                    className="max-w-xs max-h-48 rounded object-contain border shadow-sm"
                  />
                ) : newFile.type.startsWith("video/") ? (
                  <video
                    src={URL.createObjectURL(newFile)}
                    className="max-w-xs max-h-48 rounded border shadow-sm"
                    controls
                  />
                ) : (
                  <p className="text-gray-600">
                    File ready for upload: {newFile.name}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/80"
            >
              Update Media
            </button>
            <button
              onClick={() => navigate("/media")}
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </ComponentCard>
  );
}
