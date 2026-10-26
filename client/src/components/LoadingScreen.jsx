import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Pure Visual Design Component: Full screen loading indicator.
 */
export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  );
}
