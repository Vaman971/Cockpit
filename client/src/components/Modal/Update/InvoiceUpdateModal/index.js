import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../../axios";

const InvoiceUpdate = ({ isOpen, handleClose, invoiceId }) => {
  const [formData, setFormData] = useState({});
  const [data, setData] = useState({});
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [forecastAmount, setForecastAmount] = useState("");
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/invoice/updateInvoice/${invoiceId}`, formData, {
        withCredentials: true,
      });
      const data = res.data;
      if (data.success === false) {
        toast.error('Cannot update invoice');
        return;
      } else {
        toast.success("Invoice updated!");
        handleClose();
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating invoice');
    }
  };

  const handleInvoiceDate = (e) =>{
      setInvoiceDate(e.target.value);
      setFormData({...formData, invoiceDate: (e.target.value)})
  }

  const handleInvoiceAmount = (e) =>{
      setInvoiceAmount(e.target.value);
      setFormData({...formData, invoiceAmount: (e.target.value)})
  }

  const handleForecastAmount = (e) =>{
      setForecastAmount(e.target.value);
      setFormData({...formData, forecastAmount: (e.target.value)})
  }

  useEffect(() => {
    // Fetch invoice data by ID and populate form fields
    // Example:
    api.get(`/invoice/getInvoice/${invoiceId}`,{withCredentials: true})
      .then((response) => {
        const data = response.data;
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching invoice:", error);
      });
  }, [isOpen, invoiceId]);


  return (
    <>
    {isOpen && (
      <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <form onSubmit={handleSubmit} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-8 max-w-xs w-full">
            <h2 className="text-xl font-medium mb-4">Edit Delivery Note</h2>
            <div className="mb-4">
              <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700">Delivery Date</label>
              <input
                type="date"
                id="invoiceDate"
                value={invoiceDate || data.invoiceDate}
                onChange={handleInvoiceDate}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="forecastAmount" className="block text-sm font-medium text-gray-700">Forecasted Invoice</label>
              <input
                type="number"
                id="forecastAmount"
                placeholder={forecastAmount|| data.forecastAmount}
                onChange={handleForecastAmount}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="invoiceAmount" className="block text-sm font-medium text-gray-700">Invoiced Amount</label>
              <input
                type="number"
                id="invoiceAmount"
                placeholder={invoiceAmount || data.invoiceAmount}
                onChange={handleInvoiceAmount}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              />
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

export default InvoiceUpdate;
