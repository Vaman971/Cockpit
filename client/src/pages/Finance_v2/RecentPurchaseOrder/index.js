import React, { useState, useEffect } from 'react';
import api from "../../../axios";
import { DownloadIcon } from '@heroicons/react/solid';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const RecentPurchaseOrder = ({ currency }) => {
    const [poData, setPoData] = useState([]);
    

    const formatPoId = (id) => {
        if (id == null) return "PO-00000"; // Handle undefined or null IDs
        const idString = id.toString();
        const zerosCount = 5 - idString.length;
        return `PO-${"0".repeat(zerosCount)}${idString}`;
    };

    const exchangeRates = {
        USD: 1, // Base currency, no conversion needed
        EUR: 0.85,
        GBP: 0.75,
        // Add other currencies and rates as needed
    };

    // Currency symbols map
    const currencySymbols = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        // Add more currency symbols as needed
    };

    const handlePoClick = (id) => {
        window.open(`/purchaseOrder/${id}`,'_blank');
    }
 

    // Convert amount using the selected currency's exchange rate
    const convertCurrency = (amount) => {
        if (!amount || !exchangeRates[currency]) {
            console.warn('Invalid amount or currency:', amount, currency);
            return amount;
        }
        const convertedAmount = amount * exchangeRates[currency];
        console.log(`Converting ${amount} to ${currency}: ${convertedAmount}`);
        return isNaN(convertedAmount) ? amount : convertedAmount;
    };

    useEffect(() => {
        const fetchLatestPurchaseOrders = async () => {
            try {
                const response = await api.get(`/po/getLatestPo`, {
                    withCredentials: true,
                    params: { currency },
                });
                console.log('Fetched purchase orders:', response.data);
                setPoData(response.data);
            } catch (error) {
                console.error('Error fetching latest purchase orders:', error);
            }
        };

        if (currency) {
            fetchLatestPurchaseOrders();
        }
    }, [currency]);

    const handleExportCSV = async () => {
        try {
            const response = await api.get(`/po/getLatestPo`, {
                withCredentials: true,
                params: { currency },
            });

            const csv = Papa.unparse(response.data, { header: true });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'purchase_orders.csv');
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    };



    return (
        <div className="panel h-full w-full">
            <div className="flex items-center justify-between mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">
                    Recent Purchase Orders
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
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr>
                                <th className="ltr:rounded-l-md rtl:rounded-r-md px-4 py-2">Po Id</th>
                                <th className="px-4 py-2 ">Description</th>
                                <th className="px-4 py-2 text-right">Po Amount</th>
                                <th className="px-4 py-2 text-right">Invoice</th>
                                <th className="ltr:rounded-r-md rtl:rounded-l-md px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {poData &&
                                poData.map((po) => (
                                    <tr
                                        key={po.id}
                                        className="text-white-dark hover:text-black dark:hover:text-white-light/90 group"
                                    >
                                        <td className="px-4 py-2">
                                        <button onClick={()=>handlePoClick(po.id)}>
                                            <span className="badge badge-outline-info whitespace-nowrap">
                                                {formatPoId(po.id)}
                                            </span>
                                        </button>
                                        </td>
                                        <td className="min-w-[150px] text-black dark:text-white px-4 py-2">
                                            <div className="flex justify-center">
                                                <span className="whitespace-pre-wrap">
                                                    {po?.poDescription
                                                        ? po.poDescription.split(" ").slice(0, 5).join(" ") + (po.poDescription.split(" ").length > 5 ? "..." : "")
                                                        : "-"
                                                    }
                                                </span>
                                            </div>
                                        </td>

                                        <td className="text-right px-4 py-2">
                                            {po?.poAmount
                                                ? `${currencySymbols[currency] || ""}${convertCurrency(po.poAmount).toLocaleString()}`
                                                : "-"}
                                        </td>
                                        <td className="text-right px-4 py-2">
                                            {po?.poPrice
                                                ? `${currencySymbols[currency] || ""}${convertCurrency(po.poPrice).toLocaleString()}`
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`badge border ${po.poStatus === "pending"
                                                    ? "badge-outline-primary"
                                                    : po.poStatus === "closed"
                                                        ? "badge-outline-success"
                                                        : po.poStatus === "open"
                                                            ? "badge-outline-secondary"
                                                            : "badge-outline-danger"
                                                    }`}
                                            >
                                                {po.poStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default RecentPurchaseOrder;
