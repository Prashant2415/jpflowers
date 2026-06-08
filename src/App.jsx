import { useState, useEffect, useRef, useCallback } from "react";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Cormorant Garamond', serif;
    overflow-x: hidden;
    min-height: 100vh;
    cursor: default;
  }

  .app {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    transition: background 1.5s ease;
  }

  .app.day {
    background: linear-gradient(160deg, #fff0f5 0%, #fde8f5 25%, #f8e0f0 50%, #fce8e0 75%, #fff5e8 100%);
  }

  .app.night {
    background: linear-gradient(160deg, #1a0a2e 0%, #2d1050 25%, #1a1040 50%, #0d1a2e 75%, #1a0a1a 100%);
  }

  /* Floating petals */
  .petals-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }

  .petal {
    position: absolute;
    border-radius: 50% 0 50% 0;
    opacity: 0.6;
    animation: floatPetal linear infinite;
  }

  @keyframes floatPetal {
    0% { transform: translateY(-10vh) rotate(0deg) translateX(0px); opacity: 0; }
    10% { opacity: 0.6; }
    90% { opacity: 0.4; }
    100% { transform: translateY(110vh) rotate(720deg) translateX(80px); opacity: 0; }
  }

  /* Stars for night mode */
  .star {
    position: absolute;
    border-radius: 50%;
    background: white;
    animation: twinkle ease-in-out infinite;
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.3); }
  }

  /* Glow pulse */
  @keyframes glowPulse {
    0%, 100% { filter: drop-shadow(0 0 8px rgba(255,180,200,0.5)); }
    50% { filter: drop-shadow(0 0 20px rgba(255,180,200,0.9)); }
  }

  @keyframes glowPulseNight {
    0%, 100% { filter: drop-shadow(0 0 8px rgba(200,150,255,0.5)); }
    50% { filter: drop-shadow(0 0 24px rgba(200,150,255,1)); }
  }

  /* Flower sway */
  @keyframes sway {
    0%, 100% { transform: rotate(-3deg) translateY(0px); }
    50% { transform: rotate(3deg) translateY(-4px); }
  }

  @keyframes swayFast {
    0%, 100% { transform: rotate(-5deg); }
    50% { transform: rotate(5deg); }
  }

  /* Bloom */
  @keyframes bloom {
    0% { transform: scale(0) rotate(-30deg); opacity: 0; }
    60% { transform: scale(1.1) rotate(5deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  @keyframes bloomPetal {
    0% { transform: scaleY(0) rotate(var(--angle)); transform-origin: center bottom; opacity: 0; }
    70% { transform: scaleY(1.1) rotate(var(--angle)); transform-origin: center bottom; opacity: 1; }
    100% { transform: scaleY(1) rotate(var(--angle)); transform-origin: center bottom; opacity: 1; }
  }

  /* Typing cursor */
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* Heart reveal */
  @keyframes heartFlower {
    0% { opacity: 0; transform: scale(0) rotate(-20deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes messageFade {
    0% { opacity: 0; transform: translateY(20px) scale(0.97); }
    15% { opacity: 1; transform: translateY(0) scale(1); }
    75% { opacity: 1; transform: translateY(0) scale(1); }
    90% { opacity: 0; transform: translateY(-20px) scale(0.97); }
    100% { opacity: 0; }
  }

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Layout */
  .garden-wrapper {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Header */
  .site-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    position: relative;
    z-index: 10;
  }

  .title-group { text-align: left; }

  .site-title {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: clamp(1.4rem, 3vw, 2.2rem);
    letter-spacing: 0.02em;
    line-height: 1.1;
  }

  .app.day .site-title {
    background: linear-gradient(135deg, #c0506a 0%, #a0306a 40%, #c07040 80%, #c05060 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .app.night .site-title {
    background: linear-gradient(135deg, #e090ff 0%, #c060ff 40%, #9060ff 80%, #e090cc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .site-subtitle {
    font-size: 0.85rem;
    font-style: italic;
    letter-spacing: 0.12em;
    margin-top: 2px;
  }

  .app.day .site-subtitle { color: #b07090; }
  .app.night .site-subtitle { color: #9070c0; }

  .header-controls {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .ctrl-btn {
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  }

  .app.day .ctrl-btn {
    background: rgba(255,200,210,0.5);
    border: 1px solid rgba(200,120,140,0.3);
    color: #a04060;
    box-shadow: 0 2px 12px rgba(200,100,120,0.2);
  }

  .app.night .ctrl-btn {
    background: rgba(80,40,120,0.5);
    border: 1px solid rgba(160,100,220,0.3);
    color: #c090ff;
    box-shadow: 0 2px 12px rgba(100,40,180,0.3);
  }

  .ctrl-btn:hover { transform: scale(1.1) rotate(10deg); }

  /* Main garden */
  .main-garden {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 1.5rem 3rem;
    width: 100%;
    max-width: 1100px;
    gap: 2.5rem;
  }

  /* Flower garden SVG area */
  .flower-stage {
    width: 100%;
    max-width: 700px;
    position: relative;
  }

  .flower-stage svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  /* Single flower component */
  .flower-group {
    animation: sway ease-in-out infinite;
    transform-origin: center bottom;
  }

  /* Message carousel */
  .message-carousel {
    width: 100%;
    max-width: 600px;
    text-align: center;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .message-card {
    padding: 1.8rem 2.2rem;
    border-radius: 20px;
    backdrop-filter: blur(12px);
    position: absolute;
    width: 100%;
    animation: messageFade 5s ease-in-out forwards;
  }

  .app.day .message-card {
    background: rgba(255,240,248,0.7);
    border: 1px solid rgba(220,160,180,0.4);
    box-shadow: 0 8px 32px rgba(200,100,140,0.15), inset 0 1px 0 rgba(255,255,255,0.6);
  }

  .app.night .message-card {
    background: rgba(40,20,70,0.7);
    border: 1px solid rgba(160,100,220,0.3);
    box-shadow: 0 8px 32px rgba(80,20,160,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
  }

  .message-text {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: clamp(1rem, 2.5vw, 1.3rem);
    line-height: 1.7;
    letter-spacing: 0.01em;
  }

  .app.day .message-text { color: #7a3050; }
  .app.night .message-text { color: #e8c8ff; }

  /* Typewriter section */
  .typewriter-section {
    width: 100%;
    max-width: 600px;
    text-align: center;
    padding: 1rem;
  }

  .typewriter-label {
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
  }

  .app.day .typewriter-label { color: #c090a0; }
  .app.night .typewriter-label { color: #9070c0; }

  .typewriter-text {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.1rem, 2.8vw, 1.5rem);
    font-style: italic;
    min-height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .app.day .typewriter-text { color: #8a3060; }
  .app.night .typewriter-text { color: #d8b0ff; }

  .cursor {
    display: inline-block;
    width: 2px;
    height: 1.2em;
    vertical-align: middle;
    animation: blink 1s ease-in-out infinite;
  }

  .app.day .cursor { background: #b05070; }
  .app.night .cursor { background: #b090ff; }

  /* Heart button */
  .heart-btn-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .heart-btn {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 1.05rem;
    letter-spacing: 0.04em;
    padding: 0.9rem 2.4rem;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.4s ease;
  }

  .app.day .heart-btn {
    background: linear-gradient(135deg, #e86090 0%, #c04070 50%, #e06040 100%);
    color: white;
    box-shadow: 0 6px 24px rgba(200,60,100,0.4), 0 2px 8px rgba(200,60,100,0.2);
  }

  .app.night .heart-btn {
    background: linear-gradient(135deg, #9040d0 0%, #6020b0 50%, #a040c0 100%);
    color: white;
    box-shadow: 0 6px 24px rgba(120,40,200,0.5), 0 2px 8px rgba(120,40,200,0.3);
  }

  .heart-btn:hover {
    transform: translateY(-3px) scale(1.05);
  }

  .app.day .heart-btn:hover {
    box-shadow: 0 10px 32px rgba(200,60,100,0.5), 0 4px 12px rgba(200,60,100,0.3);
  }

  .app.night .heart-btn:hover {
    box-shadow: 0 10px 32px rgba(120,40,200,0.6), 0 4px 12px rgba(120,40,200,0.4);
  }

  .heart-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 2.5s linear infinite;
  }

  /* Surprise section */
  .surprise-section {
    width: 100%;
    max-width: 700px;
    text-align: center;
    animation: fadeInUp 1.2s ease forwards;
    padding: 1rem;
  }

  .surprise-title {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: clamp(1.4rem, 3.5vw, 2rem);
    margin-bottom: 1.5rem;
  }

  .app.day .surprise-title { color: #9a3060; }
  .app.night .surprise-title { color: #d8a8ff; }

  .heart-shape {
    display: inline-block;
    position: relative;
  }

  .heart-messages {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .heart-message-item {
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-size: 1rem;
    font-style: italic;
    animation: fadeInUp 0.8s ease forwards;
    animation-delay: var(--delay);
    opacity: 0;
  }

  .app.day .heart-message-item {
    background: rgba(255,220,235,0.6);
    border: 1px solid rgba(220,140,170,0.35);
    color: #7a3050;
  }

  .app.night .heart-message-item {
    background: rgba(60,20,100,0.6);
    border: 1px solid rgba(160,80,220,0.3);
    color: #e8c8ff;
  }

  /* Divider */
  .divider {
    width: 120px;
    height: 1px;
    margin: 0 auto;
  }

  .app.day .divider { background: linear-gradient(90deg, transparent, #d090a0, transparent); }
  .app.night .divider { background: linear-gradient(90deg, transparent, #8040c0, transparent); }

  /* Music note float */
  @keyframes noteFloat {
    0% { opacity: 0; transform: translateY(0) scale(0.8); }
    50% { opacity: 1; transform: translateY(-30px) scale(1); }
    100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
  }

  .music-note {
    position: absolute;
    animation: noteFloat 2s ease-in-out infinite;
    pointer-events: none;
    font-size: 1.2rem;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .site-header { padding: 1rem 1.2rem; }
    .main-garden { padding: 0.5rem 1rem 2rem; gap: 1.5rem; }
    .message-card { padding: 1.2rem 1.5rem; }
  }
`;

// ─── Floating Petals ───────────────────────────────────────────────────────
function FloatingPetals({ isNight }) {
  const petals = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 6 + Math.random() * 14,
    delay: `${Math.random() * 12}s`,
    duration: `${8 + Math.random() * 14}s`,
    color: isNight
      ? [`rgba(180,100,255,0.5)`, `rgba(140,80,220,0.5)`, `rgba(200,140,255,0.4)`, `rgba(100,60,200,0.5)`][Math.floor(Math.random() * 4)]
      : [`rgba(255,182,193,0.6)`, `rgba(255,160,200,0.6)`, `rgba(255,220,230,0.5)`, `rgba(230,160,200,0.6)`, `rgba(255,240,200,0.5)`][Math.floor(Math.random() * 5)],
  }));

  const stars = isNight ? Array.from({ length: 35 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 60}%`,
    size: 1.5 + Math.random() * 2.5,
    delay: `${Math.random() * 4}s`,
    duration: `${2 + Math.random() * 3}s`,
  })) : [];

  return (
    <div className="petals-layer">
      {petals.map(p => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
            top: `-${p.size}px`,
          }}
        />
      ))}
      {stars.map(s => (
        <div
          key={`star-${s.id}`}
          className="star"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDuration: s.duration,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── SVG Flower ──────────────────────────────────────────────────────────
function Flower({ cx, cy, size = 1, color, centerColor, stemColor, delay = 0, swayDuration = "4s", isNight }) {
  const petals = 6;
  const r = 22 * size;
  const petalH = 32 * size;
  const centerR = 10 * size;

  return (
    <g
      className="flower-group"
      style={{ animationDuration: swayDuration, animationDelay: `${delay}s` }}
    >
      {/* Stem */}
      <path
        d={`M ${cx} ${cy} Q ${cx - 12 * size} ${cy + 30 * size} ${cx} ${cy + 60 * size}`}
        stroke={stemColor}
        strokeWidth={3 * size}
        fill="none"
        strokeLinecap="round"
        style={{ animation: `bloom 1.2s ease-out ${delay + 0.2}s both` }}
      />
      {/* Leaf */}
      <ellipse
        cx={cx - 14 * size}
        cy={cy + 40 * size}
        rx={14 * size}
        ry={7 * size}
        fill={stemColor}
        opacity="0.8"
        transform={`rotate(-30, ${cx - 14 * size}, ${cy + 40 * size})`}
        style={{ animation: `bloom 1s ease-out ${delay + 0.4}s both` }}
      />
      {/* Petals */}
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (i * 360) / petals;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy - (petalH * 0.5)}
            rx={r * 0.45}
            ry={petalH * 0.5}
            fill={color}
            opacity="0.88"
            style={{
              "--angle": `${angle}deg`,
              transformOrigin: `${cx}px ${cy}px`,
              transform: `rotate(${angle}deg)`,
              animation: `bloomPetal 1.2s ease-out ${delay + 0.5 + i * 0.07}s both`,
            }}
          />
        );
      })}
      {/* Center */}
      <circle
        cx={cx}
        cy={cy}
        r={centerR}
        fill={centerColor}
        style={{
          animation: `bloom 0.8s ease-out ${delay + 1.0}s both`,
          filter: isNight
            ? `drop-shadow(0 0 6px ${centerColor})`
            : `drop-shadow(0 2px 4px rgba(0,0,0,0.15))`,
        }}
      />
      {/* Center shimmer dot */}
      <circle
        cx={cx - centerR * 0.3}
        cy={cy - centerR * 0.3}
        r={centerR * 0.25}
        fill="rgba(255,255,255,0.6)"
        style={{ animation: `bloom 0.6s ease-out ${delay + 1.2}s both` }}
      />
    </g>
  );
}

// ─── Rose Flower ─────────────────────────────────────────────────────────
function RoseFlower({ cx, cy, size = 1, color, delay = 0, isNight }) {
  const layers = [
    { r: 26 * size, petals: 8, spread: 0.9 },
    { r: 19 * size, petals: 6, spread: 0.7 },
    { r: 12 * size, petals: 5, spread: 0.5 },
  ];
  const stemColor = isNight ? "#3a7a3a" : "#4a8a4a";

  return (
    <g className="flower-group" style={{ animationDuration: "5.5s", animationDelay: `${delay}s` }}>
      <path
        d={`M ${cx} ${cy} Q ${cx + 10 * size} ${cy + 35 * size} ${cx} ${cy + 65 * size}`}
        stroke={stemColor}
        strokeWidth={3.5 * size}
        fill="none"
        strokeLinecap="round"
        style={{ animation: `bloom 1.2s ease-out ${delay + 0.1}s both` }}
      />
      <ellipse cx={cx + 16 * size} cy={cy + 38 * size} rx={15 * size} ry={7 * size}
        fill={stemColor} opacity="0.85"
        transform={`rotate(40, ${cx + 16 * size}, ${cy + 38 * size})`}
        style={{ animation: `bloom 1s ease-out ${delay + 0.3}s both` }}
      />
      {layers.map((layer, li) =>
        Array.from({ length: layer.petals }).map((_, i) => {
          const angle = (i * 360) / layer.petals + li * 15;
          const alpha = 0.7 + li * 0.1;
          return (
            <ellipse
              key={`${li}-${i}`}
              cx={cx}
              cy={cy - layer.r * layer.spread}
              rx={layer.r * 0.42}
              ry={layer.r * layer.spread}
              fill={color}
              opacity={alpha}
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                transform: `rotate(${angle}deg)`,
                animation: `bloomPetal 1.3s ease-out ${delay + 0.6 + li * 0.2 + i * 0.05}s both`,
                "--angle": `${angle}deg`,
              }}
            />
          );
        })
      )}
      <circle cx={cx} cy={cy} r={8 * size} fill={color}
        style={{ filter: `brightness(0.8)`, animation: `bloom 0.7s ease-out ${delay + 1.4}s both` }}
      />
    </g>
  );
}

// ─── Heart of Flowers ────────────────────────────────────────────────────
function HeartOfFlowers({ isNight }) {
  const heartPoints = [];
  for (let t = 0; t <= Math.PI * 2; t += 0.28) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    heartPoints.push({ x: 350 + x * 13, y: 140 + y * 13 });
  }

  const dayColors = ["#ff7eb0", "#ff9ec0", "#ffb5c8", "#e85a8a", "#ff6090", "#ffaac0", "#f06090"];
  const nightColors = ["#c060ff", "#a040e0", "#d090ff", "#8030d0", "#b050f0", "#e0b0ff", "#9040e0"];
  const colors = isNight ? nightColors : dayColors;
  const stemC = isNight ? "#4a7a4a" : "#5a8a5a";
  const centerC = isNight ? "#ffd0ff" : "#ffe080";

  return (
    <svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
      {heartPoints.map((pt, i) => (
        <g key={i} style={{ animation: `heartFlower 0.6s ease-out ${i * 0.05}s both`, transformOrigin: `${pt.x}px ${pt.y}px` }}>
          {Array.from({ length: 5 }).map((_, pi) => {
            const a = (pi * 72);
            return (
              <ellipse
                key={pi}
                cx={pt.x}
                cy={pt.y - 6}
                rx={4}
                ry={9}
                fill={colors[i % colors.length]}
                opacity="0.85"
                style={{
                  transformOrigin: `${pt.x}px ${pt.y}px`,
                  transform: `rotate(${a}deg)`,
                }}
              />
            );
          })}
          <circle cx={pt.x} cy={pt.y} r={4} fill={centerC}
            style={{ filter: isNight ? `drop-shadow(0 0 3px #c090ff)` : `drop-shadow(0 0 2px #ffcc60)` }}
          />
        </g>
      ))}
    </svg>
  );
}

// ─── Message Carousel ────────────────────────────────────────────────────
const MESSAGES = [
  "You turned ordinary moments into beautiful memories ❤️",
  "Every flower here blooms because of your smile 🌸",
  "No matter where life goes, you'll always be my favorite place ✨",
  "Some people change days, you changed my world 💕",
  "This garden exists because you exist 🌹",
  "In a world full of seasons, you are my endless spring 🌷",
  "Love is the flower you've got to let grow 🌼",
];

function MessageCarousel({ isNight }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 600);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="message-carousel">
      {visible && (
        <div className="message-card" key={idx}>
          <p className="message-text">{MESSAGES[idx]}</p>
        </div>
      )}
    </div>
  );
}

// ─── Typewriter ──────────────────────────────────────────────────────────
const TYPEWRITER_MSGS = [
  "Written in the language of flowers, just for you...",
  "Every petal holds a whisper of something true...",
  "This garden was planted with love, tended by dreams...",
];

function TypewriterText({ isNight }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const msg = TYPEWRITER_MSGS[msgIdx];
    if (!deleting && charIdx < msg.length) {
      const t = setTimeout(() => {
        setDisplayed(msg.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, 55);
      return () => clearTimeout(t);
    }
    if (!deleting && charIdx === msg.length) {
      const t = setTimeout(() => setDeleting(true), 2200);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => {
        setDisplayed(msg.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      }, 30);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx === 0) {
      setDeleting(false);
      setMsgIdx(i => (i + 1) % TYPEWRITER_MSGS.length);
    }
  }, [charIdx, deleting, msgIdx]);

  return (
    <div className="typewriter-section">
      <div className="typewriter-label">a message for you</div>
      <div className="typewriter-text">
        <span>{displayed}</span>
        <span className="cursor" />
      </div>
    </div>
  );
}

// ─── Surprise Section ────────────────────────────────────────────────────
const SURPRISE_MSGS = [
  { text: "You are the reason every garden blooms 🌸", delay: 0.2 },
  { text: "In every petal, a memory of your laughter 🌷", delay: 0.5 },
  { text: "Stars dim in the presence of your heart ✨", delay: 0.8 },
  { text: "Forever grateful the universe wrote you into my story 💕", delay: 1.1 },
  { text: "This heart of flowers — it beats only for you 🌹❤️", delay: 1.4 },
];

function SurpriseSection({ isNight }) {
  return (
    <div className="surprise-section">
      <div className="divider" style={{ marginBottom: "1.5rem" }} />
      <h2 className="surprise-title">A Heart, Grown Just For You 🌸</h2>
      <HeartOfFlowers isNight={isNight} />
      <div className="heart-messages">
        {SURPRISE_MSGS.map((m, i) => (
          <div
            key={i}
            className="heart-message-item"
            style={{ "--delay": `${m.delay}s` }}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="divider" style={{ marginTop: "1.5rem" }} />
    </div>
  );
}

// ─── Music Controller ─────────────────────────────────────────────────────
function MusicController({ playing, onToggle }) {
  return (
    <div style={{ position: "relative" }}>
      <button className="ctrl-btn" onClick={onToggle} title="Toggle music">
        {playing ? "🎵" : "🎶"}
      </button>
      {playing && (
        <>
          <span className="music-note" style={{ top: "-35px", left: "5px", animationDelay: "0s" }}>♪</span>
          <span className="music-note" style={{ top: "-20px", left: "25px", animationDelay: "0.7s" }}>♫</span>
          <span className="music-note" style={{ top: "-40px", left: "15px", animationDelay: "1.4s" }}>♩</span>
        </>
      )}
    </div>
  );
}

// ─── Flower Garden ───────────────────────────────────────────────────────
function FlowerGarden({ isNight }) {
  const dayPalette = [
    { color: "#ffb5c8", center: "#ffe080", stem: "#5a8a5a" },
    { color: "#e8a0c8", center: "#ffd060", stem: "#4a7a4a" },
    { color: "#ffcce0", center: "#f0c040", stem: "#6a9a6a" },
    { color: "#f0a0b8", center: "#ffe8a0", stem: "#508050" },
    { color: "#ffd0e8", center: "#ffcc60", stem: "#5a8a5a" },
  ];
  const nightPalette = [
    { color: "#c070ff", center: "#f0d0ff", stem: "#3a6a3a" },
    { color: "#a050e0", center: "#e0b0ff", stem: "#305030" },
    { color: "#d090ff", center: "#ffd0ff", stem: "#4a7a4a" },
    { color: "#9040d0", center: "#e8c0ff", stem: "#385038" },
    { color: "#b060f0", center: "#f8e0ff", stem: "#3a6a3a" },
  ];
  const palette = isNight ? nightPalette : dayPalette;

  const flowers = [
    { type: "simple", x: 100, y: 145, size: 1.05, delay: 0.3, swayDur: "4.2s", pi: 0 },
    { type: "rose", x: 210, y: 135, size: 1.15, delay: 0.6, pi: 1 },
    { type: "simple", x: 340, y: 120, size: 1.3, delay: 0.1, swayDur: "3.8s", pi: 2 },
    { type: "rose", x: 470, y: 135, size: 1.15, delay: 0.8, pi: 3 },
    { type: "simple", x: 575, y: 148, size: 1.0, delay: 0.5, swayDur: "4.6s", pi: 4 },
  ];

  return (
    <div className="flower-stage">
      <svg viewBox="0 0 680 250" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        {/* Ground */}
        <ellipse cx="340" cy="220" rx="300" ry="18"
          fill={isNight ? "rgba(40,20,80,0.3)" : "rgba(180,220,160,0.25)"}
        />
        {/* Grass tufts */}
        {[80, 160, 260, 400, 510, 600].map((x, i) => (
          <g key={i}>
            <line x1={x} y1={220} x2={x - 6} y2={206} stroke={isNight ? "#3a6a3a" : "#6aaa6a"} strokeWidth="2" strokeLinecap="round" />
            <line x1={x} y1={220} x2={x} y2={204} stroke={isNight ? "#4a7a4a" : "#7aba7a"} strokeWidth="2" strokeLinecap="round" />
            <line x1={x} y1={220} x2={x + 6} y2={207} stroke={isNight ? "#3a6a3a" : "#6aaa6a"} strokeWidth="2" strokeLinecap="round" />
          </g>
        ))}
        {/* Flowers */}
        {flowers.map((f, i) =>
          f.type === "rose" ? (
            <RoseFlower
              key={i}
              cx={f.x} cy={f.y}
              size={f.size}
              color={palette[f.pi].color}
              delay={f.delay}
              isNight={isNight}
            />
          ) : (
            <Flower
              key={i}
              cx={f.x} cy={f.y}
              size={f.size}
              color={palette[f.pi].color}
              centerColor={palette[f.pi].center}
              stemColor={palette[f.pi].stem}
              delay={f.delay}
              swayDuration={f.swayDur}
              isNight={isNight}
            />
          )
        )}
        {/* Butterflies (day only) */}
        {!isNight && (
          <g style={{ animation: "rotateSlow 8s linear infinite", transformOrigin: "300px 80px" }}>
            <ellipse cx="295" cy="78" rx="8" ry="5" fill="rgba(255,200,100,0.7)" transform="rotate(-20,295,78)" />
            <ellipse cx="305" cy="78" rx="8" ry="5" fill="rgba(255,200,100,0.7)" transform="rotate(20,305,78)" />
            <ellipse cx="295" cy="84" rx="6" ry="4" fill="rgba(255,180,80,0.6)" transform="rotate(20,295,84)" />
            <ellipse cx="305" cy="84" rx="6" ry="4" fill="rgba(255,180,80,0.6)" transform="rotate(-20,305,84)" />
            <line x1="298" y1="76" x2="302" y2="86" stroke="#8a4020" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )}
        {/* Moon (night only) */}
        {isNight && (
          <g style={{ animation: "glowPulseNight 4s ease-in-out infinite" }}>
            <circle cx="590" cy="40" r="22" fill="#f0e8ff" opacity="0.9" />
            <circle cx="600" cy="34" r="18" fill={isNight ? "#2d1050" : "transparent"} opacity="0.95" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────
export default function App() {
  const [isNight, setIsNight] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [heartOpen, setHeartOpen] = useState(false);
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const nodesRef = useRef([]);

  const playMusic = useCallback(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    // Simple ambient chord arpeggios
    const notes = [261.63, 311.13, 392.0, 466.16, 523.25, 392.0, 311.13, 261.63];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.setTargetAtTime(0.15, ctx.currentTime + i * 0.9, 0.4);
      g.gain.setTargetAtTime(0, ctx.currentTime + i * 0.9 + 1.2, 0.5);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + (notes.length + 1) * 0.9);
      nodesRef.current.push(osc);
    });

    // Loop
    const loop = setInterval(() => {
      if (!audioCtxRef.current) { clearInterval(loop); return; }
      const t = audioCtxRef.current.currentTime;
      notes.forEach((freq, i) => {
        const o2 = audioCtxRef.current.createOscillator();
        const g2 = audioCtxRef.current.createGain();
        o2.type = "sine";
        o2.frequency.value = freq * (Math.random() < 0.3 ? 2 : 1);
        g2.gain.setValueAtTime(0, t);
        g2.gain.setTargetAtTime(0.08, t + i * 0.8, 0.3);
        g2.gain.setTargetAtTime(0, t + i * 0.8 + 1.0, 0.4);
        o2.connect(g2);
        g2.connect(masterGain);
        o2.start(t);
        o2.stop(t + (notes.length + 2) * 0.8);
        nodesRef.current.push(o2);
      });
    }, notes.length * 900);
    nodesRef.current.push({ stop: () => clearInterval(loop) });
  }, []);

  const stopMusic = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
    nodesRef.current = [];
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, []);

  const toggleMusic = () => {
    if (musicOn) { stopMusic(); setMusicOn(false); }
    else { playMusic(); setMusicOn(true); }
  };

  return (
    <>
      <style>{style}</style>
      <div className={`app ${isNight ? "night" : "day"}`}>
        <FloatingPetals isNight={isNight} />
        <div className="garden-wrapper">
          {/* Header */}
          <header className="site-header">
            <div className="title-group">
              <h1 className="site-title">The Bloom Garden</h1>
              <p className="site-subtitle">a place where love grows</p>
            </div>
            <div className="header-controls">
              <MusicController playing={musicOn} onToggle={toggleMusic} />
              <button
                className="ctrl-btn"
                onClick={() => setIsNight(n => !n)}
                title="Toggle day/night"
              >
                {isNight ? "🌙" : "☀️"}
              </button>
            </div>
          </header>

          {/* Main content */}
          <main className="main-garden">
            <FlowerGarden isNight={isNight} />

            <div className="divider" />

            <MessageCarousel isNight={isNight} />

            <TypewriterText isNight={isNight} />

            <div className="heart-btn-wrapper">
              {!heartOpen && (
                <button
                  className="heart-btn"
                  onClick={() => setHeartOpen(true)}
                >
                  Open My Heart ❤️
                </button>
              )}
              {heartOpen && <SurpriseSection isNight={isNight} />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
