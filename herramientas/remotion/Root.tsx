import React from "react";
import { Composition } from "remotion";
import { loadFont as loadBodoni } from "@remotion/google-fonts/BodoniModa";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadJost } from "@remotion/google-fonts/Jost";
import { HERO, HERO_DURATION, HeroSting } from "./HeroSting";
import { MANIFESTO, MANIFESTO_DURATION, Manifesto } from "./Manifesto";
import { OgImage } from "./OgImage";
import { TOPIC, TOPIC_DURATION, TopicScene } from "./TopicScene";

// Solo para Remotion Studio y el CLI (`npm run studio`, `npm run og`).
// La web carga las mismas familias con next/font.
loadBodoni("normal", { weights: ["400"], subsets: ["latin"] });
loadBodoni("italic", { weights: ["400"], subsets: ["latin"] });
loadJost("normal", { weights: ["300", "400"], subsets: ["latin"] });
loadManrope("normal", { weights: ["500", "600", "800"], subsets: ["latin"] });

export const Root: React.FC = () => (
  <>
    <Composition
      id="HeroSting"
      component={HeroSting}
      width={HERO.size}
      height={HERO.size}
      fps={HERO.fps}
      durationInFrames={HERO_DURATION}
      defaultProps={{ px: 0, py: 0 }}
    />
    <Composition
      id="Manifesto"
      component={Manifesto}
      width={1600}
      height={900}
      fps={MANIFESTO.fps}
      durationInFrames={MANIFESTO_DURATION}
    />
    <Composition
      id="ManifestoVertical"
      component={Manifesto}
      width={900}
      height={1500}
      fps={MANIFESTO.fps}
      durationInFrames={MANIFESTO_DURATION}
    />
    <Composition
      id="TopicScene"
      component={TopicScene}
      width={TOPIC.size}
      height={TOPIC.size}
      fps={TOPIC.fps}
      durationInFrames={TOPIC_DURATION}
      defaultProps={{ topic: "espacios" as const }}
    />
    <Composition id="OgImage" component={OgImage} width={1200} height={630} fps={30} durationInFrames={60} />
  </>
);
