import React, { useState, useEffect } from 'react';
import axios from 'axios';
import numeral from 'numeral';
import IconEye from '../../../components/Icon/IconEye';
import { Spinner } from "flowbite-react";

const DeliveryForcast = ({ currency }) => {
    const [deliverySumThisQuarter, setDeliverySumThisQuarter] = useState(null);
    const [deliverySumThisFy, setDeliverySumThisFy] = useState(null);
    const [deliveryInfo, setDeliveryInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchDeliveryInfo = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${apiUrl}/finance/getDeliveryInfo`, {
                    params: { currency },
                    withCredentials: true,
                });
                setDeliveryInfo(response.data.DeliverySumThisQuarter);

                const quarterSum = response.data.DeliverySumThisQuarter.reduce(
                    (sum, entry) => sum + entry.totalDeliveryForcast,
                    0
                );
                const fiscalYearSum = response.data.OverallSum.reduce(
                    (sum, entry) => sum + entry.totalDeliveryForcast,
                    0
                );

                setDeliverySumThisQuarter(quarterSum);
                setDeliverySumThisFy(fiscalYearSum);
            } catch (err) {
                console.error('Error fetching delivery info:', err);
                setError('Failed to load delivery forecast info');
            } finally {
                setLoading(false);
            }
        };

        fetchDeliveryInfo();
    }, [apiUrl, currency]);

    const getMonthName = (month) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];
        return months[month - 1] || 'Invalid Month';
    };

    // Currency display function
    const currencyDisplay = (currencyCode) => {
        const currencySymbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            INR: '₹',
            AUD: 'A$',
            CAD: 'C$',
            // Add more currency symbols as needed
        };

        return currencySymbols[currencyCode] || currencyCode;
    };

    const formatLargeNumber = (number) => numeral(number).format('0.0a');

    const formatCurrency = (amount, currency) => {
        const symbol = currencyDisplay(currency);
        return `${symbol} ${formatLargeNumber(amount)}`;
    };

    if (loading) return <div className="flex justify-center items-center h-full w-full">
        <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-gray-500 mt-2">Loading delivery forecast...</p>
        </div>
    </div>;

    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="panel bg-gradient-to-r from-blue-500 to-blue-400 flex flex-col justify-between items-start">
            <div className="flex justify-between">
                <div className="mr-1 text-md font-semibold">
                    Delivery Forecast (Current Quarter)
                </div>
            </div>
            <div className="flex items-center mt-5">
                <div className="text-3xl font-bold mr-3">
                    {deliverySumThisQuarter ? formatCurrency(deliverySumThisQuarter, currency) : 'N/A'}
                </div>
            </div>
            <div className="flex items-center mt-5 w-full justify-between">
                {deliveryInfo.map((info, index) => (
                    <div key={index} className="mr-3 font-bold">
                        <div className="mr-1 text-xs font-semibold text-nowrap">
                            {getMonthName(info?.month) || 'N/A'}
                        </div>
                        {info.totalDeliveryForcast ? formatCurrency(info.totalDeliveryForcast, currency) : 'N/A'}
                    </div>
                ))}
            </div>
            <div className="flex items-center font-semibold mt-5">
                <IconEye className="mr-2 shrink-0" />
                {deliverySumThisFy ? `Current FY ${formatCurrency(deliverySumThisFy, currency)}` : 'N/A'}
            </div>
        </div>
    );
};

export default DeliveryForcast;
