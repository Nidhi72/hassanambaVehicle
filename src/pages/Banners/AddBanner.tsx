import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";

interface UploadedFile {
  preview: string;
  originalFile: File;
}

const AddBannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile({
        preview: URL.createObjectURL(f),
        originalFile: f,
      });
      toast.success(`File "${f.name}" added`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const removeFile = () => {
    if (file) {
      URL.revokeObjectURL(file.preview);
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setAlertMessage("Please select a file to upload");
      setAlertVariant("error");
      return;
    }

    setIsUploading(true);
    setAlertMessage(null);

    try {
      const formData = new FormData();
      formData.append("mediaUrl", file.originalFile);

      const response = await axios.post(`${config.baseURL}/banner`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.data.success) {
        setAlertMessage("Banner uploaded successfully");
        setAlertVariant("success");

        // Clean up
        removeFile();

        setTimeout(() => navigate("/banners"), 1500);
      } else {
        setAlertMessage(response.data.error || "Failed to upload banner");
        setAlertVariant("error");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setAlertMessage(error.response?.data?.error || "Error uploading banner");
      setAlertVariant("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4  mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Add Banner</h1>

      {alertMessage && (
        <Alert
          variant={alertVariant}
          title={alertVariant === "success" ? "Success" : "Error"}
          message={alertMessage}
          showLink={false}
        />
      )}

      <ComponentCard title="Upload Banner">
        <div
          {...getRootProps()}
          className={`transition border border-dashed cursor-pointer rounded-xl p-7 text-center ${
            isDragActive
              ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
              : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
          }`}
        >
          <input {...getInputProps()} />
          <div className="dz-message flex flex-col items-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <svg
                    className="fill-current w-8 h-8"
                    viewBox="0 0 29 28"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                    />
                  </svg>
                </div>
              </div>

              <h4 className="mb-3 font-semibold text-gray-800 text-xl dark:text-white">
                {isDragActive ? "Drop Banners Here" : "Drag & Drop Banners Here"}
              </h4>

              <span className="text-center mb-5 block w-full max-w-sm text-sm text-gray-700 dark:text-gray-400">
                Drag and drop your banners here or browse to select
              </span>

              <span className="font-medium underline text-sm text-brand-500 hover:text-brand-600">
                Browse Banners
              </span>
            </div>
        </div>
      </ComponentCard>

      {file && (
  <div className="space-y-4">
    {/* Preview Image */}
    <div className="flex justify-center">
      <img
        src={file.preview}
        alt="Banner Preview"
        className="max-h-64 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
      />
    </div>

    {/* Action Buttons */}
    <div className="flex justify-between items-center">
      <button
        onClick={removeFile}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Remove
      </button>

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className={`px-6 py-2 rounded text-white flex items-center space-x-2 transition-colors ${
          isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-brand-500 hover:bg-brand-600"
        }`}
      >
        {isUploading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Uploading...</span>
          </>
        ) : (
          <span>Upload Banner</span>
        )}
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default AddBannerPage;
