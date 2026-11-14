'use strict';

const assert = require('node:assert/strict');
const EARTH_RADIUS_M = 6371008.8;
const METRES_PER_DEGREE = 111195.0802335329;

const cairo = {
  lat: 30 + 7 / 60 + 46.3 / 3600,
  lon: 31 + 17 / 60 + 20.0 / 3600,
  source: 'CairoKey.jpg, 30°07′46.3″N 31°17′20.0″E',
  resolutionArcsec: 0.1,
};

const points = [
  {group:'2012 PGP-signed', name:'Warsaw', lat:'52.216802', lon:'21.018334'},
  {group:'2012 PGP-signed', name:'Paris 1', lat:'48.85057059876962', lon:'2.406892329454422'},
  {group:'2012 PGP-signed', name:'Paris 2', lat:'48.85030144151387', lon:'2.407538741827011'},
  {group:'2012 PGP-signed', name:'Seattle 1', lat:'47.664196', lon:'-122.313301'},
  {group:'2012 PGP-signed', name:'Seattle 2', lat:'47.637520', lon:'-122.346277'},
  {group:'2012 PGP-signed', name:'Seattle 3', lat:'47.622993', lon:'-122.312576'},
  {group:'2012 PGP-signed', name:'Seoul signed', lat:'37.5196666666667', lon:'126.995'},
  {group:'2012 PGP-signed', name:'California', lat:'33.966808', lon:'-117.650488'},
  {group:'2012 PGP-signed', name:'Louisiana', lat:'29.909098706850486', lon:'-89.99312818050384'},
  {group:'2012 PGP-signed', name:'Miami', lat:'25.684702', lon:'-80.441289'},
  {group:'2012 PGP-signed', name:'Hawaii', lat:'21.584069', lon:'-158.104211'},
  {group:'2012 PGP-signed', name:'Sydney', lat:'-33.90281', lon:'151.18421'},
  {group:'2012 page-only', name:'Seoul page-only', lat:'37.577070', lon:'126.813122'},
  {group:'2012 page-only', name:'Fayetteville', lat:'36.0665472222222', lon:'-94.1726416666667'},
  {group:'2013 poster/location', name:'Dallas', lat:'33.092817', lon:'-96.082650'},
  {group:'2013 signed coordinate', name:'Okinawa', lat:'26.419680', lon:'127.732540'},
  {group:'2013 poster/location', name:'Moscow', lat:'55.793765', lon:'37.578608'},
  {group:'2013 poster/location', name:'Little Rock', lat:'34.747791', lon:'-92.269086'},
  {group:'2013 signed coordinate', name:'Annapolis', lat:'38.977845', lon:'-76.486451'},
  {group:'2013 poster/location', name:'Portland', lat:'45.500920', lon:'-122.652512'},
  {group:'2013 poster/location', name:'Columbus', lat:'32.478944', lon:'-84.983674'},
];

function radians(degrees) { return degrees * Math.PI / 180; }
function haversineMeters(lat1, lon1, lat2, lon2) {
  const p1 = radians(lat1);
  const p2 = radians(lat2);
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(p1) * Math.cos(p2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}
function decimalPlaces(value) {
  return (String(value).split('.')[1] || '').length;
}

const cairoHalfArcsecDegrees = (cairo.resolutionArcsec / 2) / 3600;
const cairoLatHalfM = cairoHalfArcsecDegrees * METRES_PER_DEGREE;
const cairoLonHalfM = cairoHalfArcsecDegrees * METRES_PER_DEGREE * Math.cos(radians(cairo.lat));

const rows = points.map(point => {
  const lat = Number(point.lat);
  const lon = Number(point.lon);
  const candidateLatHalfDegrees = 0.5 * 10 ** (-decimalPlaces(point.lat));
  const candidateLonHalfDegrees = 0.5 * 10 ** (-decimalPlaces(point.lon));
  const candidateLatHalfM = candidateLatHalfDegrees * METRES_PER_DEGREE;
  const candidateLonHalfM = candidateLonHalfDegrees * METRES_PER_DEGREE * Math.cos(radians(cairo.lat));
  const roundingToleranceM = Math.hypot(
    cairoLatHalfM + candidateLatHalfM,
    cairoLonHalfM + candidateLonHalfM,
  );
  return {
    ...point,
    distanceM: haversineMeters(cairo.lat, cairo.lon, lat, lon),
    roundingToleranceM,
  };
}).sort((a, b) => a.distanceM - b.distanceM);

assert.equal(points.filter(p => p.group === '2012 PGP-signed').length, 12);
assert.equal(points.filter(p => p.group === '2012 page-only').length, 2);
assert.equal(points.filter(p => p.group.startsWith('2013')).length, 7);
assert.equal(rows.length, 21);
assert.equal(rows[0].name, 'Warsaw');
assert.ok(rows.every(row => row.distanceM > row.roundingToleranceM));

const summary = {
  cairo: {
    latitude: cairo.lat,
    longitude: cairo.lon,
    printed: cairo.source,
    resolution: '0.1 arcsecond',
  },
  counts: {
    '2012 PGP-signed': 12,
    '2012 unsigned page-only': 2,
    '2013 pklmx locations': 7,
    total: rows.length,
  },
  result: 'NO MATCH',
  nearest: rows[0],
  runnerUp: rows[1],
  maximumRoundingToleranceM: Math.max(...rows.map(row => row.roundingToleranceM)),
  comparisons: rows,
};
console.log(JSON.stringify(summary, null, 2));
