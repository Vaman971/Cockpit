import ReactApexChart from "react-apexcharts";
import { useEffect, useState } from "react";
import api from "../axios";
import { FaUsers } from "react-icons/fa";
import { FaRegUserCircle } from "react-icons/fa";
import { MdLibraryBooks } from "react-icons/md";
import { FaUserShield } from "react-icons/fa";
import IconTrendingUp from "../components/Icon/IconTrendingUp";
import { toast } from "react-toastify";
import { Spinner } from "flowbite-react";


const Analytics = () => {
  const apiRoute = process.env.REACT_APP_API_URL;
  const [error, setError] = useState(false);
  const [oppCount, setOppCount] = useState(null);
  const [oppCountLastQuarter, setOppCountLastQuarter] = useState("");
  const [status, setStatus] = useState({});
  const [statusLastQuarter, setStatusLastQuarter] = useState({});
  const [missionCount, setMissionCount] = useState(0);
  const [activeMission, setActiveMission] = useState([]);
  const [weekOppCount, setWeekOppCount] = useState([]);
  const [oppWonData, setOppWonData] = useState([]);
  const [oppClusterData, setOppClusterData] = useState([]);
  const [projectClusterData, setProjectClusterData] = useState([]);
  const [totalMissionLeader, setTotalMissionLeader] = useState("");
  const [topMissionLeader, setTopMissionLeader] = useState([]);

  // console.log(oppClusterData.map((value)=> value.opportunityCount));
  useEffect(() => {
    try {
      const fetchOppCountData = async () => {
        const Countres = await api.get(
          `/analytics/gettotalOpportunityCount`,
          { withCredentials: true }
        );

        const Countdata = Countres.data;
        if (Countdata.success === false) {
          toast.error('Can not fetch Analytics data');
        } else {
          setOppCount(Countdata.total_opportunities);
          setOppCountLastQuarter(Countdata.opportunities_lastQuarter);
        }
      }
      fetchOppCountData();
    } catch (error) {
      setError(true);
    }
  }, [apiRoute]);

  useEffect(() => {
    try {
      const fetchProjCountData = async () => {
        const res = await api.get(
          `/analytics/getProjByStatusCount`,
          { withCredentials: true }
        );

        const Statusdata = res.data.projectsByStatus;
        const StatusdataLastQuarter = res.data.projectsByStatusLastQuarter;
        if (Statusdata.success === false) {
          toast.error('Can not fetch Analytics data');
        } else {
          setStatus(Statusdata.find((item) => item.status === true));
          setStatusLastQuarter(
            StatusdataLastQuarter.find((item) => item.status === true)
          );
        }
      }
      fetchProjCountData();
    } catch (error) {
      setError(true);
    }
  }, [apiRoute]);

  useEffect(() => {
    try {
      const fetchWeekOppData = async () => {
        const res = await api.get(
          `/analytics/getOppCreatedLastWeek`,
          { withCredentials: true }
        );

        const data = res.data
        if (data.success === false) {
          toast.error('Can not fetch Analytics data');
        } else {
          setWeekOppCount(data.map((weekData) => weekData.count));
        }
      }
      fetchWeekOppData();
    } catch (error) {
      setError(true);
    }
  }, [apiRoute]);

  useEffect(() => {
    try {
      const fetchWeekOppWonData = async () => {
        const res = await api.get(
          `/analytics/getOppWonLastWeek`,
          { withCredentials: true }
        );

        const data = res.data
        if (data.success === false) {
          toast.error('Can not fetch Analytics data');
        } else {
          setOppWonData(data.map((wonData) => wonData.count));
        }
      }
      fetchWeekOppWonData();
    } catch (error) {
      setError(true);
    }
  }, [apiRoute]);

  useEffect(() => {
    try {
      const fetchMissionCountData = async () => {
        const res = await api.get(
          `/analytics/getMissionCardCount`,
          { withCredentials: true }
        );

        const data = res.data
        if (data.success === false) {
          toast.error('Can not fetch Analytics data');
        } else {
          setMissionCount(data.totalMissionCards);
          setActiveMission(data.missionCardStatusCount);
        }
      }
      fetchMissionCountData();
    } catch (error) {
      setError(true);
    }
  }, [apiRoute]);

  useEffect(() => {
    try {
      const fetchMissionLeaderData = async () => {
        const res = await api.get(
          `/analytics/getMissionLeaderCount`,
          { withCredentials: true }
        );

        const data = res.data
        if (data.success === false) {
          toast.error('Can not fetch Analytics data');
        } else {
          setTotalMissionLeader(data.totalMissionLeaders);
          setTopMissionLeader(data.topMissionLeaders);
        }
      }
      fetchMissionLeaderData();
    } catch (error) {
      setError(true);
    }
  }, [apiRoute]);

  useEffect(() => {
    try {
      const fetchOppClusterData = async () => {
        const res = await api.get(
          `/analytics/getOppCountByCluster`,
          { withCredentials: true }
        );

        const data = res.data
        if (data.success === false) {
          toast.error('Can not fetch Analytics data');
        } else {
          setOppClusterData(data);
        }
      }
      fetchOppClusterData();
    } catch (error) {
      setError(true);
    }
  }, [apiRoute]);

  useEffect(() => {
    try {
      const fetchProjClusterData = async () => {
        const res = await api.get(
          `/analytics/getProjectCountByCluster`,
          { withCredentials: true }
        );

        const data = res.data
        if (data.success === false) {
          toast.error('Can not fetch Analytics data');
        } else {
          setProjectClusterData(data);
        }
      }
      fetchProjClusterData();
    } catch (error) {
      setError(true);
    }
  }, [apiRoute]);

  // totalVisitOptions
  const totalVisit = {
    series: [{ data: weekOppCount }],
    options: {
      chart: {
        height: 58,
        type: "line",
        fontFamily: "Nunito, sans-serif",
        sparkline: {
          enabled: true,
        },
        dropShadow: {
          enabled: true,
          blur: 3,
          color: "#009688",
          opacity: 0.4,
        },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      colors: ["#009688"],
      grid: {
        padding: {
          top: 5,
          bottom: 5,
          left: 5,
          right: 5,
        },
      },
      tooltip: {
        x: {
          show: false,
        },
        y: {
          title: {
            formatter: () => {
              return "";
            },
          },
        },
      },
    },
  };
  // paidVisitOptions
  const paidVisit = {
    series: [{ data: oppWonData }],
    options: {
      chart: {
        height: 58,
        type: "line",
        fontFamily: "Nunito, sans-serif",
        sparkline: {
          enabled: true,
        },
        dropShadow: {
          enabled: true,
          blur: 3,
          color: "#e2a03f",
          opacity: 0.4,
        },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      colors: ["#e2a03f"],
      grid: {
        padding: {
          top: 5,
          bottom: 5,
          left: 5,
          right: 5,
        },
      },
      tooltip: {
        x: {
          show: false,
        },
        y: {
          title: {
            formatter: () => {
              return "";
            },
          },
        },
      },
    },
  };

  if (error) {
    return (<>
      <Spinner />
      <p>An Error occured, Please Reload the Application</p>
    </>)
  } else {
    return (
      <div className="flex flex-col">
        <div className="pt-5">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
            <div className="panel p-4 rounded-md bg-gradient-to-r from-blue-200 to-blue-100 shadow-lg min-h-[218px]">
              {/* statistics */}
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-bold text-lg sm:text-xl text-blue-800">
                  Opportunities
                </h5>
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-300">
                  <FaUsers className="text-white" />
                </div>
              </div>

              <div className="grid gap-3 text-xs sm:text-sm text-[#515365] font-bold">
                <div className="flex justify-between items-center gap-3 mb-4 mr-2">
                  <div className="text-black">Total Opportunities</div>
                  <span className="text-red-800 text-base whitespace-nowrap">
                    {oppCount ?? "0"}
                    <IconTrendingUp className="text-success inline mb-1 ml-2" />
                  </span>

                  <div className="text-black">This quarter</div>
                  <span className="text-red-800 text-base whitespace-nowrap">
                    {oppCountLastQuarter[0]?.count || "0"}
                    <IconTrendingUp className="text-success inline mb-1 ml-2" />
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-2 justify-between">
                  {oppClusterData &&
                    oppClusterData.map((opp) => (
                      <div className="flex gap-2">
                        <div className="text-black text-xs">{opp.cluster || 'Undefined'}</div>
                        <span className="text-red-800 text-xs">
                          {opp.opportunityCount ?? "0"}
                        </span>
                      </div>
                    ))}
                </div>

                <ReactApexChart
                  series={totalVisit.series}
                  options={totalVisit.options}
                  type="line"
                  height={58}
                  className="overflow-hidden"
                />
              </div>
            </div>

            <div className="panel p-4 rounded-md bg-gradient-to-r from-blue-200 to-blue-100 shadow-lg min-h-[218px]">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-bold text-lg sm:text-xl text-blue-800">Projects</h5>
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-300">
                  <FaUserShield className="text-white" />
                </div>
              </div>

              <div className="grid gap-3 text-xs sm:text-sm text-[#515365] font-bold">
                <div className="flex justify-between items-center gap-3 mb-2">
                  <div className="text-black font-bold">Active Projects</div>
                  <span className="text-red-800 text-base whitespace-nowrap">
                    {status?.count || "0"}
                    <IconTrendingUp className="text-success inline ml-1" />
                  </span>
                  <div className="text-black font-bold">This Quarter</div>
                  <span className="text-red-800 text-base whitespace-nowrap">
                    {statusLastQuarter?.count || "0"}
                    <IconTrendingUp className="text-success inline ml-1" />
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-2 justify-between">
                  {projectClusterData &&
                    projectClusterData.map((proj) => (
                      <div className="flex gap-2">
                        <div className="text-black text-xs">{proj.cluster || 'undefined'}</div>
                        <span className="text-red-800 text-xs">
                          {proj.projectCount ?? "0"}
                        </span>
                      </div>
                    ))}
                </div>

                <ReactApexChart
                  series={paidVisit.series}
                  options={paidVisit.options}
                  type="line"
                  height={58}
                  className="overflow-hidden"
                />
              </div>
            </div>

            <div className="panel p-4 rounded-md bg-gradient-to-r from-blue-200 to-blue-100 shadow-lg min-h-[218px]">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-bold text-lg sm:text-xl text-blue-800">Leaders</h5>
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-300">
                  <FaRegUserCircle className="text-white" />
                </div>
              </div>
              <div className="text-xs sm:text-sm font-bold mb-4">
                Total Mission Leaders:{" "}
                <span className="text-red-800 text-lg">{totalMissionLeader ?? "0"}</span>
              </div>

              <div className="flex flex-wrap gap-2 justify-between">
                {topMissionLeader &&
                  topMissionLeader.map((leader) => (
                    <div key={leader.id} className="flex gap-2">
                      <span className="text-black text-xs font-semibold">{leader?.assignedMissionCards.username || "-"}</span>
                      <span className="text-red-800 text-xs font-semibold">{leader?.total_missions || "-"}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="panel p-4 rounded-md bg-gradient-to-r from-blue-200 to-blue-100 shadow-lg min-h-[218px]">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-bold text-lg sm:text-xl text-blue-800">Missions</h5>
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-300">
                  <MdLibraryBooks className="text-white" />
                </div>
              </div>
              <div className="text-xs sm:text-sm font-bold mb-4">
                Total Missions:{" "}
                <span className="text-red-800 text-lg">{missionCount || "0"}</span>
              </div>

              <div className="flex flex-wrap gap-2 justify-between">
                {activeMission &&
                  activeMission.map((mission) => (
                    <div key={mission.id} className="flex gap-2">
                      <span className="text-black text-xs font-semibold">{mission.status || "-"}</span>
                      <span className="text-red-800 text-xs font-semibold">{mission.count || "-"}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    );
  }
};

export default Analytics;
