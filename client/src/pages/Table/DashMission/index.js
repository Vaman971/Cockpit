import React, { useState, useEffect } from "react";
import { Spinner } from "flowbite-react";
import api from "../../../axios";

const DashMission = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);

  const formatMissionId = (id) => {
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `MC-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  const handleMissionClick = (id) => {             
    console.log(id);
    window.open(`/mission-details/${id}`, '_blank');
  };
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/mission/getLatestMission`, {
          withCredentials: true,
        });
        const data = res.data;

        if (data.success === false) {
          setError(true);
          console.log(data.message);
        } else {
          setData(data);
        }
      } catch (error) {
        setError(true);
        // console.log(error.message);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return (<>
      <Spinner />
      <p>An Error occured, Please Reload the Application</p>
    </>)
  } else {
    return (
      <div className="relative rounded-md bg-white p-5 shadow-lg dark:bg-black w-full ">
        <div className="flex items-center justify-between mb-5 bg-blue-500 rounded-lg p-1 w-40">
          <h5 className="font-bold text-xl pl-2 text-white dark:text-white-light">
            Latest Mission
          </h5>
        </div>
        <div className="table-responsive mb-5">
          <table>
            <thead>
              <tr>
                <th>Mission Card Id</th>
                <th>Mission Execution Lead </th>
                <th>Mission Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter((item) => item.active === true)
                .map((data) => {
                  return (
                    <tr key={data.id}>
                      <th
                        scope="row"
                        className="flex items-center justify-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white text-center"
                      >
                        <div className="ps-3 ">
                          <div className="text-base font-semibold flex justify-center align-center">
                          <button>
                            <span
                              className={`badge ${data.status === "Yet to Start"
                                  ? "badge-outline-warning"
                                  : data.status === "In Progress"
                                    ? "badge-outline-success"
                                    : data.status === "Closed"
                                      ? "badge-outline-danger"
                                      : "badge-outline-info" // Default class if status doesn't match previous conditions
                                } text-center`}
                                onClick={() => handleMissionClick(data.id)}   
                            >
                              {formatMissionId(data.id)}
                            </span>
                            </button>
                          </div>
                        </div>
                      </th>
                      <td>
                        <div className="whitespace-nowrap text-center">
                          {data?.assignedMissionCards?.username || "NA"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-center">{data?.missionCards?.project_title || "NA"}</td>
                      <td className="whitespace-nowrap text-center">
                        <span
                          className={`badge ${data.status === "Yet to Start"
                              ? "badge-outline-warning"
                              : data.status === "In Progress"
                                ? "badge-outline-success"
                                : data.status === "Closed"
                                  ? "badge-outline-danger"
                                  : "badge-outline-info" // Default class if status doesn't match previous conditions
                            } text-center`}
                        >
                          {data.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
};
export default DashMission;
