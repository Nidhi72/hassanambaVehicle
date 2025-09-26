import React, { useEffect, useState, useRef } from 'react';
import '../../dataTables.css';
import axios from 'axios';
import $ from 'jquery';
import 'datatables.net';
import config from "../../config";
import { useNavigate } from 'react-router-dom'; 
import Alert from "../../components/ui/alert/Alert";
import ReactDOMServer from "react-dom/server";
import { Pen, Trash } from 'lucide-react';

// Define the notification type
interface Notification {
  id: number | string;
  title?: {
    en: string;
    kn: string;
  } | string;
  message?: {
    en: string;
    kn: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const Notifications: React.FC = React.memo(() => {
  const [data, setData] = useState<Notification[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const tableRef = useRef<HTMLTableElement | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/notifications`, { withCredentials: true });
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setAlertMessage("Error fetching notifications");
      setAlertVariant('error');
    }
  };

  const handleDelete = async (notificationId: number | string) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;

    try {
      await axios.delete(`${config.baseURL}/notifications/${notificationId}`, { withCredentials: true });
      setAlertMessage("Notification deleted successfully");
      setAlertVariant('success');
      fetchData();
    } catch (err) {
      console.error(err);
      setAlertMessage("Error deleting notification");
      setAlertVariant('error');
    }
  };

  // const formatDate = (dateString: string) => {
  //   if (!dateString) return 'N/A';
  //   try {
  //     return new Date(dateString).toLocaleString();
  //   } catch {
  //     return dateString;
  //   }
  // };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getEnglishText = (textObj: any) => {
    if (!textObj) return 'N/A';
    if (typeof textObj === 'string') return textObj;
    if (typeof textObj === 'object' && textObj.en) return textObj.en;
    return 'N/A';
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tableRef.current) {
      const table = ($(tableRef.current) as any).DataTable({
        data: data,
        destroy: true,
        columns: [
          { title: "ID", data: "id" },
          { 
            title: "Title", 
            data: "title",
            render: (data: any) => truncateText(getEnglishText(data), 30)
          },
          { 
            title: "Message", 
            data: "message",
            render: (data: any) => truncateText(getEnglishText(data), 50)
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
        rowCallback: (row: Node, rowData: Notification) => {
          // Redirect to edit page
          $(row).find('.edit-icon').off('click').on('click', (e) => {
            e.stopPropagation();
            navigate(`/edit-notification/${rowData.id}`);
          });

          // Delete functionality
          $(row).find('.delete-icon').off('click').on('click', (e) => {
            e.stopPropagation();
            handleDelete(rowData.id);
          });

          $(row).css('cursor', 'pointer');
        },
        order: [[0, 'asc']], 
        pageLength: 10,
        responsive: true
      });

      return () => {
        if (table) table.destroy();
      };
    }
  }, [data]);

  return (
    <div className="p-4 max-w-full mx-auto font-noto">
      <div className="flex justify-between items-center mb-4">
        <p className='text-2xl font-bold text-black'>Notifications</p>
        <button
          onClick={() => navigate('/add-notifications')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          + Add Notification
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

export default Notifications;