/* Page 404 : le raccord fuit, la flaque monte. */
import { env, gsap, qs } from './env.js?v=1';

export function init404(intro) {
  const flaque = qs('[data-flaque]');
  if (!flaque || !env.anim) return;
  const joint = qs('.e404__joint');
  const svg = qs('.e404__tuyau');
  intro.then(() => {
    gsap.fromTo(flaque, { scaleY: 0 }, { scaleY: 1, duration: 6, ease: 'power1.out' });
    const goutte = () => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      g.setAttribute('cx', joint.getAttribute('cx')); g.setAttribute('cy', '114'); g.setAttribute('rx', '3.5'); g.setAttribute('ry', '5');
      g.setAttribute('fill', '#2F7BEA');
      svg.appendChild(g);
      gsap.fromTo(g, { y: 0, opacity: 1 }, { y: 200, opacity: 0, duration: 0.9, ease: 'power2.in', onComplete: () => g.remove() });
    };
    gsap.timeline({ repeat: -1, repeatDelay: 0.25 }).call(goutte).to({}, { duration: 0.45 });
  });
}
