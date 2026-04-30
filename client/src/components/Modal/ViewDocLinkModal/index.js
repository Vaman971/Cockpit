import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { HiOutlineExclamationCircle } from "react-icons/hi";
 
const ViewDocLinkModal = ({ isOpen, handleClose, missionId }) => {
  const [links, setLinks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedUrl, setEditedUrl] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;
 
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await axios.get(`${apiUrl}/sharePoint/getSharepointLinkById/${missionId}`, {
          withCredentials: true,
        });
 
        let fetchedLinks;
 
        if (Array.isArray(res.data)) {
          fetchedLinks = res.data;
        } else if (Array.isArray(res.data.link)) {
          fetchedLinks = res.data.link;
        } else if (typeof res.data.link === "string") {
          fetchedLinks = [{ url_link: res.data.link }];
        } else {
          fetchedLinks = [];
        }
 
        setLinks(fetchedLinks);
      } catch (err) {
        console.error("Error fetching links:", err);
        toast.error("Failed to load links.");
        setLinks([]);
      }
    };
 
    if (isOpen && missionId) {
      fetchLinks();
    }
  }, [isOpen, missionId, apiUrl]);
 
  const handleDeleteConfirmed = async () => {
    try {
      await axios.delete(`${apiUrl}/sharePoint/deleteSharepointLink/${confirmDeleteId}`, {
        withCredentials: true,
      });
 
      setLinks((prevLinks) => prevLinks.filter((link) => link.id !== confirmDeleteId));
      toast.success("Link deleted successfully.");
    } catch (err) {
      console.error("Error deleting link:", err);
      toast.error("Failed to delete link.");
    } finally {
      setConfirmDeleteId(null);
    }
  };
 
  const handleEdit = (id, currentUrl) => {
    setEditingId(id);
    setEditedUrl(currentUrl);
    setOriginalUrl(currentUrl);
  };
 
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
 
  const handleSave = async (id) => {
    if (!isValidUrl(editedUrl)) {
      toast.error("Please enter a valid URL.");
      return;
    }
 
    try {
      await axios.put(`${apiUrl}/sharePoint/updateSharepointLink/${id}`, {
        url_link: editedUrl,
      }, {
        withCredentials: true,
      });
 
      setLinks((prevLinks) =>
        prevLinks.map((link) =>
          link.id === id ? { ...link, url_link: editedUrl } : link
        )
      );
 
      toast.success("Link updated successfully.");
      setEditingId(null);
      setEditedUrl("");
      setOriginalUrl("");
    } catch (err) {
      console.error("Error updating link:", err);
      toast.error("Failed to update link.");
    }
  };
 
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">View Document Links</h2>
 
            {links.length === 0 ? (
              <p className="text-gray-500">No links available for this mission.</p>
            ) : (
              <ul className="space-y-4">
                {links.map((linkObj, index) => (
                  <li key={index} className="border-b pb-2 flex justify-between items-center">
                    {editingId === linkObj.id ? (
                      <>
                        <input
                          type="text"
                          value={editedUrl}
                          onChange={(e) => setEditedUrl(e.target.value)}
                          className="w-full text-sm border px-2 py-1 rounded"
                        />
                        <div className="flex items-center ml-2 space-x-2">
                          {editedUrl !== originalUrl && (
                            <button
                              onClick={() => handleSave(linkObj.id)}
                              className="text-blue-600 dark:text-blue-500 hover:underline"
                              title="Save link"
                            >
                              <SaveIcon />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditedUrl("");
                              setOriginalUrl("");
                            }}
                            className="text-gray-500 hover:text-gray-700"
                            title="Cancel edit"
                          >
                            <CancelIcon />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(linkObj.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete link"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <a
                          href={linkObj.url_link}
                          target="_blank"
                          className="text-blue-600 hover:underline break-all w-full"
                        >
                          {linkObj.url_link}
                        </a>
                        <div className="flex items-center ml-2 space-x-2">
                          <button
                            onClick={() => handleEdit(linkObj.id, linkObj.url_link)}
                            className="text-blue-600 dark:text-blue-500 hover:underline"
                            title="Edit link"
                          >
                            <EditNoteIcon />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(linkObj.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete link"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
 
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-300 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this link?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteConfirmed}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, I'm sure
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
 
export default ViewDocLinkModal;