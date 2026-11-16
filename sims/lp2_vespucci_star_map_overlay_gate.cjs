"use strict";
/**
 * Source-constrained Vespucci / LP2 star-map overlay gate.
 * Run from repository root:
 *   node sims/lp2_vespucci_star_map_overlay_gate.cjs
 *
 * This is a negative/provisional test, not a decryption.
 * Star identifications follow the 2026 reconstruction of the 1504 Mundus Novus
 * text (arXiv:2604.11826); J2000 coordinates are from SIMBAD/FreestarCharts.
 * Positions are precessed to epoch 1500 with IAU 1976 formulae; proper motions
 * are omitted. The original 1504 text remains the historically available clue.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const p32 = corpus.pages.find(p => p.page === 32).indices;
assert.equal(p32.length, 121);
assert.equal(grid.bytes.length, 256);
assert.deepEqual(grid.pages.map(p => [p.rows, p.cols]), [[10,8],[13,8],[9,8]]);

const rad = d => d * Math.PI / 180;
const deg = r => r * 180 / Math.PI;
const mod = (n, m) => ((n % m) + m) % m;
const hms = (h, m, s) => (h + m / 60 + s / 3600) * 15;
const dms = (d, m, s) => -(d + m / 60 + s / 3600);

// ICRS/J2000 coordinates. Coordinates are intentionally kept explicit so the
// source input can be reviewed and changed independently of the transforms.
const j2000 = {
  beta_Hyi:  [hms(0,25,45.07036), dms(77,15,15.2860)],
  alpha_Hyi: [hms(1,58,46.0),    dms(61,34,10.0)],
  alpha_Tuc: [hms(22,18,30.112437), dms(60,15,34.666361)],
  gamma_Hyi: [hms(3,47,14.34062), dms(74,14,20.2686)],
  alpha_Ret: [hms(4,14,25.470004), dms(62,28,25.692560)],
  alpha_Cen: [hms(14,39,36.49400), dms(60,50,2.3737)],
  beta_Cen:  [hms(14,3,49.40535), dms(60,22,22.9266)],
  alpha_Cru: [hms(12,26,35.896), dms(63,5,56.73)],
  beta_Cru:  [hms(12,47,43.26877), dms(59,41,19.5792)],
  gamma_Cru: [hms(12,31,9.95961), dms(57,6,47.5684)],
  delta_Cru: [hms(12,15,9.0), dms(58,44,56.0)]
};

// Meeus/IAU-1976 precession, J2000 -> requested equinox. Proper motions are
// omitted; the angular triangle comparisons below are rotationally invariant.
function precessJ2000ToEpoch(raDeg, decDeg, epoch = 1500) {
  const T = (epoch - 2000) / 100;
  const asec = Math.PI / (180 * 3600);
  const zeta = (2306.2181*T + 0.30188*T*T + 0.017998*T*T*T) * asec;
  const z = (2306.2181*T + 1.09468*T*T + 0.018203*T*T*T) * asec;
  const theta = (2004.3109*T - 0.42665*T*T - 0.041833*T*T*T) * asec;
  const a = rad(raDeg), d = rad(decDeg);
  const A = Math.cos(d) * Math.sin(a + zeta);
  const B = Math.cos(theta) * Math.cos(d) * Math.cos(a + zeta) - Math.sin(theta) * Math.sin(d);
  const C = Math.sin(theta) * Math.cos(d) * Math.cos(a + zeta) + Math.cos(theta) * Math.sin(d);
  return [mod(deg(Math.atan2(A, B) + z), 360), deg(Math.asin(C))];
}
const stars = Object.fromEntries(Object.entries(j2000).map(([name, p]) =>
  [name, precessJ2000ToEpoch(p[0], p[1], 1500)]));

function sphericalUnit([ra, dec]) {
  const a = rad(ra), d = rad(dec);
  return [Math.cos(d)*Math.cos(a), Math.cos(d)*Math.sin(a), Math.sin(d)];
}
function dot(a,b) { return a.reduce((s,v,i)=>s+v*b[i],0); }
function norm(a) { return Math.sqrt(dot(a,a)); }
function angleAt(A,B,C) {
  const u = A.map((v,i)=>v-dot(A,B)*B[i]);
  const v = C.map((x,i)=>x-dot(C,B)*B[i]);
  return deg(Math.acos(Math.max(-1,Math.min(1,dot(u,v)/(norm(u)*norm(v))))));
}
function triangleAngles(points) {
  return points.map((p,i)=>angleAt(points[(i+1)%3],p,points[(i+2)%3]));
}
function sideRatios(points) {
  const ds = [norm(points[0].map((v,i)=>v-points[1][i])),
              norm(points[0].map((v,i)=>v-points[2][i])),
              norm(points[1].map((v,i)=>v-points[2][i]))].sort((a,b)=>a-b);
  return ds.map(d=>d/ds[2]);
}

// Equidistant polar projection around the south celestial pole. Similarity fit
// removes arbitrary chart rotation, scale and translation, but not distortion.
function polarEquidistant([ra, dec]) {
  const r = rad(90 + dec), t = rad(ra);
  return [r*Math.cos(t), r*Math.sin(t)];
}
function fitSimilarity(X, Y) {
  const mean = P => [P.reduce((s,p)=>s+p[0],0)/P.length,
                     P.reduce((s,p)=>s+p[1],0)/P.length];
  const mx=mean(X), my=mean(Y);
  const x=X.map(p=>[p[0]-mx[0],p[1]-mx[1]]);
  const y=Y.map(p=>[p[0]-my[0],p[1]-my[1]]);
  const den=x.reduce((s,p)=>s+p[0]*p[0]+p[1]*p[1],0);
  const fits=[];
  for (const reflect of [false,true]) {
    let ar=0, ai=0;
    for (let i=0;i<x.length;i++) {
      const [xx,xy]=x[i], [yx,yy]=y[i];
      if (!reflect) {
        ar += xx*yx + xy*yy;
        ai += xx*yy - xy*yx;
      } else {
        ar += xx*yx - xy*yy;
        ai += xx*yy + xy*yx;
      }
    }
    ar/=den; ai/=den;
    const pred=x.map(([xx,xy])=>reflect
      ? [ar*xx+ai*xy+my[0], ai*xx-ar*xy+my[1]]
      : [ar*xx-ai*xy+my[0], ai*xx+ar*xy+my[1]]);
    const rmse=Math.sqrt(pred.reduce((s,p,i)=>s+(p[0]-Y[i][0])**2+(p[1]-Y[i][1])**2,0)/Y.length);
    fits.push({reflect,scale:Math.hypot(ar,ai),ar,ai,mx,my,rmse,pred});
  }
  return fits.sort((a,b)=>a.rmse-b.rmse)[0];
}

const p56Dots = [
  [873.2673,2517.0000], [921.1536,2708.0611], [1103.9313,2447.2210],
  [1408.1503,2747.1909], [1603.9047,2686.4773]
];
const pageTriangle = p56Dots.slice(0,3);
const hydrusNames = ["beta_Hyi","alpha_Hyi","alpha_Tuc"];
const cruxNames = ["gamma_Cru","delta_Cru","beta_Cru"];
const hydrusTriangle = hydrusNames.map(n=>sphericalUnit(j2000[n]));
const cruxTriangle = cruxNames.map(n=>sphericalUnit(j2000[n]));
const hydrusFit = fitSimilarity(hydrusNames.map(n=>polarEquidistant(stars[n])), pageTriangle);
const cruxFit = fitSimilarity(cruxNames.map(n=>polarEquidistant(stars[n])), pageTriangle);
const hydrusExtra = ["gamma_Hyi","alpha_Ret"].map(name => {
  const [x,y]=polarEquidistant(stars[name]);
  const dx=x-hydrusFit.mx[0], dy=y-hydrusFit.mx[1];
  const pred=[hydrusFit.reflect
    ? hydrusFit.ar*dx+hydrusFit.ai*dy+hydrusFit.my[0]
    : hydrusFit.ar*dx-hydrusFit.ai*dy+hydrusFit.my[0],
    hydrusFit.reflect
    ? hydrusFit.ai*dx-hydrusFit.ar*dy+hydrusFit.my[1]
    : hydrusFit.ai*dx+hydrusFit.ar*dy+hydrusFit.my[1]];
  const dists=[3,4].map(i=>Math.hypot(pred[0]-p56Dots[i][0],pred[1]-p56Dots[i][1]));
  return {name,predicted:pred,distancesToExtraDots:dists,nearestExtraDotPx:Math.min(...dists)};
});
const pageAngles=triangleAngles(pageTriangle);
const pageSideRatios=sideRatios(pageTriangle);
const hydrusAngles=triangleAngles(hydrusTriangle);
const cruxAngles=triangleAngles(cruxTriangle);
const hydrusSideRatios=sideRatios(hydrusTriangle);
const cruxSideRatios=sideRatios(cruxTriangle);

// The 1504 text is reconstructed as 3 + 2 + 6 stars with nominal group
// radii 9.5°, 12.5° and 32°. Group order is text order.
const groups = [
  {radius:9.5, names:["beta_Hyi","alpha_Hyi","alpha_Tuc"]},
  {radius:12.5,names:["gamma_Hyi","alpha_Ret"]},
  {radius:32,names:["alpha_Cen","beta_Cen","alpha_Cru","beta_Cru","gamma_Cru","delta_Cru"]}
];
const starSequence=groups.flatMap((g,gi)=>g.names.map(name=>({group:gi+1,radius:g.radius,name,ra:stars[name][0],dec:stars[name][1]})));
const runeAt = index => corpus.translit[p32[index]];

// Source-fixed 11-star -> p32 grid overlay: 32° maps to a five-cell radius,
// the SCP is the grid centre, RA=0 is up, and east is left.
const p32StarMap = starSequence.map(s=>{
  const r=s.radius/32*5, t=rad(s.ra);
  const colFloat=5-r*Math.sin(t), rowFloat=5-r*Math.cos(t);
  const col=Math.round(colFloat), row=Math.round(rowFloat);
  const inside=row>=0&&row<11&&col>=0&&col<11;
  const index=inside?row*11+col:null;
  return {group:s.group,name:s.name,row,col,index,rune:inside?runeAt(index):"OUT"};
});

// Alternate natural projection uses each star's actual polar distance rather
// than assigning its group's nominal radius; this is a sensitivity control.
const p32IndividualRadius = starSequence.map(s=>{
  const r=(90+s.dec)/32*5, t=rad(s.ra);
  const col=Math.round(5-r*Math.sin(t)), row=Math.round(5-r*Math.cos(t));
  const inside=row>=0&&row<11&&col>=0&&col<11;
  const index=inside?row*11+col:null;
  return {group:s.group,name:s.name,row,col,index,rune:inside?runeAt(index):"OUT"};
});

// The 32x8 p50 table is tested as (rounded group radius) x (RA octant).
// Existing p32 compass decoder defines byte&7 as N,NE,E,SE,S,SW,W,NW and
// byte>>3 as distance. The source text says east is left in the southern sky.
const compass = [
  {name:"N",dr:-1,dc:0},{name:"NE",dr:-1,dc:1},{name:"E",dr:0,dc:1},{name:"SE",dr:1,dc:1},
  {name:"S",dr:1,dc:0},{name:"SW",dr:1,dc:-1},{name:"W",dr:0,dc:-1},{name:"NW",dr:-1,dc:-1}
];
function p50Route(eastLeft) {
  const selected=starSequence.map(s=>{
    const rowNumber=Math.round(s.radius);
    const row=rowNumber-1;
    const columnAngle=eastLeft?mod(360-s.ra,360):mod(s.ra,360);
    const col=mod(Math.round(columnAngle/45),8);
    const byte=grid.bytes[row*8+col];
    const direction=byte&7, distance=byte>>3;
    return {group:s.group,name:s.name,row:rowNumber,col:col+1,byte,
      direction:compass[direction].name,distance};
  });
  let row=3,col=0; // existing p32 H marker, cell 33
  const visited=selected.map(s=>{
    const d=compass[s.byte&7];
    row=mod(row+d.dr*s.distance,11);
    col=mod(col+d.dc*s.distance,11);
    const index=row*11+col;
    return {cell:index,row,col,rune:runeAt(index)};
  });
  return {orientation:eastLeft?"east-left (southern-sky convention)":"east-right (mirror control)",
    selected,visited,delta:visited.reduce((acc,v,i)=>{
      const d=compass[selected[i].byte&7];
      acc[0]+=d.dr*selected[i].distance; acc[1]+=d.dc*selected[i].distance; return acc;
    },[0,0]),finalCell:visited.at(-1).cell,finalRune:visited.at(-1).rune};
}
const p50EastLeft=p50Route(true);
const p50EastRight=p50Route(false);

const result={
  sourceModel:{groups:groups.map(g=>({radius:g.radius,count:g.names.length,names:g.names})),
    p32Shape:"11x11",p50Shape:"32x8",starCount:starSequence.length},
  p56FiveDotTriangle:{
    pageAnglesDegrees:pageAngles,pageSideRatios,
    hydrus:{names:hydrusNames,anglesDegrees:hydrusAngles,sideRatios:hydrusSideRatios,
      equidistantSimilarityRMSEpx:hydrusFit.rmse,reflection:hydrusFit.reflect,extraStars:hydrusExtra},
    crux:{names:cruxNames,anglesDegrees:cruxAngles,sideRatios:cruxSideRatios,
      equidistantSimilarityRMSEpx:cruxFit.rmse,reflection:cruxFit.reflect}
  },
  p32GroupRadiusOverlay:{tokens:p32StarMap.map(x=>x.rune),joined:p32StarMap.map(x=>x.rune).join(""),stars:p32StarMap},
  p32IndividualRadiusControl:{tokens:p32IndividualRadius.map(x=>x.rune),joined:p32IndividualRadius.map(x=>x.rune).join(""),stars:p32IndividualRadius},
  p50TableCompassOverlay:{eastLeft:p50EastLeft,eastRight:p50EastRight}
};
assert.equal(starSequence.length,11);
assert.equal(pageAngles.length,3);
console.log(JSON.stringify(result,null,2));
