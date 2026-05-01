import React, { useState } from 'react';
import FlightIcon from '@mui/icons-material/Flight';
import { IconButton } from '@mui/material';
import api from "../../../axios";
import { ToastContainer , toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const UserModal = ({ isOpen, closeModal }) => {
  
  const [formData, setFormData] = useState({});
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        `/users/createUser`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials:true
        }
      );
      const data = res.data;

      if (data.success === false) {
        console.log(data.message);
        toast.warning("User creation failed");
        return;

      } else {
        toast.success("User successfully created");
        closeModal();
      }
    } catch (error) {
      console.log(error.message);
      toast.error("User creation failed");
    }
  };

  return (
    <>
    {isOpen && (
      
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50"> 
    <ToastContainer />
      <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded-md shadow-md">
         <h5 className='text-blue-800 font-bold text-2xl'>Add User</h5>
        <form onSubmit={handleSubmit} className= "mt-5">
          <div className="mb-4">
              <label htmlFor="userName" className="block text-sm font-medium text-gray-400">
                User Name
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="mt-1 p-2 w-full border rounded-md"
                required
              />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-400">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 p-2 w-full border rounded-md"
              required
            />
          </div> 
          <div className="mb-4">
            <label htmlFor="user_type" className="block text-sm font-medium text-gray-400">
              User Type
            </label>
            <select
              id="user_type"
              name="userType"
              onChange={(e) =>
                setFormData({ ...formData, user_type: e.target.value })
              }
              className="mt-1 p-2 w-full border rounded-md"
              required
            >
              <option value="">Select Authority</option>
              <option value="Admin">Admin</option>
              <option value="Leader">Leader</option>
              <option value="Reader">Reader</option>
            </select>
          </div> 
          <div className="mb-4 ml-12 flex justify-between mt-6">
            <button type="submit" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-blue-800 text-base font-medium text-white hover:bg-gray-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Submit
              </button>
            <button onClick = {closeModal} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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

export default UserModal;
