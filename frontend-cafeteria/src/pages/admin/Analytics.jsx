const Analytics = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-12 min-h-[500px]">
        <div className="bg-purple-50 p-6 rounded-full mb-6">
          <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
        <p className="text-lg text-gray-500 max-w-lg mb-8">
          Get ready for deep insights into your cafeteria's performance with detailed charts, revenue tracking, and user behavior analysis.
        </p>
        <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-purple-700 bg-purple-100">
          📊 Coming Soon
        </div>
      </div>
    </div>
  );
};

export default Analytics;