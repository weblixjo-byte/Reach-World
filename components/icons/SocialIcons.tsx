import React from "react";

export interface SocialIconProps {
  type: string;
  className?: string;
  alt?: string;
}

const iconFileMap: Record<string, string> = {
  phone: "/icons/social/telephone.png",
  whatsapp: "/icons/social/whatsapp.png",
  email: "/icons/social/mail.png",
  website: "/icons/social/world-wide-web.png",
  maps: "/icons/social/location.png",
  linkedin: "/icons/social/linkedin.png",
  instagram: "/icons/social/instagram.png",
  facebook: "/icons/social/facebook-app-symbol.png",
  twitter: "/icons/social/twitter.png",
};

export function SocialIcon({
  type,
  className = "w-6 h-6",
  alt,
}: SocialIconProps) {
  const src = iconFileMap[type] || "/icons/social/world-wide-web.png";

  return (
    <img
      src={src}
      alt={alt || type}
      className={`object-contain select-none pointer-events-none brightness-0 invert ${className}`}
      loading="eager"
    />
  );
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
