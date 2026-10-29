"use client";
import ArrowIcon from "@/components/ArrowIcon";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { testimonials } from "@/data/testimonials";
import { dampProgress, filmState, handPoses, scrollProgress } from '@/lib/animation/scroll-film';
import { canAnimateFilm, watchFilmAssets } from '@/lib/animation/film-assets';
import '@/app/film-responsive.css';

const reducedQuery = '(prefers-reduced-motion: reduce)';
const compactQuery = '(max-height: 520px)';
function motionSnapshot() {
  return canAnimateFilm(matchMedia(reducedQuery).matches, matchMedia(compactQuery).matches);
}
function subscribeMotion(changed: () => void) {
  const queries = [matchMedia(reducedQuery), matchMedia(compactQuery)];
  queries.forEach(query => query.addEventListener('change', changed));
  return () => queries.forEach(query => query.removeEventListener('change', changed));
}
const serverMotionSnapshot = () => false;

export default function ScrollFilm() {
  const root = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);
  const motionAllowed = useSyncExternalStore(subscribeMotion, motionSnapshot, serverMotionSnapshot);
  const [assetFailed, setAssetFailed] = useState(false);
  const animate = motionAllowed && !assetFailed;
  useEffect(() => {
    if (!animate) return;
    const el = root.current;
    const stage = el?.querySelector<HTMLElement>('.film-stage');
    if (!el || !stage) return;
    const hand=el.querySelector<HTMLElement>('.film-hand')!, car=el.querySelector<HTMLElement>('.film-car')!;
    const road=el.querySelector<HTMLElement>('.film-road')!, copy=el.querySelector<HTMLElement>('.film-copy')!;
    const arrival=el.querySelector<HTMLElement>('.film-arrival')!, readability=el.querySelector<HTMLElement>('.film-readability')!;
    const bar=el.querySelector<HTMLElement>('.film-progress > span')!, hint=el.querySelector<HTMLElement>('.film-scroll-hint')!;
    const poses=handPoses.map(pose=>el.querySelector<HTMLImageElement>(`.film-hand-${pose.name}`)!);
    let frame=0, progress=0, previousTime=0, activeChapter=-1, visible=true, ready=false, disposed=false;
    let geometry={top:0,height:1,stageHeight:1};
    const paint=(p:number)=>{
      const state=filmState(p);
      poses.forEach((pose,index)=>{ const opacity=String(state.poses[index]);if(pose.style.opacity!==opacity)pose.style.opacity=opacity; });
      hand.style.transform=`translate3d(${state.handX}%,${state.handY}%,0) rotate(${state.handAngle}deg)`;
      hand.style.opacity=String(1-Math.max(0,Math.min(1,(state.leave-.55)/.45)));
      car.style.transform=`translate3d(${state.carX}%,${state.carY}%,0) scale(${state.carScale}) rotate(${state.carAngle}deg)`;
      car.style.opacity=String(state.carOpacity);
      road.style.transform=`translate3d(0,${state.drive*12}%,0) scale(${1+state.drive*.08})`;
      copy.style.opacity=String(1-state.copyFade);copy.style.transform=`translate3d(0,${state.copyFade*-18}px,0)`;
      copy.style.visibility=state.copyFade===1?'hidden':'visible';copy.inert=state.copyFade>.95;
      arrival.style.opacity=String(state.arrivalFade);arrival.style.transform=`translate3d(0,${(1-state.arrivalFade)*20}px,0)`;
      arrival.style.visibility=state.arrivalFade===0?'hidden':'visible';arrival.inert=state.arrivalFade<.05;
      readability.style.opacity=String(1-state.drive*.65);bar.style.transform=`scaleX(${state.p})`;hint.style.opacity=String(1-state.close);
      if(activeChapter!==state.chapter){activeChapter=state.chapter;setChapter(state.chapter);}
    };
    const draw=(time:number)=>{
      frame=0;
      if(disposed||document.hidden||!visible)return;
      const still=!ready;
      const target=still?0:scrollProgress(window.scrollY,geometry.top,geometry.height,geometry.stageHeight);
      progress=still?0:dampProgress(progress,target,previousTime?time-previousTime:16.67);
      previousTime=time;paint(progress);
      if(progress!==target)frame=requestAnimationFrame(draw);else previousTime=0;
    };
    const schedule=()=>{if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);};
    const measure=()=>{
      const bounds=el.getBoundingClientRect();
      geometry={top:bounds.top+window.scrollY,height:bounds.height,stageHeight:stage.getBoundingClientRect().height};
      schedule();
    };
    const visibility=()=>{previousTime=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else measure();};
    const observer=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;el.dataset.animating=String(visible);
      if(visible){previousTime=0;measure();}else{cancelAnimationFrame(frame);frame=0;}
    },{rootMargin:'120px 0px'});
    observer.observe(el);
    const resize=new ResizeObserver(measure);resize.observe(el);resize.observe(stage);
    // Preserve original WebP pixels; decode the actual DOM assets before blending poses.
    const cancelDecode=watchFilmAssets([...poses,car.querySelector<HTMLImageElement>('img')!],loaded=>{
      if(loaded){ready=true;schedule();}else setAssetFailed(true);
    });
    document.fonts.ready.then(()=>{if(!disposed)measure();});
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',measure);
    document.addEventListener('visibilitychange',visibility);
    measure();paint(0);
    return()=>{
      disposed=true;cancelDecode();cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();
      // Preference changes must restore the opening copy and its interactive links.
      paint(0);
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',measure);
      document.removeEventListener('visibilitychange',visibility);
    };
  }, [animate]);
  return (
    <section
      ref={root}
      className="film-track"
      data-static={assetFailed}
      aria-label={animate ? 'De la llave al camino: una historia controlada por el desplazamiento' : 'De la llave al camino'}
    >
      {/* Keep eligible track geometry stable before hydration; no-JS still stays compact. */}
      <noscript><style>{`
        .hero-film .film-track{height:auto}
        .hero-film .film-track .film-stage{position:relative;height:max(100svh,620px);min-height:0}
        .hero-film .film-chapters,.hero-film .film-progress,.hero-film .film-scroll-hint{display:none}
        .hero-film .film-controls{justify-content:flex-end}
        .hero-film .film-hand,.hero-film .film-road{will-change:auto}
        @media(max-height:520px){.hero-film .film-track .film-stage{height:600px}}
      `}</style></noscript>
      <div className="film-stage" data-chapter={chapter}>
        <div className="film-canvas" aria-hidden="true">
          <Image
            className="film-road"
            src="/brand/film-road.webp"
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
          />
          {animate && <div className="film-car">
            <Image src="/brand/film-car.webp" alt="" fill unoptimized loading="eager" fetchPriority="low" sizes="100vw" />
          </div>}
          <div className="film-hand">
            {handPoses.filter(pose => animate || pose.name === 'open').map((pose) => (
              <Image key={pose.name} className={`film-hand-${pose.name}`}
                src={`/brand/film-${pose.name}.webp`} alt="" fill unoptimized priority={pose.name === "open"} loading={pose.name === "open" ? undefined : "eager"} fetchPriority={pose.name === "open" ? "high" : "low"} sizes="100vw" />
            ))}
          </div>
        </div>
        <div className="film-readability" />
        <div className="film-copy">
          <span className="kicker">
            <i />
            DEALERPASS / TU SIGUIENTE PASO
          </span>
          <h1>
            El conocimiento
            <br />
            te da las llaves.
          </h1>
          <p>
            Aprende a comprar en subastas de Estados Unidos. Evalúa cada
            oportunidad y toma el control de tu próxima decisión.
          </p>
          <div className="film-actions">
            <Link className="button" href="/academy">
              Conocer la formación{" "}
              <span aria-hidden>
                <ArrowIcon />
              </span>
            </Link>
            <Link className="text-link" href="/planes">
              Ver planes{" "}
              <span aria-hidden>
                <ArrowIcon />
              </span>
            </Link>
          </div>
          <a className="film-trust" href="#testimonios">
            <span className="hero-avatars" aria-hidden="true">
              {testimonials.slice(0, 4).map((t) => (
                <Image
                  key={t.name}
                  src={t.avatarUrl!}
                  alt=""
                  width={36}
                  height={36}
                />
              ))}
            </span>
            <span>
              <strong>Más de 3.000 personas</strong>
              <small>se han formado con nosotros.</small>
            </span>
            <span aria-hidden>
              <ArrowIcon />
            </span>
          </a>
        </div>
        <div className="film-arrival">
          <span className="kicker">
            <i />
            DE LA FORMACIÓN A LA DECISIÓN
          </span>
          <h2>
            Tu siguiente paso
            <br />
            empieza aquí.
          </h2>
          <Link className="button" href="/academy">
            Explorar la academia{" "}
            <span aria-hidden>
              <ArrowIcon />
            </span>
          </Link>
        </div>
        <div className="film-controls">
          <div className="film-chapters" aria-label="Etapa de la animación">
            <span aria-current={chapter === 0 ? "step" : undefined}>
              01 / Las llaves
            </span>
            <span aria-current={chapter === 1 ? "step" : undefined}>
              02 / La decisión
            </span>
            <span aria-current={chapter === 2 ? "step" : undefined}>
              03 / El camino
            </span>
          </div>
          <a href="#experiencia">
            {animate ? 'Saltar animación' : 'Continuar'}{" "}
            <span aria-hidden>
              <ArrowIcon direction="down" />
            </span>
          </a>
          <div className="film-progress" aria-hidden="true">
            <span />
          </div>
        </div>
        <span className="film-scroll-hint">
          Desliza para continuar{" "}
          <span aria-hidden>
            <ArrowIcon direction="down" />
          </span>
        </span>
      </div>
    </section>
  );
}
