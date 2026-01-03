const Staff = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-12 min-h-[500px]">
        <div className="bg-blue-50 p-6 rounded-full mb-6">
          <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Staff Management</h1>
        <p className="text-lg text-gray-500 max-w-lg mb-8">
          We're building a comprehensive suite of tools to help you manage your cafeteria staff, schedules, and permissions more effectively.
        </p>
        <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-blue-700 bg-blue-100">
          🚧 Coming Soon
        </div>
      </div>
    </div>
  );
};

export default Staff;