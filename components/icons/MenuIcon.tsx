
import React from 'react';
import { IconBase } from './IconBase';

export const MenuIcon: React.FC<{className?: string}> = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </IconBase>
);
