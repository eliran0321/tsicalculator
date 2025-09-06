'use client';
import { useEffect } from 'react';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { app } from '../../lib/firebase'; // ../.. → מ app/components ל src/lib

export default function AnalyticsClient() {
  useEffect(() => {
    isSupported().then((ok) => {
      if (ok) getAnalytics(app);
    });
  }, []);
  return null;
}
