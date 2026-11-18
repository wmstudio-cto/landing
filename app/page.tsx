import type { CSSProperties } from "react";
import { Experience } from "../components/Experience";
import { FlipTitle } from "../components/FlipTitle";
import { Logo } from "../components/Logo";
import { MotionToggle } from "../components/MotionToggle";
import { Photo } from "../components/Photo";
import { SiteHeader } from "../components/SiteHeader";
import { faqs, nav, piece, pillars, scenes, site, talents } from "../lib/site";

const num = (i: number) => String(i + 1).padStart(2, "0");

export default function Home() {
  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <SiteHeader />
      <MotionToggle />

      {/* La escultura de oro líquido: un único lienzo fijo detrás de todo. */}
      <Experience />

      <main id="contenido">
        {/* ---------- ESCENA 01 · The Entrance  +  ESCENA 02 · The Golden Movement ---------- */}
        <section id="inicio" className="act act--entrance">
          <div className="act__pin">
            <div className="hero">
              <div className="hero__model">
                <Photo piece={piece(scenes.entrance)} sizes="(max-width: 860px) 82vw, 44vw" />
              </div>
              <div className="hero__copy">
                <p className="eyebrow hero__line" style={{ "--n": 0 } as CSSProperties}>
                  Whole Models Studio · Medellín
                </p>
                <h1>
                  <span className="serif hero__title hero__line" style={{ "--n": 1 } as CSSProperties}>
                    <FlipTitle
                      en={
                        <>
                          <span className="flip__line">The art</span>
                          <span className="flip__line">
                            of <em>becoming.</em>
                          </span>
                        </>
                      }
                      es={
                        <>
                          <span className="flip__line">El arte de</span>
                          <span className="flip__line">
                            <em>llegar a ser.</em>
                          </span>
                        </>
                      }
                    />
                  </span>
                  <span className="hero__sub hero__line" style={{ "--n": 3 } as CSSProperties}>
                    Estudio de transmisión en Medellín
                  </span>
                </h1>
                <p className="hero__lead hero__line" style={{ "--n": 4 } as CSSProperties}>
                  Formamos creadoras profesionales en un entorno a la altura de su potencial.
                </p>
              </div>
              <a className="cue" href="#experiencia">
                <span />
                Desliza
              </a>
            </div>

            <div className="statement">
              <h2 className="serif statement__title">
                <FlipTitle
                  en={
                    <>
                      <span className="flip__line">Nothing ordinary.</span>
                      <span className="flip__line">
                        Everything <em>possible.</em>
                      </span>
                    </>
                  }
                  es={
                    <>
                      <span className="flip__line">Nada ordinario.</span>
                      <span className="flip__line">
                        Todo es <em>posible.</em>
                      </span>
                    </>
                  }
                />
              </h2>
            </div>
          </div>
        </section>

        {/* ---------- ESCENA 03 · The Whole Experience ---------- */}
        <section id="experiencia" className="act act--experience" aria-labelledby="experiencia-titulo">
          <div className="act__pin">
            <div className="xp">
              <div className="xp__copy">
                <p className="eyebrow">El universo Whole Models</p>
                <h2 id="experiencia-titulo" className="serif">
                  <FlipTitle
                    en={
                      <>
                        <span className="flip__line">The Whole</span>
                        <span className="flip__line">
                          <em>Experience.</em>
                        </span>
                      </>
                    }
                    es={
                      <>
                        <span className="flip__line">La experiencia</span>
                        <span className="flip__line">
                          <em>Whole.</em>
                        </span>
                      </>
                    }
                  />
                </h2>
                <ol className="xp__list">
                  {pillars.map((pillar, i) => (
                    <li key={pillar.title} className="xp__item">
                      <span className="xp__num">{num(i)}</span>
                      <div>
                        <h3>{pillar.title}</h3>
                        <p>{pillar.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="xp__stage">
                <div className="xp__frame">
                  {pillars.map((pillar) => (
                    <div key={pillar.title} className="xp__img" style={{ "--focus": pillar.focus } as CSSProperties}>
                      <Photo piece={piece(pillar.foto)} sizes="(max-width: 860px) 70vw, 30vw" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- ESCENA 04 · The Talents ---------- */}
        <section id="talentos" className="act act--talents" aria-labelledby="talentos-titulo">
          <div className="act__pin">
            <div className="talents__track">
              <header className="talents__intro">
                <p className="eyebrow">Las protagonistas</p>
                <h2 id="talentos-titulo" className="serif">
                  <FlipTitle
                    en={
                      <>
                        The <em>Talents.</em>
                      </>
                    }
                    es={
                      <>
                        Los <em>talentos.</em>
                      </>
                    }
                  />
                </h2>
                <p>Cada retrato lleva el nombre de algo que aquí se entrena.</p>
              </header>
              {talents.map((talent) => (
                <figure key={talent.id} className="talent">
                  <div className="talent__photo">
                    <Photo piece={talent} folder="talentos" sizes="(max-width: 860px) 70vw, 30vw" />
                  </div>
                  <figcaption>
                    <span className="talent__num">N.º {talent.id}</span>
                    <strong className="serif">{talent.title}</strong>
                    <span className="talent__line">{talent.line}</span>
                  </figcaption>
                </figure>
              ))}
              <div className="talents__end" aria-hidden="true">
                <Logo size={72} />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- ESCENA 05 · The Transformation ---------- */}
        <section id="transformacion" className="act act--transformation" aria-labelledby="transformacion-titulo">
          <div className="act__pin">
            <div className="portal__photo">
              <Photo piece={piece(scenes.transformation)} sizes="100vw" />
              <span className="portal__warm" aria-hidden="true" />
            </div>
            <div className="portal__copy">
              <p className="eyebrow">Una nueva etapa</p>
              <h2 id="transformacion-titulo" className="serif">
                <FlipTitle
                  en={
                    <>
                      Your potential deserves the right <em>environment.</em>
                    </>
                  }
                  es={
                    <>
                      Tu potencial merece el entorno <em>correcto.</em>
                    </>
                  }
                />
              </h2>
              <p>Evolución, confianza y nuevas oportunidades en un estudio pensado para tu crecimiento.</p>
            </div>
          </div>
        </section>

        {/* ---------- ESCENA 06 · Join Whole ---------- */}
        <section id="unete" className="join" aria-labelledby="unete-titulo">
          <div className="join__inner">
            <Logo size={64} className="join__in" />
            <h2 id="unete-titulo" className="serif join__in">
              <FlipTitle
                en={
                  <>
                    <span className="flip__line">Ready to</span>
                    <span className="flip__line">
                      become <em>Whole?</em>
                    </span>
                  </>
                }
                es={
                  <>
                    <span className="flip__line">¿Lista para</span>
                    <span className="flip__line">
                      ser <em>Whole?</em>
                    </span>
                  </>
                }
              />
            </h2>
            <p className="join__in">
              La convocatoria está abierta. Escríbenos por Instagram y te contamos todo. Solo para mayores de 18 años.
            </p>
            <a className="apply join__in" href={site.dm} target="_blank" rel="noopener noreferrer">
              Apply to Whole Models
            </a>
          </div>
        </section>

        {/* ---------- Preguntas: discretas, después del recorrido ---------- */}
        <section id="preguntas" className="quiet" aria-labelledby="preguntas-titulo">
          <div className="quiet__head quiet__in">
            <p className="eyebrow">Antes de escribirnos</p>
            <h2 id="preguntas-titulo" className="serif">
              Preguntas <em>frecuentes.</em>
            </h2>
          </div>
          <div className="faq quiet__in">
            {faqs.map((f) => (
              <details key={f.q} name="faq">
                <summary>
                  <h3>{f.q}</h3>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="foot">
        <p className="wordmark">Whole Models</p>
        <nav aria-label="Pie de página">
          {nav.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <a href={site.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </nav>
        <p className="foot__legal">
          Estudio de transmisión en Medellín, Colombia. Contenido y convocatoria solo para mayores de 18 años.
        </p>
      </footer>
    </>
  );
}
