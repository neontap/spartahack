import React from 'react';

const UniversityLogo = ({
                          universityName = "Michigan State",
                          universityLocation = "East Lansing, MI"
                        }) => {
  const words = universityName.split(' ');
  const firstLine = words.slice(0, -1).join(' ');
  const lastLine = words[words.length - 1];

  return (
      <div className="w-full relative">
        {/* Main container with gradient background */}
        <div className="w-full aspect-[2/1] sm:aspect-[3.5] md:aspect-[4] l:aspect-[4.5/1] xl:aspect-[5] bg-gradient-to-br from-[rgb(122,89,166)] to-[rgb(184,165,227)] relative overflow-hidden">
          {/* Decorative SVG patterns */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            <defs>
              <pattern
                  id="dotPattern"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
              >
                <circle cx="10" cy="10" r="1" fill="white"/>
              </pattern>
              <pattern
                  id="diagonalPattern"
                  x="0"
                  y="0"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
              >
                <line x1="0" y1="0" x2="0" y2="10" stroke="white" strokeWidth="2"/>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalPattern)"/>
          </svg>

          {/* Border decoration */}
          <div className="absolute inset-6 md:inset-8 border border-white/30"></div>

          {/* Content container */}
          <div className="relative h-full flex flex-col justify-center px-12 sm:px-8 md:px-16 py-4 text-white">
            <div className="space-y-0 md:space-y-0.5">
              <h1 className="font-bold text-3xl sm:text-2xl md:text-3xl xl:text-5xl ">
                {firstLine}
              </h1>
              <h1 className="font-bold text-3xl sm:text-2xl md:text-3xl xl:text-5xl">
                {lastLine}
              </h1>
              <p className="text-md sm:text-sm md:text-sm xl:text-xl mt-2">
                {universityLocation}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default UniversityLogo;