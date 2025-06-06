
import React from 'react';
import { IconBase } from './IconBase';

export const RingIcon: React.FC<{className?: string}> = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.563c.09-.464.178-.93.264-1.403a11.955 11.955 0 00-7.028 0c.086.473.174.94.264 1.403m5.5 0a11.955 11.955 0 012.475 9.688c-.465.09-.93.178-1.403.264a11.955 11.955 0 01-9.688-2.475m5.5 0c.473-.086.94-.174 1.403-.264m-5.5 0a11.955 11.955 0 00-2.475-9.688c.465-.09.93-.178 1.403-.264m9.688 2.475a11.955 11.955 0 010 7.028M4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" />
  </IconBase>
);
