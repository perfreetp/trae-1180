import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Stalls from '@/pages/Stalls';
import Contracts from '@/pages/Contracts';
import Merchants from '@/pages/Merchants';
import Purchases from '@/pages/Purchases';
import Complaints from '@/pages/Complaints';
import Inspections from '@/pages/Inspections';
import Dashboard from '@/pages/Dashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/stalls" replace />} />
          <Route path="stalls" element={<Stalls />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="merchants" element={<Merchants />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="inspections" element={<Inspections />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
