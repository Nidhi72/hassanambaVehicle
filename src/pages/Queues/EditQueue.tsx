import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Alert from "../../components/ui/alert/Alert";
import axios from "axios";
import config from "../../config";

interface QueueRouteItem {
  id: number;
  title_en: string;
  title_kn: string;
  coordinates: string;
  imgUrl: string;
  queueAnimation: string;
  queueVideo: string;
  createdAt: string;
  isActive: number;
}

export default function EditQueueRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [queueRouteData, setQueueRouteData] = useState<QueueRouteItem>({
    id: 0,
    title_en: "",
    title_kn: "",
    coordinates: "",
    imgUrl: "",
    queueAnimation: "",
    queueVideo: "",
    createdAt: "",
    isActive: 1,
  });

  const [newImg, setNewImg] = useState<File | null>(null);
  const [removeImg, setRemoveImg] = useState(false);

  const [newQueueAnimation, setNewQueueAnimation] = useState<File | null>(null);
  const [removeQueueAnimation, setRemoveQueueAnimation] = useState(false);

  const [newQueueVideo, setNewQueueVideo] = useState<File | null>(null);
  const [removeQueueVideo, setRemoveQueueVideo] = useState(false);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(true);

  const QUEUE_ROUTE_BASE_URL = `${config.baseURL}/uploads/queueroute`;

  const fetchQueueRoute = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/queueroute/${id}`, { withCredentials: true });
      if (response.data.success) {
        setQueueRouteData(response.data.data);
      } else {
        setAlertMessage("Failed to fetch queue route data");
        setAlertVariant("error");
      }
    } catch (err) {
      console.error(err);
      setAlertMessage("Error fetching queue route data");
      setAlertVariant("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueRoute();
  }, [id]);

  const handleChange = (field: keyof QueueRouteItem, value: any) => {
    setQueueRouteData({ ...queueRouteData, [field]: value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "img" | "animation" | "video"
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (type === "img") {
      setNewImg(file);
      if (file) setRemoveImg(false);
    } else if (type === "animation") {
      setNewQueueAnimation(file);
      if (file) setRemoveQueueAnimation(false);
    } else if (type === "video") {
      setNewQueueVideo(file);
      if (file) setRemoveQueueVideo(false);
    }
  };
  
  const handleRemoveFile = (type: "img" | "animation" | "video") => {
    if (type === "img") {
      setRemoveImg(true);
      setNewImg(null);
    } else if (type === "animation") {
      setRemoveQueueAnimation(true);
      setNewQueueAnimation(null);
    } else if (type === "video") {
      setRemoveQueueVideo(true);
      setNewQueueVideo(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const form = new FormData();
      form.append("title_en", queueRouteData.title_en);
      form.append("title_kn", queueRouteData.title_kn);
      form.append("coordinates", queueRouteData.coordinates);
  
      // Handle image
      if (newImg) {
        form.append("imgUrl", newImg);
      } else if (removeImg) {
        // Explicitly tell backend to remove this file
        form.append("removeImg", "true");
      }
      // If neither newImg nor removeImg, backend will keep existing
  
      // Handle queue animation
      if (newQueueAnimation) {
        form.append("queueAnimation", newQueueAnimation);
      } else if (removeQueueAnimation) {
        // Explicitly tell backend to remove this file
        form.append("removeQueueAnimation", "true");
      }
      // If neither newQueueAnimation nor removeQueueAnimation, backend will keep existing
  
      // Handle queue video
      if (newQueueVideo) {
        form.append("queueVideo", newQueueVideo);
      } else if (removeQueueVideo) {
        // Explicitly tell backend to remove this file
        form.append("removeQueueVideo", "true");
      }
      // If neither newQueueVideo nor removeQueueVideo, backend will keep existing
  
      const response = await axios.put(`${config.baseURL}/queueroute/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
  
      if (response.data.success) {
        setAlertMessage("Queue route updated successfully");
        setAlertVariant("success");
        setTimeout(() => navigate("/queue-routes"), 1500);
      } else {
        setAlertMessage(response.data.message || "Failed to update queue route");
        setAlertVariant("error");
      }
    } catch (err: any) {
      setAlertMessage(err.response?.data?.message || err.message);
      setAlertVariant("error");
    }
  };

  const renderPreview = (url: string, type: "img" | "animation" | "video") => {
    if (!url) return null;
  
    let fullUrl = "";
    if (type === "img") fullUrl = `${QUEUE_ROUTE_BASE_URL}/image/${url}`;
    else if (type === "animation") fullUrl = `${QUEUE_ROUTE_BASE_URL}/queueAnimation/${url}`;
    else if (type === "video") fullUrl = `${QUEUE_ROUTE_BASE_URL}/queueVideo/${url}`;
  
    if (type === "video") {
      return (
        <video src={fullUrl} className="max-w-xs max-h-48 rounded border shadow-sm" controls />
      );
    }
    return (
      <img src={fullUrl} alt={type} className="max-w-xs max-h-48 rounded border shadow-sm object-contain" />
    );
  };

  const renderFileSection = (
    label: string,
    currentUrl: string,
    type: "img" | "animation" | "video",
    newFile: File | null,
    removeFlag: boolean,
    handleNewFile: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleRemove: (type: "img" | "animation" | "video") => void
  ) => (
    <div>
      <Label>{label}</Label>
  
      {!removeFlag && currentUrl && (
        <div className="mt-2 p-4 border rounded-lg bg-gray-50">
          {renderPreview(currentUrl, type)}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleRemove(type)}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Remove Current File
            </button>
          </div>
        </div>
      )}
  
      {removeFlag && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-2">
          <p className="text-red-700 text-sm">
            Current file will be removed. Please upload a new file below.
          </p>
          <button
            type="button"
            onClick={() => {
              if (type === "img") setRemoveImg(false);
              else if (type === "animation") setRemoveQueueAnimation(false);
              else setRemoveQueueVideo(false);
            }}
            className="mt-2 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          >
            Cancel Removal
          </button>
        </div>
      )}
  
      <div className="mt-2">
        <Label htmlFor={`${type}File`}>
          {currentUrl && !removeFlag
            ? "Replace File (Optional)"
            : removeFlag
            ? "Upload New File (Required)"
            : "Upload New File"}
        </Label>
        <input
          type="file"
          id={`${type}File`}
          accept={type === "video" ? "video/*" : "image/*"}
          onChange={handleNewFile}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {newFile && (
          <div className="mt-2 p-4 border rounded-lg bg-green-50">
            <Label>New File Preview</Label>
            {newFile.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(newFile)}
                alt="new file preview"
                className="max-w-xs max-h-48 rounded object-contain border shadow-sm"
              />
            ) : (
              <video
                src={URL.createObjectURL(newFile)}
                className="max-w-xs max-h-48 rounded border shadow-sm"
                controls
              />
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ComponentCard title="Edit Queue Route">
      {loading ? (
        <div className="flex justify-center items-center py-8">Loading queue route data...</div>
      ) : (
        <div className="space-y-6">
          {alertMessage && <Alert variant={alertVariant} title={alertVariant === "success" ? "Success" : "Error"} message={alertMessage} showLink={false} />}

          {/* Title */}
          <div>
            <Label htmlFor="title_en">Title (EN)</Label>
            <input id="title_en" type="text" value={queueRouteData.title_en} onChange={(e) => handleChange("title_en", e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <Label htmlFor="title_kn">Title (KN)</Label>
            <input id="title_kn" type="text" value={queueRouteData.title_kn} onChange={(e) => handleChange("title_kn", e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Coordinates */}
          <div>
            <Label htmlFor="coordinates">Coordinates</Label>
            <input id="coordinates" type="text" value={queueRouteData.coordinates} onChange={(e) => handleChange("coordinates", e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Files */}
          {renderFileSection(
            "Current Image",
            queueRouteData.imgUrl,
            "img",
            newImg,
            removeImg,
            (e) => handleFileChange(e, "img"),
            handleRemoveFile
          )}

          {renderFileSection(
            "Current Queue Animation",
            queueRouteData.queueAnimation,
            "animation",
            newQueueAnimation,
            removeQueueAnimation,
            (e) => handleFileChange(e, "animation"),
            handleRemoveFile
          )}

          {renderFileSection(
            "Current Queue Video",
            queueRouteData.queueVideo,
            "video",
            newQueueVideo,
            removeQueueVideo,
            (e) => handleFileChange(e, "video"),
            handleRemoveFile
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80">Update Queue Route</button>
            <button onClick={() => navigate("/queue-routes")} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      )}
    </ComponentCard>
  );
}