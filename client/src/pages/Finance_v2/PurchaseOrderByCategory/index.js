import React, { useState, useEffect } from "react";
import Dropdown from "../../../components/Dropdown";
import IconHorizontalDots from "../../../components/Icon/IconHorizontalDots";
import ReactApexChart from "react-apexcharts";
import numeral from "numeral";
import axios from "axios";
import { Spinner } from "flowbite-react";

const PurchaseOrderByCategory = ({currency}) => {
    const [loading, setLoading] = useState(false);
    const [purchaseQuery, setPurchaseQuery] = useState("cluster");
    const apiUrl = process.env.REACT_APP_API_URL;
    const [chartData, setChartData] = useState({
        series: [],
        labels: [],
    });

    const formatLargeNumber = (number) => numeral(number).format("0.0a");

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

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${apiUrl}/finance/getPoPie?query=${purchaseQuery}`,
                { 
                    params:{purchaseQuery,currency},
                    withCredentials: true }
            );

            const { data } = response;
            const series = data.map((item) => item.totalAmount);
            const labels = data.map((item) => item.range);

            setChartData({ series, labels });
        } catch (error) {
            console.error("Error fetching purchase order data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [purchaseQuery,currency]);

    if (loading) return <div className="flex justify-center items-center h-full w-full">
    <div className="flex flex-col items-center">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-gray-500 mt-2">Loading Purchase Order by Category...</p>
    </div>
  </div>

    const salesByCategory = {
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
                                formatter: (val) => formatLargeNumber(val),
                            },
                            total: {
                                show: true,
                                label: "Total",
                                color: "#888ea8",
                                fontSize: "29px",
                                formatter: (w) =>
                                    formatLargeNumber(
                                        w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                                    ),
                            },
                        },
                    },
                },
            },
            tooltip: {
                y: {
                    formatter: (val) => formatLargeNumber(val),
                },
            },
        },
    };

    return (
        <div className="panel h-full">
            <div className="flex items-center justify-between mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">
                    Purchase Order By Category ({currencySymbol})
                </h5>
                <div className="dropdown">
                    <Dropdown
                        offset={[0, 1]}
                        placement="bottom-end"
                        button={
                            <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />
                        }
                        className="mr-8"
                    >
                        <ul>
                            <li>
                                <button type="button" onClick={() => setPurchaseQuery("cluster")}>
                                    Cluster
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => setPurchaseQuery("region")}>
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
                            series={salesByCategory.series}
                            options={salesByCategory.options}
                            type="donut"
                            height={460}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderByCategory;
