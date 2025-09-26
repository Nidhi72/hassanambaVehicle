import React, { useEffect, useState, useRef } from "react";
import "../../dataTables.css";
import axios from "axios";
import $ from "jquery";
import "datatables.net";
import config from "../../config";
import QRCode from "qrcode";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import { useParams } from "react-router-dom";

// ✅ Define Booking interface
interface BookingType {
  id: number | string;
  name?: string;
  contactNumber?: string;
  aadharCard?: string;
  NoOfPeople?: number | string;
  status?: string;
  isActive?: number | string;
  bookingDate?: string;
  createdAt?: string;
  updatedAt?: string;
  transactionId?: string;
  amount?: string;
  transactionStatus?: string;
  paymentMethod?: string;
  isChatbot?: boolean;
  type?: string;
  [key: string]: any;
}

const Booking: React.FC = React.memo(() => {
  const { filterType } = useParams<{ filterType?: string }>();
  const notify = (message: string) => toast.error(message);

  const [data, setData] = useState<BookingType[]>([]);
  const [filteredData, setFilteredData] = useState<BookingType[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tableRef = useRef<HTMLTableElement | null>(null);

  // 🔹 Map route param → DB values
  const filterMap: Record<string, string> = {
    "300-ticket": "300 ticket",
    "1000-ticket": "1000 ticket",
  };

  // 🔹 Format date safely
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
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
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
    const fieldsToDecrypt = [
      "amount",
      "transactionStatus",
      "paymentMethod",
      "bookingDate",
    ];
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

  // 🔹 Fetch data
  const fetchData = async () => {
    try {
      let url = `${config.baseURL}/booking`;
      
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        const decrypted = decryptData(response.data.data);
        const bookings = Array.isArray(decrypted) ? decrypted : [decrypted];
        setData(bookings);
      }
    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
  };

  // 🔹 Apply filter based on route param
  useEffect(() => {
    if (!filterType) {
      setFilteredData(data);
    } else {
      const filter = filterMap[filterType];
      if (filter) {
        setFilteredData(data.filter((b) => b.type?.toLowerCase() === filter));
      } else {
        setFilteredData(data);
      }
    }
  }, [filterType, data]);

  useEffect(() => {
    fetchData();
  }, [filterType]);

  // 🔹 QR Ticket Generator
  const generateBookingQR = async (bookingDetails: BookingType) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 500;
      canvas.height = 750;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#4E1A27";
      ctx.fillRect(0, 0, 500, 750);

      const rectX = 40,
        rectY = 150,
        rectWidth = 420,
        rectHeight = 400,
        rectRadius = 15;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(rectX + rectRadius, rectY);
      ctx.lineTo(rectX + rectWidth - rectRadius, rectY);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY,
        rectX + rectWidth,
        rectY + rectRadius
      );
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - rectRadius);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY + rectHeight,
        rectX + rectWidth - rectRadius,
        rectY + rectHeight
      );
      ctx.lineTo(rectX + rectRadius, rectY + rectHeight);
      ctx.quadraticCurveTo(
        rectX,
        rectY + rectHeight,
        rectX,
        rectY + rectHeight - rectRadius
      );
      ctx.lineTo(rectX, rectY + rectRadius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + rectRadius, rectY);
      ctx.closePath();
      ctx.fill();

      const qrData = `${bookingDetails.id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });

      const qrImage = new Image();
      qrImage.onload = () => {
        const qrSize = 360;
        ctx.drawImage(qrImage, (500 - qrSize) / 2, rectY + 20, qrSize, qrSize);

        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        const textStartY = rectY + rectHeight + 40;
        const spacing = 60;
        ctx.fillText(`Booking ID: ${bookingDetails.id}`, 250, textStartY);
        ctx.font = "bold 40px Arial";
        ctx.fillText(
          `Rs ${bookingDetails.type || "1000"}/-`,
          250,
          textStartY + spacing
        );
        const formattedDate = formatDate(
          bookingDetails.bookingDate || bookingDetails.createdAt
        );
        ctx.font = "bold 20px Arial";
        ctx.fillText(
          `Booking Date: ${formattedDate}`,
          250,
          textStartY + spacing * 2
        );

        canvas.toBlob((blob) => {
          if (!blob) return;
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `ticket_${bookingDetails.id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }, "image/png");
      };
      qrImage.src = qrCodeDataUrl;
    } catch {
      notify("Error generating ticket QR");
    }
  };

  // 🔹 Row Click
  const handleRowClick = (bookingDetails: BookingType) => {
    setSelectedBooking(bookingDetails);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // 🔹 DataTable Init
  useEffect(() => {
    if (tableRef.current) {
      const table = ($(tableRef.current) as any).DataTable({
        data: filteredData,
        order: [[0, "desc"]],
        destroy: true,
        columns: [
          { title: "ID", data: "id", defaultContent: "N/A" },
          { title: "Name", data: "name", defaultContent: "N/A" },
          {
            title: "Status",
            data: "status",
            defaultContent: "N/A",
            render: (data: string) => {
              if (data === "Completed")
                return "<span class='px-2 py-1 text-xs bg-green-100 text-green-700 rounded'>Completed</span>";
              if (data === "Pending")
                return "<span class='px-2 py-1 text-xs bg-red-100 text-red-700 rounded'>Pending</span>";
              if (data === "Confirmed")
                return "<span class='px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded'>Confirmed</span>";
              if (data === "Booked")
                return "<span class='px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded'>Booked</span>";
              if (data === "Refunded")
                return "<span class='px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded'>Refunded</span>";
              return data || "N/A";
            },
          },
          { title: "Type", data: "type", defaultContent: "N/A" },
          {
            title: "Booking Date",
            data: "bookingDate",
            defaultContent: "N/A",
            render: (data: string, _type: any, row: BookingType) =>
              formatDate(data || row.createdAt),
          },
          {
            title: "Download Ticket",
            data: null,
            orderable: false,
            render: (_d: any, _t: any, row: BookingType) => {
              if (row.isActive === 0) {
                return "<span class='text-sm text-red-500'>Scanned</span>";
              }
              return `<button class='download-btn px-3 py-1 bg-primary text-white rounded'>Download</button>`;
            },
          },
        ],
        rowCallback: (row: any, rowData: BookingType) => {
          $(row)
            .find(".download-btn")
            .off("click")
            .on("click", (e: any) => {
              e.stopPropagation();
              generateBookingQR(rowData);
            });
          $(row)
            .off("click")
            .on("click", (e: any) => {
              if (!$(e.target).hasClass("download-btn")) {
                handleRowClick(rowData);
              }
            });
        },
      });
      return () => {
        if (table) table.destroy();
      };
    }
  }, [filteredData]);

  return (
    <div className="p-4 max-w-full mx-auto font-noto">
      <p className="text-2xl font-bold text-black mb-4">
        {filterType ? filterMap[filterType] || "All" : "All"} Bookings
      </p>
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
                <h2 className="text-2xl font-bold">Booking Details</h2>
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
                      {key === "bookingDate"
                        ? formatDate(value || selectedBooking.createdAt)
                        : value ?? "N/A"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                {selectedBooking.isActive === 1 && (
                  <button
                    onClick={() => {
                      generateBookingQR(selectedBooking);
                      closeModal();
                    }}
                    className="px-4 py-2 bg-primary text-white rounded"
                  >
                    Download Ticket
                  </button>
                )}
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

export default Booking;
