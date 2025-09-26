import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import axios from "axios";
import config from "../../../config";

export default function BarChartOne() {
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
    colors: ["#465fff", "#FF9800", "#28a745"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 280,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val: number) => `${val}` } },
  };

  const series = [
    { name: "300 Tickets", data: people300 },
    { name: "1000 Tickets", data: people1000 },
    { name: "People Scanned", data: peopleScanned },
  ];

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartOne" className="min-w-[1000px]">
        <Chart options={options} series={series} type="bar" height={280} />
      </div>
    </div>
  );
}
