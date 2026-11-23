# Free Liquid Sort

## Manifesto do Projeto

O **Free Liquid Sort** é um jogo 100% gratuito, sem anúncios, sem compras e focado em fluidez, relaxamento (ASMR) e progressão sem pressão, com um sistema interno de recompensas exclusivamente lúdico (Pontos, Moedas e Estrelas).

Leia as diretrizes completas de filosofia, gratuidade, recompensas e identidade visual em [MANIFESTO.md](MANIFESTO.md).

---

## Mecânica Central e Tabuleiro Inteligente
* Separação clássica (até 10 cores, frascos de capacidade 4).
* Geração procedural com semente (*seed*) e validação de solubilidade.
* Métricas em tempo real (Jogadas, Ideal, Eficiência).
* Detecção de impasse (*deadlock*) e animações de despejo (jato líquido SVG, rolha de cortiça, confetes na vitória perfeita).

## Fases e Progressão (53 Rodadas)
* Todas as fases liberadas desde o início.
* Treinamento (5), Fácil (8), Médio (12), Difícil (12) e Desafiador (16). Opção de avanço antecipado sem ônus.

## Assistência Inteligente e Jogabilidade
* Dica em 2 Níveis (💡): 1º toque realça destinos válidos, 2º toque aponta a melhor jogada.
* Tempo da Dica: Slider com 7 paradas (Off, 1s a 5s, ∞).
* Slot Fantasma +1 Tubo: Frasco tracejado integrado ao tabuleiro.
* Desfazer completo e reinício seguro (com confirmação).

## Modo Mistério (?)
* 0% no Treinamento/Fácil, crescendo nas fases seguintes (máx. 68% do tabuleiro para não perder o contexto).
* Camadas ocultas aparecem como blocos escuros com `?`. Revelação ASMR (*pop* + *fade-in* + som de cristal).
* Regra de Ouro do Desfazer: Cores já reveladas permanecem reveladas mesmo se usar Desfazer.
* Toggle nas configurações que, se desligado, revela tudo na hora com um Toast de aviso.

## Estética ASMR e Layout Responsivo
* Frascos em silhueta de garrafa, líquidos cintilantes, menisco luminoso.
* Dock inferior compacto (Desfazer, Dica, Reiniciar, +1 Tubo).
* Grid adaptativo (1 a 3 fileiras) via `ResizeObserver` e `100dvh`.

## Acessibilidade, Áudio e Idiomas
* 3 modos de daltonismo (Cores, Padrões, Cores + Padrões) e alternância entre Modo Noite e Modo Dia.
* Áudio procedural (Web Audio API) com 10 trilhas e efeitos sintetizados, volumes independentes.
* 8 idiomas com detecção automática e suporte a RTL (Árabe).
* Persistência total no `localStorage`.

---

## Como Executar e Implantar o Aplicativo

Pré-requisitos: Node.js

1. Instale as dependências:
   `npm install`
2. Configure a variável `GEMINI_API_KEY` no arquivo [.env.local](.env.local) se necessário.
3. Execute o aplicativo:
   `npm run dev`
