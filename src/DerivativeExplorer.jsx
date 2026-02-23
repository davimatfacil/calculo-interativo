import { useState, useMemo } from "react";

const FUNCTIONS = [
  {
    id: "x2", label: "f(x) = x²", latex: "x²",
    f: x => x * x, df: x => 2 * x, dfLabel: "f'(x) = 2x",
    color: "#f5c842",
    insight: "A derivada é uma reta crescente — a inclinação aumenta constantemente. Em x=0 a tangente é horizontal (mínimo!).",
    xMin: -2.5, xMax: 2.5, yMin: -0.5, yMax: 6.5, dyMin: -5.5, dyMax: 5.5,
  },
  {
    id: "x3", label: "f(x) = x³", latex: "x³",
    f: x => x * x * x, df: x => 3 * x * x, dfLabel: "f'(x) = 3x²",
    color: "#80cbc4",
    insight: "A derivada é sempre ≥ 0 — a função nunca desce de verdade. Em x=0 a inclinação é zero, mas é inflexão, não mínimo!",
    xMin: -2.2, xMax: 2.2, yMin: -9, yMax: 9, dyMin: -0.5, dyMax: 13,
  },
  {
    id: "sin", label: "f(x) = sen(x)", latex: "sen(x)",
    f: x => Math.sin(x), df: x => Math.cos(x), dfLabel: "f'(x) = cos(x)",
    color: "#ce93d8",
    insight: "A derivada do seno é o cosseno — outra onda, deslocada 90°. Onde o seno é máximo/mínimo, o cosseno cruza zero!",
    xMin: -3.5, xMax: 3.5, yMin: -1.5, yMax: 1.5, dyMin: -1.5, dyMax: 1.5,
  },
];

const W = 480, H = 220;

function toSVG(mx, my, xMin, xMax, yMin, yMax) {
  return {
    x: ((mx - xMin) / (xMax - xMin)) * W,
    y: H - ((my - yMin) / (yMax - yMin)) * H,
  };
}

