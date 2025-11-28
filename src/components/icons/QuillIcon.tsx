import * as React from 'react';

const QuillIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20.72 3.28a2.5 2.5 0 0 0-3.53 0L5.5 15.01l-1.42 1.42a2.5 2.5 0 0 0 0 3.53l.3.3a2.5 2.5 0 0 0 3.53 0l1.42-1.42L20.72 7.07a2.5 2.5 0 0 0 0-3.53z" />
    <path d="m15 9-3 3" />
    <path d="M3 21h3" />
    <path d="M5.5 15.01 4.09 16.4a2.5 2.5 0 0 0 0 3.53l.3.3" />
  </svg>
);

export default QuillIcon;
