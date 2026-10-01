import React from "react";
import { AbsoluteFill } from "remotion";
import { Lock } from "lucide-react";
import { caretOn, pop, tween, typed, useSceneFrame, EASE_IN, EASE_IN_OUT } from "../anim";
import { Haze } from "../components/Haze";
import { IPhone } from "../components/IPhone";
import { Kinetic } from "../components/Kinetic";
import { Photo, Pill } from "../components/AppUI";
import { WAIcon } from "../components/WA";
import { C, FONT, SH } from "../theme";
import { P } from "../products";
import { voWords } from "../timeline";

const URL = "dripavenue.getorda.app";

const Storefront: React.FC<{ f: number }> = ({ f }) => {
  const scroll = tween(f, 26, 80, 0, 1, EASE_IN_OUT);
  const items = [P.london, P.asics, P.nivea, P.perfume];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT }}>
      <div style={{ transform: `translateY(${-scroll * 230}px)` }}>
        <div style={{ height: 380, position: "relative", background: "linear-gradient(165deg,#DDF5FD 0%,#9FE3F6 60%,#6DD4F1 100%)", overflow: "hidden" }}>
          <Photo src="products/jersey-supreme-cut.png" fit="contain" style={{ position: "absolute", width: 300, height: 300, right: -18, top: 70, transform: `rotate(${-8 + scroll * 4}deg)`, filter: "drop-shadow(0 20px 26px rgba(11,60,90,0.3))" }} />
          <div style={{ position: "absolute", left: 22, top: 74 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.cyanInk, letterSpacing: "0.12em" }}>NEW DROP</div>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.04em", color: C.ink, lineHeight: 1, marginTop: 6 }}>
              Drip
              <br />
              Avenue
            </div>
            <div style={{ fontSize: 13.5, color: C.ink2, marginTop: 8 }}>Kampala · delivers today</div>
          </div>
          <div style={{ position: "absolute", left: 22, bottom: 24, display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999, background: C.wa, color: "#fff", fontSize: 14.5, fontWeight: 700 }}>
            <WAIcon size={22} bg="transparent" /> Order on WhatsApp
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "16px 16px 10px" }}>
          {["All", "Polos", "Sneakers", "Beauty"].map((t, i) => (
            <span key={t} style={{ padding: "7px 14px", borderRadius: 999, fontSize: 13.5, fontWeight: 600, background: i === 0 ? C.ink : "#F1F4F5", color: i === 0 ? "#fff" : C.sub }}>
              {t}
            </span>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 14px" }}>
          {items.map((p) => (
            <div key={p.name} style={{ borderRadius: 14, border: `1px solid ${C.line}`, overflow: "hidden" }}>
              <Photo src={p.src} fit={p.fit} style={{ width: "100%", height: 150, background: "#fff" }} />
              <div style={{ padding: "8px 10px 10px" }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                <div style={{ fontSize: 14, fontWeight: 750, color: C.ink, marginTop: 2 }}>{p.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const S07Store: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l09", "store").map((x) => x.f);
  // l09: Your own store, live in a minute.
  const url = typed(URL, f, 0, 1.1);
  const live = pop(f, w[3] - 2, { damping: 12, stiffness: 220 });
  const phone = pop(f, -8, { damping: 16, stiffness: 110 });
  const exit = tween(f, 62, 82, 0, 1, EASE_IN);

  return (
    <AbsoluteFill>
      <Haze />
      <AbsoluteFill style={{ transform: `scale(${1 + tween(f, 0, 80, 0, 0.04) + exit * 0.1})`, filter: exit > 0 ? `blur(${exit * 18}px)` : undefined }}>
        <div style={{ position: "absolute", left: 160, top: 260 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              padding: "18px 26px",
              borderRadius: 999,
              background: "#fff",
              border: `1px solid ${C.line}`,
              boxShadow: SH.soft,
              fontFamily: FONT,
              fontSize: 34,
              fontWeight: 550,
              color: C.ink,
              marginBottom: 44,
            }}
          >
            <Lock size={26} color={C.ok} strokeWidth={2.4} />
            <span>
              {url}
              <span style={{ color: C.cyanDeep, opacity: url.length < URL.length && caretOn(f) ? 1 : 0 }}>|</span>
            </span>
            <span style={{ transform: `scale(${live})`, display: "inline-flex", marginLeft: 6 }}>
              <Pill tone="ok" size={20} dot>
                Live
              </Pill>
            </span>
          </div>
          <Kinetic text="Your own *store,*" f={f} times={w.slice(0, 3)} size={104} />
          <Kinetic text="live in a *minute.*" f={f} times={w.slice(3, 7)} size={104} />
        </div>
        <div style={{ position: "absolute", left: 1240, top: 110, perspective: 2400 }}>
          <div style={{ transform: `translateX(${(1 - phone) * 700}px) rotateY(${-14 + 5 * phone}deg) rotateZ(${(1 - phone) * 8}deg)` }}>
            <IPhone time="09:12">
              <Storefront f={f} />
            </IPhone>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
