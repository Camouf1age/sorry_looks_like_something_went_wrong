import { useState, useEffect, useMemo, useRef } from "react";

const STORAGE_KEY = "dnd_sorry_v1";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SB_HEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

async function storageGet(key) {
  if (!SUPABASE_URL) return null;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/availability?key=eq.${encodeURIComponent(key)}&select=value`,
    { headers: SB_HEADERS }
  );
  const rows = await res.json();
  return rows[0]?.value ?? null;
}

async function storageSet(key, value) {
  if (!SUPABASE_URL) return;
  await fetch(`${SUPABASE_URL}/rest/v1/availability`, {
    method: "POST",
    headers: { ...SB_HEADERS, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ key, value }),
  });
}

const FELLOWSHIP = [
  { player: "Mads",   char: "Aki",            race: "Kitsune",  cls: "Rogue",          deity: "Calistria", icon: "🦊" },
  { player: "Tobbi",  char: "Bunnon",         race: "Human",    cls: "Bard",           deity: null,        icon: "🎵" },
  { player: "Sigurd", char: "Baz",            race: "Half-orc", cls: "Cleric",         deity: "Sarenrae",  icon: "☀️" },
  { player: "Gee",    char: "Gruurd",         race: "Dwarf",    cls: "Fighter",        deity: null,        icon: "🪓" },
  { player: "Kim",    char: "Aryan",          race: "Tiefling", cls: "Alchemist",      deity: null,        icon: "⚗️" },
  { player: "DM",     char: "Dungeon Master", race: "",         cls: "The Architect of Doom", deity: null, icon: "📖", isDM: true },
];

function toLocalDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function getNextSessions(count = 6) {
  // First session: Monday 27 April 2026 (months are 0-indexed)
  const first = new Date(2026, 3, 27, 12, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(first);
    d.setDate(first.getDate() + i * 14);
    return toLocalDateStr(d);
  });
}

function formatDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0); // local time, avoids UTC offset
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ── DRAGON ──────────────────────────────────────────────────────────────────
function Dragon() {
  return (
    <svg viewBox="0 0 430 155" width="430" height="155" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dBodyTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d7a14"/>
          <stop offset="45%" stopColor="#1e5c0c"/>
          <stop offset="100%" stopColor="#0d2e06"/>
        </linearGradient>
        <linearGradient id="dBelly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a9a1e"/>
          <stop offset="100%" stopColor="#2d7a14"/>
        </linearGradient>
        <linearGradient id="dHead" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e5c0c"/>
          <stop offset="100%" stopColor="#2d7a14"/>
        </linearGradient>
        <linearGradient id="dWing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#071a04" stopOpacity="0.97"/>
          <stop offset="70%" stopColor="#0e3206" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#1a4d0a" stopOpacity="0.7"/>
        </linearGradient>
        <radialGradient id="dEye" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ffe066"/>
          <stop offset="40%" stopColor="#ff8800"/>
          <stop offset="100%" stopColor="#aa3300"/>
        </radialGradient>
        <radialGradient id="dFlame" cx="20%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#ffffcc" stopOpacity="0.95"/>
          <stop offset="25%" stopColor="#ffdd00"/>
          <stop offset="55%" stopColor="#ff6600"/>
          <stop offset="100%" stopColor="#cc2200" stopOpacity="0.2"/>
        </radialGradient>
        <radialGradient id="dFlame2" cx="15%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8"/>
          <stop offset="30%" stopColor="#ffcc00"/>
          <stop offset="100%" stopColor="#ff4400" stopOpacity="0.3"/>
        </radialGradient>
        <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="flameGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <style>{`
          @keyframes dWingFlap {
            0%   { transform: rotate(0deg);   }
            28%  { transform: rotate(-24deg);  }
            65%  { transform: rotate(18deg);   }
            100% { transform: rotate(0deg);   }
          }
          @keyframes dFlameFlicker {
            0%,100% { opacity:.78; transform: scaleX(1)    scaleY(1);    }
            20%     { opacity:1;   transform: scaleX(1.13) scaleY(1.09); }
            50%     { opacity:.58; transform: scaleX(.88)  scaleY(.92);  }
            75%     { opacity:.92; transform: scaleX(1.10) scaleY(1.06); }
          }
          @keyframes dEyePulse {
            0%,100% { opacity:1;   }
            50%     { opacity:.35; }
          }
          .d-wing-n {
            transform-origin: 152px 74px;
            animation: dWingFlap 1.35s cubic-bezier(.37,0,.63,1) infinite;
          }
          .d-wing-f {
            transform-origin: 148px 80px;
            animation: dWingFlap 1.35s cubic-bezier(.37,0,.63,1) .2s infinite;
          }
          .d-flame {
            transform-origin: 374px 55px;
            animation: dFlameFlicker .52s ease-in-out infinite;
          }
          .d-eye { animation: dEyePulse 2.1s ease-in-out infinite; }
          @keyframes dTailWag {
            0%,100% { transform: rotate(0deg);   }
            25%     { transform: rotate(-11deg);  }
            60%     { transform: rotate(9deg);    }
            80%     { transform: rotate(-5deg);   }
          }
          .d-tail {
            transform-origin: 82px 96px;
            animation: dTailWag 2.6s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* ── FAR WING (behind body) ── */}
      <g className="d-wing-f">
        <path d="M148,80 L35,42 L68,78 Z" fill="url(#dWing)" opacity="0.65"/>
        <line x1="148" y1="80" x2="35" y2="42" stroke="#1a4d0a" strokeWidth="0.8" opacity="0.6"/>
      </g>

      {/* ── NEAR WING ── */}
      <g className="d-wing-n">
        {/* Wing membrane segments */}
        <path d="M152,74 L55,8 L80,50 Z" fill="url(#dWing)"/>
        <path d="M152,74 L80,50 L100,22 Z" fill="url(#dWing)" opacity="0.92"/>
        <path d="M152,74 L100,22 L125,12 Z" fill="url(#dWing)" opacity="0.88"/>
        <path d="M152,74 L125,12 L148,28 L138,78 Z" fill="url(#dWing)" opacity="0.82"/>
        {/* Wing leading edge claw */}
        <path d="M55,8 Q50,4 47,8 Q52,12 57,10 Z" fill="#1a3a08"/>
        <path d="M80,50 Q75,46 72,50 Q77,54 82,52 Z" fill="#1a3a08"/>
        {/* Wing spars (veins) */}
        <line x1="152" y1="74" x2="55"  y2="8"  stroke="#2d6b12" strokeWidth="1.2"/>
        <line x1="152" y1="74" x2="80"  y2="50" stroke="#2d6b12" strokeWidth="1.1"/>
        <line x1="152" y1="74" x2="100" y2="22" stroke="#2d6b12" strokeWidth="1.0"/>
        <line x1="152" y1="74" x2="125" y2="12" stroke="#2d6b12" strokeWidth="0.9"/>
        <line x1="152" y1="74" x2="148" y2="28" stroke="#2d6b12" strokeWidth="0.8"/>
        {/* Membrane texture lines */}
        <path d="M70,30 Q110,55 148,74" stroke="#1a4d0a" strokeWidth="0.5" fill="none" opacity="0.5"/>
        <path d="M90,18 Q120,46 148,74" stroke="#1a4d0a" strokeWidth="0.5" fill="none" opacity="0.4"/>
      </g>

      {/* ── TAIL ── */}
      <g className="d-tail">
        <path d="M82,96 Q55,112 28,100 Q10,90 16,82 Q4,78 10,70 Q-2,65 4,58" stroke="url(#dBodyTop)" strokeWidth="13" fill="none" strokeLinecap="round"/>
        <path d="M82,96 Q55,112 28,100 Q12,92 16,84" stroke="url(#dBelly)" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.5"/>
        {/* Tail tip */}
        <path d="M4,58 Q-4,52 0,46 Q10,52 7,62 Z" fill="#1a4d0a"/>
        <path d="M4,58 Q-4,52 0,46 Q10,52 7,62 Z" fill="#2d6b12" opacity="0.5"/>
        {/* Tail spine ridges */}
        <path d="M68,102 Q65,91 70,94" stroke="#3a9a1e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M52,108 Q49,97 54,100" stroke="#3a9a1e" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M36,106 Q33,96 38,98" stroke="#3a9a1e" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      </g>

      {/* ── MAIN BODY ── */}
      <ellipse cx="155" cy="92" rx="76" ry="32" fill="url(#dBodyTop)"/>
      {/* Belly */}
      <ellipse cx="155" cy="106" rx="58" ry="14" fill="url(#dBelly)" opacity="0.55"/>
      {/* Scale texture lines */}
      <path d="M95,78 Q125,73 155,74 Q185,73 215,78" stroke="#3a9a1e" strokeWidth="0.7" fill="none" opacity="0.45"/>
      <path d="M90,86 Q120,81 155,82 Q190,81 220,86" stroke="#3a9a1e" strokeWidth="0.6" fill="none" opacity="0.35"/>
      <path d="M92,94 Q122,90 155,91 Q188,90 218,94" stroke="#3a9a1e" strokeWidth="0.5" fill="none" opacity="0.25"/>
      {/* Body highlights */}
      <ellipse cx="145" cy="82" rx="40" ry="10" fill="#3a9a1e" opacity="0.12"/>

      {/* ── BACK SPINE RIDGES ── */}
      {[160,175,190,205,220].map((x, i) => (
        <path key={x} d={`M${x},${70-i*0.5} Q${x+2},${60-i} ${x+4},${64-i*0.5}`} stroke="#4aaa24" strokeWidth={2.2-i*0.2} fill="none" strokeLinecap="round"/>
      ))}

      {/* ── NECK ── */}
      <path d="M222,78 Q248,66 268,58 Q282,52 292,48" stroke="#1e5c0c" strokeWidth="24" fill="none" strokeLinecap="round"/>
      <path d="M222,78 Q248,66 268,58 Q282,52 292,48" stroke="#2d7a14" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.4"/>
      <path d="M224,86 Q250,74 270,66 Q284,60 294,56" stroke="#3a9a1e" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.3"/>
      {/* Neck ridges */}
      <path d="M238,68 Q242,59 246,63" stroke="#4aaa24" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M252,63 Q256,54 260,58" stroke="#4aaa24" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M266,58 Q270,49 274,53" stroke="#4aaa24" strokeWidth="1.4" fill="none" strokeLinecap="round"/>

      {/* ── FRONT LEGS ── */}
      <path d="M178,116 Q172,134 164,142" stroke="#1a4d0a" strokeWidth="9" fill="none" strokeLinecap="round"/>
      <path d="M178,116 Q182,134 176,142" stroke="#1a4d0a" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M178,116 Q188,130 184,138" stroke="#1a4d0a" strokeWidth="7" fill="none" strokeLinecap="round"/>
      {/* Front claws */}
      <path d="M164,142 Q158,147 154,149" stroke="#8b7220" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M176,142 Q172,148 168,151" stroke="#8b7220" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M184,138 Q182,145 178,148" stroke="#8b7220" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      {/* Back legs */}
      <path d="M115,116 Q108,132 102,138" stroke="#1a4d0a" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M115,116 Q118,132 112,138" stroke="#1a4d0a" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M102,138 Q97,143 93,145" stroke="#8b7220" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M112,138 Q108,143 104,146" stroke="#8b7220" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* ── HEAD ── */}
      {/* Lower jaw (open) */}
      <path d="M292,50 Q310,53 330,57 Q348,60 360,63 Q368,68 358,72 Q342,70 322,67 Q302,64 286,60 Z" fill="#1a4d0a"/>
      {/* Upper jaw */}
      <path d="M292,48 Q308,40 328,38 Q348,38 362,44 Q372,50 368,56 Q355,52 336,50 Q314,48 294,52 Z" fill="url(#dHead)"/>
      {/* Head mass */}
      <ellipse cx="316" cy="50" rx="36" ry="20" fill="url(#dHead)"/>
      {/* Snout */}
      <path d="M336,48 Q358,48 372,52 Q375,58 368,62 Q355,62 340,60 Q330,57 328,54 Z" fill="#1e5c0c"/>
      {/* Nostril */}
      <ellipse cx="360" cy="53" rx="4.5" ry="3" fill="#071a04" transform="rotate(-12,360,53)"/>
      <ellipse cx="360" cy="53" rx="2" ry="1.2" fill="#0d2e08" transform="rotate(-12,360,53)"/>
      {/* Lip/jaw line */}
      <path d="M286,56 Q308,60 332,64 Q348,66 360,66" stroke="#0d2e06" strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* Upper teeth */}
      <path d="M296,56 Q298,62 300,56" stroke="#d4c898" strokeWidth="1.5" fill="#d4c898" opacity="0.9"/>
      <path d="M306,57 Q308,64 310,57" stroke="#d4c898" strokeWidth="1.5" fill="#d4c898" opacity="0.9"/>
      <path d="M318,58 Q320,65 322,58" stroke="#d4c898" strokeWidth="1.5" fill="#d4c898" opacity="0.85"/>
      <path d="M330,59 Q332,65 334,59" stroke="#d4c898" strokeWidth="1.4" fill="#d4c898" opacity="0.8"/>
      {/* Lower teeth */}
      <path d="M300,64 Q302,58 304,64" stroke="#c8be8a" strokeWidth="1.3" fill="#c8be8a" opacity="0.8"/>
      <path d="M312,66 Q314,59 316,66" stroke="#c8be8a" strokeWidth="1.3" fill="#c8be8a" opacity="0.8"/>
      <path d="M324,67 Q326,61 328,67" stroke="#c8be8a" strokeWidth="1.2" fill="#c8be8a" opacity="0.75"/>
      {/* Tongue */}
      <path d="M350,64 Q360,68 368,66 Q370,70 365,71 Q358,72 348,68 Z" fill="#cc2244" opacity="0.9"/>
      <path d="M365,68 Q367,71 365,73" stroke="#aa1a33" strokeWidth="1" fill="none"/>

      {/* ── HEAD DETAILS ── */}
      {/* Brow ridge */}
      <path d="M296,42 Q312,37 330,38" stroke="#3a9a1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Cheek scale suggestion */}
      <path d="M296,52 Q308,49 318,50" stroke="#3a9a1e" strokeWidth="1" fill="none" opacity="0.5"/>
      <path d="M300,57 Q312,54 322,55" stroke="#3a9a1e" strokeWidth="0.8" fill="none" opacity="0.4"/>
      {/* Head highlight */}
      <ellipse cx="312" cy="42" rx="22" ry="8" fill="#4aaa24" opacity="0.1"/>

      {/* ── HORNS ── */}
      <path d="M298,38 Q302,22 314,30" stroke="#c8a855" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M298,38 Q302,22 314,30" stroke="#e8c870" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M312,36 Q317,19 328,27" stroke="#c8a855" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M312,36 Q317,19 328,27" stroke="#e8c870" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5"/>
      {/* Small spurs */}
      <path d="M305,35 Q308,27 313,30" stroke="#c8a855" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M320,33 Q323,26 328,29" stroke="#c8a855" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

      {/* ── CREST / FRILL ── */}
      <path d="M292,46 Q285,35 289,40 Q282,30 287,36 Q280,26 286,33" stroke="#2d7a14" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>

      {/* ── EYE ── */}
      <circle cx="304" cy="46" r="8.5" fill="#0a0500"/>
      <circle cx="304" cy="46" r="6.5" fill="url(#dEye)" filter="url(#eyeGlow)"/>
      {/* Slit pupil */}
      <ellipse cx="304" cy="46" rx="2" ry="4.5" fill="#0a0500"/>
      {/* Highlight */}
      <circle cx="306" cy="43.5" r="1.5" fill="rgba(255,255,200,0.7)"/>
      <circle cx="302.5" cy="49" r="0.7" fill="rgba(255,255,200,0.3)"/>
      {/* Outer glow ring */}
      <circle cx="304" cy="46" r="10" fill="none" stroke="#ff8800" strokeWidth="0.8" opacity="0.35" className="d-eye"/>

      {/* ── FLAME ── */}
      <g className="d-flame">
        <path d="M372,54 Q390,42 410,40 Q422,42 426,50 Q422,60 410,65 Q392,68 376,62 Z" fill="#ff3300" opacity="0.75" filter="url(#flameGlow)"/>
        <path d="M374,55 Q390,46 408,44 Q418,47 420,53 Q416,61 406,63 Q390,65 378,60 Z" fill="url(#dFlame)" opacity="0.9"/>
        <path d="M376,56 Q390,50 406,49 Q414,52 413,57 Q408,62 396,62 Q384,61 378,58 Z" fill="url(#dFlame2)" opacity="0.85"/>
        <ellipse cx="395" cy="55" rx="12" ry="5" fill="#ffffff" opacity="0.35"/>
        <path d="M410,40 Q420,32 425,36 Q422,44 416,42 Z" fill="#ff8800" opacity="0.6"/>
        <path d="M415,44 Q424,37 428,42 Q425,50 420,48 Z" fill="#ffcc00" opacity="0.5"/>
      </g>
      {/* ── FIRE SPARKS ── */}
      {[
        { x:416, y:48, tx:5,  ty:-26, dur:"0.72s", begin:"0s",    r:2.2, color:"#ffee44" },
        { x:422, y:52, tx:3,  ty:-18, dur:"0.55s", begin:"0.22s", r:1.5, color:"#ffffff" },
        { x:418, y:43, tx:6,  ty:-30, dur:"0.88s", begin:"0.44s", r:2.5, color:"#ff9900" },
        { x:424, y:50, tx:2,  ty:-22, dur:"0.63s", begin:"0.65s", r:1.6, color:"#ffcc00" },
        { x:412, y:46, tx:7,  ty:-20, dur:"0.79s", begin:"0.1s",  r:1.8, color:"#ff6600" },
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.color} opacity="0" filter="url(#flameGlow)">
          <animate attributeName="cx"      values={`${p.x};${p.x+p.tx}`}       dur={p.dur} begin={p.begin} repeatCount="indefinite"/>
          <animate attributeName="cy"      values={`${p.y};${p.y+p.ty}`}       dur={p.dur} begin={p.begin} repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;.95;.7;0" keyTimes="0;.12;.55;1" dur={p.dur} begin={p.begin} repeatCount="indefinite"/>
          <animate attributeName="r"       values={`${p.r};${p.r*.5};0`}       dur={p.dur} begin={p.begin} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}

