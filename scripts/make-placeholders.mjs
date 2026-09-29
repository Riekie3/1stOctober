// Generates soft, film-toned placeholder "photos" so the gallery has something
// to float before you add your real pictures. Safe to delete afterwards.
import { writeFileSync, mkdirSync } from "node:fs";

const out = "public/assets/photos";
mkdirSync(out, { recursive: true });

const scenes = [
  { w: 1200, h: 900, sky: ["#f3c89a", "#e59a7b", "#8c6a8a"], sea: "#5b5870", sun: [600, 560, 120, "#fde4b8"], kind: "sea" },
  { w: 900, h: 1200, sky: ["#1f2430", "#3b3248", "#b0736a"], kind: "city" },
  { w: 1200, h: 1200, sky: ["#f6e7d3", "#ead3c6", "#d9b8b0"], kind: "bloom" },
  { w: 1200, h: 800, sky: ["#cfe0e3", "#e9dcc6", "#f1cfa9"], kind: "hills" },
  { w: 900, h: 1125, sky: ["#2b2522", "#5a4535", "#c89a62"], kind: "candle" },
  { w: 1200, h: 900, sky: ["#bcd3d6", "#8fb3bb", "#4e7686"], kind: "water" },
  { w: 1000, h: 1250, sky: ["#fbe9d6", "#f0c7a8", "#c98a72"], sun: [500, 820, 150, "#fff3dc"], sea: "#a0786e", kind: "sea" },
  { w: 1200, h: 900, sky: ["#e9e1d6", "#d6c7b3", "#b39c80"], kind: "table" },
  { w: 1200, h: 1200, sky: ["#1b1c2a", "#2c2a44", "#57456a"], kind: "stars" },
  { w: 1200, h: 800, sky: ["#f5d6b8", "#e8b28f", "#b9766a"], kind: "hills" },
];

function rand(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

scenes.forEach((sc, i) => {
  const r = rand(i * 97 + 13);
  const { w, h } = sc;
  let body = "";
  if (sc.kind === "sea") {
    const [cx, cy, rad, c] = sc.sun;
    body += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${c}" opacity=".9" filter="url(#b)"/>`;
    body += `<rect y="${cy + rad * 0.3}" width="${w}" height="${h}" fill="${sc.sea}" opacity=".85"/>`;
    for (let k = 0; k < 14; k++) {
      const y = cy + rad * 0.35 + k * (h - cy) / 16;
      body += `<rect x="${cx - rad * (1.1 - k * 0.04) + r() * 30}" y="${y}" width="${rad * (2.2 - k * 0.08)}" height="${3 + k * 0.4}" rx="2" fill="${c}" opacity="${0.5 - k * 0.03}"/>`;
    }
  } else if (sc.kind === "city") {
    for (let k = 0; k < 60; k++) {
      body += `<circle cx="${r() * w}" cy="${h * 0.35 + r() * h * 0.6}" r="${8 + r() * 38}" fill="${["#f6c77a", "#f19c7a", "#fbe3b1", "#c2869a"][k % 4]}" opacity="${0.15 + r() * 0.45}" filter="url(#b)"/>`;
    }
  } else if (sc.kind === "bloom") {
    for (let k = 0; k < 9; k++) {
      const cx = w * 0.5 + Math.cos(k * 0.7) * w * 0.25, cy = h * 0.5 + Math.sin(k * 0.7) * h * 0.22;
      body += `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.14}" ry="${w * 0.09}" transform="rotate(${k * 40} ${cx} ${cy})" fill="#f7ddd6" opacity=".7" filter="url(#b)"/>`;
    }
    body += `<circle cx="${w / 2}" cy="${h / 2}" r="${w * 0.07}" fill="#e7b97a" opacity=".8" filter="url(#b)"/>`;
  } else if (sc.kind === "hills") {
    body += `<circle cx="${w * 0.72}" cy="${h * 0.32}" r="${h * 0.12}" fill="#fff4e0" opacity=".9" filter="url(#b)"/>`;
    const layers = ["#c9a88e", "#a88672", "#7d6559"];
    layers.forEach((c, k) => {
      const base = h * (0.55 + k * 0.13);
      let d = `M0 ${h} L0 ${base}`;
      for (let x = 0; x <= w; x += w / 6) d += ` Q ${x + w / 12} ${base - 40 - r() * 90} ${x + w / 6} ${base - r() * 30}`;
      d += ` L${w} ${h} Z`;
      body += `<path d="${d}" fill="${c}" opacity=".9"/>`;
    });
  } else if (sc.kind === "candle") {
    body += `<ellipse cx="${w / 2}" cy="${h * 0.42}" rx="${w * 0.3}" ry="${h * 0.3}" fill="#f6b86a" opacity=".45" filter="url(#b)"/>`;
    body += `<rect x="${w * 0.44}" y="${h * 0.5}" width="${w * 0.12}" height="${h * 0.42}" rx="10" fill="#efe2cc"/>`;
    body += `<path d="M${w / 2} ${h * 0.36} q 26 50 0 110 q -26 -60 0 -110z" fill="#ffe0a3"/>`;
  } else if (sc.kind === "water") {
    for (let k = 0; k < 26; k++) {
      const y = (k / 26) * h;
      body += `<path d="M0 ${y} Q ${w / 4} ${y - 18} ${w / 2} ${y} T ${w} ${y}" stroke="#eef5f4" stroke-width="${1 + r() * 3}" fill="none" opacity="${0.15 + r() * 0.35}"/>`;
    }
  } else if (sc.kind === "table") {
    body += `<circle cx="${w * 0.36}" cy="${h * 0.52}" r="${h * 0.2}" fill="#f7f1e8"/><circle cx="${w * 0.36}" cy="${h * 0.52}" r="${h * 0.14}" fill="#7a5a44"/>`;
    body += `<circle cx="${w * 0.68}" cy="${h * 0.46}" r="${h * 0.16}" fill="#f7f1e8"/><circle cx="${w * 0.68}" cy="${h * 0.46}" r="${h * 0.11}" fill="#c78d6a"/>`;
  } else if (sc.kind === "stars") {
    for (let k = 0; k < 160; k++) body += `<circle cx="${r() * w}" cy="${r() * h}" r="${r() * 2.6}" fill="#fff6e3" opacity="${0.3 + r() * 0.7}"/>`;
    body += `<path d="M0 ${h * 0.85} Q ${w * 0.3} ${h * 0.72} ${w * 0.6} ${h * 0.84} T ${w} ${h * 0.8} L ${w} ${h} L 0 ${h}Z" fill="#141320"/>`;
  }
  const label = `placeholder · ${String(i + 1).padStart(2, "0")}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sc.sky[0]}"/><stop offset=".6" stop-color="${sc.sky[1]}"/><stop offset="1" stop-color="${sc.sky[2]}"/></linearGradient>
<filter id="b"><feGaussianBlur stdDeviation="${Math.round(w / 90)}"/></filter>
<filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .4  0 0 0 .22 0"/></filter>
<radialGradient id="v" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1d14" stop-opacity=".45"/></radialGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
${body}
<rect width="${w}" height="${h}" filter="url(#n)"/>
<rect width="${w}" height="${h}" fill="url(#v)"/>
<text x="${w - 36}" y="${h - 34}" text-anchor="end" font-family="Georgia, serif" font-style="italic" font-size="${Math.round(w / 34)}" fill="#fff8ec" opacity=".75">${label}</text>
</svg>`;
  writeFileSync(`${out}/placeholder-${String(i + 1).padStart(2, "0")}.svg`, svg);
});
console.log("wrote", scenes.length, "placeholders");
