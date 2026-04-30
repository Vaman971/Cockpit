import React, { useCallback, useState, useEffect, useMemo } from "react";
import ReactPaginate from "react-paginate";
import axios from "axios";
import ArticleIcon from '@mui/icons-material/Article';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SharePointModal from "../../components/Modal/SharePointModal";
import ViewDocLinkModal from "../../components/Modal/ViewDocLinkModal";
 
const SharePointPage = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [currentItems, setCurrentItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 9;
  const apiUrl = process.env.REACT_APP_API_URL;
  const [sharepointLink, setSharepointLink] = useState(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [missionId, setMissionId] = useState(null);
  const [isViewDocModalOpen, setIsViewDocModalOpen] = useState(false);
 
  // Fetch all mission data
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/mission/getAll`, {
        withCredentials: true,
      });
      const responseData = res.data;
 
      if (responseData.success === false) {
        console.log(responseData.message);
      } else {
        const activeMissions = responseData.filter(
          (item) => item.missionCards?.active === true
        );
        setData(activeMissions);
      }
    } catch (error) {
      console.log(error.message);
    }
  }, [apiUrl]);
 
  useEffect(() => {
    fetchData();
  }, [fetchData]);
 
  // Filter data based on query (Mission ID)
  const filteredData = useMemo(() => {
    if (!query) return data;
 
    return data.filter((item) => {
      const airbusId = item.airbusId?.toString().toLowerCase();
      return airbusId && airbusId.includes(query.toLowerCase());
    });
  }, [data, query]);
 
  // Handle pagination
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(filteredData.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(filteredData.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, filteredData]);
 
  useEffect(() => {
    setItemOffset(0);
    setCurrentPage(0);
  }, [query]);
 
  const handlePageClick = (e) => {
    const newOffset = e.selected * itemsPerPage;
    setItemOffset(newOffset);
    setCurrentPage(e.selected);
  };
 
  const handleArticleClick = (id) => {
    setMissionId(id);
    setIsViewDocModalOpen(true);
  };
 
  const toggleLinkModal = (id) => {
    setMissionId(id);
    setIsLinkModalOpen(!isLinkModalOpen);
  };
 
  useEffect(() => {
    const fetchSharepointLink = async () => {
      try {
        const res = await axios.get(`${apiUrl}/sharePoint/getSharepointLinkById/${missionId}`, {
          withCredentials: true,
        });
        setSharepointLink(res.data.link);
      } catch (error) {
        console.error("Error fetching SharePoint link:", error);
      }
    };
 
    if (missionId) {
      fetchSharepointLink();
    }
  }, [missionId, apiUrl]);
 
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center w-full">
        <p className="text-3xl font-bold text-blue-800 mb-4">Documents</p>
      </div>
 
      <div className="relative overflow-x-auto shadow-md sm:rounded-t-lg">
        <div className="flex items-center justify-between flex-wrap gap-8 p-4 bg-white dark:bg-gray-900">
          <label htmlFor="table-search" className="sr-only">Search</label>
          <div className="relative h-fit">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              id="table-search-users"
              className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Mission ID..."
            />
          </div>
        </div>
      </div>
 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {currentItems.map((item) => (
          <div key={item.id} className="bg-white shadow-md rounded-lg p-4 flex justify-between items-start relative">
            <div>
              <h3 className="text-lg font-semibold">
                {item.missionCards?.project_title || "Untitled Mission"}
              </h3>
              <p className="text-sm">Airbus ID: {item.airbusId || "N/A"}</p>
              <p className="text-sm">Status: {item.status || "Unknown"}</p>
            </div>
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-2">
              <span
                onClick={() => handleArticleClick(item.id)}
                className="cursor-pointer badge border bg-green-100 text-green-700 rounded-full px-3 py-1 text-sm flex items-center gap-1 hover:bg-green-200 transition-all"
              >
 
                View URL  <ArticleIcon fontSize="small" />
              </span>
              <span
                onClick={() => toggleLinkModal(item.id)}
                className="cursor-pointer badge border bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm hover:bg-blue-200 transition-all"
              >
                Add URL         <AttachFileIcon fontSize="small" />
              </span>
 
 
            </div>
          </div>
        ))}
      </div>
 
      {currentItems.length > 0 && (
        <div className="mt-4 flex justify-between items-center gap-8">
          <span className="text-gray-600 dark:text-gray-300 text-sm">
            Showing {itemOffset + 1} to{" "}
            {Math.min(itemOffset + itemsPerPage, filteredData.length)} of {filteredData.length} items
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
            forcePage={currentPage}
          />
        </div>
      )}
 
      <SharePointModal
        isOpen={isLinkModalOpen}
        handleClose={() => setIsLinkModalOpen(false)}
        missionId={missionId}
      />
      <ViewDocLinkModal
        isOpen={isViewDocModalOpen}
        handleClose={() => setIsViewDocModalOpen(false)}
        missionId={missionId}
      />
    </div>
  );
};
 
export default SharePointPage;