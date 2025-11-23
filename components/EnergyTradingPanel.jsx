"use client";

import { useState, useEffect } from "react";
import { Battery, Sun, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { runDynamicProgramming } from "./dpEngine";

// ================================
// ESTILOS PARA ANIMAÇÕES
// ================================
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes shineMove {
      0%   { transform: translateX(-100%); opacity: 0; }
      50%  { opacity: 0.8; }
      100% { transform: translateX(100%); opacity: 0; }
    }
    .shine {
      position: absolute;
      top: 0; bottom: 0;
      width: 30%;
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0) 0%,
        rgba(255,255,255,0.6) 50%,
        rgba(255,255,255,0) 100%
      );
      animation: shineMove 1.6s linear infinite;
      border-radius: 9999px;
    }
  `;
  document.head.appendChild(style);
}

// ===================================
// BADGE DAS AÇÕES
// ===================================
function ActionBadge({ action }) {
  const map = {
    charge: { label: "Carregar", color: "bg-blue-600 text-white" },
    discharge: { label: "Descarregar", color: "bg-orange-500 text-white" },
    idle: { label: "Manter", color: "bg-gray-500 text-white" },
    replace: { label: "Trocar Bateria", color: "bg-yellow-500 text-white" },
  };

  const item = map[action] || { label: action, color: "bg-gray-700 text-white" };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.color}`}>
      {item.label}
    </span>
  );
}

