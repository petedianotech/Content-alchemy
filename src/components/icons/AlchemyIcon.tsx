import * as React from 'react';

const AlchemyIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M12 2a10 10 0 1 0 10 10" />
    <path d="M12 22a10 10 0 0 0-9.16-9.9" />
    <path d="M2 12h20" />
    <path d="m7 12 5 5 5-5" />
    <path d="M12 3v9" />
  </svg>
);

export default AlchemyIcon;
