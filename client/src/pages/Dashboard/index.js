import React, { useState, useEffect } from "react";
import api from "../../axios";
import Analytics from "../Analytics";
import { AreaChart } from "../areaChart";
import { PieChart } from "../chart";
import { useSpring, animated } from "react-spring";
import ContactTable from "../Table/ContactTable";
import DashMission from "../Table/DashMission";
import { toast } from "react-toastify";


const DashboardPage = () => {
  const [key, setKey] = useState(1);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/analytics/getLatestOpportunities`,
          { withCredentials: true }
        );

        const data = res.data;

        if (res.status === 200) {
          setData(data);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchData();
  }, []);

  const scrolling = useSpring({
    from: { transform: "translate(100%,0)" },
    to: { transform: "translate(-90%,0)" },
    config: { duration: 40000 },
    reset: true,
    onRest: () => {
      setKey(key + 1);
    },
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 to month as it is zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="relative">
      {/* Scrolling notification bar */}
      <div key={key} className="bg-blue-100 h-10 rounded-md overflow-hidden">
        <animated.div className="flex gap-8 whitespace-nowrap py-2" style={scrolling}>
          <span className="font-semibold text-gray-700">Approaching Opportunities:</span>
          {data.map((opp) => (
            <span key={opp.id} className="text-gray-600">
              {`${opp.OpDescription} on ${formatDate(opp.NextContactDate)}`}
            </span>
          ))}
        </animated.div>
      </div>

      {/* Analytics Section */}
      <Analytics />

      {/* Chart Section */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <AreaChart /> 
          <PieChart />
      </div>

      {/* Tables Section */}
      <div className="gap-6 flex mt-6 lg:flex-row flex-col">
          <ContactTable />
          <DashMission />
        </div>
    </div>
  );
};

export default DashboardPage;
