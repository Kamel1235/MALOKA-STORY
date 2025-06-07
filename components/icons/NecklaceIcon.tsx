
import React from 'react';
import { IconBase } from './IconBase';

// Simplified Necklace Icon
export const NecklaceIcon: React.FC<{className?: string}> = ({ className }) => (
  <IconBase className={className}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /> {/* Pendant */}
     <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 0112 0v2.25M9 3.75A6 6 0 0115 9" /> {/* Chain */}
  </IconBase>
);
