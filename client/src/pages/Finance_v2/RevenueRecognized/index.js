import React, { useEffect, useState } from 'react';
import api from "../../../axios";
import IconEye from '../../../components/Icon/IconEye';
import numeral from 'numeral';
import { Spinner } from 'flowbite-react';

const RevenueRecognized = ({ currency }) => {
    const [revenueThisQuarter, setRevenueThisQuarter] = useState(null);
    const [overallRevenue, setOverallRevenue] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);


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
            default:
                return currencyCode;
        }
    };

    const formatLargeNumber = (number) => numeral(number).format('0.0a');

    const formatCurrency = (amount, currency) => {
        const symbol = getCurrencySymbol(currency);
        return `${symbol} ${formatLargeNumber(amount)}`;
    };

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                setLoading(true);
                const response = await api.get(
                    `/finance/getRevenueRecognizedInfo`,
                    {
                        params: { currency },
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        },
                    }
                );
                setRevenueThisQuarter(response.data.RevenueRecognizedThisQuarter);
                setOverallRevenue(response.data.OverallSum);
            } catch (err) {
                setError('Failed to fetch revenue recognized data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueData();
    }, [currency]);

    if (loading) return <div className="flex justify-center items-center h-full w-full">
        <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-gray-500 mt-2">Loading Revenue Recognized...</p>
        </div>
    </div>

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!revenueThisQuarter || !overallRevenue) {
        return <div>No data available.</div>;
    }

    const aggregatedClusters = overallRevenue.reduce((acc, clusterData) => {
        if (!acc[clusterData.cluster]) {
            acc[clusterData.cluster] = {
                cluster: clusterData.cluster,
                totalRevenueRecognized: 0,
            };
        }
        acc[clusterData.cluster].totalRevenueRecognized += clusterData.totalRevenueRecognized;
        return acc;
    }, {});

    const aggregatedClusterArray = Object.values(aggregatedClusters);

    const filteredClusters = aggregatedClusterArray.filter(clusterData =>
        ['SNPS', 'MEBM', 'MNT'].includes(clusterData.cluster)
    );

    const currentQuarterRevenue = revenueThisQuarter.reduce(
        (total, item) => total + item.totalRevenueRecognized,
        0
    );
    const totalRevenueRecognized = filteredClusters.reduce(
        (sum, clusterData) => sum + (clusterData.totalRevenueRecognized || 0),
        0
    );



    return (
        <div className="panel bg-gradient-to-r from-blue-500 to-blue-400 flex flex-col justify-between items-start">
            <div className="flex justify-between">
                <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-white">
                    Revenue Recognized (Current FY)
                </div>
            </div>
            <div className="flex items-center mt-5">
                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 text-white">
                    {formatCurrency(totalRevenueRecognized, currency)}
                </div>
            </div>
            <div className="flex items-center mt-5 justify-between w-full">
                {filteredClusters.length > 0 ? (
                    filteredClusters.map((clusterRevenue, index) => (
                        <div key={index} className="mr-3 font-bold text-white">
                            <div className="mr-1 text-xs font-semibold text-nowrap">
                                {clusterRevenue.cluster || 'Unknown Cluster'}
                            </div>
                            {clusterRevenue.totalRevenueRecognized
                                ? formatCurrency(clusterRevenue.totalRevenueRecognized, currency)
                                : 'N/A'}
                        </div>
                    ))
                ) : (
                    <div className="text-sm font-semibold text-gray-700">
                        No relevant cluster data available.
                    </div>
                )}
            </div>
            <div className="flex items-center font-semibold mt-5 text-white">
                <IconEye className="ltr:mr-2 rtl:ml-2 shrink-0" />
                Current Quarter: {formatCurrency(currentQuarterRevenue, currency)}
            </div>
        </div>
    );
};

export default RevenueRecognized;
