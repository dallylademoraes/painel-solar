// dpEngine.js — versão corrigida com bloqueio REAL de descarga em SOC baixo

export function runDynamicProgramming({
  price,
  solar,
  battery,
  batteryHealth,
  batteryCost,
}) {
  const states = Array.from({ length: 16 }, (_, i) => (i / 15) * 100);
  const T = 24;
  const actions = ["charge", "discharge", "idle", "replace"];
  const V = Array.from({ length: T + 1 }, () => Array(states.length).fill(0));

  function nextState(s, action) {
    if (action === "charge") return Math.min(100, s + 6.7);
    if (action === "discharge") return Math.max(0, s - 6.7);
    if (action === "replace") return 100;
    return s;
  }

  function reward(s, action) {
    let R = 0;

    // ❗ IMPEDIR DESCARGA QUANDO SOC É MUITO BAIXO
    if (action === "discharge") {
      if (s <= 6.7) return -999999; // BANIR descarregar em SOC baixo

      R += price;
      if (s < 30) R -= 50;
      if (s < 15) R -= 200;

      const gamma = (100 - batteryHealth) * 0.04;
      R -= gamma;
    }

    if (action === "charge") {
      R -= price;
      if (s < 30) R += 20;
      if (s < 15) R += 40;
    }

    if (action === "idle") R += solar * 0.6;

    if (action === "replace") R -= batteryCost;

    return R;
  }

  for (let t = T - 1; t >= 0; t--) {
    for (let si = 0; si < states.length; si++) {
      const s = states[si];
      let best = -Infinity;

      for (const a of actions) {
        const ns = nextState(s, a);

        let closest = 0;
        let dist = Infinity;
        states.forEach((st, i) => {
          const d = Math.abs(st - ns);
          if (d < dist) {
            dist = d;
            closest = i;
          }
        });

        const q = reward(s, a) + V[t + 1][closest];
        if (q > best) best = q;
      }

      V[t][si] = best;
    }
  }

  // escolhe a melhor ação
  let cur = 0;
  let dmin = Infinity;
  states.forEach((st, i) => {
    const d = Math.abs(st - battery);
    if (d < dmin) {
      dmin = d;
      cur = i;
    }
  });

  let bestAction = null;
  let bestValue = -Infinity;

  for (const a of actions) {
    // ❗ IMPEDIR DISCHARGE SE A BATERIA DO PAINEL FOR <= 6.7%
    if (a === "discharge" && battery <= 6.7) continue;

    const ns = nextState(battery, a);

    let closest = 0;
    let dist = Infinity;
    states.forEach((st, i) => {
      const d = Math.abs(st - ns);
      if (d < dist) {
        dist = d;
        closest = i;
      }
    });

    const Q = reward(battery, a) + V[1][closest];

    if (Q > bestValue) {
      bestValue = Q;
      bestAction = a;
    }
  }

  return { bestAction, table: V, states };
}
