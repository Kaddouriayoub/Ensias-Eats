import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import walletService from '../../services/walletService';
import wellnessService from '../../services/wellnessService';
import { Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './theme.css'; 

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wellnessData, setWellnessData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    fetchWellnessData();
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchWellnessData();
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedDate]);
  
  const fetchWellnessData = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const data = await wellnessService.getWellnessData(dateStr);
      setWellnessData(data);
    } catch (error) {
      console.error('Error fetching wellness data:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [dashResponse, walletResponse] = await Promise.all([
        userService.getDashboard(),
        walletService.getBalance(),
      ]);
      if (dashResponse.success) setDashboardData(dashResponse.data);
      if (walletResponse.success) setWalletBalance(walletResponse.data.balance);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );
  }

  const nutritionalGoals = {
    'High Energy': { calories: 2500, proteins: 120, carbs: 300 },
    'Balanced': { calories: 2000, proteins: 80, carbs: 250 },
    'Light Focused': { calories: 1500, proteins: 60, carbs: 150 },
    'None': { calories: 2000, proteins: 80, carbs: 250 },
  };

  const userGoal = wellnessData?.nutritionalGoal || 'Balanced';
  const goals = nutritionalGoals[userGoal];
  const todayCalories = wellnessData?.dailyCalories || 0;
  const todayProteins = wellnessData?.dailyProteins || 0;
  const todayCarbs = wellnessData?.dailyCarbs || 0;

  const nutritionCharts = {
    calories: {
      data: {
        labels: ['Consommé', 'Restant'],
        datasets: [{
          data: [todayCalories, Math.max(0, goals.calories - todayCalories)],
          backgroundColor: ['#E50914', 'rgba(255,255,255,0.1)'],
          borderWidth: 0,
        }],
      },
      color: 'text-red-500',
      unit: 'kcal',
      goal: goals.calories,
      current: todayCalories,
      remaining: Math.max(0, goals.calories - todayCalories),
    },
    proteins: {
      data: {
        labels: ['Consommé', 'Restant'],
        datasets: [{
          data: [todayProteins, Math.max(0, goals.proteins - todayProteins)],
          backgroundColor: ['#3B82F6', 'rgba(255,255,255,0.1)'],
          borderWidth: 0,
        }],
      },
      color: 'text-blue-500',
      unit: 'g',
      goal: goals.proteins,
      current: todayProteins,
      remaining: Math.max(0, goals.proteins - todayProteins),
    },
    carbs: {
      data: {
        labels: ['Consommé', 'Restant'],
        datasets: [{
          data: [todayCarbs, Math.max(0, goals.carbs - todayCarbs)],
          backgroundColor: ['#F59E0B', 'rgba(255,255,255,0.1)'],
          borderWidth: 0,
        }],
      },
      color: 'text-yellow-500',
      unit: 'g',
      goal: goals.carbs,
      current: todayCarbs,
      remaining: Math.max(0, goals.carbs - todayCarbs),
    },
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };

  const budgetPercentage = user?.monthlyBudgetCap
    ? ((user?.currentMonthSpent || 0) / user.monthlyBudgetCap) * 100
    : 0;
  const progressBarColor = (percentage) => {
    if (percentage > 90) return 'bg-red-600';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  const nutritionProgress = (current, goal) => (current / goal) * 100;

  return (
    // ICI : J'ai enlevé le style background color pour laisser voir l'image du Layout
    <div className="pb-20 fade-in">
      
      {/* WELCOME BANNER (Transparent background) */}
      <div className="relative overflow-hidden border-b border-white/10 mb-8 bg-black/20 backdrop-blur-sm rounded-xl mt-4 mx-4">
        <div className="px-6 py-10 relative z-10">
          <div className="flex justify-between items-center">
             <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 shadow-black drop-shadow-lg">
                  Bonjour, <span className="text-red-600">{user?.name?.split(' ')[0]}</span>
                </h1>
                <p className="text-gray-200 font-medium">Prêt à manger sainement aujourd'hui ?</p>
             </div>
             <div className="hidden md:block text-right">
                <p className="text-sm text-gray-300 uppercase tracking-wider font-bold">Solde Actuel</p>
                <p className="text-3xl font-bold text-white drop-shadow-lg">{walletBalance} DH</p>
             </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-8">
        
        {/* QUICK STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Porte-monnaie', value: `${walletBalance} DH`, link: '/wallet' },
            { label: 'Commandes', value: wellnessData?.ordersCompletedToday || dashboardData?.todayOrdersCount || 0, link: '/orders' },
            { label: 'Calories', value: `${todayCalories} kcal`, link: null },
            { label: 'Dépenses Mois', value: `${wellnessData?.monthlyStats?.totalSpent || user?.currentMonthSpent || 0} DH`, link: null }
          ].map((stat, idx) => (
             stat.link ? (
                <Link key={idx} to={stat.link} className="block group">
                    <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-red-600/50 transition-all hover:bg-[#1a1a1a]/90">
                        <div className="mb-2">
                            <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">{stat.label}</span>
                        </div>
                        <p className={`text-2xl font-bold text-white`}>{stat.value}</p>
                    </div>
                </Link>
             ) : (
                <div key={idx} className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-xl p-5">
                    <div className="mb-2">
                        <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">{stat.label}</span>
                    </div>
                    <p className={`text-2xl font-bold text-white`}>{stat.value}</p>
                </div>
             )
          ))}
        </div>

        {/* NUTRITION CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(nutritionCharts).map(([key, chart]) => (
            <div key={key} className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-white font-bold capitalize">
                    {key}
                 </h3>
                 <span className={`text-sm font-bold ${chart.color}`}>{chart.current} / {chart.goal}</span>
              </div>
              
              <div className="h-40 relative z-10">
                <Doughnut data={chart.data} options={chartOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className={`text-2xl font-bold ${chart.color}`}>
                        {Math.round((chart.current / chart.goal) * 100)}%
                    </span>
                </div>
              </div>

              <div className="mt-6">
                 <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${key === 'calories' ? 'bg-red-600' : key === 'proteins' ? 'bg-blue-500' : 'bg-yellow-500'}`}
                        style={{ width: `${Math.min(nutritionProgress(chart.current, chart.goal), 100)}%` }}
                    ></div>
                 </div>
                 <p className="text-center text-xs text-gray-400 mt-2">
                    {chart.remaining} {chart.unit} restants
                 </p>
              </div>
            </div>
          ))}
        </div>

        {/* BUDGET */}
        {user?.monthlyBudgetCap > 0 && (
            <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">
                    Budget Mensuel
                </h2>
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Dépensé</p>
                            <p className="text-3xl font-bold text-white">{user.currentMonthSpent} <span className="text-base text-gray-500 font-normal">DH</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-sm mb-1">Plafond</p>
                            <p className="text-xl font-bold text-gray-300">{user.monthlyBudgetCap} DH</p>
                        </div>
                    </div>
                    <div className="relative pt-1">
                        <div className="overflow-hidden h-4 text-xs flex rounded-full bg-white/10">
                            <div
                                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${progressBarColor(budgetPercentage)} transition-all duration-500`}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;