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

interface BannerItem {
  id: number;
  mediaUrl: string;
  isActive: number;
  date?: string;
  newFile?: File | null;
}

const Banner: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [data, setData] = useState<BannerItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");
  const [formData, setFormData] = useState<{
    mediaUrl: File | null;
  }>({ mediaUrl: null });

  const tableRef = useRef<HTMLTableElement | null>(null);

  // 👇 banner base path (update here if server path changes)
  const BANNER_BASE_URL = `${config.baseURL}/uploads/banner`;

  // Format date for display
// Format date for display (date only)
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


  // Toggle banner status
  const toggleBannerStatus = async (id: number, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      
      // Update local state immediately for better UX
      setData(prevData => 
        prevData.map(item => 
          item.id === id 
            ? { ...item, isActive: newStatus }
            : item
        )
      );

      // Make API call to toggle status on server using your toggle endpoint
      const response = await axios.put(`${config.baseURL}/banner/toggle/${id}/`, {}, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success(`Banner ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`);
      } else {
        throw new Error(response.data.message || 'Failed to toggle banner status');
      }
    } catch (error: any) {
      console.error("Error updating banner status:", error);
      
      // Revert the local state change if API call fails
      setData(prevData => 
        prevData.map(item => 
          item.id === id 
            ? { ...item, isActive: currentStatus }
            : item
        )
      );
      
      const errorMessage = error.response?.data?.message || error.message || "Error updating banner status";
      toast.error(errorMessage);
    }
  };

  // fetch banners
  const fetchData = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/banner/admin`, {
        withCredentials: true,
      });
      if (response.data.success) {
        // Check if the API returns objects with full data or just mediaUrl strings
        let transformedData: BannerItem[];
        
        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          // If the first item is a string, it's the old format
          if (typeof response.data.data[0] === 'string') {
            transformedData = response.data.data.map((mediaUrl: string, index: number) => ({
              id: index + 1, // Generate ID from index
              mediaUrl: mediaUrl,
              isActive: 1, // Default to active
              date: new Date().toISOString() // Current date as placeholder
            }));
          } else {
            // If it's already objects with id, mediaUrl, etc.
            transformedData = response.data.data.map((item: any, index: number) => ({
              id: item.id || index + 1,
              mediaUrl: item.mediaUrl,
              isActive: item.isActive !== undefined ? item.isActive : 1,
              date: item.date || item.createdAt || new Date().toISOString()
            }));
          }
        } else {
          transformedData = [];
        }
        
        setData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setAlertMessage("Error fetching banners");
      setAlertVariant("error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // delete banner
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await axios.delete(`${config.baseURL}/banner/${id}`, {
        withCredentials: true,
      });
      fetchData();
      setAlertMessage("Banner deleted successfully");
      setAlertVariant('success');
    } catch (err) {
      console.error(err);
      setAlertMessage("Error deleting banner");
      setAlertVariant('error');
    }
  };

  // add banner
  const handleAddBanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.mediaUrl) {
      toast.error("Please select a banner image to upload");
      return;
    }

    try {
      const form = new FormData();
      form.append("mediaUrl", formData.mediaUrl);

      await axios.post(`${config.baseURL}/banner`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("Banner added successfully");
      setIsAddModalOpen(false);
      setFormData({ mediaUrl: null });
      fetchData();
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Error adding banner";
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
          {
            title: "Banner Image",
            data: "mediaUrl",
            render: (mediaUrl: string) => {
              if (!mediaUrl) return "N/A";
              const fullUrl = `${BANNER_BASE_URL}/${mediaUrl}`;
              return `<img src="${fullUrl}" alt="banner" class="max-w-[300px] max-h-[150px] object-contain rounded shadow"/>`;
            },
          },
          {
            title: "Date",
            data: "date",
            render: (date: string) => formatDate(date),
          },
          {
            title: "Status",
            data: "isActive",
            render: (isActive: number, type: any, row: BannerItem) => {
              const statusClass = isActive === 1 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-red-100 text-red-800 hover:bg-red-200';
              const statusText = isActive === 1 ? 'Active' : 'Inactive';
              console.log(type);

              return `<button class="status-toggle px-3 py-1 ${statusClass} rounded-full text-xs font-medium cursor-pointer transition-colors" data-id="${row.id}" data-status="${isActive}">
                ${statusText}
              </button>`;
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
          const bannerItem = rowData as BannerItem;

          // Handle status toggle
          $(row)
            .find(".status-toggle")
            .off("click")
            .on("click", (e) => {
              e.stopPropagation();
              const id = parseInt($(e.currentTarget).data('id'));
              const currentStatus = parseInt($(e.currentTarget).data('status'));
              toggleBannerStatus(id, currentStatus);
            });

          // Handle edit
          $(row)
            .find(".edit-icon")
            .off("click")
            .on("click", (e) => {
              e.stopPropagation();
              navigate(`/edit-banner/${bannerItem.id}`);
            });

          // Handle delete
          $(row)
            .find(".delete-icon")
            .off("click")
            .on("click", (e) => {
              e.stopPropagation();
              handleDelete(bannerItem.id);
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
        <p className="text-2xl font-bold text-black">Banner Management</p>
        <button
          onClick={() => navigate('/add-banner')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          + Add Banner
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

      {/* Add Banner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsAddModalOpen(false)}
          ></div>
          <div className="bg-white rounded-lg p-6 z-50 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Add Banner</h2>
            <form onSubmit={handleAddBanner} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">Banner Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      mediaUrl: e.target.files ? e.target.files[0] : null,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Supported formats: JPEG, PNG, GIF. Recommended size: 1920x1080px for best results.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormData({ mediaUrl: null });
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default Banner;