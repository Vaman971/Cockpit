import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const RevenueInvoiceUpdate = ({ isOpen, handleClose, invoiceId}) => {
  const [formData, setFormData] = useState({});
  const [data, setData] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [status, setStatus] = useState('');
  const [plannedInvoice, setPlannedInvoice] = useState(0);
  const [actualInvoice, setActualInvoice] = useState(0);
  // const [forecastInvoice, setForecastInvoice] = useState(0);
  const apiUrl = process.env.REACT_APP_API_URL;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${apiUrl}/revenueInvoice/updateRevenueInvoice/${invoiceId}`,
        formData,
        {
          withCredentials: true,
        }
      );
      const data = res.data;
      if (data.success === false) {
        toast.error("Error updating Invoice!!")
        return;
      } else {
        toast.success("Invoice updated Successfully!!");
        handleClose();
      }
    } catch (error) {
      toast.error("All Fields are Required!!")
    }
  };

  const handleInvoiceDate = (e) => {
    setInvoiceDate(e.target.value);
    setFormData({ ...formData, invoiceDate: e.target.value });
  };

  const handlePlannedAmount = (e) => {
    setPlannedInvoice(e.target.value);
    setFormData({ ...formData, plannedRevenue: e.target.value });
  };

  const handleActualAmount = (e) => {
    setActualInvoice(e.target.value);
    setFormData({ ...formData, actualRevenue: e.target.value });
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setFormData({ ...formData, status: e.target.value });
  };

  // const handleForecastAmount = (e) => {
  //   setForecastInvoice(e.target.value);
  //   setFormData({ ...formData, forecastRevenue: e.target.value });
  // };

  useEffect(() => {
    // Fetch invoice data by ID and populate form fields
    // Example:
    axios.get(`${apiUrl}/revenueInvoice/getRevenueInvoice/${invoiceId}`,{withCredentials: true})
      .then((response) => {
        const data = response.data;
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching invoice:", error);
      });
  }, [isOpen,invoiceId,apiUrl]);


  return (
    <>
    {isOpen && (
      <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <form onSubmit={handleSubmit} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-8 max-w-xs w-full">
            <h2 className="text-xl font-medium mb-4">Update Projections</h2>
            <div className="mb-4">
              <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700">projection Date</label>
              <input
                type="date"
                id="invoiceDate"
                value={invoiceDate || data.invoiceDate}
                onChange={handleInvoiceDate}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="plannedAmount" className="block text-sm font-medium text-gray-700">Projected Revenue</label>
              <input
                type="number"
                id="plannedAmount"
                placeholder={plannedInvoice || data.plannedRevenue}
                onChange={handlePlannedAmount}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="actualAmount" className="block text-sm font-medium text-gray-700">Actual Amount (Delivery)</label>
              <input
                type="number"
                id="actualAmount"
                placeholder={actualInvoice || data.actualRevenue}
                onChange={handleActualAmount}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              />
            </div>
              <div className="mb-4">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-600"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={status || data?.status}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value={undefined}>Select Status</option>
                  <option value="auto">auto</option>
                  <option value="manual">manual</option>
                </select>
              </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md mr-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Submit</button>
              <button type="button" onClick={handleClose} className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
  );
};

export default RevenueInvoiceUpdate;
