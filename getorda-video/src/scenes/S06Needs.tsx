import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, useSceneFrame } from "../anim";
import { Layer, MotionBlur, World } from "../components/Cam";
import { Haze } from "../components/Haze";
import { Kinetic } from "../components/Kinetic";
import { OrdaMark } from "../components/OrdaMark";
import { PageTitle, Pill, Sidebar, TopBar } from "../components/AppUI";
import { Avatar, Notif } from "../components/WA";
import { cam, camVel, CamKeys, E, kf } from "../motion";
import { C, FONT, SH } from "../theme";
import { voWords } from "../timeline";

type Row = { av?: string; name: string; msg: string; day: string; n?: number; needs?: boolean };

const ROWS: Row[] = [
  { av: "stock/av-w1.jpg", name: "Amina K.", msg: "AI: Order ORD-1042 delivered ✅ Enjoy your polo!", day: "now" },
  { av: "stock/av-m1.jpg", name: "Brian K.", msg: "AI: The London polo is UGX 100,000. Want size M?", day: "now", n: 2 },
  { av: "stock/av-m2.jpg", name: "Kevin O.", msg: "AI: Yes! Same-day delivery is UGX 5,000 📦", day: "now", n: 1 },
  { name: "Mohamed A.", msg: "AI: نعم، متوفر بالمقاس L 👌", day: "Thu", n: 3 },
  { av: "stock/av-w3.jpg", name: "Grace", msg: "Can you print my name on the XXL jersey?", day: "now", n: 4, needs: true },
  { av: "stock/av-w2.jpg", name: "Sarah N.", msg: "AI: Your CeraVe order is on the way 🚚", day: "Wed", n: 1 },
  { name: "Leila M.", msg: "AI: Bonjour ! Le NIVEA est à UGX 18,000.", day: "Wed", n: 2 },
  { av: "stock/av-m3.jpg", name: "Daniel", msg: "AI: Payment received, thank you! 🙏", day: "Wed" },
  { name: "Akram", msg: "AI: Both pieces are reserved for you.", day: "Tue", n: 1 },
  { av: "stock/av-w1.jpg", name: "Nakato", msg: "AI: We open at 8am. The ASICS are in stock.", day: "Tue" },
  { av: "stock/av-m1.jpg", name: "Ivan", msg: "AI: Size 42 is available in the Gel-1130 👟", day: "Mon", n: 1 },
  { name: "Hadijah", msg: "AI: Sending the receipt now 🧾", day: "Mon" },
];
const ROW_H = 86;
// The dashboard card is scaled down a touch so the headline clears the top edge.
const CS = 0.9;

