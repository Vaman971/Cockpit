import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify'
import api from "../../../../axios";

const ProjectUpdate = ({ isOpen, onClose, projectId }) => {

  const [formData, setFormData] = useState({});
  const [projData, setProjData] = useState({});
  const [date, setDate] = useState('');

  

  const handleSubmit = async (e) => {

    e.preventDefault();
    try {
      const res = await api.put(
        `/project/update/${projectId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );
      const data = res.data;

      if (data.success === false) {
        console.log(data.message);
        return;
      } else {
        toast.success('Project Updated!!')
        onClose();
      }

    } catch (error) {
      console.log(error.message);
    }
  };

  const formatDate = (dateString) => {
    if (dateString === null) {
      return 'yyyy-mm-dd'
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 to month as it is zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatProjectId = (id) => {
    if (id === "-") {
      return "-";
    }
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `PRJ-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };


  const handleChange = (e) => {
    if (e.target.id === 'created_on') {
      setDate(formatDate(e.target.value));
    }
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  useEffect(() => {
    api
      .get(`/project/getProj/${projectId}`, { withCredentials: true })
      .then((response) => {
        // console.log(response.data);
        setProjData(response.data);
        setFormData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [projectId]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-auto bg-gray-400 bg-opacity-50">
          <form onSubmit={handleSubmit}>
            <div className="relative bg-white rounded-lg p-8 w-96">
              <h2 id="project-modal-title" className="text-xl font-bold mb-4">
                Enter Project Details {`(${formatProjectId(projectId)})`}
              </h2>
              <label htmlFor="project_title" className="block mb-2">Project Title</label>
              <input
                id="project_title"
                type="text"
                value={formData.project_title || ''}
                placeholder={projData?.project_title || ''}
                onChange={handleChange}
                className="mb-4 p-2 border border-gray-300 rounded-md w-full"
              />
              <label htmlFor="created_on" className="block mb-2">Created On</label>
              <input
                id="created_on"
                type="date"
                pattern="\d{4}-\d{2}-\d{2}"
                value={date || formatDate(projData.created_on)}
                onChange={handleChange}
                className="mb-4 p-2 border border-gray-300 rounded-md w-full"
              />
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

export default ProjectUpdate;
