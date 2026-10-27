/* WebGL — « lignes de courant » : l'eau circule en filets derrière la coupe du héros.
   Lignes d'une fonction de courant déformée par du bruit (pas de grillage). */
import { Renderer } from '../../vendor/ogl/core/Renderer.js';
import { Program } from '../../vendor/ogl/core/Program.js';
import { Mesh } from '../../vendor/ogl/core/Mesh.js';
import { Triangle } from '../../vendor/ogl/extras/Triangle.js';
import { env, gsap, qs, surVisibilite, damp } from './env.js?v=2';

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uSouris;
uniform float uForce;
varying vec2 vUv;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float bruit(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  // masque : on ne calcule rien près des bords
  float masque = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x) * smoothstep(0.0, 0.16, vUv.y) * smoothstep(1.0, 0.84, vUv.y);
  if (masque < 0.01) { gl_FragColor = vec4(0.0); return; }
  vec2 p = vUv * vec2(uRes.x / uRes.y, 1.0) * 1.7;
  float t = uTime * 0.045;
  vec2 w = vec2(bruit(p * 0.9 + vec2(t, 1.3)), bruit(p * 0.9 + vec2(4.1, -t)));
  float psi = bruit(p * 0.75 + w * 0.7 + vec2(0.0, t * 0.7)) + 0.35 * bruit(p * 1.9 - w * 0.8 + t);
  vec2 d = vUv - uSouris; d.x *= uRes.x / uRes.y;
  psi += 0.32 * exp(-dot(d, d) * 9.0);
  float f = fract(psi * 6.0);
  float ligne = 1.0 - smoothstep(0.0, 0.055, abs(f - 0.5));
  float pointille = 0.45 + 0.55 * smoothstep(-0.2, 1.0, sin(psi * 46.0 - uTime * 1.6 + w.x * 5.0));
  float a = ligne * masque * pointille * 0.5 * uForce;
  gl_FragColor = vec4(vec3(0.184, 0.482, 0.918), a);
}`;

export function initFlux(depart) {
  const canvas = qs('[data-gl-flux]');
  if (!canvas || !env.anim) return;
  let renderer;
  try {
    renderer = new Renderer({ canvas, dpr: 1, alpha: true, premultipliedAlpha: false, antialias: false, powerPreference: 'low-power' });
  } catch (e) { return; }
  const gl = renderer.gl;
  if (!gl) { canvas.remove(); return; }
  gl.clearColor(0, 0, 0, 0);
  const program = new Program(gl, {
    vertex, fragment, transparent: true,
    uniforms: { uTime: { value: 0 }, uRes: { value: [1, 1] }, uSouris: { value: [0.5, 0.5] }, uForce: { value: 0 } },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const dimensionner = () => {
    const r = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(Math.max(1, r.width), Math.max(1, r.height));
    program.uniforms.uRes.value = [r.width, r.height];
  };
  dimensionner();
  window.addEventListener('resize', dimensionner);

  let visible = true, cibleX = 0.5, cibleY = 0.5, sx = 0.5, sy = 0.5, temps = 0, lance = false;
  surVisibilite(canvas, (v) => { visible = v; });
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    cibleX = (e.clientX - r.left) / r.width; cibleY = 1 - (e.clientY - r.top) / r.height;
  });

  depart.then(() => {
    lance = true;
    gsap.to(program.uniforms.uForce, { value: 1, duration: 2.2, ease: 'power2.out', delay: 0.6 });
  });

  let impaire = false, cumul = 0, n = 0, cout = 0;
  gsap.ticker.add((t, dtMs) => {
    if (!lance || !visible) return;
    // appareil trop lent (rendu logiciel) : on revient à la version sans WebGL
    if (n < 24) { if (n > 3) cout += dtMs; n++; if (n === 24 && cout / 20 > 45) { lance = false; canvas.remove(); return; } }
    cumul += Math.min(dtMs, 64);
    impaire = !impaire;
    if (impaire) return; // 30 images par seconde suffisent pour ce fond lent
    const dt = cumul / 1000; cumul = 0;
    temps += dt;
    sx = damp(sx, cibleX, 3, dt); sy = damp(sy, cibleY, 3, dt);
    program.uniforms.uTime.value = temps;
    program.uniforms.uSouris.value = [sx, sy];
    renderer.render({ scene: mesh });
  });
}
