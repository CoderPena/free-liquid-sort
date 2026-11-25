# REGRAS — Sistema de Recompensas do Free Liquid Sort

Documento oficial de referência das regras de negócio para as próximas etapas de desenvolvimento do sistema interno de recompensas do **Free Liquid Sort**, em consonância com o [MANIFESTO.md](MANIFESTO.md).

> **Legenda de status neste documento:**
> - **Regra aprovada:** definição fechada para orientar a arquitetura e a implementação.
> - **Decisão pendente:** assunto explicitamente em aberto; **não** deve ter valores, comportamentos ou regras inventadas até aprovação posterior.
> - **Questão técnica pendente:** ponto identificado na auditoria do código atual que exige verificação ou adequação técnica durante a implementação.

---

## 1. Objetivo Geral *(Regras aprovadas)*

O sistema de recompensas possui três elementos principais, cada qual com finalidade distinta, controle próprio e histórico independente:

- **Estrelas:** representam o desempenho do jogador em cada rodada.
- **Moedas:** recompensa interna acumulável conquistada durante o jogo, para uso futuro em uma loja interna.
- **Pontos:** representam a progressão do jogador na futura **Jornada**.

Princípios inegociáveis (alinhados ao `MANIFESTO.md`):
- Jogo 100% gratuito, sem compra de moedas com dinheiro real.
- Sem anúncios, microtransações, assinaturas, paywalls ou conversão comercial.
- Sem loot boxes, recompensas aleatórias ou mecanismos baseados em sorte.

---

## 2. Sistema de Estrelas — Desempenho por Rodada *(Regras aprovadas)*

As estrelas classificam o desempenho objetivo do jogador em cada rodada de forma calculável e reproduzível.

**Abrangência:** todos os níveis, **incluindo as cinco rodadas de treinamento**, utilizam exatamente os mesmos critérios:

| Eficiência | Estrelas |
|---|---:|
| Abaixo de 80% | 1 |
| De 80% até abaixo de 100% | 2 |
| Exatamente 100% | 3 |

### Cálculo da eficiência e regras obrigatórias
```text
Eficiência = (Movimentos ideais / Movimentos realizados) × 100
```

Regras obrigatórias:
- A eficiência deve ser calculada com base no número ideal de movimentos correspondente à **configuração efetiva da partida**.
- O ideal de movimentos **deve ser recalculado** quando o jogador adquirir um tubo adicional, conforme o funcionamento atual do jogo.
- A avaliação utiliza o **ideal recalculado** para aquela partida.
- O resultado da eficiência **nunca pode ultrapassar 100%**; qualquer resultado matemático superior a 100% deve ser limitado a 100%.
- **Não arredondar** o resultado antes de classificar as estrelas; a classificação utiliza o **valor real calculado**, antes de qualquer arredondamento.
- O arredondamento, quando necessário, deve ocorrer **somente para apresentação visual**.
- O uso de **dica**, **desfazer movimento** ou **tubo adicional** não deve gerar penalidade automática na classificação por estrelas.
- O limite de 100% não substitui a necessidade de verificar a consistência do algoritmo que calcula os movimentos ideais.

### Preservação de recorde
- O **melhor resultado de estrelas** obtido em cada rodada deve ser preservado.
- Uma partida posterior com desempenho inferior **não reduz** o recorde já conquistado.

---

## 3. Sistema de Moedas — Recompensas Acumuláveis *(Regras aprovadas + Escopo futuro)*

### Modelo e escopo futuro *(Regras aprovadas)*
- As moedas são uma recompensa interna acumulável, conquistada exclusivamente durante o jogo.
- Não haverá monetização real, anúncios, compras com dinheiro, microtransações ou assinaturas.
- No futuro, as moedas poderão ser utilizadas em uma **loja interna** para adquirir itens e vantagens, incluindo:
  - Personalizações cosméticas.
  - Outros itens de customização.
  - Vantagens de jogo, como tubos adicionais.
- **Restrição da loja nesta etapa:** a loja **não** faz parte da implementação atual. Não criar loja, preços, catálogo, interface de compra ou funcionalidades relacionadas agora.
- **Regra específica do tubo adicional na futura loja:**
  - Continuará obedecendo à mecânica atual: **no máximo 1 (um) tubo adicional por jogada/rodada**.
  - A aquisição do tubo adicional valerá **exclusivamente para a jogada em andamento**; em outra jogada, será necessária uma nova aquisição caso o jogador deseje utilizar o recurso novamente.

### 3.1. Recompensa pela primeira conclusão de uma rodada normal *(Regras aprovadas)*
- A primeira conclusão de cada rodada normal concede **5 moedas**.
- Repetir uma rodada já concluída não concede novamente essa recompensa.

