import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
 
const SharePointModal = ({ isOpen, handleClose, missionId }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;
 
  // Fetch existing links when modal opens
  useEffect(() => {
    const fetchSharepointLinks = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/sharePoint/getSharepointLinkById/${missionId}`, {
          withCredentials: true,
        });
 
        const fetched = res.data.link;
        const normalized = Array.isArray(fetched)
          ? fetched
          : typeof fetched === "string"
          ? [fetched]
          : [];
 
        setLinks(normalized.length > 0 ? normalized : [""]);
      } catch (error) {
        console.error("Error fetching SharePoint links:", error);
        setLinks([""]);
      } finally {
        setLoading(false);
      }
    };
 
    if (isOpen && missionId) {
      fetchSharepointLinks();
    }
  }, [isOpen, missionId, apiUrl]);
 
  const handleLinkChange = (index, e) => {
    const updated = [...links];
    updated[index] = e.target.value;
    setLinks(updated);
  };
 
  const handleAddLink = () => {
    setLinks([...links, ""]);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validLinks = links.filter(link => link.trim() !== "");
 
    if (validLinks.length === 0) {
      toast.error("Please add at least one SharePoint link.");
      return;
    }
 
    try {
      const res = await axios.post(
        `${apiUrl}/sharePoint/assignLinkToMission/${missionId}`,
        { links: validLinks },
        { withCredentials: true }
      );
 
      if (res.data.success === false) {
        toast.error("Error saving SharePoint links!");
      } else {
        toast.success("Links assigned successfully!");
        handleClose();
      }
    } catch (error) {
      toast.error("Failed to assign links. Please try again.");
    }
  };
 
  return (
    <>
      {isOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-gray-500 opacity-75"></div>
 
            <div className="bg-white rounded-lg p-6 z-20 max-w-md w-full relative">
              <h2 className="text-xl font-semibold mb-4">SharePoint Links</h2>
 
              {loading ? (
                <p className="text-gray-600">Loading links...</p>
              ) : (
                <form onSubmit={handleSubmit}>
                  {links.map((link, index) => (
                    <div key={index} className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Link {index + 1}
                      </label>
                      <input
                        type="text"
                        value={link}
                        onChange={(e) => handleLinkChange(index, e)}
                        placeholder="Enter SharePoint link"
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  ))}
 
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="text-blue-600 hover:text-blue-800 text-sm mb-4"
                  >
                    + Add Another Link
                  </button>
 
                  <div className="flex justify-end space-x-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
 
export default SharePointModal;
 