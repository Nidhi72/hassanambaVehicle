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

interface FacilityItem {
  id: number;
  category_en: string;
  category_kn: string;
  title_en: string;
  title_kn: string;
  imgUrl: string;
  coordinates: string;
  queueAnimation: string;
  queueVideo: string;
  createdAt: string;
  isActive: number;
}

const Facilities: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [data, setData] = useState<FacilityItem[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");

  const tableRef = useRef<HTMLTableElement | null>(null);

  // 👇 facility base path (update here if server path changes)
  const FACILITY_BASE_URL = `${config.baseURL}/uploads/facilities`;

  // Format date for display (date only)
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Toggle facility status
  const toggleFacilityStatus = async (id: number) => {
    try {
      const response = await axios.put(`${config.baseURL}/facilities/toggle/${id}`, {}, {
        withCredentials: true,
      });
  
      if (response.data.success) {
        setData(prevData => 
          prevData.map(item => 
            item.id === id ? { ...item, isActive: item.isActive === 1 ? 0 : 1 } : item
          )
        );
        toast.success("Facility status toggled successfully");
      } else {
        throw new Error(response.data.message || "Failed to toggle facility status");
      }
    } catch (error: any) {
      console.error("Error toggling facility status:", error);
      toast.error(error.response?.data?.message || error.message || "Error toggling facility status");
    }
  };
  

  // fetch facilities
  const fetchData = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/facilities/admin`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
      setAlertMessage("Error fetching facilities");
      setAlertVariant("error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // delete facility
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this facility?")) return;
    try {
      await axios.delete(`${config.baseURL}/facilities/${id}`, {
        withCredentials: true,
      });
      fetchData();
      setAlertMessage("Facility deleted successfully");
      setAlertVariant('success');
    } catch (err) {
      console.error(err);
      setAlertMessage("Error deleting facility");
      setAlertVariant('error');
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
          { title: "Category", data: "category_en" },
          { title: "Title", data: "title_en" },
          {
            title: "Image",
            data: "imgUrl",
            render: (imgUrl: string) => {
              if (!imgUrl) return "N/A";
              const fullUrl = `${FACILITY_BASE_URL}/image/${imgUrl}`;
              return `<img src="${fullUrl}" alt="facility" class="max-w-[150px] max-h-[100px] object-contain rounded shadow"/>`;
            },
          },
          {
            title: "Queue Animation",
            data: "queueAnimation",
            render: (queueAnimation: string) => {
              if (!queueAnimation) return "N/A";
              const fullUrl = `${FACILITY_BASE_URL}/queueAnimation/${queueAnimation}`;
              return `<img src="${fullUrl}" alt="queue animation" class="max-w-[120px] max-h-[80px] object-contain rounded shadow"/>`;
            },
          },
          {
            title: "Queue Video",
            data: "queueVideo",
            render: (queueVideo: string) => {
              if (!queueVideo) return "N/A";
              const fullUrl = `${FACILITY_BASE_URL}/queueVideo/${queueVideo}`;
              return `<video class="max-w-[120px] max-h-[80px] object-contain rounded shadow" controls>
                <source src="${fullUrl}" type="video/mp4">
                Your browser does not support the video tag.
              </video>`;
            },
          },
          {
            title: "Date",
            data: "createdAt",
            render: (createdAt: string) => formatDate(createdAt),
          },
          {
            title: "Status",
            data: "isActive",
            render: (isActive: number, type: any, row: FacilityItem) => {
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
          const facilityItem = rowData as FacilityItem;

          // Handle status toggle
          $(row)
            .find(".status-toggle")
            .off("click")
            .on("click", (e) => {
                e.stopPropagation();
                const id = parseInt($(e.currentTarget).data('id'));
                toggleFacilityStatus(id);
            });

          // Handle edit
          $(row)
            .find(".edit-icon")
            .off("click")
            .on("click", (e) => {
              e.stopPropagation();
              navigate(`/edit-facility/${facilityItem.id}`);
            });

          // Handle delete
          $(row)
            .find(".delete-icon")
            .off("click")
            .on("click", (e) => {
              e.stopPropagation();
              handleDelete(facilityItem.id);
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
        <p className="text-2xl font-bold text-black">Facilities </p>
        <button
          onClick={() => navigate('/add-facility')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          + Add Facility
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
    </div>
  );
});

export default Facilities;