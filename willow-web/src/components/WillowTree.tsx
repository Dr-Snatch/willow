interface Props {
  health: number; // 0–100
  size?: number;
}

const WillowTree = ({ health, size = 160 }: Props) => {
  const h = Math.max(0, Math.min(100, health));
  const thriving = h >= 80;

  const healthLabel =
    h < 20 ? 'Withered' :
    h < 40 ? 'Struggling' :
    h < 60 ? 'Growing' :
    h < 80 ? 'Healthy' : 'Thriving';

  // Colour ramp — dead brown → pale olive → mid green → rich green → deep lush
  const leafColor =
    h < 20 ? '#9B8060' :
    h < 40 ? '#84AE6C' :
    h < 60 ? '#4E9870' :
    h < 80 ? '#2E7D5A' : '#1A6642';

  const trunkColor = h < 20 ? '#7A6448' : '#7A6550';

  // Canopy fill — gives visual mass to healthy+ states
  const canopyFill = h < 60 ? '#5A9470' : h < 80 ? '#2E7D5A' : '#1A6642';
  const canopyAlpha = h < 40 ? 0 : h < 60 ? 0.09 : h < 80 ? 0.12 : 0.17;

  // Frond opacity grows with health
  const fo = h < 20 ? 0.42 : h < 40 ? 0.56 : h < 60 ? 0.72 : h < 80 ? 0.84 : 0.94;

  const label = `Willow tree — ${healthLabel}${h < 30 ? ', needs care' : h >= 80 ? ', thriving' : ''}`;

  // Crown Y position — taller tree as health grows
  const crownY = h < 20 ? 82 : h < 40 ? 74 : h < 60 ? 66 : h < 80 ? 60 : 56;
  const trunkPath =
    h < 20
      ? `M60 162 C60 148 60 134 60 112 C60 100 60 92 60 ${crownY}`
      : `M60 162 C59 148 58 130 59 110 C59 96 59 82 60 ${crownY}`;

  return (
    <svg
      viewBox="0 0 120 170"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: size, height: (size * 170) / 120 }}
      className={thriving ? 'tree-sway' : undefined}
      role="img"
      aria-label={label}
    >
      {/* Ground ellipse */}
      <ellipse
        cx="60" cy="163"
        rx={h < 20 ? 12 : h < 40 ? 16 : h < 60 ? 20 : h < 80 ? 26 : 32}
        ry="3.5"
        fill={trunkColor}
        opacity={0.16}
      />

      {/* Canopy fill — layered ellipses for healthy+ */}
      {h >= 40 && (
        <ellipse
          cx="60"
          cy={crownY + 8}
          rx={h < 60 ? 24 : h < 80 ? 36 : 46}
          ry={h < 60 ? 13 : h < 80 ? 20 : 27}
          fill={canopyFill}
          opacity={canopyAlpha}
        />
      )}
      {h >= 80 && (
        <ellipse cx="60" cy={crownY + 2} rx="28" ry="14" fill={canopyFill} opacity={0.09} />
      )}

      {/* Trunk */}
      <path
        d={trunkPath}
        stroke={trunkColor}
        strokeWidth={h < 20 ? 2.5 : h < 40 ? 3 : h < 60 ? 3.5 : h < 80 ? 4 : 4.5}
        opacity={0.88}
      />

      {/* ── WITHERED: bare stubs + 2 tiny dried fronds ── */}
      {h < 20 && (
        <>
          <path d="M60 82 C52 78 44 79 38 82" stroke={trunkColor} strokeWidth="1.8" opacity={0.50} />
          <path d="M60 82 C68 78 76 79 82 82" stroke={trunkColor} strokeWidth="1.8" opacity={0.50} />
          <path d="M60 84 C56 80 51 81 49 86 C47 91 48 100 50 108" stroke={leafColor} strokeWidth="1.2" opacity={0.38} />
          <path d="M60 84 C64 80 69 81 71 86 C73 91 72 100 70 108" stroke={leafColor} strokeWidth="1.2" opacity={0.38} />
        </>
      )}

      {/* ── STRUGGLING (20–40): 4 short fronds ── */}
      {h >= 20 && h < 40 && (
        <>
          {/* Inner pair */}
          <path d="M60 74 C54 68 46 70 42 76 C38 82 37 96 38 112 C39 124 42 134 46 141" stroke={leafColor} strokeWidth="1.8" opacity={fo} />
          <path d="M60 74 C66 68 74 70 78 76 C82 82 83 96 82 112 C81 124 78 134 74 141" stroke={leafColor} strokeWidth="1.8" opacity={fo} />
          {/* Outer pair */}
          <path d="M60 72 C50 65 37 66 28 72 C21 77 19 91 20 110 C21 124 25 137 30 145" stroke={leafColor} strokeWidth="1.5" opacity={fo * 0.82} />
          <path d="M60 72 C70 65 83 66 92 72 C99 77 101 91 100 110 C99 124 95 137 90 145" stroke={leafColor} strokeWidth="1.5" opacity={fo * 0.82} />
        </>
      )}

      {/* ── GROWING (40–60): 6 fronds, proper droop ── */}
      {h >= 40 && h < 60 && (
        <>
          {/* Inner */}
          <path d="M60 66 C54 60 46 62 42 68 C38 74 37 90 38 110 C39 126 42 140 47 150" stroke={leafColor} strokeWidth="1.9" opacity={fo} />
          <path d="M60 66 C66 60 74 62 78 68 C82 74 83 90 82 110 C81 126 78 140 73 150" stroke={leafColor} strokeWidth="1.9" opacity={fo} />
          {/* Mid */}
          <path d="M60 64 C50 57 36 58 26 64 C18 70 15 86 16 110 C17 128 21 145 27 155" stroke={leafColor} strokeWidth="1.6" opacity={fo * 0.90} />
          <path d="M60 64 C70 57 84 58 94 64 C102 70 105 86 104 110 C103 128 99 145 93 155" stroke={leafColor} strokeWidth="1.6" opacity={fo * 0.90} />
          {/* Inner fill */}
          <path d="M60 67 C55 61 48 62 45 68 C42 74 41 87 42 104 C43 118 46 130 50 138" stroke={leafColor} strokeWidth="1.3" opacity={fo * 0.78} />
          <path d="M60 67 C65 61 72 62 75 68 C78 74 79 87 78 104 C77 118 74 130 70 138" stroke={leafColor} strokeWidth="1.3" opacity={fo * 0.78} />
        </>
      )}

      {/* ── HEALTHY (60–80): 8 fronds, full graceful cascade ── */}
      {h >= 60 && h < 80 && (
        <>
          {/* Inner (densest) */}
          <path d="M60 62 C54 55 45 57 41 64 C37 71 36 87 37 110 C38 128 42 146 47 156" stroke={leafColor} strokeWidth="2.0" opacity={fo} />
          <path d="M60 62 C66 55 75 57 79 64 C83 71 84 87 83 110 C82 128 78 146 73 156" stroke={leafColor} strokeWidth="2.0" opacity={fo} />
          {/* Mid */}
          <path d="M60 60 C49 52 34 53 23 60 C15 66 12 83 13 108 C14 128 19 148 25 158" stroke={leafColor} strokeWidth="1.7" opacity={fo * 0.92} />
          <path d="M60 60 C71 52 86 53 97 60 C105 66 108 83 107 108 C106 128 101 148 95 158" stroke={leafColor} strokeWidth="1.7" opacity={fo * 0.92} />
          {/* Outer */}
          <path d="M60 60 C45 51 28 52 17 59 C9 64 6 82 7 109 C8 130 13 150 19 160" stroke={leafColor} strokeWidth="1.5" opacity={fo * 0.80} />
          <path d="M60 60 C75 51 92 52 103 59 C111 64 114 82 113 109 C112 130 107 150 101 160" stroke={leafColor} strokeWidth="1.5" opacity={fo * 0.80} />
          {/* Extra inner fill */}
          <path d="M60 63 C55 57 49 58 46 65 C43 71 42 84 43 102 C44 116 47 128 51 136" stroke={leafColor} strokeWidth="1.3" opacity={fo * 0.74} />
          <path d="M60 63 C65 57 71 58 74 65 C77 71 78 84 77 102 C76 116 73 128 69 136" stroke={leafColor} strokeWidth="1.3" opacity={fo * 0.74} />
        </>
      )}

      {/* ── THRIVING (80+): 12 fronds, lush beautiful canopy ── */}
      {h >= 80 && (
        <>
          {/* Inner pair — thickest */}
          <path d="M60 58 C53 50 43 52 38 59 C33 66 32 84 33 110 C34 130 38 150 44 160" stroke={leafColor} strokeWidth="2.2" opacity={fo} />
          <path d="M60 58 C67 50 77 52 82 59 C87 66 88 84 87 110 C86 130 82 150 76 160" stroke={leafColor} strokeWidth="2.2" opacity={fo} />
          {/* Mid inner */}
          <path d="M60 56 C51 48 38 49 28 56 C20 62 17 80 18 108 C19 128 24 148 30 158" stroke={leafColor} strokeWidth="1.9" opacity={fo * 0.94} />
          <path d="M60 56 C69 48 82 49 92 56 C100 62 103 80 102 108 C101 128 96 148 90 158" stroke={leafColor} strokeWidth="1.9" opacity={fo * 0.94} />
          {/* Mid outer */}
          <path d="M60 55 C47 47 31 47 19 55 C11 61 7 80 8 108 C9 130 14 151 21 161" stroke={leafColor} strokeWidth="1.6" opacity={fo * 0.86} />
          <path d="M60 55 C73 47 89 47 101 55 C109 61 113 80 112 108 C111 130 106 151 99 161" stroke={leafColor} strokeWidth="1.6" opacity={fo * 0.86} />
          {/* Outermost — longest droop */}
          <path d="M60 56 C44 47 26 47 14 55 C6 61 3 81 4 110 C5 132 10 154 17 163" stroke={leafColor} strokeWidth="1.4" opacity={fo * 0.76} />
          <path d="M60 56 C76 47 94 47 106 55 C114 61 117 81 116 110 C115 132 110 154 103 163" stroke={leafColor} strokeWidth="1.4" opacity={fo * 0.76} />
          {/* Inner fill fronds */}
          <path d="M60 59 C55 53 48 55 44 62 C40 69 39 83 40 104 C41 120 45 135 49 144" stroke={leafColor} strokeWidth="1.3" opacity={fo * 0.78} />
          <path d="M60 59 C65 53 72 55 76 62 C80 69 81 83 80 104 C79 120 75 135 71 144" stroke={leafColor} strokeWidth="1.3" opacity={fo * 0.78} />
          {/* Fine detail fronds */}
          <path d="M60 57 C56 52 51 53 48 59 C45 65 44 78 45 95 C46 110 49 123 52 130" stroke={leafColor} strokeWidth="1.1" opacity={fo * 0.64} />
          <path d="M60 57 C64 52 69 53 72 59 C75 65 76 78 75 95 C74 110 71 123 68 130" stroke={leafColor} strokeWidth="1.1" opacity={fo * 0.64} />
          {/* Wide sweep fronds for fullness */}
          <path d="M60 57 C50 50 37 51 26 58 C19 63 16 80 17 105 C18 124 22 142 27 152" stroke={leafColor} strokeWidth="1.2" opacity={fo * 0.68} />
          <path d="M60 57 C70 50 83 51 94 58 C101 63 104 80 103 105 C102 124 98 142 93 152" stroke={leafColor} strokeWidth="1.2" opacity={fo * 0.68} />
        </>
      )}
    </svg>
  );
};

export default WillowTree;
