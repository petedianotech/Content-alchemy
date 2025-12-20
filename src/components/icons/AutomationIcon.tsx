import * as React from 'react';

const AutomationIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="2" />
    <path d="M12 14v4" />
    <path d="M12 8V4" />
    <path d="M14 12h4" />
    <path d="M8 12H4" />
    <path d="m15.5 15.5 2.5 2.5" />
    <path d="m6 6 2.5 2.5" />
    <path d="m6 18 2.5-2.5" />
    <path d="m15.5 8.5 2.5-2.5" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export default AutomationIcon;
