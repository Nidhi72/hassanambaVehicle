import React, { useState } from "react";
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
  originalFile: File;
}

const AddQueueRoutePage: React.FC = () => {
  const navigate = useNavigate();

  // Fields
  const [titleEn, setTitleEn] = useState("");
  const [titleKn, setTitleKn] = useState("");
  const [coordinates, setCoordinates] = useState("");

  const [imgFile, setImgFile] = useState<UploadedFile | null>(null);
  const [queueAnimationFile, setQueueAnimationFile] = useState<UploadedFile | null>(null);
  const [queueVideoFile, setQueueVideoFile] = useState<UploadedFile | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");

  // Handle file drops
  const handleDrop = (setter: React.Dispatch<React.SetStateAction<UploadedFile | null>>) => (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      originalFile: file,
    };
    setter(newFile);
    toast.success(`${file.name} added`);
  };

  const removeFile = (setter: React.Dispatch<React.SetStateAction<UploadedFile | null>>, file?: UploadedFile) => {
    if (file) URL.revokeObjectURL(file.preview);
    setter(null);
  };

  const { getRootProps: getImgRootProps, getInputProps: getImgInputProps } = useDropzone({
    onDrop: handleDrop(setImgFile),
    accept: { "image/*": [] },
    multiple: false,
  });

  const { getRootProps: getQueueAnimRootProps, getInputProps: getQueueAnimInputProps } = useDropzone({
    onDrop: handleDrop(setQueueAnimationFile),
    accept: { "image/*": [] },
    multiple: false,
  });

  const { getRootProps: getQueueVideoRootProps, getInputProps: getQueueVideoInputProps } = useDropzone({
    onDrop: handleDrop(setQueueVideoFile),
    accept: { "video/*": [] },
    multiple: false,
  });

  // Handle upload
  const handleUpload = async () => {
    if (!titleEn || !coordinates || !imgFile) {
      setAlertMessage("Please fill required fields and add an image");
      setAlertVariant("error");
      return;
    }

    setIsUploading(true);
    setAlertMessage(null);

    try {
      const formData = new FormData();
      formData.append("title_en", titleEn);
      formData.append("title_kn", titleKn || titleEn); // fallback if empty
      formData.append("coordinates", coordinates);
      formData.append("imgUrl", imgFile.originalFile);
      if (queueAnimationFile) formData.append("queueAnimation", queueAnimationFile.originalFile);
      if (queueVideoFile) formData.append("queueVideo", queueVideoFile.originalFile);

      // Debug: Log what's being sent
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await axios.post(`${config.baseURL}/queueroute`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setAlertMessage("Queue route added successfully");
      setAlertVariant("success");

      // Clean up
      [imgFile, queueAnimationFile, queueVideoFile].forEach(f => f && URL.revokeObjectURL(f.preview));
      setImgFile(null);
      setQueueAnimationFile(null);
      setQueueVideoFile(null);
      setTitleEn("");
      setTitleKn("");
      setCoordinates("");

      setTimeout(() => navigate("/queue-routes"), 1500);
    } catch (error: any) {
      console.error("Error adding queue route:", error);
      setAlertMessage(error.response?.data?.message || "Error adding queue route");
      setAlertVariant("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Add Queue Route</h1>

      {alertMessage && <Alert variant={alertVariant} title={alertVariant === "success" ? "Success" : "Error"} message={alertMessage} showLink={false} />}

      {/* Titles */}
      <ComponentCard title="Titles">
        <div className="space-y-4">
          <input
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder="Title EN"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
          />
          <input
            type="text"
            value={titleKn}
            onChange={(e) => setTitleKn(e.target.value)}
            placeholder="Title KN "
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
          />
        </div>
      </ComponentCard>

      {/* Coordinates */}
      <ComponentCard title="Coordinates">
        <input
          type="text"
          value={coordinates}
          onChange={(e) => setCoordinates(e.target.value)}
          placeholder="Latitude, Longitude"
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
        />
      </ComponentCard>

      {/* Image Upload */}
      <ComponentCard title="Image">
        <div {...getImgRootProps()} className="p-6 border-dashed border rounded-md cursor-pointer text-center dark:bg-gray-800 dark:border-gray-700">
          <input {...getImgInputProps()} />
          {imgFile ? (
            <div className="flex items-center justify-between">
              <img src={imgFile.preview} className="w-24 h-24 object-cover rounded" />
              <button onClick={() => removeFile(setImgFile, imgFile)} className="text-red-500">Remove</button>
            </div>
          ) : (
            <p>Drag & Drop Image or Click to Browse</p>
          )}
        </div>
      </ComponentCard>

      {/* Queue Animation */}
      <ComponentCard title="Queue Animation">
        <div {...getQueueAnimRootProps()} className="p-6 border-dashed border rounded-md cursor-pointer text-center dark:bg-gray-800 dark:border-gray-700">
          <input {...getQueueAnimInputProps()} />
          {queueAnimationFile ? (
            <div className="flex items-center justify-between">
              <img src={queueAnimationFile.preview} className="w-24 h-24 object-cover rounded" />
              <button onClick={() => removeFile(setQueueAnimationFile, queueAnimationFile)} className="text-red-500">Remove</button>
            </div>
          ) : (
            <p>Drag & Drop Queue Animation or Click to Browse</p>
          )}
        </div>
      </ComponentCard>

      {/* Queue Video */}
      <ComponentCard title="Queue Video">
        <div {...getQueueVideoRootProps()} className="p-6 border-dashed border rounded-md cursor-pointer text-center dark:bg-gray-800 dark:border-gray-700">
          <input {...getQueueVideoInputProps()} />
          {queueVideoFile ? (
            <div className="flex items-center justify-between">
              <video src={queueVideoFile.preview} className="w-24 h-24 object-cover rounded" controls />
              <button onClick={() => removeFile(setQueueVideoFile, queueVideoFile)} className="text-red-500">Remove</button>
            </div>
          ) : (
            <p>Drag & Drop Queue Video or Click to Browse</p>
          )}
        </div>
      </ComponentCard>

      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-gray-400"
        >
          {isUploading ? "Uploading..." : "Add Queue Route"}
        </button>
      </div>
    </div>
  );
};

export default AddQueueRoutePage;