export default function EnergyTradingPanel() {

  // ==============================
  // ESTADOS PRINCIPAIS
  // ==============================
  const [battery, setBattery] = useState(72);
  const [batteryHealth, setBatteryHealth] = useState(98.0);

  const [solar, setSolar] = useState(3.2);
  const [isSunny, setIsSunny] = useState(true); // controle manual do sol

  const [price, setPrice] = useState(330);
  const [batteryCost, setBatteryCost] = useState(5000);
  const [profit, setProfit] = useState(0);
  const [history, setHistory] = useState([]);

  const [bestAction, setBestAction] = useState(null);
  const [dpTable, setDpTable] = useState(null);
  const [dpStates, setDpStates] = useState(null);

  const hour = new Date().getHours();

  // ==============================
  // TARIFA
  // ==============================
  const tariff =
    hour < 6
      ? { level: "Madrugada", cost: 0.15 }
      : hour < 18
      ? { level: "Dia", cost: 0.27 }
      : { level: "Pico", cost: 0.55 };

  const solarForecast = isSunny ? (solar * 1.4).toFixed(1) : "0.0";

  const systemState =
    battery < 10 && solar <= 0
      ? "Emergência"
      : battery < 25
      ? "Risco"
      : price > 350 && battery > 60
      ? "Oportunidade Alta"
      : "Estável";

  function pushHistory(action, delta) {
    setHistory((prev) => [
      { time: new Date().toLocaleTimeString(), action, delta },
      ...prev,
    ]);
  }

  // ==============================
  // ATUALIZAÇÃO DA DP
  // ==============================
  useEffect(() => {
    const dp = runDynamicProgramming({
      price,
      solar,
      battery,
      batteryHealth,
      batteryCost,
    });

    setBestAction(dp.bestAction);
    setDpTable(dp.table);
    setDpStates(dp.states);

  }, [price, solar, battery, batteryHealth, batteryCost]);

  // ==============================
  // AÇÕES DO PAINEL
  // ==============================
  function handleCharge() {
    setBattery((b) => Math.min(100, b + 6.7));
    setProfit((p) => p - price);
    pushHistory("Carregar", -price);
  }

  function handleDischarge() {
    if (battery <= 0) return;

    setBattery((b) => Math.max(0, b - 6.7));
    setProfit((p) => p + price);
    pushHistory("Descarregar", price);
  }

  function handleIdle() {
    if (isSunny) {
      const gained = solar * 1.2;
      setBattery((b) => Math.min(100, b + gained));
      setProfit((p) => p + gained * 0.1);
      pushHistory("Manter", gained);
    } else {
      pushHistory("Manter", 0);
    }

    setBatteryHealth((h) => Math.max(50, h - 0.003));
  }

  function handleReplace() {
    setBattery(100);
    setBatteryHealth(100);
    setProfit((p) => p - batteryCost);
    pushHistory("Trocar Bateria", -batteryCost);
  }

  // ==============================
  // INTERFACE
  // ==============================
  return (
    <div className="min-h-screen bg-[#0A2342] p-6 text-white grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* CONTROLE DO SOL */}
      <div className="col-span-2 flex justify-center mb-2">
        <button
          onClick={() => {
            setIsSunny((prev) => !prev);
            setSolar((prev) => (isSunny ? 0 : 3.2));
          }}
          className={`px-4 py-2 rounded cursor-pointer font-semibold shadow-md transition 
            ${isSunny ? "bg-yellow-500 text-black" : "bg-gray-600 text-white"}
          `}
        >
          {isSunny ? "☀️ Sol Ativo" : "🌙 Sem Sol"}
        </button>
      </div>

      {/* Ícone do sol — versão compacta */}
      <div className="col-span-2 flex justify-center -mt-1 mb-1">
        {isSunny ? (
          <Sun
            size={26}
            className="text-yellow-300 opacity-90 drop-shadow-md transition-all duration-300"
          />
        ) : (
          <Sun
            size={26}
            className="text-gray-400 opacity-40 transition-all duration-300"
          />
        )}
      </div>

      {/* PAINEL PRINCIPAL */}
      <Card className="bg-[#0d2e5a] border-none shadow-xl">
        <CardContent className="p-6 space-y-6">

          <h1 className="text-2xl font-semibold text-[#F7B500]">
            Painel Solar — Operação
          </h1>

          {/* INFO */}
          <div className="grid grid-cols-2 gap-4 text-base">
            <div>
              <p className="text-white text-sm">Lucro</p>
              <p className="text-2xl font-bold text-white">R$ {profit.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-white text-sm">Tarifa</p>
              <p className="text-xl text-[#F7B500]">
                {tariff.level} — R$ {tariff.cost}
              </p>
            </div>

            <div>
              <p className="text-white text-sm">Bateria</p>
              <p className="text-2xl text-[#F7B500]">{battery.toFixed(0)}%</p>
            </div>

            <div>
              <p className="text-white text-sm">Saúde</p>
              <p className="text-xl text-white">{batteryHealth.toFixed(1)}%</p>
            </div>

            <div>
              <p className="text-white text-sm">Solar</p>
              <p className="text-xl text-[#F7B500]">{solar} kW</p>
              <p className="text-xs text-gray-300">Previsão: {solarForecast} kW</p>
            </div>

            <div>
              <p className="text-white text-sm">Estado</p>
              <p className="text-xl text-white">{systemState}</p>
            </div>
          </div>

          {/* BARRA DA BATERIA */}
          <div className="relative h-3 bg-[#123b72] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3e92cc] rounded-full transition-all"
              style={{ width: `${battery}%` }}
            />
            {isSunny && <div className="shine" />}
          </div>

          {/* BOTÕES */}
          <div className="grid grid-cols-4 gap-3 text-sm">
            <button onClick={handleCharge} className="p-2 bg-blue-600 rounded text-white cursor-pointer">Carregar</button>
            <button onClick={handleDischarge} className="p-2 bg-orange-500 rounded text-white cursor-pointer">Descarregar</button>
            <button onClick={handleIdle} className="p-2 bg-gray-500 rounded text-white cursor-pointer">Manter</button>
            <button onClick={handleReplace} className="p-2 bg-yellow-500 rounded text-white cursor-pointer">Trocar</button>
          </div>

        </CardContent>
      </Card>

      {/* DIREITA */}

      <div className="flex flex-col gap-6">

        {/* DP */}
        <Card className="bg-[#0d2e5a] border-none shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-[#F7B500] mb-4">
              Programação Dinâmica
            </h2>

            {bestAction && (
              <div className="flex items-center gap-2 mb-4">
                <p className="text-white text-md">Melhor ação:</p>
                <ActionBadge action={bestAction} />
              </div>
            )}

            {/* TABELA Q */}
            <h3 className="text-sm text-[#F7B500] font-semibold mb-2">
              Valores Q(a)
            </h3>

            <table className="w-full text-xs border-collapse text-white">
              <thead>
                <tr className="border-b border-[#1c3e74] text-[#F7B500]">
                  <th className="text-left py-1">Ação</th>
                  <th className="text-right py-1">Q(a)</th>
                </tr>
              </thead>

              <tbody>
                {["charge", "discharge", "idle", "replace"].map((a) => {
                  if (!dpTable || !dpStates) return null;

                  const s = battery;
                  const ns =
                    a === "charge" ? s + 6.7 :
                    a === "discharge" ? s - 6.7 :
                    a === "replace" ? 100 :
                    s;

                  const next = Math.min(100, Math.max(0, ns));

                  let idx = 0;
                  let md = Infinity;
                  dpStates.forEach((st, i) => {
                    const d = Math.abs(st - next);
                    if (d < md) {
                      md = d;
                      idx = i;
                    }
                  });

                  const Q = dpTable[0][idx];

                  return (
                    <tr key={a}
                      className={`border-b border-[#1c3e74] ${
                        bestAction === a ? "bg-green-900/40" : ""
                      }`}
                    >
                      <td className="py-1"><ActionBadge action={a} /></td>
                      <td className="py-1 text-right text-[#F7B500] font-semibold">{Q.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>

            </table>

          </CardContent>
        </Card>

        {/* HISTÓRICO */}
        <Card className="bg-[#0d2e5a] border-none shadow-xl h-[260px] overflow-y-auto">
          <CardContent className="p-6">
            <h2 className="text-lg text-[#F7B500] mb-3">Histórico</h2>

            {history.map((h, i) => (
              <div key={i}
                className="flex justify-between text-sm border-b border-[#1c3e74] py-1 text-white"
              >
                <span>{h.time}</span>
                <span>{h.action}</span>
                <span className={h.delta >= 0 ? "text-green-400" : "text-red-400"}>
                  {h.delta >= 0 ? "+" : ""}
                  {h.delta.toFixed(2)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
