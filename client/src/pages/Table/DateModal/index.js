import { Divider } from '@mui/material';
import { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const DataModal = ({isOpen,onClose}) => {



  return (
    <>
      

      {/* Modal */}
        <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center">
          <div className=" max-w-md mx-auto rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-500 flex p-4">
              <ArrowBackIcon className="pr-2 pb-2" style={{
                fontSize: "35px",
                color: "#ffffff",
              }}/>
              <h2 className="text-lg font-bold text-white">OPPORTUNITY DETAILS</h2>
            </div>

            {/* Content */}
            <div className="bg-white p-4">
              <form>
                {/* Priority */}
                <div className="mb-3">
                  <div className="block text-sm font-medium text-gray-500">Priority:</div>
                </div>
                <Divider/>

                {/* Confidence */}
                <div className="mb-3 mt-3">
                  <div className="block text-sm font-medium text-gray-500">Confidence:</div>
                </div>
                <Divider/>

                {/* First Contact Date */}
                <div className="mb-3 mt-3">
                  <div className="block text-sm font-medium text-gray-500">First Contact Date:</div>
                </div>
                <Divider/>

                {/* Last Contact Date */}
                <div className="mb-3 mt-3">
                  <div className="block text-sm font-medium text-gray-500">Last Contact Date:</div>
                </div>
                <Divider/>

                {/* Next Contact Date */}
                <div className="mb-3 mt-3">
                  <div className="block text-sm font-medium text-gray-500">Next Contact Date:</div>
                </div>

              </form>
            </div>
          </div>
        </div>
    </>
  );
};

export default DataModal;