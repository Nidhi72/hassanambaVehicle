import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import axios from "axios";
import config from "../../../config";

export default function LineChartOne() {
  const [categories, setCategories] = useState<string[]>([]);
  const [people300, setPeople300] = useState<number[]>([]);
  const [people1000, setPeople1000] = useState<number[]>([]);
  const [peopleScanned, setPeopleScanned] = useState<number[]>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await axios.get(`${config.baseURL}/dashboard/home`);
        if (res.data.success) {
          const seriesData = res.data.data.bookings.seriesLast30Days || [];

          // x-axis categories
          const days = seriesData.map((row: any) => {
            const date = new Date(row.bookingDate);
            const day = date.getUTCDate();
            const month = date.toLocaleString("en-GB", {
              month: "short",
              timeZone: "UTC",
            });
            return `${day} ${month}`;
          });

          // series values
          const people300Data = seriesData.map((row: any) =>
            Number(row.people_300 ?? 0)
          );
          const people1000Data = seriesData.map((row: any) =>
            Number(row.people_1000 ?? 0)
          );
          const peopleScannedData = seriesData.map((row: any) =>
            Number(row.people_scanned ?? 0)
          );

          setCategories(days);
          setPeople300(people300Data);
          setPeople1000(people1000Data);
          setPeopleScanned(peopleScannedData);
        }
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
    };

    fetchChartData();
  }, []);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#FF9800", "#800000"], // three different colors
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
    },
    stroke: {
      curve: "straight",
      width: [2, 2, 2],
    },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: "dd MMM" },
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: { style: { fontSize: "12px", colors: ["#6B7280"] } },
      title: { text: "", style: { fontSize: "0px" } },
    },
  };

  const series = [
    { name: "300 Tickets", data: people300 },
    { name: "1000 Tickets", data: people1000 },
    { name: "People Scanned", data: peopleScanned },
  ];

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartEight" className="min-w-[1000px]">
        <Chart options={options} series={series} type="area" height={310} />
      </div>
    </div>
  );
}
