import React from 'react';
import { useDashboardFunction } from './dashboard.function';
import { DashboardDesign } from './dashboard.design';

/**
 * Operations Admin Dashboard Container.
 * Connects pure functional logic (dashboard.function.js) to pure visual presentation (dashboard.design.jsx).
 */
export default function Dashboard() {
  const stateAndData = useDashboardFunction();
  return <DashboardDesign {...stateAndData} />;
}
