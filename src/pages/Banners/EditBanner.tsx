import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import axios from "axios";
import config from "../../config";
import Alert from "../../components/ui/alert/Alert";

interface Banner {
  id: number | string;
  mediaUrl: string;
}

export default function EditBanner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [bannerData, setBannerData] = useState<Banner>({
    id: "",
    mediaUrl: "",
  });
  const [newFile, setNewFile] = useState<File | null>(null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(true);

  // Banner base path
  const BANNER_BASE_URL = `${config.baseURL}/uploads/banner`;

  const fetchBanner = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/banner/${id}`, { withCredentials: true });
      if (response.data.success) {
        setBannerData(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setAlertMessage("Error fetching banner");
      setAlertVariant("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, [id]);

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

      if (newFile) {
        form.append("mediaUrl", newFile);
      }

      // ✅ Always send one of these flags
      if (removeExistingFile) {
        form.append("removeExisting", "true");
      } else if (!newFile) {
        form.append("keepExisting", "true");
      }

      const response = await axios.put(`${config.baseURL}/banner/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.data.success) {
        setAlertMessage("Banner updated successfully");
        setAlertVariant("success");
        setTimeout(() => navigate("/banners"), 1500);
      } else {
        setAlertMessage(response.data.message || "Failed to update banner");
        setAlertVariant("error");
      }
    } catch (err: any) {
      setAlertMessage(err.response?.data?.message || err.message);
      setAlertVariant("error");
    }
  };

  const renderCurrentBanner = () => {
    if (!bannerData.mediaUrl || removeExistingFile) return null;

    const fullUrl = `${BANNER_BASE_URL}/${bannerData.mediaUrl}`;

    return (
      <img
        src={fullUrl}
        alt="current banner"
        className="max-w-xs max-h-48 rounded object-contain border shadow-sm"
      />
    );
  };

  return (
    <ComponentCard title="Edit Banner">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading banner data...</div>
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

          {/* Current Banner Display */}
          {bannerData.mediaUrl && !removeExistingFile && (
            <div>
              <Label>Current Banner</Label>
              <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                {renderCurrentBanner()}
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
            <Label htmlFor="bannerFile">
              {bannerData.mediaUrl && !removeExistingFile
                ? "Replace File (Optional)"
                : removeExistingFile
                ? "Upload New File (Required)"
                : "Upload New File"}
            </Label>
            <input
              type="file"
              id="bannerFile"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              Supported formats: Images (JPEG, PNG, GIF)
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
                <img
                  src={URL.createObjectURL(newFile)}
                  alt="new file preview"
                  className="max-w-xs max-h-48 rounded object-contain border shadow-sm"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/80"
            >
              Update Banner
            </button>
            <button
              onClick={() => navigate("/banners")}
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