// ── MUMMY ──────────────────────────────────────────────────────────────────
function Mummy({ flip = false }) {
  return (
    <svg viewBox="0 0 90 178" width="68" height="135" style={{ transform: flip ? "scaleX(-1)" : "none" }}>
      <defs>
        <linearGradient id="mBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4c48a"/>
          <stop offset="100%" stopColor="#b8a86e"/>
        </linearGradient>
        <radialGradient id="mEyeGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffdd44"/>
          <stop offset="50%" stopColor="#ff7700"/>
          <stop offset="100%" stopColor="#cc3300"/>
        </radialGradient>
        <filter id="mEyeGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Head */}
      <ellipse cx="45" cy="27" rx="20" ry="23" fill="url(#mBodyGrad)"/>
      <ellipse cx="45" cy="22" rx="18" ry="14" fill="#cabb88" opacity="0.4"/>
      {/* Head bandages */}
      <path d="M25,16 Q45,12 65,15" stroke="#9a8850" strokeWidth="4" fill="none" opacity="0.8" strokeLinecap="round"/>
      <path d="M25,24 Q45,20 65,23" stroke="#9a8850" strokeWidth="3.5" fill="none" opacity="0.8" strokeLinecap="round"/>
      <path d="M26,32 Q45,28 64,31" stroke="#9a8850" strokeWidth="3.5" fill="none" opacity="0.75" strokeLinecap="round"/>
      <path d="M28,40 Q45,36 62,39" stroke="#9a8850" strokeWidth="3" fill="none" opacity="0.65" strokeLinecap="round"/>
      {/* Bandage overlap details */}
      <path d="M38,12 Q40,28 36,40" stroke="#b8a870" strokeWidth="1" fill="none" opacity="0.4"/>
      <path d="M52,12 Q54,28 50,42" stroke="#b8a870" strokeWidth="1" fill="none" opacity="0.4"/>
      {/* Eyes - glowing orbs */}
      <ellipse cx="35" cy="26" rx="7" ry="6" fill="#1a0a00"/>
      <ellipse cx="55" cy="26" rx="7" ry="6" fill="#1a0a00"/>
      <ellipse cx="35" cy="26" rx="5.5" ry="4.5" fill="url(#mEyeGrad)" filter="url(#mEyeGlow)"/>
      <ellipse cx="55" cy="26" rx="5.5" ry="4.5" fill="url(#mEyeGrad)" filter="url(#mEyeGlow)"/>
      <ellipse cx="35" cy="26" rx="2" ry="2.5" fill="#0a0500"/>
      <ellipse cx="55" cy="26" rx="2" ry="2.5" fill="#0a0500"/>
      <circle cx="36.5" cy="24.5" r="1.2" fill="rgba(255,255,200,0.6)"/>
      <circle cx="56.5" cy="24.5" r="1.2" fill="rgba(255,255,200,0.6)"/>
      {/* Eye outer glow */}
      <ellipse cx="35" cy="26" rx="8" ry="7" fill="none" stroke="#ff7700" strokeWidth="0.7" opacity="0.4"/>
      <ellipse cx="55" cy="26" rx="8" ry="7" fill="none" stroke="#ff7700" strokeWidth="0.7" opacity="0.4"/>
      {/* Body */}
      <rect x="26" y="50" width="38" height="74" rx="7" fill="url(#mBodyGrad)"/>
      <ellipse cx="45" cy="56" rx="17" ry="8" fill="#cabb88" opacity="0.3"/>
      {/* Body bandages */}
      <path d="M26,60 Q45,56 64,59" stroke="#9a8850" strokeWidth="3.5" fill="none" opacity="0.8" strokeLinecap="round"/>
      <path d="M26,70 Q45,66 64,69" stroke="#9a8850" strokeWidth="3.5" fill="none" opacity="0.8" strokeLinecap="round"/>
      <path d="M26,80 Q45,76 64,79" stroke="#9a8850" strokeWidth="3" fill="none" opacity="0.75" strokeLinecap="round"/>
      <path d="M26,90 Q45,86 64,89" stroke="#9a8850" strokeWidth="3" fill="none" opacity="0.7" strokeLinecap="round"/>
      <path d="M26,100 Q45,96 64,99" stroke="#9a8850" strokeWidth="3" fill="none" opacity="0.65" strokeLinecap="round"/>
      <path d="M26,110 Q45,106 64,109" stroke="#9a8850" strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round"/>
      {/* Vertical wrap details */}
      <path d="M38,50 Q36,87 38,124" stroke="#b0a060" strokeWidth="1" fill="none" opacity="0.35"/>
      <path d="M52,50 Q54,87 52,124" stroke="#b0a060" strokeWidth="1" fill="none" opacity="0.35"/>
      {/* Arms */}
      <rect x="4"  y="54" width="22" height="13" rx="6.5" fill="url(#mBodyGrad)"/>
      <rect x="64" y="54" width="22" height="13" rx="6.5" fill="url(#mBodyGrad)"/>
      {/* Arm bandage */}
      <path d="M5,61 Q15,59 26,62" stroke="#9a8850" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"/>
      <path d="M64,61 Q74,59 85,62" stroke="#9a8850" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"/>
      {/* Hanging bandage strips from arms */}
      <path d="M8,67 Q5,82 8,92" stroke="#cabb88" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M12,67 Q9,80 12,90" stroke="#9a8850" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M78,67 Q82,82 78,92" stroke="#cabb88" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M74,67 Q78,80 74,90" stroke="#9a8850" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      {/* Legs */}
      <rect x="28" y="123" width="14" height="46" rx="7" fill="url(#mBodyGrad)"/>
      <rect x="48" y="123" width="14" height="46" rx="7" fill="url(#mBodyGrad)"/>
      {/* Leg bandages */}
      <path d="M28,132 Q35,130 42,132" stroke="#9a8850" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"/>
      <path d="M28,142 Q35,140 42,142" stroke="#9a8850" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"/>
      <path d="M28,152 Q35,150 42,152" stroke="#9a8850" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round"/>
      <path d="M48,132 Q55,130 62,132" stroke="#9a8850" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"/>
      <path d="M48,142 Q55,140 62,142" stroke="#9a8850" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"/>
      <path d="M48,152 Q55,150 62,152" stroke="#9a8850" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round"/>
    </svg>
  );
}