const RowView: React.FC<{ r: Row; flag: number; glow?: boolean }> = ({ r, flag, glow }) => (
  <div
    style={{
      height: ROW_H,
      width: 1210,
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "0 18px",
      borderBottom: `1px solid ${C.line}`,
      boxShadow: `inset 3px 0 0 ${r.needs && flag > 0 ? "#D9A441" : C.cyan}${glow ? ", 0 30px 60px rgba(137,98,29,0.22), 0 0 0 2px rgba(217,164,65,0.6)" : ""}`,
      background: r.needs ? `rgba(247,238,219,${Math.min(1, flag)})` : "#fff",
      borderRadius: glow ? 16 : 0,
      fontFamily: FONT,
    }}
  >
    <Avatar src={r.av} name={r.name.replace("+", "")[0]} size={52} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18, fontWeight: 650, color: C.ink }}>{r.name}</span>
        {r.needs && flag > 0 && (
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

export const S06Needs: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l08", "needs").map((x) => x.f);
  // l08: And it only calls you when it truly needs you.
  const needsAt = w[8] - 2;
  const K: CamKeys = {
    x: [[-10, -1500], [10, 0, E.out], [84, 30]],
    z: [[-10, 80], [10, 110, E.out], [needsAt - 4, 40, E.inOut], [needsAt + 20, 100, E.inOut], [94, 115]],
    rx: [[-10, 20], [needsAt - 6, 8, E.inOut], [94, 4]],
    ry: [[-10, -12], [needsAt, 0, E.inOut], [94, 3]],
    y: [[-10, 90], [needsAt, 60, E.inOut], [needsAt + 20, 70, E.inOut]],
  };
  const c = cam(f, K);
  const v = camVel(f, K);
  // Fast scroll that eases out right as Grace's row lands in place.
  const scroll = kf(f, [[-10, 0], [needsAt - 6, 1, E.out]]);
  const scrollV = (kf(f + 0.5, [[-10, 0], [needsAt - 6, 1, E.out]]) - kf(f - 0.5, [[-10, 0], [needsAt - 6, 1, E.out]])) * ROW_H * 6;
  const flag = pop(f, needsAt, { damping: 11, stiffness: 220 });
  const lift = kf(f, [[needsAt, 0], [needsAt + 14, 1, E.out]]);
  const push = pop(f, needsAt + 6, { damping: 15, stiffness: 160 });
  const scrollRows = 6;
  const graceIdx = 4;
  const graceY = 417 + ROW_H * (graceIdx - scrollRows * scroll) + ROW_H / 2;

  return (
    <AbsoluteFill>
      <Haze />
      <MotionBlur vx={v.vx} vy={v.vy} amount={0.3}>
        <World c={c}>
          <Layer x={960} y={150} z={0}>
            <div style={{ whiteSpace: "nowrap" }}>
              <Kinetic text="It only calls you when it truly *needs you.*" f={f} times={w.slice(1)} size={72} align="center" />
            </div>
          </Layer>
          <Layer x={960} y={600} z={0} s={CS}>
            <div style={{ width: 1540, height: 820, borderRadius: 28, background: "#fff", border: `1px solid ${C.line}`, boxShadow: SH.card, overflow: "hidden", display: "flex" }}>
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
                    <Pill size={16} tone={f >= needsAt ? "amber" : "grey"}>
                      Needs you {f >= needsAt ? 6 : 5}
                    </Pill>
                  </div>
                </div>
                <div style={{ position: "relative", flex: 1, overflow: "hidden", margin: "18px 40px 0", borderTop: `1px solid ${C.line}` }}>
                  <MotionBlur vx={0} vy={scrollV} amount={0.45}>
                    <div style={{ transform: `translateY(${-scroll * ROW_H * scrollRows}px)` }}>
                      {ROWS.map((r, i) => (
                        <div key={i} style={{ opacity: r.needs ? 1 - lift : 1 }}>
                          <RowView r={r} flag={r.needs ? flag : 0} />
                        </div>
                      ))}
                    </div>
                  </MotionBlur>
                </div>
              </div>
            </div>
          </Layer>
          {/* Grace's row lifts out of the list toward the camera. */}
          <Layer x={960 + (190 + 250 + 40 + 605 - 960) * CS} y={600 + (graceY - 600) * CS - lift * 10} z={lift * 190} s={CS * (1 + lift * 0.05)} o={lift > 0 ? 1 : 0}>
            <RowView r={ROWS[graceIdx]} flag={flag} glow />
          </Layer>
        </World>
      </MotionBlur>
      <div style={{ position: "absolute", right: 100, top: 210, transform: `translateY(${(1 - push) * -70}px) scale(${0.9 + 0.1 * push})`, opacity: Math.min(1, push) }}>
        <Notif
          name="Needs you · Grace"
          app="GetOrda"
          avatar="stock/av-w3.jpg"
          msg="Wants her name printed on the XXL jersey"
          width={580}
          icon={
            <div style={{ width: 24, height: 24, borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
              <OrdaMark size={18} id="needs-n" color="#12120F" />
            </div>
          }
          style={{ boxShadow: `0 0 0 2px rgba(217,164,65,0.5), ${SH.float}` }}
        />
      </div>
    </AbsoluteFill>
  );
};
