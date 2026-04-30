import React, { useState, useEffect } from "react";
import EditNoteIcon from "@mui/icons-material/EditNote";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import api from "../../../axios";
import Select from "react-select";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import ExtensionModal from "../../../components/Modal/ExtensionModal";
import ExtensionUpdate from "../../../components/Modal/Update/ExtensionUpdate";
import ProjectionDetails from "../../../components/Modal/ProjectionDetailsModal";

const ExtensionTable = () => {
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isProjectionDetailsOpen, setIsProjectionDetailsOpen] = useState(false);
    const [data, setData] = useState([]);
    const [extensionModal, setExtensionModal] = useState(false);
    const [extensionId, setExtensionId] = useState(null);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const { currentUser } = useSelector((state) => state.user);
    const [currentItems, setCurrentItem] = useState([]);
    const [selectedClusters, setSelectedClusters] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState([]);
    const [selectedLikeliness, setSelectedLikeliness] = useState([]);
    const [query, setQuery] = useState("");
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setpageCount] = useState(0);
    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 20;

    const statusOptions = [{ value: true, label: "Pending PO" }, { value: false, label: "PO Received" }];
    const Clusters = ["MEBM", "MNT", "SNPS", "RDI", "JSO", "Other"];
    const LikelinessOptions = ["High", "Medium", "Low"];
    const regionOptions = [
        { value: "FR", label: "France" },
        { value: "DE", label: "Germany" },
        { value: "UK", label: "United Kingdom" },
        { value: "IN", label: "India" },
        { value: "ES", label: "Spain" },
        { value: "NA", label: "Other" },
    ];

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            border: "2px solid gray",
            borderRadius: "0.375rem",
            padding: "0.25rem",
            boxShadow: state.isFocused ? "0 0 0 3px rgba(29, 78, 216, 0.3)" : "none",
            "&:hover": { borderColor: "#1D4ED8" },
            backgroundColor: "transparent",
        }),
        input: (provided) => ({
            ...provided,
            color: "#1D4ED8",
            "& input": { boxShadow: "none", caretColor: "#1D4ED8", outline: "none" },
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: "#DBEAFE",
            color: "#1D4ED8",
            fontWeight: "bold",
            borderRadius: "0.25rem",
        }),
        multiValueLabel: (provided) => ({ ...provided, color: "#1D4ED8" }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: "#1D4ED8",
            "&:hover": { backgroundColor: "#BFDBFE", color: "#1D4ED8" },
        }),
        placeholder: (provided) => ({ ...provided, color: "#9CA3AF", fontWeight: "bold" }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? "#1D4ED8" : "#9CA3AF",
            "&:hover": { color: "#1D4ED8" },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: "#9CA3AF",
            "&:hover": { color: "#1D4ED8" },
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "0.375rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 9999,
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "#DBEAFE" : "#FFFFFF",
            color: "#1D4ED8",
            "&:hover": { backgroundColor: "#DBEAFE" },
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    };

    useEffect(() => {
        const endOffset = itemOffset + itemsPerPage;
        setCurrentItem(data.slice(itemOffset, endOffset));
        setpageCount(Math.ceil(data.length / itemsPerPage));
    }, [itemOffset, itemsPerPage, data]);

    const handlePageClick = (e) => {
        const newOffset = e.selected * itemsPerPage;
        setItemOffset(newOffset);
        setCurrentPage(e.selected);
    };

    function getCurrencySymbol(currencyCode) {
        const currencySymbols = { EUR: "€", INR: "₹", USD: "$", RON: "L", GBP: "£" };
        return currencySymbols[currencyCode] || "";
    }

    const handleExportCSV = () => {
        const csv = Papa.unparse(data, { header: true });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "extensions.csv");
    };

    useEffect(() => {
        api.get("/users/getusers")
            .then((response) => {
                const filteredUsers = response.data.filter(
                    (u) => u.user_type === "Admin" || u.user_type === "Leader"
                );
                setUser(filteredUsers);
            })
            .catch(() => {}); // handled by interceptor
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get("/extension/getExtensions");
            let filteredData = res.data;

            if (query) {
                filteredData = filteredData.filter((item) =>
                    item.description && item.description.toLowerCase().includes(query.toLowerCase())
                );
            }
            if (selectedLeads.length > 0) {
                const selectedLeadIds = selectedLeads.map((lead) => parseInt(lead.value));
                filteredData = filteredData.filter((item) =>
                    selectedLeadIds.includes(item.projectLeader)
                );
            }
            if (selectedStatuses.length > 0) {
                const selectedStatusValues = selectedStatuses.map((status) => status.value);
                filteredData = filteredData.filter((item) =>
                    selectedStatusValues.includes(item.status)
                );
            }
            if (selectedClusters.length > 0) {
                filteredData = filteredData.filter((item) =>
                    selectedClusters.includes(item.cluster)
                );
            }
            if (selectedRegion.length > 0) {
                filteredData = filteredData.filter((item) =>
                    selectedRegion.map((r) => r.value).includes(item.region)
                );
            }
            if (selectedLikeliness.length > 0) {
                filteredData = filteredData.filter((item) =>
                    selectedLikeliness.map((l) => l.value).includes(item.likeliness)
                );
            }

            setData(filteredData);
        } catch {
            // handled by global interceptor
        }
    };

    const calculateMissionDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return "Not Specified";
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffMonths =
            (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        return diffMonths;
    };

    useEffect(() => {
        fetchData();
    }, [ // eslint-disable-line react-hooks/exhaustive-deps
        isActionModalOpen, currentPage, query,
        selectedLeads, selectedStatuses, selectedClusters,
        selectedRegion, selectedLikeliness, isProjectionDetailsOpen,
    ]);

    const toggleActionModal = (id) => {
        setExtensionId(id);
        setIsActionModalOpen(!isActionModalOpen);
    };

    const handleExtensionModal = () => {
        fetchData();
        setExtensionModal(false);
    };

    const handleRegionChange = (selectedOptions) => setSelectedRegion(selectedOptions);
    const handleLikelinessChange = (selectedOptions) => setSelectedLikeliness(selectedOptions);

    const handleInvoiceDetails = (id) => {
        setExtensionId(id);
        setIsProjectionDetailsOpen(true);
    };

    const handleInvoiceClose = () => setIsProjectionDetailsOpen(false);

    const leadOptions = user
        ? user.map((lead) => ({ value: lead.user_id, label: lead.username }))
        : [];

    const statusOptionsSelect = statusOptions.map((status) => ({
        value: status.value,
        label: status.label,
    }));

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center w-full">
                <p className="text-3xl font-bold text-blue-800 mb-4">Extensions</p>
                {(currentUser.user.user_type === "Leader" ||
                    currentUser.user.user_type === "Admin") && (
                    <div>
                        <button
                            id="addExtensionButton"
                            className="inline-flex items-center text-white bg-blue-800 border border-gray-300 focus:outline-none hover:bg-blue-700 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 ml-8"
                            type="button"
                            onClick={() => setExtensionModal(true)}
                        >
                            Add Extension
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center text-white bg-green-500 border border-gray-300 focus:outline-none mx-1 hover:bg-green-700 focus:ring-4 focus:ring-green-100 font-medium rounded-lg text-sm px-3 py-1.5"
                        >
                            Export as CSV
                        </button>
                    </div>
                )}
            </div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white">
                <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 mx-5 bg-white dark:bg-gray-900">
                    <div className="relative h-fit">
                        <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none justify-center">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            id="table-search-extensions"
                            className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for Proj Desc..."
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Select id="selectedLead" isMulti options={leadOptions} value={selectedLeads} onChange={(selected) => setSelectedLeads(selected)} className="w-full text-md focus:outline-none text-blue-800 font-bold" styles={customStyles} menuPortalTarget={document.body} menuPosition="fixed" placeholder="Mission Lead..." />
                    </div>
                    <div className="flex items-center gap-4">
                        <Select id="selectedStatus" isMulti options={statusOptionsSelect} value={selectedStatuses} onChange={(selected) => setSelectedStatuses(selected)} className="w-full text-md focus:outline-none text-blue-800 font-bold" styles={customStyles} menuPortalTarget={document.body} menuPosition="fixed" placeholder="Status..." />
                    </div>
                    <div className="flex items-center gap-4">
                        <Select id="cluster" name="cluster" isMulti value={selectedClusters.map((c) => ({ value: c, label: c }))} onChange={(selected) => setSelectedClusters(selected ? selected.map((o) => o.value) : [])} options={Clusters.map((c) => ({ value: c, label: c }))} className="w-full text-md focus:outline-none text-blue-800 font-bold" styles={customStyles} menuPortalTarget={document.body} menuPosition="fixed" placeholder="Cluster..." />
                    </div>
                    <div className="flex items-center gap-4">
                        <Select id="selectedRegion" value={selectedRegion} onChange={handleRegionChange} options={regionOptions} isMulti styles={customStyles} menuPortalTarget={document.body} menuPosition="fixed" placeholder="Region..." />
                    </div>
                    <div className="flex items-center gap-4">
                        <Select id="selectedLikeliness" value={selectedLikeliness} onChange={handleLikelinessChange} options={LikelinessOptions.map((l) => ({ value: l, label: l }))} isMulti styles={customStyles} menuPortalTarget={document.body} menuPosition="fixed" placeholder="Likeliness..." />
                    </div>
                </div>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white max-h-[60vh]">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-[2]">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-center">Project Description</th>
                                <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">Mission Leader</th>
                                <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">Start Date</th>
                                <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">End Date</th>
                                <th scope="col" className="px-6 py-3 text-center">Duration</th>
                                <th scope="col" className="px-6 py-3 text-center">Revenue Projection</th>
                                <th scope="col" className="px-6 py-3 text-center">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Cluster</th>
                                <th scope="col" className="px-6 py-3 text-center">Siglum</th>
                                <th scope="col" className="px-6 py-3 text-center">Likeliness</th>
                                {(currentUser.user.user_type === "Leader" || currentUser.user.user_type === "Admin") && (
                                    <th scope="col" className="px-6 py-3 text-center">View Projections</th>
                                )}
                                {(currentUser.user.user_type === "Leader" || currentUser.user.user_type === "Admin") && (
                                    <th scope="col" className="px-6 py-3 text-center">Action</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems && currentItems.map((item) => (
                                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 text-center">
                                    <td className="px-6 py-4">{item.description || item?.projectExtention?.project_title || "NA"}</td>
                                    <td className="px-6 py-4">{item?.assignedProjectLeader?.username || item?.assignedExtensionLeader?.username || ""}</td>
                                    <td className="px-6 py-4">{item.extentionStartDate}</td>
                                    <td className="px-6 py-4">{item.extentionEndDate || "Not specified"}</td>
                                    <td className="px-6 py-4">{calculateMissionDuration(item.extentionStartDate, item.extentionEndDate) + " Months" || "Not specified"}</td>
                                    <td className="px-6 py-4">{item.revenueProjection || "NA"} {getCurrencySymbol(item.currencyCode)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.status ? "Pending PO" : "PO Received"}</td>
                                    <td className="px-6 py-4">{item.cluster || "Not specified"}</td>
                                    <td className="px-6 py-4">{item.siglum || "-"}</td>
                                    <td className="text-sm text-gray-500 whitespace-nowrap text-center rounded-xl flex justify-center items-center">
                                        <span className={`badge border ${item.likeliness === "High" ? "badge bg-success/20 text-success rounded-full" : item.likeliness === "Medium" ? "badge bg-warning/20 text-warning rounded-full" : "badge bg-danger/20 text-danger rounded-full"}`}>
                                            {item.likeliness}
                                        </span>
                                    </td>
                                    {(currentUser.user.user_type === "Leader" || currentUser.user.user_type === "Admin") && (
                                        <td>
                                            <button className="text-blue-600 hover:underline" onClick={() => handleInvoiceDetails(item.id)}>
                                                <VisibilityIcon />
                                            </button>
                                        </td>
                                    )}
                                    {(currentUser.user.user_type === "Leader" || currentUser.user.user_type === "Admin") && (
                                        <td>
                                            <button className="text-blue-600 hover:underline" onClick={() => toggleActionModal(item.id)}>
                                                <EditNoteIcon />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {currentItems && (
                <div className="mt-4 flex justify-between items-center gap-8">
                    <span className="text-gray-600 text-sm">
                        Showing {itemOffset + 1} to {Math.min(itemOffset + itemsPerPage, data.length)} of {data.length} items
                    </span>
                    <ReactPaginate
                        previousLabel={"←"}
                        nextLabel={"→"}
                        breakLabel={"..."}
                        pageCount={pageCount}
                        onPageChange={handlePageClick}
                        containerClassName={"pagination"}
                        previousLinkClassName={"pagination__link"}
                        nextLinkClassName={"pagination__link"}
                        disabledClassName={"pagination__link--disabled"}
                        activeClassName={"pagination__link--active"}
                    />
                </div>
            )}

            {isActionModalOpen && (
                <ExtensionUpdate
                    isOpen={isActionModalOpen}
                    onClose={() => setIsActionModalOpen(false)}
                    extensionId={extensionId}
                />
            )}

            {extensionModal && (
                <ExtensionModal isOpen={extensionModal} onClose={handleExtensionModal} />
            )}

            {isProjectionDetailsOpen && (
                <ProjectionDetails
                    extensionId={extensionId}
                    isOpen={isProjectionDetailsOpen}
                    onClose={handleInvoiceClose}
                />
            )}
        </div>
    );
};

export default ExtensionTable;
