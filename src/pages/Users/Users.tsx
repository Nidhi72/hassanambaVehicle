import React, { useEffect, useState, useRef } from 'react';
import '../../dataTables.css';
import axios from 'axios';
import $ from 'jquery';
import 'datatables.net';
import config from "../../config";
import CryptoJS from 'crypto-js';
import { useNavigate } from 'react-router-dom'; 
import Alert from "../../components/ui/alert/Alert";
import ReactDOMServer from "react-dom/server";
import { UserRoundPen,Trash } from 'lucide-react';

// Define the user type
interface User {
  id: number | string;
  name?: string;
  email?: string;
  password?: string;
  [key: string]: any;
}

const Users: React.FC = React.memo(() => {
  const [data, setData] = useState<User[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const tableRef = useRef<HTMLTableElement | null>(null);
  const navigate = useNavigate();

  // Decrypt functions
  const decryptSingleValue = (encryptedValue: string): string => {
    try {
      const key = 'srihassanaambatemple@2024';
      const decrypted = CryptoJS.AES.decrypt(encryptedValue, key);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      return decryptedString || encryptedValue;
    } catch (err) {
      console.error("Single value decryption error:", err);
      return encryptedValue;
    }
  };

  const decryptObjectFields = (obj: User): User => {
    if (!obj || typeof obj !== 'object') return obj;
    const fieldsToDecrypt = ['password'];
    const decryptedObj = { ...obj };
    fieldsToDecrypt.forEach(field => {
      if (
        decryptedObj[field] &&
        typeof decryptedObj[field] === 'string' &&
        decryptedObj[field].startsWith('U2FsdGVkX1')
      ) {
        decryptedObj[field] = decryptSingleValue(decryptedObj[field]);
      }
    });
    return decryptedObj;
  };

  const decryptData = (encryptedData: string): User[] | User | string => {
    try {
      const key = 'srihassanaambatemple@2024';
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

      let parsedData: any = JSON.parse(decryptedString);

      if (Array.isArray(parsedData)) {
        parsedData = parsedData.map((item: User) => decryptObjectFields(item));
      } else if (typeof parsedData === 'object') {
        parsedData = decryptObjectFields(parsedData);
      }

      return parsedData;
    } catch (err) {
      console.error("Decryption error:", err);
      return encryptedData;
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${config.baseURL}/users`, { withCredentials: true });
      if (response.data.success) {
        const decrypted = decryptData(response.data.data);
        if (Array.isArray(decrypted)) {
          setData(decrypted);
        } else if (typeof decrypted === 'object') {
          setData([decrypted as User]);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setAlertMessage("Error fetching users");
      setAlertVariant('error');
    }
  };

  const handleDelete = async (userId: number | string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${config.baseURL}/users/${userId}`, { withCredentials: true });
      setAlertMessage("User deleted successfully");
      setAlertVariant('success');
      fetchData();
    } catch (err) {
      console.error(err);
      setAlertMessage("Error deleting user");
      setAlertVariant('error');
    }
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
          { title: "Name", data: "name" },
          { title: "Email", data: "email" },
          { title: "Password", data: "password", render: () => '**********' },
          {
            title: "Edit",
            data: null,
            orderable: false,
            render: () =>
              ReactDOMServer.renderToStaticMarkup(
                <UserRoundPen className="edit-icon text-blue-500 w-5 h-5 cursor-pointer hover:text-blue-600" />
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
        rowCallback: (row: Node, rowData: User) => {
          // Redirect to edit page
          $(row).find('.edit-icon').off('click').on('click', (e) => {
            e.stopPropagation();
            navigate(`/edituser/${rowData.id}`);
          });

          // Delete functionality
          $(row).find('.delete-icon').off('click').on('click', (e) => {
            e.stopPropagation();
            handleDelete(rowData.id);
          });

          $(row).css('cursor', 'pointer');
        }
      });

      return () => {
        if (table) table.destroy();
      };
    }
  }, [data]);

  return (
    <div className="p-4 max-w-full mx-auto font-noto">
      <div className="flex justify-between items-center mb-4">
        <p className='text-2xl font-bold text-black'>Users</p>
        <button
          onClick={() => navigate('/adduser')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          + Add User
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

export default Users;