// ── D20 ────────────────────────────────────────────────────────────────────
function D20({ size = 54, value = 20 }) {
  const isCrit = value === 20;
  const isFail = value === 1;
  const edgeColor = isCrit ? "#f0d060" : isFail ? "#ee4444" : "#c8983a";
  const faceA = isCrit ? "#1e1400" : isFail ? "#1a0000" : "#160c00";
  const faceB = isCrit ? "#2a1c00" : isFail ? "#220000" : "#1e1200";
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 100 110">
      <defs>
        <linearGradient id="diceGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isCrit ? "#3a2800" : isFail ? "#2a0000" : "#261800"}/>
          <stop offset="100%" stopColor="#080400"/>
        </linearGradient>
        {isCrit && (
          <filter id="diceCritGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        )}
      </defs>
      {isCrit && <polygon points="50,5 95,30 95,78 50,103 5,78 5,30" fill="none" stroke="#f0d060" strokeWidth="3" opacity="0.4" filter="url(#diceCritGlow)"/>}
      <polygon points="50,5 95,30 95,78 50,103 5,78 5,30" fill="url(#diceGrad)" stroke={edgeColor} strokeWidth="2.5"/>
      <polygon points="50,5 95,30 50,54" fill={faceA} stroke={edgeColor} strokeWidth="1.5"/>
      <polygon points="50,54 95,30 95,78" fill={faceB} stroke={edgeColor} strokeWidth="1.5"/>
      <polygon points="50,54 95,78 50,103" fill={faceA} stroke={edgeColor} strokeWidth="1.5"/>
      <polygon points="50,54 50,103 5,78" fill={faceB} stroke={edgeColor} strokeWidth="1.5"/>
      <polygon points="50,54 5,78 5,30" fill={faceA} stroke={edgeColor} strokeWidth="1.5"/>
      <polygon points="50,54 5,30 50,5" fill={faceB} stroke={edgeColor} strokeWidth="1.5"/>
      {/* Face edge highlights */}
      <line x1="50" y1="5" x2="95" y2="30" stroke={edgeColor} strokeWidth="0.5" opacity="0.4"/>
      <text x="50" y="68" textAnchor="middle" fill={edgeColor} fontSize="26" fontWeight="bold" fontFamily="Georgia, serif"
        style={{ filter: isCrit ? "drop-shadow(0 0 4px #f0d060)" : "none" }}>{value}</text>
    </svg>
  );
}

// ── EMBERS ─────────────────────────────────────────────────────────────────
function Embers() {
  const config = [
    { l:"8%",  sz:2.5, delay:"0s",    dur:"4s",   color:"#ff6600" },
    { l:"22%", sz:1.8, delay:"1.2s",  dur:"3.5s", color:"#ff9900" },
    { l:"38%", sz:3,   delay:"0.5s",  dur:"5s",   color:"#ffcc00" },
    { l:"55%", sz:2,   delay:"2.1s",  dur:"3.8s", color:"#ff6600" },
    { l:"68%", sz:1.5, delay:"0.8s",  dur:"4.5s", color:"#ff9900" },
    { l:"80%", sz:2.8, delay:"1.8s",  dur:"3.2s", color:"#ff4400" },
    { l:"15%", sz:1.5, delay:"3s",    dur:"4.2s", color:"#ffaa00" },
    { l:"48%", sz:2.2, delay:"2.5s",  dur:"3.7s", color:"#ff7700" },
    { l:"72%", sz:1.8, delay:"0.3s",  dur:"5.2s", color:"#ffdd00" },
    { l:"92%", sz:2,   delay:"1.5s",  dur:"3.9s", color:"#ff5500" },
  ];
  return (
    <>
      {config.map((e, i) => (
        <div key={i} style={{
          position:"fixed", bottom:"-8px", left:e.l,
          width:e.sz, height:e.sz, borderRadius:"50%",
          background:e.color, pointerEvents:"none", zIndex:6,
          boxShadow:`0 0 ${e.sz*2.5}px ${e.color}`,
          animation:`emberFloat ${e.dur} ${e.delay} ease-in infinite`,
        }}/>
      ))}
    </>
  );
}

// ── ORNAMENT ───────────────────────────────────────────────────────────────
function Ornament({ w = 300 }) {
  return (
    <svg viewBox={`0 0 ${w} 20`} width="100%" height="20" style={{ maxWidth: w, margin: "0 auto", display: "block" }}>
      <line x1="0" y1="10" x2={w*0.35} y2="10" stroke="#3a2200" strokeWidth="1"/>
      <polygon points={`${w*0.38},10 ${w*0.40},6 ${w*0.42},10 ${w*0.40},14`} fill="#6a4010" opacity="0.8"/>
      <circle cx={w*0.45} cy="10" r="2.5" fill="#8b6014" opacity="0.9"/>
      <polygon points={`${w*0.48},10 ${w*0.50},5 ${w*0.52},10 ${w*0.50},15`} fill="#d4a93a" opacity="0.85"/>
      <circle cx={w*0.55} cy="10" r="2.5" fill="#8b6014" opacity="0.9"/>
      <polygon points={`${w*0.58},10 ${w*0.60},6 ${w*0.62},10 ${w*0.60},14`} fill="#6a4010" opacity="0.8"/>
      <line x1={w*0.65} y1="10" x2={w} y2="10" stroke="#3a2200" strokeWidth="1"/>
    </svg>
  );
}

const PUFF_LYRICS = [
  "🎵 Puff, the magic dragon",
  "lived by the sea 🌊",
  "and frolicked in the autumn mist",
  "in a land called Honah Lee 🎵",
  "♪ Little Jackie Paper",
  "loved that rascal Puff ♫",
  "and brought him strings and sealing wax",
  "and other fancy stuff 🎶",
  "🐉 ...puff... 🐉",
];

// ── DRAGON FLIGHT ──────────────────────────────────────────────────────────
function DragonFlight() {
  const [topPx, setTopPx] = useState(62);
  const [lyrics, setLyrics] = useState([]);
  const singingRef = useRef(false);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    let timeout;
    const schedule = () => {
      const delay = 11000 + Math.random() * 5000;
      timeout = setTimeout(() => {
        setTopPx(20 + Math.floor(Math.random() * 110));
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const sing = () => {
    if (singingRef.current) return;
    singingRef.current = true;
    PUFF_LYRICS.forEach((text, i) => {
      const t = setTimeout(() => {
        const id = Date.now() + i;
        const left = 10 + Math.random() * 70;
        setLyrics(prev => [...prev, { id, text, left }]);
        setTimeout(() => {
          setLyrics(prev => prev.filter(l => l.id !== id));
          if (i === PUFF_LYRICS.length - 1) singingRef.current = false;
        }, 3800);
      }, i * 1500);
      timeoutsRef.current.push(t);
    });
  };

  return (
    <>
      <div className="dragon-track" style={{ top: topPx, transition: "top 3s ease-in-out" }}>
        <div className="dragon-flyer" onClick={sing} style={{ cursor: "pointer", pointerEvents: "auto" }}>
          <Dragon />
        </div>
      </div>
      {lyrics.length > 0 && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 205 }}>
          {lyrics.map(l => (
            <div key={l.id} className="dragon-lyric" style={{ left: `${l.left}%`, top: topPx + 10 }}>
              {l.text}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── CROSSBOW ───────────────────────────────────────────────────────────────
const CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="13" y="8" width="6" height="20" rx="3" fill="#7a4d1e"/><rect x="14" y="8" width="4" height="18" rx="2" fill="#a06930"/><rect x="11" y="25" width="10" height="3" rx="1.5" fill="#5c3a10"/><path d="M4,16 Q16,10 28,16" stroke="#3a2000" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M4,16 Q16,11 28,16" stroke="#7a5a2a" stroke-width="1.5" fill="none" stroke-linecap="round"/><line x1="4" y1="16" x2="16" y2="18" stroke="#d4c098" stroke-width="1.3"/><line x1="28" y1="16" x2="16" y2="18" stroke="#d4c098" stroke-width="1.3"/><rect x="15" y="5" width="2" height="13" rx="1" fill="#5c3a10"/><polygon points="16,0 13,6 19,6" fill="#c8a030"/><path d="M15,17 Q12,15 13,13" fill="#8b2020"/><path d="M17,17 Q20,15 19,13" fill="#8b2020"/></svg>`;

function CrossbowLayer() {
  const [bolts, setBolts] = useState([]);

  useEffect(() => {
    const enc = encodeURIComponent(CURSOR_SVG);
    document.body.style.cursor = `url("data:image/svg+xml,${enc}") 16 0, crosshair`;
    return () => { document.body.style.cursor = ""; };
  }, []);

  useEffect(() => {
    const fire = (e) => {
      if (e.target.closest("button, a, input")) return;
      const id = Date.now() + Math.random();
      const x = e.clientX;
      const y = e.clientY;
      const tx = window.innerWidth * 0.2 + Math.random() * window.innerWidth * 0.6;
      const ty = 20 + Math.random() * 90;
      const dx = tx - x;
      const dy = ty - y;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      setBolts(prev => [...prev, { id, x, y, angle }]);
      setTimeout(() => setBolts(prev => prev.filter(b => b.id !== id)), 650);
    };
    document.addEventListener("click", fire);
    return () => document.removeEventListener("click", fire);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 215 }}>
      {bolts.map(b => (
        <div key={b.id} style={{
          position: "absolute",
          left: b.x - 4,
          top: b.y - 11,
          transform: `rotate(${b.angle}deg)`,
          transformOrigin: "4px 11px",
        }}>
          <div style={{ animation: "boltFly 0.6s ease-in forwards" }}>
            <svg width="8" height="22" viewBox="0 0 8 22" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="2" height="13" rx="1" fill="#7a4d1e"/>
              <polygon points="4,0 2,6 6,6" fill="#c8a030"/>
              <path d="M3,18 Q1,16 2,14" fill="#8b2020"/>
              <path d="M5,18 Q7,16 6,14" fill="#8b2020"/>
              <rect x="3.5" y="18" width="1" height="4" fill="#5c3a10"/>
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [avail, setAvail] = useState({});
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [sessions] = useState(() => getNextSessions(6));
  const [diceValue, setDiceValue] = useState(20);
  const [diceRolling, setDiceRolling] = useState(false);
  const [activeTab, setActiveTab] = useState("sessions");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    storageGet(STORAGE_KEY).then(v => { if (v) setAvail(JSON.parse(v)); });
  }, []);

  const persist = (a) => {
    setAvail(a);
    storageSet(STORAGE_KEY, JSON.stringify(a));
  };

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 3000); };

  const rollDice = (cb) => {
    setDiceRolling(true);
    let t = 0;
    const iv = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 20) + 1);
      if (++t >= 18) { clearInterval(iv); setDiceRolling(false); cb?.(); }
    }, 70);
  };

  const selectPlayer = (name) => {
    const f = FELLOWSHIP.find(x => x.player === name);
    rollDice(() => {
      setCurrentPlayer(name);
      notify(`${f.icon} Hail, ${f.char} the ${f.race} ${f.cls}!`);
      triggerEffect(name);
    });
  };

  const setAvailability = (session, status) => {
    if (!currentPlayer) return;
    persist({ ...avail, [session]: { ...(avail[session] || {}), [currentPlayer]: status } });
  };

  const getStats = (session) => {
    const a = avail[session] || {};
    return {
      yes:     FELLOWSHIP.filter(f => a[f.player] === "yes"),
      maybe:   FELLOWSHIP.filter(f => a[f.player] === "maybe"),
      no:      FELLOWSHIP.filter(f => a[f.player] === "no"),
      unknown: FELLOWSHIP.filter(f => !a[f.player]),
    };
  };

  const getBestSession = () => {
    let best = null, top = -1;
    for (const s of sessions) {
      const { yes, maybe } = getStats(s);
      const dmStatus = avail[s]?.["DM"];
      if (dmStatus === "no") continue; // no DM = no session
      const dmBonus = dmStatus === "yes" ? 3 : dmStatus === "maybe" ? 1 : 0;
      const score = yes.length * 2 + maybe.length + dmBonus;
      if (score > top) { top = score; best = s; }
    }
    return top > 0 ? best : null;
  };

  const getSessionStatus = (session) => {
    const a = avail[session] || {};
    const dmStatus = a["DM"];
    const players = FELLOWSHIP.filter(f => !f.isDM);
    const yesCount = players.filter(f => a[f.player] === "yes").length;
    const notAvailCount = players.filter(f => a[f.player] === "no" || a[f.player] === "maybe").length;
    if (dmStatus === "yes" && yesCount >= 4) return "on";
    if (dmStatus === "no" || notAvailCount > 1) return "off";
    return null;
  };

  const isCrit = diceValue === 20;
  const isFail = diceValue === 1;
  const bestSession = getBestSession();

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

    .app {
      min-height: 100vh;
      background-color: #080604;
      background-image:
        radial-gradient(ellipse 90% 55% at 10% 30%, rgba(55,12,2,0.55) 0%, transparent 60%),
        radial-gradient(ellipse 70% 50% at 90% 15%, rgba(6,22,2,0.4) 0%, transparent 55%),
        radial-gradient(ellipse 60% 60% at 50% 110%, rgba(25,14,0,0.5) 0%, transparent 55%),
        radial-gradient(ellipse 40% 30% at 50% 0%, rgba(60,20,0,0.3) 0%, transparent 50%),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23080604'/%3E%3Crect x='1' y='1' width='38' height='38' fill='none' stroke='%230c0a07' stroke-width='0.5' opacity='0.6'/%3E%3Crect x='41' y='41' width='38' height='38' fill='none' stroke='%230c0a07' stroke-width='0.5' opacity='0.6'/%3E%3Crect x='1' y='41' width='38' height='38' fill='none' stroke='%230a0806' stroke-width='0.5' opacity='0.4'/%3E%3Crect x='41' y='1' width='38' height='38' fill='none' stroke='%230a0806' stroke-width='0.5' opacity='0.4'/%3E%3C/svg%3E");
      font-family: 'Crimson Text', Georgia, serif;
      color: #e8d5a8;
      overflow-x: hidden;
      position: relative;
    }

    /* Vignette overlay */
    .app::before {
      content: '';
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%);
      pointer-events: none;
      z-index: 1;
    }

    /* Ember float animation */
    @keyframes emberFloat {
      0%   { transform: translateY(0) translateX(0) scale(1); opacity:0; }
      10%  { opacity: 0.9; }
      50%  { transform: translateY(-55vh) translateX(15px) scale(0.7); opacity: 0.5; }
      80%  { opacity: 0.2; }
      100% { transform: translateY(-100vh) translateX(-10px) scale(0.3); opacity: 0; }
    }

    /* Dragon track */
    .dragon-track { position:fixed; top:62px; left:0; right:0; height:155px; pointer-events:none; z-index:200; overflow:hidden; }
    @keyframes dragonSweep {
      0%   { transform: translateX(-450px); }
      47%  { transform: translateX(calc(100vw + 450px)); animation-timing-function:step-start; }
      48%  { transform: translateX(calc(100vw + 450px)) scaleX(-1); }
      95%  { transform: translateX(-450px) scaleX(-1); animation-timing-function:step-start; }
      96%  { transform: translateX(-450px); }
      100% { transform: translateX(-450px); }
    }
    .dragon-flyer {
      position:absolute; top:0; left:0; transform-origin:center center;
      animation:dragonSweep 26s linear infinite;
      filter: drop-shadow(0 0 18px rgba(255,120,0,0.6)) drop-shadow(0 0 6px rgba(50,150,10,0.4));
    }

    /* Dragon lyrics */
    @keyframes lyricFloat {
      0%   { opacity:0; transform:translateY(0) scale(0.85); }
      10%  { opacity:1; transform:translateY(-12px) scale(1); }
      75%  { opacity:1; transform:translateY(-90px); }
      100% { opacity:0; transform:translateY(-140px) scale(0.9); }
    }
    .dragon-lyric {
      position: absolute;
      font-family: 'Cinzel', serif;
      font-size: 0.88rem;
      font-weight: 600;
      color: #ffe066;
      text-shadow: 0 0 14px rgba(255,200,0,0.9), 0 0 30px rgba(255,120,0,0.6);
      white-space: nowrap;
      animation: lyricFloat 3.8s ease-out forwards;
    }

    /* Crossbow bolts */
    @keyframes boltFly {
      from { transform: translateY(0);      opacity: 1; }
      to   { transform: translateY(-650px); opacity: 0; }
    }

    /* Torches */
    .torch { position:fixed; font-size:2rem; pointer-events:none; z-index:30; }
    .torch-tl { top:16px; left:18px; }
    .torch-tr { top:16px; right:18px; }
    @keyframes flicker {
      0%,100% { filter:drop-shadow(0 0 10px rgba(255,140,0,1)) drop-shadow(0 0 20px rgba(255,80,0,0.6)); transform:scale(1) rotate(-2deg); }
      20% { filter:drop-shadow(0 0 6px rgba(255,100,0,0.8)); transform:scale(0.93) rotate(3deg); }
      50% { filter:drop-shadow(0 0 14px rgba(255,160,0,1)) drop-shadow(0 0 25px rgba(255,100,0,0.7)); transform:scale(1.07) rotate(-1deg); }
      75% { filter:drop-shadow(0 0 8px rgba(255,120,0,0.9)); transform:scale(0.97) rotate(2deg); }
    }
    .torch { animation:flicker 2.3s ease-in-out infinite; }
    .torch-tr { animation-delay:0.8s; animation-duration:2s; }

    /* ── HEADER ── */
    .header {
      text-align:center;
      padding: 100px 24px 48px;
      position: relative;
      z-index: 2;
    }
    .header-inner {
      position: relative;
      display: inline-block;
      padding: 0 40px;
    }
    .header-border {
      position: absolute;
      inset: -16px -30px;
      border: 1px solid #2a1600;
      border-radius: 2px;
      pointer-events: none;
    }
    .header-border::before {
      content: '';
      position: absolute;
      inset: 4px;
      border: 1px solid #1a0e00;
      border-radius: 1px;
    }
    /* Corner flourishes */
    .header-border::after {
      content: '✦';
      position: absolute;
      top: -8px; left: -8px;
      color: #6a4010;
      font-size: 1rem;
      line-height: 1;
    }
    .title {
      font-family: 'Cinzel Decorative', 'Times New Roman', serif;
      font-size: clamp(1.5rem, 4vw, 3rem);
      font-weight: 900;
      color: #d4a93a;
      text-shadow:
        0 0 28px rgba(212,169,58,0.7),
        0 0 60px rgba(212,169,58,0.3),
        0 0 100px rgba(212,169,58,0.15),
        3px 3px 0 #1e0a00,
        -1px -1px 0 rgba(0,0,0,0.5);
      letter-spacing: 0.03em;
      line-height: 1.2;
    }
    .title-sub {
      font-family: 'Cinzel', serif;
      font-size: 0.75rem;
      color: #6a4c10;
      letter-spacing: 0.45em;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .campaign-badge {
      display: inline-block;
      font-family: 'Cinzel', serif;
      font-size: 0.7rem;
      color: #5a3e0e;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      border: 1px solid #2a1800;
      padding: 3px 12px;
      margin-top: 6px;
      border-radius: 2px;
      background: rgba(0,0,0,0.3);
    }
    .dice-area { display:flex; align-items:center; justify-content:center; gap:20px; margin-top:24px; }
    .dice-btn { background:none; border:none; cursor:pointer; filter:drop-shadow(0 0 6px rgba(200,152,58,0.25)); transition:filter 0.2s,transform 0.2s; line-height:0; }
    .dice-btn:hover { filter:drop-shadow(0 0 20px rgba(200,152,58,0.8)); transform:scale(1.12) rotate(-6deg); }
    @keyframes spin { to { transform:rotate(720deg) scale(0.9); } }
    .dice-btn.rolling svg { animation:spin 1.2s ease-out forwards; }
    .dice-fate { font-family:'Cinzel',serif; font-size:0.76rem; color:#6a5010; max-width:95px; text-align:center; line-height:1.5; }
    .dice-fate.crit { color:#f0d060; text-shadow:0 0 10px rgba(240,208,96,0.7); }
    .dice-fate.fail { color:#dd3333; text-shadow:0 0 8px rgba(220,50,50,0.5); }
    .header-ornament { margin-top:24px; }

    /* ── MAIN ── */
    .main { max-width:880px; margin:0 auto; padding:28px 20px 150px; position:relative; z-index:2; }

    /* ── NOTIFICATION ── */
    @keyframes slideDown { from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)} }
    .notification {
      background: linear-gradient(135deg, #1e1400, #140c00);
      border: 1px solid #d4a93a;
      border-radius: 3px;
      padding: 11px 20px;
      font-family: 'Cinzel', serif;
      font-size: 0.88rem;
      color: #d4a93a;
      text-align: center;
      margin-bottom: 20px;
      animation: slideDown 0.3s ease;
      box-shadow: 0 0 30px rgba(212,169,58,0.18), inset 0 0 20px rgba(0,0,0,0.4);
    }

    /* ── PARCHMENT CARD ── */
    .parchment-card {
      background: linear-gradient(140deg, #1e0f00 0%, #140a00 50%, #0e0700 100%);
      border: 1px solid #2e1800;
      border-radius: 3px;
      position: relative;
      margin-bottom: 28px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,169,58,0.06);
    }
    .parchment-card::before {
      content:'';
      position:absolute;
      inset: 3px;
      border: 1px solid #1e1000;
      border-radius: 2px;
      pointer-events:none;
    }
    .parchment-card-inner { padding: 24px 22px; }
    .card-corners::before { content:'❧'; position:absolute; top:8px; left:12px; color:#5a3a0a; font-size:1rem; }
    .card-corners::after  { content:'❧'; position:absolute; top:8px; right:12px; color:#5a3a0a; font-size:1rem; transform:scaleX(-1); display:inline-block; }
    .card-heading {
      font-family:'Cinzel',serif; font-size:0.8rem; letter-spacing:0.25em;
      text-transform:uppercase; color:#d4a93a; text-align:center; margin-bottom:18px;
    }

    /* ── WHO ART THOU ── */
    .player-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(128px,1fr)); gap:9px; }
    .player-pick-btn {
      background: linear-gradient(155deg, #160900 0%, #0e0600 100%);
      border: 1px solid #261400;
      border-radius: 3px;
      padding: 14px 8px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      position: relative;
    }
    .player-pick-btn::after {
      content: '';
      position: absolute;
      inset: 2px;
      border: 1px solid transparent;
      border-radius: 2px;
      transition: border-color 0.2s;
    }
    .player-pick-btn:hover { border-color:#8b6010; background:linear-gradient(155deg,#201100,#160d00); box-shadow:0 0 20px rgba(212,169,58,0.12); }
    .player-pick-btn:hover::after { border-color:#2e1800; }
    .player-pick-btn.active { border-color:#d4a93a; background:linear-gradient(155deg,#241400,#180f00); box-shadow:0 0 25px rgba(212,169,58,0.2); }
    .player-pick-btn.active::after { border-color:#5a3a10; }
    .pick-icon   { font-size:1.9rem; display:block; margin-bottom:6px; }
    .pick-char   { font-family:'Cinzel',serif; font-size:0.82rem; color:#d4a93a; font-weight:600; display:block; }
    .pick-cls    { font-family:'Cinzel',serif; font-size:0.65rem; color:#6a5018; display:block; margin-top:3px; }
    .pick-player { font-size:0.66rem; color:#4a3810; display:block; margin-top:5px; font-style:italic; }

    /* ── BEST BANNER ── */
    .best-banner {
      background: linear-gradient(135deg, #1e1200, #100900);
      border: 1px solid #4a3010;
      border-radius: 3px;
      padding: 13px 20px;
      margin-bottom: 22px;
      text-align: center;
      box-shadow: 0 0 20px rgba(212,169,58,0.06);
      position: relative;
    }
    .best-banner::before { content:'★'; position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#5a4010; font-size:1rem; }
    .best-banner::after  { content:'★'; position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#5a4010; font-size:1rem; }
    .best-label { font-family:'Cinzel',serif; font-size:0.68rem; letter-spacing:0.22em; text-transform:uppercase; color:#5a4010; }
    .best-date  { font-family:'Cinzel',serif; font-size:1rem; color:#d4a93a; margin-top:4px; }

    /* ── TABS ── */
    .tabs { display:flex; gap:8px; margin-bottom:22px; border-bottom:1px solid #1e1000; padding-bottom:12px; }
    .tab { background:none; border:1px solid transparent; color:#5a4810; font-family:'Cinzel',serif; font-size:0.76rem; letter-spacing:0.14em; text-transform:uppercase; padding:8px 18px; cursor:pointer; border-radius:3px; transition:all 0.2s; }
    .tab:hover { color:#d4a93a; border-color:#2e1800; }
    .tab.on    { color:#d4a93a; border-color:#c8983a; background:rgba(200,152,58,0.07); box-shadow:inset 0 0 15px rgba(200,152,58,0.05); }
    .section-label { font-family:'Cinzel',serif; font-size:0.7rem; letter-spacing:0.24em; text-transform:uppercase; color:#4a3810; margin-bottom:14px; }

    /* ── SESSION CARDS ── */
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
    .session-card {
      background: linear-gradient(150deg, #160900, #0e0700);
      border: 1px solid #1e1000;
      border-radius: 3px;
      margin-bottom: 13px;
      overflow: hidden;
      animation: fadeUp 0.4s ease both;
      transition: border-color 0.2s, box-shadow 0.2s;
      position: relative;
    }
    .session-card::before {
      content:'';
      position:absolute;
      inset:2px;
      border:1px solid #140900;
      border-radius:2px;
      pointer-events:none;
    }
    .session-card:hover { border-color:#3a2000; box-shadow:0 6px 30px rgba(0,0,0,0.5); }
    .session-card.best { border-color:#5a3a10; box-shadow:0 0 25px rgba(212,169,58,0.1); }
    .session-card.status-on  { border-color:#50a832; box-shadow:0 0 30px rgba(80,168,50,0.25); }
    .session-card.status-off { border-color:#be2020; box-shadow:0 0 30px rgba(190,32,32,0.2); }
    @keyframes statusPulse { 0%,100%{opacity:1} 50%{opacity:0.75} }
    .session-status-banner {
      padding: 11px 18px;
      text-align: center;
      font-family: 'Cinzel Decorative', serif;
      font-size: 1.05rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      animation: statusPulse 2s ease-in-out infinite;
    }
    .session-status-banner.on {
      background: linear-gradient(135deg, #061a02, #0a2604);
      color: #6acc44;
      text-shadow: 0 0 18px rgba(80,200,50,0.8), 0 0 40px rgba(80,200,50,0.4);
      border-bottom: 1px solid #1a4d0e;
    }
    .session-status-banner.off {
      background: linear-gradient(135deg, #1a0000, #0e0000);
      color: #e83838;
      text-shadow: 0 0 16px rgba(220,50,50,0.8), 0 0 35px rgba(220,50,50,0.4);
      border-bottom: 1px solid #4a0a0a;
    }
    .session-head { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid #180e00; flex-wrap:wrap; gap:8px; }
    .session-date-col { display:flex; flex-direction:column; gap:2px; }
    .session-date { font-family:'Cinzel',serif; font-size:0.95rem; color:#d4a93a; }
    .best-tag     { font-size:0.64rem; color:#8b6914; font-family:'Cinzel',serif; letter-spacing:0.08em; }
    .session-tally{ font-size:0.8rem; color:#4a3810; }
    .avail-row    { display:flex; gap:8px; padding:13px 18px; flex-wrap:wrap; }
    .avail-btn    { flex:1; min-width:88px; padding:9px 10px; border-radius:3px; border:1px solid; background:none; cursor:pointer; font-family:'Crimson Text',serif; font-size:0.92rem; text-align:center; transition:all 0.15s; }
    .avail-btn.yes         { color:#3d8826; border-color:#1a3e0e; }
    .avail-btn.yes:hover,
    .avail-btn.yes.on      { background:#071604; border-color:#50a832; color:#6acc44; box-shadow:0 0 14px rgba(80,168,50,0.2),inset 0 0 10px rgba(80,168,50,0.05); }
    .avail-btn.maybe       { color:#a87a0a; border-color:#4e3400; }
    .avail-btn.maybe:hover,
    .avail-btn.maybe.on    { background:#120d00; border-color:#c8983a; color:#e8c040; box-shadow:0 0 14px rgba(200,152,58,0.2),inset 0 0 10px rgba(200,152,58,0.05); }
    .avail-btn.no          { color:#7a1212; border-color:#360a0a; }
    .avail-btn.no:hover,
    .avail-btn.no.on       { background:#140000; border-color:#be2020; color:#e83838; box-shadow:0 0 14px rgba(190,32,32,0.2),inset 0 0 10px rgba(190,32,32,0.05); }
    .no-player-hint { font-style:italic; color:#3e2c0a; font-size:0.88rem; padding:8px 18px 14px; text-align:center; }
    .badges { display:flex; flex-wrap:wrap; gap:5px; padding:10px 18px 15px; border-top:1px solid #140a00; }
    .badge  { padding:3px 11px; border-radius:12px; font-size:0.74rem; border:1px solid; }
    .badge.y { background:#061404; border-color:#1a3e0e; color:#6acc44; }
    .badge.m { background:#120d00; border-color:#4e3400; color:#e8c040; }
    .badge.n { background:#140000; border-color:#360a0a; color:#e83838; }
    .badge.u { background:#140e00; border-color:#261800; color:#4a3818; }

    /* ── PARTY TAB ── */
    .party-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(205px,1fr)); gap:12px; }
    .party-card {
      background: linear-gradient(150deg, #160900, #0e0700);
      border: 1px solid #1e1000; border-radius: 3px; padding: 18px;
      animation: fadeUp 0.35s ease both; transition: border-color 0.2s;
      position: relative;
    }
    .party-card::before { content:''; position:absolute; inset:3px; border:1px solid #140900; border-radius:2px; pointer-events:none; }
    .party-card:hover { border-color:#3a2000; }
    .party-icon   { font-size:2.4rem; margin-bottom:8px; filter:drop-shadow(0 0 8px rgba(212,169,58,0.3)); }
    .party-char   { font-family:'Cinzel',serif; font-size:1.05rem; color:#d4a93a; font-weight:600; }
    .party-meta   { font-family:'Cinzel',serif; font-size:0.68rem; color:#7a5a1a; margin-top:3px; }
    .party-player { font-size:0.78rem; color:#4a3810; margin-top:7px; font-style:italic; }
    .party-deity  { font-size:0.7rem; color:#3a2c0a; margin-top:3px; }
    .pav-list     { margin-top:12px; display:flex; flex-direction:column; gap:5px; border-top:1px solid #1a0e00; padding-top:10px; }
    .pav-row      { display:flex; align-items:center; gap:8px; font-size:0.72rem; }
    .pav-dot      { width:6px; height:6px; border-radius:50%; flex-shrink:0; box-shadow:0 0 4px currentColor; }
    .pav-dot.y    { background:#50a832; color:#50a832; }
    .pav-dot.m    { background:#c8983a; color:#c8983a; }
    .pav-dot.n    { background:#be2020; color:#be2020; }
    .pav-dot.u    { background:#261800; color:#261800; box-shadow:none; }

    /* ── FOOTER ── */
    .footer { position:fixed; bottom:0; left:0; right:0; display:flex; justify-content:space-between; align-items:flex-end; pointer-events:none; z-index:50; padding:0 20px; }
    .footer-center { text-align:center; font-family:'Cinzel',serif; font-size:0.6rem; letter-spacing:0.25em; color:#221200; text-transform:uppercase; padding-bottom:10px; }
    /* DM card special styling */
    .player-pick-btn.dm-btn {
      border-color: #4a0080;
      background: linear-gradient(155deg, #1a0030 0%, #0e0020 100%);
      grid-column: 1 / -1;
    }
    .player-pick-btn.dm-btn:hover { border-color:#aa44ff; background:linear-gradient(155deg,#280050,#18003a); box-shadow:0 0 25px rgba(150,50,255,0.25); }
    .player-pick-btn.dm-btn.active { border-color:#cc66ff; background:linear-gradient(155deg,#300060,#1e004a); box-shadow:0 0 30px rgba(180,80,255,0.3); }
    .dm-char { font-family:'Cinzel',serif; font-size:0.9rem; color:#cc66ff; font-weight:600; display:block; }
    .dm-cls  { font-family:'Cinzel',serif; font-size:0.65rem; color:#7a2aaa; display:block; margin-top:3px; }
    /* DM effect */
    @keyframes eyePulse { 0%{opacity:0;transform:translate(-50%,-50%) scale(0)} 25%{opacity:1;transform:translate(-50%,-50%) scale(1.2)} 45%{transform:translate(-50%,-50%) scale(1)} 80%{opacity:1} 100%{opacity:0;transform:translate(-50%,-50%) scale(0.8)} }
    @keyframes diceOrbit { 0%{opacity:0;transform:translate(-50%,-50%) rotate(var(--startRot)) translateX(var(--radius)) scale(0)} 20%{opacity:1;transform:translate(-50%,-50%) rotate(calc(var(--startRot) + 60deg)) translateX(var(--radius)) scale(1)} 80%{opacity:1;transform:translate(-50%,-50%) rotate(calc(var(--startRot) + 300deg)) translateX(var(--radius)) scale(1)} 100%{opacity:0;transform:translate(-50%,-50%) rotate(calc(var(--startRot) + 360deg)) translateX(var(--radius)) scale(0)} }
    @keyframes dmOverlay { 0%{opacity:0} 15%{opacity:0.7} 75%{opacity:0.6} 100%{opacity:0} }
    @keyframes dmText2 { 0%,30%{opacity:0;transform:translate(-50%,-50%)} 45%{opacity:1;transform:translate(-50%,-50%)} 80%{opacity:1} 100%{opacity:0;transform:translate(-50%,-50%)} }
    /* Party tab DM card */
    .party-card.dm-card { border-color:#3a0060; background:linear-gradient(150deg,#1a0030,#0e001e); }
    .party-card.dm-card:hover { border-color:#8833cc; }
    .dm-party-char { color:#cc66ff !important; }
    .dm-party-meta { color:#6a1aaa !important; }

    @keyframes effectText {
      0%  { opacity:0; transform:translate(-50%,-50%) scale(0.4); }
      18% { opacity:1; transform:translate(-50%,-50%) scale(1.1); }
      28% { transform:translate(-50%,-50%) scale(1); }
      75% { opacity:1; }
      100%{ opacity:0; transform:translate(-50%,-50%) scale(0.85); }
    }
    @keyframes effectSub {
      0%  { opacity:0; transform:translate(-50%,-50%); }
      100%{ opacity:0; transform:translate(-50%,-50%); }
      20% { opacity:0; }
      35% { opacity:1; }
      78% { opacity:1; }
    }
    /* Kim - Explosion */
    @keyframes exploFlash { 0%{opacity:0.85} 40%{opacity:0.5} 100%{opacity:0} }
    @keyframes chemParticle { 0%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0.1)} }
    @keyframes smokeCloud   { 0%{opacity:0.7;transform:translate(-50%,-50%) scale(0)} 55%{opacity:0.4} 100%{opacity:0;transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(2.2)} }
    @keyframes bigEmojiPop  { 0%{opacity:0;transform:translate(-50%,-50%) scale(0)} 18%{opacity:1;transform:translate(-50%,-50%) scale(1.4)} 30%{transform:translate(-50%,-50%) scale(1)} 78%{opacity:1} 100%{opacity:0} }
    /* Mads - Smoke */
    @keyframes smokeDark { 0%{opacity:0} 12%{opacity:0.78} 68%{opacity:0.65} 100%{opacity:0} }
    @keyframes smokePuff { 0%{opacity:0.85;transform:translate(-50%,-50%) scale(0.08)} 100%{opacity:0;transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(2.5)} }
    @keyframes foxAppear { 0%,28%{opacity:0;transform:translate(-50%,-50%) scale(0)} 45%{opacity:1;transform:translate(-50%,-50%) scale(1.3)} 60%{transform:translate(-50%,-50%) scale(1)} 82%{opacity:1} 100%{opacity:0;transform:translate(-50%,-50%) scale(1.6)} }
    /* Tobbi - Bardic */
    @keyframes spotLight { 0%{opacity:0} 18%{opacity:1} 80%{opacity:0.85} 100%{opacity:0} }
    @keyframes noteFloat  { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)} 15%{opacity:1;transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(1.1)} 100%{opacity:0;transform:translate(calc(-50% + var(--tx) + 30px),calc(-50% + var(--ty) - 120px)) scale(0.6)} }
    @keyframes starTwinkle{ 0%{opacity:0;transform:translate(-50%,-50%) scale(0) rotate(0deg)} 30%{opacity:1;transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(1) rotate(180deg)} 100%{opacity:0;transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty) - 60px)) scale(0) rotate(360deg)} }
    /* Sigurd - Divine */
    @keyframes divineFlash { 0%{opacity:0} 15%{opacity:1} 55%{opacity:0.65} 100%{opacity:0} }
    @keyframes divineRay   { 0%{opacity:0;transform:rotate(var(--rot)) scaleX(0)} 28%{opacity:0.9;transform:rotate(var(--rot)) scaleX(1)} 100%{opacity:0;transform:rotate(var(--rot)) scaleX(1.5)} }
    @keyframes sunGrow     { 0%{opacity:0;transform:translate(-50%,-50%) scale(0)} 22%{opacity:1;transform:translate(-50%,-50%) scale(1.4)} 45%{transform:translate(-50%,-50%) scale(1)} 80%{opacity:1} 100%{opacity:0;transform:translate(-50%,-50%) scale(2)} }
    @keyframes holyParticle{ 0%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0)} }
    /* Gee - Quake */
    @keyframes quakeShake  { 0%,100%{transform:translateX(0) translateY(0)} 8%{transform:translateX(-12px) translateY(-6px)} 16%{transform:translateX(12px) translateY(5px)} 24%{transform:translateX(-9px) translateY(4px)} 32%{transform:translateX(9px) translateY(-4px)} 40%{transform:translateX(-6px) translateY(6px)} 48%{transform:translateX(6px) translateY(-6px)} 56%{transform:translateX(-4px) translateY(3px)} 64%{transform:translateX(4px) translateY(-3px)} 72%{transform:translateX(-2px) translateY(2px)} 80%{transform:translateX(2px) translateY(-2px)} }
    @keyframes quakeFlash  { 0%{opacity:0.55} 100%{opacity:0} }
    .app.shaking { animation: quakeShake 0.75s ease-out; }
  `;

  // ── CHARACTER EFFECTS ───────────────────────────────────────────────────
  function ExplosionEffect() {
    const particles = useMemo(() => Array.from({ length: 32 }, (_, i) => {
      const angle = (i / 32) * 360 + (Math.random() - 0.5) * 10;
      const dist = 90 + Math.random() * 170;
      const rad = angle * Math.PI / 180;
      const colors = ['#44ff00','#bb00ff','#ff8800','#ffff00','#00ffcc','#ff4400','#cc00ff','#88ff22'];
      return { color: colors[i % colors.length], size: 7 + Math.random() * 17, delay: Math.random() * 0.18, tx: Math.cos(rad) * dist, ty: Math.sin(rad) * dist, dur: 0.65 + Math.random() * 0.45 };
    }), []);
    const clouds = useMemo(() => [0,60,120,180,240,300].map(a => { const r = a*Math.PI/180; return { tx: Math.cos(r)*70, ty: Math.sin(r)*70 }; }), []);
    const S = { position:'absolute', left:'50%', top:'50%' };
    return (
      <div style={{position:'fixed',inset:0,zIndex:1000,pointerEvents:'none',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 50% 50%, rgba(255,200,50,0.65) 0%, rgba(255,100,0,0.35) 25%, transparent 60%)',animation:'exploFlash 0.85s ease-out forwards'}}/>
        {particles.map((p,i) => <div key={i} style={{...S,width:p.size,height:p.size,borderRadius:'50%',background:p.color,boxShadow:`0 0 ${p.size*1.8}px ${p.color}`,'--tx':`${p.tx}px`,'--ty':`${p.ty}px`,animation:`chemParticle ${p.dur}s ease-out ${p.delay}s forwards`}}/>)}
        {clouds.map((c,i) => <div key={`c${i}`} style={{...S,width:55,height:55,borderRadius:'50%',background:i%2===0?'rgba(80,255,40,0.38)':'rgba(170,40,255,0.32)',filter:'blur(10px)','--tx':`${c.tx}px`,'--ty':`${c.ty}px`,animation:`smokeCloud 1.3s ease-out ${i*0.09}s forwards`}}/>)}
        <div style={{...S,fontSize:'4.5rem',animation:'bigEmojiPop 2.5s ease-out forwards'}}>💥</div>
        <div style={{position:'absolute',left:'50%',top:'28%',fontFamily:"'Cinzel Decorative',serif",fontSize:'2.2rem',color:'#ffcc00',textShadow:'0 0 25px #ff8800,0 0 50px #ff4400,3px 3px 0 #330000',animation:'effectText 2.5s ease-out forwards',whiteSpace:'nowrap',transform:'translate(-50%,-50%)'}}>💥 KABOOM! 💥</div>
        <div style={{position:'absolute',left:'50%',top:'37%',fontFamily:"'Cinzel',serif",fontSize:'0.95rem',color:'#88ff44',textShadow:'0 0 12px #44ff00',animation:'effectText 2.5s ease-out 0.25s forwards',whiteSpace:'nowrap',transform:'translate(-50%,-50%)',opacity:0}}>Aryan's Alchemical Arsenal!</div>
      </div>
    );
  }

  function SmokeBombEffect() {
    const puffs = useMemo(() => Array.from({length:9},(_,i)=>({ tx:(Math.random()-0.5)*220, ty:(Math.random()-0.5)*160, size:55+Math.random()*110, delay:Math.random()*0.35, gray:55+Math.floor(Math.random()*65) })),[]);
    const S = { position:'absolute', left:'50%', top:'50%' };
    return (
      <div style={{position:'fixed',inset:0,zIndex:1000,pointerEvents:'none',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.8)',animation:'smokeDark 2.8s ease-out forwards'}}/>
        {puffs.map((p,i) => <div key={i} style={{...S,width:p.size,height:p.size,borderRadius:'50%',background:`rgba(${p.gray},${p.gray},${p.gray},0.55)`,filter:'blur(12px)','--tx':`${p.tx}px`,'--ty':`${p.ty}px`,animation:`smokePuff 1.6s ease-out ${p.delay}s forwards`}}/>)}
        <div style={{...S,fontSize:'5.5rem',animation:'foxAppear 2.8s ease-out forwards'}}>🦊</div>
        <div style={{position:'absolute',left:'50%',top:'32%',fontFamily:"'Cinzel Decorative',serif",fontSize:'2.2rem',color:'#aaaaaa',textShadow:'0 0 20px rgba(200,200,200,0.5)',animation:'effectText 2.8s ease-out forwards',whiteSpace:'nowrap',transform:'translate(-50%,-50%)'}}>...poof</div>
        <div style={{position:'absolute',left:'50%',top:'41%',fontFamily:"'Cinzel',serif",fontSize:'0.95rem',color:'#888',animation:'effectText 2.8s ease-out 0.3s forwards',whiteSpace:'nowrap',transform:'translate(-50%,-50%)',opacity:0}}>Aki has vanished into the shadows!</div>
      </div>
    );
  }

  function BardicEffect() {
    const notes = useMemo(() => {
      const chars = ['♩','♪','♫','♬','🎵','🎶','♩','♪'];
      return Array.from({length:22},(_,i) => ({ char:chars[i%chars.length], left:`${4+(i*4.2)%90}%`, color:`hsl(${(i*41)%360},90%,65%)`, size:1.1+Math.random()*1.8, delay:Math.random()*0.9, dur:1.4+Math.random()*1.1, tx:(Math.random()-0.5)*90, ty:-(140+Math.random()*100) }));
    },[]);
    const stars = useMemo(()=>Array.from({length:12},(_,i)=>({ tx:(Math.random()-0.5)*300, ty:(Math.random()-0.5)*200, delay:Math.random()*0.6 })),[]);
    return (
      <div style={{position:'fixed',inset:0,zIndex:1000,pointerEvents:'none',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:'65%',height:'100%',background:'linear-gradient(180deg,rgba(255,220,100,0.28) 0%,transparent 65%)',animation:'spotLight 2.8s ease-out forwards',clipPath:'polygon(18% 0%,82% 0%,115% 100%,-15% 100%)'}}/>
        {notes.map((n,i)=><div key={i} style={{position:'absolute',left:n.left,top:'82%',fontSize:`${n.size}rem`,color:n.color,textShadow:`0 0 12px ${n.color}`,'--tx':`${n.tx}px`,'--ty':`${n.ty}px`,animation:`noteFloat ${n.dur}s ease-out ${n.delay}s forwards`,opacity:0}}>{n.char}</div>)}
        {stars.map((s,i)=><div key={`s${i}`} style={{position:'absolute',left:'50%',top:'50%',fontSize:'1.2rem','--tx':`${s.tx}px`,'--ty':`${s.ty}px`,animation:`starTwinkle 1.8s ease-out ${s.delay}s forwards`,opacity:0}}>✦</div>)}
        <div style={{position:'absolute',left:'50%',top:'28%',fontFamily:"'Cinzel Decorative',serif",fontSize:'1.7rem',color:'#ffee44',textShadow:'0 0 25px #ffaa00,0 0 50px #ff8800',animation:'effectText 2.8s ease-out forwards',whiteSpace:'nowrap',transform:'translate(-50%,-50%)',textAlign:'center'}}>♪ BARDIC INSPIRATION! ♪</div>
        <div style={{position:'absolute',left:'50%',top:'37%',fontFamily:"'Cinzel',serif",fontSize:'0.95rem',color:'#ffcc66',animation:'effectText 2.8s ease-out 0.25s forwards',whiteSpace:'nowrap',transform:'translate(-50%,-50%)',opacity:0}}>Bunnon takes the stage!</div>
      </div>
    );
  }

  function DivineEffect() {
    const rays = [0,45,90,135,180,225,270,315];
    const holy = useMemo(()=>Array.from({length:20},(_,i)=>{ const a=(i/20)*360*Math.PI/180; const d=60+Math.random()*140; return { tx:Math.cos(a)*d, ty:Math.sin(a)*d, delay:Math.random()*0.2, size:6+Math.random()*10 }; }),[]);
    const S = { position:'absolute', left:'50%', top:'50%' };
    return (
      <div style={{position:'fixed',inset:0,zIndex:1000,pointerEvents:'none',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 50%, rgba(255,240,180,0.95) 0%, rgba(255,200,50,0.5) 28%, transparent 65%)',animation:'divineFlash 1.6s ease-out forwards'}}/>
        {rays.map((rot,i)=><div key={i} style={{position:'absolute',left:'50%',top:'50%',width:'55vw',height:'6px',marginTop:'-3px',background:'linear-gradient(90deg,rgba(255,220,50,0.95) 0%,transparent 100%)',transformOrigin:'left center','--rot':`${rot}deg`,animation:`divineRay 2s ease-out ${i*0.045}s forwards`,borderRadius:'0 3px 3px 0',boxShadow:'0 0 14px rgba(255,200,50,0.7)'}}/>)}
        {holy.map((h,i)=><div key={`h${i}`} style={{...S,width:h.size,height:h.size,borderRadius:'50%',background:'rgba(255,220,80,0.9)',boxShadow:'0 0 10px rgba(255,200,50,0.8)','--tx':`${h.tx}px`,'--ty':`${h.ty}px`,animation:`holyParticle 1.2s ease-out ${h.delay}s forwards`}}/>)}
        <div style={{...S,fontSize:'5rem',animation:'sunGrow 2.8s ease-out forwards'}}>☀️</div>
        <div style={{position:'absolute',left:'50%',top:'27%',fontFamily:"'Cinzel Decorative',serif",fontSize:'1.75rem',color:'#ffe066',textShadow:'0 0 28px #ff8800,0 0 55px #ffaa00,3px 3px 0 rgba(80,40,0,0.6)',animation:'effectText 2.8s ease-out forwards',whiteSpace:'nowrap',transform:'translate(-50%,-50%)',textAlign:'center'}}>🌟 PRAISE SARENRAE! 🌟</div>
        <div style={{position:'absolute',left:'50%',top:'36%',fontFamily:"'Cinzel',serif",fontSize:'0.95rem',color:'#ffd966',animation:'effectText 2.8s ease-out 0.28s forwards',whiteSpace:'nowrap',transform:'translate(-50%,-50%)',opacity:0}}>Baz channels divine fire!</div>
      </div>
    );
  }

  function QuakeEffect() {
    const debris = useMemo(()=>Array.from({length:22},(_,i)=>({ tx:(Math.random()-0.5)*380, ty:-(80+Math.random()*280), size:7+Math.random()*18, color:['#6b5a3a','#8b7a5a','#4a3a2a','#9a8a6a','#5a4a2a'][i%5], delay:Math.random()*0.35, left:`${8+Math.random()*84}%` })),[]);
    return (
      <div style={{position:'fixed',inset:0,zIndex:1000,pointerEvents:'none',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'rgba(70,45,15,0.45)',animation:'quakeFlash 0.4s ease-out forwards'}}/>
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',animation:'crackDraw 2.8s ease-out forwards',strokeDasharray:300}} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M50,100 L47,80 L53,63 L44,47 L56,33 L47,18 L51,0" stroke="#9a8a6a" strokeWidth="0.6" fill="none" opacity="0.8"/>
          <path d="M53,63 L64,55 L72,52" stroke="#9a8a6a" strokeWidth="0.35" fill="none" opacity="0.6"/>
          <path d="M47,80 L37,73 L30,70" stroke="#9a8a6a" strokeWidth="0.35" fill="none" opacity="0.6"/>
          <path d="M44,47 L33,41 L25,38" stroke="#9a8a6a" strokeWidth="0.35" fill="none" opacity="0.5"/>
          <path d="M56,33 L67,27 L75,24" stroke="#9a8a6a" strokeWidth="0.35" fill="none" opacity="0.5"/>
        </svg>
        {debris.map((d,i)=><div key={i} style={{position:'absolute',bottom:'5%',left:d.left,width:d.size,height:d.size,background:d.color,borderRadius:'2px',boxShadow:'0 0 5px rgba(0,0,0,0.5)','--tx':`${d.tx}px`,'--ty':`${d.ty}px`,animation:`debrisFly 1.2s ease-out ${d.delay}s forwards`}}/>)}
        <div style={{position:'absolute',left:'50%',top:'30%',fontFamily:"'Cinzel Decorative',serif",fontSize:'3rem',color:'#c8a060',textShadow:'0 0 22px rgba(200,160,80,0.85),0 0 45px rgba(150,100,30,0.5),4px 4px 0 rgba(0,0,0,0.6)',animation:'effectText 2.8s ease-out forwards',whiteSpace:'nowrap',transform:'translate(-50%,-50%)'}}>⚒️ THOOM! ⚒️</div>
        <div style={{position:'absolute',left:'50%',top:'40%',fontFamily:"'Cinzel',serif",fontSize:'0.95rem',color:'#a08050',animation:'effectText 2.8s ease-out 0.3s forwards',whiteSpace:'nowrap',transform:'translate(-50%,-50%)',opacity:0}}>The earth trembles before Gruurd!</div>
      </div>
    );
  }

  function DMEffect() {
    const diceFaces = ['⚀','⚁','⚂','⚃','⚄','⚅','4','8','12','20'];
    const orbiters = useMemo(() => Array.from({length:10}, (_, i) => ({
      face: diceFaces[i % diceFaces.length],
      startRot: i * 36,
      radius: 80 + (i % 3) * 55,
      delay: i * 0.08,
      color: `hsl(${270 + i * 15}, 80%, ${55 + i * 3}%)`,
      size: 1.4 + (i % 3) * 0.5,
    })), []);
    const floaters = useMemo(() => [
      "Roll for Initiative", "No, you can't do that", "The DM smiles...",
      "Perception check!", "That's... not in the rules", "Roll Insight",
      "The door is locked", "Are you sure?", "Natural 1",
    ].map((t, i) => ({ text: t, left: `${5 + i * 10}%`, delay: i * 0.15, dur: 1.8 + i * 0.1, ty: -(100 + i * 30) })), []);
    return (
      <div style={{position:'fixed',inset:0,zIndex:1000,pointerEvents:'none',overflow:'hidden'}}>
        {/* Dark purple overlay */}
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 50%, rgba(80,0,140,0.75) 0%, rgba(20,0,50,0.85) 60%, rgba(0,0,0,0.9) 100%)',animation:'dmOverlay 3s ease-out forwards'}}/>
        {/* The Eye */}
        <div style={{position:'absolute',left:'50%',top:'50%',fontSize:'7rem',animation:'eyePulse 3s ease-out forwards',filter:'drop-shadow(0 0 30px rgba(180,80,255,0.9)) drop-shadow(0 0 60px rgba(120,0,200,0.6))'}}>👁️</div>
        {/* Orbiting dice */}
        {orbiters.map((o,i) => (
          <div key={i} style={{position:'absolute',left:'50%',top:'50%',fontSize:`${o.size}rem`,color:o.color,textShadow:`0 0 10px ${o.color}`,'--startRot':`${o.startRot}deg`,'--radius':`${o.radius}px`,animation:`diceOrbit 2.8s ease-in-out ${o.delay}s forwards`}}>
            {o.face}
          </div>
        ))}
        {/* Floating DM phrases */}
        {floaters.map((f,i) => (
          <div key={i} style={{position:'absolute',left:f.left,top:'75%',fontFamily:"'Cinzel',serif",fontSize:'0.65rem',color:`hsl(${270+i*8},70%,65%)`,textShadow:'0 0 8px rgba(150,50,255,0.6)','--tx':'0px','--ty':`${f.ty}px`,animation:`noteFloat ${f.dur}s ease-out ${f.delay}s forwards`,opacity:0,whiteSpace:'nowrap'}}>
            {f.text}
          </div>
        ))}
        {/* Main text */}
        <div style={{position:'absolute',left:'50%',top:'22%',fontFamily:"'Cinzel Decorative',serif",fontSize:'1.9rem',color:'#cc66ff',textShadow:'0 0 25px rgba(180,80,255,0.9),0 0 55px rgba(120,0,200,0.6),3px 3px 0 #1a0030',animation:'effectText 3s ease-out forwards',whiteSpace:'nowrap',transform:'translate(-50%,-50%)',textAlign:'center'}}>
          👁️ THE DM SEES ALL 👁️
        </div>
        <div style={{position:'absolute',left:'50%',top:'31%',fontFamily:"'Cinzel',serif",fontSize:'0.9rem',color:'#9944cc',animation:'dmText2 3s ease-out forwards',whiteSpace:'nowrap',transform:'translate(-50%,-50%)',opacity:0}}>
          No plan survives contact with the DM
        </div>
      </div>
    );
  }

  function EffectOverlay({ player }) {
    if (player === "Kim")    return <ExplosionEffect />;
    if (player === "Mads")   return <SmokeBombEffect />;
    if (player === "Tobbi")  return <BardicEffect />;
    if (player === "Sigurd") return <DivineEffect />;
    if (player === "Gee")    return <QuakeEffect />;
    if (player === "DM")     return <DMEffect />;
    return null;
  }
  // ────────────────────────────────────────────────────────────────────────

  const [activeEffect, setActiveEffect] = useState(null);
  const [shaking, setShaking] = useState(false);

  const triggerEffect = (name) => {
    setActiveEffect(name);
    if (name === "Gee") {
      setShaking(true);
      setTimeout(() => setShaking(false), 800);
    }
    setTimeout(() => setActiveEffect(null), 3200);
  };

  return (
    <div className={`app${shaking ? " shaking" : ""}`}>
      <style>{css}</style>
      {activeEffect && <EffectOverlay player={activeEffect} />}
      <CrossbowLayer />
      <Embers />
      <div className="torch torch-tl">🔥</div>
      <div className="torch torch-tr">🔥</div>

      <DragonFlight />

      <header className="header">
        <div className="header-inner">
          <div className="header-border"/>
          <div className="title">Sorry, looks like<br/>something went wrong.</div>
          <div className="title-sub">The Party · Mummy's Mask</div>
          <div className="campaign-badge">⚔ Quest Planner & Muster Roll ⚔</div>
          <div className="dice-area">
            <button className={`dice-btn${diceRolling?" rolling":""}`} onClick={() => rollDice()} title="Roll for fate!">
              <D20 size={54} value={diceValue}/>
            </button>
            <div className={`dice-fate${isCrit?" crit":isFail?" fail":""}`}>
              {diceRolling ? "Rolling..." : isCrit ? "⚡ NAT 20!" : isFail ? "💀 Crit Fail!" : `Rolled: ${diceValue}`}
            </div>
            <button className={`dice-btn${diceRolling?" rolling":""}`} onClick={() => rollDice()} title="Roll again!">
              <D20 size={42} value={Math.max(1,(diceValue%6)+1)}/>
            </button>
          </div>
          <div className="header-ornament"><Ornament w={320}/></div>
        </div>
      </header>

      <div className="main">
        {notification && <div className="notification">{notification}</div>}

        <div className="parchment-card card-corners">
          <div className="parchment-card-inner">
            <div className="card-heading">⚔ Who art thou, adventurer? ⚔</div>
            <div className="player-grid">
              {FELLOWSHIP.map(f => (
                <button key={f.player} className={`player-pick-btn${currentPlayer===f.player?" active":""}${f.isDM?" dm-btn":""}`} onClick={() => selectPlayer(f.player)}>
                  <span className="pick-icon">{f.icon}</span>
                  <span className={f.isDM?"dm-char":"pick-char"}>{f.char}</span>
                  <span className={f.isDM?"dm-cls":"pick-cls"}>{f.isDM ? f.cls : `${f.race} · ${f.cls}`}</span>
                  {!f.isDM && <span className="pick-player">{f.player}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab${activeTab==="sessions"?" on":""}`} onClick={() => setActiveTab("sessions")}>📅 Sessions</button>
          <button className={`tab${activeTab==="party"?" on":""}`} onClick={() => setActiveTab("party")}>⚔️ The Party</button>
        </div>

        {activeTab === "sessions" && (
          <>
            {bestSession && (
              <div className="best-banner">
                <div className="best-label">Best candidate date</div>
                <div className="best-date">{formatDate(bestSession)}</div>
              </div>
            )}
            <div className="section-label">🐉 Upcoming Bi-weekly Gatherings</div>
            {sessions.map((s, i) => {
              const stats = getStats(s);
              const mine = avail[s]?.[currentPlayer];
              const isBest = s === bestSession;
              const status = getSessionStatus(s);
              return (
                <div className={`session-card${isBest?" best":""}${status?" status-"+status:""}`} key={s} style={{animationDelay:`${i*0.07}s`}}>
                  {status === "on"  && <div className="session-status-banner on">⚔️ IT'S ON! ⚔️</div>}
                  {status === "off" && <div className="session-status-banner off">💀 GAME OVER 💀</div>}
                  <div className="session-head">
                    <div className="session-date-col">
                      <span className="session-date">{formatDate(s)}</span>
                      {isBest && <span className="best-tag">★ Most adventurers available</span>}
                    </div>
                    <div className="session-tally">⚔️ {stats.yes.length} · 🤔 {stats.maybe.length} · 💀 {stats.no.length} · ❓ {stats.unknown.length}</div>
                  </div>
                  {currentPlayer ? (
                    <div className="avail-row">
                      {[["yes","⚔️ Ready for Battle!"],["maybe","🤔 Perhaps..."],["no","💀 Cannot Come"]].map(([st,label]) => (
                        <button key={st} className={`avail-btn ${st}${mine===st?" on":""}`} onClick={() => setAvailability(s, st)}>{label}</button>
                      ))}
                    </div>
                  ) : (
                    <div className="no-player-hint">☝️ Select thy character above to mark availability</div>
                  )}
                  <div className="badges">
                    {stats.yes.map(f     => <span key={f.player} className="badge y">{f.icon} {f.char}</span>)}
                    {stats.maybe.map(f   => <span key={f.player} className="badge m">{f.icon} {f.char}</span>)}
                    {stats.no.map(f      => <span key={f.player} className="badge n">{f.icon} {f.char}</span>)}
                    {stats.unknown.map(f => <span key={f.player} className="badge u">{f.icon} {f.char}</span>)}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {activeTab === "party" && (
          <>
            <div className="section-label">⚔ The Party — Mummy's Mask</div>
            <div className="party-grid">
              {FELLOWSHIP.map((f, i) => {
                const myAvail = sessions.map(s => ({ s, v: avail[s]?.[f.player] }));
                return (
                  <div className={`party-card${f.isDM?" dm-card":""}`} key={f.player} style={{animationDelay:`${i*0.07}s`}}>
                    <div className="party-icon" style={f.isDM?{filter:'drop-shadow(0 0 12px rgba(180,80,255,0.7))'}:{}}>{f.icon}</div>
                    <div className={`party-char${f.isDM?" dm-party-char":""}`}>{f.char}</div>
                    <div className={`party-meta${f.isDM?" dm-party-meta":""}`}>{f.isDM ? f.cls : `${f.race} · ${f.cls}`}</div>
                    {!f.isDM && <div className="party-player">played by {f.player}</div>}
                    {f.deity && <div className="party-deity">🙏 {f.deity}</div>}
                    <div className="pav-list">
                      {myAvail.slice(0, 4).map(({ s, v }) => (
                        <div className="pav-row" key={s}>
                          <div className={`pav-dot ${v==="yes"?"y":v==="maybe"?"m":v==="no"?"n":"u"}`}/>
                          <span style={{color: f.isDM ? "#5a1a8a" : "#4a3810"}}>
                            {new Date(s+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                            {" — "}
                            <span style={{color:v==="yes"?(f.isDM?"#aa44ff":"#6acc44"):v==="maybe"?"#e8c040":v==="no"?"#e83838":"#2e2010"}}>
                              {v==="yes"?(f.isDM?"Will run!":"Ready"):v==="maybe"?(f.isDM?"Maybe":"Maybe"):v==="no"?(f.isDM?"No session":"Out"):"?"}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{margin:"30px 0 0"}}><Ornament w={500}/></div>
      </div>

      <div className="footer">
        <div style={{opacity:0.9,filter:"drop-shadow(0 0 12px rgba(200,180,100,0.15))"}}><Mummy/></div>
        <div className="footer-center">Sorry, looks like something went wrong.<br/>Every other Monday · Mummy's Mask</div>
        <div style={{opacity:0.9,filter:"drop-shadow(0 0 12px rgba(200,180,100,0.15))"}}><Mummy flip/></div>
      </div>
    </div>
  );
}
