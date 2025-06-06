import React from 'react';
import { IconBase } from './IconBase';

export const PublishIcon: React.FC<{className?: string}> = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 01.528 11.097h-4.275a.75.75 0 00-.75.75V21a.75.75 0 00.75.75h7.5a.75.75 0 00.75-.75v-.813A5.75 5.75 0 0117.25 12H17" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5L12 9.75M12 9.75L15 12.75M12 9.75L9 12.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5C3.75 10.32 6.315 7.755 9.5 7.525c.5-.037 1.005-.037 1.505 0c3.185.23 5.75 2.795 5.75 5.975M15.75 13.5h.008v.008H15.75V13.5zm-3.75 0h.008v.008H12v-.008zm-3.75 0h.008v.008H8.25v-.008z" clipRule="evenodd" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 6.375c0-1.036.84-1.875 1.875-1.875h5.25c1.035 0 1.875.84 1.875 1.875v.375" />
  </IconBase>
);

// Alternative interpretation - cloud upload style
// export const PublishIcon: React.FC<{className?: string}> = ({ className }) => (
//   <IconBase className={className}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32A5.75 5.75 0 0119.5 19.5H6.75z" />
//   </IconBase>
// );

// Simpler Upload Arrow
// export const PublishIcon: React.FC<{className?: string}> = ({ className }) => (
//   <IconBase className={className}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M12 15V4.5m0 0l-2.25 2.25M12 4.5l2.25 2.25" />
//   </IconBase>
// );
