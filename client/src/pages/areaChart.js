import React, { useEffect, useState, useRef } from "react";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import IconHorizontalDots from "../components/Icon/IconHorizontalDots";
import Dropdown from "../components/Dropdown";
import ordinal from "ordinal";
import { toast } from "react-toastify";
import { Spinner } from "flowbite-react";
import api from "../axios";

export const AreaChart = () => {
  const isDark = useSelector(
    (state) =>
      state.themeConfig.theme === "dark" || state.themeConfig.isDarkMode
  );
  const apiRoute = process.env.REACT_APP_API_URL;
  const [loading] = useState(false);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("MONTH");
  const [cluster, setCluster] = useState(null);
  const [region, setRegion] = useState(null);
  const [oppdata, setOppData] = useState([]);
  const [oppWondata, setOppWonData] = useState([]);
  const [oppdataRange, setOppDataRange] = useState([]);
  const [oppHoldData, setOppHoldData] = useState([]);
  const [oppProspectionData, setOppProspectionData] = useState([]);
  const [oppAdvancedData, setOppAdvancedData] = useState([]);
  const chartRef = useRef(null);

  // console.log(oppdataRange);
  useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await api.get(
            `/analytics/getOppQueryCount?filter=${query}` +
              (cluster ? `&cluster=${cluster}` : "") +
              (region ? `&region=${region}` : ""),{withCredentials: true}
          );

          const data = res.data;
          if (res.status === 200) {
            setOppData(data.map((value) => value.oppCount).reverse());
            setOppWonData(
              data.map((value) => parseInt(value.wonCount)).reverse()
            );
            setOppAdvancedData(
              data.map((value) => parseInt(value.advancedCount)).reverse()
            );
            setOppProspectionData(
              data.map((value) => parseInt(value.prospectionCount)).reverse()
            );
            setOppHoldData(
              data.map((value) => parseInt(value.holdCount)).reverse()
            );
            if (query === "MONTH") {
              setOppDataRange(
                data
                  .map((value) => getMonthName(value.MONTH, value.Year))
                  .reverse()
              );
            } else if (query === "WEEK") {
              setOppDataRange(
                data.map((value) => getWeekName(value.WEEK)).reverse()
              );
            } else if(query === "QUARTER") {
              setOppDataRange(
                data
                  .map((value) => getQuarterName(value.QUARTER, value.Year))
                  .reverse()
              );
            } else {
              setOppDataRange(
                data
                  .map((value) => getYearName(value.Year))
                  .reverse()
              );
            }
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          setError(true);
        }
      };
      fetchData();
  }, [query,cluster,region,apiRoute]);

  const getMonthName = (monthNumber, year) => {
    const date = new Date();
    // console.log(date.setMonth(monthNumber-1));
    date.setFullYear(year);
    date.setMonth(monthNumber - 1); // JavaScript months are zero-based (0 = January, 1 = February, ...)
    console.log(date);
    return date.toLocaleString("en-US", { month: "short" }) + " " + year;
  };

  const getWeekName = (weekNumber) => {
    return `week ${weekNumber}`;
  };

  const getYearName = (year) => {
    return `Year ${year}`;
  };

  const getQuarterName = (quarterNumber, year) => {
    return `${ordinal(quarterNumber)} Q ${year}`;
  };
  
  const revenueChart = {
    series: [
      {
        name: "Total Opportunities",
        data: oppdata,
      },
      {
        name: "Opportunity Won",
        data: oppWondata,
      },
      {
        name: "Opportunity Hold",
        data: oppHoldData,
      },
      {
        name: "Opportunity Advanced",
        data: oppAdvancedData,
      },
      {
        name: "Opportunity Prospected",
        data: oppProspectionData,
      },
    ],
    options: {
      chart: {
        type: "area",
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        curve: "smooth",
        width: 2,
        lineCap: "square",
      },
      dropShadow: {
        enabled: true,
        opacity: 0.2,
        blur: 10,
        left: -7,
        top: 22,
      },
      colors: isDark
        ? ["#2196F3", "#7CBB55"]
        : ["#1B55E2", "#7CBB55", "#FFFF00", "#00CED1", "#FFD700"],

      labels: oppdataRange,
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-xaxis-title",
          },
        },
        tooltip: {
          enabled: false,
        },
      },

      yaxis: {
        tickAmount: 7,
        labels: {
          formatter: (value) => {
            return value + " opp";
          },
          offsetX: -10,
          offsetY: 0,
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-yaxis-title",
          },
        },
        opposite: false,
      },
      grid: {
        borderColor: isDark ? "#191E3A" : "#E0E6ED",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "16px",
        markers: {
          width: 10,
          height: 10,
          offsetX: -2,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5,
        },
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false, // This ensures tooltips are shown for all data points along x-axis.
        marker: {
          show: true,
        },
        x: {
          show: true, // Ensure tooltips display x-axis values.
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: !1,
          opacityFrom: isDark ? 0.19 : 0.28,
          opacityTo: 0.05,
          stops: isDark ? [100, 100] : [45, 100],
        },
      },
    },
  };
  if (error) {
    return (<>
    <Spinner/>
     <p>An Error occured, Please Reload the Application</p> 
    </>)
  } else{
    return (
      <div className="panel h-full p-0 lg:col-span-2">
        <div className="flex items-start justify-between dark:text-white-light mb-5 p-5 border-b  border-white-light dark:border-[#1b2e4b] md:flex-row flex-col gap-2">
          <h5 className="font-semibold text-lg">Opportunities</h5>
          <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
            <span className="mt-1 mx-3">{region || 'All'}</span>
            <Dropdown
              // offset={[0, 1]}
              button={
                <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2" />
              }
            >
              <ul>
                <li>
                  <button
                    onClick={(e) => setRegion(e.target.value)}
                    value={""}
                    type="button"
                  >
                    All
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => setRegion(e.target.value)}
                    value={"FR"}
                    type="button"
                  >
                    France
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => setRegion(e.target.value)}
                    value={"IN"}
                    type="button"
                  >
                    India
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => setRegion(e.target.value)}
                    value={"DE"}
                    type="button"
                  >
                    Germany
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => setRegion(e.target.value)}
                    value={"UK"}
                    type="button"
                  >
                    United Kingdom
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => setRegion(e.target.value)}
                    value={"ES"}
                    type="button"
                  >
                    Spain
                  </button>
                </li>
              </ul>
            </Dropdown>
          </div>
          <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
            <span className="mt-1 mx-3">{cluster || 'All'}</span>
            <Dropdown
              // offset={[0, 1]}s
              button={
                <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2" />
              }
            >
              <ul>
                <li>
                  <button
                    onClick={(e) => setCluster(e.target.value)}
                    value={""}
                    type="button"
                  >
                    All
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => setCluster(e.target.value)}
                    value={"SNPS"}
                    type="button"
                  >
                    S&PS
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => setCluster(e.target.value)}
                    value={"MNT"}
                    type="button"
                  >
                    MNT
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => setCluster(e.target.value)}
                    value={"MEBM"}
                    type="button"
                  >
                    MEBM
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => setCluster(e.target.value)}
                    value={"Other"}
                    type="button"
                  >
                    Other
                  </button>
                </li>
              </ul>
            </Dropdown>
          </div>
          <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
          <span className="mt-1 mx-3">{query || '-'}</span>
            <Dropdown
              // offset={[0, 1]}
              button={
                <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2"/>
              }
            >
              <ul>
                <li>
                  <button
                    onClick={(e) => setQuery(e.target.value)}
                    value={"WEEK"}
                    type="button"
                  >
                    Weekly
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => setQuery(e.target.value)}
                    value={"MONTH"}
                    type="button"
                  >
                    Monthly
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => setQuery(e.target.value)}
                    value={"QUARTER"}
                    type="button"
                  >
                    Quarterly
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => setQuery(e.target.value)}
                    value={"YEAR"}
                    type="button"
                  >
                    Yearly
                  </button>
                </li>
              </ul>
            </Dropdown>
          </div>
        </div>
            {loading ? (
              <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
              </div>
            ) : (
              <ReactApexChart
                ref={chartRef}
                series={revenueChart.series}
                options={revenueChart.options}
                type="area"
                height={360}
              />
            )}
       
      </div>
    );
  }


};
