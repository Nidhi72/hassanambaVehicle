import React, { useEffect, useState, useRef } from "react";
import "../../dataTables.css";
import axios from "axios";
import $ from "jquery";
import "datatables.net";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { Pen, Trash } from "lucide-react";
import ReactDOMServer from "react-dom/server";
import Alert from "../../components/ui/alert/Alert";

interface QueueRouteItem {
  id: number;
  title_en: string;
  imgUrl: string;
  coordinates: string;
  queueAnimation: string;
  queueVideo: string;
  createdAt: string;
  isActive: number;
}

const QueueRoutes: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [data, setData] = useState<QueueRouteItem[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");

  const tableRef = useRef<HTMLTableElement | null>(null);

  const QUEUE_ROUTE_BASE_URL = `${config.baseURL}/uploads/queueroute`;



  // Fetch queue routes
  const fetchData = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/queueroute`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching queue routes:", error);
      setAlertMessage("Error fetching queue routes");
      setAlertVariant("error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Delete queue route
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this queue route?")) return;
    try {
      await axios.delete(`${config.baseURL}/queueroute/${id}`, {
        withCredentials: true,
      });
      fetchData();
      setAlertMessage("Queue route deleted successfully");
      setAlertVariant("success");
    } catch (err) {
      console.error(err);
      setAlertMessage("Error deleting queue route");
      setAlertVariant("error");
    }
  };

  // DataTable setup
  useEffect(() => {
    if (tableRef.current) {
      const table = $(tableRef.current).DataTable({
        data: data,
        destroy: true,
        columns: [
          { title: "ID", data: "id" },
          { title: "Title", data: "title_en" },
          {
            title: "Image",
            data: "imgUrl",
            render: (imgUrl: string) => {
              if (!imgUrl) return "N/A";
              const fullUrl = `${QUEUE_ROUTE_BASE_URL}/image/${imgUrl}`;
              return `<img src="${fullUrl}" alt="queue route" class="max-w-[150px] max-h-[100px] object-contain rounded shadow"/>`;
            },
          },
          {
            title: "Queue Animation",
            data: "queueAnimation",
            render: (queueAnimation: string) => {
              if (!queueAnimation) return "N/A";
              const fullUrl = `${QUEUE_ROUTE_BASE_URL}/queueAnimation/${queueAnimation}`;
              return `<img src="${fullUrl}" alt="queue animation" class="max-w-[120px] max-h-[80px] object-contain rounded shadow"/>`;
            },
          },
          {
            title: "Queue Video",
            data: "queueVideo",
            render: (queueVideo: string) => {
              if (!queueVideo) return "N/A";
              const fullUrl = `${QUEUE_ROUTE_BASE_URL}/queueVideo/${queueVideo}`;
              return `<video class="max-w-[120px] max-h-[80px] object-contain rounded shadow" controls>
                <source src="${fullUrl}" type="video/mp4">
                Your browser does not support the video tag.
              </video>`;
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
          const queueRouteItem = rowData as QueueRouteItem;

          // Edit
          $(row)
            .find(".edit-icon")
            .off("click")
            .on("click", e => {
              e.stopPropagation();
              navigate(`/edit-queue/${queueRouteItem.id}`);
            });

          // Delete
          $(row)
            .find(".delete-icon")
            .off("click")
            .on("click", e => {
              e.stopPropagation();
              handleDelete(queueRouteItem.id);
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
        <p className="text-2xl font-bold text-black">Queue Routes</p>
        <button
          onClick={() => navigate("/add-queue")}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          + Add Queue Route
        </button>
      </div>

      {alertMessage && (
        <div className="mb-4">
          <Alert
            variant={alertVariant}
            title={alertVariant === "success" ? "Success" : "Error"}
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

export default QueueRoutes;
