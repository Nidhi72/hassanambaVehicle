import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import BarChart from "../Charts/BarChart";
import LineChart from "../Charts/LineChart";
import ServiceToggle from "./ServiceToggle";

export default function Home() {
  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6">
          <EcommerceMetrics />
        </div>
        
        {/* Service Toggle Section */}
        <div className="col-span-12">
          <ServiceToggle />
        </div>
        
        <div className="col-span-12">
          <BarChart />
        </div>
        
        <div className="col-span-12">
          <LineChart />
        </div>
      </div>
    </>
  );
}