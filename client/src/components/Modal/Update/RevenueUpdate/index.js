import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const RevenueUpdate = ({ isOpen, onClose, revenueId }) => {
  const [formData, setFormData] = useState({});
  const [data, setData] = useState({});
  const [extension, setExtension] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${apiUrl}/revenue/updateRevenue/${revenueId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = res.data;

      if (data.success === false) {
        toast.error("Failed to update purchase order");
        return;
      } else {
        toast.success("Revenue updated successfully");
        onClose();
      }
    } catch (error) {
      toast.error("Failed to update purchase order");
    }
  };

  const handleDescriptionChange = (e) => {
    setFormData({ ...formData, revenueDescription: e.target.value });
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, createdAt: e.target.value });
  };

  const handleExtensionChange = (e) => {
    setExtension(e.target.value);
    setFormData({ ...formData, extension: e.target.value });
  };

  useEffect(() => {
    axios
      .get(`${apiUrl}/revenue/getRevenue/${revenueId}`, {
        withCredentials: true,
      })
      .then((response) => {
        const data = response.data;
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching PO data:", error);
      });
  }, [revenueId]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-auto bg-gray-400 bg-opacity-50">
          <form onSubmit={handleSubmit} className="w-96">
            <div className="relative bg-white rounded-lg p-8 max-w-2xl w-full flex gap-2 flex-col">
              <h2 className="text-xl font-bold mb-4">Update Revenue Details</h2>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="poDescription"
                  className="block text-sm font-medium text-gray-600"
                >
                  Revenue Description
                </label>
                <input
                  type="text"
                  id="poDescription"
                  value={formData?.revenueDescription || ""}
                  placeholder={data?.revenueDescription || ""}
                  onChange={handleDescriptionChange}
                  className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="extension"
                    className="block  text-sm font-medium text-gray-600"
                  >
                    Extension
                  </label>
                  <select
                    id="extension"
                    label="Project Assigned"
                    value={extension || data?.extension}
                    onChange={handleExtensionChange}
                    className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value={undefined}>select Extension</option>
                    <option value={'extended'}>Extended</option>
                    <option value={'not extended'}>Not Extended</option>  
                  </select>
                </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="poDate"
                  className="block text-sm font-medium text-gray-600"
                >
                  Updating on
                </label>
                <input
                  type="date"
                  id="poDate"
                  value={formData?.createdAt || data.createdAt}
                  onChange={handleDateChange}
                  className="w-full mb-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded-md mr-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default RevenueUpdate;
