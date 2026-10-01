import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, tween, useSceneFrame, EASE_IN, EASE_IN_OUT } from "../anim";
import { Haze } from "../components/Haze";
import { Kinetic } from "../components/Kinetic";
import { OrdaMark } from "../components/OrdaMark";
import { PageTitle, Pill, Sidebar, TopBar } from "../components/AppUI";
import { Avatar, Notif } from "../components/WA";
import { C, FONT, SH } from "../theme";
import { voWords } from "../timeline";

type Row = { av?: string; name: string; msg: string; day: string; n?: number; needs?: boolean };

const ROWS: Row[] = [
  { av: "stock/av-w1.jpg", name: "Amina K.", msg: "AI: Order ORD-1042 delivered ✅ Enjoy your polo!", day: "now" },
  { av: "stock/av-m1.jpg", name: "Brian K.", msg: "AI: The London polo is UGX 100,000. Want size M?", day: "now", n: 2 },
  { av: "stock/av-m2.jpg", name: "Kato J.", msg: "AI: Yes! Delivery to Ntinda is UGX 5,000 today 🛵", day: "now", n: 1 },
  { name: "Mohamed A.", msg: "AI: نعم، متوفر بالمقاس L 👌", day: "Thu", n: 3 },
  { av: "stock/av-w3.jpg", name: "Grace", msg: "Can you print my name on the XXL jersey?", day: "now", n: 4, needs: true },
  { av: "stock/av-w2.jpg", name: "Sarah N.", msg: "AI: Your CeraVe order is on the way 🚚", day: "Wed", n: 1 },
  { name: "+256 701 ••• 552", msg: "AI: Habari! NIVEA ni UGX 18,000 tu.", day: "Wed", n: 2 },
  { av: "stock/av-m3.jpg", name: "Daniel", msg: "AI: Payment received, thank you! 🙏", day: "Wed" },
  { name: "Akram", msg: "AI: Both pieces are reserved for you.", day: "Tue", n: 1 },
  { av: "stock/av-w1.jpg", name: "Nakato", msg: "AI: We open at 8am. The ASICS are in stock.", day: "Tue" },
];

export const S06Needs: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l08", "needs").map((x) => x.f);
  // l08: And it only calls you when it truly needs you.
  const needsAt = w[8] - 2;
  const enter = tween(f, -10, 22, 0, 1);
  const scroll = tween(f, -10, needsAt - 6, 0, 1, EASE_IN_OUT);
  const flag = pop(f, needsAt, { damping: 11, stiffness: 220 });
  const push = pop(f, needsAt + 6, { damping: 15, stiffness: 160 });
  const exit = tween(f, 74, 94, 0, 1, EASE_IN);
  const rowH = 86;

  return (
    <AbsoluteFill>
      <Haze />
      <AbsoluteFill style={{ transform: `scale(${1 + tween(f, 0, 90, 0, 0.04) + exit * 0.1})`, filter: exit > 0 ? `blur(${exit * 18}px)` : undefined }}>
        <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Kinetic text="It only calls you when it truly *needs you.*" f={f} times={w.slice(1)} size={70} align="center" />
        </div>

        <div style={{ position: "absolute", left: 190, top: 210, perspective: 2600 }}>
          <div
            style={{
              width: 1540,
              height: 820,
              borderRadius: 28,
              background: "#fff",
              border: `1px solid ${C.line}`,
              boxShadow: SH.card,
              overflow: "hidden",
              display: "flex",
              transform: `translateY(${(1 - enter) * 120}px) rotateX(${10 - 6 * enter}deg) scale(${0.94 + 0.06 * enter})`,
              transformOrigin: "50% 0%",
              opacity: enter,
            }}
          >
            <Sidebar active="Conversations" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <TopBar bell={f >= needsAt ? 30 : 29} />
              <div style={{ padding: "26px 40px 0", fontFamily: FONT }}>
                <PageTitle pre="Conversations" accent="" post="" size={40} />
                <div style={{ fontSize: 16, color: C.sub, marginTop: 6 }}>49 chats · 290 unread</div>
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <Pill tone="cyan" size={16} style={{ background: C.cyan, color: "#06323F", border: "none" }}>
                    All 49
                  </Pill>
                  <Pill size={16}>Unread 32</Pill>
                  <Pill size={16}>Needs you {f >= needsAt ? 6 : 5}</Pill>
                </div>
              </div>
              <div style={{ position: "relative", flex: 1, overflow: "hidden", margin: "18px 40px 0", borderTop: `1px solid ${C.line}` }}>
                <div style={{ transform: `translateY(${-scroll * rowH * 2}px)` }}>
                  {[...ROWS, ...ROWS.slice(0, 3)].map((r, i) => {
                    const isFlag = r.needs && i < ROWS.length;
                    return (
                      <div
                        key={i}
                        style={{
                          height: rowH,
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: "0 18px",
                          borderBottom: `1px solid ${C.line}`,
                          boxShadow: `inset 3px 0 0 ${isFlag && f >= needsAt ? "#D9A441" : C.cyan}`,
                          background: isFlag ? `rgba(247,238,219,${0.9 * Math.min(1, flag)})` : "#fff",
                          transform: isFlag ? `scale(${1 + 0.02 * Math.min(1, flag)})` : undefined,
                          fontFamily: FONT,
                        }}
                      >
                        <Avatar src={r.av} name={r.name.replace("+", "")[0]} size={52} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 18, fontWeight: 650, color: C.ink }}>{r.name}</span>
                            {isFlag && (
                              <span style={{ transform: `scale(${flag})`, display: "inline-flex" }}>
                                <Pill tone="amber" size={14} dot>
                                  Needs you
                                </Pill>
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 15.5, color: C.sub, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.msg}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <span style={{ fontSize: 14, color: C.cyanDeep, fontWeight: 600 }}>{r.day}</span>
                          {r.n && (
                            <span style={{ minWidth: 26, height: 22, borderRadius: 11, background: C.cyan, color: "#06323F", fontSize: 12.5, fontWeight: 750, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {r.n}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 120,
            top: 236,
            transform: `translateY(${(1 - push) * -60}px) scale(${0.9 + 0.1 * push})`,
            opacity: Math.min(1, push),
            zIndex: 20,
          }}
        >
          <Notif
            name="Needs you · Grace"
            app="GetOrda"
            avatar="stock/av-w3.jpg"
            msg="Wants her name printed on the XXL jersey"
            width={560}
            icon={
              <div style={{ width: 24, height: 24, borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
                <OrdaMark size={18} id="needs-n" color="#12120F" />
              </div>
            }
            style={{ boxShadow: `0 0 0 2px rgba(217,164,65,0.5), ${SH.float}` }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
