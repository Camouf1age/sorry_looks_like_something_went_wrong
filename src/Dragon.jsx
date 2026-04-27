import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const W = 430, H = 155;

export default function Dragon() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const s = {
      wn: 0, wf: 0,
      tail: 0,
      breath: 0,
      nY: 0,
      fSX: 1, fSY: 1, fOp: 0.88,
      eyeOp: 0.30, eyeS: 1,
      pupY: 1,
    };

    const SPARKS = [
      { x:421,y:64,r:2.2,dur:0.72,col:"#ffdd44" },
      { x:427,y:59,r:1.5,dur:0.52,col:"#ffffff" },
      { x:423,y:68,r:2.6,dur:0.88,col:"#ff8800" },
      { x:419,y:61,r:1.9,dur:0.62,col:"#ffcc00" },
      { x:425,y:66,r:2.0,dur:0.78,col:"#ff5500" },
    ];
    const sparks = SPARKS.map(p => ({ ...p, cx:p.x, cy:p.y, cr:p.r, co:0 }));
    const smoke  = [
      {cx:396,cy:66,cr:1.5,co:0},
      {cx:396,cy:66,cr:1.5,co:0},
      {cx:396,cy:66,cr:1.5,co:0},
    ];

    const glow  = (c, b) => { ctx.shadowColor = c; ctx.shadowBlur = b; };
    const noGlw = ()     => { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; };

    // ── Ambient haze ─────────────────────────────────────────────────────────
    function drawAmbient() {
      ctx.save();
      ctx.shadowColor = "rgba(20,80,180,0.38)"; ctx.shadowBlur = 62;
      ctx.fillStyle   = "rgba(10,46,120,0.14)";
      ctx.beginPath(); ctx.ellipse(205,102,148,38,0,0,Math.PI*2); ctx.fill();
      ctx.shadowColor = "rgba(255,60,0,0.32)"; ctx.shadowBlur = 52;
      ctx.fillStyle   = "rgba(255,55,0,0.10)";
      ctx.beginPath(); ctx.ellipse(416,66,46,16,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }

    // ── Far wing (behind body) ───────────────────────────────────────────────
    function drawFarWing() {
      ctx.save();
      ctx.translate(192, 88); ctx.rotate(s.wf * Math.PI/180); ctx.translate(-192,-88);

      const g = ctx.createLinearGradient(100,34,192,88);
      g.addColorStop(0, "rgba(12,4,26,0.96)");
      g.addColorStop(1, "rgba(20,10,44,0.52)");
      ctx.fillStyle = g;

      // Three membrane panels
      [
        [[192,88],[116,32],[134,66]],
        [[192,88],[134,66],[108,68]],
        [[192,88],[108,68],[118,82]],
      ].forEach((pts, i) => {
        ctx.globalAlpha = [0.66, 0.58, 0.50][i];
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        pts.slice(1).forEach(([x,y]) => ctx.lineTo(x,y));
        ctx.closePath(); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Bone spars
      [[192,88,116,32,1.5],[192,88,108,68,1.2],[192,88,126,80,1.0]]
        .forEach(([x1,y1,x2,y2,w]) => {
          ctx.strokeStyle = "#1a5060"; ctx.lineWidth = w; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        });
      ctx.restore();
    }

    // ── Tail ─────────────────────────────────────────────────────────────────
    function drawTail() {
      ctx.save();
      ctx.translate(112, 98); ctx.rotate(s.tail * Math.PI/180); ctx.translate(-112,-98);

      const tg = ctx.createLinearGradient(112,98,18,82);
      tg.addColorStop(0, "#1a2e5c"); tg.addColorStop(1, "#0a1428");
      ctx.strokeStyle = tg; ctx.lineWidth = 17; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(112,98);
      ctx.bezierCurveTo(88,108,62,108,42,100);
      ctx.bezierCurveTo(26,92,18,82,20,72);
      ctx.bezierCurveTo(14,66,18,57,24,61);
      ctx.stroke();

      // Underbelly stripe on tail
      ctx.strokeStyle = "rgba(175,68,18,0.42)"; ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(112,100);
      ctx.bezierCurveTo(88,110,64,110,44,102);
      ctx.bezierCurveTo(28,94,20,84,22,74);
      ctx.stroke();

      // Spade tip
      glow("#1080a0", 10);
      ctx.fillStyle = "#0c1e3c";
      ctx.beginPath();
      ctx.moveTo(24,61); ctx.lineTo(14,49); ctx.lineTo(20,54);
      ctx.lineTo(26,44); ctx.lineTo(32,54); ctx.lineTo(40,51);
      ctx.lineTo(30,64); ctx.closePath(); ctx.fill();
      noGlw();

      // Dorsal ridges
      [[96,100,93,88,98,91,2.1],[78,106,75,94,80,97,1.9],
       [62,106,59,94,64,97,1.6],[46,101,44,90,48,93,1.3]]
        .forEach(([mx,my,qx,qy,ex2,ey2,w]) => {
          ctx.strokeStyle = "#186880"; ctx.lineWidth = w; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(mx,my); ctx.quadraticCurveTo(qx,qy,ex2,ey2); ctx.stroke();
        });
      ctx.restore();
    }

    // ── Body ─────────────────────────────────────────────────────────────────
    function drawBody() {
      const bsx = 1 + s.breath * 0.008;
      const bsy = 1 + s.breath * 0.024;
      ctx.save();
      ctx.translate(200,96); ctx.scale(bsx,bsy); ctx.translate(-200,-96);

      // Drop shadow
      ctx.shadowColor = "rgba(0,0,0,0.32)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 12;
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.beginPath();
      ctx.moveTo(118,94); ctx.bezierCurveTo(120,72,146,60,194,58);
      ctx.bezierCurveTo(238,56,270,67,280,82); ctx.bezierCurveTo(280,124,246,138,198,138);
      ctx.bezierCurveTo(152,138,116,130,116,104); ctx.closePath(); ctx.fill();
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

      // Main body — deep midnight blue
      const bg = ctx.createLinearGradient(118,60,280,138);
      bg.addColorStop(0,   "#1c3262");
      bg.addColorStop(0.35,"#102248");
      bg.addColorStop(0.72,"#0a1832");
      bg.addColorStop(1,   "#04091a");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(118,94); ctx.bezierCurveTo(120,72,146,60,194,58);
      ctx.bezierCurveTo(238,56,270,67,280,82); ctx.bezierCurveTo(280,124,246,138,198,138);
      ctx.bezierCurveTo(152,138,116,130,116,104); ctx.closePath(); ctx.fill();

      // Underbelly — warm amber/sienna
      const belly = ctx.createLinearGradient(128,118,280,120);
      belly.addColorStop(0, "rgba(195,72,18,0.65)");
      belly.addColorStop(0.5,"rgba(155,50,14,0.44)");
      belly.addColorStop(1, "rgba(100,30,8,0.18)");
      ctx.fillStyle = belly;
      ctx.beginPath();
      ctx.moveTo(130,120); ctx.bezierCurveTo(158,136,194,142,232,138);
      ctx.bezierCurveTo(260,134,278,124,280,114);
      ctx.bezierCurveTo(280,122,268,132,244,136);
      ctx.bezierCurveTo(208,142,162,138,130,126); ctx.closePath(); ctx.fill();

      // Iridescent dorsal sheen
      const sh = ctx.createRadialGradient(182,72,0,182,72,62);
      sh.addColorStop(0, "rgba(18,180,200,0.24)");
      sh.addColorStop(0.5,"rgba(8,100,150,0.10)");
      sh.addColorStop(1,  "rgba(0,0,0,0)");
      ctx.fillStyle = sh;
      ctx.beginPath(); ctx.ellipse(182,72,60,14,0,0,Math.PI*2); ctx.fill();

      ctx.restore();

      // Scale rows (crisp, outside breath transform)
      [
        { y:84, yc:77, start:128, end:256, sw:1.4, a:0.44, col:"rgba(18,160,180,1)" },
        { y:96, yc:89, start:134, end:250, sw:1.1, a:0.34, col:"rgba(14,128,148,1)" },
        { y:108,yc:101,start:128, end:243, sw:0.9, a:0.25, col:"rgba(10,98,118,1)"  },
      ].forEach(({y,yc,start,end,sw,a,col}) => {
        ctx.strokeStyle = col; ctx.lineWidth = sw; ctx.globalAlpha = a;
        for (let x = start; x <= end; x += 11) {
          ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x+5.5,yc,x+11,y); ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;

      // Dorsal spines — teal-cyan
      [[194,66,197,53,201,58,2.7],[209,65,212,51,216,56,2.4],
       [223,64,226,49,230,54,2.1],[237,63,240,47,244,52,1.8],
       [251,62,254,45,258,50,1.5]]
        .forEach(([mx,my,qx,qy,ex2,ey2,w]) => {
          glow("#18c0d0", 6); ctx.strokeStyle = "#18b0c8"; ctx.lineWidth = w; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(mx,my); ctx.quadraticCurveTo(qx,qy,ex2,ey2); ctx.stroke(); noGlw();
          ctx.strokeStyle = "rgba(90,240,255,0.28)"; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(mx+1,my); ctx.quadraticCurveTo(qx+1,qy,ex2+1,ey2); ctx.stroke();
        });
    }

    // ── Near wing ────────────────────────────────────────────────────────────
    function drawNearWing() {
      ctx.save();
      ctx.translate(224, 74); ctx.rotate(s.wn * Math.PI/180); ctx.translate(-224,-74);

      const g = ctx.createLinearGradient(170,6,224,74);
      g.addColorStop(0,   "rgba(10,4,24,0.98)");
      g.addColorStop(0.5, "rgba(14,6,36,0.88)");
      g.addColorStop(1,   "rgba(20,10,48,0.60)");

      // Four wing panels
      [
        { pts:[[224,74],[174,8],[206,18]],         a:1.00 },
        { pts:[[224,74],[206,18],[234,6]],          a:0.94 },
        { pts:[[224,74],[234,6],[258,14]],          a:0.88 },
        { pts:[[224,74],[258,14],[270,34],[256,70]],a:0.82 },
      ].forEach(({pts,a}) => {
        ctx.globalAlpha = a; ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
        pts.slice(1).forEach(([x,y]) => ctx.lineTo(x,y));
        ctx.closePath(); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Membrane sheen
      ctx.fillStyle = "rgba(18,100,130,0.07)";
      ctx.beginPath(); ctx.moveTo(224,74); ctx.lineTo(174,8); ctx.lineTo(206,18); ctx.closePath(); ctx.fill();

      // Bone spars
      [[224,74,174,8,1.9],[224,74,206,18,1.6],[224,74,234,6,1.4],
       [224,74,258,14,1.2],[224,74,268,40,1.0]]
        .forEach(([x1,y1,x2,y2,w]) => {
          ctx.strokeStyle = "#186880"; ctx.lineWidth = w; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        });

      // Veins
      ctx.strokeStyle = "rgba(16,100,130,0.38)"; ctx.lineWidth = 0.55;
      ctx.beginPath(); ctx.moveTo(196,36); ctx.quadraticCurveTo(212,54,222,72); ctx.stroke();
      ctx.globalAlpha = 0.26;
      ctx.beginPath(); ctx.moveTo(214,22); ctx.quadraticCurveTo(222,46,223,72); ctx.stroke();
      ctx.globalAlpha = 1;

      // Wing-tip claws
      ctx.fillStyle = "#ddd8c0";
      [[174,8],[206,18],[234,6]].forEach(([tx,ty]) => {
        ctx.beginPath();
        ctx.moveTo(tx,ty); ctx.quadraticCurveTo(tx-4,ty-4,tx-7,ty); ctx.quadraticCurveTo(tx-2,ty+4,tx+2,ty+2); ctx.closePath(); ctx.fill();
      });

      ctx.restore();
    }

    // ── Legs ─────────────────────────────────────────────────────────────────
    function drawLegs() {
      const dc = "#0c1c3a", claw = "#e0d8b0";
      ctx.lineCap = "round";

      // Back pair
      [[150,118,143,133,133,143],[150,118,154,133,146,143]].forEach(([x1,y1,cx2,cy2,x2,y2]) => {
        ctx.strokeStyle = dc; ctx.lineWidth = 12;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cx2,cy2,x2,y2); ctx.stroke();
      });
      ctx.strokeStyle = claw; ctx.lineWidth = 2.4;
      [[133,143,126,151],[146,143,139,152],[133,143,129,153]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });

      // Front pair
      [[244,118,235,136,224,148],[244,118,247,136,240,147],[244,118,257,130,255,142]].forEach(([x1,y1,cx2,cy2,x2,y2]) => {
        ctx.strokeStyle = dc; ctx.lineWidth = 13;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cx2,cy2,x2,y2); ctx.stroke();
      });
      ctx.strokeStyle = "rgba(18,100,130,0.22)"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(244,118); ctx.quadraticCurveTo(235,136,224,148); ctx.stroke();
      ctx.strokeStyle = claw; ctx.lineWidth = 2.8;
      [[224,148,216,156],[240,147,233,156],[255,142,250,151]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
    }

    // ── Neck ─────────────────────────────────────────────────────────────────
    function drawNeck() {
      ctx.save(); ctx.translate(0, s.nY);

      const neckG = ctx.createLinearGradient(264,78,326,50);
      neckG.addColorStop(0,   "#1c3060");
      neckG.addColorStop(0.55,"#204070");
      neckG.addColorStop(1,   "#162848");
      ctx.fillStyle = neckG;
      ctx.beginPath();
      ctx.moveTo(264,78);
      ctx.bezierCurveTo(284,62,306,52,326,50);
      ctx.bezierCurveTo(330,56,330,68,326,72);
      ctx.bezierCurveTo(308,76,288,86,270,92);
      ctx.closePath(); ctx.fill();

      // Underbelly stripe on neck
      ctx.fillStyle = "rgba(182,68,18,0.36)";
      ctx.beginPath();
      ctx.moveTo(268,88); ctx.bezierCurveTo(288,80,310,72,328,70);
      ctx.bezierCurveTo(328,74,326,76,324,78);
      ctx.bezierCurveTo(306,80,282,88,266,96); ctx.closePath(); ctx.fill();

      // Highlight
      ctx.strokeStyle = "rgba(18,160,190,0.18)"; ctx.lineWidth = 2.4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(266,80); ctx.bezierCurveTo(286,64,308,54,328,52); ctx.stroke();

      // Neck spines
      [[280,66,284,55,288,59,1.9],[294,60,298,49,302,53,1.7],[308,54,312,43,316,47,1.5]]
        .forEach(([mx,my,qx,qy,ex2,ey2,w]) => {
          glow("#18b0c8",4); ctx.strokeStyle = "#18b0c8"; ctx.lineWidth = w; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(mx,my); ctx.quadraticCurveTo(qx,qy,ex2,ey2); ctx.stroke(); noGlw();
        });
      ctx.restore();
    }

    // ── Head ─────────────────────────────────────────────────────────────────
    function drawHead() {
      ctx.save(); ctx.translate(0, s.nY);

      // Lower jaw
      const lj = ctx.createLinearGradient(324,58,392,82);
      lj.addColorStop(0,"#0c1c38"); lj.addColorStop(1,"#060e20");
      ctx.fillStyle = lj;
      ctx.beginPath();
      ctx.moveTo(324,58); ctx.bezierCurveTo(346,66,370,74,390,78);
      ctx.bezierCurveTo(396,82,396,86,386,86);
      ctx.bezierCurveTo(366,84,342,76,320,68); ctx.closePath(); ctx.fill();

      // Skull
      const hg = ctx.createLinearGradient(314,30,376,72);
      hg.addColorStop(0,   "#1c3060");
      hg.addColorStop(0.5, "#20406e");
      hg.addColorStop(1,   "#162848");
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.ellipse(346,52,40,22,0,0,Math.PI*2); ctx.fill();

      // Iridescent skull sheen
      const hs = ctx.createRadialGradient(332,42,0,332,42,30);
      hs.addColorStop(0,"rgba(18,180,210,0.18)"); hs.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle = hs; ctx.beginPath(); ctx.ellipse(332,42,26,10,0,0,Math.PI*2); ctx.fill();

      // Snout (elongated wedge)
      const sg = ctx.createLinearGradient(338,52,412,72);
      sg.addColorStop(0,"#1a3060"); sg.addColorStop(1,"#0a1c38");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(338,54); ctx.bezierCurveTo(366,50,392,52,410,56);
      ctx.bezierCurveTo(414,62,410,70,400,72);
      ctx.bezierCurveTo(378,70,354,64,340,60); ctx.closePath(); ctx.fill();

      ctx.strokeStyle = "rgba(18,140,170,0.20)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(340,52); ctx.bezierCurveTo(368,48,394,50,412,54); ctx.stroke();

      // Nostril
      ctx.save(); ctx.translate(398,58); ctx.rotate(-10*Math.PI/180);
      ctx.fillStyle = "#020409"; ctx.beginPath(); ctx.ellipse(0,0,5.6,3.4,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "#060c18"; ctx.beginPath(); ctx.ellipse(0,0,2.7,1.8,0,0,Math.PI*2); ctx.fill();
      ctx.restore();

      // Jaw line
      ctx.strokeStyle = "rgba(6,18,36,0.72)"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(320,64); ctx.bezierCurveTo(346,70,370,74,390,76); ctx.quadraticCurveTo(398,78,400,76); ctx.stroke();

      // Upper teeth
      ctx.fillStyle = "#ddd8b8";
      [[326,57,329,67,332,57],[338,58,341,68,344,58],[350,59,353,69,356,59],[362,60,365,70,368,60]]
        .forEach(([x1,yb,x2,yt,x3]) => {
          ctx.globalAlpha = 0.88;
          ctx.beginPath(); ctx.moveTo(x1,yb); ctx.lineTo(x2,yt); ctx.lineTo(x3,yb); ctx.closePath(); ctx.fill();
        });
      // Lower teeth
      ctx.fillStyle = "#c8c09c";
      [[332,66,335,60,338,66],[344,68,347,62,350,68],[356,70,359,64,362,70]]
        .forEach(([x1,yb,x2,yt,x3]) => {
          ctx.globalAlpha = 0.75;
          ctx.beginPath(); ctx.moveTo(x1,yb); ctx.lineTo(x2,yt); ctx.lineTo(x3,yb); ctx.closePath(); ctx.fill();
        });
      ctx.globalAlpha = 1;

      // Tongue — forked
      ctx.fillStyle = "#aa1830"; ctx.globalAlpha = 0.90;
      ctx.beginPath(); ctx.moveTo(376,70); ctx.quadraticCurveTo(392,74,404,72);
      ctx.quadraticCurveTo(404,78,396,78); ctx.quadraticCurveTo(390,78,382,76); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#880020"; ctx.lineWidth = 1.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(404,72); ctx.lineTo(410,67); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(404,72); ctx.lineTo(411,76); ctx.stroke();

      // Brow ridge
      glow("#18a0c8",7); ctx.strokeStyle = "#28b8d0"; ctx.lineWidth = 2.8; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(314,42); ctx.bezierCurveTo(330,34,350,32,368,34); ctx.stroke(); noGlw();

      // Cheek scale texture
      ctx.strokeStyle = "rgba(18,150,180,0.28)"; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(322,48); ctx.quadraticCurveTo(336,44,346,48); ctx.stroke();
      ctx.globalAlpha = 0.22;
      ctx.beginPath(); ctx.moveTo(336,44); ctx.quadraticCurveTo(350,40,360,44); ctx.stroke();
      ctx.globalAlpha = 1;

      // Main horn
      const h1g = ctx.createLinearGradient(322,38,336,20);
      h1g.addColorStop(0,"#e8d888"); h1g.addColorStop(0.5,"#c8a840"); h1g.addColorStop(1,"#8a6010");
      glow("#c0a020",8); ctx.strokeStyle = h1g; ctx.lineWidth = 5.8; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(322,38); ctx.bezierCurveTo(328,16,344,22,340,28); ctx.stroke(); noGlw();
      ctx.strokeStyle = "rgba(255,240,150,0.38)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(322,38); ctx.bezierCurveTo(328,16,344,22,340,28); ctx.stroke();
      // Horn ring marks
      ctx.strokeStyle = "rgba(138,96,24,0.52)"; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(324,30); ctx.quadraticCurveTo(330,29,332,32); ctx.stroke();
      ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(326,24); ctx.quadraticCurveTo(331,23,332,26); ctx.stroke();

      // Secondary horn
      const h2g = ctx.createLinearGradient(336,36,352,17);
      h2g.addColorStop(0,"#e8d888"); h2g.addColorStop(0.5,"#c8a840"); h2g.addColorStop(1,"#8a6010");
      glow("#c0a020",7); ctx.strokeStyle = h2g; ctx.lineWidth = 5.0;
      ctx.beginPath(); ctx.moveTo(336,36); ctx.bezierCurveTo(344,12,360,20,356,26); ctx.stroke(); noGlw();
      ctx.strokeStyle = "rgba(255,240,150,0.30)"; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(336,36); ctx.bezierCurveTo(344,12,360,20,356,26); ctx.stroke();

      // Crest / head frill spines
      ctx.strokeStyle = "rgba(18,140,170,0.62)"; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(314,46); ctx.quadraticCurveTo(304,34,310,40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(310,40); ctx.quadraticCurveTo(300,28,306,34); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(306,34); ctx.quadraticCurveTo(298,22,304,30); ctx.stroke();

      ctx.restore();
    }

    // ── Eye ──────────────────────────────────────────────────────────────────
    function drawEye() {
      ctx.save(); ctx.translate(0, s.nY);
      const ex = 326, ey = 46;

      // Aura ring
      ctx.save();
      ctx.translate(ex,ey); ctx.scale(s.eyeS,s.eyeS); ctx.translate(-ex,-ey);
      ctx.globalAlpha = s.eyeOp; glow("#ff9900",14);
      ctx.strokeStyle = "#ffaa00"; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(ex,ey,16,0,Math.PI*2); ctx.stroke();
      noGlw(); ctx.globalAlpha = 1; ctx.restore();

      // Socket
      ctx.fillStyle = "#010100"; ctx.beginPath(); ctx.arc(ex,ey,9.5,0,Math.PI*2); ctx.fill();

      // Iris — amber-gold
      glow("#ff8800",10);
      const iris = ctx.createRadialGradient(ex-2,ey-3,0,ex,ey,7.5);
      iris.addColorStop(0,   "#fffb80");
      iris.addColorStop(0.22,"#ffcc00");
      iris.addColorStop(0.58,"#e06000");
      iris.addColorStop(1,   "#600000");
      ctx.fillStyle = iris; ctx.beginPath(); ctx.arc(ex,ey,7.5,0,Math.PI*2); ctx.fill(); noGlw();

      // Iris rays
      ctx.strokeStyle = "rgba(180,60,0,0.44)"; ctx.lineWidth = 0.6;
      [0,36,72,108,144].forEach(a => {
        const r = a*Math.PI/180;
        ctx.beginPath();
        ctx.moveTo(ex+Math.cos(r)*2.5, ey+Math.sin(r)*2.5);
        ctx.lineTo(ex+Math.cos(r)*7.0, ey+Math.sin(r)*7.0);
        ctx.stroke();
      });

      // Vertical slit pupil
      ctx.save(); ctx.translate(ex,ey); ctx.scale(1,s.pupY);
      ctx.fillStyle = "#000000"; ctx.beginPath(); ctx.ellipse(0,0,2.2,5.5,0,0,Math.PI*2); ctx.fill();
      ctx.restore();

      // Highlights
      ctx.fillStyle = "rgba(255,255,220,0.86)"; ctx.beginPath(); ctx.arc(ex+2.5,ey-3,1.8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,220,0.26)"; ctx.beginPath(); ctx.arc(ex-2.5,ey+3,0.9,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }

    // ── Flame ────────────────────────────────────────────────────────────────
    function drawFlame() {
      ctx.save();
      const px = 398, py = 64;
      ctx.translate(px,py); ctx.scale(s.fSX,s.fSY); ctx.translate(-px,-py);
      ctx.globalAlpha = s.fOp;

      // Corona
      glow("#ff4400",26); ctx.fillStyle = "rgba(255,65,0,0.16)";
      ctx.beginPath(); ctx.ellipse(416,64,30,14,0,0,Math.PI*2); ctx.fill(); noGlw();

      // Base
      glow("#ff3300",12); ctx.fillStyle = "rgba(255,55,0,0.68)";
      ctx.beginPath();
      ctx.moveTo(398,64); ctx.bezierCurveTo(408,46,426,40,436,46);
      ctx.bezierCurveTo(442,52,440,64,432,72);
      ctx.bezierCurveTo(418,76,404,74,398,68); ctx.closePath(); ctx.fill(); noGlw();

      // Mid flame
      const mf = ctx.createRadialGradient(410,62,0,410,62,34);
      mf.addColorStop(0,   "rgba(255,255,200,0.96)");
      mf.addColorStop(0.2, "rgba(255,228,0,1)");
      mf.addColorStop(0.5, "rgba(255,90,0,1)");
      mf.addColorStop(0.85,"rgba(200,28,0,0.18)");
      mf.addColorStop(1,   "rgba(160,8,0,0.04)");
      ctx.fillStyle = mf;
      ctx.beginPath();
      ctx.moveTo(400,65); ctx.bezierCurveTo(410,48,426,44,434,50);
      ctx.bezierCurveTo(438,56,436,66,428,71);
      ctx.bezierCurveTo(416,74,404,72,400,68); ctx.closePath(); ctx.fill();

      // Inner flame
      const inf = ctx.createRadialGradient(412,62,0,412,62,20);
      inf.addColorStop(0,   "rgba(255,255,255,0.93)");
      inf.addColorStop(0.22,"rgba(255,240,60,1)");
      inf.addColorStop(0.66,"rgba(255,80,0,0.40)");
      inf.addColorStop(1,   "rgba(255,30,0,0)");
      ctx.fillStyle = inf;
      ctx.beginPath();
      ctx.moveTo(402,65); ctx.bezierCurveTo(410,50,426,48,432,54);
      ctx.bezierCurveTo(435,60,433,68,425,72);
      ctx.bezierCurveTo(414,73,404,70,402,67); ctx.closePath(); ctx.fill();

      // White-hot core
      const core = ctx.createRadialGradient(413,62,0,413,62,11);
      core.addColorStop(0,   "#ffffff");
      core.addColorStop(0.38,"rgba(255,255,200,0.88)");
      core.addColorStop(1,   "rgba(255,170,0,0)");
      ctx.fillStyle = core; ctx.beginPath(); ctx.ellipse(414,62,11,7,0,0,Math.PI*2); ctx.fill();

      // Flame tendrils
      ctx.fillStyle = "rgba(255,140,0,0.54)";
      ctx.beginPath(); ctx.moveTo(430,42); ctx.bezierCurveTo(438,32,444,36,442,42); ctx.bezierCurveTo(440,48,434,46,430,42); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,200,0,0.44)";
      ctx.beginPath(); ctx.moveTo(434,50); ctx.bezierCurveTo(442,40,448,46,446,52); ctx.bezierCurveTo(444,58,438,56,434,50); ctx.closePath(); ctx.fill();

      ctx.globalAlpha = 1; ctx.restore();
    }

    // ── Sparks + smoke ────────────────────────────────────────────────────────
    function drawParticles() {
      sparks.forEach(sp => {
        if (sp.co <= 0) return;
        glow(sp.col,7); ctx.fillStyle = sp.col; ctx.globalAlpha = sp.co;
        ctx.beginPath(); ctx.arc(sp.cx,sp.cy,Math.max(0,sp.cr),0,Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1; noGlw();
      });
      smoke.forEach(sm => {
        if (sm.co <= 0) return;
        ctx.fillStyle = "#b0b8c8"; ctx.globalAlpha = sm.co;
        ctx.beginPath(); ctx.arc(sm.cx,sm.cy,Math.max(0,sm.cr),0,Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
      });
    }

    // ── Render ────────────────────────────────────────────────────────────────
    function render() {
      ctx.clearRect(0,0,W,H);
      drawAmbient();
      drawFarWing();
      drawTail();
      drawLegs();
      drawBody();
      drawNearWing();
      drawNeck();
      drawHead();
      drawEye();
      drawFlame();
      drawParticles();
    }

    gsap.ticker.add(render);

    // ── GSAP timelines ────────────────────────────────────────────────────────
    const wn = gsap.timeline({ repeat:-1 });
    wn.to(s,{wn:-36,duration:0.34,ease:"power3.out"})
      .to(s,{wn:28,duration:0.56,ease:"power2.inOut"})
      .to(s,{wn:4,duration:0.24,ease:"back.out(2.5)"})
      .to(s,{wn:0,duration:0.20,ease:"none"});

    const wf = gsap.timeline({ repeat:-1, delay:0.22 });
    wf.to(s,{wf:-25,duration:0.34,ease:"power3.out"})
      .to(s,{wf:19,duration:0.56,ease:"power2.inOut"})
      .to(s,{wf:3,duration:0.24,ease:"back.out(2.0)"})
      .to(s,{wf:0,duration:0.20,ease:"none"});

    const nb = gsap.timeline({ repeat:-1 });
    nb.to(s,{nY:-5,duration:0.34,ease:"power3.out"})
      .to(s,{nY:1,duration:0.56,ease:"sine.inOut"})
      .to(s,{nY:0,duration:0.40,ease:"sine.out"});

    const fl = gsap.timeline({ repeat:-1 });
    [[1.22,1.18,0.96,0.12],[0.80,0.86,0.44,0.13],[1.18,1.14,0.94,0.16],
     [0.87,0.90,0.60,0.11],[1.12,1.10,0.90,0.14],[0.94,0.95,0.70,0.10],[1.0,1.0,0.88,0.14]]
      .forEach(([sX,sY,o,d]) => fl.to(s,{fSX:sX,fSY:sY,fOp:o,duration:d,ease:"none"}));

    const tl = gsap.timeline({ repeat:-1 });
    tl.to(s,{tail:-17,duration:0.82,ease:"power2.inOut"})
      .to(s,{tail:13,duration:1.05,ease:"power2.inOut"})
      .to(s,{tail:-6,duration:0.56,ease:"power1.out"})
      .to(s,{tail:0,duration:0.80,ease:"sine.inOut"});

    gsap.to(s,{breath:1,duration:2.6,ease:"sine.inOut",yoyo:true,repeat:-1});
    gsap.to(s,{eyeOp:0.04,eyeS:1.28,duration:1.5,ease:"sine.inOut",yoyo:true,repeat:-1});
    gsap.to(s,{pupY:0.44,duration:1.9,ease:"sine.inOut",yoyo:true,repeat:-1});

    const sparkTls = sparks.map((sp,i) => {
      const dx = 6+Math.random()*9, dy = 22+Math.random()*16;
      const t = gsap.timeline({ repeat:-1, delay:i*0.13+Math.random()*0.32 });
      t.to(sp,{cy:sp.y-2,co:0.92,cr:sp.r,cx:sp.x,duration:sp.dur*0.12,ease:"none"})
       .to(sp,{cx:sp.x+dx,cy:sp.y-dy,cr:0,co:0,duration:sp.dur*0.88,ease:"power2.out"})
       .set(sp,{cx:sp.x,cy:sp.y,cr:sp.r,co:0});
      return t;
    });

    const smokeTls = smoke.map((sm,i) => {
      const drift = 382+(Math.random()-0.5)*6;
      const t = gsap.timeline({ repeat:-1, delay:i*1.1+Math.random()*0.5 });
      t.to(sm,{cy:60,co:0.18,duration:0.30})
       .to(sm,{cx:drift,cy:46,cr:5,co:0,duration:2.0,ease:"power1.out"})
       .set(sm,{cx:396,cy:66,cr:1.5,co:0});
      return t;
    });

    return () => {
      gsap.ticker.remove(render);
      [wn,wf,nb,fl,tl,...sparkTls,...smokeTls].forEach(t => t.kill());
      gsap.killTweensOf(s);
      sparks.forEach(sp => gsap.killTweensOf(sp));
      smoke.forEach(sm => gsap.killTweensOf(sm));
    };
  },[]);

  return <canvas ref={canvasRef} style={{ display:"block" }} />;
}
