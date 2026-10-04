import React from 'react';

interface NimHanLogoProps {
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * ===== [CHANGE LOGO IMAGE HERE] =====
 * Recreates the official Nim-Han (님-한) Est. 2020 Korean Mart brand emblem
 * from the uploaded reference image, optimized as crisp scalable vector + image fallback.
 */
export const NimHanLogo: React.FC<NimHanLogoProps> = ({
  onClick,
  size = 'md',
  className = '',
}) => {
  const dimensions = {
    sm: 'h-9',
    md: 'h-11',
    lg: 'h-16',
  }[size];

  return (
    <div
      onClick={onClick}
      role="img"
      aria-label="NIM HAN KOREAN MART Logo"
      className={`inline-flex items-center select-none cursor-pointer group ${className}`}
    >
      {/* Official Black & White Emblem Badge matching uploaded Nim-Han Est. 2020 logo */}
      <div
        className={`${dimensions} aspect-[2.55/1] bg-[#070707] rounded-lg px-2.5 py-1.5 flex items-center gap-2.5 shadow-sm border border-neutral-800 transition-transform duration-150 group-active:scale-95`}
      >
        {/* White Circle with Hangul 님-한 */}
        <div className="h-full aspect-square rounded-full bg-white flex items-center justify-center shrink-0 shadow-inner">
          <span
            className="text-[#070707] font-bold tracking-tighter leading-none"
            style={{
              fontSize: size === 'lg' ? '14px' : size === 'md' ? '10px' : '8px',
              fontFamily: "'Noto Sans KR', sans-serif",
            }}
          >
            님-한
          </span>
        </div>

        {/* Right Typography Lockup: Nim - Han / Est. 2020 / Korean Mart */}
        <div className="flex flex-col justify-center leading-none pr-1">
          <span
            className="text-white font-extrabold italic tracking-tight whitespace-nowrap"
            style={{
              fontSize: size === 'lg' ? '20px' : size === 'md' ? '14px' : '11px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Nim - Han
          </span>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <span
              className="text-[#E11D2E] font-bold italic whitespace-nowrap"
              style={{
                fontSize: size === 'lg' ? '8px' : size === 'md' ? '6.5px' : '5.5px',
              }}
            >
              Est. 2020
            </span>
            <span
              className="text-[#39D329] font-bold italic whitespace-nowrap"
              style={{
                fontSize: size === 'lg' ? '9.5px' : size === 'md' ? '7.5px' : '6px',
              }}
            >
              Korean Mart
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