### 3.2. Bônus por desempenho *(Regras aprovadas)*
Os bônus são concedidos quando o jogador alcança **pela primeira vez** cada novo patamar de estrelas em uma rodada:
- Primeira conquista de **2 estrelas**: **+2 moedas**.
- Primeira conquista de **3 estrelas**: **+3 moedas**.

Funcionamento incremental:
- Concluir rodada normal com **1 estrela**: `5` moedas pela primeira conclusão.
- Melhorar de **1 para 2 estrelas**: recebe mais `2` moedas (`7` no total).
- Melhorar de **2 para 3 estrelas**: recebe mais `3` moedas (`10` no total).
- Uma rodada normal concluída diretamente com **3 estrelas** gera `10` moedas no total (`5` pela primeira conclusão + `2` pela conquista de 2 estrelas + `3` pela conquista de 3 estrelas).
- Repetir a rodada sem alcançar um novo patamar de estrelas **não concede moedas adicionais**.
- O melhor resultado de estrelas obtido em cada rodada é preservado; uma partida posterior com desempenho inferior não reduz o recorde.

### 3.3. Bônus por conclusão de fase *(Regras aprovadas)*
- Ao concluir **pela primeira vez todas as rodadas de uma fase**, o jogador recebe **10 moedas adicionais**.
- Esse bônus é concedido **uma única vez por fase**.
- Rejogar a fase não concede novamente o bônus.
- Conclusão de rodada e conclusão de fase são eventos distintos e não devem ser confundidos. *(Nota: o treinamento completo possui sua regra própria de conclusão descrita na seção 4, equivalente ao bônus único de 10 moedas pelo término das cinco lições, sem duplicidade com este bônus.)*

---

## 4. Recompensas Especiais do Treinamento *(Regras aprovadas)*

O treinamento possui **5 rodadas**.

Regras específicas de moedas no treinamento:
- **2 moedas** pela primeira conclusão de cada rodada de treinamento.
- **10 moedas adicionais** pela primeira conclusão das **5 rodadas de treinamento** (término do treinamento completo).
- As recompensas especiais do treinamento são independentes dos bônus normais por desempenho.
- As 5 rodadas de treinamento também seguem o sistema geral de estrelas (seção 2) e os bônus de desempenho (seção 3.2):
  - Primeira conquista de **2 estrelas**: **+2 moedas**.
  - Primeira conquista de **3 estrelas**: **+3 moedas**.

Exemplo aprovado:
- Se o jogador concluir as 5 rodadas de treinamento com **1 estrela** em cada uma, receberá:
  - `10` moedas pelas cinco primeiras conclusões (`5 × 2`).
  - `10` moedas pelo término do treinamento completo.
  - **Total: `20` moedas.**
- Caso conquiste estrelas superiores (2 ou 3 estrelas), os respectivos bônus incrementais de desempenho (`+2` / `+3` por rodada) são acrescentados normalmente.
- **Não permitir** que o jogador obtenha repetidamente as recompensas de primeira conclusão ou de conclusão do treinamento ao repetir as rodadas.

---

## 5. Sistema de Pontos e Jornada *(Regras aprovadas + Decisões pendentes)*

Os pontos representam a progressão do jogador na futura **Jornada**.

### Regras aprovadas
- Cada etapa da Jornada concede seus pontos de progressão **uma única vez**.
- O jogador pode avançar na Jornada sem jogar determinada fase ou rodada.
- Se avançar sem jogar, recebe os pontos de progressão associados àquela etapa normalmente.
- Se retornar posteriormente para jogar uma etapa já ultrapassada, **não recebe novamente** os pontos de progressão daquela etapa.
- Jogar posteriormente uma etapa já contabilizada ainda poderá gerar recompensas de desempenho (como moedas por estrelas), caso os critérios sejam atendidos.
- É necessário **distinguir tecnicamente** os pontos de progressão da Jornada das recompensas de desempenho obtidas ao jogar.
- **Escopo atual:** a Jornada ainda **não será implementada nesta etapa**. A arquitetura deverá apenas considerar e preparar essa separação para evitar duplicidade futura.

### Pendência explícita
- Os **valores numéricos dos pontos** ainda não foram definidos (não inventar valores).

---

## 6. Regras Gerais de Integridade das Recompensas *(Regras aprovadas)*

O sistema deverá impedir qualquer duplicidade de recompensas e manter separação clara entre controle, histórico e saldos.

