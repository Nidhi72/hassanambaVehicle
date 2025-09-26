import React, { useEffect, useState, useRef, useCallback } from 'react';
import '../../dataTables.css';
import axios from 'axios';
import $ from 'jquery';
import 'datatables.net';
import config from "../../config";
import CryptoJS from 'crypto-js';
import { useNavigate } from "react-router-dom";
import ReactDOMServer from "react-dom/server";
import Alert from "../../components/ui/alert/Alert";
import { UserRoundPen, Trash } from 'lucide-react';

interface TicketCounterUser {
  id?: string | number;
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const TicketCounter: React.FC = () => {
  const [data, setData] = useState<TicketCounterUser[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const tableRef = useRef<HTMLTableElement | null>(null);
  const dataTableInstance = useRef<any>(null);
  const navigate = useNavigate();

  const decryptSingleValue = (encryptedValue: string): string => {
    try {
      const key = 'srihassanaambatemple@2024';
      const decrypted = CryptoJS.AES.decrypt(encryptedValue, key);
      return decrypted.toString(CryptoJS.enc.Utf8) || encryptedValue;
    } catch {
      return encryptedValue;
    }
  };

  const decryptSensitiveFields = (obj: TicketCounterUser, fieldsToDecrypt: string[] = ['password']): TicketCounterUser => {
    try {
      const decryptedObj = { ...obj };
      fieldsToDecrypt.forEach(field => {
        if (decryptedObj[field]) {
          decryptedObj[field] = decryptSingleValue(decryptedObj[field]);
        }
      });
      return decryptedObj;
    } catch {
      return obj;
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/ticketcounter`, { withCredentials: true });
      if (response.data.success) {
        let processedData: any = response.data.data;
        if (typeof processedData === 'string') processedData = JSON.parse(decryptSingleValue(processedData));

        if (Array.isArray(processedData)) {
          processedData = processedData.map((item: TicketCounterUser) => decryptSensitiveFields(item));
        }

        const normalized: TicketCounterUser[] = processedData.map((item: TicketCounterUser) => ({
          id: item.id || item._id,
          name: item.name || 'N/A',
          email: item.email || 'N/A',
          password: item.password || '',
          status: item.status || 'disabled',
          ...item
        }));

        setData(normalized);
      } else {
        setAlertMessage("Failed to load ticket counter users");
        setAlertVariant('error');
      }
    } catch (err) {
      console.error(err);
      setAlertMessage("Error fetching ticket counter users");
      setAlertVariant('error');
    }
  };

  const handleStatusToggle = useCallback(async (userId: string | number) => {
    try {
      const response = await axios.put(
        `${config.baseURL}/ticketcounter/toggle/${userId}`,
        {},
        { withCredentials: true }
      );
  
      if (response.data.success) {
        // Update local state to toggle status
        setData(prev =>
          prev.map(u =>
            u.id === userId ? { ...u, status: u.status === 'enabled' ? 'disabled' : 'enabled' } : u
          )
        );
  
        setAlertMessage("User status toggled successfully");
        setAlertVariant('success');
      } else {
        setAlertMessage("Failed to toggle status");
        setAlertVariant('error');
      }
    } catch (err) {
      console.error(err);
      setAlertMessage("Error toggling user status");
      setAlertVariant('error');
    }
  }, []);
  

  const handleDelete = useCallback(async (userId: string | number, userName: string) => {
    if (!window.confirm(`Delete "${userName}"?`)) return;
  
    try {
      const response = await axios.delete(`${config.baseURL}/ticketcounter/${userId}`, { withCredentials: true });
      if (response.data.success) {
        // Set alert first
        setAlertMessage(`User "${userName}" deleted successfully`);
        setAlertVariant('success');
  
        // Update table data manually instead of calling fetchData
        setData(prev => prev.filter(u => u.id !== userId));
      } else {
        setAlertMessage("Failed to delete user");
        setAlertVariant('error');
      }
    } catch {
      setAlertMessage("Error deleting user");
      setAlertVariant('error');
    }
  }, []);
  

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tableRef.current && data.length > 0) {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        $(tableRef.current).off('click');
      }

      dataTableInstance.current = $(tableRef.current).DataTable({
        data,
        destroy: true,
        pageLength: 10,
        columns: [
          { title: "ID", data: "id", width: "50px" },
          { title: "Name", data: "name" },
          { title: "Email", data: "email" },
          { title: "Password", data: "password", render: () => '**********', orderable: false },
          {
            title: "Status",
            data: "status",
            render: (status: string) => {
              const cls = status === 'enabled' 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-red-100 text-red-800 hover:bg-red-200';

              return `<button class="status-btn ${cls} px-3 py-1 rounded-full">${status}</button>`;
            }
          },
          {
            title: "Edit",
            data: null,
            orderable: false,
            render: () =>
              ReactDOMServer.renderToStaticMarkup(
                <UserRoundPen className="edit-icon text-blue-500 w-5 h-5 cursor-pointer hover:text-blue-600" />
              )
          },
          {
            title: "Delete",
            data: null,
            orderable: false,
            render: () =>
              ReactDOMServer.renderToStaticMarkup(
                <Trash className="delete-icon text-red-500 w-5 h-5 cursor-pointer hover:text-red-600" />
              )
          }
        ],
        rowCallback: (row: Node, rowData: TicketCounterUser) => {
          $(row).find('.edit-icon').off('click').on('click', () => {
            navigate(`/edit-ticket-counter/${rowData.id}`);
          });
          $(row).find('.delete-icon').off('click').on('click', () => handleDelete(rowData.id!, rowData.name || "User"));
          $(row).find('.status-btn').off('click').on('click', () => handleStatusToggle(rowData.id!));
          $(row).css('cursor', 'pointer');
        }
      });
    }

    return () => {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        dataTableInstance.current = null;
      }
    };
  }, [data, handleStatusToggle, handleDelete, navigate]);

  return (
    <div className="p-4 max-w-full mx-auto font-noto">
      <div className="flex justify-between items-center mb-4">
        <p className='text-2xl font-bold text-black'>Ticket Counter Users</p>
        <button
          onClick={() => navigate("/add-ticket-counter")}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          + Add Ticket Counter
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
};

export default TicketCounter;
