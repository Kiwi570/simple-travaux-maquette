/* WebGL — ondulation d'eau sur l'image survolée (cartes des pièces).
   Un seul canevas, posé sur l'image active, arrêté dès que l'onde s'éteint. */
import { Renderer } from '../../vendor/ogl/core/Renderer.js';
import { Program } from '../../vendor/ogl/core/Program.js';
import { Mesh } from '../../vendor/ogl/core/Mesh.js';
import { Texture } from '../../vendor/ogl/core/Texture.js';
import { Triangle } from '../../vendor/ogl/extras/Triangle.js';
import { env, gsap, qs, qsa, damp } from './env.js?v=2';

const vertex = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uRect;
uniform vec2 uImg;
uniform vec2 uSouris;
uniform float uAmp;
uniform float uTemps;
uniform float uZoom;
varying vec2 vUv;
vec2 couvrir(vec2 uv) {
  float ra = uRect.x / uRect.y, ri = uImg.x / uImg.y;
  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);
  return (uv - 0.5) * s / uZoom + 0.5;
}
void main() {
  vec2 d = vUv - uSouris;
  d.x *= uRect.x / uRect.y;
  float r = length(d);
  if (uAmp < 0.001) { gl_FragColor = texture2D(tMap, couvrir(vUv)); return; }
  float onde = sin(r * 46.0 - uTemps * 7.0) * exp(-r * 4.2) * uAmp;
  vec2 dec = (d / max(r, 0.0001)) * onde * 0.016;
  dec.x /= uRect.x / uRect.y;
  vec4 c = texture2D(tMap, couvrir(vUv + dec));
  c.rgb += vec3(0.10, 0.16, 0.24) * max(onde, 0.0) * 0.55;
  gl_FragColor = c;
}`;

export function initOndes() {
  const canvas = qs('[data-gl-ondes]');
  const cartes = qsa('[data-ripple]');
  if (!canvas || !cartes.length || !env.anim || !env.fin) return;
  let renderer;
  try { renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio || 1, 1.25), alpha: true, antialias: false }); } catch (e) { return; }
  const gl = renderer.gl;
  if (!gl) return;
  const texture = new Texture(gl, { generateMipmaps: false });
  const program = new Program(gl, {
    vertex, fragment,
    uniforms: { tMap: { value: texture }, uRect: { value: [1, 1] }, uImg: { value: [1, 1] }, uSouris: { value: [0.5, 0.5] }, uAmp: { value: 0 }, uTemps: { value: 0 }, uZoom: { value: 1 } },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  const cache = new Map();
  let essais = 0, cout = 0, hors = false;
  let active = null, img = null, amp = 0, ampCible = 0, sx = 0.5, sy = 0.5, cx = 0.5, cy = 0.5, temps = 0, zoom = 1;

  const charger = (im) => new Promise((ok) => {
    const src = im.currentSrc || im.src;
    if (cache.has(src)) { ok(cache.get(src)); return; }
    const i = new Image();
    i.decoding = 'async';
    i.onload = () => { cache.set(src, i); ok(i); };
    i.onerror = () => ok(null);
    i.src = src;
  });

  cartes.forEach((c) => {
    const im = c.querySelector('img');
    if (!im) return;
    c.addEventListener('pointerenter', async (e) => {
      if (hors) return;
      const source = await charger(im);
      if (!source) return;
      active = c; img = im;
      texture.image = source;
      program.uniforms.uImg.value = [source.naturalWidth, source.naturalHeight];
      ampCible = 1;
      c.classList.add('gl-actif');
      gsap.to(canvas, { opacity: 1, duration: 0.25, overwrite: true });
      deplacer(e);
    });
    c.addEventListener('pointermove', deplacer);
    c.addEventListener('pointerleave', () => { if (active === c) ampCible = 0; });
  });

  function deplacer(e) {
    if (!img) return;
    const r = img.getBoundingClientRect();
    cx = (e.clientX - r.left) / r.width; cy = 1 - (e.clientY - r.top) / r.height;
  }

  gsap.ticker.add((t, dtMs) => {
    if (!active || !img) return;
    const dt = Math.min(dtMs, 64) / 1000;
    temps += dt;
    amp = damp(amp, ampCible, ampCible ? 5 : 2.6, dt);
    zoom = damp(zoom, ampCible ? 1.08 : 1.04, 3, dt);
    sx = damp(sx, cx, 8, dt); sy = damp(sy, cy, 8, dt);
    const r = img.getBoundingClientRect();
    canvas.style.transform = `translate3d(${r.left}px, ${r.top}px, 0)`;
    if (canvas.__w !== Math.round(r.width) || canvas.__h !== Math.round(r.height)) {
      canvas.__w = Math.round(r.width); canvas.__h = Math.round(r.height);
      renderer.setSize(r.width, r.height);
    }
    program.uniforms.uRect.value = [r.width, r.height];
    program.uniforms.uSouris.value = [sx, sy];
    program.uniforms.uAmp.value = amp;
    program.uniforms.uTemps.value = temps;
    program.uniforms.uZoom.value = zoom;
    renderer.render({ scene: mesh });
    if (essais < 16) { if (essais > 3) cout += dtMs; essais++; if (essais === 16 && cout / 12 > 45) { active.classList.remove('gl-actif'); active = null; canvas.remove(); hors = true; return; } }
    if (!ampCible && amp < 0.01) {
      const c = active;
      active = null;
      gsap.to(canvas, { opacity: 0, duration: 0.2, overwrite: true, onComplete: () => c.classList.remove('gl-actif') });
    }
  });
}
