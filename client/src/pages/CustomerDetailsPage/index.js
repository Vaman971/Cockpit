import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
 
const CustomerDetailsPage = () => {
  const [profileData, setProfileData] = useState([]);
  const [missionData, setMissionData] = useState([]);
  const [missions, setMissions] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const { id } = useParams();
  const navigate = useNavigate();
 
  const handleMissionClick = (missionId) => {
    navigate(`/mission-details/${missionId}`);
  };
 
  // Fetch customer profile data
    useEffect(() => {
        const fetchMissionData = async () => {
            try {
                const res = await axios.get(`${apiUrl}/customer/getMissionByCustomerId/${id}`, {
                    withCredentials: true,
                });
                const customerData = res.data;
                if (profileData.success === false) {
                    console.log(profileData.message);
                } else {
                    setProfileData(customerData.missions);
                    setMissionData(customerData.customer);
                }
            } catch (error) {
                console.error(error.message);
            }
        };
        fetchMissionData();
    }, [apiUrl, id]);


    useEffect(() => {
        const fetchLeaderName = async () => {
        const updatedList = [];
        for (const mission of profileData) {
            try {
                const res = await axios.get(`${apiUrl}/mission/getMission/${mission.id}`, {
                    withCredentials: true,
                });
                const leaderName = res?.data?.assignedMissionCards?.username;
                updatedList.push({ ...mission, leaderName });
                }
                catch (error) {
                console.log(error.message);
                }
            }
            setMissions(updatedList);
        };

        fetchLeaderName();
    }, [apiUrl, profileData]);

  return (
      <div className="pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5">
              {/*///for left side Profile Panel */}
              <div className="panel">
                  <div className="flex items-center justify-between mb-5">
                      <h5 className="font-semibold text-lg dark:text-white-light">Customer Profile</h5>
                  </div>
                  <div className="mb-5">
                      <div className="flex flex-col justify-center items-center">
                          <p className="font-semibold text-primary text-xl">
                              {missionData.first_name} {missionData.last_name}
                          </p>
                      </div>
                      <ul className="mt-5 flex flex-col max-w-[300px] m-auto space-y-4 font-semibold text-white-dark">
                          <li className="flex items-center gap-2">{missionData.site}</li>
                          <li>
                              <span className="flex items-center gap-2 text-[13px]">{missionData.email}</span>
                          </li>
                          <li className="flex items-center gap-2">
                              <span className="flex items-center gap-2 text-[13px]" dir="ltr">{missionData.phone}</span>
                          </li>
                      </ul>
                  </div>
              </div>

              {/* for the task - */}
              <div className="panel lg:col-span-2 xl:col-span-3">
                  <div className="mb-5">
                      <h5 className="font-semibold text-lg dark:text-white-light">Task</h5>
                  </div>
                  <div className="mb-5">
                      <div className="table-responsive text-[#515365] dark:text-white-light font-semibold">
                          <table className="whitespace-nowrap">
                              <thead>
                                  <tr>
                                      <th>Sr. No.</th>
                                      <th>Mission ID</th>
                                      <th>Mission Description</th>
                                      <th>Mission Leader</th>
                                      <th>Cluster</th>
                                      <th>Region</th>
                                  </tr>
                              </thead>
                              <tbody className="dark:text-white-dark">
                                  {missions.map((mission, index) => (
                                      <tr key={index}>
                                          <td><span className="text-center">{index + 1}</span></td>
                                          <td className="cursor-pointer text-center" onClick={() => handleMissionClick(mission.id)}>
                                              <span className="badge badge-outline-info">{mission.airbusId || "-"}</span>
                                          </td>
                                          <td><p className="text-center">{mission.missionDescription}</p></td>
                                          <td>
                                              <p className="text-center">
                                                  {mission.leaderName || "No leader assigned"}
                                              </p>
                                          </td>
                                          <td><p className="text-center">{mission.cluster}</p></td>
                                          <td><span className="badge-outline-info">{mission.region}</span></td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};
 
export default CustomerDetailsPage;