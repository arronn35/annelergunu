import React from "react";
import { Butterfly, Flower, HeartShape, Petal } from "./Svgs.jsx";

// 3D floating field of flowers, butterflies, hearts behind the splash
// + global falling petals layer

export const FloatingField = () => {
  // Pre-positioned floaters around the viewport. Each has a 3D-ish transform.
  const floaters = React.useMemo(() => [
    // Flowers (pink/rose/cream/blush)
    { kind: 'flower', hue: 'pink',  x: '8%',  y: '14%', size: 70, delay: 0,   z: -200 },
    { kind: 'flower', hue: 'rose',  x: '88%', y: '18%', size: 90, delay: 1.2, z: -100 },
    { kind: 'flower', hue: 'blush', x: '12%', y: '78%', size: 80, delay: 0.8, z: -150 },
    { kind: 'flower', hue: 'cream', x: '85%', y: '72%', size: 76, delay: 2.1, z: -180 },
    { kind: 'flower', hue: 'pink',  x: '4%',  y: '46%', size: 56, delay: 1.6, z: -250 },
    { kind: 'flower', hue: 'rose',  x: '93%', y: '46%', size: 64, delay: 0.5, z: -220 },
    { kind: 'flower', hue: 'blush', x: '22%', y: '8%',  size: 48, delay: 2.6, z: -300 },
    { kind: 'flower', hue: 'cream', x: '74%', y: '90%', size: 50, delay: 1.0, z: -280 },

    // Butterflies
    { kind: 'butterfly', color: '#F48FB1', x: '20%', y: '32%', size: 48, delay: 0.4 },
    { kind: 'butterfly', color: '#EC407A', x: '78%', y: '38%', size: 56, delay: 1.8 },
    { kind: 'butterfly', color: '#FFB6C8', x: '30%', y: '62%', size: 40, delay: 2.2 },
    { kind: 'butterfly', color: '#F48FB1', x: '70%', y: '60%', size: 44, delay: 0.9 },

    // Hearts
    { kind: 'heart', color: '#EC407A', x: '40%', y: '15%', size: 26, delay: 0.7 },
    { kind: 'heart', color: '#F48FB1', x: '60%', y: '85%', size: 30, delay: 1.5 },
    { kind: 'heart', color: '#FFB6C8', x: '15%', y: '90%', size: 22, delay: 2.0 },
    { kind: 'heart', color: '#EC407A', x: '90%', y: '8%',  size: 24, delay: 0.3 },
  ], []);

  return (
    <div className="field" aria-hidden="true">
      {floaters.map((f, i) => {
        const style = {
          left: f.x, top: f.y,
          animationDelay: `${f.delay}s, ${f.delay * 0.6}s`,
          transform: `translateZ(${f.z || 0}px)`,
        };
        if (f.kind === 'flower') return <div key={i} className="floater" style={style}><Flower size={f.size} hue={f.hue}/></div>;
        if (f.kind === 'butterfly') return <div key={i} className="floater" style={style}><Butterfly size={f.size} color={f.color}/></div>;
        if (f.kind === 'heart') return <div key={i} className="floater" style={style}><HeartShape size={f.size} color={f.color}/></div>;
        return null;
      })}
    </div>
  );
};

export const PetalsLayer = () => {
  const petals = React.useMemo(() => {
    const colors = ['#FFB6C8', '#F48FB1', '#FFD6E2', '#FFC4D6', '#FFE0EB', '#EC407A'];
    return Array.from({ length: 26 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: Math.random() * -20,
      duration: 14 + Math.random() * 12,
      drift: `${(Math.random() - 0.5) * 240}px`,
      size: 12 + Math.random() * 14,
      color: colors[i % colors.length],
      sway: 4 + Math.random() * 4,
    }));
  }, []);
  return (
    <div className="petals-layer" aria-hidden="true">
      {petals.map((p, i) => (
        <div
          key={i}
          className="petal"
          style={{
            left: p.left,
            '--drift': p.drift,
            animation: `petalFall ${p.duration}s linear ${p.delay}s infinite, petalSway ${p.sway}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          <Petal size={p.size} color={p.color}/>
        </div>
      ))}
    </div>
  );
};
