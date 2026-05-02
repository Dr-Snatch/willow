interface Props {
  health: number; // 0–100
  size?: number;
}

const WillowTree = ({ health, size = 160 }: Props) => {
  const h = Math.max(0, Math.min(100, health));
  const thriving = h >= 80;

  // Colour ramp: brown → olive → mid-green → rich green → deep green
  const frondColor =
    h < 20 ? '#8C7A60' :
    h < 40 ? '#7A9668' :
    h < 60 ? '#4A8C6A' :
    h < 80 ? '#2E7D5A' : '#216645';

  const trunkColor = '#8C7260';
  const frondOpacity = 0.35 + (h / 100) * 0.65;

  // Show more fronds as health grows
  const showOuter  = h >= 15;
  const showMid    = h >= 35;
  const showInner  = h >= 55;
  const showTop    = h >= 25;
  const showExtra  = h >= 70;

  return (
    <svg
      viewBox="0 0 120 170"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: size, height: (size * 170) / 120 }}
      className={thriving ? 'tree-sway' : undefined}
    >
      {/* Ground line */}
      <path
        d="M20 158 Q60 152 100 158"
        stroke={trunkColor}
        strokeWidth="1.5"
        opacity={0.25}
      />

      {/* Trunk */}
      <path
        d="M60 158 C59 145 58 128 60 100 C61 88 60 80 60 72"
        stroke={trunkColor}
        strokeWidth={h < 20 ? 3 : 4}
        opacity={0.9}
      />

      {/* Outer drooping branches */}
      {showOuter && (
        <>
          <path
            d="M60 90 C48 82 36 86 30 96 C24 106 27 120 30 132"
            stroke={frondColor}
            strokeWidth="2.2"
            opacity={frondOpacity}
          />
          <path
            d="M60 90 C72 82 84 86 90 96 C96 106 93 120 90 132"
            stroke={frondColor}
            strokeWidth="2.2"
            opacity={frondOpacity}
          />
        </>
      )}

      {/* Mid branches */}
      {showMid && (
        <>
          <path
            d="M60 84 C50 76 40 78 38 88 C36 98 38 112 40 124"
            stroke={frondColor}
            strokeWidth="1.8"
            opacity={frondOpacity}
          />
          <path
            d="M60 84 C70 76 80 78 82 88 C84 98 82 112 80 124"
            stroke={frondColor}
            strokeWidth="1.8"
            opacity={frondOpacity}
          />
        </>
      )}

      {/* Inner branches */}
      {showInner && (
        <>
          <path
            d="M60 78 C53 70 46 72 45 80 C44 90 46 104 48 118"
            stroke={frondColor}
            strokeWidth="1.5"
            opacity={frondOpacity}
          />
          <path
            d="M60 78 C67 70 74 72 75 80 C76 90 74 104 72 118"
            stroke={frondColor}
            strokeWidth="1.5"
            opacity={frondOpacity}
          />
        </>
      )}

      {/* Top central fronds */}
      {showTop && (
        <>
          <path
            d="M60 72 C57 60 54 50 56 40"
            stroke={frondColor}
            strokeWidth="1.5"
            opacity={frondOpacity * 0.9}
          />
          <path
            d="M60 72 C63 60 66 50 64 40"
            stroke={frondColor}
            strokeWidth="1.5"
            opacity={frondOpacity * 0.9}
          />
        </>
      )}

      {/* Extra fronds for thriving state */}
      {showExtra && (
        <>
          <path
            d="M60 86 C44 78 34 82 32 92 C30 102 32 115 34 128"
            stroke={frondColor}
            strokeWidth="1.4"
            opacity={frondOpacity * 0.7}
          />
          <path
            d="M60 86 C76 78 86 82 88 92 C90 102 88 115 86 128"
            stroke={frondColor}
            strokeWidth="1.4"
            opacity={frondOpacity * 0.7}
          />
          <path
            d="M60 74 C55 62 52 52 54 42"
            stroke={frondColor}
            strokeWidth="1.3"
            opacity={frondOpacity * 0.8}
          />
          <path
            d="M60 74 C65 62 68 52 66 42"
            stroke={frondColor}
            strokeWidth="1.3"
            opacity={frondOpacity * 0.8}
          />
        </>
      )}
    </svg>
  );
};

export default WillowTree;
