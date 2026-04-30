import React from 'react'
import { useState, useEffect } from 'react';
import numeral from "numeral";
import Dropdown from '../../../components/Dropdown';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios'
import IconHorizontalDots from '../../../components/Icon/IconHorizontalDots';
import { Spinner } from 'flowbite-react';
const POandInvoicedAmount = ({ currencyCode }) => {
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);
  const [totalInvoiceAmount, setTotalInvoiceAmount] = useState(0);
  const [graphPurchaseData, setGraphPurchaseData] = useState([]);
  const [graphInvoiceData, setGraphInvoiceData] = useState([]);
  const [region, setRegion] = useState("");
  // const [currency,setCurrency]=useState([])
  const [query, setQuery] = useState("monthly");
  const [graphCluster, setGraphCluster] = useState("");
  const [loading, setLoading] = useState(false);
  const [graphRange, setGraphRange] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;
  const formatLargeNumber = (number) => {
    return numeral(number).format("0.000a");
  };

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    INR: '₹',
    GBP: '£',
  };

  const getMonthName = (exp) => {
    let newExp = exp.split("-");
    let year = newExp[0];
    let monthNumber = newExp[1];

    const date = new Date();
    date.setFullYear(year);

    if (query === "quarterly") {
      let val = year.split("");
      let fy = val[val.length - 2] + val[val.length - 1];

      return "Q" + monthNumber + " FY" + fy;
    } else if (query === "yearly") {
      let val = year.split("");
      let fy = val[val.length - 2] + val[val.length - 1];
      return "FY " + fy;
    } else {
      date.setMonth(monthNumber - 1); // JavaScript months are zero-based (0 = January, 1 = February, ...)
      return date.toLocaleString("en-US", { month: "short" }) + " " + year;
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/finance/getPoAndInvoiceData?filter=${query}&cluster=${graphCluster}&region=${region}&currencyCode=${currencyCode}`, { withCredentials: true });
        const data = response.data;
        console.log(data);

        const purchaseAmounts = data.map((item) => item.purchases || 0);
        const invoiceAmounts = data.map((item) => item.invoices || 0);

        setTotalPurchaseAmount(purchaseAmounts.reduce((sum, val) => sum + val, 0));
        setTotalInvoiceAmount(invoiceAmounts.reduce((sum, val) => sum + val, 0));

        setGraphPurchaseData(data.map((item) => item.cumulativePurchases));
        setGraphInvoiceData(data.map((item) => item.cumulativeInvoices));
        setGraphRange(data.map((item) => getMonthName(item.date)));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };


    fetchData();
  }, [graphCluster, region, query, currencyCode]);

  const revenueChart = {
    series: [
      {
        name: "Purchase Orders",
        data: graphPurchaseData,
      },
      {
        name: "Invoiced Amount",
        data: graphInvoiceData,
      },
    ],
    options: {
      chart: {
        height: 325,
        type: "area",
        fontFamily: "Nunito, sans-serif",
        zoom: {
          enabled: false,
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
      colors: ['green', 'blue'],
      labels: graphRange,
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: true,
        },
        labels: {
          offsetX: 0,
          offsetY: 5,
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-xaxis-title",
          },
        },
      },
      yaxis: {
        tickAmount: 7,
        labels: {
          formatter: (value) => {
            return (value / 1000).toFixed(2) + 'K';
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
        borderColor: "#E0E6ED",
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
        marker: {
          show: true,
        },
        x: {
          show: false,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: !1,
          opacityFrom: 0.28,
          opacityTo: 0.05,
          stops: [45, 100],
        },
      },
    },
  };

  if (loading) return <div className="flex justify-center items-center h-full w-full">
  <div className="flex flex-col items-center">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-gray-500 mt-2">Loading PO And Invoiced Amount...</p>
  </div>
</div>

  return (
    <div className="panel h-full xl:col-span-2">
      <div className="flex items-center justify-between dark:text-white-light mb-5">
        <h5 className="font-semibold text-lg">PO And Invoiced Amount</h5>

        <p>Total PO : {formatLargeNumber(totalPurchaseAmount)} {currencySymbols[currencyCode]}</p>
        <p>Total Invoiced : {formatLargeNumber(totalInvoiceAmount)} {currencySymbols[currencyCode]}</p>
        <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
          <span className="mt-2 mx-3 text-sm">
            {region.toUpperCase() || "All"}
          </span>
          <Dropdown
            offset={[0, 1]}
            placement={`${"bottom-end"}`}
            button={
              <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2" />
            }
          >
            <ul>
              <li>
                <button type="button" onClick={() => setRegion("")}>
                  All
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRegion("FR")}>
                  France
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRegion("IN")}>
                  India
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRegion("UK")}>
                  United Kingdom
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRegion("DE")}>
                  Germany
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setRegion("ES")}>
                  Spain
                </button>
              </li>
            </ul>
          </Dropdown>
        </div>
        <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
          <span className="mt-2 mx-3 text-sm">
            {query.toUpperCase() || "All"}
          </span>
          <Dropdown
            offset={[0, 1]}
            placement={`${"bottom-end"}`}
            button={
              <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2" />
            }
          >
            <ul>
              <li>
                <button type="button" onClick={() => setQuery("monthly")}>
                  Monthly
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setQuery("quarterly")}
                >
                  Quarterly
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setQuery("yearly")}>
                  Yearly
                </button>
              </li>
            </ul>
          </Dropdown>
        </div>
        <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
          <span className="mt-2 mx-3 text-sm">
            {graphCluster.toUpperCase() || "All"}
          </span>
          <Dropdown
            offset={[0, 1]}
            placement={`${"bottom-end"}`}
            button={
              <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2" />
            }
          >
            <ul>
              <li>
                <button type="button" onClick={() => setGraphCluster("")}>
                  All
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setGraphCluster("SNPS")}
                >
                  S&PS
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setGraphCluster("MNT")}
                >
                  MNT
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setGraphCluster("MEBM")}
                >
                  MEBM
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setGraphCluster("Other")}
                >
                  Other
                </button>
              </li>
            </ul>
          </Dropdown>
        </div>
      </div>
      {/*Area Chart*/}
      <div className="relative">
        <div className="bg-white dark:bg-black rounded-lg overflow-hidden cursor-crosshair">
          {loading ? (
            <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
              <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
            </div>
          ) : (
            <ReactApexChart
              series={revenueChart.series}
              options={revenueChart.options}
              type="area"
              height={325}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default POandInvoicedAmount