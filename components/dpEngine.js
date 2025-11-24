// dpEngine.js — versão FINAL com retorno de Q(a) e prioridade ao "Manter" quando tem sol

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

    // ======= BLOQUEIOS FORTES =======

    // Bloqueio total de descarga à noite
    if (solar <= 0 && action === "discharge") {
      return -9999999;
    }

    // Bloqueio de descarga com SOC crítico
    if (action === "discharge" && s <= 6.7) {
      return -9999999;
    }

    // ======= DESCARREGAR =======
    if (action === "discharge") {
      R += price;

      // penalidade por SOC baixo
      if (s < 30) R -= 50;
      if (s < 15) R -= 200;

      // desgaste por baixa saúde
      const gamma = (100 - batteryHealth) * 0.04;
      R -= gamma;
    }

    // ======= CARREGAR =======
    if (action === "charge") {
      R -= price;
      if (s < 30) R += 20;
      if (s < 15) R += 40;

      // ❗ NOVO: Carregar quando tem sol é ruim → compra energia à toa
      if (solar > 0) {
        R -= 200; // punição grande
      }
    }

    // ======= MANTER =======
    if (action === "idle") {
      if (solar > 0) {
        R += solar * 0.6;

        // ❗ NOVO: manter quando tem sol é muito bom → energia grátis
        R += 30;
      } else {
        R -= 5; // custo mínimo de manter sem geração
      }
    }

    // ======= TROCAR =======
    if (action === "replace") {
      R -= batteryCost;
    }

    return R;
  }

  // ================================
  // BACKWARD DP — 24 passos futuros
  // ================================
  for (let t = T - 1; t >= 0; t--) {
    for (let si = 0; si < states.length; si++) {
      const s = states[si];
      let best = -Infinity;

      for (const a of actions) {
        if (solar <= 0 && a === "discharge") continue;
        if (a === "discharge" && s <= 6.7) continue;

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

  // ================================
  // MELHOR AÇÃO NO SOC ATUAL
  // ================================
  let cur = 0;
  let dmin = Infinity;
  states.forEach((st, i) => {
    const d = Math.abs(st - battery);
    if (d < dmin) {
      dmin = d;
      cur = i;
    }
  });

  const qValues = {};
  let bestAction = null;
  let bestValue = -Infinity;

  for (const a of actions) {
    if (solar <= 0 && a === "discharge") {
      qValues[a] = -9999999;
      continue;
    }

    if (a === "discharge" && battery <= 6.7) {
      qValues[a] = -9999999;
      continue;
    }

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
    qValues[a] = Q;

    if (Q > bestValue) {
      bestValue = Q;
      bestAction = a;
    }
  }

  return {
    bestAction,
    qValues,
    table: V,
    states,
  };
}
