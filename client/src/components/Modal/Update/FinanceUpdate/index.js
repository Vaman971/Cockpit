import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../../axios";

const ExpenseUpdate = ({ isOpen, onClose, financeId }) => {
  const [formData, setFormData] = useState({});
  const [data, setData] = useState({});
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/expense/updateExpense/${financeId}`, formData, {
        withCredentials: true,
      });
      const data = res.data;
      if (data.success === false) {
        toast.error('Cannot update expense');
        return;
      } else {
        toast.success("Expense updated!");
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating expense');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // Fetch expense data by ID and populate form fields
    api.get(`/expense/getExpense/${financeId}`,{withCredentials: true})
      .then((response) => {
        const data = response.data;
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching expense:", error);
      });
  }, [isOpen, financeId]);

  return (
    <>
      {isOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <form onSubmit={handleSubmit} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-medium mb-4">Edit Expense</h2>
              <div className="mb-4">
                <label htmlFor="expenseDescription" className="block text-sm font-medium text-gray-700">Expense Description</label>
                <input
                  type="text"
                  id="expenseDescription"
                  name="expenseDescription"
                  placeholder={data?.expenseDescription || '-'}
                  value={formData.expenseDescription || ''}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="expenseType" className="block text-sm font-medium text-gray-700">Expense Type</label>
                <select
                  id="expenseType"
                  name="expenseType"
                  value={formData.expenseType || data.expenseType}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                >
                  <option value="Salary">Salary</option>
                  <option value="Trip">Trip</option>
                  <option value="IT">IT</option>
                  <option value="Service">Service</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="expenseAmount" className="block text-sm font-medium text-gray-700">Expense Amount</label>
                <input
                  type="number"
                  id="expenseAmount"
                  name="expenseAmount"
                  placeholder={data?.expenseAmount || ''}
                  value={formData.expenseAmount || ''}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="expenseStatus" className="block text-sm font-medium text-gray-700">Expense Status</label>
                <select
                  id="expenseStatus"
                  name="expenseStatus"
                  value={formData.expenseStatus || data.expenseStatus}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                >
                  <option value="Paid">Paid</option>
                  <option value="Invalid">Invalid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700">Expense Date</label>
                <input
                  type="date"
                  id="expenseDate"
                  name="expenseDate"
                  value={formData.expenseDate || data.expenseDate}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md mr-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Submit</button>
                <button type="button" onClick={onClose} className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseUpdate;
