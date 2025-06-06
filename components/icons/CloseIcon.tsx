
import React from 'react';
import { IconBase } from './IconBase';

export const CloseIcon: React.FC<{className?: string}> = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </IconBase>
);
