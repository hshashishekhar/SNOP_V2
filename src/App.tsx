import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initDatabase } from '@/db/database';
import { ThemeProvider } from '@/components/custom/ThemeProvider';
import { Layout } from '@/components/custom/Layout';
import { Dashboard } from '@/sections/Dashboard';
import { Planning } from '@/sections/Planning';
import { CapacityGantt } from '@/sections/CapacityGantt';
import { DieManagement } from '@/sections/DieManagement';
import { DemandManagement } from '@/sections/DemandManagement';
import { Routes as RoutesPage } from '@/sections/Routes';
import { Inventory } from '@/sections/Inventory';
import { Scenarios } from '@/sections/Scenarios';
import { KPIs } from '@/sections/KPIs';
import { Settings } from '@/sections/Settings';
import { Spinner } from '@/components/ui/spinner';

function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setIsDbReady(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError('Failed to initialize database. Please refresh the page.');
      }
    };
    init();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">Error</div>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!isDbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
        <div className="text-center">
          <Spinner className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <p className="text-slate-400">Initializing SNOP System...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="snop-theme">
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/capacity-gantt" element={<CapacityGantt />} />
            <Route path="/dies" element={<DieManagement />} />
            <Route path="/demand" element={<DemandManagement />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/scenarios" element={<Scenarios />} />
            <Route path="/kpis" element={<KPIs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
