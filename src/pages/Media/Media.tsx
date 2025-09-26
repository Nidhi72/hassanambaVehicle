import React, { useEffect, useState, useRef } from "react";
import "../../dataTables.css";
import axios from "axios";
import $ from "jquery";
import "datatables.net";
import config from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Pen, Trash } from "lucide-react";
import ReactDOMServer from "react-dom/server";
import Alert from "../../components/ui/alert/Alert";





interface MediaItem {
  id: number;
  type: string;
  category: string;
  mediaUrl?: string;
  newFile?: File | null;
  removeFile?: boolean;
}

const Media: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [data, setData] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");
  const [formData, setFormData] = useState<{

    type: string;
    category: string;
    mediaUrl: File | null;
  }>({ type: "", category: "", mediaUrl: null });

  const tableRef = useRef<HTMLTableElement | null>(null);

  // 👇 media base path (update here if server path changes)
  const MEDIA_BASE_URL = `${config.baseURL}/uploads/media`;


  // fetch media
  const fetchData = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/media`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // delete media
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this media?")) return;
    try {
      await axios.delete(`${config.baseURL}/media/${id}`, {
        withCredentials: true,
      });
      fetchData();
      setAlertMessage("User deleted successfully");
      setAlertVariant('success');
    } catch (err) {
      console.error(err);
      toast.error("Error deleting media");
    }
  };

  // add media
  const handleAddMedia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.type || !formData.category) {
      toast.error("Type and Category are required");
      return;
    }
    
    if (!formData.mediaUrl) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      const form = new FormData();
      form.append("type", formData.type);
      form.append("category", formData.category);
      form.append("mediaUrl", formData.mediaUrl);

      await axios.post(`${config.baseURL}/media`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("Media added successfully");
      setIsAddModalOpen(false);
      setFormData({ type: "", category: "", mediaUrl: null });
      fetchData();
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Error adding media";
      toast.error(errorMessage);
    }
  };

  // update media
  const handleUpdateMedia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!selectedMedia) return;

      // Validation
      if (!selectedMedia.type || !selectedMedia.category) {
        toast.error("Type and Category are required");
        return;
      }

      const form = new FormData();
      form.append("type", selectedMedia.type);
      form.append("category", selectedMedia.category);

      // Only append mediaUrl if there's a new file
      if (selectedMedia.newFile) {
        form.append("mediaUrl", selectedMedia.newFile);
      }
      // If removing file, we need to handle this on the backend
      // For now, we'll keep the existing mediaUrl if no new file is provided

      await axios.put(
        `${config.baseURL}/media/${selectedMedia.id}`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast.success("Media updated successfully");
      setIsModalOpen(false);
      setSelectedMedia(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Error updating media";
      toast.error(errorMessage);
    }
  };

  // datatable setup
  useEffect(() => {
    if (tableRef.current) {
      const table = $(tableRef.current).DataTable({
        data: data,
        destroy: true,
        columns: [
          { title: "ID", data: "id" },
          { title: "Type", data: "type" },
          { title: "Category", data: "category" },
          {
            title: "Media",
            data: "mediaUrl",
            render: (mediaUrl: string) => {
              if (!mediaUrl) return "N/A";
              const fullUrl = `${MEDIA_BASE_URL}/${mediaUrl}`;
  
              if (mediaUrl.match(/\.(jpeg|jpg|png|gif)$/i)) {
                return `<img src="${fullUrl}" alt="media" class="max-w-[300px] max-h-[200px] object-contain rounded shadow"/>`;
              } else if (mediaUrl.match(/\.(mp4|webm|ogg)$/i)) {
                return `<video src="${fullUrl}" class="max-w-[400px] max-h-[250px] rounded shadow" controls></video>`;
              } else {
                return `<a href="${fullUrl}" target="_blank" class="text-blue-500 underline">View</a>`;
              }
            },
          },
          {
            title: "Edit",
            data: null,
            orderable: false,
            render: () =>
              ReactDOMServer.renderToStaticMarkup(
                <Pen className="edit-icon text-blue-500 w-5 h-5 cursor-pointer hover:text-blue-600" />
              ),
          },
          {
            title: "Delete",
            data: null,
            orderable: false,
            render: () =>
              ReactDOMServer.renderToStaticMarkup(
                <Trash className="delete-icon text-red-500 w-5 h-5 cursor-pointer hover:text-red-600" />
              ),
          },
        ],
        rowCallback: (row: Node, rowData: any) => {
          const mediaItem = rowData as MediaItem;
  
          $(row)
            .find(".edit-icon")
            .off("click")
            .on("click", (e) => {
              e.stopPropagation();
              navigate(`/edit-media/${mediaItem.id}`);
            });
  
          $(row)
            .find(".delete-icon")
            .off("click")
            .on("click", (e) => {
              e.stopPropagation();
              handleDelete(mediaItem.id);
            });
        },
      });
  
      return () => {
        if (table) table.destroy();
      };
    }
  }, [data]);

  return (
    <div className="p-4 max-w-full mx-auto font-noto">
      <div className="flex justify-between items-center mb-4">
        <p className="text-2xl font-bold text-black">Media</p>
        <button
          onClick={() => navigate("/add-media")}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          + Add Media
        </button>
      </div>
      {alertMessage && (
        <div className="mb-4">
          <Alert
            variant={alertVariant}
            title={alertVariant === 'success' ? "Success" : "Error"}
            message={alertMessage}
            showLink={false}
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table ref={tableRef} className="display w-full text-left"></table>
      </div>

      {/* Add Media Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsAddModalOpen(false)}
          ></div>
          <div className="bg-white rounded-lg p-6 z-50 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Add Media</h2>
            <form onSubmit={handleAddMedia} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">Type *</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., image, video, document"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., gallery, events, announcements"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Upload File *</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      mediaUrl: e.target.files ? e.target.files[0] : null,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Supported formats: Images (JPEG, PNG, GIF) and Videos (MP4, WebM, OGG)
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormData({ type: "", category: "", mediaUrl: null });
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Media
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Media Modal */}
      {isModalOpen && selectedMedia && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-lg p-6 z-50 max-w-2xl w-full overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Edit Media</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedMedia(null);
                }}
                className="text-2xl font-bold hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateMedia} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">Type *</label>
                <input
                  type="text"
                  value={selectedMedia.type}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSelectedMedia({
                      ...selectedMedia,
                      type: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Category *</label>
                <input
                  type="text"
                  value={selectedMedia.category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSelectedMedia({
                      ...selectedMedia,
                      category: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              {/* Current Media Preview */}
              {selectedMedia.mediaUrl && !selectedMedia.removeFile && (
                <div className="mb-4">
                  <p className="font-semibold mb-2">Current Media:</p>
                  <div className="border rounded p-3 bg-gray-50">
                    {selectedMedia.mediaUrl.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                      <img
                        src={`${MEDIA_BASE_URL}/${selectedMedia.mediaUrl}`}
                        alt="media"
                        className="max-w-xs max-h-48 rounded object-contain"
                      />
                    ) : selectedMedia.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={`${MEDIA_BASE_URL}/${selectedMedia.mediaUrl}`}
                        className="max-w-xs max-h-48 rounded"
                        controls
                      />
                    ) : (
                      <a
                        href={`${MEDIA_BASE_URL}/${selectedMedia.mediaUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View Current File: {selectedMedia.mediaUrl}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Upload new file */}
              <div>
                <label className="block mb-1 font-semibold">
                  {selectedMedia.mediaUrl ? "Replace File (Optional)" : "Upload New File"}
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSelectedMedia({
                      ...selectedMedia,
                      newFile: e.target.files ? e.target.files[0] : null,
                      removeFile: false,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Leave empty to keep current file. Supported formats: Images (JPEG, PNG, GIF) and Videos (MP4, WebM, OGG)
                </p>
                {selectedMedia.newFile && (
                  <p className="text-sm text-green-600 mt-1">
                    New file selected: {selectedMedia.newFile.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedMedia(null);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default Media;