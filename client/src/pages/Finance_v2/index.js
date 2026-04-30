import { dividerClasses } from '@mui/material';
import { useState, useEffect } from 'react';
import React from 'react'
import DeliveryForcast from './DeliveryForecast';
import PlannedRevenue from './PlannedRevenue';
import RevenueProjection from './RevenueProjection';
import RevenueRecognized from './RevenueRecognized';
import RevenueRecognizedChart from './RevenueRecognized(Chart)'
import IconEye from "../../components/Icon/IconEye";
import ForecastAndRevenue from './ForecastAndRevenue';
import POandInvoicedAmount from './POandInvoicedAmount';
import PurchaseOrderByCategory from './PurchaseOrderByCategory';
import MissionLeaderStats from './MissionLeaderStats';
import POReceivedVsTotal from './POReceivedVsTotal'
import TotalPO from './Total PO';
import RecentPurchaseOrder from './RecentPurchaseOrder';
import RecentForecast from './RecentForecast';
import ExtensionLikeliness from './ExtentionLikeliness';
const Finance_v2 = () => {
    const [currency, setCurrency] = useState("EUR");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const currencySymbols = {
        USD: "$",
        EUR: "€",
        INR: "₹",
        GBP: "£",
    };

    const handleCurrencyChange = (newCurrency) => {
        setCurrency(newCurrency);
        setIsDropdownOpen(false);
        console.log(`Currency changed to: ${newCurrency}`);
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!event.target.closest(".dropdown-container")) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("click", handleOutsideClick);
        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    return (
        <div>
          <div className="mt-2 p-2 text-white font-semibold text-3xl bg-gradient-to-r from-[#4361ee] to-[#645cba] rounded-lg relative">
                <span className="block text-center">Financial Dashboard</span>
                <div className="absolute top-2 right-2 flex space-x-2 dropdown-container">
                    <button
                        className="flex items-center px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-md"
                    >
                        <span>
                            {currencySymbols[currency]}
                        </span>
                    </button>
                    <button
                        className="text-white hover:bg-[#645cba] rounded-full p-2"
                        aria-label="Currency Conversion"
                        onClick={toggleDropdown} // Toggle dropdown visibility
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6.75a.75.75 0 100-1.5.75.75 0 000 1.5zm0 5.25a.75.75 0 100-1.5.75.75 0 000 1.5zm0 5.25a.75.75.75 0 100-1.5.75.75.75 0 000 1.5z"
                            />
                        </svg>
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 text-gray-700 dark:text-white z-50 transition-all duration-300 ease-in-out transform scale-95 hover:scale-100">
                            {["USD", "EUR", "INR", "GBP"].map((curr) => (
                                <div
                                    key={curr}
                                    className="px-4 py-2 text-black/70 dark:text-white/70 hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-sm rounded-lg transition-colors duration-200 ease-in-out"
                                    onClick={() => handleCurrencyChange(curr)}
                                >
                                    {curr}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 text-white">
                    <RevenueProjection
                        currency={currency}
                    />
                    <RevenueRecognized
                        currency={currency}
                    />

                    <PlannedRevenue
                        currency={currency}
                    />
                    <DeliveryForcast
                        currency={currency}
                    />

                </div>
                <div className="grid xl:grid-cols-3 gap-6 mb-6">
                    <RevenueRecognizedChart
                        currency={currency}
                    />
                    <ForecastAndRevenue
                        currencyCode={currency}
                    />
                </div>
                <div className="grid xl:grid-cols-3 gap-6 mb-6">
                    <POandInvoicedAmount
                        currencyCode={currency}
                    />
                    <PurchaseOrderByCategory
                        currency={currency}
                    />
                </div>

                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                    <MissionLeaderStats
                        currency={currency}
                    />
                    <POReceivedVsTotal
                        currency={currency}
                    />
                    <TotalPO
                        currency={currency} />
                </div>
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mb-6">
                    <RecentPurchaseOrder
                        currency={currency}
                    />
                    <RecentForecast
                        currency={currency}
                    />
                </div>
                <div className ="grid lg:grid-cols-2 grid-cols-1">
                    <ExtensionLikeliness
                    currency={currency} />
                </div>

            </div>
        </div>
    )
}

export default Finance_v2;