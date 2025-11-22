import React, { useState, useMemo, useCallback, Suspense } from 'react';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { processDashboardData } from '../../utils/dataProcessors';
import DashboardSkeleton from './DashboardSkeleton';
import WidgetGrid from './WidgetGrid';
import RealTimeUpdates from './RealTimeUpdates';

const EnhancedUserDashboard = React.memo(({ user, preferences, initialData }) => {
  const [dashboardData, setDashboardData] = useState(initialData || {});
  const [loading, setLoading] = useState(!initialData);
  const [uiStates, setUiStates] = useState({
    error: null,
    lastUpdate: null
  });

  // بهینه‌سازی پردازش داده‌ها
  const processedData = useMemo(() => 
    processDashboardData(dashboardData, preferences), 
    [dashboardData, preferences]
  );

  // بهینه‌سازی توابع callback
  const handleDataUpdate = useCallback((newData) => {
    setDashboardData(prev => ({
      ...prev,
      ...newData,
      lastUpdated: Date.now()
    }));
    setUiStates(prev => ({ ...prev, error: null }));
  }, []);

  const handleError = useCallback((error) => {
    setUiStates(prev => ({
      ...prev,
      error: error.message
    }));
  }, []);

  // لودینگ اولیه
  if (loading && !Object.keys(dashboardData).length) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary onError={handleError}>
      <Suspense fallback={<DashboardSkeleton />}>
        <div className="enhanced-dashboard" data-user-id={user.id}>
          <header className="dashboard-header">
            <h1>داشبورد کاربری - {user.name}</h1>
            <div className="dashboard-actions">
              <button 
                className="refresh-btn"
                onClick={() => setLoading(true)}
                aria-label="بروزرسانی داده‌ها"
              >
                🔄
              </button>
            </div>
          </header>

          {uiStates.error && (
            <div className="error-banner" role="alert">
              {uiStates.error}
            </div>
          )}

          <main className="dashboard-content">
            <WidgetGrid 
              data={processedData}
              onWidgetAction={handleDataUpdate}
            />
            
            <RealTimeUpdates 
              userId={user.id}
              onUpdate={handleDataUpdate}
              onError={handleError}
            />
          </main>

          <footer className="dashboard-footer">
            <small>
              آخرین بروزرسانی: {new Date(uiStates.lastUpdate || Date.now()).toLocaleString('fa-IR')}
            </small>
          </footer>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
});

EnhancedUserDashboard.displayName = 'EnhancedUserDashboard';

export default EnhancedUserDashboard;
