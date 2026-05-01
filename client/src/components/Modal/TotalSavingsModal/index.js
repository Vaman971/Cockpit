import { useState, useEffect } from "react";
import { Modal, Button } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../../axios";
import SavingsModal from "../SavingsModal";
import SavingsUpdate from "../Update/SavingsUpdate";
import { toast } from "react-toastify";

const TotalSavings = ({ isOpen, onClose, revenueId }) => {
  const [data, setData] = useState([]);
  const [savingIdToDelete, setSavingIdToDelete] = useState("");
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState("");
  const [isSavingsUpdate, setIsSavingsUpdate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [savingsId, setIsSavingsId] = useState("");
  

  useEffect(() => {
    fetchData();
  }, [ savingsId, showModal,isSavingsModalOpen,isSavingsUpdate]);

  const fetchData = async () => {
    try {
      const res = await api.get (
        `/saving/getSavingsByRevenueId/${revenueId}`, 
         {withCredentials: true}
      );
      const responseData = res.data;
      if(responseData.success === false) {
        console.log(responseData.message);
      } else {
        setData(responseData);
      }
    }
    catch(error) {
       console.log(error.message);
    }
  };
   

  const handleEditSavings = (id) => {
    setIsSavingsId(id);
    setIsSavingsUpdate(true);
  }

  const handleDeleteSavings = async () => {
    try {
      const res = await api.delete(
        `/saving/deleteSavings/${savingIdToDelete}`,
        { withCredentials: true }
      );
      const data = res.data;
      if (data.success === false) {
        toast.error(`Failed to delete the Amount.`);
      } else {
        toast.success("Amount Saved Deleted Successfully");
        setShowModal(false);
      }
    } catch (error) {
      console.error(`Failed to delete the Saved Amount.`);
    }
  };
  
  const handleDelete = (id) => {
    setShowModal(true);
    setSavingIdToDelete(id);
  }

  const handleSavingsModal = () => {
      setIsSavingsModalOpen(true);
  }

  const handleCloseUpdate = () => {
    setIsSavingsUpdate(false);
  }

  const getMonthName = (exp) => {
    if (exp === "-") {
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
          <div className={`overlay ${isOpen ? "active" : ""}`} onClick={onClose}></div>
          <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center w-full h-full">
            <div className="max-w-6xl mx-auto rounded-lg shadow-lg overflow-hidden bg-white">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-500 flex p-4 cursor-pointer">
                <ArrowBackIcon
                  className="pr-2 pb-2"
                  style={{ fontSize: "35px", color: "#ffffff" }}
                  onClick={onClose}
                />
                <h2 className="text-xl font-bold text-white whitespace-nowrap mx-16">
                  Total Savings
                </h2>
              </div>

              <div className="bg-white my-10 mx-5 text-center flex flex-col justify-center items-center">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Edit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data &&
                      data.map((value) => (
                        <tr
                          key={value.id}
                          className={
                            value.status === "manual" ? "bg-blue-100" : ""
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getMonthName(value.savingDate || "-")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {value.savingAmount || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {value.remark || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                          <BorderColorIcon
                              className="cursor-pointer"
                              sx={{
                                fontSize: 24,
                                color: "#3f82f7",
                                backgroundColor: "#ffffff",
                                borderRadius: "50%",
                                padding: "4px",
                                transition:
                                  "background-color 0.3s ease, color 0.3s ease",
                                "&:hover": {
                                  backgroundColor: "#e0e0e0",
                                  color: "#1a5bb6",
                                },
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                 }}
                                 onClick = {() => handleEditSavings(value.id)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                          <button
                              disabled={value.status === "auto"}
                              className="disabled:cursor-not-allowed cursor-pointer"
                            >
                              <DeleteIcon
                                className="ml-4"
                                sx={{
                                  fontSize: 24,
                                  color: "red",
                                  backgroundColor: "#fff",
                                  borderRadius: "50%",
                                  padding: "4px",
                                  transition:
                                    "background-color 0.3s ease, color 0.3s ease",
                                  "&:hover": {
                                    backgroundColor: "#f5f5f5",
                                    color: "#ff0000",
                                  },
                                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                }}
                                onClick={() => {
                                  handleDelete(value.id);
                                }}
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="flex mt-5 w-full justify-around">
                  <div className="flex">
                    <div className="mb-3 font-bold text-gray-500 text-base text-nowrap">
                      Add Savings
                    </div>
                    <AddIcon
                      onClick={handleSavingsModal}
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
            {isSavingsModalOpen && (
        <SavingsModal
        isOpen={isSavingsModalOpen}
        onClose={()=>setIsSavingsModalOpen(false)}
        revenueId={revenueId}
        />
      )}
        {isSavingsUpdate && (
          <SavingsUpdate
          isOpen={isSavingsUpdate}
          onClose={handleCloseUpdate}
          savingsId={savingsId}/>
        )}
            <Modal
              show={showModal}
              onClose={() => {
                setShowModal(false);
              }}
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
                    <Button color="failure" onClick={handleDeleteSavings}>
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

export default TotalSavings;
