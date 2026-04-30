import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DownloadIcon } from '@heroicons/react/solid';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const RecentForecast = ({ currency }) => {
    const [forecasts, setForecasts] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;

    // Currency symbols map
    const currencySymbols = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        // Add more currency symbols as needed
    };

    const formatForecastId = (id) => {
        if (id === "-") {
            return "-";
        }
        const idString = id.toString();
        const zerosCount = 5 - idString.length;
        const formattedId = `FR-${"0".repeat(zerosCount)}${idString}`;
        return formattedId;
    };

    const handleForecastClick = (id)=>{                
        window.open(`/forecast/${id}`,'_blank');
    }

    useEffect(() => {
        const fetchForecasts = async () => {
            try {
                const response = await axios.get(`${apiUrl}/analytics/getLatestForecast`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with your token management logic
                    },
                });
                setForecasts(response.data);
            } catch (error) {
                console.error('Error fetching forecasts:', error);
            }
        };

        fetchForecasts();
    }, []);

    // Function to convert and format forecast amounts with currency
    const convertForecastAmount = (amount) => {
        if (!amount) return "-";
        return `${currencySymbols[currency] || ""}${amount.toLocaleString()}`;
    };

    const handleExportCSV = async () => {
        try {
            const response = await axios.get(`${apiUrl}/analytics/getLatestForecast`, {
                withCredentials: true,
            });

            const csv = Papa.unparse(response.data, { header: true });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'recent_forecast.csv');
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    };


    return (
        <div className="panel h-full w-full">
            <div className="flex items-center justify-between mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">
                    Recent Forecast
                </h5>
                <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center text-white bg-green-500 border border-gray-300 focus:outline-none mx-1 hover:bg-green-700 focus:ring-4 focus:ring-green-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-green-400 dark:border-green-600 dark:hover:bg-gray-700 dark:hover:border-green-700 dark:focus:ring-green-700"
                >
                    Export CSV
                    <DownloadIcon className="h-5 w-5" />

                </button>
            </div>
            <div className="table-responsive">
                <table>
                    <thead>
                        <tr className="border-b-0">
                            <th className="ltr:rounded-l-md rtl:rounded-r-md text-center">Forecast Id</th>
                            <th>Delivery Forecast</th>
                            <th>Sales Forecast</th>
                            <th>Revenue Forecast</th>
                            <th className="rounded-r-md">Cluster</th>
                            <th className="rounded-r-md">Region</th>
                        </tr>
                    </thead>
                    <tbody>
                        {forecasts.map((forecast) => (
                            <tr
                                key={forecast.id}
                                className="text-white-dark hover:text-black dark:hover:text-white-light/90 group"
                            >
                                <td className="min-w-[150px] text-black dark:text-white text-center">
                                    <div className="flex justify-center">
                                        <p className="whitespace-nowrap">
                                        <button onClick={()=>handleForecastClick(forecast.id)}>
                                            <span className="badge badge-outline-info whitespace-nowrap">
                                                {formatForecastId(forecast.id)}
                                            </span>
                                        </button>
                                        </p>
                                    </div>
                                </td>
                                <td>{convertForecastAmount(forecast.deliveryForcast)}</td>
                                <td>{convertForecastAmount(forecast.salesForcast)}</td>
                                <td className="text-center">{convertForecastAmount(forecast.revenueForcast)}</td>
                                <td>{forecast.cluster || '-'}</td>
                                <td>{forecast.region || '-'}</td>
                            </tr>
                        ))}
                        {forecasts.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center text-gray-500">
                                    No recent forecasts available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentForecast;
