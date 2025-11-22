import React from 'react';

const DashboardSkeleton = ({ widgetCount = 4 }) => {
  return (
    <div className="dashboard-skeleton" aria-label="در حال بارگذاری داشبورد">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-actions">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
      
      <div className="skeleton-widgets">
        {Array.from({ length: widgetCount }, (_, index) => (
          <div key={index} className="skeleton-widget">
            <div className="skeleton-widget-header">
              <div className="skeleton-text short"></div>
              <div className="skeleton-icon"></div>
            </div>
            <div className="skeleton-widget-content">
              <div className="skeleton-chart"></div>
              <div className="skeleton-stats">
                <div className="skeleton-stat">
                  <div className="skeleton-text very-short"></div>
                  <div className="skeleton-text medium"></div>
                </div>
                <div className="skeleton-stat">
                  <div className="skeleton-text very-short"></div>
                  <div className="skeleton-text medium"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="skeleton-footer">
        <div className="skeleton-text long"></div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
