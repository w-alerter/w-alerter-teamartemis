/* W-ALERTER v4.4: supplied source data and numerical rules, unchanged. */
const ARSIV = Object.freeze({ "Ekim": 0.4091, "Kasım": 0.3253, "Aralık": 0.3481, "Ocak": 0.3303 });

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3440;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function pointModel(month, chlorophyll) {
  const reference = ARSIV[month];
  const ratio = chlorophyll / reference;
  let rate = Math.min(ratio * 50, 99.8).toFixed(1);
  if (ratio < 0.5) rate = (ratio * 18).toFixed(1);
  const level = ratio >= 1.8 ? 'critical' : ratio >= 1.25 ? 'moderate' : 'normal';
  return { reference, ratio, rate, level };
}

function routePointStatus(month, chlorophyll) {
  return (chlorophyll / ARSIV[month]) >= 1.25 ? 'RISKLI' : 'GUVENLI';
}

function routeModel(points, month) {
  let totalDist = 0, riskDist = 0;
  points.forEach((point, i) => {
    if (i > 0) {
      const dist = calculateDistance(points[i-1].lat, points[i-1].lon, point.lat, point.lon);
      totalDist += dist;
      if (routePointStatus(month, point.klor) === 'RISKLI') riskDist += dist;
    }
  });
  return { totalDist, riskDist, fuelSaving: riskDist * 2.5 };
}
