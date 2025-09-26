import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";

interface UploadedFile {
  id: string;
  preview: string;
  displayType: string;
  originalFile: File;
}

const AddMediaPage: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");

  // Fetch existing categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/media/category`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setAlertMessage("Error fetching categories");
      setAlertVariant("error");
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      displayType: file.type.startsWith("image/") ? "image" : "video",
      originalFile: file,
    }));
    

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    toast.success(`${acceptedFiles.length} file(s) added`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
    },
    multiple: true,
  });
  

  const removeFile = (fileId: string) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles.find((f) => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter((f) => f.id !== fileId);
    });
  };

  const handleCategoryChange = (value: string) => {
    if (value === "add_new") {
      setShowNewCategoryInput(true);
      setSelectedCategory("");
    } else {
      setShowNewCategoryInput(false);
      setSelectedCategory(value);
      setNewCategory("");
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setAlertMessage("Please select at least one file");
      setAlertVariant("error");
      return;
    }

    const categoryToUse = showNewCategoryInput ? newCategory.trim() : selectedCategory;

if (!categoryToUse) {
  setAlertMessage("Please select or enter a category");
  setAlertVariant("error");
  return;
}

// ✅ Check uniqueness if adding a new category
if (showNewCategoryInput && categories.includes(categoryToUse)) {
  setAlertMessage(`Category "${categoryToUse}" already exists. Please choose a different name.`);
  setAlertVariant("error");
  return;
}


    setIsUploading(true);
    setAlertMessage(null); // Clear any previous alerts

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("category", categoryToUse);
          formData.append("mediaUrl", file.originalFile);

          await axios.post(`${config.baseURL}/media`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });

          successCount++;
        } catch (error) {
          console.error(`Error uploading ${file.originalFile.name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        setAlertMessage(`${successCount} file(s) uploaded successfully`);
        setAlertVariant("success");

        // Clean up
        files.forEach((file) => URL.revokeObjectURL(file.preview));
        setFiles([]);
        setSelectedCategory("");
        setNewCategory("");
        setShowNewCategoryInput(false);

        if (showNewCategoryInput && newCategory.trim()) {
          await fetchCategories();
        }

        // Navigate to media page after a short delay
        setTimeout(() => navigate("/media"), 1500);
      }

      if (errorCount > 0) {
        const errorMsg = successCount > 0 
          ? `${successCount} file(s) uploaded successfully, but ${errorCount} file(s) failed to upload`
          : `${errorCount} file(s) failed to upload`;
        setAlertMessage(errorMsg);
        setAlertVariant("error");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setAlertMessage(error.response?.data?.message || "Error uploading files");
      setAlertVariant("error");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Add Media
        </h1>
      </div>

      {/* Alert Component */}
      {alertMessage && (
        <Alert
          variant={alertVariant}
          title={alertVariant === "success" ? "Success" : "Error"}
          message={alertMessage}
          showLink={false}
        />
      )}

      {/* Dropzone */}
      <ComponentCard title="Upload Files">
        <div className="transition border border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-brand-500 dark:border-gray-700">
          <div
            {...getRootProps()}
            className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10 transition-all duration-200 ${
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
                {isDragActive ? "Drop Media Here" : "Drag & Drop Media Here"}
              </h4>

              <span className="text-center mb-5 block w-full max-w-sm text-sm text-gray-700 dark:text-gray-400">
                Drag and drop your media here or browse to select
              </span>

              <span className="font-medium underline text-sm text-brand-500 hover:text-brand-600">
                Browse Media
              </span>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Category Selection */}
      {files.length > 0 && (
        <ComponentCard title="Category Selection">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Category
              </label>
              <select
                value={showNewCategoryInput ? "add_new" : selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">Choose a category...</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="add_new">+ Add New Category</option>
              </select>
            </div>

            {showNewCategoryInput && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Category Name
                </label>
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewCategory(value);

                      if (categories.includes(value.trim())) {
                        setAlertMessage(`Category "${value}" already exists.`);
                        setAlertVariant("error");
                      } else {
                        setAlertMessage(null);
                      }
                    }}
                    placeholder="Enter new category name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />

              </div>
            )}
          </div>
        </ComponentCard>
      )}
      
      

      {/* File Preview */}
      {files.length > 0 && (
        <ComponentCard title={`Selected Media (${files.length})`}>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
  {file.displayType === "image" ? (
    <img
      src={file.preview}
      alt={file.originalFile.name}
      className="w-12 h-12 object-cover rounded"
    />
  ) : (
    <video
      src={file.preview}
      className="w-12 h-12 object-cover rounded"
      controls
    />
  )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.originalFile.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Image
                      </span>
                      <span>{formatFileSize(file.originalFile.size)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full dark:hover:bg-red-900/20"
                  title="Remove file"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
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
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>Upload Media</span>
                </>
              )}
            </button>
          </div>
        </ComponentCard>
      )}
    </div>
  );
};

export default AddMediaPage;