import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 
const AddCustomer = ({ isOpen, closeModal }) => {
  const [formData, setFormData] = useState({});
  const apiUrl = process.env.REACT_APP_API_URL;
 
 const handleSubmit = async (e) => { //restAPI Calling
    e.preventDefault();
    try {
      const res = await axios.post(
        `${apiUrl}/customer/createCustomer`,
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
        console.log(data.message);
        toast.error("Failed to  Add the Customer!");
        return;
      } else {
        toast.success("Customer added!");
        closeModal();
      }
    } catch (error) {
      console.log(error.message);
    }
  };
 
 
  return (
   
     <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <ToastContainer />
          <div className="bg-white w-[600px] h-auto max-h-[80vh] rounded-md shadow-lg p-6 overflow-y-auto">
            <h2 className="text-blue-800 font-bold text-2xl text-center mb-6">Add Customer</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="customerFirstName"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Customer First Name
                </label>
                <input
                  type="text"
                  id="customerFirstName"
                  name="customerFirstName"
                  value={formData.first_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter first name"
                  autoComplete="off"
                />
              </div>
 
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="familyName"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Family Name
                </label>
                <input
                  type="text"
                  id="familyName"
                  name="familyName"
                  value={formData.last_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter family name"
                  autoComplete="off"
                />
              </div>
 
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="site"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Site
                </label>
                <input
                  type="text"
                  id="site"
                  name="site"
                  value={formData.site || ""}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter site"
                  autoComplete="off"
                />
              </div>
 
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="siglum"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Siglum
                </label>
                <input
                  type="text"
                  id="siglum"
                  name="siglum"
                  value={formData.siglum || ""}
                  onChange={(e) => setFormData({ ...formData, siglum: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter siglum"
                  autoComplete="off"
                />
              </div>
 
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="email"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter email"
                  autoComplete="off"
                />
              </div>
 
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="contact"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Contact No.
                </label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter contact number"
                  autoComplete="off"
                />
              </div>
               <div className="flex flex-col gap-1">
                <label
                  htmlFor="missionLeader"
                  className="text-base font-semibold text-blue-900 mb-1 tracking-wide"
                >
                  Point of Contact
                </label>
                <input
                  type="text"
                  id="missionLeader"
                  name="missionLeader"
                  value={formData.contactpoint}
                  onChange={(e) => setFormData({ ...formData, contactpoint: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                  placeholder="Enter mission leader"
                  autoComplete="off"
                />
              </div>
 
 
              <div className="col-span-2 flex justify-end gap-4 mt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-blue-800 text-base font-medium text-white hover:bg-gray-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
 
export default AddCustomer