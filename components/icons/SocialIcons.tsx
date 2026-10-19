import React from "react";

export function SocialIcon({
  type,
  className = "w-6 h-6",
}: {
  type: string;
  className?: string;
}) {
  switch (type) {
    case "whatsapp":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="21" fill="#25D366" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M33.8 28.9c-.4-.2-2.5-1.2-2.9-1.4-.4-.1-.7-.2-1 .2s-1.1 1.4-1.4 1.7c-.2.3-.5.3-.9.1s-1.8-.7-3.4-2.1c-1.3-1.1-2.1-2.6-2.4-3-.2-.4 0-.7.2-.9.2-.2.4-.5.6-.7.2-.3.3-.4.4-.7.1-.3 0-.6-.1-.8s-1-2.3-1.3-3.2c-.3-.8-.7-.7-1-.7h-.8c-.3 0-.8.1-1.2.5-.4.4-1.5 1.5-1.5 3.6s1.5 4.2 1.8 4.5c.2.3 3 4.6 7.4 6.5 1 .4 1.9.7 2.5.9 1.1.3 2 .3 2.8.2.9-.1 2.5-1 2.9-2 .4-1 .4-1.8.3-2-.1-.2-.4-.3-.8-.5z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "linkedin":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="#0A66C2" />
          <path
            d="M14.5 19H9.5V35H14.5V19ZM12 12C10.3 12 9 13.3 9 15C9 16.7 10.3 18 12 18C13.7 18 15 16.7 15 15C15 13.3 13.7 12 12 12ZM38.5 25.5C38.5 21.3 36.3 19 32.5 19C29.6 19 28.1 20.6 27.4 21.8V19.3H22.5C22.6 20.7 22.5 35 22.5 35H27.4V26.2C27.4 25.7 27.4 25.2 27.6 24.8C28 23.8 28.9 22.8 30.4 22.8C32.4 22.8 33.2 24.3 33.2 26.6V35H38.1L38.5 25.5Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "instagram":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <defs>
            <radialGradient id="instaGrad" cx="30%" cy="105%" r="130%">
              <stop offset="0%" stopColor="#ffdb73" />
              <stop offset="10%" stopColor="#fd752b" />
              <stop offset="50%" stopColor="#e31c79" />
              <stop offset="100%" stopColor="#7a1cb1" />
            </radialGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#instaGrad)" />
          <rect
            x="11"
            y="11"
            width="26"
            height="26"
            rx="8"
            stroke="#FFFFFF"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="24" cy="24" r="6.5" stroke="#FFFFFF" strokeWidth="3" fill="none" />
          <circle cx="31.5" cy="16.5" r="1.8" fill="#FFFFFF" />
        </svg>
      );

    case "facebook":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#1877F2" />
          <path
            d="M26.5 37V24.5H30.5L31.2 19.8H26.5V16.8C26.5 15.5 26.9 14.6 28.8 14.6H31.3V10.4C30.9 10.3 29.3 10.2 27.5 10.2C23.7 10.2 21.1 12.5 21.1 16.8V19.8H17V24.5H21.1V37H26.5Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "twitter":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#000000" stroke="#333333" strokeWidth="1.5" />
          <path
            d="M27.7 21.5L35.6 12.3H33.7L26.8 20.3L21.3 12.3H15L23.3 24.3L15 34H16.9L24.1 25.6L29.9 34H36.2L27.7 21.5ZM25.1 24.4L24.3 23.2L17.6 13.6H20.5L25.9 21.3L26.7 22.5L33.8 32.7H30.9L25.1 24.4Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "phone":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#34C759" />
          <path
            d="M17.5 15.2c.4-.9 1.1-1.2 2.1-.9l3.2 1.5c.8.4 1.1 1.2.9 2-.4 1.1-.6 1.8-.1 2.8 1.4 2.6 3.4 4.6 6 6 1 .5 1.7.3 2.8-.1.8-.2 1.6.1 2 .9l1.5 3.2c.3 1 0 1.7-.9 2.1-2.4 1.2-5.4 1-8.5-.7-4.1-2.3-7.5-5.7-9.8-9.8-1.7-3.1-1.9-6.1-.7-8.5z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "email":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#EA4335" />
          <path
            d="M12 17.5C12 15.6 13.6 14 15.5 14H32.5C34.4 14 36 15.6 36 17.5V30.5C36 32.4 34.4 34 32.5 34H15.5C13.6 34 12 32.4 12 30.5V17.5Z"
            fill="#FFFFFF"
            fillOpacity="0.15"
          />
          <path
            d="M34 17L24 24L14 17"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="13"
            y="15"
            width="22"
            height="18"
            rx="3"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>
      );

    case "maps":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#1A73E8" />
          <path
            d="M24 13C18.5 13 14 17.5 14 23C14 30.5 24 37 24 37C24 37 34 30.5 34 23C34 17.5 29.5 13 24 13ZM24 26.5C22.1 26.5 20.5 24.9 20.5 23C20.5 21.1 22.1 19.5 24 19.5C25.9 19.5 27.5 21.1 27.5 23C27.5 24.9 25.9 26.5 24 26.5Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "website":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#0071E3" />
          <circle cx="24" cy="24" r="12" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          <ellipse cx="24" cy="24" rx="5.5" ry="12" stroke="#FFFFFF" strokeWidth="2.2" fill="none" />
          <path d="M12 24H36" stroke="#FFFFFF" strokeWidth="2.2" />
        </svg>
      );

    case "custom":
    default:
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#4F46E5" />
          <circle cx="24" cy="24" r="11" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          <path d="M13 24H35" stroke="#FFFFFF" strokeWidth="2.2" />
        </svg>
      );
  }
}

/**
 * Reach World Signature Official Logo
 */
export function ReachWorldLogo({
  className = "w-44 h-auto",
}: {
  className?: string;
  layout?: "stacked" | "horizontal";
}) {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <img
        src="/reach-world-logo.png"
        alt="Reach World"
        className="w-full h-auto object-contain brightness-0 invert drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
      />
    </div>
  );
}
