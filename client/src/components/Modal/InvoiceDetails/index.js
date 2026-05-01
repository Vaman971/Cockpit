import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../../axios";
import React, { useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import InvoiceModal from "../InvoiceModal";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Modal } from "flowbite-react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { useCallback } from "react";
import CloseIcon from '@mui/icons-material/Close';
 
const InvoiceDetails = ({ isOpen, onClose, poId, handlePurchaseDetails }) => {
  const [data, setData] = useState([]);
  const [purchaseOrderData, setPurchaseOrderData] = useState([]);
  const [isInvoiceModelOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceIdToDelete, setInvoiceIdToDelete] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [updatedMonth, setUpdatedMonth] = useState("");
  const [updatedForecast, setUpdatedForecast] = useState("");
  const [updatedInvoice, setUpdatedInvoice] = useState("");
  const [initialMonthValue, setInitialMonthValue] = useState(null);
  const [initialforecastInvoice, setinitialforecastInvoice] = useState(null);
  const [initialInvoicedAmount, setinitialInvoicedAmount] = useState(null);
 
  
 
  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(
        `/invoice/getInvoiceByPoId/${poId}`,
        { withCredentials: true }
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
  }, [poId]);

  const fetchPurchaseOrderData = useCallback(async () => {
    try {
      const res = await api.get(
        `/po/getAll`,
        { withCredentials: true }
      );
      const responseData = res.data;
      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        setPurchaseOrderData(responseData);
      }
    } catch (error) {
      console.log(error.message);
    }

  }, []);
 
  useEffect(() => {
    fetchData();
    fetchPurchaseOrderData();
  }, [fetchData, fetchPurchaseOrderData, isInvoiceModelOpen, showModal, updatedMonth, updatedInvoice, updatedForecast]);

  const getPoEndDate = (poId) => {
    const purchaseOrder = purchaseOrderData.find((po) => po.id === poId);
    return purchaseOrder ? purchaseOrder.projectPo.missionEndDate : null;
  };

  const getPoAmount = (poId) => {
    const purchaseOrder = purchaseOrderData.find((po) => po.id === poId);
    return purchaseOrder ? purchaseOrder.poAmount : null;
  }
 
  const handleInvoiceModal = async () => {
    try {
      const newInvoice = {
          invoiceDate: '',
          invoiceAmount: 0,
          forecastAmount: 0,
        };
      // Call API to create the invoice with the updated values
      const res = await api.post(
        `/invoice/createInvoiceByPoId/${poId}`,
        newInvoice,
        { withCredentials: true }
      );
      // Handle the response from the API
      if (res.status != 200) {
        toast.error("Error Creating Invoice!!");
        return;
      } else {
        toast.success("Invoice created successfully!!");
        fetchData();
      }

    } catch (error) {
      console.error("Error creating invoice:", error.message);
      toast.error("All Fields are Required!!");
    }
  };
 
  const handleDeleteInvoice = async () => {
    try {
      const res = await api.delete(
        `/invoice/deleteInvoiceById/${invoiceIdToDelete}`,
        { withCredentials: true }
      );
 
      const data = res.data;
      if (data.success === false) {
        toast.error(`Failed to delete the Invoice.`);
      } else {
        setData((prevData) => prevData.filter((invoice) => invoice.id !== invoiceIdToDelete));
        toast.success("Invoice Deleted Successfully");
        setShowModal(false);
      }
    } catch (error) {
      toast.error(`Failed to delete the Invoice.`);
    }
  };
 
  const handleDelete = (id) => {
    setShowModal(true);
    setInvoiceIdToDelete(id);
  };
  
const handleBack = (e)=>{
  e.preventDefault();                                             
  onClose();
  handlePurchaseDetails(poId);
};
 
  const handleEditField = (invoiceId, field, value) => {
    setEditingInvoiceId(invoiceId);
    setEditingField(field);
 
 
    if (field === 'month') {
      setInitialMonthValue(value)
      setUpdatedMonth(value);
    }
    else if (field === 'forecast') {
      setinitialforecastInvoice(value)
      setUpdatedForecast(value);
    }
    else if (field === 'invoice') {
      setinitialInvoicedAmount(value)
      setUpdatedInvoice(value);
    }
  };
 
  const handleSaveField = async () => {
    let updatedData = {};
    let shouldUpdate = false; // Track if we should update
 
    if (editingField === 'month' && updatedMonth !== initialMonthValue) {
      updatedData.invoiceDate = updatedMonth;
      shouldUpdate = true;
    } else if (editingField === 'forecast' && updatedForecast !== initialforecastInvoice) {
      updatedData.forecastAmount = updatedForecast;
      shouldUpdate = true;
    } else if (editingField === 'invoice' && updatedInvoice !== initialInvoicedAmount) {
      updatedData.invoiceAmount = updatedInvoice;
      shouldUpdate = true;
    }
 
    if (shouldUpdate) {
      try {
        const response = await api.put(
          `/invoice/updateInvoice/${editingInvoiceId}`,
          updatedData,
          { withCredentials: true }
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
              <div className="bg-gradient-to-r from-blue-800 to-blue-500 flex p-4 cursor-pointer justify-between items-center">
                <ArrowBackIcon
                  className="pr-2 pb-2"
                  style={{
                    fontSize: "35px",
                    color: "#ffffff",
                  }}
                  onClick={handleBack}   
                />
                <h2 className="text-xl font-bold text-white whitespace-nowrap mx-16">
                  Delivery Note
                </h2>
                <CloseIcon                                              
                  className="pl-1 pb-2"
                  style={{
                    fontSize: "35px",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                  onClick={onClose} 
                />
              </div>
 
              <div className="bg-white my-10 mx-5 text-center">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2">Delivery Month</th>
                      <th className="py-2">Forecasted Invoice</th>
                      <th className="py-2">Invoiced Amount</th>
                      {/* <th className="py-2">Edit</th> */}
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
                          {editingInvoiceId === value.id && editingField === 'forecast' ? (
                            <input
                              type="text"
                              value={updatedForecast}
                              onChange={(e) => setUpdatedForecast(e.target.value)}
                              onBlur={handleSaveField}
                              onKeyDown={handleFieldKeyDown}
                              className="text-center border rounded-md p-1"
                              autoFocus
                            />
                          ) : (
                            <span onDoubleClick={() => handleEditField(value.id, 'forecast', value.forecastAmount)}>
                              {value.forecastAmount || '-'}
                            </span>
                          )}
                        </td>
 
                        {/* Invoiced Amount */}
                        <td className="py-2">
                          {editingInvoiceId === value.id && editingField === 'invoice' ? (
                            <input
                              type="text"
                              value={updatedInvoice}
                              onChange={(e) => setUpdatedInvoice(e.target.value)}
                              onBlur={handleSaveField}
                              onKeyDown={handleFieldKeyDown}
                              className="text-center border rounded-md p-1"
                              autoFocus
                            />
                          ) : (
                            <span onDoubleClick={() => handleEditField(value.id, 'invoice', value.invoiceAmount)}>
                              {value.invoiceAmount || '-'}
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
                      Add Delivery Note
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
            {isInvoiceModelOpen && (
              <InvoiceModal
                isOpen={isInvoiceModelOpen}
                handleClose={() => setIsInvoiceModalOpen(false)}
                poId={poId}
              />
            )}
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
 
export default InvoiceDetails;