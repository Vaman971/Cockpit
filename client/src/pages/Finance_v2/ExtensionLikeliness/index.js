import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import React, { useEffect, useState} from "react";
import api from "../../../axios";
import Dropdown from '../../../components/Dropdown';
import IconHorizontalDots from '../../../components/Icon/IconHorizontalDots';
import { Spinner } from 'flowbite-react';

const ExtensionLikeliness = ({currency}) => {
    const isDark = useSelector((state) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state) => state.themeConfig.rtlClass === 'rtl');

    const [graphConfiremedPoData, setGraphConfiremedPoData] = useState([]);
    const [graphHighLikelinessData, setGraphHighLikelinessData] = useState([]);
    const [graphMediumLikelinessData, setGraphMediumLikelinessData] = useState([]);
    const [graphLowLikelinessData, setGraphLowLikelinessData] = useState([]);
    const [graphSelectedOppData, setGraphSelectedOppData] = useState([]);
    const [graphDeliveryForecastData, setGraphDeliveryForecastData] = useState([]);
    const [monthsData, setMonthsData] = useState([]);
    const [forecastRegion, setForecastRegion] = useState("");
    const [forecastCluster, setForecastCluster] = useState("");
    const [loading, setLoading] = useState(false);

    

    const formatMonthYearCustom = (monthString) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const [year, month] = monthString.split('-');
        return `${months[parseInt(month, 10) - 1]} ${year}`;
    };

    const mixedChart = {
        series: [
            {
                name: 'Confirmed PO',
                type: 'bar',
                data: graphConfiremedPoData,
            },
            {
                name: 'High',
                type: 'bar',
                data: graphHighLikelinessData,
            },
            {
                name: 'Selected Opp',
                type: 'bar',
                data: graphSelectedOppData,
            },
            {
                name: 'Medium',
                type: 'bar',
                data: graphMediumLikelinessData,
            },
            {
                name: 'Low',
                type: 'bar',
                data: graphLowLikelinessData,
            },
            {
                name: 'Delivery Forecast',
                type: 'line',
                data: graphDeliveryForecastData,
            },
        ],
        options: {
            chart: {
                height: 300,
                type: 'bar',
                stacked: true,
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
            // colors: ['#0055AA', '#535da9', '#808080','#4ba0ea', '#4791db','#E67E22'],
            colors: ['#9370DB', '#2196F3', '#808080', '#90CAF9', '#BBDEFB', '#FFA500'],
            stroke: {
                show: true,
                curve: "smooth",
                width: [0, 0, 0, 0, 0, 3], 
                lineCap: "round",
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "35%",
                    borderRadius: 6,
                    borderRadiusApplication: 'end', 
                    borderRadiusWhenStacked: 'last'
                },
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                            offsetX: -10,
                            offsetY: 5,
                        },
                    },
                },
            ],
            plotOptions: {
                bar: {
                    horizontal: false,
                },
            },
            xaxis: {
                lines: {
                    show: false,
                },
                
            },
            yaxis: {
                title: {
                    text: 'Currency Values',
                },
                min: 0,
                opposite: false,
                labels: {
                    formatter: (value) => {
                      return (value / 1000).toFixed(2) + 'K';
                    },
                    offsetX: -5,
                    offsetY: 0,
                    style: {
                      fontSize: "12px",
                    },
                  },
            },
            legend: {
                itemMargin: {
                    horizontal: 4,
                    vertical: 8,
                },
            },
            tooltip: {
                shared: true,
                intersect: false,
                theme: 'light',
            },
            fill: {
                opacity: [1, 0.75, 1, 0.75, 1],
            },
            labels: monthsData,
            markers: {
                size: 6,
            },
        },
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {

                const response = await api.get(`/newFinance/getRevenueData?cluster=${forecastCluster}&region=${forecastRegion}&currency=${currency}`, { withCredentials: true });
                const data = response.data;

                const months = data.map((entry) => formatMonthYearCustom(entry.month));
                const highValues = data.map((entry) => entry.high.toFixed(2));
                const mediumValues = data.map((entry) => entry.medium.toFixed(2));
                const lowValues = data.map((entry) => entry.low.toFixed(2));
                const confirmedValues = data.map((entry) => entry.poConfirmed.toFixed(2));
                const targetValues = data.map((entry) => entry.deliveryForcast.toFixed(2));
                const selectedOpp = data.map((entry) => entry.ExpectedDealSize.toFixed(2))

                setMonthsData(months);
                setGraphConfiremedPoData(confirmedValues);
                setGraphHighLikelinessData(highValues);
                setGraphSelectedOppData(selectedOpp)
                setGraphMediumLikelinessData(mediumValues);
                setGraphLowLikelinessData(lowValues);
                setGraphDeliveryForecastData(targetValues);


            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }

        };
        fetchData();
    }
, [forecastCluster,forecastRegion,currency]);

 
    if (loading) return <div className="flex justify-center items-center h-full w-full">
            <div className="flex flex-col items-center">
                <Spinner size="lg" />
                <p className="text-sm font-medium text-gray-500 mt-2">Loading Forecast and Revenue...</p>
            </div>
        </div>

return (
    <>
            <div className="panel h-full xl:col-span-2">
                <div className="flex items-center justify-between dark:text-white-light mb-5">
                    <h5 className="font-semibold text-lg">Financial Graph </h5>
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
                <div className="relative">
            <div className="bg-white dark:bg-black rounded-lg overflow-hidden cursor-crosshair">
                {loading ? (
                    <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                        <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                    </div>
                ) : (
                    <ReactApexChart series={mixedChart.series} options={mixedChart.options} type="bar" height={300} />
                )}
            </div>
        </div>
            </div>
        </>
);
};
export default ExtensionLikeliness;
