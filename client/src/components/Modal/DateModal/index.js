import { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from "axios";
import React, { useEffect } from "react";
import { Link } from 'react-router-dom';

const DataModal = ({ isOpen, onClose, opportunityId }) => {
  // const [user, setUser] = useState([]);
  const [data, setData] = useState({});
  // console.log(data.LastContactDate)
  const apiUrl = process.env.REACT_APP_API_URL;

  // console.log(data);
  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${apiUrl}/oppurtunities/getOpp/${opportunityId}`, { withCredentials: true });
      const responseData = res.data;

      if (responseData.success === false) {
        console.log(responseData.message)
      }
      else {
        setData(responseData);
      }

    }
    catch (error) {
      console.log(error.message);
    }
  };

  // const fetchUserOptions = async () => {
  //   try {
  //     const res = await axios.get(`${apiUrl}/users/getusers`, { withCredentials: true });
  //     setUser(res.data);
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //   }
  // };

  const formatOpportunityId = (id) => {
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `OPP-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 to month as it is zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  return (
    <>
      {isOpen && (
        <>
         <div className={`overlay ${isOpen ? "active" : ""}`}></div>
        <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center w-full h-full" onClick={onClose}>
          <div className="max-w-lg mx-auto rounded-lg shadow-lg overflow-hidden bg-white" onClick={((e)=> e.stopPropagation())}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-500 flex p-4" >
              <Link to="/opportunities" className="pr-2 pb-2">
                <ArrowBackIcon
                  className="pr-2 pb-2"
                  style={{
                    fontSize: '35px',
                    color: '#ffffff',
                  }}
                  onClick={onClose}
                />
              </Link>
              <h2 className="text-xl font-bold text-white whitespace-nowrap mx-16">{`Opportunity Details (${formatOpportunityId(opportunityId)})`} </h2>
            </div>


            <div className="bg-white my-10 text-center flex justify-center items-center pl-[20px]">
              <div className='font-bold text-gray-500 text-base mx-auto'>
                <div className='mb-3 text-nowrap'> Associated Work Package</div>
                <div className='mb-3 text-nowrap'> Cluster</div>
                {/* <div className='mb-3'>Customer Contact Point</div> */}
                <div className='mb-3'>Source</div>
                <div className='mb-2'>Program</div>
                <div className='mb-2'>Priority</div>
                <div className='mb-2'>Confidence</div>
                <div className='mb-3'>First Contact Date</div>
                <div className='mb-3'>Updation Date</div>
                <div className='mb-2'>Opportunity Site</div>
                <div className='mb-2'>Supported By</div>
                <div className='mb-3'>Expected Value</div>
                <div>Expected Team Value</div>
              </div>
              {data &&
                (
                  <div className=' font-extrabold text-sm mx-auto' key={data.id}>
                    <div className={`badge whitespace-nowrap mx-5 mb-3 badge-outline-primary`}>{data.AssociatedWP}</div>
                    <div className={`badge whitespace-nowrap mx-5 mb-3 badge-outline-primary`}>{data.cluster || '-'}</div>
                    {/* <div className={`badge whitespace-nowrap mx-5 mb-3 badge-outline-primary`}>{data.CustomerContactPoint}</div> */}
                    <div className={`badge whitespace-nowrap mx-5 mb-3 badge-outline-primary`}>{data.source}</div>
                    <div className={`badge whitespace-nowrap mx-5 mb-3 badge-outline-primary`}>{data.Program || "-"}</div>
                    <div className={`badge whitespace-nowrap mx-5 mb-3 badge-outline-primary`}>{data.Priority}</div>
                    <div className={`badge whitespace-nowrap mx-5 mb-3 badge-outline-primary`}>{data.Confidence}</div>
                    <div className={`badge whitespace-nowrap mx-5 mb-3 badge-outline-primary`}>{formatDate(data.FirstContactDate)}</div> {/* Format date */}
                    <div className={`badge whitespace-nowrap mx-5 mb-3 badge-outline-primary`}>{formatDate(data.updatedAt)}</div> 
                    <div className={`badge whitespace-nowrap mx-5 mb-3 badge-outline-primary`}>{data.OpUnit}</div> {/* Correct typo */}
                    <div className={`badge whitespace-nowrap mx-5 mb-3 badge-outline-primary`}>{data.supportedByUser?.username || "-"}</div>
                    <div className={`badge whitespace-nowrap mx-5 mb-3 badge-outline-primary`}>{data.ExpectedDealSize}</div>
                    <div className={`badge whitespace-nowrap mx-5  badge-outline-primary`}>{data.ExpectedTeamSize || "-"}</div>
                  </div>
                )}

            </div>
          </div>
        </div>
      </>
      )}
    </>
  );

};

export default DataModal;