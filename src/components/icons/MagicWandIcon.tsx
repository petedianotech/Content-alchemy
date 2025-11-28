import * as React from 'react';

const MagicWandIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M13.5 2.5 16 5l-8 8-2.5-2.5 8-8Z" />
    <path d="M2.5 13.5 5 16l-1.5 4L1 21.5 2.5 13.5Z" />
    <path d="M19.5 2.5 21 4" />
    <path d="m11.5 6.5 6 6" />
    <path d="m20 10.5 1.5 1.5" />
    <path d="m18 8.5 1 1" />
  </svg>
);

export default MagicWandIcon;
