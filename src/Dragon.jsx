import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";

const SPARK_DATA = [
  { x: 416, y: 47, r: 2.4, dur: 0.72, delay: 0.00, color: "#ffee44" },
  { x: 423, y: 52, r: 1.6, dur: 0.55, delay: 0.22, color: "#ffffff" },
  { x: 419, y: 42, r: 2.7, dur: 0.88, delay: 0.44, color: "#ff9900" },
  { x: 425, y: 50, r: 1.7, dur: 0.63, delay: 0.65, color: "#ffcc00" },
  { x: 413, y: 45, r: 2.0, dur: 0.79, delay: 0.10, color: "#ff6600" },
  { x: 420, y: 55, r: 2.2, dur: 0.68, delay: 0.35, color: "#ff8800" },
  { x: 427, y: 43, r: 1.5, dur: 0.58, delay: 0.52, color: "#ffffaa" },
  { x: 411, y: 50, r: 1.8, dur: 0.74, delay: 0.18, color: "#ff5500" },
];

export default function Dragon() {
  const svgRef        = useRef(null);
  const wingNearRef   = useRef(null);
  const wingFarRef    = useRef(null);
  const flameRef      = useRef(null);
  const eyeRingRef    = useRef(null);
  const pupilRef      = useRef(null);
  const tailRef       = useRef(null);
  const bodyGroupRef  = useRef(null);
  const neckRef       = useRef(null);
  const sparksRef     = useRef(null);
  const smokeRef      = useRef(null);
  const scaleRow1Ref  = useRef(null);
  const scaleRow2Ref  = useRef(null);
  const scaleRow3Ref  = useRef(null);

  // ── Main GSAP animations ──────────────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current) return;

    // Wing near: powerful downstroke with elastic recovery
    const wingNearTl = gsap.timeline({ repeat: -1 });
    wingNearTl
      .to(wingNearRef.current, { rotation: -32, duration: 0.38, ease: "power3.out", transformOrigin: "152px 74px" })
      .to(wingNearRef.current, { rotation: 24,  duration: 0.60, ease: "power2.inOut" })
      .to(wingNearRef.current, { rotation:  2,  duration: 0.20, ease: "back.out(2.2)" })
      .to(wingNearRef.current, { rotation:  0,  duration: 0.17, ease: "none" });

    // Wing far: same shape, slightly muted and offset
    const wingFarTl = gsap.timeline({ repeat: -1, delay: 0.22 });
    wingFarTl
      .to(wingFarRef.current, { rotation: -24, duration: 0.38, ease: "power3.out", transformOrigin: "148px 80px" })
      .to(wingFarRef.current, { rotation: 16,  duration: 0.60, ease: "power2.inOut" })
      .to(wingFarRef.current, { rotation:  1,  duration: 0.20, ease: "back.out(2.0)" })
      .to(wingFarRef.current, { rotation:  0,  duration: 0.17, ease: "none" });

    // Neck bob, synced with wing flap
    const neckTl = gsap.timeline({ repeat: -1 });
    neckTl
      .to(neckRef.current, { y: -5, duration: 0.38, ease: "power3.out" })
      .to(neckRef.current, { y:  1, duration: 0.60, ease: "sine.inOut" })
      .to(neckRef.current, { y:  0, duration: 0.37, ease: "sine.out" });

    // Flame: turbulent 7-step timeline
    const flameTl = gsap.timeline({ repeat: -1 });
    const flameSteps = [
      { sX: 1.18, sY: 1.14, o: 1.00, d: 0.11 },
      { sX: 0.80, sY: 0.85, o: 0.46, d: 0.15 },
      { sX: 1.14, sY: 1.12, o: 0.98, d: 0.18 },
      { sX: 0.87, sY: 0.90, o: 0.62, d: 0.10 },
      { sX: 1.09, sY: 1.07, o: 0.94, d: 0.13 },
      { sX: 0.94, sY: 0.96, o: 0.72, d: 0.09 },
      { sX: 1.00, sY: 1.00, o: 0.78, d: 0.11 },
    ];
    flameSteps.forEach(({ sX, sY, o, d }) =>
      flameTl.to(flameRef.current, { scaleX: sX, scaleY: sY, opacity: o, duration: d, ease: "none", transformOrigin: "374px 55px" })
    );

    // Eye glow ring — slow, ominous pulse
    gsap.to(eyeRingRef.current, {
      opacity: 0.06, scale: 1.28, duration: 1.3, ease: "sine.inOut",
      yoyo: true, repeat: -1, transformOrigin: "304px 46px",
    });

    // Pupil dilation
    gsap.to(pupilRef.current, {
      scaleY: 0.52, scaleX: 1.28, duration: 1.7, ease: "sine.inOut",
      yoyo: true, repeat: -1, transformOrigin: "304px 46px",
    });

    // Tail: organic 4-phase wag
    const tailTl = gsap.timeline({ repeat: -1 });
    tailTl
      .to(tailRef.current, { rotation: -14,  duration: 0.78, ease: "power2.inOut", transformOrigin: "82px 96px" })
      .to(tailRef.current, { rotation:  10.5, duration: 1.00, ease: "power2.inOut" })
      .to(tailRef.current, { rotation:  -4.5, duration: 0.52, ease: "power1.out" })
      .to(tailRef.current, { rotation:   0,   duration: 0.75, ease: "sine.inOut" });

    // Body breathing
    gsap.to(bodyGroupRef.current, {
      scaleY: 1.030, scaleX: 1.010, duration: 2.6, ease: "sine.inOut",
      yoyo: true, repeat: -1, transformOrigin: "155px 97px",
    });

    // Scale shimmer — staggered wave across 3 rows
    const scaleEls = [scaleRow1Ref.current, scaleRow2Ref.current, scaleRow3Ref.current];
    gsap.fromTo(scaleEls,
      { opacity: 0.18 },
      { opacity: 0.62, duration: 0.75, ease: "sine.inOut", yoyo: true, repeat: -1,
        stagger: { each: 0.45, from: "random" } }
    );

    return () => {
      [wingNearTl, wingFarTl, neckTl, flameTl, tailTl].forEach(tl => tl.kill());
      gsap.killTweensOf([eyeRingRef.current, pupilRef.current, bodyGroupRef.current, ...scaleEls]);
    };
  }, []);

  // ── Fire spark animations ─────────────────────────────────────────────────
  useEffect(() => {
    if (!sparksRef.current) return;
    const els = Array.from(sparksRef.current.querySelectorAll("circle"));
    const endOffsets = SPARK_DATA.map(() => ({
      dx: 4 + Math.random() * 7,
      dy: 20 + Math.random() * 14,
    }));
    const timelines = els.map((el, i) => {
      const d = SPARK_DATA[i];
      if (!d) return null;
      gsap.set(el, { attr: { cx: d.x, cy: d.y, r: d.r }, opacity: 0 });
      const { dx, dy } = endOffsets[i];
      const tl = gsap.timeline({ repeat: -1, delay: d.delay });
      tl.to(el, { attr: { cy: d.y - 2 }, opacity: 0.92, duration: d.dur * 0.12, ease: "none" })
        .to(el, { attr: { cx: d.x + dx, cy: d.y - dy, r: 0 }, opacity: 0, duration: d.dur * 0.88, ease: "power2.out" })
        .set(el, { attr: { cx: d.x, cy: d.y, r: d.r }, opacity: 0 });
      return tl;
    }).filter(Boolean);
    return () => timelines.forEach(t => t.kill());
  }, []);

  // ── Nostril smoke puffs ───────────────────────────────────────────────────
  useEffect(() => {
    if (!smokeRef.current) return;
    const els = Array.from(smokeRef.current.querySelectorAll("circle"));
    const drifts = els.map(() => 357 + (Math.random() - 0.5) * 4);
    const timelines = els.map((el, i) => {
      gsap.set(el, { attr: { cx: 361, cy: 51, r: 1.2 }, opacity: 0 });
      const tl = gsap.timeline({ repeat: -1, delay: i * 1.1 + Math.random() * 0.4 });
      tl.to(el, { attr: { cy: 49 }, opacity: 0.22, duration: 0.25 })
        .to(el, { attr: { cx: drifts[i], cy: 37, r: 3.8 }, opacity: 0, duration: 1.7, ease: "power1.out" })
        .set(el, { attr: { cx: 361, cy: 51, r: 1.2 }, opacity: 0 });
      return tl;
    });
    return () => timelines.forEach(t => t.kill());
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 430 155" width="430" height="155" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* ── Gradients ── */}
        <linearGradient id="dBodyTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3aaa18"/>
          <stop offset="28%"  stopColor="#1e6c0c"/>
          <stop offset="68%"  stopColor="#114808"/>
          <stop offset="100%" stopColor="#061e04"/>
        </linearGradient>
        <linearGradient id="dBelly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4ecc22"/>
          <stop offset="48%"  stopColor="#2d8a14"/>
          <stop offset="100%" stopColor="#1a5c0c"/>
        </linearGradient>
        <linearGradient id="dHead" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1a5408"/>
          <stop offset="55%"  stopColor="#2d7a14"/>
          <stop offset="100%" stopColor="#194a0a"/>
        </linearGradient>
        <linearGradient id="dWing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#030a02" stopOpacity="0.98"/>
          <stop offset="48%"  stopColor="#071602" stopOpacity="0.88"/>
          <stop offset="100%" stopColor="#112506" stopOpacity="0.62"/>
        </linearGradient>
        <linearGradient id="dWingSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#2d7a14" stopOpacity="0.00"/>
          <stop offset="100%" stopColor="#4aaa24" stopOpacity="0.12"/>
        </linearGradient>
        <radialGradient id="dEye" cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#fff066"/>
          <stop offset="28%"  stopColor="#ffa000"/>
          <stop offset="62%"  stopColor="#cc4400"/>
          <stop offset="100%" stopColor="#7a0000"/>
        </radialGradient>
        <radialGradient id="dFlame" cx="16%" cy="50%" r="84%">
          <stop offset="0%"   stopColor="#ffffdd" stopOpacity="0.95"/>
          <stop offset="18%"  stopColor="#ffee00"/>
          <stop offset="48%"  stopColor="#ff6600"/>
          <stop offset="82%"  stopColor="#cc2200" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="#aa1100" stopOpacity="0.08"/>
        </radialGradient>
        <radialGradient id="dFlame2" cx="10%" cy="50%" r="74%">
          <stop offset="0%"   stopColor="#ffffff"  stopOpacity="0.88"/>
          <stop offset="22%"  stopColor="#ffee44"/>
          <stop offset="68%"  stopColor="#ff5500"  stopOpacity="0.48"/>
          <stop offset="100%" stopColor="#ff3300"  stopOpacity="0.00"/>
        </radialGradient>
        <radialGradient id="dFlameCore" cx="14%" cy="50%" r="56%">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="38%"  stopColor="#ffffcc"/>
          <stop offset="100%" stopColor="#ffaa00"  stopOpacity="0.00"/>
        </radialGradient>
        <radialGradient id="dBodyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#2a8810" stopOpacity="0.40"/>
          <stop offset="58%"  stopColor="#165808" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#0a2a04" stopOpacity="0.00"/>
        </radialGradient>
        <radialGradient id="dBodyShine" cx="38%" cy="28%" r="62%">
          <stop offset="0%"   stopColor="#60e030" stopOpacity="0.16"/>
          <stop offset="100%" stopColor="#2d7a14" stopOpacity="0.00"/>
        </radialGradient>
        <linearGradient id="dHorn" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ecdA80"/>
          <stop offset="48%"  stopColor="#c8a850"/>
          <stop offset="100%" stopColor="#967228"/>
        </linearGradient>
        {/* ── Filters ── */}
        <filter id="eyeGlow"  x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3"  result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="flameGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="bodyGlow" x="-22%" y="-22%" width="144%" height="144%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="14"/>
        </filter>
        <filter id="eyeAura"  x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5"  result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── AMBIENT GLOW (behind everything) ── */}
      <ellipse cx="195" cy="88" rx="165" ry="48" fill="url(#dBodyGlow)" filter="url(#bodyGlow)" opacity="0.85"/>
      <ellipse cx="396" cy="51" rx="54"  ry="22" fill="#ff4400" opacity="0.13" filter="url(#bodyGlow)"/>

      {/* ── FAR WING ── */}
      <g ref={wingFarRef}>
        <path d="M148,80 L28,36 L60,75 Z" fill="url(#dWing)" opacity="0.60"/>
        <path d="M148,80 L60,75 L80,50 Z" fill="url(#dWing)" opacity="0.54"/>
        <line x1="148" y1="80" x2="28"  y2="36" stroke="#1a4d0a" strokeWidth="0.8" opacity="0.52"/>
        <line x1="148" y1="80" x2="60"  y2="75" stroke="#1a4d0a" strokeWidth="0.6" opacity="0.38"/>
        <path d="M52,52 Q100,67 148,80" stroke="#1a4d0a" strokeWidth="0.4" fill="none" opacity="0.30"/>
      </g>

      {/* ── NEAR WING ── */}
      <g ref={wingNearRef}>
        <path d="M152,74 L46,2  L74,47 Z" fill="url(#dWing)"/>
        <path d="M152,74 L74,47 L94,16 Z" fill="url(#dWing)" opacity="0.92"/>
        <path d="M152,74 L94,16 L120,6 Z" fill="url(#dWing)" opacity="0.88"/>
        <path d="M152,74 L120,6 L144,22 L134,76 Z" fill="url(#dWing)" opacity="0.82"/>
        {/* Sheen overlay */}
        <path d="M152,74 L46,2 L74,47 Z" fill="url(#dWingSheen)"/>
        {/* Leading-edge claws */}
        <path d="M46,2  Q41,-2 38,2  Q44,7  48,5  Z" fill="#111a06"/>
        <path d="M74,47 Q69,43 66,47 Q71,52 76,50 Z" fill="#111a06"/>
        {/* Spars */}
        <line x1="152" y1="74" x2="46"  y2="2"  stroke="#3a7a16" strokeWidth="1.6"/>
        <line x1="152" y1="74" x2="74"  y2="47" stroke="#2d6b12" strokeWidth="1.4"/>
        <line x1="152" y1="74" x2="94"  y2="16" stroke="#2d6b12" strokeWidth="1.2"/>
        <line x1="152" y1="74" x2="120" y2="6"  stroke="#2d6b12" strokeWidth="1.0"/>
        <line x1="152" y1="74" x2="144" y2="22" stroke="#2d6b12" strokeWidth="0.9"/>
        {/* Membrane veins */}
        <path d="M66,26 Q108,52 148,74" stroke="#1a4d0a" strokeWidth="0.5" fill="none" opacity="0.42"/>
        <path d="M84,12 Q118,43 148,74" stroke="#1a4d0a" strokeWidth="0.5" fill="none" opacity="0.36"/>
        {/* Dashed mid-shine */}
        <path d="M83,33 Q117,55 148,73" stroke="#3a8a14" strokeWidth="0.7" fill="none" opacity="0.14" strokeDasharray="5,9"/>
      </g>

      {/* ── TAIL ── */}
      <g ref={tailRef}>
        <path d="M82,96 Q53,115 24,100 Q6,89 12,81 Q0,76 6,68 Q-5,63 1,55"
              stroke="url(#dBodyTop)" strokeWidth="14" fill="none" strokeLinecap="round"/>
        <path d="M82,96 Q53,115 24,100 Q8,91 12,83"
              stroke="url(#dBelly)" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.42"/>
        {/* Tail tip */}
        <path d="M1,55 Q-6,49 -3,43 Q8,49 4,59 Z" fill="#1a4d0a"/>
        <path d="M1,55 Q-6,49 -3,43 Q8,49 4,59 Z" fill="#3a8a18" opacity="0.32"/>
        {/* Spine ridges */}
        <path d="M68,103 Q65,92 70,95"  stroke="#4aaa24" strokeWidth="2.0" fill="none" strokeLinecap="round"/>
        <path d="M52,110 Q49,99 54,102" stroke="#4aaa24" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M36,108 Q33,98 38,100" stroke="#4aaa24" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M20,101 Q18,92 22,94"  stroke="#3a9a1e" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      </g>

      {/* ── MAIN BODY ── */}
      <g ref={bodyGroupRef}>
        {/* Drop shadow */}
        <ellipse cx="155" cy="102" rx="73" ry="16" fill="#000000" opacity="0.28"/>
        {/* Body mass */}
        <ellipse cx="155" cy="92"  rx="79" ry="34" fill="url(#dBodyTop)"/>
        {/* Belly */}
        <ellipse cx="155" cy="109" rx="61" ry="14" fill="url(#dBelly)" opacity="0.48"/>
        {/* Dorsal shine */}
        <ellipse cx="140" cy="79"  rx="46" ry="10" fill="url(#dBodyShine)"/>

        {/* Scale row 1 */}
        <g ref={scaleRow1Ref}>
          {[96,108,120,132,144,156,168,180,192,204,216].map(x => (
            <path key={x} d={`M${x},82 Q${x+6},76 ${x+12},82`}
                  stroke="#4ecc24" strokeWidth="1.4" fill="none"/>
          ))}
        </g>
        {/* Scale row 2 */}
        <g ref={scaleRow2Ref}>
          {[102,114,126,138,150,162,174,186,198,210].map(x => (
            <path key={x} d={`M${x},90 Q${x+6},84 ${x+12},90`}
                  stroke="#3aaa1e" strokeWidth="1.1" fill="none"/>
          ))}
        </g>
        {/* Scale row 3 */}
        <g ref={scaleRow3Ref}>
          {[96,108,120,132,144,156,168,180,192,204].map(x => (
            <path key={x} d={`M${x},98 Q${x+6},92 ${x+12},98`}
                  stroke="#2a8a14" strokeWidth="0.9" fill="none"/>
          ))}
        </g>

        {/* Existing curvature lines */}
        <path d="M94,74 Q124,69 155,70 Q186,69 216,74"  stroke="#4aaa24" strokeWidth="0.6" fill="none" opacity="0.32"/>
        <path d="M89,82 Q120,77 155,78 Q190,77 221,82"  stroke="#3a9a1e" strokeWidth="0.5" fill="none" opacity="0.24"/>
      </g>

      {/* ── BACK SPINE RIDGES ── */}
      {[160,174,188,202,216].map((x, i) => (
        <g key={x}>
          <path d={`M${x},${67-i*0.5} Q${x+3},${55-i*1.2} ${x+6},${60-i*0.6}`}
                stroke="#5acc2a" strokeWidth={2.6-i*0.28} fill="none" strokeLinecap="round"/>
          <path d={`M${x+1},${67-i*0.5} Q${x+4},${56-i*1.2} ${x+7},${61-i*0.6}`}
                stroke="#80ee44" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.38"/>
        </g>
      ))}

      {/* ── NECK ── */}
      <g ref={neckRef}>
        <path d="M222,78 Q248,66 268,58 Q282,52 292,48"
              stroke="#103e06" strokeWidth="28" fill="none" strokeLinecap="round"/>
        <path d="M222,78 Q248,66 268,58 Q282,52 292,48"
              stroke="#1e6c0c" strokeWidth="22" fill="none" strokeLinecap="round"/>
        <path d="M222,78 Q248,66 268,58 Q282,52 292,48"
              stroke="#2d7a14" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.38"/>
        <path d="M224,86 Q250,74 270,66 Q284,60 294,56"
              stroke="#3a9a1e" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.22"/>
        {/* Neck ridges */}
        <path d="M238,68 Q242,58 247,62" stroke="#4aaa24" strokeWidth="2.0" fill="none" strokeLinecap="round"/>
        <path d="M252,62 Q256,52 261,56" stroke="#4aaa24" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M266,56 Q270,47 275,51" stroke="#4aaa24" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        {/* Neck scale rows */}
        <path d="M234,74 Q241,69 248,74" stroke="#3a9a1e" strokeWidth="0.8" fill="none" opacity="0.38"/>
        <path d="M248,69 Q255,64 262,69" stroke="#3a9a1e" strokeWidth="0.7" fill="none" opacity="0.32"/>
        <path d="M262,64 Q269,59 276,64" stroke="#3a9a1e" strokeWidth="0.6" fill="none" opacity="0.28"/>
      </g>

      {/* ── FRONT LEGS ── */}
      <path d="M178,116 Q169,136 161,144" stroke="#103e06" strokeWidth="11" fill="none" strokeLinecap="round"/>
      <path d="M178,116 Q182,134 176,143" stroke="#103e06" strokeWidth="10" fill="none" strokeLinecap="round"/>
      <path d="M178,116 Q188,130 185,139" stroke="#103e06" strokeWidth="9"  fill="none" strokeLinecap="round"/>
      {/* Leg highlight stripe */}
      <path d="M178,116 Q169,136 161,144" stroke="#2d7a14" strokeWidth="3"  fill="none" strokeLinecap="round" opacity="0.28"/>
      {/* Front claws */}
      <path d="M161,144 Q154,150 149,153" stroke="#c8a840" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <path d="M161,144 Q156,149 153,150" stroke="#8b7220" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.65"/>
      <path d="M176,143 Q169,149 165,152" stroke="#c8a840" strokeWidth="2.7" fill="none" strokeLinecap="round"/>
      <path d="M185,139 Q181,146 177,149" stroke="#c8a840" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Back legs */}
      <path d="M115,116 Q105,134  99,140" stroke="#103e06" strokeWidth="10" fill="none" strokeLinecap="round"/>
      <path d="M115,116 Q118,132 111,140" stroke="#103e06" strokeWidth="9"  fill="none" strokeLinecap="round"/>
      <path d="M99,140  Q93,147  89,149" stroke="#c8a840" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M111,140 Q106,147 101,149" stroke="#c8a840" strokeWidth="2.4" fill="none" strokeLinecap="round"/>

      {/* ── HEAD ── */}
      {/* Lower jaw */}
      <path d="M292,50 Q313,54 333,58 Q351,61 363,65 Q371,70 360,74 Q342,72 322,68 Q301,64 284,60 Z"
            fill="#103e06"/>
      <path d="M295,52 Q313,56 331,60 Q348,63 360,67"
            stroke="#1a6c10" strokeWidth="2.2" fill="none" opacity="0.32"/>
      {/* Upper jaw */}
      <path d="M292,48 Q311,38 331,37 Q351,37 365,44 Q375,50 371,57 Q357,53 337,50 Q314,48 294,52 Z"
            fill="url(#dHead)"/>
      {/* Head mass */}
      <ellipse cx="319" cy="49" rx="39" ry="20" fill="url(#dHead)"/>
      {/* Dorsal head shine */}
      <ellipse cx="308" cy="40" rx="27" ry="8"  fill="#4aaa24" opacity="0.10"/>
      {/* Snout */}
      <path d="M338,48 Q361,47 375,51 Q379,58 371,63 Q356,63 340,60 Q329,57 328,54 Z"
            fill="#1a5408"/>
      {/* Nostril */}
      <ellipse cx="362" cy="53" rx="5.2" ry="3.3" fill="#050e03" transform="rotate(-14,362,53)"/>
      <ellipse cx="362" cy="53" rx="2.4" ry="1.6" fill="#0a1e08" transform="rotate(-14,362,53)"/>
      {/* Jaw line */}
      <path d="M284,56 Q308,60 333,64 Q351,67 363,67"
            stroke="#091c05" strokeWidth="1.9" fill="none" opacity="0.68"/>
      {/* Upper teeth */}
      <path d="M295,56 Q297.5,64 300,56" stroke="#ddd0a0" strokeWidth="1.9" fill="#ddd0a0" opacity="0.93"/>
      <path d="M307,57 Q309.5,66 312,57" stroke="#ddd0a0" strokeWidth="1.9" fill="#ddd0a0" opacity="0.91"/>
      <path d="M319,58 Q321.5,67 324,58" stroke="#ddd0a0" strokeWidth="1.8" fill="#ddd0a0" opacity="0.88"/>
      <path d="M331,59 Q333,68  335,59" stroke="#d4c898" strokeWidth="1.6" fill="#d4c898" opacity="0.82"/>
      {/* Lower teeth */}
      <path d="M301,65 Q303.5,58 306,65" stroke="#c8be8a" strokeWidth="1.6" fill="#c8be8a" opacity="0.82"/>
      <path d="M313,67 Q315.5,60 318,67" stroke="#c8be8a" strokeWidth="1.5" fill="#c8be8a" opacity="0.80"/>
      <path d="M325,68 Q327,62  329,68" stroke="#c8be8a" strokeWidth="1.4" fill="#c8be8a" opacity="0.74"/>
      {/* Tongue */}
      <path d="M353,65 Q363,69 371,67 Q373,73 368,74 Q360,75 348,70 Z" fill="#cc2244" opacity="0.92"/>
      <path d="M367,69 Q370,73 368,75" stroke="#aa1a33" strokeWidth="1.3" fill="none"/>

      {/* Brow ridge */}
      <path d="M296,42 Q314,36 333,37" stroke="#4aaa24" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      {/* Head scale hints */}
      <path d="M298,46 Q307,42 315,46" stroke="#3a9a1e" strokeWidth="0.9" fill="none" opacity="0.34"/>
      <path d="M311,44 Q320,40 328,44" stroke="#3a9a1e" strokeWidth="0.8" fill="none" opacity="0.28"/>
      <path d="M298,53 Q310,50 321,51" stroke="#3a9a1e" strokeWidth="0.7" fill="none" opacity="0.42"/>

      {/* ── HORNS ── */}
      <path d="M299,38 Q305,20 317,29" stroke="url(#dHorn)" strokeWidth="5.2" fill="none" strokeLinecap="round"/>
      <path d="M299,38 Q305,20 317,29" stroke="#ffe08a" strokeWidth="1.5"  fill="none" strokeLinecap="round" opacity="0.44"/>
      <path d="M302,32 Q306,31 308,34" stroke="#987030" strokeWidth="1.2" fill="none" opacity="0.58"/>
      <path d="M304,26 Q308,25 309,28" stroke="#987030" strokeWidth="0.9" fill="none" opacity="0.48"/>
      <path d="M314,36 Q320,17 331,26" stroke="url(#dHorn)" strokeWidth="4.7" fill="none" strokeLinecap="round"/>
      <path d="M314,36 Q320,17 331,26" stroke="#ffe08a" strokeWidth="1.3"  fill="none" strokeLinecap="round" opacity="0.40"/>
      <path d="M307,35 Q310,27 315,30" stroke="url(#dHorn)" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
      <path d="M322,33 Q325,26 330,29" stroke="url(#dHorn)" strokeWidth="2.1" fill="none" strokeLinecap="round"/>

      {/* ── CREST / FRILL ── */}
      <path d="M292,46 Q284,34 289,40 Q281,29 287,35 Q279,25 285,33"
            stroke="#2d7a14" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.66"/>

      {/* ── EYE ── */}
      {/* Outer aura */}
      <circle ref={eyeRingRef} cx="304" cy="46" r="15" fill="none" stroke="#ff7700"
              strokeWidth="2.2" opacity="0.30" filter="url(#eyeAura)"/>
      {/* Socket */}
      <circle cx="304" cy="46" r="9.2" fill="#040200"/>
      {/* Iris */}
      <circle cx="304" cy="46" r="7.2" fill="url(#dEye)" filter="url(#eyeGlow)"/>
      {/* Iris rays */}
      {[0, 40, 80, 120, 160].map(angle => {
        const rad = angle * Math.PI / 180;
        return (
          <line key={angle}
            x1={304 + Math.cos(rad) * 2.6} y1={46 + Math.sin(rad) * 2.6}
            x2={304 + Math.cos(rad) * 6.8} y2={46 + Math.sin(rad) * 6.8}
            stroke="#bb3300" strokeWidth="0.6" opacity="0.50"
          />
        );
      })}
      {/* Slit pupil */}
      <ellipse ref={pupilRef} cx="304" cy="46" rx="2.4" ry="5.2" fill="#020100"/>
      {/* Highlights */}
      <circle cx="306.5" cy="43"   r="1.9" fill="rgba(255,255,210,0.78)"/>
      <circle cx="301.8" cy="49.2" r="0.9" fill="rgba(255,255,210,0.28)"/>
      {/* Glow ring */}
      <circle cx="304" cy="46" r="11.2" fill="none" stroke="#ff8800" strokeWidth="0.9" opacity="0.26"/>

      {/* ── FLAME ── */}
      <g ref={flameRef}>
        {/* Outer corona */}
        <ellipse cx="400" cy="52" rx="33" ry="15" fill="#ff2200" opacity="0.17" filter="url(#flameGlow)"/>
        {/* Base flame */}
        <path d="M372,54 Q390,39 414,37 Q428,39 430,50 Q425,62 411,67 Q390,71 373,63 Z"
              fill="#ff3300" opacity="0.70" filter="url(#flameGlow)"/>
        {/* Middle flame */}
        <path d="M374,55 Q390,43 412,41 Q423,44 425,53 Q419,63 407,65 Q389,68 375,60 Z"
              fill="url(#dFlame)" opacity="0.91"/>
        {/* Inner flame */}
        <path d="M376,56 Q390,49 410,47 Q419,51 417,57 Q412,64 397,64 Q382,62 378,59 Z"
              fill="url(#dFlame2)" opacity="0.88"/>
        {/* Hot core */}
        <ellipse cx="393" cy="54" rx="11" ry="6.5" fill="url(#dFlameCore)" opacity="0.62"/>
        {/* White-hot tip */}
        <ellipse cx="392" cy="54" rx="5.5" ry="3.2" fill="#ffffff" opacity="0.26"/>
        {/* Flame tongue 1 */}
        <path d="M412,37 Q424,28 430,33 Q426,43 420,41 Z" fill="#ff9900" opacity="0.60"/>
        {/* Flame tongue 2 */}
        <path d="M417,42 Q428,34 432,40 Q430,50 424,48 Z" fill="#ffcc00" opacity="0.50"/>
        {/* Heat shimmer lines */}
        <path d="M420,37 Q424,31 422,35" stroke="#ffee44" strokeWidth="0.7" fill="none" opacity="0.38"/>
        <path d="M426,43 Q430,37 428,41" stroke="#ffee44" strokeWidth="0.6" fill="none" opacity="0.32"/>
      </g>

      {/* ── FIRE SPARKS (GSAP-driven) ── */}
      <g ref={sparksRef}>
        {SPARK_DATA.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.color} opacity="0" filter="url(#flameGlow)"/>
        ))}
      </g>

      {/* ── NOSTRIL SMOKE (GSAP-driven) ── */}
      <g ref={smokeRef}>
        <circle cx="362" cy="51" r="1.2" fill="#c0c0c0" opacity="0"/>
        <circle cx="362" cy="51" r="1.2" fill="#a0a0a0" opacity="0"/>
        <circle cx="362" cy="51" r="1.2" fill="#b0b0b0" opacity="0"/>
      </g>
    </svg>
  );
}
