import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function MissionTimeline() {
    const [missionData, setMissionData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [missionsPerPage, setMissionsPerPage] = useState(15);
    const apiUrl = process.env.REACT_APP_API_URL;
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // start loading
            setError(null); // reset any previous errors
            try {
                const res = await axios.get(`${apiUrl}/mission/getAll`, { withCredentials: true });
                const data = res.data;
                if (data.success === false) {
                    setError(data.message || "Failed to fetch data");
                } else {
                    // Filter missions with start and end dates
                    setMissionData(data.filter(mission => mission.missionStartDate && mission.missionEndDate));
                }
            } catch (error) {
                setError("Failed to fetch missions: " + error.message);
            } finally {
                setLoading(false); // stop loading
            }
        }
        fetchData();
    }, [apiUrl]);

   
    const formatMissionData = () => {
        const getColorByIndex = (index) => {
            const hue = (index * 127.508 + 260) % 360;
            return `hsl(${hue}, 70%, 40%)`;
        };

        const startIndex = (currentPage - 1) * missionsPerPage;
        const endIndex = startIndex + missionsPerPage;

        return {
            series: [
                {
                    data: missionData
                        .slice(startIndex, endIndex)
                        .map((mission, index) => ({
                            x: mission.airbusId || 'N/A',
                            y: [
                                new Date(mission.missionStartDate).getTime(),
                                new Date(mission.missionEndDate).getTime()
                            ],
                            fillColor: getColorByIndex(index + startIndex)
                        }))
                }
            ],
            options: {
                chart: {
                    height: 500,
                    type: 'rangeBar',
                    animations: {
                        enabled: true,
                        easing: 'easeinout',
                        speed: 800,
                    },
                    toolbar: {
                        show: true,
                        tools: {
                            download: true,
                            selection: true,
                            zoom: true,
                            zoomin: true,
                            zoomout: true,
                            pan: true,
                            reset: true,
                        },
                    },
                    events: {
                        dataPointSelection: (event, chartContext, { dataPointIndex }) => {
                            // Calculate the absolute index based on the current page
                            const absoluteIndex = (currentPage - 1) * missionsPerPage + dataPointIndex;
                    
                            // Find the correct mission from the full missionData array
                            const selectedMission = missionData[absoluteIndex];
                            
                            if (selectedMission && selectedMission.id) {
                                // Temporarily disable animations and tooltips for the click event
                                setTimeout(() => {
                                    chartContext.updateOptions({
                                        tooltip: { enabled: false },
                                        chart: { animations: { enabled: false } }
                                    });
                                    
                                    // Redirect after a short delay to prevent errors
                                    setTimeout(() => {
                                        navigate(`/mission-details/${selectedMission.id}`);
                                    }, 100);
                                }, 0);
                            }
                        }
                    }
                                   
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        distributed: true,
                        dataLabels: {
                            hideOverflowingLabels: true
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    formatter: (val, opts) => {
                        // console.log(val)
                        const a = moment(val[0]);
                        const b = moment(val[1]);
                        const diff = b.diff(a, 'days');
                        return `${opts.w.globals.labels[opts.dataPointIndex]}: ${diff} ${diff > 1 ? 'days' : 'day'}`;
                    },
                    style: {
                        colors: ['#000'],
                        fontSize: '10px',
                        fontWeight: 'bold'
                    },
                    background: {
                        enabled: true,
                        foreColor: '#fff',
                        padding: 4,
                        borderRadius: 2,
                        dropShadow: {
                            enabled: true,
                            top: 1,
                            left: 1,
                            blur: 1,
                            color: '#000',
                            opacity: 0.45
                        }
                    },
                },
                xaxis: {
                    type: 'datetime',
                    labels: {
                        datetimeUTC: false,
                        format: 'MMM dd, yyyy',  // Include the year (yyyy) here
                    },
                    tooltip: {
                        enabled: true,
                        formatter: (val) => moment(val).format('MMM DD, YYYY')  // Include year in tooltip as well
                    }
                },
                yaxis: {
                    show: true,
                    labels: {
                        style: {
                            fontSize: '12px',
                            fontWeight: 600,
                            colors: '#6B7280'
                        }
                    }
                },
                grid: {
                    borderColor: '#e7e7e7',
                    row: {
                        colors: ['#f3f4f5', '#fff'],
                        opacity: 0.7
                    }
                },
                annotations: {
                    xaxis: [
                        {
                            x: new Date().getTime(),
                            strokeDashArray: 4,
                            borderColor: '#FF4560',
                            label: {
                                text: 'Today',
                                borderColor: '#FF4560',
                                style: {
                                    color: '#fff',
                                    background: '#FF4560'
                                }
                            }
                        }
                    ]
                },
                          
            }
        };
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const totalPages = Math.ceil(missionData.length / missionsPerPage);

    return (
        <div className="mx-auto shadow-md bg-gray-300">
            <div className="text-2xl font-bold m-4 pt-2 text-blue-800">Mission Timeline</div>
            {loading ? (
                <div className="m-4 text-gray-600">Loading...</div>
            ) : error ? (
                <div className="m-4 text-red-600">Error: {error}</div>
            ) : (
                <div>
                    <div id="chart" className="m-4">
                        <ReactApexChart 
                            options={formatMissionData().options} 
                            series={formatMissionData().series} 
                            type="rangeBar" 
                            height={600} 
                        />
                    </div>
                    <div className="flex justify-end mx-8 gap-4 pb-4">
                        <button 
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:cursor-not-allowed disabled:opacity-30" 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <button 
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:cursor-not-allowed disabled:opacity-30" 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