function buildPath(fn, xMin, xMax, yMin, yMax, steps = 200) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    const y = fn(x);
    if (y < yMin - 5 || y > yMax + 5) { pts.push("Z"); continue; }
    const p = toSVG(x, y, xMin, xMax, yMin, yMax);
    pts.push(pts.length === 0 || pts[pts.length - 1] === "Z"
      ? `M${p.x.toFixed(1)},${p.y.toFixed(1)}`
      : `L${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return pts.filter(p => p !== "Z").join(" ");
}

function Axes({ xMin, xMax, yMin, yMax }) {
  const ox = toSVG(0, 0, xMin, xMax, yMin, yMax);
  return (
    <>
      <line x1={0} y1={ox.y} x2={W} y2={ox.y} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <line x1={ox.x} y1={0} x2={ox.x} y2={H} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      {[-3,-2,-1,1,2,3].map(v => {
        const p = toSVG(v, 0, xMin, xMax, yMin, yMax);
        if (p.x < 8 || p.x > W - 8) return null;
        return <text key={v} x={p.x} y={ox.y + 14} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle" fontFamily="serif">{v}</text>;
      })}
    </>
  );
}

const STEPS = [
  { title: "A Pergunta Nova",  icon: "🤔", color: "#ef9a9a" },
  { title: "Veja Nascer",      icon: "🌱", color: "#80cbc4" },
  { title: "Lendo a Derivada", icon: "🔎", color: "#f5c842" },
  { title: "A Física",         icon: "🚀", color: "#ce93d8" },
];

const POS_FN = t => -0.5 * (t - 3) * (t - 3) + 4.5;
const VEL_FN = t => -(t - 3);

export default function DerivativeExplorer() {
  const [activeStep, setActiveStep] = useState(0);
  const [fnIdx, setFnIdx]   = useState(0);
  const [px, setPx]         = useState(1.0);
  const [physT, setPhysT]   = useState(0);

  const fn = FUNCTIONS[fnIdx];
  const { f, df, xMin, xMax, yMin, yMax, dyMin, dyMax, color } = fn;

  const curvePath  = useMemo(() => buildPath(f,  xMin, xMax, yMin,  yMax),  [fn]);
  const derivPath  = useMemo(() => buildPath(df, xMin, xMax, dyMin, dyMax), [fn]);
  const phyPosPath = useMemo(() => buildPath(POS_FN, 0, 6, -0.5, 5.5), []);
  const phyVelPath = useMemo(() => buildPath(VEL_FN, 0, 6, -3.5, 3.5), []);

  const m  = df(px);
  const P  = toSVG(px, f(px),  xMin, xMax, yMin,  yMax);
  const dP = toSVG(px, m,      xMin, xMax, dyMin, dyMax);

  const tanPath = useMemo(() => {
    const ty1 = f(px) + m * (xMin - px);
    const ty2 = f(px) + m * (xMax - px);
    const p1 = toSVG(xMin, ty1, xMin, xMax, yMin, yMax);
    const p2 = toSVG(xMax, ty2, xMin, xMax, yMin, yMax);
    return `M${p1.x},${p1.y} L${p2.x},${p2.y}`;
  }, [px, fn]);

  const physPosP = toSVG(physT, POS_FN(physT), 0, 6, -0.5, 5.5);
  const physVelP = toSVG(physT, VEL_FN(physT), 0, 6, -3.5, 3.5);

  const s = {
    root: { minHeight:"100vh", background:"linear-gradient(160deg,#1a3a2a 0%,#0f2a1a 60%,#112214 100%)", fontFamily:"'Caveat',cursive", color:"rgba(255,255,255,0.92)", boxSizing:"border-box" },
    header: { textAlign:"center", padding:"24px 20px 10px", borderBottom:"1px solid rgba(255,255,255,0.1)" },
    stepNav: { display:"flex", justifyContent:"center", gap:"8px", padding:"14px 16px", flexWrap:"wrap" },
    stepBtn: i => ({ padding:"7px 14px", borderRadius:"20px", border:`2px solid ${activeStep===i?STEPS[i].color:"rgba(255,255,255,0.2)"}`, background:activeStep===i?`${STEPS[i].color}25`:"transparent", color:activeStep===i?STEPS[i].color:"rgba(255,255,255,0.5)", fontFamily:"'Caveat',cursive", fontSize:"0.95rem", cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap" }),
    fnBar: { display:"flex", justifyContent:"center", gap:"10px", padding:"0 16px 14px", flexWrap:"wrap" },
    fnBtn: i => ({ padding:"7px 18px", borderRadius:"20px", border:`2px solid ${fnIdx===i?FUNCTIONS[i].color:"rgba(255,255,255,0.15)"}`, background:fnIdx===i?`${FUNCTIONS[i].color}20`:"transparent", color:fnIdx===i?FUNCTIONS[i].color:"rgba(255,255,255,0.45)", fontFamily:"'Caveat',cursive", fontSize:"1rem", cursor:"pointer", transition:"all 0.2s" }),
    main: { maxWidth:"900px", margin:"0 auto", padding:"0 16px 32px", display:"flex", flexDirection:"column", gap:"18px" },
    card: { background:"rgba(255,255,255,0.05)", borderRadius:"16px", padding:"18px 22px", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(4px)" },
    svgBox: { background:"rgba(0,0,0,0.25)", borderRadius:"10px", overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)", width:"100%" },
    graphLabel: { fontSize:"0.82rem", opacity:0.55, marginBottom:4, letterSpacing:"0.05em", textTransform:"uppercase" },
    pill: c => ({ display:"inline-block", background:`${c}22`, border:`1.5px solid ${c}`, borderRadius:"30px", padding:"5px 14px", fontSize:"1rem", color:c, margin:"3px" }),
    slider: { width:"100%", cursor:"pointer", marginTop:8 },
    btn: c => ({ background:`${c}18`, border:`2px solid ${c}`, borderRadius:"10px", padding:"9px 18px", color:c, fontFamily:"'Caveat',cursive", fontSize:"1.05rem", cursor:"pointer", margin:"3px" }),
    insight: c => ({ background:`${c}12`, border:`1.5px solid ${c}50`, borderRadius:"10px", padding:"12px 16px", marginTop:"12px", fontSize:"1rem", lineHeight:1.7 }),
  };

  const FnSelector = () => (
    <div style={s.fnBar}>
      {FUNCTIONS.map((fn, i) => (
        <button key={i} style={s.fnBtn(i)} onClick={() => { setFnIdx(i); setPx(i === 2 ? 0.5 : 1); }}>
          {fn.label}
        </button>
      ))}
    </div>
  );

  const DualGraph = () => (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
      <div>
        <div style={s.graphLabel}>f(x) = {fn.latex} — tangente</div>
        <div style={s.svgBox}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block" }}>
            <Axes xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} />
            <path d={tanPath} stroke={color} strokeWidth="2" opacity="0.7" fill="none" />
            <path d={curvePath} stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx={P.x} cy={P.y} r="6" fill={color} stroke="white" strokeWidth="2" />
            <text x={10} y={18} fill={color} fontSize="12" fontFamily="'Caveat',cursive">m = {m.toFixed(3)}</text>
          </svg>
        </div>
      </div>
      <div>
        <div style={s.graphLabel}>{fn.dfLabel} — derivada</div>
        <div style={s.svgBox}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block" }}>
            <Axes xMin={xMin} xMax={xMax} yMin={dyMin} yMax={dyMax} />
            <path d={derivPath} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
            <line x1={P.x} y1={0} x2={P.x} y2={H} stroke={color} strokeWidth="1" strokeDasharray="4,3" opacity="0.3" />
            <circle cx={dP.x} cy={dP.y} r="6" fill={color} stroke="white" strokeWidth="2" />
            <text x={10} y={18} fill={color} fontSize="12" fontFamily="'Caveat',cursive">f'({px.toFixed(1)}) = {m.toFixed(3)}</text>
          </svg>
        </div>
      </div>
    </div>
  );

  const renderStep0 = () => (
    <div style={s.card}>
      <div style={{ fontSize:"1.25rem", fontWeight:700, color:"#ef9a9a", marginBottom:12 }}>🤔 A Pergunta Nova</div>
      <p style={{ lineHeight:1.7, fontSize:"1.05rem", margin:"0 0 12px" }}>
        No explorador de Limites, calculamos a inclinação exata <strong>num único ponto fixo</strong> (x = 1).
        A pergunta nova é: e se fizermos isso para <strong style={{ color:"#ef9a9a" }}>todos os pontos ao mesmo tempo</strong>?
      </p>
      <p style={{ lineHeight:1.7, fontSize:"1.05rem", margin:"0 0 16px" }}>
        A inclinação deixa de ser um número e se torna uma <strong style={{ color:"#f5c842" }}>função nova</strong> — a derivada f'(x).
        Para cada x, f'(x) responde: <em>"qual é a inclinação da curva aqui?"</em>
      </p>
      <div style={{ background:"rgba(245,200,66,0.07)", border:"1.5px solid rgba(245,200,66,0.3)", borderRadius:12, padding:"14px 18px" }}>
        <div style={{ color:"rgba(255,255,255,0.7)", marginBottom:6 }}>A definição formal (o mesmo Limite de antes, mas com x livre):</div>
        <span style={{ fontFamily:"serif", fontSize:"1.1rem", color:"#f5c842" }}>f'(x) = lim[Δx→0] (f(x + Δx) − f(x)) / Δx</span>
      </div>
      <p style={{ margin:"14px 0 0", opacity:0.7, fontSize:"0.95rem" }}>👉 Avance e escolha uma função para ver a derivada nascer em tempo real.</p>
    </div>
  );

  const renderStep1 = () => (
    <div style={s.card}>
      <div style={{ fontSize:"1.25rem", fontWeight:700, color:"#80cbc4", marginBottom:10 }}>🌱 Veja a Derivada Nascer</div>
      <p style={{ lineHeight:1.7, fontSize:"1.05rem", margin:"0 0 14px" }}>
        Mova o slider. O ponto <span style={{ color }}>●</span> percorre a curva. O gráfico da direita vai desenhando f'(x) —
        a inclinação em cada ponto. <strong style={{ color:"#80cbc4" }}>Os dois pontos estão sempre alinhados verticalmente!</strong>
      </p>
      <FnSelector />
      <DualGraph />
      <div style={{ marginTop:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          <span style={{ opacity:0.7, fontSize:"0.95rem" }}>Ponto x =</span>
          <span style={s.pill(color)}>{px.toFixed(2)}</span>
        </div>
        <input type="range" min={xMin+0.1} max={xMax-0.1} step="0.05" value={px}
          onChange={e => setPx(+e.target.value)} style={{ ...s.slider, accentColor:color }} />
      </div>
      <div style={s.insight(color)}>💡 {fn.insight}</div>
    </div>
  );

  const renderStep2 = () => (
    <div style={s.card}>
      <div style={{ fontSize:"1.25rem", fontWeight:700, color:"#f5c842", marginBottom:10 }}>🔎 Lendo a Derivada</div>
      <p style={{ lineHeight:1.7, fontSize:"1.05rem", margin:"0 0 14px" }}>
        A derivada conta a história da função em cada ponto. Mova e observe as 3 situações:
      </p>
      <FnSelector />
      <DualGraph />
      <input type="range" min={xMin+0.1} max={xMax-0.1} step="0.05" value={px}
        onChange={e => setPx(+e.target.value)} style={{ ...s.slider, accentColor:color, marginBottom:14 }} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {[
          { cond:"f'(x) > 0", label:"Função SOBE ↑", color:"#80cbc4" },
          { cond:"f'(x) = 0", label:"Máx. ou Mín. —", color:"#f5c842" },
          { cond:"f'(x) < 0", label:"Função DESCE ↓", color:"#ef9a9a" },
        ].map((item, i) => (
          <div key={i} style={{ background:`${item.color}12`, border:`1.5px solid ${item.color}40`, borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
            <div style={{ color:item.color, fontWeight:700 }}>{item.cond}</div>
            <div style={{ fontSize:"0.9rem", marginTop:4 }}>{item.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(245,200,66,0.07)", borderRadius:10, border:"1px solid rgba(245,200,66,0.2)" }}>
        Agora: inclinação = <span style={{ color, fontWeight:700 }}>{m.toFixed(3)}</span>
        {" "}→ função está <strong>{m > 0.05 ? "subindo ↑" : m < -0.05 ? "descendo ↓" : "no ponto crítico —"}</strong>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={s.card}>
      <div style={{ fontSize:"1.25rem", fontWeight:700, color:"#ce93d8", marginBottom:10 }}>🚀 A Física: Velocidade é Derivada</div>
      <p style={{ lineHeight:1.7, fontSize:"1.05rem", margin:"0 0 14px" }}>
        Um objeto lançado para cima. Posição segue uma parábola.
        A <strong style={{ color:"#ce93d8" }}>velocidade instantânea</strong> é a derivada da posição!
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {[
          { label:"Posição s(t)", path:phyPosPath, pt:physPosP, val:POS_FN(physT).toFixed(2)+" m", c:"#80cbc4", yMin:-0.5, yMax:5.5 },
          { label:"Velocidade v(t) = s'(t)", path:phyVelPath, pt:physVelP, val:VEL_FN(physT).toFixed(2)+" m/s", c:"#ce93d8", yMin:-3.5, yMax:3.5 },
        ].map((g, i) => (
          <div key={i}>
            <div style={s.graphLabel}>{g.label}</div>
            <div style={s.svgBox}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block" }}>
                <Axes xMin={0} xMax={6} yMin={g.yMin} yMax={g.yMax} />
                <path d={g.path} stroke={g.c} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <circle cx={g.pt.x} cy={g.pt.y} r="6" fill={g.c} stroke="white" strokeWidth="2" />
                <text x={10} y={18} fill={g.c} fontSize="12" fontFamily="'Caveat',cursive">{g.val}</text>
                <text x={W-32} y={H-6} fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="serif">t(s)</text>
              </svg>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          <span style={{ opacity:0.7 }}>Tempo t =</span>
          <span style={s.pill("#ce93d8")}>{physT.toFixed(1)} s</span>
        </div>
        <input type="range" min="0" max="6" step="0.05" value={physT}
          onChange={e => setPhysT(+e.target.value)} style={{ ...s.slider, accentColor:"#ce93d8" }} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginTop:14 }}>
        {[
          { t:"0–3s", label:"Subindo", desc:"v > 0", color:"#80cbc4" },
          { t:"t = 3s", label:"Pico!", desc:"v = 0, inversão", color:"#f5c842" },
          { t:"3–6s", label:"Caindo", desc:"v < 0", color:"#ef9a9a" },
        ].map((item, i) => (
          <div key={i} style={{ background:`${item.color}12`, border:`1.5px solid ${item.color}40`, borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
            <div style={{ color:item.color, fontWeight:700 }}>{item.t}</div>
            <div style={{ fontSize:"0.9rem", marginTop:4 }}>{item.label}</div>
            <div style={{ fontSize:"0.8rem", opacity:0.6, marginTop:2 }}>{item.desc}</div>
          </div>
        ))}
      </div>
      <div style={s.insight("#ce93d8")}>
        <strong style={{ color:"#ce93d8" }}>🔑 A grande conexão:</strong> Newton precisava da derivada exatamente para isso —
        calcular velocidade e aceleração a partir da posição. Derivada não é só geometria: é o vocabulário da física!
      </div>
    </div>
  );

  const steps = [renderStep0, renderStep1, renderStep2, renderStep3];

  return (
    <div style={s.root}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap'); *{box-sizing:border-box;}`}</style>
      <div style={s.header}>
        <div style={{ fontSize:"0.82rem", opacity:0.5, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>
          Prof. Davi Rocha · Cálculo Intuitivo
        </div>
        <h1 style={{ fontSize:"clamp(1.5rem,4vw,2.3rem)", fontWeight:700, margin:0, lineHeight:1.2, textShadow:"0 2px 12px rgba(0,0,0,0.4)" }}>
          📐 Explorando a <span style={{ color:"#f5c842" }}>Derivada</span>
        </h1>
        <p style={{ fontSize:"clamp(0.85rem,2.5vw,1.05rem)", opacity:0.65, marginTop:6 }}>
          Da inclinação num ponto à função derivada completa
        </p>
      </div>

      <div style={s.stepNav}>
        {STEPS.map((st, i) => (
          <button key={i} style={s.stepBtn(i)} onClick={() => setActiveStep(i)}>
            {st.icon} {i+1}. {st.title}
          </button>
        ))}
      </div>

      <div style={s.main}>
        {steps[activeStep]()}
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          {activeStep > 0 && (
            <button style={s.btn("rgba(255,255,255,0.45)")} onClick={() => setActiveStep(a => a-1)}>← Anterior</button>
          )}
          {activeStep < STEPS.length-1 && (
            <button style={s.btn(STEPS[activeStep+1].color)} onClick={() => setActiveStep(a => a+1)}>
              Próximo: {STEPS[activeStep+1].title} →
            </button>
          )}
          {activeStep === STEPS.length-1 && (
            <button style={s.btn("#f5c842")} onClick={() => setActiveStep(0)}>🔄 Recomeçar</button>
          )}
        </div>
        <div style={{ textAlign:"center", opacity:0.35, fontSize:"0.82rem", paddingTop:6 }}>
          Cálculo: Intuição, História e Rigor
        </div>
      </div>
    </div>
  );
}
