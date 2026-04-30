import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../../axios";
import React, { useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Modal } from "flowbite-react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { useCallback } from "react";
 
const ProjectionDetails = ({ isOpen, onClose, extensionId }) => {
  const [data, setData] = useState([]);
  const [invoiceIdToDelete, setInvoiceIdToDelete] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [updatedMonth, setUpdatedMonth] = useState("");
  const [updatedProjection, setUpdatedProjection] = useState("");
  const [updatedInvoice, setUpdatedInvoice] = useState("");
  const [initialMonthValue, setInitialMonthValue] = useState(null);
  const [initialprojectionInvoice, setinitialprojectionInvoice] = useState(null);
 
  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(
        `/extensionInvoice/getExtentionInvoicesByExtentionId/${extensionId}`
      );
      const responseData = res.data;
      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        setData(responseData);
      }
    } catch (error) {
      console.log(error.message);
    }
  }, [extensionId]);
 
  useEffect(() => {
    fetchData();
  }, [fetchData, showModal, updatedMonth, updatedInvoice, updatedProjection]);
 
  const handleInvoiceModal = async () => {
    try {
      const newInvoice = {
        invoiceDate: '',
        revenueProjection: 0,
      };
      const res = await api.post(
        `/extensionInvoice/createExtensionInvoice/${extensionId}`,
        newInvoice
      );
      const data = res.data;
      if (data.success === false) {
        console.log(data.message);
        toast.error("Error Creating Invoice!!")
        return;
      } else {
        fetchData();
        toast.success("Invoice created Successfully!!");
      }
    } catch (error) {
      toast.error(error.response.data.error)
    }
  };
 
  const handleDeleteInvoice = async () => {
    try {
      const res = await api.delete(
        `/extensionInvoice/deleteExtensionInvoice/${invoiceIdToDelete}`
      );
 
      const data = res.data;
      if (data.success === false) {
        toast.error(`Failed to delete the Invoice.`);
      } else {
        toast.success("Invoice Deleted Successfully");
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };
 
  const handleDelete = (id) => {
    setShowModal(true);
    setInvoiceIdToDelete(id);
  };
 
  const handleEditField = (invoiceId, field, value) => {
    setEditingInvoiceId(invoiceId);
    setEditingField(field);
 
 
    if (field === 'month') {
      setInitialMonthValue(value)
      setUpdatedMonth(value);
    }
    else if (field === 'projection') {
      setinitialprojectionInvoice(value)
      setUpdatedProjection(value);
    }
  };
 
  const handleSaveField = async () => {
    let updatedData = {};
    let shouldUpdate = false; // Track if we should update
 
    if (editingField === 'month' && updatedMonth !== initialMonthValue) {
      updatedData.invoiceDate = updatedMonth;
      shouldUpdate = true;
    } else if (editingField === 'projection' && updatedProjection !== initialprojectionInvoice) {
      updatedData.revenueProjection = updatedProjection;
      shouldUpdate = true;
    }
 
    if (shouldUpdate) {
      try {
        const response = await api.put(
          `/extensionInvoice/updateExtensionInvoice/${editingInvoiceId}`,
          updatedData
        );
 
        if (response.status === 200) {
          toast.success("Invoice updated successfully");
          setEditingInvoiceId(null);
          setEditingField(null);
          fetchData();
        } else {
          throw new Error(response.data.message || "Unknown error occurred");
        }
      } catch (error) {
        toast.error("Failed to update the invoice: " + error.message);
        console.error("Update Error:", error.response?.data || error.message);
      }
    } else {
      setEditingInvoiceId(null);
      setEditingField(null);
    }
  };
 
 
  const handleFieldKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveField();
    }
  };
 
  const getMonthName = (exp) => {
    if (exp === "-" || exp === null) {
      return "-";
    }
    let newExp = exp.split("-");
    let year = newExp[0];
    let monthNumber = parseInt(newExp[1]);
    const date = new Date(exp);
    date.setFullYear(year);
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("en-US", { month: "short" }) + " " + year;
  };
 
  return (
    <>
      {isOpen && (
        <>
          <div
            className={`overlay ${isOpen ? "active" : ""}`}
            onClick={onClose}
          ></div>
          <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center w-full h-full">
            <div className="max-w-6xl mx-auto rounded-lg shadow-lg overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-blue-800 to-blue-500 flex p-4 cursor-pointer">
                <ArrowBackIcon
                  className="pr-2 pb-2"
                  style={{
                    fontSize: "35px",
                    color: "#ffffff",
                  }}
                  onClick={onClose}
                />
                <h2 className="text-xl font-bold text-white whitespace-nowrap mx-16">
                  Projection Note
                </h2>
              </div>
 
              <div className="bg-white my-10 mx-5 text-center">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2">Projection Month</th>
                      <th className="py-2">Revenue Projection</th>
                      <th className="py-2">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((value) => (
                      <tr key={value.id} className="text-center">
                        {/* Delivery Month */}
 
                        <td className="py-2">
                          {editingInvoiceId === value.id && editingField === 'month' ? (
                            <ReactDatePicker
                              selected={new Date(updatedMonth)} // Set the selected date
                              onChange={(date) => setUpdatedMonth(date)} // Update the date on selection
                              onBlur={() => handleSaveField(value.id, "month", false)} // Save on blur
                              dateFormat="dd/MM/yyyy" // Date format like in the image
                              className="text-center border rounded-md p-1"// Custom input styling class
                              calendarClassName="custom-calendar" // Custom calendar styling class
                              autoFocus
                              showPopperArrow={false} // Disable popper arrow for a clean look
                            />
                          ) : (
                            <span onDoubleClick={() => handleEditField(value.id, 'month', new Date(value.invoiceDate))}>
                              {getMonthName(value.invoiceDate) || "-"}
                            </span>
                          )}
                        </td>
 
 
                        {/* Forecast Invoice */}
                        <td className="py-2">
                          {editingInvoiceId === value.id && editingField === 'projection' ? (
                            <input
                              type="text"
                              value={updatedProjection}
                              onChange={(e) => setUpdatedProjection(e.target.value)}
                              onBlur={handleSaveField}
                              onKeyDown={handleFieldKeyDown}
                              className="text-center border rounded-md p-1"
                              autoFocus
                            />
                          ) : (
                            <span onDoubleClick={() => handleEditField(value.id, 'projection', value.revenueProjection)}>
                              {value.revenueProjection || '-'}
                            </span>
                          )}
                        </td>
 
                        {/* Edit and Delete buttons remain the same */}
                        <td className="py-2">
                          <DeleteIcon
                            className="cursor-pointer"
                            sx={{
                              fontSize: 24,
                              color: "red",
                              backgroundColor: "#fff",
                              borderRadius: "50%",
                              padding: "4px",
                              "&:hover": { backgroundColor: "#f5f5f5", color: "#ff0000" },
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                            onClick={() => handleDelete(value.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
 
                </table>
 
                <div className="flex mt-5 w-full justify-around">
                  <div className="flex">
                    <div className="mb-3 font-bold text-gray-500 text-base text-nowrap">
                      Add Projection
                    </div>
                    <AddIcon
                      onClick={handleInvoiceModal}
                      className="ml-4 cursor-pointer"
                      sx={{
                        fontSize: 30,
                        color: "#ffffff",
                        backgroundColor: "#3f82f7",
                        borderRadius: "20%",
                        padding: "2px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Modal
              show={showModal}
              onClose={() => setShowModal(false)}
              popup
              size="md"
            >
              <Modal.Header />
              <Modal.Body>
                <div className="text-center">
                  <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-300 mb-4 mx-auto" />
                  <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete the Invoice?
                  </h3>
                  <div className="flex justify-center gap-4">
                    <Button color="failure" onClick={handleDeleteInvoice}>
                      Yes, I'm sure
                    </Button>
                    <Button color="gray" onClick={() => setShowModal(false)}>
                      No, cancel
                    </Button>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
          </div>
        </>
      )}
    </>
  );
};
 
export default ProjectionDetails;