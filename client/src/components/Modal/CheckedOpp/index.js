import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const CheckedOpp = ({ isOpen, onClose, opportunityId }) => {
  const [formData, setFormData] = useState({});
  const [missionStartDate, setMissionStartDate] = useState("");
  const [missionEndDate, setMissionEndDate] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [data, setData] = useState({});
  const apiUrl = process.env.REACT_APP_API_URL;

  const currencyOptions = [
    { label: "India", value: "INR" },
    { label: "Europe", value: "EUR" },
    { label: "USA", value: "USD" },
    { label: "UK", value: "GBP" },
    { label: "Germany", value: "EUR" }, // Same as Europe, skipped Germany
    { label: "Spain", value: "EUR" },   // Same as Europe, skipped Spain
    { label: "Romania", value: "RON" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(formData.Priority);
    try {
      const res = await axios.put(
        `${apiUrl}/oppurtunities/update/${opportunityId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = res.data;
      // console.log(formData)
      if (data.success === false) {
        console.log(data.message);
        return;
      } else {
        toast.success("Opportunity Selected!!");
        onClose();
      } 
      // console.log(formData)
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${apiUrl}/oppurtunities/getOpp/${opportunityId}`, { withCredentials: true });
      const responseData = res.data;

      if (responseData.success === false) {
        console.log(responseData.message)
      }
      else {
        setData(responseData);
        setFormData(responseData);
      }
    }
    catch (error) {
      console.log(error.message);
      console.log(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  const formatDate = (dateString) => {
    if (dateString === null) {
      return "yyyy-MM-dd";
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 to month as it is zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };


  const handleStartDateChange = (e) => {
    setMissionStartDate (formatDate(e.target.value));
    setFormData({ ...formData, MissionStartDate: e.target.value });
  };

  const handleEndDateChange = (e) => {
    setMissionEndDate (formatDate(e.target.value));
    setFormData({ ...formData, MissionEndDate: e.target.value });
  };

  const handleCurrencyCodeChange = (e) => {
    setCurrencyCode(e.target.value);
    setFormData({ ...formData, currencyCode: e.target.value });
  };


  return (
    <>
      {" "}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-300 bg-opacity-50 overflow-auto" onClick={onClose}>
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-xs w-full mt-72 ml-72" onClick={((e) => e.stopPropagation())}>
            <form onSubmit={handleSubmit}>
              <div className="relative">
                  <div className="flex flex-col">
                    <label
                      htmlFor="ExpectedDealSize"
                      className="block  text-sm font-medium text-gray-600"
                    >
                      Estimated Purchase Order Amount
                    </label>
                    <input
                      type="number"
                      id="ExpectedDealSize"
                      value={formData.ExpectedDealSize || ""}
                      onChange={(e) => setFormData({ ...formData, ExpectedDealSize: e.target.value })}
                      className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="currencyCode"
                      className="block  text-sm font-medium text-gray-600"
                    >
                      Currency
                    </label>
                    <select
                    id="currencyCode"
                    value={currencyCode || formData?.currencyCode}
                    onChange={handleCurrencyCodeChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Currency</option>
                    {currencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.value})
                      </option>
                    ))}
                  </select>
                  </div>
                

                  <div className="flex flex-col">
                    <label
                      htmlFor="MissionStartDate"
                      className="block text-sm font-medium text-gray-600"
                    >
                      Asso. Mission Start Date
                    </label>
                    <input
                      type="date"
                      id="MissionStartDate"
                      value={missionStartDate || formatDate(data.MissionStartDate)}
                      onChange={handleStartDateChange}
                      className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="MissionEndDate"
                      className="block text-sm font-medium text-gray-600"
                    >
                      Asso. Mission End Date
                    </label>
                    <input
                      type="date"
                      id="MissionEndDate"
                      required 
                      value={missionEndDate || formatDate(data.MissionEndDate)}
                      onChange={handleEndDateChange}
                      className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                


                <div className="flex mt-5">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-1 px-2 rounded-md mr-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-300 text-gray-700 py-1 px-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckedOpp;