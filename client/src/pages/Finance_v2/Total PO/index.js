import React, { useState, useEffect } from 'react';
import IconCashBanknotes from '../../../components/Icon/IconCashBanknotes';
import ReactApexChart from 'react-apexcharts';
import numeral from 'numeral';
import dayjs from 'dayjs'; // Import dayjs
import { Spinner } from 'flowbite-react';
import api from "../../../axios";

const TotalPO = ({ currency }) => {
    const [purchaseGraphAmount, setPurchaseGraphAmount] = useState(0);
    const [purchaseStats, setPurchaseStats] = useState([]);
    const [loading, setLoading] = useState(true);
    

    const currencyRates = {
        USD: 1,
        EUR: 0.85,
        INR: 74.5,
        GBP: 0.75,
        RON: 4.2,
    };

    const currencySymbols = {
        USD: '$',
        EUR: '€',
        INR: '₹',
        GBP: '£',
        RON: 'lei',
    };

    const convertCurrency = (amount, fromCurrency, toCurrency) => {
        if (fromCurrency === toCurrency) {
            return amount;
        }
        const conversionRate = currencyRates[toCurrency] / currencyRates[fromCurrency];
        return (amount * conversionRate).toFixed(2);
    };

    const formatLargeNumber = (number) => {
        return numeral(number).format("0.0a");
    };

    useEffect(() => {
        const fetchPurchaseData = async () => {
            try {
                const response = await api.get(`/finance/getPurchaseInfo`, {
                    withCredentials: true,
                    params: { currency },
                });

                const { purchaseStats, totalPurchaseAmount, currency: fetchedCurrency } = response.data;

                const convertedAmount = convertCurrency(totalPurchaseAmount, fetchedCurrency, currency);

                setPurchaseGraphAmount(convertedAmount);

                const formattedStats = purchaseStats.map(stat => ({
                    monthYear: stat.monthYear,
                    purchaseCount: stat.purchaseCount,
                }));

                setPurchaseStats(formattedStats);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching purchase data", error);
                setLoading(false);
            }
        };

        fetchPurchaseData();
    }, [currency]);

    const totalOrders = {
        series: [
            {
                name: "PO Count",
                data: purchaseStats.map(stat => stat.purchaseCount),
            },
        ],
        options: {
            chart: {
                height: 290,
                type: "area",
                fontFamily: "Nunito, sans-serif",
                sparkline: {
                    enabled: true,
                },
            },
            stroke: {
                curve: "smooth",
                width: 2,
            },
            colors: ["#00ab55"],
            labels: purchaseStats.map(stat =>
                dayjs(stat.monthYear, "YYYY-MM").format("MMM YYYY") // Format the labels
            ),
            yaxis: {
                min: 0,
                show: false,
            },
            grid: {
                padding: {
                    top: 125,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            fill: {
                opacity: 1,
                type: "gradient",
                gradient: {
                    type: "vertical",
                    shadeIntensity: 1,
                    inverseColors: false,
                    opacityFrom: 0.3,
                    opacityTo: 0.05,
                    stops: [100, 100],
                },
            },
            tooltip: {
                x: {
                    show: true,
                },
            },
        },
    };

    if (loading) return (
        <div className="flex justify-center items-center h-full w-full">
            <div className="flex flex-col items-center">
                <Spinner size="lg" />
                <p className="text-sm font-medium text-gray-500 mt-2">Loading Total PO...</p>
            </div>
        </div>
    );

    return (
        <div className="panel h-full p-0">
            <div className="flex items-center justify-between w-full p-5 absolute">
                <div className="relative">
                    <div className="text-success dark:text-success-light bg-success-light dark:bg-success w-11 h-11 rounded-lg flex items-center justify-center">
                        <IconCashBanknotes />
                    </div>
                </div>
                <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left dark:text-white-light">
                    {currencySymbols[currency]} {formatLargeNumber(purchaseGraphAmount)}
                    <span className="block text-sm font-normal">
                        Total PO (Last 12 Months)
                    </span>
                </h5>
            </div>
            <div className="bg-transparent rounded-lg overflow-hidden">
                {loading ? (
                    <div className="min-h-[320px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
                        <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-5 h-5 inline-flex"></span>
                    </div>
                ) : (
                    <ReactApexChart
                        series={totalOrders.series}
                        options={totalOrders.options}
                        type="area"
                        height={310}
                    />
                )}
            </div>
        </div>
    );
};

export default TotalPO;
