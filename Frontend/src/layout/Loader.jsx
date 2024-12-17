import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Loading Circle */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>

      {/* Loading Message */}
      <p className="mt-4 text-lg font-semibold text-gray-700">{message}</p>
    </div>
  );
};

export default Loader;