Deverá distinguir, no mínimo:
1. **Primeira conclusão de uma rodada** (normal ou de treinamento).
2. **Primeira conquista de cada patamar de estrelas** (2 estrelas e 3 estrelas por rodada).
3. **Primeira conclusão de uma fase** (todas as rodadas da fase).
4. **Primeira conclusão do treinamento completo** (as 5 rodadas de treinamento).
5. **Pontos de progressão já concedidos por uma etapa da Jornada.**

Regras de consistência:
- O **histórico de desempenho** não deve ser confundido com o **saldo** de moedas ou pontos.
- Recompensas já concedidas **não podem ser duplicadas** por repetição de partidas, retorno a fases anteriores ou reabertura do jogo.

---

## 7. Estrutura Atual do Jogo *(Referência identificada no código)*

| Fase | Rodadas |
|---|---:|
| Treinamento | 5 |
| Fácil | 8 |
| Médio | 12 |
| Difícil | 12 |
| Desafiador | 16 |
| **Total** | **53** |

---

## 8. Decisões Ainda Pendentes e Questões Técnicas

### A. Decisões de produto ainda pendentes *(Não inventar respostas)*
1. **Valores numéricos dos pontos de progressão da Jornada.**
2. **Regras detalhadas, catálogo e preços da futura loja.**
3. **Comportamento do reset total** (`executeResetAllProgress`) em relação ao histórico e às recompensas.
4. **Política de conversão de saves antigos** (`liquid_sort_save_v3`) para o novo sistema de recompensas.
5. **Detalhes de recompensas ou marcos adicionais ainda não aprovados.**
6. **Interface e traduções do sistema de recompensas.**

### 8.B — Decisões aprovadas

**1. Indicadores permanentes de recompensas (HUD)**

É aprovado e desejado exibir permanentemente no cabeçalho do jogo:

- Total acumulado de estrelas.
- Saldo atual de moedas.

Os dois indicadores devem aparecer juntos, em uma barra compacta, posicionada abaixo da linha superior de controles e acima da barra de estatísticas, conforme a referência visual aprovada em 24/11/2026.

Os valores devem refletir o estado persistido e ser atualizados sempre que as recompensas forem alteradas.

Essa apresentação permanente não substitui o detalhamento das recompensas na tela de vitória, que também deve ser mantido.

### B. Questões técnicas pendentes *(Identificadas na auditoria do código atual)*
1. **Separação entre exibição e cálculo real de eficiência (`/src/liquidSort.ts`):**
   - Atualmente `computeEfficiency(moves, idealMoves)` aplica `Math.round((idealMoves / moves) * 100)` no próprio retorno.
   - Será necessário preservar o valor real não arredondado (limitado a 100%) para classificar estrelas, deixando qualquer arredondamento restrito à exibição visual, além de auditar a consistência do algoritmo que calcula os movimentos ideais (`findIdealMoves` / `findQuickDFSMoves`, inclusive após recálculo com tubo adicional).
2. **Contagem de `Desfazer` em `board.moves` (`handleUndo`):**
   - No código atual, `handleUndo()` incrementa `board.moves++`. Embora não exista penalidade automática de estrelas pelo uso de recursos, esse incremento altera `Movimentos realizados` na fórmula de eficiência e precisa ser verificado tecnicamente na etapa de implementação.
3. **Uso transitório do tubo adicional antes da loja existir:**
   - Hoje o jogo oferece 1 tubo adicional gratuito por rodada nas fases não tutoriais; confirmar a manutenção desse comportamento atual enquanto a futura loja interna não existir.
4. **Separação entre sessão da fase (`replay-phase`) e histórico permanente:**
   - Atualmente `onWinPrimary` (`action === 'replay-phase'` ao concluir `desafiador`) zera `completedRounds`, `easyRounds` e `phaseCompleted`. Será necessário isolar o histórico permanente de recompensas e recordes de estrelas para que reiniciar uma fase não apague conquistas nem permita duplicidade.
5. **Consistência de conclusão de fase e fluxo `onWinAdvance`:**
   - Hoje `recordRoundVictory()` define `phaseCompleted = true` apenas por `pData.currentRound >= phase.totalRounds`, sem verificar se todas as rodadas `1..totalRounds` foram vencidas; além disso, `onWinAdvance` (`#btn-win-advance`) muda de fase sem avançar `currentRound` na fase anterior.
6. **Alinhamento documental futuro com o `MANIFESTO.md`:**
   - Quando a futura loja interna for especificada, alinhar a redação do `MANIFESTO.md` (que hoje cita apenas "elementos opcionais, cosméticos ou personalizações") para contemplar também vantagens de jogo adquiridas exclusivamente com moedas gratuitas do próprio jogo.
7. **Compatibilidade e versionamento de `liquid_sort_save_v3`:**
   - Adicionar versionamento explícito de schema para evoluir o `localStorage` sem perda de progresso existente.
