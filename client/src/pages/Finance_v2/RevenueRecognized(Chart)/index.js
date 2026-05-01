import React, { useState, useEffect } from 'react';
import Dropdown from '../../../components/Dropdown';
import numeral from "numeral";
import IconHorizontalDots from '../../../components/Icon/IconHorizontalDots';
import ReactApexChart from 'react-apexcharts';
import api from "../../../axios";
import { Spinner } from 'flowbite-react';

const RevenueRecognizedChart = ({currency}) => {

  const [loading, setLoading] = useState(false);
  const [revenueQuery, setRevenueQuery] = useState("cluster");
  const [chartData, setChartData] = useState({
    series: [],
    labels: [],
  });

  

  
  const getCurrencySymbol = (currency) => {
    switch (currency) {
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'INR': return '₹';
        case 'JPY': return '¥';
        case 'CNY': return '¥';
        case 'AUD': return 'A$';
        case 'CAD': return 'C$';
        // Add more cases as needed
        default: return currency; // Fallback to currency code if symbol is not found
    }
};

// Usage example in component
const currencySymbol = getCurrencySymbol(currency);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/finance/getRevenueRecognizedPieChart?query=${revenueQuery}`,
        {  params:{currency,revenueQuery},
          
          withCredentials: true }
        );

      const { data } = response;
      const labels = data.map(item => item.range);
      const series = data.map(item => item.totalAmount);

      setChartData({ labels, series });
    } catch (error) {
      console.error("Failed to fetch revenue data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data when `revenueQuery` changes
    fetchRevenueData(revenueQuery);
  }, [revenueQuery, currency]);

  const formatLargeNumber = (number) => {
    return numeral(number).format("0.0a");
  };

  if (loading) return <div className="flex justify-center items-center h-full w-full">
  <div className="flex flex-col items-center">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-gray-500 mt-2">Loading Revenue Recognized Chart...</p>
  </div>
</div>
  const revenueByCategory = {
    series: chartData.series,
    options: {
      chart: {
        type: "donut",
        height: 460,
        fontFamily: "Nunito, sans-serif",
      },
      stroke: {
        show: false,
        width: 25,
        color: "#fff",
      },
      colors: ["#1B55E2", "#E7515A", "#3AC857", "#FFD700", "#9B30FF"],
      labels: chartData.labels,
      dataLabels: {
        enabled: false,
      },
      states: {
        hover: {
          filter: "none",
        },
      },
      theme: {
        palette: "palette2",
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        height: 50,
        markers: {
          width: 10,
          height: 10,
          offsetX: -2,
        },
        offsetY: 20,
        fontSize: "14px",
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      fill: {
        opacity: 1,
        colors: ["#1B55E2", "#E7515A", "#3AC857", "#FFD700", "#9B30FF"],
        type: "solid",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            background: "transparent",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "29px",
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: "26px",
                color: undefined,
                offsetY: 16,
                formatter: (val) => {
                  return formatLargeNumber(val);
                },
              },
              total: {
                show: true,
                label: "Total",
                color: "#888ea8",
                fontSize: "29px",
                formatter: (w) => {
                  return formatLargeNumber(
                    w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                  );
                },
              },
            },
          },
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return formatLargeNumber(val);
          },
        },
      },
    },
  };

  return (
    <div className="panel h-full">
      <div className="flex items-center justify-between mb-5">
        <h5 className="font-semibold text-lg dark:text-white-light">
          Revenue Recognized (till- date) ({currencySymbol})
        </h5>
        <div className="dropdown">
          <Dropdown
            offset={[0, 1]}
            placement={`${"bottom-end"}`}
            button={
              <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />
            }
            className="mr-8"
          >
            <ul>
              <li>
                <button
                  type="button"
                  onClick={() => setRevenueQuery("cluster")}
                >
                  Cluster
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setRevenueQuery("region")}
                >
                  Region
                </button>
              </li>
            </ul>
          </Dropdown>
        </div>
      </div>

      <div>
        <div className="bg-white dark:bg-black rounded-lg overflow-hidden">
          {loading ? (
            <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
              <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-5 h-5 inline-flex"></span>
            </div>
          ) : (
            <ReactApexChart
              series={revenueByCategory.series}
              options={revenueByCategory.options}
              type="donut"
              height={460}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueRecognizedChart;
