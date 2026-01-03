const Reports = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-12 min-h-[500px]">
        <div className="bg-green-50 p-6 rounded-full mb-6">
          <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Reports Center</h1>
        <p className="text-lg text-gray-500 max-w-lg mb-8">
          Advanced reporting features are under development. Soon you'll be able to generate detailed financial and operational reports.
        </p>
        <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-green-700 bg-green-100">
          📋 Coming Soon
        </div>
      </div>
    </div>
  );
};

export default Reports;