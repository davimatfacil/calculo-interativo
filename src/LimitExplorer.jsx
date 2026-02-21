import { useState, useMemo } from "react";

const f = x => x * x;
const X0 = 1;
const EXACT_SLOPE = 2;

const W = 500, H = 340;
const xMin = -0.2, xMax = 2.8, yMin = -0.2, yMax = 4.5;

function toSVG(mx, my) {
  return {
    x: ((mx - xMin) / (xMax - xMin)) * W,
    y: H - ((my - yMin) / (yMax - yMin)) * H,
  };
}

function Katex({ math, block = false }) {
  return (
    <span style={{
      fontFamily: "'STIX Two Math', 'Cambria Math', serif",
      fontSize: block ? "1.15em" : "1em",
      color: "#f5c842",
      letterSpacing: "0.01em",
    }}>
      {math}
    </span>
  );
}

const STEPS = [
  { title: "O Problema",      icon: "⚠️", color: "#ef9a9a" },
  { title: "A Aproximação",   icon: "🎯", color: "#80cbc4" },
  { title: "A Grande Sacada", icon: "💡", color: "#f5c842" },
  { title: "A Revelação",     icon: "✨", color: "#ce93d8" },
];

export default function LimitExplorer() {
  const [deltaX, setDeltaX] = useState(1.4);
  const [activeStep, setActiveStep] = useState(0);

  const slope = useMemo(() => {
    if (Math.abs(deltaX) < 0.001) return null;
    return (f(X0 + deltaX) - f(X0)) / deltaX;
  }, [deltaX]);

  const P = toSVG(X0, f(X0));
  const Q = toSVG(X0 + deltaX, f(X0 + deltaX));

  const secantLine = useMemo(() => {
    if (slope === null) return null;
    const x1 = xMin, x2 = xMax;
    const y1 = f(X0) + slope * (x1 - X0);
    const y2 = f(X0) + slope * (x2 - X0);
    return { p1: toSVG(x1, y1), p2: toSVG(x2, y2) };
  }, [slope]);

  const tangentLine = useMemo(() => {
    const m = EXACT_SLOPE;
    const x1 = xMin, x2 = xMax;
    const y1 = f(X0) + m * (x1 - X0);
    const y2 = f(X0) + m * (x2 - X0);
    return { p1: toSVG(x1, y1), p2: toSVG(x2, y2) };
  }, []);

  const curvePath = useMemo(() => {
    const pts = [];
    for (let x = xMin; x <= xMax + 0.01; x += 0.04) {
      const p = toSVG(x, f(x));
      pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    }
    return "M " + pts.join(" L ");
  }, []);

  const axisX  = toSVG(xMin, 0);
  const axisX2 = toSVG(xMax, 0);
  const axisY  = toSVG(0, yMin);
  const axisY2 = toSVG(0, yMax);

  const isClose     = Math.abs(deltaX) < 0.15;
  const isVeryClose = Math.abs(deltaX) < 0.04;
  const slopeDisplay = slope !== null ? slope.toFixed(4) : "???";
  const errorPct     = slope !== null ? Math.abs(slope - EXACT_SLOPE) : null;

  const tableRows = [2.0, 1.0, 0.5, 0.1, 0.01, 0.001].map(dx => ({
    dx,
    slope: ((f(X0 + dx) - f(X0)) / dx).toFixed(6),
  }));

  const s = {
    root: {
      minHeight: "100vh",
      background: "linear-gradient(160deg, #1a3a2a 0%, #0f2a1a 60%, #112214 100%)",
      fontFamily: "'Caveat', cursive",
      color: "rgba(255,255,255,0.92)",
      boxSizing: "border-box",
    },
    header: {
      textAlign: "center",
      padding: "28px 20px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
    },
    stepNav: {
      display: "flex", justifyContent: "center",
      gap: "8px", padding: "16px 20px", flexWrap: "wrap",
    },
    stepBtn: (i) => ({
      padding: "8px 16px", borderRadius: "20px",
      border: `2px solid ${activeStep === i ? STEPS[i].color : "rgba(255,255,255,0.2)"}`,
      background: activeStep === i ? `${STEPS[i].color}25` : "transparent",
      color: activeStep === i ? STEPS[i].color : "rgba(255,255,255,0.55)",
      fontFamily: "'Caveat', cursive", fontSize: "1rem",
      cursor: "pointer", transition: "all 0.25s", whiteSpace: "nowrap",
    }),
    main: {
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "0 16px 32px", gap: "20px",
      maxWidth: "900px", margin: "0 auto",
    },
    card: {
      background: "rgba(255,255,255,0.05)", borderRadius: "16px",
      padding: "20px 24px", width: "100%", boxSizing: "border-box",
      border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(4px)",
    },
    cardTitle: {
      fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px",
      display: "flex", alignItems: "center", gap: "8px",
    },
    svgWrap: {
      background: "rgba(0,0,0,0.25)", borderRadius: "12px",
      overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", width: "100%",
    },
    sliderRow: {
      display: "flex", alignItems: "center",
      gap: "12px", flexWrap: "wrap", marginTop: "16px",
    },
    slider: { flex: 1, minWidth: "140px", accentColor: "#80cbc4", cursor: "pointer" },
    pill: (color) => ({
      background: `${color}22`, border: `1.5px solid ${color}`,
      borderRadius: "30px", padding: "6px 16px",
      fontSize: "1.05rem", color, fontFamily: "'Caveat', cursive", whiteSpace: "nowrap",
    }),
    formulaBox: {
      background: "rgba(245,200,66,0.07)",
      border: "1.5px solid rgba(245,200,66,0.3)",
      borderRadius: "12px", padding: "14px 18px",
      marginTop: "12px", fontSize: "1.1rem", lineHeight: 1.8,
    },
    btn: (color) => ({
      background: `${color}18`, border: `2px solid ${color}`,
      borderRadius: "10px", padding: "10px 20px",
      color, fontFamily: "'Caveat', cursive", fontSize: "1.1rem",
      cursor: "pointer", transition: "all 0.2s", margin: "4px",
    }),
    table: { width: "100%", borderCollapse: "collapse", fontFamily: "'Courier New', monospace", fontSize: "0.95rem" },
  };

  const renderVisualization = () => (
    <div style={s.svgWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <defs>
          <marker id="ah" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.4)" />
          </marker>
        </defs>
        {[0.5,1,1.5,2,2.5].map(x => { const p=toSVG(x,0); return <line key={x} x1={p.x} y1={0} x2={p.x} y2={H} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>; })}
        {[1,2,3,4].map(y => { const p=toSVG(0,y); return <line key={y} x1={0} y1={p.y} x2={W} y2={p.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>; })}
        <line x1={axisX.x} y1={axisX.y} x2={axisX2.x} y2={axisX2.y} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" markerEnd="url(#ah)"/>
        <line x1={axisY.x} y1={axisY.y} x2={axisX2.x===axisY.x?axisY2.x:axisY.x} y1={axisY.y} x2={axisY2.x} y2={axisY2.y} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" markerEnd="url(#ah)"/>
        <text x={axisX2.x-12} y={axisX.y+16} fill="rgba(255,255,255,0.5)" fontSize="13" fontFamily="serif">x</text>
        <text x={axisY2.x+6} y={axisY2.y+6} fill="rgba(255,255,255,0.5)" fontSize="13" fontFamily="serif">y</text>
        {[1,2].map(v => { const p=toSVG(v,0); return <text key={v} x={p.x-4} y={p.y+16} fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="serif">{v}</text>; })}
        {[1,2,3].map(v => { const p=toSVG(0,v); return <text key={v} x={p.x-16} y={p.y+4} fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="serif">{v}</text>; })}
        {(isVeryClose || activeStep === 3) && (
          <line x1={tangentLine.p1.x} y1={tangentLine.p1.y} x2={tangentLine.p2.x} y2={tangentLine.p2.y}
            stroke="#f5c842" strokeWidth="2.5" opacity="0.9"/>
        )}
        {secantLine && !isVeryClose && (
          <line x1={secantLine.p1.x} y1={secantLine.p1.y} x2={secantLine.p2.x} y2={secantLine.p2.y}
            stroke="#64b5f6" strokeWidth="2" opacity="0.85"/>
        )}
        {!isVeryClose && slope !== null && (
          <>
            <line x1={P.x} y1={P.y} x2={Q.x} y2={P.y} stroke="#80cbc4" strokeWidth="1.5" strokeDasharray="4,3"/>
            <line x1={Q.x} y1={P.y} x2={Q.x} y2={Q.y} stroke="#ef9a9a" strokeWidth="1.5" strokeDasharray="4,3"/>
            <text x={(P.x+Q.x)/2} y={P.y+16} fill="#80cbc4" fontSize="12" textAnchor="middle" fontFamily="serif">Δx</text>
            <text x={Q.x+8} y={(P.y+Q.y)/2} fill="#ef9a9a" fontSize="12" fontFamily="serif">Δy</text>
          </>
        )}
        <path d={curvePath} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round"/>
        <text x={toSVG(2.1,f(2.1)+0.1).x} y={toSVG(2.1,f(2.1)+0.1).y} fill="rgba(255,255,255,0.7)" fontSize="13" fontFamily="serif" fontStyle="italic">x²</text>
        {!isVeryClose && (
          <>
            <circle cx={Q.x} cy={Q.y} r="5" fill="#64b5f6" stroke="white" strokeWidth="1.5"/>
            <text x={Q.x+8} y={Q.y-6} fill="#64b5f6" fontSize="12" fontFamily="serif">Q</text>
          </>
        )}
        <circle cx={P.x} cy={P.y} r="6" fill="#f5c842" stroke="white" strokeWidth="2"/>
        <text x={P.x-18} y={P.y-8} fill="#f5c842" fontSize="13" fontFamily="serif" fontWeight="bold">P</text>
        {isVeryClose && <text x={tangentLine.p2.x-90} y={tangentLine.p2.y-10} fill="#f5c842" fontSize="13" fontFamily="'Caveat',cursive">← Tangente!</text>}
      </svg>
    </div>
  );

  const renderStep0 = () => (
    <div style={s.card}>
      <div style={{...s.cardTitle, color:"#ef9a9a"}}>⚠️ O Problema: Velocidade num Instante</div>
      <p style={{margin:"0 0 12px", lineHeight:1.7, fontSize:"1.05rem"}}>
        Imagine a função <Katex math="f(x) = x²"/> representando a posição de um carro.
        Qual é a <strong style={{color:"#ef9a9a"}}>inclinação exata</strong> da curva no ponto <Katex math="x = 1"/>?
      </p>
      <p style={{margin:"0 0 12px", lineHeight:1.7, fontSize:"1.05rem"}}>Para calcular a inclinação, precisamos de dois pontos:</p>
      <div style={s.formulaBox}><Katex math="inclinação = Δy / Δx = (f(x + Δx) − f(x)) / Δx" block/></div>
      <div style={{background:"rgba(239,154,154,0.1)", border:"2px solid #ef9a9a", borderRadius:"12px", padding:"16px 20px", textAlign:"center", marginTop:16}}>
        <p style={{margin:0, color:"#ef9a9a", fontSize:"1.05rem"}}>
          <strong>O problema:</strong> Num único instante, <Katex math="Δx = 0"/>. Mas dividir por zero é proibido!
        </p>
        <div style={{fontSize:"1.4rem", marginTop:8}}>
          <Katex math="(f(1+0) − f(1)) / 0"/> = <strong style={{color:"#ef9a9a"}}>0/0 = ???</strong>
        </div>
      </div>
      <p style={{margin:"16px 0 0", opacity:0.7, fontSize:"0.95rem"}}>👉 Avance para ver como Newton e Leibniz contornaram esse "abismo".</p>
    </div>
  );

  const renderStep1 = () => (
    <div style={s.card}>
      <div style={{...s.cardTitle, color:"#80cbc4"}}>🎯 A Reta Secante: Dois Pontos</div>
      <p style={{margin:"0 0 14px", lineHeight:1.7, fontSize:"1.05rem"}}>
        A ideia genial: começar com <strong style={{color:"#64b5f6"}}>dois pontos</strong> —{" "}
        <Katex math="P"/> fixo em <Katex math="x=1"/> e <Katex math="Q"/> em <Katex math="x = 1 + Δx"/>. Mova o slider!
      </p>
      {renderVisualization()}
      <div style={s.sliderRow}>
        <span style={{opacity:0.7, fontSize:"0.95rem", whiteSpace:"nowrap"}}><Katex math="Δx ="/></span>
        <input type="range" min="0.05" max="1.6" step="0.01" value={deltaX}
          onChange={e => setDeltaX(+e.target.value)} style={s.slider}/>
        <span style={s.pill("#80cbc4")}>{deltaX.toFixed(2)}</span>
      </div>
      <div style={{display:"flex", gap:"12px", marginTop:"14px", flexWrap:"wrap"}}>
        <div style={s.pill("#64b5f6")}>Inclinação secante = <strong>{slopeDisplay}</strong></div>
        {errorPct !== null && (
          <div style={s.pill(isClose ? "#80cbc4" : "rgba(255,255,255,0.4)")}>
            {isClose ? "✓ Quase lá!" : `erro: ${errorPct.toFixed(4)}`}
          </div>
        )}
      </div>
      <p style={{margin:"14px 0 0", opacity:0.75, fontSize:"0.95rem"}}>
        À medida que <Katex math="Q"/> se aproxima de <Katex math="P"/>, a reta <span style={{color:"#64b5f6"}}>azul</span> gira em direção a algo fixo. Para onde ela aponta?
      </p>
    </div>
  );

  const renderStep2 = () => (
    <div style={s.card}>
      <div style={{...s.cardTitle, color:"#f5c842"}}>💡 A Grande Sacada: O Limite</div>
      <p style={{margin:"0 0 14px", lineHeight:1.7, fontSize:"1.05rem"}}>
        Em vez de <em>colocar</em> <Katex math="Δx = 0"/> (proibido!), perguntamos:{" "}
        <strong style={{color:"#f5c842"}}>para onde a inclinação está indo</strong> conforme <Katex math="Δx → 0"/>?
      </p>
      <div style={{overflowX:"auto"}}>
        <table style={s.table}>
          <thead>
            <tr style={{borderBottom:"1px solid rgba(255,255,255,0.15)"}}>
              <th style={{padding:"8px 12px", textAlign:"left", color:"#80cbc4", fontFamily:"'Caveat',cursive", fontSize:"1rem"}}>Δx</th>
              <th style={{padding:"8px 12px", textAlign:"left", color:"#64b5f6", fontFamily:"'Caveat',cursive", fontSize:"1rem"}}>Inclinação secante</th>
              <th style={{padding:"8px 12px", textAlign:"left", color:"#f5c842", fontFamily:"'Caveat',cursive", fontSize:"1rem"}}>Tendendo a...</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row,i) => (
              <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.06)", background: i>=tableRows.length-2 ? "rgba(245,200,66,0.07)":"transparent"}}>
                <td style={{padding:"7px 12px", color:"#80cbc4"}}>{row.dx}</td>
                <td style={{padding:"7px 12px", color:"#64b5f6"}}>{row.slope}</td>
                <td style={{padding:"7px 12px", color:"#f5c842", fontWeight: i>=tableRows.length-2?"bold":"normal"}}>{i>=tableRows.length-2?"≈ 2 ✓":"→ 2"}</td>
              </tr>
            ))}
            <tr style={{borderTop:"2px solid rgba(245,200,66,0.4)", background:"rgba(245,200,66,0.1)"}}>
              <td style={{padding:"8px 12px", color:"#ef9a9a", fontStyle:"italic"}}>0</td>
              <td style={{padding:"8px 12px", color:"#ef9a9a"}}>0/0 = ???</td>
              <td style={{padding:"8px 12px", color:"#f5c842", fontWeight:"bold"}}>O Limite = 2 ✓</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={s.formulaBox}>
        <div style={{marginBottom:6, color:"rgba(255,255,255,0.8)"}}>Definição do Limite (e da Derivada):</div>
        <Katex math="f '(1) = lim[Δx→0] (f(1+Δx) − f(1)) / Δx = 2" block/>
      </div>
      <div style={{marginTop:16, padding:"12px 16px", background:"rgba(128,203,196,0.08)", borderRadius:"10px", border:"1px solid rgba(128,203,196,0.25)"}}>
        <strong style={{color:"#80cbc4"}}>💬 A frase-chave:</strong>
        <p style={{margin:"6px 0 0", fontStyle:"italic", lineHeight:1.6}}>
          "O Limite não pergunta o que acontece <em>no</em> zero. Ele pergunta o que acontece <em>perto</em> do zero."
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={s.card}>
      <div style={{...s.cardTitle, color:"#ce93d8"}}>✨ A Revelação: A Reta Tangente</div>
      <p style={{margin:"0 0 14px", lineHeight:1.7, fontSize:"1.05rem"}}>
        Quando <Katex math="Δx → 0"/>, a secante <span style={{color:"#64b5f6"}}>azul</span> se transforma na tangente{" "}
        <span style={{color:"#f5c842"}}>amarela</span> — a inclinação exata da curva em <Katex math="P"/>.
      </p>
      {renderVisualization()}
      <div style={s.formulaBox}>
        <div>A <strong style={{color:"#ce93d8"}}>Derivada</strong> de <Katex math="f(x) = x²"/> em <Katex math="x = 1"/> é:</div>
        <div style={{marginTop:8, fontSize:"1.2rem"}}><Katex math="f '(1) = 2" block/></div>
        <div style={{marginTop:8, opacity:0.8}}>
          Isso significa: a curva sobe com inclinação 2 naquele ponto.<br/>
          Se <Katex math="x"/> avança 1, <Katex math="y"/> avança 2.
        </div>
      </div>
      <div style={{marginTop:16, display:"flex", gap:"10px", flexWrap:"wrap"}}>
        <div style={s.pill("#64b5f6")}>Secante = aproximação</div>
        <div style={s.pill("#f5c842")}>Tangente = limite exato</div>
        <div style={s.pill("#ce93d8")}>Derivada = inclinação da tangente</div>
      </div>
      <div style={{marginTop:20, padding:"14px 18px", background:"rgba(206,147,216,0.07)", borderRadius:"12px", border:"1px solid rgba(206,147,216,0.3)"}}>
        <strong style={{color:"#ce93d8", fontSize:"1.1rem"}}>🔑 Resumo:</strong>
        <ol style={{margin:"10px 0 0", paddingLeft:"20px", lineHeight:2, fontSize:"1.05rem"}}>
          <li>Dividir por <Katex math="Δx = 0"/> é proibido — forma <Katex math="0/0"/></li>
          <li>Mas podemos ver para onde a expressão <strong>tende</strong> quando <Katex math="Δx → 0"/></li>
          <li>Esse valor de chegada é o <strong style={{color:"#f5c842"}}>Limite</strong></li>
          <li>A Derivada é o Limite do coeficiente angular da secante</li>
        </ol>
      </div>
    </div>
  );

  const stepContent = [renderStep0, renderStep1, renderStep2, renderStep3];

  return (
    <div style={s.root}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap'); * { box-sizing:border-box; }`}</style>
      <div style={s.header}>
        <div style={{fontSize:"0.85rem", opacity:0.5, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6}}>
          Prof. Davi Rocha · Cálculo Intuitivo
        </div>
        <h1 style={{fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:"700", margin:0, lineHeight:1.2, textShadow:"0 2px 12px rgba(0,0,0,0.4)"}}>
          🔍 Explorando o Conceito de <span style={{color:"#f5c842"}}>Limite</span>
        </h1>
        <p style={{fontSize:"clamp(0.9rem,2.5vw,1.1rem)", opacity:0.7, marginTop:6}}>
          f(x) = x² &nbsp;·&nbsp; Ponto fixo P em x = 1 &nbsp;·&nbsp; Derivada exata = 2
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
        {stepContent[activeStep]()}
        <div style={{display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap"}}>
          {activeStep > 0 && (
            <button style={s.btn("rgba(255,255,255,0.5)")} onClick={() => setActiveStep(a => a-1)}>← Anterior</button>
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
        <div style={{textAlign:"center", opacity:0.4, fontSize:"0.85rem", paddingTop:8}}>
          Cálculo: Intuição, História e Rigor
        </div>
      </div>
    </div>
  );
}
