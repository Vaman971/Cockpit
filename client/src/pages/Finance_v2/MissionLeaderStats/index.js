import React, { useState, useEffect } from 'react';
import IconDollarSign from '../../../components/Icon/IconDollarSign';

import { FaDollarSign, FaPoundSign, FaRupeeSign, FaEuroSign } from 'react-icons/fa';  // Import icons from react-icons
import { useSelector } from 'react-redux';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import { Spinner } from 'flowbite-react';

const MissionLeaderStats = ({ currency }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [purchaseLeader, SetPurchaseLeader] = useState([]);
    const [totalPurchaseOrder, SetTotalPurchaseOrder] = useState([]);

    const [profileData, setProfileData] = useState([]);
    const { currentUser } = useSelector((state) => state.user);

    const apiUrl = process.env.REACT_APP_API_URL;

    const fetchPurchaseBarData = async () => {
        try {
            const purchaseData = await axios.get(
                `${apiUrl}/analytics/getPurchaseAmountByMissionLeader`,
                { withCredentials: true }
            );

            const purchaseAmount = purchaseData.data;
            if (purchaseAmount.success === false) {
                console.error(purchaseAmount.message);
            } else {
                SetTotalPurchaseOrder(purchaseAmount.map((po) => po.purchaseTotal));
                SetPurchaseLeader(purchaseAmount.map((po) => po.missionLeader));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMissionLeaderPO = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/finance/getPoByMissionLeader`, {
                withCredentials: true,
                params: { currency }
            });
            const missionLeaderData = response.data;
            const conversionRate = 0.85;
            // Transform data for the chart and apply currency conversion
            const seriesData = missionLeaderData.map(item => ({
                x: item.missionLeader,    // Mission leader's name
                y: (item.purchaseTotal * conversionRate).toFixed(2),  // Apply conversion rate to purchaseTotal
            }));

            setData(seriesData);
        } catch (err) {
            console.error('Error fetching mission leader POs:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };
    const getCurrencyIcon = () => {
        switch (currency) {
            case 'USD':
                return <IconDollarSign />;
            case 'EUR':
                return <FaEuroSign />;
            case 'GBP':
                return <FaPoundSign />;
            case 'INR':
                return <FaRupeeSign />;

            default:
                return <IconDollarSign />;
        }
    };

    const fetchProfileData = async () => {
        const res = await axios.get(`${apiUrl}/profile/getProfiles`, {
            withCredentials: true,
        });
        const data = res.data;
        try {
            if (data.success === false) {
                console.log(data.message);
            } else {
                setProfileData(data);
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const getUserName = () => {
        // Map over the purchaseLeader array to find the usernames for each ID
        const userNames = purchaseLeader.map((leaderId) => {
            // Find the user profile corresponding to the leaderId
            const userData = profileData.find(
                (profile) => profile.userProfileId === Number(leaderId)
            );
            return userData ? userData.username : "";
        });

        return userNames;
    };

    useEffect(() => {
        fetchMissionLeaderPO();

    }, [apiUrl, currency]);

    useEffect(() => {
        if (currentUser.user.user_type === 'Leader' || currentUser.user.user_type === 'Admin') {
            fetchProfileData();
            fetchPurchaseBarData();
        }
    }, []);

    if (loading) return <div className="flex justify-center items-center h-full w-full">
        <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-gray-500 mt-2">Loading PO And Invoiced Amount...</p>
        </div>
    </div>

    const dailySales = {
        series: [
            {
                name: "PO Amount",
                data: data.map(item => item.y), // Extract 'y' values (purchaseTotal after conversion)
            },
        ],
        options: {
            chart: {
                height: 160,
                type: "bar",
                fontFamily: "Nunito, sans-serif",
                toolbar: {
                    show: false,
                },
                stacked: false,
                stackType: "100%",
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 1,
            },
            colors: ["#e2a03f"],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: "bottom",
                            offsetX: -5,
                            offsetY: 0,
                        },
                    },
                },
            ],
            xaxis: {
                labels: {
                    show: true,
                },
                categories: getUserName(), // Mission leader names (x values)
            },
            yaxis: {
                show: false,
            },
            fill: {
                opacity: 1,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "25%",
                },
            },
            legend: {
                show: false,
            },
            grid: {
                show: false,
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
                padding: {
                    top: 20,
                    right: 0,
                    bottom: -10,
                    left: 0,
                },
            },
        },
    };

    return (
        <div className="panel h-full sm:col-span-2 xl:col-span-1">
            <div className="flex items-center mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">
                    Mission Leader Stats
                    <span className="block text-white-dark text-sm font-normal">
                        Go to PO Table for details.
                    </span>
                </h5>
                <div className="ml-auto relative">
                    <div className="w-11 h-11 text-warning bg-warning-light dark:bg-warning dark:text-[#ffeccb] grid place-content-center rounded-full">
                        {getCurrencyIcon()}
                    </div>

                </div>
            </div>
            <div>
                <div className="bg-white dark:bg-black rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
                            <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-5 h-5 inline-flex"></span>
                        </div>
                    ) : error ? (
                        <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
                            <span className="text-red-500">Error loading data</span>
                        </div>
                    ) : (
                        <ReactApexChart
                            series={dailySales.series}
                            options={dailySales.options}
                            type="bar"
                            height={160}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MissionLeaderStats;
