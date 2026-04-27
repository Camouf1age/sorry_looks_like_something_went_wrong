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

    // ── Mutable state tweened by GSAP ────────────────────────────────────────
    const s = {
      wn: 0,       // near-wing rotation (deg)
      wf: 0,       // far-wing rotation (deg)
      tail: 0,     // tail rotation (deg)
      breath: 0,   // body breathing 0..1
      nY: 0,       // neck Y-offset
      fSX: 1, fSY: 1, fOp: 0.78, // flame scale + opacity
      eyeOp: 0.28, eyeS: 1,       // eye ring
      pupY: 1,                     // pupil scaleY
    };

    // Spark + smoke particles as plain objects
    const SPARK_SRC = [
      { x:416,y:47,r:2.4,dur:0.74,col:"#ffee44" },
      { x:422,y:52,r:1.7,dur:0.56,col:"#ffffff" },
      { x:418,y:43,r:2.8,dur:0.90,col:"#ff9900" },
      { x:424,y:50,r:1.8,dur:0.64,col:"#ffcc00" },
      { x:412,y:46,r:2.1,dur:0.80,col:"#ff6600" },
      { x:419,y:54,r:2.3,dur:0.69,col:"#ff8800" },
    ];
    const sparks = SPARK_SRC.map(s => ({ ...s, cx:s.x, cy:s.y, cr:s.r, co:0 }));
    const smoke  = [{cx:378,cy:53,cr:1.3,co:0},{cx:378,cy:53,cr:1.3,co:0},{cx:378,cy:53,cr:1.3,co:0}];

    // ── Helpers ──────────────────────────────────────────────────────────────
    const glow  = (c, blur) => { ctx.shadowColor = c; ctx.shadowBlur = blur; };
    const noGlow = ()        => { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; };

    function bodyGrad() {
      const g = ctx.createLinearGradient(82, 56, 164, 132);
      g.addColorStop(0,    "#3aaa18");
      g.addColorStop(0.35, "#1e7008");
      g.addColorStop(0.75, "#114606");
      g.addColorStop(1,    "#061c02");
      return g;
    }

    // ── Draw: ambient glow ────────────────────────────────────────────────────
    function drawAmbient() {
      ctx.save();
      ctx.shadowColor = "rgba(42,160,16,0.45)";
      ctx.shadowBlur  = 55;
      ctx.fillStyle   = "rgba(30,120,10,0.18)";
      ctx.beginPath(); ctx.ellipse(195, 92, 125, 36, 0, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = "rgba(255,50,0,0.38)";
      ctx.shadowBlur  = 48;
      ctx.fillStyle   = "rgba(255,50,0,0.12)";
      ctx.beginPath(); ctx.ellipse(403, 55, 42, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // ── Draw: far wing ────────────────────────────────────────────────────────
    function drawFarWing() {
      ctx.save();
      ctx.translate(149, 82); ctx.rotate(s.wf * Math.PI / 180); ctx.translate(-149, -82);
      const g = ctx.createLinearGradient(26, 36, 149, 82);
      g.addColorStop(0, "rgba(2,8,2,0.96)"); g.addColorStop(1, "rgba(16,34,4,0.56)");
      ctx.fillStyle = g;
      [[149,82,26,36,56,72, 0.58],[149,82,56,72,74,50, 0.50]].forEach(([ax,ay,bx,by,cx2,cy2,a]) => {
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.lineTo(cx2,cy2); ctx.closePath(); ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(22,58,8,0.48)"; ctx.lineWidth = 0.9; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(149,82); ctx.lineTo(26,36); ctx.stroke();
      ctx.strokeStyle = "rgba(22,58,8,0.36)"; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(149,82); ctx.lineTo(56,72); ctx.stroke();
      ctx.restore();
    }

    // ── Draw: near wing ───────────────────────────────────────────────────────
    function drawNearWing() {
      ctx.save();
      ctx.translate(153, 73); ctx.rotate(s.wn * Math.PI / 180); ctx.translate(-153, -73);
      const g = ctx.createLinearGradient(44, 3, 153, 73);
      g.addColorStop(0, "rgba(2,7,2,0.98)"); g.addColorStop(0.5, "rgba(6,18,2,0.88)"); g.addColorStop(1, "rgba(16,34,4,0.60)");

      [
        { pts:[[153,73],[44,3],[78,48]],          a:1.00 },
        { pts:[[153,73],[78,48],[102,16]],         a:0.92 },
        { pts:[[153,73],[102,16],[130,5]],         a:0.87 },
        { pts:[[153,73],[130,5],[150,24],[140,75]],a:0.80 },
      ].forEach(({pts, a}) => {
        ctx.globalAlpha = a; ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
        pts.slice(1).forEach(([x,y]) => ctx.lineTo(x,y));
        ctx.closePath(); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Sheen
      ctx.fillStyle = "rgba(42,112,16,0.08)";
      ctx.beginPath(); ctx.moveTo(153,73); ctx.lineTo(44,3); ctx.lineTo(78,48); ctx.closePath(); ctx.fill();

      // Bone spars
      [[153,73,44,3,1.8],[153,73,78,48,1.5],[153,73,102,16,1.3],[153,73,130,5,1.1],[153,73,150,24,1.0]]
        .forEach(([x1,y1,x2,y2,w]) => {
          ctx.strokeStyle = "#3a8016"; ctx.lineWidth = w; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        });

      // Veins
      ctx.strokeStyle = "rgba(26,74,10,0.40)"; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(64,26); ctx.quadraticCurveTo(108,52,149,72); ctx.stroke();
      ctx.globalAlpha = 0.32;
      ctx.beginPath(); ctx.moveTo(82,12); ctx.quadraticCurveTo(118,44,149,72); ctx.stroke();
      ctx.globalAlpha = 1;

      // Leading claws
      ctx.fillStyle = "#0d1e04";
      ctx.beginPath(); ctx.moveTo(44,3); ctx.quadraticCurveTo(39,-1,36,3); ctx.quadraticCurveTo(42,8,46,6); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(78,48); ctx.quadraticCurveTo(73,44,70,48); ctx.quadraticCurveTo(75,53,80,51); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    // ── Draw: tail ────────────────────────────────────────────────────────────
    function drawTail() {
      ctx.save();
      ctx.translate(82, 97); ctx.rotate(s.tail * Math.PI / 180); ctx.translate(-82, -97);
      const tg = ctx.createLinearGradient(82,97,10,80);
      tg.addColorStop(0,"#1e7008"); tg.addColorStop(1,"#0a2a04");
      ctx.strokeStyle = tg; ctx.lineWidth = 16; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(82,97); ctx.bezierCurveTo(60,112,34,110,16,102); ctx.bezierCurveTo(3,94,0,82,6,73); ctx.bezierCurveTo(0,67,4,58,10,62); ctx.stroke();
      // Belly stripe
      ctx.strokeStyle = "rgba(90,204,40,0.38)"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(82,97); ctx.bezierCurveTo(60,112,34,110,16,102); ctx.bezierCurveTo(5,96,2,86,8,77); ctx.stroke();
      // Diamond tip
      glow("#2aaa10", 8);
      ctx.fillStyle = "#1a5808";
      ctx.beginPath(); ctx.moveTo(10,62); ctx.lineTo(2,52); ctx.lineTo(14,57); ctx.lineTo(20,46); ctx.lineTo(26,57); ctx.lineTo(38,56); ctx.lineTo(22,66); ctx.closePath(); ctx.fill();
      noGlow();
      // Dorsal spines
      ctx.lineCap = "round";
      [[68,104,65,93,70,96,2.2],[52,111,49,100,54,103,2.0],[36,109,33,99,38,101,1.7],[22,102,20,93,24,95,1.4]]
        .forEach(([mx,my,qx,qy,ex2,ey2,w]) => {
          ctx.strokeStyle = "#44aa22"; ctx.lineWidth = w;
          ctx.beginPath(); ctx.moveTo(mx,my); ctx.quadraticCurveTo(qx,qy,ex2,ey2); ctx.stroke();
        });
      ctx.restore();
    }

    // ── Draw: body ────────────────────────────────────────────────────────────
    function drawBody() {
      const bs  = 1 + s.breath * 0.009;
      const bsY = 1 + s.breath * 0.028;
      ctx.save();
      ctx.translate(162,95); ctx.scale(bs,bsY); ctx.translate(-162,-95);

      // Drop shadow
      ctx.shadowColor = "rgba(0,0,0,0.28)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 10;
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.beginPath(); ctx.moveTo(84,90); ctx.bezierCurveTo(87,67,116,56,162,56); ctx.bezierCurveTo(204,56,238,66,248,80); ctx.bezierCurveTo(248,120,212,132,164,132); ctx.bezierCurveTo(116,132,82,124,82,100); ctx.closePath(); ctx.fill();
      noGlow(); ctx.shadowOffsetY = 0;

      // Main body
      ctx.fillStyle = bodyGrad();
      ctx.beginPath(); ctx.moveTo(84,90); ctx.bezierCurveTo(87,67,116,56,162,56); ctx.bezierCurveTo(204,56,238,66,248,80); ctx.bezierCurveTo(248,120,212,132,164,132); ctx.bezierCurveTo(116,132,82,124,82,100); ctx.closePath(); ctx.fill();

      // Belly
      const belly = ctx.createLinearGradient(92,112,248,120);
      belly.addColorStop(0,"rgba(90,204,40,0.52)"); belly.addColorStop(1,"rgba(30,96,12,0.26)");
      ctx.fillStyle = belly;
      ctx.beginPath(); ctx.moveTo(92,118); ctx.bezierCurveTo(118,130,150,136,186,134); ctx.bezierCurveTo(216,132,240,124,248,114); ctx.bezierCurveTo(248,120,238,128,214,132); ctx.bezierCurveTo(176,136,132,132,92,120); ctx.closePath(); ctx.fill();

      // Dorsal shine
      const shine = ctx.createRadialGradient(148,72,0,148,72,55);
      shine.addColorStop(0,"rgba(80,204,40,0.17)"); shine.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle = shine;
      ctx.beginPath(); ctx.ellipse(148,72,52,12,0,0,Math.PI*2); ctx.fill();

      ctx.restore();

      // Scale rows (outside breath-transform to keep crisp)
      [
        { y:82, yc:75, start:92,  end:224, sw:1.4, alpha:0.45, col:"rgba(70,192,32,1)"  },
        { y:92, yc:85, start:98,  end:218, sw:1.1, alpha:0.36, col:"rgba(56,168,24,1)"  },
        { y:102,yc:95, start:92,  end:212, sw:0.9, alpha:0.28, col:"rgba(42,138,16,1)"  },
      ].forEach(({y,yc,start,end,sw,alpha,col}) => {
        ctx.strokeStyle = col; ctx.lineWidth = sw; ctx.globalAlpha = alpha;
        for (let x = start; x <= end; x += 12) {
          ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x+6,yc,x+12,y); ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;

      // Dorsal spines
      [[162,66,165,53,169,58,2.70],[176,65.4,179,51.6,183,56.6,2.42],
       [190,64.8,193,50.2,197,55.2,2.14],[204,64.2,207,48.8,211,53.8,1.86],
       [218,63.6,221,47.4,225,52.4,1.58]]
        .forEach(([mx,my,qx,qy,ex2,ey2,w]) => {
          glow("#44cc20", 4);
          ctx.strokeStyle = "#56d428"; ctx.lineWidth = w; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(mx,my); ctx.quadraticCurveTo(qx,qy,ex2,ey2); ctx.stroke();
          noGlow();
          ctx.strokeStyle = "rgba(128,240,72,0.35)"; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(mx+1,my); ctx.quadraticCurveTo(qx+1,qy,ex2+1,ey2); ctx.stroke();
        });
    }

    // ── Draw: legs ────────────────────────────────────────────────────────────
    function drawLegs() {
      const lc = "#0e3e06", cl = "#c8a430";
      // Back legs
      ctx.lineCap = "round";
      [[116,120,110,132,100,142],[116,120,120,134,112,142]].forEach(([x1,y1,cx2,cy2,x2,y2]) => {
        ctx.strokeStyle = lc; ctx.lineWidth = 11;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cx2,cy2,x2,y2); ctx.stroke();
      });
      ctx.strokeStyle = cl; ctx.lineWidth = 2.5;
      [[100,142,93,149],[112,142,106,150],[100,142,96,151]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      // Front legs
      [[180,122,172,138,164,146],[180,122,184,138,178,146],[180,122,190,134,187,143]].forEach(([x1,y1,cx2,cy2,x2,y2]) => {
        ctx.strokeStyle = lc; ctx.lineWidth = 12;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cx2,cy2,x2,y2); ctx.stroke();
      });
      // Front highlight
      ctx.strokeStyle = "rgba(42,120,16,0.26)"; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(180,122); ctx.quadraticCurveTo(172,138,164,146); ctx.stroke();
      // Front claws
      ctx.strokeStyle = cl; ctx.lineWidth = 3.0;
      [[164,146,156,154],[178,146,171,154],[187,143,182,152]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
    }

    // ── Draw: neck ────────────────────────────────────────────────────────────
    function drawNeck() {
      ctx.save(); ctx.translate(0, s.nY);
      const ng = ctx.createLinearGradient(238,73,295,46);
      ng.addColorStop(0,"#1e7008"); ng.addColorStop(0.6,"#2a9010"); ng.addColorStop(1,"#1c6408");
      ctx.fillStyle = ng;
      ctx.beginPath(); ctx.moveTo(238,73); ctx.bezierCurveTo(256,60,275,50,295,46); ctx.bezierCurveTo(298,52,298,64,294,68); ctx.bezierCurveTo(276,74,258,84,242,88); ctx.closePath(); ctx.fill();
      // Highlight
      ctx.strokeStyle = "rgba(58,170,24,0.25)"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(240,75); ctx.bezierCurveTo(258,62,277,52,296,48); ctx.stroke();
      // Spines
      [[252,65,256,55,261,59,2.0],[266,58,270,48,275,52,1.8],[280,52,284,43,289,47,1.6]]
        .forEach(([mx,my,qx,qy,ex2,ey2,w]) => {
          glow("#44aa22", 3); ctx.strokeStyle = "#44aa22"; ctx.lineWidth = w; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(mx,my); ctx.quadraticCurveTo(qx,qy,ex2,ey2); ctx.stroke(); noGlow();
        });
      ctx.restore();
    }

    // ── Draw: head ────────────────────────────────────────────────────────────
    function drawHead() {
      ctx.save(); ctx.translate(0, s.nY);

      // Lower jaw
      const lj = ctx.createLinearGradient(294,52,370,86);
      lj.addColorStop(0,"#0c3a06"); lj.addColorStop(1,"#0a2e04");
      ctx.fillStyle = lj;
      ctx.beginPath(); ctx.moveTo(294,52); ctx.bezierCurveTo(308,62,332,70,358,74); ctx.bezierCurveTo(370,78,378,82,370,86); ctx.bezierCurveTo(354,84,330,76,306,68); ctx.closePath(); ctx.fill();

      // Skull
      const hg = ctx.createLinearGradient(286,29,362,71);
      hg.addColorStop(0,"#1c6008"); hg.addColorStop(0.55,"#2a9010"); hg.addColorStop(1,"#185806");
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.ellipse(324,50,38,21,0,0,Math.PI*2); ctx.fill();

      // Skull shine
      const hs = ctx.createRadialGradient(312,40,0,312,40,28);
      hs.addColorStop(0,"rgba(80,204,40,0.10)"); hs.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle = hs; ctx.beginPath(); ctx.ellipse(312,40,26,9,0,0,Math.PI*2); ctx.fill();

      // Snout
      const sg = ctx.createLinearGradient(316,50,392,72);
      sg.addColorStop(0,"#1a5808"); sg.addColorStop(1,"#144606");
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.moveTo(316,54); ctx.bezierCurveTo(345,50,374,52,392,56); ctx.bezierCurveTo(396,62,392,70,382,72); ctx.bezierCurveTo(362,70,338,64,318,62); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(58,170,24,0.28)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(318,52); ctx.bezierCurveTo(348,48,376,50,394,54); ctx.stroke();

      // Nostril
      ctx.save(); ctx.translate(378,57); ctx.rotate(-14*Math.PI/180);
      ctx.fillStyle = "#050e02"; ctx.beginPath(); ctx.ellipse(0,0,5.5,3.2,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "#0a1e06"; ctx.beginPath(); ctx.ellipse(0,0,2.5,1.6,0,0,Math.PI*2); ctx.fill();
      ctx.restore();

      // Jaw line
      ctx.strokeStyle = "rgba(8,32,10,0.70)"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(290,58); ctx.bezierCurveTo(316,64,344,68,366,70); ctx.quadraticCurveTo(378,72,388,70); ctx.stroke();

      // Upper teeth (triangles pointing down)
      ctx.fillStyle = "#e0d098";
      [[298,57,301,66,304,57],[310,58,313,67,316,58],[323,59,326,69,329,59],[336,60,339,69,342,60]]
        .forEach(([x1,yb,x2,yt,x3]) => { ctx.globalAlpha=0.90; ctx.beginPath(); ctx.moveTo(x1,yb); ctx.lineTo(x2,yt); ctx.lineTo(x3,yb); ctx.closePath(); ctx.fill(); });
      // Lower teeth (triangles pointing up)
      ctx.fillStyle = "#ccc080";
      [[304,65,307,59,310,65],[317,67,320,61,323,67],[330,69,333,63,336,69]]
        .forEach(([x1,yb,x2,yt,x3]) => { ctx.globalAlpha=0.78; ctx.beginPath(); ctx.moveTo(x1,yb); ctx.lineTo(x2,yt); ctx.lineTo(x3,yb); ctx.closePath(); ctx.fill(); });
      ctx.globalAlpha = 1;

      // Tongue
      ctx.fillStyle = "#cc2244"; ctx.globalAlpha = 0.92;
      ctx.beginPath(); ctx.moveTo(358,70); ctx.quadraticCurveTo(372,74,382,72); ctx.quadraticCurveTo(384,78,376,79); ctx.quadraticCurveTo(364,78,352,74); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#aa1a33"; ctx.lineWidth = 1.4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(374,72); ctx.quadraticCurveTo(378,77,376,80); ctx.stroke();

      // Brow ridge
      glow("#2a8010", 5); ctx.strokeStyle = "#50cc28"; ctx.lineWidth = 3.0; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(294,42); ctx.bezierCurveTo(308,34,328,32,346,34); ctx.stroke(); noGlow();

      // Cheek scales
      ctx.strokeStyle = "rgba(58,154,30,0.32)"; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(300,48); ctx.quadraticCurveTo(312,44,322,48); ctx.stroke();
      ctx.globalAlpha = 0.26; ctx.beginPath(); ctx.moveTo(314,44); ctx.quadraticCurveTo(326,40,336,44); ctx.stroke(); ctx.globalAlpha = 1;

      // Horns
      const h1g = ctx.createLinearGradient(302,38,318,30);
      h1g.addColorStop(0,"#ecdA80"); h1g.addColorStop(0.5,"#c8a848"); h1g.addColorStop(1,"#8a6818");
      glow("#c8a020", 7); ctx.strokeStyle = h1g; ctx.lineWidth = 5.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(302,38); ctx.bezierCurveTo(308,18,322,24,318,30); ctx.stroke(); noGlow();
      ctx.strokeStyle = "rgba(255,240,160,0.42)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(302,38); ctx.bezierCurveTo(308,18,322,24,318,30); ctx.stroke();
      ctx.strokeStyle = "rgba(138,96,24,0.55)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(305,32); ctx.quadraticCurveTo(310,31,312,34); ctx.stroke();
      ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(307,26); ctx.quadraticCurveTo(312,25,313,28); ctx.stroke();

      const h2g = ctx.createLinearGradient(316,36,334,28);
      h2g.addColorStop(0,"#ecdA80"); h2g.addColorStop(0.5,"#c8a848"); h2g.addColorStop(1,"#8a6818");
      glow("#c8a020", 6); ctx.strokeStyle = h2g; ctx.lineWidth = 5.0;
      ctx.beginPath(); ctx.moveTo(316,36); ctx.bezierCurveTo(324,15,338,22,334,28); ctx.stroke(); noGlow();
      ctx.strokeStyle = "rgba(255,240,160,0.38)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(316,36); ctx.bezierCurveTo(324,15,338,22,334,28); ctx.stroke();

      // Spurs
      const sp = ctx.createLinearGradient(309,35,318,32);
      sp.addColorStop(0,"#c8a848"); sp.addColorStop(1,"#8a6818");
      ctx.strokeStyle = sp; ctx.lineWidth = 2.8; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(309,35); ctx.bezierCurveTo(313,26,320,28,318,32); ctx.stroke();
      ctx.lineWidth = 2.3; ctx.beginPath(); ctx.moveTo(324,33); ctx.bezierCurveTo(328,24,335,27,332,31); ctx.stroke();

      // Crest/frill
      ctx.strokeStyle = "rgba(42,128,16,0.64)"; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(293,46); ctx.quadraticCurveTo(284,34,290,40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(290,40); ctx.quadraticCurveTo(280,29,286,35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(286,35); ctx.quadraticCurveTo(278,24,285,32); ctx.stroke();

      ctx.restore();
    }

    // ── Draw: eye ─────────────────────────────────────────────────────────────
    function drawEye() {
      ctx.save(); ctx.translate(0, s.nY);
      const ex = 306, ey = 47;
      // Aura ring
      ctx.save();
      ctx.translate(ex,ey); ctx.scale(s.eyeS,s.eyeS); ctx.translate(-ex,-ey);
      ctx.globalAlpha = s.eyeOp; glow("#ff8800", 12);
      ctx.strokeStyle = "#ff8800"; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(ex,ey,16,0,Math.PI*2); ctx.stroke();
      noGlow(); ctx.globalAlpha = 1; ctx.restore();
      // Socket
      ctx.fillStyle = "#030100"; ctx.beginPath(); ctx.arc(ex,ey,9.5,0,Math.PI*2); ctx.fill();
      // Iris
      glow("#ff6600", 9);
      const iris = ctx.createRadialGradient(ex-2.5,ey-3,0,ex,ey,7.5);
      iris.addColorStop(0,"#fff066"); iris.addColorStop(0.25,"#ffaa00"); iris.addColorStop(0.60,"#cc4000"); iris.addColorStop(1,"#660000");
      ctx.fillStyle = iris; ctx.beginPath(); ctx.arc(ex,ey,7.5,0,Math.PI*2); ctx.fill(); noGlow();
      // Iris rays
      ctx.strokeStyle = "rgba(190,58,0,0.48)"; ctx.lineWidth = 0.65;
      [0,36,72,108,144].forEach(a => {
        const r = a*Math.PI/180;
        ctx.beginPath(); ctx.moveTo(ex+Math.cos(r)*2.8, ey+Math.sin(r)*2.8); ctx.lineTo(ex+Math.cos(r)*7.0, ey+Math.sin(r)*7.0); ctx.stroke();
      });
      // Pupil
      ctx.save(); ctx.translate(ex,ey); ctx.scale(1,s.pupY);
      ctx.fillStyle = "#010000"; ctx.beginPath(); ctx.ellipse(0,0,2.4,5.4,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
      // Highlights
      ctx.fillStyle = "rgba(255,255,210,0.82)"; ctx.beginPath(); ctx.arc(ex+2.5,ey-3,2.0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,210,0.28)"; ctx.beginPath(); ctx.arc(ex-2.8,ey+3,0.9,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = "rgba(255,153,0,0.24)"; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.arc(ex,ey,11.5,0,Math.PI*2); ctx.stroke();
      ctx.restore();
    }

    // ── Draw: flame ───────────────────────────────────────────────────────────
    function drawFlame() {
      ctx.save();
      const px = 383, py = 57;
      ctx.translate(px,py); ctx.scale(s.fSX,s.fSY); ctx.translate(-px,-py);
      ctx.globalAlpha = s.fOp;
      // Corona
      glow("#ff3300", 22); ctx.fillStyle = "rgba(255,50,0,0.22)";
      ctx.beginPath(); ctx.ellipse(403,56,30,14,0,0,Math.PI*2); ctx.fill(); noGlow();
      // Base
      glow("#ff3300", 10); ctx.fillStyle = "rgba(255,51,0,0.68)";
      ctx.beginPath(); ctx.moveTo(383,57); ctx.bezierCurveTo(392,38,412,34,422,40); ctx.bezierCurveTo(428,46,428,58,420,66); ctx.bezierCurveTo(408,70,392,70,383,62); ctx.closePath(); ctx.fill(); noGlow();
      // Mid flame
      const mf = ctx.createRadialGradient(396,57,0,396,57,36);
      mf.addColorStop(0,"rgba(255,255,208,0.95)"); mf.addColorStop(0.18,"rgba(255,238,0,1)"); mf.addColorStop(0.46,"rgba(255,102,0,1)"); mf.addColorStop(0.82,"rgba(204,34,0,0.24)"); mf.addColorStop(1,"rgba(170,8,0,0.06)");
      ctx.fillStyle = mf;
      ctx.beginPath(); ctx.moveTo(385,58); ctx.bezierCurveTo(393,42,411,38,420,44); ctx.bezierCurveTo(425,50,424,60,416,65); ctx.bezierCurveTo(404,68,390,67,385,61); ctx.closePath(); ctx.fill();
      // Inner flame
      const inf = ctx.createRadialGradient(397,57,0,397,57,22);
      inf.addColorStop(0,"rgba(255,255,255,0.90)"); inf.addColorStop(0.20,"rgba(255,238,68,1)"); inf.addColorStop(0.66,"rgba(255,85,0,0.44)"); inf.addColorStop(1,"rgba(255,34,0,0)");
      ctx.fillStyle = inf;
      ctx.beginPath(); ctx.moveTo(387,59); ctx.bezierCurveTo(394,46,410,44,418,50); ctx.bezierCurveTo(421,55,419,62,411,65); ctx.bezierCurveTo(400,66,389,63,387,60); ctx.closePath(); ctx.fill();
      // Hot core
      const core = ctx.createRadialGradient(399,57,0,399,57,12);
      core.addColorStop(0,"#ffffff"); core.addColorStop(0.36,"rgba(255,255,200,0.90)"); core.addColorStop(1,"rgba(255,170,0,0)");
      ctx.fillStyle = core; ctx.beginPath(); ctx.ellipse(400,57,11,7,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.24)"; ctx.beginPath(); ctx.ellipse(399,57,5.5,3.5,0,0,Math.PI*2); ctx.fill();
      // Side tongues
      ctx.fillStyle = "rgba(255,153,0,0.58)";
      ctx.beginPath(); ctx.moveTo(416,36); ctx.bezierCurveTo(424,26,430,30,428,36); ctx.bezierCurveTo(425,42,420,40,416,36); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,204,0,0.48)";
      ctx.beginPath(); ctx.moveTo(420,42); ctx.bezierCurveTo(428,34,432,40,430,46); ctx.bezierCurveTo(428,52,424,50,420,42); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.restore();
    }

    // ── Draw: sparks + smoke ──────────────────────────────────────────────────
    function drawParticles() {
      sparks.forEach(sp => {
        if (sp.co <= 0) return;
        glow(sp.col, 6); ctx.fillStyle = sp.col; ctx.globalAlpha = sp.co;
        ctx.beginPath(); ctx.arc(sp.cx,sp.cy,Math.max(0,sp.cr),0,Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1; noGlow();
      });
      smoke.forEach(sm => {
        if (sm.co <= 0) return;
        ctx.fillStyle = "#c0c0c0"; ctx.globalAlpha = sm.co;
        ctx.beginPath(); ctx.arc(sm.cx,sm.cy,Math.max(0,sm.cr),0,Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
      });
    }

    // ── Main render loop ──────────────────────────────────────────────────────
    function render() {
      ctx.clearRect(0, 0, W, H);
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

    // ── GSAP animation timelines ──────────────────────────────────────────────
    const wn = gsap.timeline({ repeat: -1 });
    wn.to(s,{wn:-34,duration:0.36,ease:"power3.out"}).to(s,{wn:26,duration:0.58,ease:"power2.inOut"}).to(s,{wn:3,duration:0.22,ease:"back.out(2.4)"}).to(s,{wn:0,duration:0.19,ease:"none"});

    const wf = gsap.timeline({ repeat: -1, delay: 0.24 });
    wf.to(s,{wf:-24,duration:0.36,ease:"power3.out"}).to(s,{wf:18,duration:0.58,ease:"power2.inOut"}).to(s,{wf:2,duration:0.22,ease:"back.out(2.0)"}).to(s,{wf:0,duration:0.19,ease:"none"});

    const nb = gsap.timeline({ repeat: -1 });
    nb.to(s,{nY:-6,duration:0.36,ease:"power3.out"}).to(s,{nY:1,duration:0.58,ease:"sine.inOut"}).to(s,{nY:0,duration:0.41,ease:"sine.out"});

    const fl = gsap.timeline({ repeat: -1 });
    [[1.20,1.15,1.00,0.11],[0.78,0.84,0.44,0.14],[1.15,1.13,0.98,0.17],[0.85,0.89,0.60,0.10],[1.10,1.08,0.96,0.13],[0.92,0.94,0.70,0.09],[1.00,1.00,0.78,0.13]]
      .forEach(([sX,sY,o,d]) => fl.to(s,{fSX:sX,fSY:sY,fOp:o,duration:d,ease:"none"}));

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(s,{tail:-15,duration:0.80,ease:"power2.inOut"}).to(s,{tail:11,duration:1.02,ease:"power2.inOut"}).to(s,{tail:-5,duration:0.54,ease:"power1.out"}).to(s,{tail:0,duration:0.78,ease:"sine.inOut"});

    gsap.to(s, { breath:1, duration:2.8, ease:"sine.inOut", yoyo:true, repeat:-1 });
    gsap.to(s, { eyeOp:0.05, eyeS:1.30, duration:1.4, ease:"sine.inOut", yoyo:true, repeat:-1 });
    gsap.to(s, { pupY:0.50, duration:1.8, ease:"sine.inOut", yoyo:true, repeat:-1 });

    // Sparks
    const offsets = sparks.map(() => ({ dx: 4+Math.random()*8, dy: 20+Math.random()*15 }));
    const sparkTls = sparks.map((sp, i) => {
      const { dx, dy } = offsets[i];
      const t = gsap.timeline({ repeat:-1, delay: i*0.12 + Math.random()*0.3 });
      t.to(sp,{cy:sp.y-2,co:0.95,cr:sp.r,cx:sp.x,duration:sp.dur*0.12,ease:"none"})
       .to(sp,{cx:sp.x+dx,cy:sp.y-dy,cr:0,co:0,duration:sp.dur*0.88,ease:"power2.out"})
       .set(sp,{cx:sp.x,cy:sp.y,cr:sp.r,co:0});
      return t;
    });

    // Smoke
    const smokeTls = smoke.map((sm, i) => {
      const drift = 366 + (Math.random()-0.5)*5;
      const t = gsap.timeline({ repeat:-1, delay: i*1.2+Math.random()*0.5 });
      t.to(sm,{cy:51,co:0.20,duration:0.28})
       .to(sm,{cx:drift,cy:38,cr:4.5,co:0,duration:1.9,ease:"power1.out"})
       .set(sm,{cx:378,cy:53,cr:1.3,co:0});
      return t;
    });

    return () => {
      gsap.ticker.remove(render);
      [wn,wf,nb,fl,tl,...sparkTls,...smokeTls].forEach(t => t.kill());
      gsap.killTweensOf(s);
      sparks.forEach(sp => gsap.killTweensOf(sp));
      smoke.forEach(sm => gsap.killTweensOf(sm));
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}
