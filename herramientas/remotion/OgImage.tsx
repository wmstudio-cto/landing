import React from "react";
import { AbsoluteFill } from "remotion";
import { BgMesh, Entrance, Finish, LogoMark } from "./layers";
import { theme } from "./theme";

// Imagen para compartir en redes (1200 x 630). Se exporta con `npm run og`.
export const OgImage: React.FC = () => (
  <AbsoluteFill>
    <BgMesh strength={0.7} />
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 88px", gap: 70 }}>
      <LogoMark size={300} sheen={20} />
      <div>
        <Entrance>
          <div
            style={{
              fontFamily: theme.fonts.brand,
              fontWeight: 300,
              fontSize: 28,
              letterSpacing: "0.36em",
              textTransform: "uppercase",
              color: theme.colors.primary,
            }}
          >
            Whole Models
          </div>
        </Entrance>
        <Entrance delay={4}>
          <div
            style={{
              marginTop: 22,
              fontFamily: theme.fonts.display,
              fontWeight: 400,
              fontSize: 96,
              lineHeight: 0.96,
              letterSpacing: "-0.025em",
              color: theme.colors.text,
            }}
          >
            The art
            <br />
            of <span style={{ fontStyle: "italic" }}>becoming.</span>
          </div>
        </Entrance>
        <Entrance delay={8}>
          <div
            style={{
              marginTop: 30,
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: 21,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: theme.colors.textDim,
            }}
          >
            Estudio de transmisión en Medellín
          </div>
        </Entrance>
      </div>
    </AbsoluteFill>
    <Finish />
  </AbsoluteFill>
);
