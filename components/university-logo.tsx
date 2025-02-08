import React from 'react';

const UniversityLogo = ({ 
  universityName = "Michigan State",
  universityLocation = "East Lansing, MI"
}) => {
  const words = universityName.split(' ');
  const firstLine = words.slice(0, -1).join(' ');
  const lastLine = words[words.length - 1];

  return (
    <div className="w-full ">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1200 200"
        className="w-full "
        preserveAspectRatio="none"
      >
        <defs>
          <pattern 
            id="dotPattern" 
            x="0" 
            y="0" 
            width="20" 
            height="20" 
            patternUnits="userSpaceOnUse"
          >
            <circle 
              cx="10" 
              cy="10" 
              r="1" 
              fill="rgba(255,255,255,0.3)"
            />
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
            <line 
              x1="0" 
              y1="0" 
              x2="0" 
              y2="10" 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth="2"
            />
          </pattern>
          <linearGradient 
            id="subtleGradient" 
            x1="0%" 
            y1="0%" 
            x2="100%" 
            y2="100%"
          >
            <stop offset="0%" style={{ stopColor: 'rgb(122, 89, 166)' }}/>
            <stop offset="100%" style={{ stopColor: 'rgb(184, 165, 227)' }}/>
          </linearGradient>
        </defs>
        
        {/* Main content group */}
        <g transform="translate(0,0)">
          <rect 
            x="0" 
            y="0" 
            width="1200" 
            height="200" 
            fill="url(#subtleGradient)"
          />
          <rect 
            x="0" 
            y="0" 
            width="1200" 
            height="200" 
            fill="url(#diagonalPattern)"
          />
          
          <rect 
            x="40" 
            y="15" 
            width="1120" 
            height="170" 
            fill="none" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="1"
          />
          
          <text 
            x="80" 
            y="70" 
            fontFamily="Gantari, Arial" 
            fontSize="42"
            fontWeight="bold" 
            fill="white"
            className="university-name"
          >
            {firstLine}
          </text>
          <text 
            x="80" 
            y="120" 
            fontFamily="Gantari, Arial" 
            fontSize="42"
            fontWeight="bold" 
            fill="white"
            className="university-name"
          >
            {lastLine}
          </text>
          <text 
            x="80" 
            y="160" 
            fontFamily="Gantari, Arial" 
            fontSize="18"
            fill="white"
            className="university-location"
          >
            {universityLocation}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default UniversityLogo;
