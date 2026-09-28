import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Toast from './components/Toast';
import DashboardPage from './pages/DashboardPage';
import TenantsPage from './pages/TenantsPage';
import RoomsPage from './pages/RoomsPage';
import RentPage from './pages/RentPage';
import PaymentsPage from './pages/PaymentsPage';
import ComplaintsPage from './pages/ComplaintsPage';

function App() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<><TopHeader title="Dashboard" /><DashboardPage addToast={addToast} /></>} />
            <Route path="/tenants" element={<><TopHeader title="Tenant Management" /><TenantsPage addToast={addToast} /></>} />
            <Route path="/rooms" element={<><TopHeader title="Room Management" /><RoomsPage addToast={addToast} /></>} />
            <Route path="/rent" element={<><TopHeader title="Rent & Dues" /><RentPage addToast={addToast} /></>} />
            <Route path="/payments" element={<><TopHeader title="Payment History" /><PaymentsPage addToast={addToast} /></>} />
            <Route path="/complaints" element={<><TopHeader title="Maintenance & Complaints" /><ComplaintsPage addToast={addToast} /></>} />
          </Routes>
        </div>
      </div>
      <Toast toasts={toasts} />
    </BrowserRouter>
  );
}

export default App;
