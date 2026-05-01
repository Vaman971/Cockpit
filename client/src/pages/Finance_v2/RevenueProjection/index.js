import React, { useState, useEffect } from 'react';
import api from "../../../axios";
import IconEye from '../../../components/Icon/IconEye';
import numeral from 'numeral';
import { Spinner } from 'flowbite-react';

const RevenueProjection = ({ currency }) => {
    const [revenueData, setRevenueData] = useState({
        RevenueProjectionThisQuarter: [],
        OverallSum: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    

    useEffect(() => {
        const fetchRevenueProjectionInfo = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage
                const response = await api.get(
                    `/finance/getRevenueProjectionInfo`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: { currency },
                        withCredentials: true,
                    }
                );
                setRevenueData(response.data);
            } catch (err) {
                setError('Failed to fetch revenue projection data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueProjectionInfo();
    }, [currency]);

    if (loading) return <div className="flex justify-center items-center h-full w-full">
        <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-gray-500 mt-2">Loading Revenue Projection...</p>
        </div>
    </div>

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    const { RevenueProjectionThisQuarter, OverallSum } = revenueData;

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

    // Aggregate the revenue projections by cluster
    const aggregatedClusters = OverallSum.reduce((acc, clusterData) => {
        // If the cluster is not yet in the accumulator, add it
        if (!acc[clusterData.cluster]) {
            acc[clusterData.cluster] = {
                cluster: clusterData.cluster,
                totalRevenueProjection: 0,
            };
        }
        // Add the current cluster's revenue to the accumulated total
        acc[clusterData.cluster].totalRevenueProjection += clusterData.totalRevenueProjection;
        return acc;
    }, {});

    // Convert the aggregated object back into an array
    const aggregatedClusterArray = Object.values(aggregatedClusters);

    // Filter to only show SNPS, MEBM, and MNT
    const filteredClusters = aggregatedClusterArray.filter(clusterData =>
        ['SNPS', 'MEBM', 'MNT'].includes(clusterData.cluster)
    );

    // Get the current quarter revenue projection
    const currentQuarterRevenue = RevenueProjectionThisQuarter.length > 0
        ? RevenueProjectionThisQuarter[0].totalRevenueProjection
        : 'N/A';

    // Calculate the total revenue for filtered clusters
    const totalClusterRevenue = filteredClusters.reduce(
        (sum, clusterData) => sum + (clusterData.totalRevenueProjection || 0),
        0
    );

    
    return (
        <div className="panel bg-gradient-to-r from-blue-500 to-blue-400 flex flex-col justify-between items-start">
            <div className="flex justify-between">
                <div className="mr-1 text-md font-semibold">
                    Revenue Projection (Current FY)
                </div>
            </div>
            <div className="flex items-center mt-5">
                <div className="text-3xl font-bold mr-3">
                    {totalClusterRevenue > 0
                        ? formatCurrency(totalClusterRevenue, currency)
                        : 'N/A'}
                </div>
            </div>

            <div className="flex items-center mt-5 justify-between w-full">
                {filteredClusters.length > 0 ? (
                    filteredClusters.map((clusterData, index) => (
                        <div key={index} className="mr-3 font-bold">
                            <div className="mr-1 text-xs font-semibold text-nowrap">
                                {clusterData.cluster || 'Unknown Cluster'}
                            </div>
                            {clusterData.totalRevenueProjection
                                ? formatCurrency(clusterData.totalRevenueProjection, currency)
                                : 'N/A'}
                        </div>
                    ))
                ) : (
                    <div className="text-sm font-semibold text-gray-700">
                        No relevant cluster data available.
                    </div>
                )}
            </div>
            <div className="flex items-center font-semibold mt-5">
                <IconEye className="mr-2 shrink-0" />
                Current Quarter {currentQuarterRevenue !== 'N/A' ? formatCurrency(currentQuarterRevenue, currency) : 'N/A'}
            </div>
        </div>
    );
};

export default RevenueProjection;
