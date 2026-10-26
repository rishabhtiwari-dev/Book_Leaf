import React from 'react';
import { useLayoutFunction } from './useLayout';
import { LayoutDesign } from './layout.design';

/**
 * Layout Container Component.
 * Connects pure functional logic (useLayout.js) to pure visual presentation (layout.design.jsx).
 */
export default function Layout({ children }) {
  const layoutState = useLayoutFunction();

  return (
    <LayoutDesign {...layoutState}>
      {children}
    </LayoutDesign>
  );
}
