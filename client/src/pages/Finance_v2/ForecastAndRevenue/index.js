import React, { useState, useEffect } from 'react';
import Dropdown from '../../../components/Dropdown';
import IconHorizontalDots from '../../../components/Icon/IconHorizontalDots';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import { Spinner } from 'flowbite-react';
import ApexCharts from 'apexcharts';

const ForecastAndRevenue = ({ currencyCode }) => {
    const [forecastRegion, setForecastRegion] = useState("");
    const [forecastQuery, setForecastQuery] = useState("monthly");
    const [forecastCluster, setForecastCluster] = useState("");
    const [loading, setLoading] = useState(false);
    const [graphRevenueForecastData, setGraphRevenueForecastData] = useState([]);
    const [graphActualRevenueData, setGraphActualRevenueData] = useState([]);
    const [graphPlannedRevenueData, setGraphPlannedRevenueData] = useState([]);
    const [graphDeliveryForecastData, setGraphDeliveryForecastData] = useState([]);
    const [forecastGraphRange, setForecastGraphRange] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;

    const getCurrencySymbol = (currencyCode) => {
        switch (currencyCode) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'INR': return '₹';
            case 'JPY': return '¥';
            case 'CNY': return '¥';
            case 'AUD': return 'A$';
            case 'CAD': return 'C$';
            // Add more cases as needed
            default: return currencyCode; // Fallback to currency code if symbol is not found
        }
    };

    // Usage example in component
    const currencySymbol = getCurrencySymbol(currencyCode);

    // console.log(graphDeliveryForecastData)
    // console.log(graphActualRevenueData)

    const fetchForecastData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/finance/getRevenueAndExtensionData`, {
                params: {
                    region: forecastRegion,
                    filter: forecastQuery === "calendar" ? "quarterly" : forecastQuery, 
                    cluster: forecastCluster,
                    currencyCode: currencyCode
                },
                withCredentials: true,
            });

            const data = response.data;
            // console.log(data.map((value)=> value.deliveryForecast))
            setGraphDeliveryForecastData(data.map((value) => value.deliveryForecast));
            setGraphPlannedRevenueData(data.map((value) => value.plannedRevenue));
            setGraphActualRevenueData(data.map((value) => value.revenueRecognize));
            setGraphRevenueForecastData(data.map((value) => value.revenueProjection));

            let graphData = [];

            if (forecastQuery === 'monthly') {
                const monthNames = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];

                graphData = data.map((item) => ({
                    x: `${monthNames[item.month - 1]}, ${item.year}`, // Month Name, Year for x-axis
                    deliveryForecast: item.deliveryForecast,
                    plannedRevenue: item.plannedRevenue,
                    revenueRecognize: item.revenueRecognize,
                    revenueProjection: item.revenueProjection,
                }));
            } else if (forecastQuery === 'quarterly') {
                graphData = data.map((item) => ({
                    x: `FY${item.fiscalYear}, Q${item.fiscalQuarter}`, // Fiscal Year, Quarter for x-axis
                    deliveryForecast: item.deliveryForecast,
                    plannedRevenue: item.plannedRevenue,
                    revenueRecognize: item.revenueRecognize,
                    revenueProjection: item.revenueProjection,
                }));
            } else if (forecastQuery === 'yearly') {
                graphData = data.map((item) => ({
                    x: `FY${item.fiscalYear}`, // Fiscal Year for x-axis
                    deliveryForecast: item.deliveryForecast,
                    plannedRevenue: item.plannedRevenue,
                    revenueRecognize: item.revenueRecognize,
                    revenueProjection: item.revenueProjection,
                }));
            } else if (forecastQuery === 'calendar') {                            
                graphData = data.map((item) => {                                  
                    const fiscalQuarter = item.fiscalQuarter;                    
                    const calendarQuarter = (fiscalQuarter % 4) + 1;           
                    if (fiscalQuarter === 4) {                                
                        item.fiscalYear = item.fiscalYear + 1;                 
                    }
                    return {                                                
                        x: `CY${item.fiscalYear}, Q${calendarQuarter}`,      
                        deliveryForecast: item.deliveryForecast,             
                        plannedRevenue: item.plannedRevenue,                 
                        revenueRecognize: item.revenueRecognize,            
                        revenueProjection: item.revenueProjection,          
                    };
                })};     

            // Set the graph data for different categories
            setGraphDeliveryForecastData(graphData.map((value) => ({
                x: value.x,
                y: value.deliveryForecast,
            })));

            setGraphPlannedRevenueData(graphData.map((value) => ({
                x: value.x,
                y: value.plannedRevenue,
            })));

            setGraphActualRevenueData(graphData.map((value) => ({
                x: value.x,
                y: value.revenueRecognize,
            })));

            setGraphRevenueForecastData(graphData.map((value) => ({
                x: value.x,
                y: value.revenueProjection,
            })));
        } catch (error) {
            console.error("Error fetching forecast data:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        // console.log('Fetching data with filters:', { forecastRegion, forecastQuery, forecastCluster });
        fetchForecastData();
    }, [forecastRegion, forecastQuery, forecastCluster, currencyCode]);

    if (loading) return <div className="flex justify-center items-center h-full w-full">
        <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-gray-500 mt-2">Loading Forecast and Revenue...</p>
        </div>
    </div>
    const uniqueVisitorSeries = {
        series: [
            {
                name: "Planned Revenue (IPMS)",
                type: 'line',
                color: '#1B55E2',
                data: graphPlannedRevenueData,
            },
            {
                name: "Revenue Recognized",
                type: 'bar',
                color: '#2E8B20',
                data: graphActualRevenueData,
            },
            {
                name: "Revenue Projection",
                type: 'bar',
                color: '#808080',
                data: graphRevenueForecastData,
            },
            {
                name: "Delivery Forecast",
                type: 'line',
                color: "#FFA500",
                data: graphDeliveryForecastData,
            },
        ],
        options: {
            chart: {
                height: 360,
                type: "line",
                fontFamily: "Nunito, sans-serif",
                toolbar: {
                    show: true,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: [3, 2, 2, 3],
                curve: 'smooth',
            },
            dropShadow: {
                enabled: true,
                blur: 3,
                color: "#515365",
                opacity: 0.4,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "55%",
                    borderRadius: 8,
                    borderRadiusApplication: "end",
                },
            },
            legend: {
                position: "bottom",
                horizontalAlign: "center",
                fontSize: "14px",
                itemMargin: {
                    horizontal: 8,
                    vertical: 8,
                },
            },
            grid: {
                borderColor: "#e0e6ed",
                padding: {
                    left: 20,
                    right: 20,
                },
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
            },
            xaxis: {
                categories: forecastGraphRange,
                axisBorder: {
                    show: true,
                    color: "#e0e6ed",
                },
            },
            yaxis: {
                tickAmount: 6,
                opposite: false,
                labels: {
                    offsetX: 0,
                    formatter: function (value) {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + "M";
                        } else if (value >= 1000) {
                            return (value / 1000).toFixed(1) + "K";
                        }
                        return value;
                    },
                },
            },
            fill: {
                type: "gradient",
                gradient: {
                    shade: "light",
                    type: "vertical",
                    shadeIntensity: 0.3,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 0.8,
                    stops: [0, 100],
                },
            },
            tooltip: {
                shared: true,
                intersect: false,
                marker: {
                    show: true,
                },
                y: {
                    formatter: function (value) {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + "M";
                        } else if (value >= 1000) {
                            return (value / 1000).toFixed(1) + "K";
                        }
                        return value;
                    },
                },
            },
        },
    };

    const handleZoomOut = () => {
        const chart = ApexCharts.exec('chart-id', 'zoom.reset');
    };

    return (
        <div className="panel h-full xl:col-span-2">
            <div className="flex items-center justify-between dark:text-white-light mb-5">
                <h5 className="font-semibold text-lg">Forecast And Revenue ({currencySymbol})</h5>
                <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
                    <span className="mt-2 mx-3 text-sm">
                        {forecastRegion.toUpperCase() || "All"}
                    </span>
                    <Dropdown
                        offset={[0, 1]}
                        placement={"bottom-end"}
                        button={
                            <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2 " />
                        }
                    >
                        <ul>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastRegion("")}
                                >
                                    All
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastRegion("FR")}
                                >
                                    France
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastRegion("IN")}
                                >
                                    India
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastRegion("UK")}
                                >
                                    United Kingdom
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastRegion("DE")}
                                >
                                    Germany
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastRegion("ES")}
                                >
                                    Spain
                                </button>
                            </li>
                        </ul>
                    </Dropdown>
                </div>
                <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
                    <span className="mt-2 mx-3 text-sm">
                        {forecastQuery === "calendar" ? "QUARTERS BY CALENDAR" : forecastQuery.toUpperCase() || "All"}     
                    </span>
                    <Dropdown
                        offset={[0, 1]}
                        placement={"bottom-end"}
                        button={
                            <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2" />
                        }
                    >
                        <ul>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastQuery("monthly")}
                                >
                                    Monthly
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastQuery("quarterly")}
                                >
                                    Quarterly
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastQuery("yearly")}
                                >
                                    Yearly
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForecastQuery("calendar")}
                                >
                                    Quarters by Calendar
                                </button>
                            </li>
                        </ul>
                    </Dropdown>
                </div>
                <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
                    <span className="mt-2 mx-3 text-sm">
                        {forecastCluster.toUpperCase() || "All"}
                    </span>
                    <Dropdown
                        offset={[0, 1]}
                        placement={"bottom-end"}
                        button={
                            <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2" />
                        }
                        className="mr-8"
                    >
                        <ul>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastCluster("")}
                                >
                                    All
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastCluster("SNPS")}
                                >
                                    S&PS
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastCluster("MNT")}
                                >
                                    MNT
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setForecastCluster("MEBM")}
                                >
                                    MEBM
                                </button>
                            </li>
                        </ul>
                    </Dropdown>
                </div>
            </div>
            <button onClick={handleZoomOut} className="zoom-out-button">
            </button>
            {!loading ? (
                 <ReactApexChart
                 options={uniqueVisitorSeries.options}
                 series={uniqueVisitorSeries.series}
                 type="line"
                 height={360}
                 id="chart-id"
             />
            ) : (
                <p>Loading...</p>
            )}
              
        </div>
    );
};

export default ForecastAndRevenue;
