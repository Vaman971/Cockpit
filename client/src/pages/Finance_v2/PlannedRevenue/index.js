import React, { useEffect, useState } from 'react';
import IconEye from '../../../components/Icon/IconEye';
import api from "../../../axios";
import numeral from 'numeral';
import { Spinner } from 'flowbite-react';

const PlannedRevenue = ({ currency }) => {
    const [data, setData] = useState({
        totalRevenue: 0,
        clusters: [],
        updatedOn: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    

    useEffect(() => {
        const fetchForecastInfo = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.get(
                    `/finance/getForecastInfo`,
                    {
                        params: { currency }, // Pass the selected currency
                        withCredentials: true
                    }
                );

                const { OverallSum } = response.data;

                const totalRevenue = OverallSum.reduce(
                    (sum, item) => sum + parseFloat(item.totalRevenueForecast || 0),
                    0
                );
                const clusters = OverallSum.map((item) => ({
                    cluster: item.cluster,
                    revenue: parseFloat(item.totalRevenueForecast || 0),
                }));
                const updatedOn = OverallSum[0]?.updatedAt || 'N/A';

                setData({ totalRevenue, clusters, updatedOn });
            } catch (error) {
                console.error('Error fetching forecast data:', error);
                setError('Failed to load planned revenue data');
            } finally {
                setLoading(false);
            }
        };

        fetchForecastInfo();
    }, [currency]);

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

        return currencySymbols[currencyCode] || currencyCode; // Returns symbol or currency code if not found
    };

    const formatLargeNumber = (number) => numeral(number).format('0.0a');


    const formatCurrency = (amount, currency) => {
        const symbol = currencyDisplay(currency); // Get the symbol from the currencyDisplay function
        return `${symbol} ${formatLargeNumber(amount)}`; // Format the number with the symbol
    };

    if (loading) return <div className="flex justify-center items-center h-full w-full">
        <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-gray-500 mt-2">Loading Planned Revenue...</p>
        </div>
    </div>
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="panel bg-gradient-to-r from-blue-500 to-blue-400 flex flex-col justify-between items-start p-4">
            <div className="flex justify-between w-full">
                <div className="text-md font-semibold text-white">
                    Planned Revenue IPMS (Current Month)
                </div>
            </div>
            <div className="flex items-center mt-5">
                <div className="text-3xl font-bold text-white">
                    {formatCurrency(data.totalRevenue, currency)}
                </div>
            </div>
            <div className="flex items-center mt-5 justify-between w-full">
                {data.clusters.map((cluster, index) => (
                    <div key={index} className="font-bold text-white">
                        <div className="text-xs font-semibold text-white">
                            {cluster.cluster}
                        </div>
                        {formatCurrency(cluster.revenue, currency)}
                    </div>
                ))}
            </div>
            <div className="flex items-center font-semibold mt-5 text-white">
                <IconEye className="mr-2 shrink-0" />
                Updated On: {isNaN(new Date(data.updatedOn)) ? 'N/A' : new Date(data.updatedOn).toLocaleDateString()}
            </div>
        </div>
    );
};

export default PlannedRevenue;
