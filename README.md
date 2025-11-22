# 🚀 Painel de Simulação de Sistema Solar com Bateria + Programação Dinâmica

Este projeto simula o comportamento de um sistema de energia composto por:

- Painel solar  
- Bateria  
- Custos de energia  
- Ações do usuário (Carregar, Descarregar, Manter, Trocar bateria)  
- Um agente inteligente que utiliza **Programação Dinâmica** para recomendar a melhor ação  

A interface mostra os estados do sistema, o histórico, as ações executadas e as decisões ótimas sugeridas pelo modelo.

---

## ⚡ AÇÕES DO PAINEL

### 🔵 1. **Carregar (charge)**

Quando o usuário clica em **Carregar**:

- Bateria aumenta **+6.7%**  
- O lucro **diminui** pelo custo de comprar energia  
- A saúde da bateria reduz levemente  
- O histórico registra a operação com valor negativo

**Significado real:**  
O sistema está comprando energia da rede e armazenando na bateria.

---

### 🟠 2. **Descarregar (discharge)**

Quando o usuário clica em **Descarregar**:

- Bateria reduz **–6.7%**  
- O lucro **aumenta** pelo valor vendido  
- A bateria sofre leve desgaste  
- O histórico exibe valor positivo

⚠ Se a bateria estiver em 0%, descarregar é bloqueado.

**Significado real:**  
O sistema vende energia armazenada na bateria para a rede.

---

### ⚪ 3. **Manter (idle)**

Quando o usuário clica em **Manter**:

- O sistema não força charge/discharge  
- A bateria recebe energia natural do solar:  
  **bateria += solar * 1.2**
- Pequeno desgaste natural é aplicado  
- Um pequeno ganho é adicionado ao lucro  
- Aparece no histórico o ganho solar

**Significado real:**  
A energia solar disponível está sendo usada para carregar a bateria naturalmente.

---

### 🟡 4. **Trocar Bateria (replace)**

Quando o usuário clica em **Trocar**:

- Bateria volta a 100%  
- Saúde volta a 100%  
- O lucro reduz pelo custo `batteryCost`  
- Histórico registra grande valor negativo

**Significado real:**  
Simula a compra de uma bateria nova.

---

## 📊 ESTADOS DO SISTEMA

### 🔋 **Bateria (%)**
Quantidade disponível de energia.

### ❤️ **Saúde da bateria (%)**
Degradação acumulada da bateria ao longo do tempo.

### ☀️ **Solar (kW)**
Geração solar atual.

### 💰 **Lucro**
Varia conforme ações manuais:
- Carregar → reduz lucro  
- Descarregar → aumenta lucro  
- Manter → aumento leve  
- Trocar → custo alto

### 🌡 **Estado do Sistema**

- **Emergência** → pouca bateria e pouco sol  
- **Risco** → bateria baixa  
- **Oportunidade Alta** → preço alto e bateria cheia  
- **Estável** → operação normal  

---

# 🧠 PROGRAMÇÃO DINÂMICA (DP)

O sistema calcula a melhor ação futura usando **Dynamic Programming**, baseado no artigo original.

A DP considera:

- Preço da energia  
- Geração solar  
- Bateria atual  
- Saúde da bateria  
- Custo da troca  
- Penalidades de descarregar com SOC baixo  
- Bonificação por carregar quando SOC é baixo  

---

## Como funciona

### ✔ Estados
A bateria é discretizada em **16 níveis** de 0% a 100%.

### ✔ Horizonte
Simula **24 passos futuros** (um dia).

### ✔ Modelo Matemático
A DP usa a equação: V(t, s) = max_a [ R(s, a) + V(t+1, nextState(s, a)) ]


Ou seja:

- A função olha para o estado **s** (nível da bateria)
- Calcula a recompensa de cada ação **a**
- Soma com o valor futuro do estado resultante
- Escolhe a ação com maior valor

Essa soma completa é chamada de:

# ⭐ **Q(a) = Recompensa imediata + Valor futuro**

O painel mostra:

- o Q(a) de cada ação (Carregar, Descarregar, Manter, Trocar)
- a melhor ação destacada pela DP

---

## Recompensas consideradas na DP

- **Descarregar:** lucro imediato, penalização se SOC baixo  
- **Carregar:** custo imediato, benefício futuro se SOC baixo  
- **Manter:** ganha valor solar  
- **Trocar:** custo muito alto  

---

# 📂 HISTÓRICO

Cada ação aparece com:

- horário  
- nome da ação  
- impacto financeiro  

Permite acompanhar decisões e lucros ao longo do tempo.

---

# 🏁 Conclusão

O painel combina:

- Simulação realista  
- Interface clara  
- Ações manuais intuitivas  
- Decisões inteligentes via Programação Dinâmica  
- Representação visual do estado e do valor futuro das ações

É ideal para:

- Trabalhos acadêmicos  
- Estudos de otimização  
- Projetos sobre energia  
- Demonstrações de tomada de decisão inteligente  



