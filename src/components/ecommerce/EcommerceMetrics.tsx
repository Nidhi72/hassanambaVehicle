import { useEffect, useState } from "react";

import {
 Users,
 Box
} from "lucide-react";
import {
  BadgeIndianRupee,
  CreditCard,
  Bot
} from "lucide-react";

import axios from "axios";
import config from "../../config"; 

export default function EcommerceMetrics() {
  const [metrics, setMetrics] = useState({
    ticketCounterCount: 0,
    bookingsToday: 0,
    peopleToday: 0,
    chatbotBookings: 0,
    chatbotPeople: 0,
    enteredBookings: 0,
    enteredPeople: 0,
    donationCount: 0,
    donationAmount: 0,
    txnCount: 0,
    txnAmount: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get(`${config.baseURL}/dashboard/home`);
        if (res.data.success) {
          const data = res.data.data;
          setMetrics({
            ticketCounterCount: data.ticketCounterCount || 0,
            bookingsToday: data.bookings.allToday?.bookings_today || 0,
            peopleToday: parseInt(data.bookings.allToday?.people_today || "0"),
            chatbotBookings: data.bookings.chatbotToday?.chatbot_bookings_today || 0,
            chatbotPeople: parseInt(data.bookings.chatbotToday?.chatbot_people_today || "0"),
            enteredBookings: data.enteredToday?.bookings_entered_today || 0,
            enteredPeople: parseInt(data.enteredToday?.people_entered_today || "0"),
            donationCount: data.donationsToday?.donation_txn_count || 0,
            donationAmount: parseFloat(data.donationsToday?.donation_amount_today || "0"),
            txnCount: data.transactions.today?.txn_count || 0,
            txnAmount: parseFloat(data.transactions.today?.total_amount || "0"),
          });
        }
      } catch (err) {
        console.error("Error fetching metrics:", err);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">

      {/* Bookings Today */}
      <MetricCard
        title="Bookings Today"
        icon={<Box className="text-gray-800 size-6 dark:text-white/90" />}
        values={[
          { label: "Bookings", value: metrics.bookingsToday },
          { label: "People", value: metrics.peopleToday },
        ]}
      />

      {/* Chatbot */}
      <MetricCard
        title="Chatbot"
        icon={<Bot className="text-gray-800 size-6 dark:text-white/90" />}
        values={[
          { label: "Bookings", value: metrics.chatbotBookings },
          { label: "People", value: metrics.chatbotPeople },
        ]}
      />

      {/* Entered Today */}
      <MetricCard
        title="Entered Today"
        icon={<Users className="text-gray-800 size-6 dark:text-white/90" />}
        values={[
          { label: "Bookings", value: metrics.enteredBookings },
          { label: "People", value: metrics.enteredPeople },
        ]}
      />
      {/* Donations */}
      
      <MetricCard
        title="Donations"
        icon={<BadgeIndianRupee className="text-gray-800 size-6 dark:text-white/90" />}
        values={[
          { label: "Transactions", value: metrics.donationCount },
          { label: "Amount", value: `₹${metrics.donationAmount.toFixed(2)}` },
        ]}
      />

      {/* Transactions */}
      <MetricCard
        title="Transactions"
        icon={<CreditCard className="text-gray-800 size-6 dark:text-white/90" />}
        values={[
          { label: "Transactions", value: metrics.txnCount },
          { label: "Amount", value: `₹${metrics.txnAmount.toFixed(2)}` },
        ]}
      />
    </div>
  );
}

// Metric Card
function MetricCard({ title, icon, values }: any) {
  return (
    <div className="rounded-2xl border-2 border-primary bg-white p-5 dark:border-primary dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
        {icon}
      </div>
      <div className="mt-5">
        <span className="text-sm text-black dark:text-gray-400">{title}</span>
        <div className="mt-3 space-y-1">
          {values.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
              <span className="font-semibold text-gray-800 dark:text-white/90">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

