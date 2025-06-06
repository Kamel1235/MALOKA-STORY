
import React from 'react';
import { IconBase } from './IconBase';

// Simplified Earring Icon
export const EarringIcon: React.FC<{className?: string}> = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a5.25 5.25 0 015.25 5.25c0 4.063-5.25 9.75-5.25 9.75S6.75 16.063 6.75 12A5.25 5.25 0 0112 6.75zm0 0V4.5m0 2.25a2.25 2.25 0 00-2.25 2.25" />
  </IconBase>
);
