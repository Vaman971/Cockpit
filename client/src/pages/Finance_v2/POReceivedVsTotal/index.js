import { dividerClasses } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner } from 'flowbite-react';
import { DownloadIcon } from '@heroicons/react/solid';
import Papa from "papaparse";
import { saveAs } from 'file-saver';


const POReceivedVsTotal = ({ currency }) => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;

    const currencyRates = {
        USD: 1,
        EUR: 0.85,
        INR: 74.5,
        GBP: 0.75,
        RON: 4.2,
    };

    const convertCurrency = (amount, fromCurrency, toCurrency) => {
        if (fromCurrency === toCurrency) {
            return amount;
        }
        const conversionRate = currencyRates[toCurrency] / currencyRates[fromCurrency];
        return (amount * conversionRate).toFixed(2);
    };

    const getCurrencySymbol = (currencyCode) => {
        switch (currencyCode) {
            case 'USD':
                return '$';
            case 'EUR':
                return '€';
            case 'GBP':
                return '£';
            case 'JPY':
                return '¥';
            case 'AUD':
                return 'A$';
            case 'INR':
                return '₹';
            case 'RON':
                return 'lei';
            default:
                return currencyCode;
        }
    };

    useEffect(() => {
        const fetchPurchaseOrders = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${apiUrl}/finance/getPoProgress`, {
                    params: { currency },
                    withCredentials: true,
                });

                if (response && response.data) {
                    setPurchaseOrders(response.data);
                } else {
                    setError("Received data is empty or malformed.");
                }
            } catch (err) {
                console.error("Error fetching purchase orders:", err);
                setError("Failed to fetch purchase order data.");
            } finally {
                setLoading(false);
            }
        };

        fetchPurchaseOrders();
    }, [apiUrl, currency]); // Re-fetch when currency prop changes

    if (loading) return <div className="flex justify-center items-center h-full w-full">
        <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-gray-500 mt-2">PO Received Vs total PO...</p>
        </div>
    </div>
    if (error) return <p className="text-center text-red-500">{error}</p>;

    const currencySymbol = getCurrencySymbol(currency); 

    const handleExportCSV = () => {
        const formattedData = purchaseOrders.map(po => ({
            "Mission Description": po.mission_description,
            "PO Price": po.poPrice,
            "PO Amount": po.poAmount,
            "PO Progress": `${(po.poPrice / po.poAmount) * 100 || 0}%`,
            "Mission Id": po.airbus_id,
            "Year": po.year,
        }));

        const csv = Papa.unparse(formattedData, {
            header: true,
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "invoice.csv");
    };

    return (

        <div className="panel h-full">
            <div className="flex items-center justify-between dark:text-white-light mb-5">
                <h5 className="font-semibold text-lg">Invoiced PO Vs Total PO</h5>
                <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center text-white bg-green-500 border border-gray-300 focus:outline-none mx-1 hover:bg-green-700 focus:ring-4 focus:ring-green-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-green-400 dark:border-green-600 dark:hover:bg-gray-700 dark:hover:border-green-700 dark:focus:ring-green-700"
                >
                    <DownloadIcon className="h-5 w-5" />

                </button>
            </div>
            <div className="space-y-12 overflow-auto h-52 animated-progress scrollbar-w-2 scrollbar-track-gray-lighter scrollbar-thumb-rounded scrollbar-thumb-gray hover:scrollbar-thumb-gray-dark">
                {purchaseOrders.map((po, index) => (
                    <div className="flex items-center" key={index}>
                        <div className="flex-1">
                            <div className="flex font-semibold text-white-dark mb-2">
                                <h6>PO Description: {po.poDescription}</h6>
                                {/* Display price with currency symbol before the amount */}
                                <p className="ml-auto">
                                    {currencySymbol}{convertCurrency(po.poPrice)}
                                </p>
                            </div>
                            <div className="rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
                                <div
                                    className="bg-gradient-to-r from-[#7579ff] to-[#b224ef] h-full rounded-full"
                                    style={{
                                        width: `${(po.poPrice / po.poAmount) * 100 || 0}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default POReceivedVsTotal;
