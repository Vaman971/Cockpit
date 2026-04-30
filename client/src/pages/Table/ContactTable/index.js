import React, { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import api from "../../../axios";

const ContactTable = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/oppurtunities/getLatestOpp`, {
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

  const formatOpportunityId = (id) => {
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `OPP-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  const formatDate = (dateString) => {
    if (dateString === "-") {
      return "-";
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 to month as it is zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleOppIdClick = (id) => {
    window.open(`/opportunity-details/${id}`);
  }
 

  if (error) {
    return (<>
      <Spinner />
      <p>An Error occured, Please Reload the Application</p>
    </>)
  } else {
    return (
      <div className="relative rounded-md bg-white p-5 shadow-lg dark:bg-black w-full ">
        <div className="flex items-center justify-between mb-5 bg-blue-500 p-1 w-56 rounded-lg">
          <h5 className="font-bold text-xl pl-2 items-center text-white dark:text-white-light">
            Latest Opportunities
          </h5>
        </div>
        <div className="table-responsive mb-5">
          <table>
            <thead>
              <tr>
                <th>Opp Id</th>
                <th>Opp Description</th>
                <th>Opp Region</th>
                <th>Siglum</th>
                <th>Latest Contact Date</th>
                <th>Next Contact Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((data) => {
                return (
                  <tr key={data.id}>
                    <th
                      scope="row"
                      className="flex items-center justify-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white text-center"
                    >
                      <div className="ps-3">
                        <div className="text-base font-semibold flex justify-center align-center">
                        <button onClick={() => handleOppIdClick(data.id)}> 
                          <span
                            className={`badge  ${data.status === "Won"
                                ? "badge-outline-success"
                                : data.status === "Lost"
                                  ? "badge-outline-danger"
                                  : data.status === "Hold"
                                    ? "badge-outline-warning"
                                    : data.status === "Prospection"
                                      ? "badge-outline-primary"
                                      : data.status === "Advanced"
                                        ? "badge-outline-secondary"
                                        : data.status === "Proposal"
                                          ? "badge-outline-dark"
                                          : ""
                              }`}
                          >
                            {formatOpportunityId(data.id)}
                          </span>
                          </button>
                        </div>
                      </div>
                    </th>
                    <td className="max-w-[12rem] truncate">{data.OpDescription}</td>
                    <td>
                      <div className="whitespace-nowrap text-center">{data.OpRegion}</div>
                    </td>
                    <td>{data.siglum || "-"}</td>
                    <td className="text-center">
                      {formatDate(data.LatestContactDate || "-")}
                    </td>
                    <td className="text-center">
                      {formatDate(data.NextContactDate || "-")}
                    </td>
                    <td>
                      <span
                        className={`badge  border ${data.status === "Won"
                            ? "badge-outline-success"
                            : data.status === "Lost"
                              ? "badge-outline-danger"
                              : data.status === "Hold"
                                ? "badge-outline-warning"
                                : data.status === "Prospection"
                                  ? "badge-outline-primary"
                                  : data.status === "Advanced"
                                    ? "badge-outline-secondary"
                                    : data.status === "Proposal"
                                      ? "badge-outline-dark"
                                      : ""
                          }`}
                      >
                        {" "}
                        {data.status}{" "}
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
export default ContactTable;
