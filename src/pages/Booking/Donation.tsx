import React, { useEffect, useState, useRef } from "react";
import "../../dataTables.css";
import axios from "axios";
import $ from "jquery";
import "datatables.net";
import config from "../../config";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";

// ✅ Donation Booking Interface
interface DonationBookingType {
  id: number | string;
  amount?: string;
  transactionId?: string;
  transactionStatus?: string;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const DonationBooking: React.FC = React.memo(() => {
  const notify = (message: string) => toast.error(message);

  const [data, setData] = useState<DonationBookingType[]>([]);
  const [selectedBooking, setSelectedBooking] =
    useState<DonationBookingType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tableRef = useRef<HTMLTableElement | null>(null);

  // 🔹 Date formatter
  const formatDate = (dateValue: any): string => {
    if (!dateValue || dateValue === "null" || dateValue === "") return "N/A";
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateValue)) return dateValue;
    const d = new Date(dateValue);
    return !isNaN(d.getTime())
      ? `${String(d.getDate()).padStart(2, "0")}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}-${d.getFullYear()}`
      : "Invalid Date";
  };

  // 🔹 Decryption
  const decryptSingleValue = (encryptedValue: string): string => {
    try {
      const key = "srihassanaambatemple@2024";
      const decrypted = CryptoJS.AES.decrypt(encryptedValue, key);
      let decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
  
      // Remove leading/trailing quotes
      if (
        decryptedString.startsWith('"') &&
        decryptedString.endsWith('"')
      ) {
        decryptedString = decryptedString.slice(1, -1);
      }
  
      return decryptedString || encryptedValue;
    } catch {
      return encryptedValue;
    }
  };
  

  const decryptData = (encryptedData: string): any => {
    try {
      const key = "srihassanaambatemple@2024";
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      let parsedData: any = JSON.parse(decryptedString);
      if (Array.isArray(parsedData)) {
        parsedData = parsedData.map((item) => decryptObjectFields(item));
      } else if (typeof parsedData === "object") {
        parsedData = decryptObjectFields(parsedData);
      }
      return parsedData;
    } catch {
      return encryptedData;
    }
  };

  const decryptObjectFields = (obj: any): any => {
    if (!obj || typeof obj !== "object") return obj;
    const fieldsToDecrypt = ["amount", "transactionStatus", "paymentMethod"];
    const decryptedObj = { ...obj };
    fieldsToDecrypt.forEach((field) => {
      if (
        decryptedObj[field] &&
        typeof decryptedObj[field] === "string" &&
        decryptedObj[field].startsWith("U2FsdGVkX1")
      ) {
        decryptedObj[field] = decryptSingleValue(decryptedObj[field]);
      }
    });
    return decryptedObj;
  };

  // 🔹 Fetch donations
  const fetchData = async () => {
    try {
      const url = `${config.baseURL}/booking/donations`;
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        const decrypted = decryptData(response.data.data);
        const donations = Array.isArray(decrypted) ? decrypted : [decrypted];
        setData(donations);
      }
    } catch (error) {
      console.error("Error fetching donation data:", error);
      notify("Error loading donation data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 DataTable Init
  useEffect(() => {
    if (tableRef.current) {
      const table = ($(tableRef.current) as any).DataTable({
        data,
        order: [[0, "desc"]],
        destroy: true,
        columns: [
          { title: "ID", data: "id", defaultContent: "N/A" },
          { title: "Amount", data: "amount", defaultContent: "N/A" },
          { title: "Payment Method", data: "paymentMethod", defaultContent: "N/A" },
          {
            title: "Status",
            data: "transactionStatus",
            defaultContent: "N/A",
            render: (data: string) => {
              if (data === "Success")
                return "<span class='px-2 py-1 text-xs bg-green-100 text-green-700 rounded'>Success</span>";
              if (data === "Pending")
                return "<span class='px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded'>Pending</span>";
              if (data === "Failed")
                return "<span class='px-2 py-1 text-xs bg-red-100 text-red-700 rounded'>Failed</span>";
              return data || "N/A";
            },
          },
          {
            title: "Date",
            data: "createdAt",
            defaultContent: "N/A",
            render: (data: string, _t: any, row: DonationBookingType) =>
              formatDate(data || row.updatedAt),
          },
        ],
        rowCallback: (row: any, rowData: DonationBookingType) => {
          $(row)
            .off("click")
            .on("click", () => {
              setSelectedBooking(rowData);
              setIsModalOpen(true);
            });
        },
      });
      return () => {
        if (table) table.destroy();
      };
    }
  }, [data]);

  // 🔹 Modal Close
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div className="p-4 max-w-full mx-auto font-noto">
      <p className="text-2xl font-bold text-black mb-4">Donation Bookings</p>
      <div className="overflow-x-auto">
        <table ref={tableRef} className="display w-full text-left"></table>
      </div>

      {/* 🔹 Modal */}
      {isModalOpen && selectedBooking && (
        <>
          <div
            className="fixed inset-0 backdrop-blur-sm z-40"
            onClick={closeModal}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
              className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Donation Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                {Object.entries(selectedBooking).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-gray-200 pb-2"
                  >
                    <span className="font-semibold capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>
                    <span>
                      {key === "createdAt" || key === "updatedAt"
                        ? formatDate(value)
                        : value ?? "N/A"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default DonationBooking;
