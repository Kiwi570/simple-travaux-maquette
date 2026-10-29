/* Comment ça marche : quatre vannes quart de tour qui s'ouvrent l'une après l'autre. */
import { env, gsap, ScrollTrigger, qs, qsa } from './env.js?v=3';

export function initEtapes() {
  const s = qs('[data-etapes]');
  if (!s) return;
  const etapes = qsa('[data-etape]', s);
  const parts = etapes.map((e) => ({
    e,
    poignee: qs('.etape__poignee', e),
    eau: qs('.etape__tuyau i', e),
    desc: qs('.etape__desc', e),
  }));

  if (!env.anim) {
    parts.forEach((p) => { p.e.classList.add('active'); p.poignee.style.transform = 'rotate(0deg)'; if (p.eau) p.eau.style.transform = 'scaleY(1)'; });
    return;
  }

  const epinglable = window.innerWidth >= 980 && window.innerHeight >= 540;
  if (epinglable) {
    s.classList.add('epingle');
    const n = parts.length;
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: s, start: 'top top', end: () => `+=${Math.round(window.innerHeight * 2.1)}`,
        pin: true, scrub: 0.5, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (st) => {
          const i = Math.min(n - 1, Math.floor(st.progress * n * 0.999));
          parts.forEach((p, k) => p.e.classList.toggle('active', k === i));
        },
      },
    });
    parts.forEach((p, i) => {
      tl.fromTo(p.poignee, { rotation: 90 }, { rotation: 0, duration: 0.3 }, i)
        .fromTo(p.desc, { gridTemplateRows: '0fr', opacity: 0 }, { gridTemplateRows: '1fr', opacity: 1, duration: 0.25 }, i + 0.05);
      if (i < n - 1) {
        tl.fromTo(p.eau, { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: 'none' }, i + 0.45)
          .to(p.desc, { gridTemplateRows: '0fr', opacity: 0, duration: 0.2 }, i + 0.8);
      } else tl.to({}, { duration: 0.4 }, i + 0.3);
    });
    parts[0].e.classList.add('active');
    return;
  }

  // sans épinglage (téléphone, petits écrans) : chaque vanne s'ouvre en entrant
  parts.forEach((p) => {
    gsap.set(p.poignee, { rotation: 90 });
    if (p.eau) gsap.set(p.eau, { scaleY: 0 });
    ScrollTrigger.create({
      trigger: p.e, start: 'top 75%', once: true,
      onEnter: () => {
        p.e.classList.add('active');
        gsap.fromTo(p.poignee, { rotation: 90 }, { rotation: 0, duration: 0.7, ease: 'back.out(1.8)' });
        if (p.eau) gsap.fromTo(p.eau, { scaleY: 0 }, { scaleY: 1, duration: 0.9, delay: 0.3, ease: 'power2.inOut' });
      },
    });
  });
}
