"use client";

import { useEffect } from 'react';
import { applyAdBlocker } from '@/app/Services/adBlockerService';

export default function AdBlockerProvider() {
  useEffect(() => {
    applyAdBlocker();
  }, []);

  return null;
}
