import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Spark start positions (GSAP animates them at mount)
const SPARKS = [
  { x: 416, y: 48, r: 2.4, dur: 0.74, delay: 0.00, col: "#ffee44" },
  { x: 422, y: 52, r: 1.7, dur: 0.56, delay: 0.23, col: "#ffffff" },
  { x: 418, y: 43, r: 2.8, dur: 0.90, delay: 0.45, col: "#ff9900" },
  { x: 424, y: 50, r: 1.8, dur: 0.64, delay: 0.66, col: "#ffcc00" },
  { x: 412, y: 46, r: 2.1, dur: 0.80, delay: 0.11, col: "#ff6600" },
  { x: 419, y: 54, r: 2.3, dur: 0.69, delay: 0.36, col: "#ff8800" },
  { x: 425, y: 44, r: 1.5, dur: 0.59, delay: 0.53, col: "#ffffaa" },
  { x: 410, y: 50, r: 1.9, dur: 0.76, delay: 0.19, col: "#ff5500" },
];

export default function Dragon() {
  const svgRef       = useRef(null);
  const wingNearRef  = useRef(null);
  const wingFarRef   = useRef(null);
  const flameRef     = useRef(null);
  const eyeRingRef   = useRef(null);
  const pupilRef     = useRef(null);
  const tailRef      = useRef(null);
  const bodyRef      = useRef(null);
  const neckRef      = useRef(null);
  const sparksRef    = useRef(null);
  const smokeRef     = useRef(null);
  const scalesRef    = useRef(null);

  // ── GSAP animations ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current) return;

    // Wing near — powerful downstroke, elastic snap back
    const wn = gsap.timeline({ repeat: -1 });
    wn.to(wingNearRef.current, { rotation: -34, duration: 0.36, ease: "power3.out",  transformOrigin: "153px 73px" })
      .to(wingNearRef.current, { rotation:  26, duration: 0.58, ease: "power2.inOut" })
      .to(wingNearRef.current, { rotation:   3, duration: 0.22, ease: "back.out(2.4)" })
      .to(wingNearRef.current, { rotation:   0, duration: 0.19, ease: "none" });

    // Wing far — same shape, offset and muted
    const wf = gsap.timeline({ repeat: -1, delay: 0.24 });
    wf.to(wingFarRef.current, { rotation: -24, duration: 0.36, ease: "power3.out",  transformOrigin: "149px 82px" })
      .to(wingFarRef.current, { rotation:  18, duration: 0.58, ease: "power2.inOut" })
      .to(wingFarRef.current, { rotation:   2, duration: 0.22, ease: "back.out(2.0)" })
      .to(wingFarRef.current, { rotation:   0, duration: 0.19, ease: "none" });

    // Neck bob, synced with wing downstroke
    const nb = gsap.timeline({ repeat: -1 });
    nb.to(neckRef.current, { y: -6, duration: 0.36, ease: "power3.out" })
      .to(neckRef.current, { y:  1, duration: 0.58, ease: "sine.inOut" })
      .to(neckRef.current, { y:  0, duration: 0.41, ease: "sine.out" });

    // Flame — 7-step turbulence
    const fl = gsap.timeline({ repeat: -1 });
    [
      [1.20, 1.15, 1.00, 0.11],
      [0.78, 0.84, 0.44, 0.14],
      [1.15, 1.13, 0.98, 0.17],
      [0.85, 0.89, 0.60, 0.10],
      [1.10, 1.08, 0.96, 0.13],
      [0.92, 0.94, 0.70, 0.09],
      [1.00, 1.00, 0.78, 0.13],
    ].forEach(([sX, sY, o, d]) =>
      fl.to(flameRef.current, { scaleX: sX, scaleY: sY, opacity: o, duration: d, ease: "none", transformOrigin: "383px 57px" })
    );

    // Eye outer ring — slow ominous pulse
    gsap.to(eyeRingRef.current, {
      opacity: 0.05, scale: 1.30, duration: 1.4, ease: "sine.inOut",
      yoyo: true, repeat: -1, transformOrigin: "306px 47px",
    });

    // Pupil — dilation
    gsap.to(pupilRef.current, {
      scaleY: 0.50, scaleX: 1.30, duration: 1.8, ease: "sine.inOut",
      yoyo: true, repeat: -1, transformOrigin: "306px 47px",
    });

    // Tail — 4-phase organic wag
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(tailRef.current, { rotation: -15,  duration: 0.80, ease: "power2.inOut", transformOrigin: "82px 97px" })
      .to(tailRef.current, { rotation:  11,  duration: 1.02, ease: "power2.inOut" })
      .to(tailRef.current, { rotation:  -5,  duration: 0.54, ease: "power1.out" })
      .to(tailRef.current, { rotation:   0,  duration: 0.78, ease: "sine.inOut" });

    // Body — breathing
    gsap.to(bodyRef.current, {
      scaleY: 1.028, scaleX: 1.008, duration: 2.8, ease: "sine.inOut",
      yoyo: true, repeat: -1, transformOrigin: "162px 95px",
    });

    // Scales — staggered shimmer wave
    if (scalesRef.current) {
      const rows = Array.from(scalesRef.current.children);
      gsap.fromTo(rows,
        { opacity: 0.16 },
        { opacity: 0.64, duration: 0.80, ease: "sine.inOut", yoyo: true, repeat: -1,
          stagger: { each: 0.50, from: "random" } }
      );
    }

    return () => {
      [wn, wf, nb, fl, tl].forEach(t => t.kill());
      gsap.killTweensOf([eyeRingRef.current, pupilRef.current, bodyRef.current]);
    };
  }, []);

  // ── Fire sparks ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sparksRef.current) return;
    const els = Array.from(sparksRef.current.querySelectorAll("circle"));
    const offsets = SPARKS.map(() => ({ dx: 4 + Math.random() * 8, dy: 20 + Math.random() * 15 }));
    const timelines = els.map((el, i) => {
      const s = SPARKS[i]; if (!s) return null;
      const { dx, dy } = offsets[i];
      gsap.set(el, { attr: { cx: s.x, cy: s.y, r: s.r }, opacity: 0 });
      const t = gsap.timeline({ repeat: -1, delay: s.delay });
      t.to(el, { attr: { cy: s.y - 2 }, opacity: 0.95, duration: s.dur * 0.12, ease: "none" })
       .to(el, { attr: { cx: s.x + dx, cy: s.y - dy, r: 0 }, opacity: 0, duration: s.dur * 0.88, ease: "power2.out" })
       .set(el, { attr: { cx: s.x, cy: s.y, r: s.r }, opacity: 0 });
      return t;
    }).filter(Boolean);
    return () => timelines.forEach(t => t.kill());
  }, []);

  // ── Nostril smoke ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!smokeRef.current) return;
    const els = Array.from(smokeRef.current.querySelectorAll("circle"));
    const drifts = els.map(() => 366 + (Math.random() - 0.5) * 5);
    const timelines = els.map((el, i) => {
      gsap.set(el, { attr: { cx: 368, cy: 53, r: 1.3 }, opacity: 0 });
      const t = gsap.timeline({ repeat: -1, delay: i * 1.2 + Math.random() * 0.5 });
      t.to(el, { attr: { cy: 51 }, opacity: 0.20, duration: 0.28 })
       .to(el, { attr: { cx: drifts[i], cy: 38, r: 4.5 }, opacity: 0, duration: 1.9, ease: "power1.out" })
       .set(el, { attr: { cx: 368, cy: 53, r: 1.3 }, opacity: 0 });
      return t;
    });
    return () => timelines.forEach(t => t.kill());
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 430 155" width="430" height="155" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* ── Gradients ── */}
        <linearGradient id="gBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3aaa18"/>
          <stop offset="35%"  stopColor="#1e7008"/>
          <stop offset="75%"  stopColor="#114606"/>
          <stop offset="100%" stopColor="#061c02"/>
        </linearGradient>
        <linearGradient id="gBelly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#5acc28"/>
          <stop offset="50%"  stopColor="#2e9014"/>
          <stop offset="100%" stopColor="#1a6008"/>
        </linearGradient>
        <linearGradient id="gNeck" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1e7008"/>
          <stop offset="60%"  stopColor="#2a8e10"/>
          <stop offset="100%" stopColor="#1c6408"/>
        </linearGradient>
        <linearGradient id="gHead" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1c6008"/>
          <stop offset="55%"  stopColor="#2a8e10"/>
          <stop offset="100%" stopColor="#185806"/>
        </linearGradient>
        <linearGradient id="gWing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#020702" stopOpacity="0.98"/>
          <stop offset="50%"  stopColor="#061402" stopOpacity="0.88"/>
          <stop offset="100%" stopColor="#102204" stopOpacity="0.60"/>
        </linearGradient>
        <linearGradient id="gTail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0a2a04"/>
          <stop offset="100%" stopColor="#1e7008"/>
        </linearGradient>
        <linearGradient id="gHorn" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ecdA80"/>
          <stop offset="50%"  stopColor="#c8a848"/>
          <stop offset="100%" stopColor="#8a6818"/>
        </linearGradient>
        <radialGradient id="gEye" cx="36%" cy="30%" r="64%">
          <stop offset="0%"   stopColor="#fff066"/>
          <stop offset="25%"  stopColor="#ffaa00"/>
          <stop offset="60%"  stopColor="#cc4000"/>
          <stop offset="100%" stopColor="#660000"/>
        </radialGradient>
        <radialGradient id="gFlame1" cx="14%" cy="50%" r="86%">
          <stop offset="0%"   stopColor="#ffffd0" stopOpacity="0.95"/>
          <stop offset="18%"  stopColor="#ffee00"/>
          <stop offset="46%"  stopColor="#ff6600"/>
          <stop offset="80%"  stopColor="#cc2200" stopOpacity="0.24"/>
          <stop offset="100%" stopColor="#aa0800" stopOpacity="0.06"/>
        </radialGradient>
        <radialGradient id="gFlame2" cx="8%" cy="50%" r="76%">
          <stop offset="0%"   stopColor="#ffffff"  stopOpacity="0.90"/>
          <stop offset="20%"  stopColor="#ffee44"/>
          <stop offset="66%"  stopColor="#ff5500"  stopOpacity="0.44"/>
          <stop offset="100%" stopColor="#ff2200"  stopOpacity="0.00"/>
        </radialGradient>
        <radialGradient id="gFlameCore" cx="12%" cy="50%" r="58%">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="36%"  stopColor="#ffffaa"/>
          <stop offset="100%" stopColor="#ffaa00"  stopOpacity="0.00"/>
        </radialGradient>
        <radialGradient id="gBodyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#2a8810" stopOpacity="0.42"/>
          <stop offset="55%"  stopColor="#145408" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#082604" stopOpacity="0.00"/>
        </radialGradient>
        {/* ── Filters ── */}
        <filter id="fEye"   x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3"   result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="fFlame" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="fGlow"  x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15"/>
        </filter>
        <filter id="fAura"  x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5"   result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ══ AMBIENT BODY GLOW ══ */}
      <ellipse cx="192" cy="90" rx="170" ry="50" fill="url(#gBodyGlow)" filter="url(#fGlow)" opacity="0.9"/>
      <ellipse cx="404" cy="53" rx="50"  ry="22" fill="#ff3300" opacity="0.14" filter="url(#fGlow)"/>

      {/* ══ FAR WING (behind body) ══ */}
      <g ref={wingFarRef}>
        <path d="M 149,82 L 26,36 L 56,72 Z"       fill="url(#gWing)" opacity="0.58"/>
        <path d="M 149,82 L 56,72 L 74,50 Z"        fill="url(#gWing)" opacity="0.50"/>
        <line x1="149" y1="82" x2="26"  y2="36"    stroke="#163a08" strokeWidth="0.9" opacity="0.50"/>
        <line x1="149" y1="82" x2="56"  y2="72"    stroke="#163a08" strokeWidth="0.7" opacity="0.38"/>
        <path d="M 52,52 Q 100,68 149,82"            stroke="#163a08" strokeWidth="0.4" fill="none" opacity="0.28"/>
      </g>

      {/* ══ NEAR WING ══ */}
      <g ref={wingNearRef}>
        {/* Membrane panels */}
        <path d="M 153,73 L 44,3   L 78,48 Z"       fill="url(#gWing)"/>
        <path d="M 153,73 L 78,48  L 102,16 Z"      fill="url(#gWing)" opacity="0.92"/>
        <path d="M 153,73 L 102,16 L 130,5  Z"      fill="url(#gWing)" opacity="0.87"/>
        <path d="M 153,73 L 130,5  L 150,24 L 140,75 Z" fill="url(#gWing)" opacity="0.80"/>
        {/* Subtle sheen overlay */}
        <path d="M 153,73 L 44,3   L 78,48 Z"       fill="#2a7010" opacity="0.08"/>
        {/* Wing bone spars */}
        <line x1="153" y1="73" x2="44"  y2="3"     stroke="#3a8016" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="153" y1="73" x2="78"  y2="48"    stroke="#2d6e12" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="153" y1="73" x2="102" y2="16"    stroke="#2d6e12" strokeWidth="1.3" strokeLinecap="round"/>
        <line x1="153" y1="73" x2="130" y2="5"     stroke="#2d6e12" strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="153" y1="73" x2="150" y2="24"    stroke="#2d6e12" strokeWidth="1.0" strokeLinecap="round"/>
        {/* Membrane cross-veins */}
        <path d="M 64,26 Q 108,52 149,72"           stroke="#1a4a0a" strokeWidth="0.5" fill="none" opacity="0.40"/>
        <path d="M 82,12 Q 118,44 149,72"           stroke="#1a4a0a" strokeWidth="0.5" fill="none" opacity="0.32"/>
        {/* Leading-edge claws */}
        <path d="M 44,3   Q 39,-1 36,3   Q 42,8  46,6  Z" fill="#0d1e04"/>
        <path d="M 78,48  Q 73,44 70,48  Q 75,53 80,51 Z" fill="#0d1e04"/>
      </g>

      {/* ══ TAIL ══ */}
      <g ref={tailRef}>
        {/* Main tail — layered strokes for thickness taper */}
        <path d="M 82,97 C 60,112 34,110 16,102 C 3,94 0,82 6,73 C 0,67 4,58 10,62"
              stroke="url(#gBody)" strokeWidth="16" fill="none" strokeLinecap="round"/>
        <path d="M 82,97 C 60,112 34,110 16,102 C 5,96 2,86 8,77"
              stroke="url(#gBelly)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.38"/>
        {/* Diamond tail tip */}
        <path d="M 10,62 L 2,52 L 14,57 L 20,46 L 26,57 L 38,56 L 22,66 Z" fill="#1a5808"/>
        <path d="M 10,62 L 2,52 L 14,57 L 20,46 L 26,57 L 38,56 L 22,66 Z" fill="#3a9818" opacity="0.28"/>
        {/* Dorsal tail spines */}
        <path d="M 68,104 Q 65,93  70,96"  stroke="#44aa22" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M 52,111 Q 49,100 54,103" stroke="#44aa22" strokeWidth="2.0" fill="none" strokeLinecap="round"/>
        <path d="M 36,109 Q 33,99  38,101" stroke="#44aa22" strokeWidth="1.7" fill="none" strokeLinecap="round"/>
        <path d="M 22,102 Q 20,93  24,95"  stroke="#3a9818" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      </g>

      {/* ══ BODY ══ */}
      <g ref={bodyRef}>
        {/* Ground shadow */}
        <ellipse cx="162" cy="106" rx="80" ry="15" fill="#000000" opacity="0.22"/>
        {/* Main body mass — teardrop path, wider at shoulder, tapers at tail */}
        <path d="M 84,90 C 87,67 116,56 162,56 C 204,56 238,66 248,80 C 248,120 212,132 164,132 C 116,132 82,124 82,100 Z"
              fill="url(#gBody)"/>
        {/* Belly plate */}
        <path d="M 92,116 C 118,128 150,134 186,132 C 216,130 240,122 248,112"
              stroke="url(#gBelly)" strokeWidth="20" fill="none" strokeLinecap="round" opacity="0.46"/>
        {/* Dorsal body shine */}
        <ellipse cx="148" cy="72" rx="52" ry="12" fill="#50cc28" opacity="0.09"/>

        {/* Scale rows */}
        <g ref={scalesRef}>
          <g>{[92,104,116,128,140,152,164,176,188,200,212,224].map(x =>
            <path key={x} d={`M${x},82 Q${x+6},75 ${x+12},82`} stroke="#46c020" strokeWidth="1.4" fill="none"/>
          )}</g>
          <g>{[98,110,122,134,146,158,170,182,194,206,218].map(x =>
            <path key={x} d={`M${x},92 Q${x+6},85 ${x+12},92`} stroke="#38a818" strokeWidth="1.1" fill="none"/>
          )}</g>
          <g>{[92,104,116,128,140,152,164,176,188,200,212].map(x =>
            <path key={x} d={`M${x},102 Q${x+6},95 ${x+12},102`} stroke="#2a8a10" strokeWidth="0.9" fill="none"/>
          )}</g>
        </g>

        {/* Dorsal spine ridges on body */}
        {[162,176,190,204,218].map((x, i) => (
          <g key={x}>
            <path d={`M${x},${66-i*0.6} Q${x+3},${53-i*1.4} ${x+7},${58-i*0.7}`}
                  stroke="#56d428" strokeWidth={2.7-i*0.3} fill="none" strokeLinecap="round"/>
            <path d={`M${x+1},${66-i*0.6} Q${x+4},${54-i*1.4} ${x+8},${59-i*0.7}`}
                  stroke="#80f048" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.36"/>
          </g>
        ))}
      </g>

      {/* ══ NECK ══ */}
      {/* Proper filled wedge — wider at head, tapers to body */}
      <g ref={neckRef}>
        <path d="M 238,73 C 256,60 275,50 295,46 C 298,52 298,64 294,68 C 276,74 258,84 242,88 Z"
              fill="url(#gNeck)"/>
        {/* Neck highlight stripe */}
        <path d="M 240,75 C 258,62 277,52 296,48"
              stroke="#3aaa18" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.25"/>
        {/* Neck dorsal spines */}
        <path d="M 252,65 Q 256,55 261,59" stroke="#44aa22" strokeWidth="2.0" fill="none" strokeLinecap="round"/>
        <path d="M 266,58 Q 270,48 275,52" stroke="#44aa22" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M 280,52 Q 284,43 289,47" stroke="#44aa22" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        {/* Neck scale hints */}
        <path d="M 248,77 Q 256,72 264,77" stroke="#3a9a1e" strokeWidth="0.8" fill="none" opacity="0.36"/>
        <path d="M 262,71 Q 270,66 278,71" stroke="#3a9a1e" strokeWidth="0.7" fill="none" opacity="0.30"/>
      </g>

      {/* ══ FRONT LEGS ══ */}
      <path d="M 180,122 Q 172,140 164,148" stroke="#0e3e06" strokeWidth="12" fill="none" strokeLinecap="round"/>
      <path d="M 180,122 Q 184,138 178,147" stroke="#0e3e06" strokeWidth="11" fill="none" strokeLinecap="round"/>
      <path d="M 180,122 Q 190,134 187,143" stroke="#0e3e06" strokeWidth="10" fill="none" strokeLinecap="round"/>
      {/* Leg highlight */}
      <path d="M 180,122 Q 172,140 164,148" stroke="#2a7a10" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.26"/>
      {/* Front claws */}
      <path d="M 164,148 Q 156,154 151,156" stroke="#c8a430" strokeWidth="3.0" fill="none" strokeLinecap="round"/>
      <path d="M 178,147 Q 171,154 167,156" stroke="#c8a430" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <path d="M 187,143 Q 182,150 178,153" stroke="#c8a430" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
      {/* Back legs */}
      <path d="M 116,120 Q 107,138 100,144" stroke="#0e3e06" strokeWidth="11" fill="none" strokeLinecap="round"/>
      <path d="M 116,120 Q 120,136 113,144" stroke="#0e3e06" strokeWidth="10" fill="none" strokeLinecap="round"/>
      <path d="M 100,144 Q  93,150  89,152" stroke="#c8a430" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
      <path d="M 113,144 Q 107,151 103,153" stroke="#c8a430" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* ══ HEAD ══ */}
      {/* Lower jaw — open, angled down-forward */}
      <path d="M 294,52 C 308,62 332,70 358,74 C 370,78 378,82 370,86 C 354,84 330,76 306,68 Z"
            fill="#0c3a06"/>
      {/* Upper skull — main head mass */}
      <ellipse cx="324" cy="50" rx="38" ry="21" fill="url(#gHead)"/>
      {/* Head highlight */}
      <ellipse cx="312" cy="40" rx="26" ry="9" fill="#50cc28" opacity="0.08"/>
      {/* Snout — extends forward from skull */}
      <path d="M 316,54 C 345,50 374,52 392,56 C 396,62 392,70 382,72 C 362,70 338,64 318,62 Z"
            fill="#1a5808"/>
      {/* Snout top highlight */}
      <path d="M 318,52 C 348,48 376,50 394,54" stroke="#3aaa18" strokeWidth="1.5" fill="none" opacity="0.28"/>
      {/* Nostril */}
      <ellipse cx="378" cy="57" rx="5.5" ry="3.2" fill="#050e02" transform="rotate(-14,378,57)"/>
      <ellipse cx="378" cy="57" rx="2.5" ry="1.6" fill="#0a1e06" transform="rotate(-14,378,57)"/>
      {/* Jaw line */}
      <path d="M 290,58 C 316,64 344,68 366,70 Q 378,72 388,70"
            stroke="#08200a" strokeWidth="1.8" fill="none" opacity="0.70"/>
      {/* Upper teeth */}
      <path d="M 298,58 Q 301,66 304,58" fill="#e0d098" stroke="#e0d098" strokeWidth="1.6" opacity="0.94"/>
      <path d="M 310,59 Q 313,68 316,59" fill="#e0d098" stroke="#e0d098" strokeWidth="1.6" opacity="0.92"/>
      <path d="M 323,60 Q 326,69 329,60" fill="#e0d098" stroke="#e0d098" strokeWidth="1.5" opacity="0.88"/>
      <path d="M 336,61 Q 339,69 342,61" fill="#d8c888" stroke="#d8c888" strokeWidth="1.4" opacity="0.82"/>
      {/* Lower teeth */}
      <path d="M 304,66 Q 307,59 310,66" fill="#ccc080" stroke="#ccc080" strokeWidth="1.4" opacity="0.80"/>
      <path d="M 317,68 Q 320,61 323,68" fill="#ccc080" stroke="#ccc080" strokeWidth="1.4" opacity="0.78"/>
      <path d="M 330,70 Q 333,63 336,70" fill="#ccc080" stroke="#ccc080" strokeWidth="1.3" opacity="0.72"/>
      {/* Tongue */}
      <path d="M 358,70 Q 372,74 382,72 Q 384,78 376,79 Q 364,78 352,74 Z"
            fill="#cc2244" opacity="0.92"/>
      <path d="M 374,72 Q 378,77 376,80" stroke="#aa1a33" strokeWidth="1.4" fill="none"/>
      {/* Brow ridge */}
      <path d="M 294,42 C 308,34 328,32 346,34" stroke="#50cc28" strokeWidth="3.0" fill="none" strokeLinecap="round"/>
      {/* Cheek scale hints */}
      <path d="M 300,48 Q 312,44 322,48" stroke="#3a9a1e" strokeWidth="0.9" fill="none" opacity="0.32"/>
      <path d="M 314,44 Q 326,40 336,44" stroke="#3a9a1e" strokeWidth="0.8" fill="none" opacity="0.26"/>

      {/* ══ HORNS ══ */}
      <path d="M 302,38 C 308,18 322,24 318,30" stroke="url(#gHorn)" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
      <path d="M 302,38 C 308,18 322,24 318,30" stroke="#fff0a0" strokeWidth="1.6"  fill="none" strokeLinecap="round" opacity="0.42"/>
      {/* Ring marks on horn 1 */}
      <path d="M 305,32 Q 310,31 312,34" stroke="#8a6018" strokeWidth="1.2" fill="none" opacity="0.55"/>
      <path d="M 307,26 Q 312,25 313,28" stroke="#8a6018" strokeWidth="0.9" fill="none" opacity="0.45"/>
      <path d="M 316,36 C 324,15 338,22 334,28" stroke="url(#gHorn)" strokeWidth="5.0" fill="none" strokeLinecap="round"/>
      <path d="M 316,36 C 324,15 338,22 334,28" stroke="#fff0a0" strokeWidth="1.4"  fill="none" strokeLinecap="round" opacity="0.38"/>
      {/* Small spur horns */}
      <path d="M 309,35 C 313,26 320,28 318,32" stroke="url(#gHorn)" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <path d="M 324,33 C 328,24 335,27 332,31" stroke="url(#gHorn)" strokeWidth="2.3" fill="none" strokeLinecap="round"/>

      {/* ══ CREST / FRILL ══ */}
      <path d="M 293,46 Q 284,34 290,40 Q 280,29 286,35 Q 278,24 285,32"
            stroke="#2a8010" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.64"/>

      {/* ══ EYE ══ */}
      {/* Outer aura ring (GSAP-animated) */}
      <circle ref={eyeRingRef} cx="306" cy="47" r="16" fill="none" stroke="#ff8800"
              strokeWidth="2.4" opacity="0.28" filter="url(#fAura)"/>
      {/* Eye socket */}
      <circle cx="306" cy="47" r="9.5" fill="#030100"/>
      {/* Iris */}
      <circle cx="306" cy="47" r="7.5" fill="url(#gEye)" filter="url(#fEye)"/>
      {/* Iris radial lines */}
      {[0, 36, 72, 108, 144].map(a => {
        const r = a * Math.PI / 180;
        return <line key={a}
          x1={306 + Math.cos(r)*2.8} y1={47 + Math.sin(r)*2.8}
          x2={306 + Math.cos(r)*7.0} y2={47 + Math.sin(r)*7.0}
          stroke="#be3a00" strokeWidth="0.65" opacity="0.48"/>;
      })}
      {/* Slit pupil (GSAP dilates this) */}
      <ellipse ref={pupilRef} cx="306" cy="47" rx="2.4" ry="5.4" fill="#010000"/>
      {/* Highlights */}
      <circle cx="308.5" cy="44" r="2.0" fill="rgba(255,255,210,0.80)"/>
      <circle cx="303.2" cy="50" r="0.9" fill="rgba(255,255,210,0.28)"/>
      {/* Outer glow ring */}
      <circle cx="306" cy="47" r="11.5" fill="none" stroke="#ff9900" strokeWidth="0.9" opacity="0.24"/>

      {/* ══ FLAME ══ */}
      <g ref={flameRef}>
        {/* Corona */}
        <ellipse cx="403" cy="56" rx="30" ry="15" fill="#ff1a00" opacity="0.16" filter="url(#fFlame)"/>
        {/* Base flame */}
        <path d="M 383,57 C 392,38 412,34 422,40 C 428,46 428,58 420,66 C 408,70 392,70 383,62 Z"
              fill="#ff3300" opacity="0.68" filter="url(#fFlame)"/>
        {/* Mid flame */}
        <path d="M 385,58 C 393,42 411,38 420,44 C 425,50 424,60 416,65 C 404,68 390,67 385,61 Z"
              fill="url(#gFlame1)" opacity="0.92"/>
        {/* Inner flame */}
        <path d="M 387,59 C 394,46 410,44 418,50 C 421,55 419,62 411,65 C 400,66 389,63 387,60 Z"
              fill="url(#gFlame2)" opacity="0.88"/>
        {/* Hot core */}
        <ellipse cx="400" cy="57" rx="11" ry="7" fill="url(#gFlameCore)" opacity="0.62"/>
        {/* White-hot tip */}
        <ellipse cx="399" cy="57" rx="5.5" ry="3.5" fill="#ffffff" opacity="0.24"/>
        {/* Side tongues */}
        <path d="M 416,36 C 424,26 430,30 428,36 C 425,42 420,40 416,36 Z" fill="#ff9900" opacity="0.58"/>
        <path d="M 420,42 C 428,34 432,40 430,46 C 428,52 424,50 420,42 Z" fill="#ffcc00" opacity="0.48"/>
      </g>

      {/* ══ FIRE SPARKS (GSAP) ══ */}
      <g ref={sparksRef}>
        {SPARKS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.col} opacity="0" filter="url(#fFlame)"/>
        ))}
      </g>

      {/* ══ NOSTRIL SMOKE (GSAP) ══ */}
      <g ref={smokeRef}>
        <circle cx="378" cy="53" r="1.3" fill="#c8c8c8" opacity="0"/>
        <circle cx="378" cy="53" r="1.3" fill="#a8a8a8" opacity="0"/>
        <circle cx="378" cy="53" r="1.3" fill="#b8b8b8" opacity="0"/>
      </g>
    </svg>
  );
}
