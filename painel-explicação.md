# 🚀 Painel de Simulação com Bateria, Solar e Programação Dinâmica

Este projeto simula o comportamento de um sistema de energia composto por:

- Painéis solares  
- Bateria  
- Custos de mercado  
- Ações manuais  
- Um agente inteligente que usa **Programação Dinâmica (DP)**  

A interface mostra o estado atual, histórico de operações e a melhor ação sugerida pela DP.

---

## 🟦 COMO O PAINEL FUNCIONA AO INICIAR

O painel inicializa as variáveis:

| Variável | Valor inicial | Significado |
|---------|---------------|-------------|
| battery = 72% | carga inicial da bateria |
| batteryHealth = 98% | saúde da bateria |
| solar = 3.2 kW | geração solar |
| price = 330 | preço da energia |
| batteryCost = 5000 | custo da troca |
| profit = 0 | lucro acumulado |
| history = [] | histórico vazio |

A seguir, a DP é executada:

```
runDynamicProgramming({ price, solar, battery, batteryHealth, batteryCost });
```

Ela calcula a melhor ação e os valores Q(a).

---

# 🎯 O QUE É Q(a)?

**Q(a) = Valor total esperado da ação**, somando:

1. **Recompensa imediata**
2. **Valor futuro estimado pela DP para os próximos passos**

Fórmula:

```
Q(a) = Recompensa_imediata + Valor_futuro_do_estado_seguinte
```

A ação com maior Q(a) é marcada como **Melhor ação** no painel.

---

# ⚡ AÇÕES DO USUÁRIO

## 🔵 Carregar (charge)

- Bateria: **+6.7%**
- Lucro: **–price**
- Desgaste leve
- Registrado no histórico

**Significado:** Comprando energia para armazenar.

---

## 🟠 Descarregar (discharge)

- Bateria: **–6.7%**
- Lucro: **+price**
- Desgaste leve
- Registrado no histórico
- Bloqueado se bateria = 0%

**Significado:** Vendendo energia armazenada.

---

## ⚪ Manter (idle)

- Não força charge/discharge
- Bateria recebe: **solar * 1.2**
- Pequeno desgaste
- Lucro levemente positivo
- Registrado no histórico

**Significado:** Carregamento natural pelo sol.

---

## 🟡 Trocar Bateria (replace)

- Bateria → 100%
- Saúde → 100%
- Lucro: **–batteryCost**
- Registrado no histórico

---

# 📊 ESTADOS MOSTRADOS NO PAINEL

### 🔋 Bateria (%)
Energia atual.

### ❤️ Saúde
Degradação acumulada.

### ☀️ Solar (kW)
Geração instantânea.

### 💰 Lucro
Soma das operações.

### 🌡 Estado do sistema
- Emergência  
- Risco  
- Oportunidade Alta  
- Estável  

---

# 🧠 DP — COMO FUNCIONA

- 16 níveis de bateria  
- Horizonte de 24 passos  
- Para cada ação: calcula  
  - recompensa imediata  
  - + valor futuro  

DP calcula:

```
V(t, s) = max_a [ R(s, a) + V(t+1, next(s, a)) ]
```

Depois:

```
bestAction = argmax_a Q(a)
```

---

# 📂 HISTÓRICO

Cada ação aparece com:

- horário  
- nome  
- impacto financeiro  

---

# 🎉 Conclusão

O painel combina:

- Simulação realista  
- Interface clara  
- Ações manuais  
- Inteligência via DP  

Perfeito para estudos, TCC, e demonstrações de otimização e energia.
