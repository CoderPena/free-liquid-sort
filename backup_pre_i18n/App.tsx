/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { initLiquidSort } from './liquidSort';

export default function App() {
  useEffect(() => {
    return initLiquidSort();
  }, []);

  return (
    <>
      <div id="app">
        <header className="topbar">
          <div className="topbar-row">
            <button id="btn-phases" className="phase-btn" aria-label="Selecionar fase">
              <span id="phase-dot" className="phase-dot treinamento"></span>
              <span className="phase-btn-label">
                <span id="phase-name">Treinamento</span>
                <span className="phase-sub">
                  • <span id="round-num">1</span>/<span id="round-total">5</span>
                </span>
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--text-secondary)', flexShrink: 0 }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <div className="topbar-audio-group">
              <button
                id="btn-bgm"
                className="bgm-pill-btn"
                aria-label="Selecionar trilha sonora"
                title="Trilha Sonora"
              >
                <span>🎵</span>
                <span id="bgm-emoji" className="bgm-emoji-badge">🛗</span>
                <span id="bgm-label">Elevador</span>
              </button>

              <button
                id="btn-settings"
                className="icon-btn"
                aria-label="Configurações"
                title="Configurações"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>

              <button id="btn-sound" className="icon-btn" aria-label="Alternar som" title="Mudo / Som">
                <svg
                  id="icon-sound-on"
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
                <svg
                  id="icon-sound-off"
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: 'none' }}
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              </button>
            </div>
          </div>

          <div className="stats-bar">
            <div className="stat-chip">
              <span className="stat-chip-label">Jogadas</span>
              <span id="moves-num" className="stat-chip-val">0</span>
            </div>
            <div className="stat-chip">
              <span className="stat-chip-label">Ideal</span>
              <span id="ideal-moves-num" className="stat-chip-val">—</span>
            </div>
            <div className="stat-chip">
              <span className="stat-chip-label">Efic.</span>
              <span id="eff-num" className="stat-chip-val">—</span>
            </div>
          </div>
        </header>

        <div id="tutorial-tip" className="tutorial-tip" role="region" aria-live="polite">
          <div className="tutorial-tip-header">
            <span id="tutorial-tip-title" className="tutorial-tip-title">Lição 1</span>
            <span id="tutorial-tip-step" className="tutorial-tip-step">Passo 1 de 2</span>
          </div>
          <div id="tutorial-tip-text" className="tutorial-tip-text"></div>
        </div>

        <main id="board-wrap" className="board-wrap">
          <div id="board" className="board"></div>
        </main>

        <div className="combo-layer" aria-live="polite">
          <div id="combo-toast" className="combo-toast"></div>
        </div>

        <div id="deadlock-banner" className="deadlock-banner" role="status">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, color: '#FF3B5C' }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span id="deadlock-text">Sem jogadas possíveis! Desfaça, reinicie ou use +1 Tubo.</span>
        </div>

        <footer className="controls">
          <button id="btn-undo" className="ctrl-btn" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 14L4 9l5-5"></path>
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path>
            </svg>
            <span>Desfazer</span>
          </button>

          <button id="btn-restart" className="ctrl-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            <span>Reiniciar</span>
          </button>

          <button id="btn-extra" className="ctrl-btn">
            <span id="extra-badge" className="extra-badge">1</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3h6"></path>
              <path d="M10 3v14a2 2 0 0 0 4 0V3"></path>
              <path d="M18 13v6"></path>
              <path d="M15 16h6"></path>
            </svg>
            <span>+1 Tubo</span>
          </button>
        </footer>
      </div>

      <svg id="pour-svg"></svg>
      <canvas id="fx-canvas"></canvas>

      {/* Victory Modal */}
      <div id="victory-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <div className="victory-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
          </div>
          <div id="win-eyebrow" className="win-eyebrow">Parabéns!</div>
          <h2 id="win-title" className="modal-title">Rodada 1 Concluída!</h2>
          <p id="win-subtitle" className="modal-subtitle">Todas as cores foram separadas com perfeição.</p>

          <div className="modal-stats">
            <div className="stat-pill">
              <div className="stat-label">Jogadas</div>
              <div className="stat-value" id="win-moves">0</div>
            </div>
            <div className="stat-pill">
              <div className="stat-label">Ideal</div>
              <div className="stat-value" id="win-ideal-moves">0</div>
            </div>
            <div className="stat-pill">
              <div className="stat-label">Eficiência</div>
              <div className="stat-value" id="win-eff">100%</div>
            </div>
          </div>

          <div id="skip-callout" className="skip-callout">
            <div className="skip-callout-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
              <span>Ritmo excelente!</span>
            </div>
            <p id="skip-callout-text" className="skip-callout-text"></p>
          </div>

          <div className="modal-stack-actions">
            <button id="btn-win-primary" className="btn-primary">Próxima Rodada</button>
            <button id="btn-win-advance" className="btn-advance" style={{ display: 'none' }}>
              Avançar para Fase Média (sem ônus)
            </button>
            <button id="btn-win-replay" className="btn-secondary" style={{ display: 'none' }}>
              Repetir Lição
            </button>
            <button id="btn-win-phases" className="btn-secondary" style={{ display: 'none' }}>
              Escolher Fase
            </button>
          </div>
        </div>
      </div>

      {/* Phase Selector Modal */}
      <div id="phases-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <h2 className="modal-title">Escolher Fase</h2>
          <p className="modal-subtitle">Todas as fases são liberadas. Comece pelo Treinamento ou escolha seu desafio.</p>
          <div id="phase-list" className="phase-list"></div>
          <button id="btn-close-phases" className="btn-secondary" style={{ width: '100%' }}>Fechar</button>
        </div>
      </div>

      {/* BGM Track Selector Modal */}
      <div id="bgm-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <h2 className="modal-title">Trilha Sonora</h2>
          <p className="modal-subtitle">Escolha o ritmo de fundo para acompanhar suas partidas.</p>
          <div id="bgm-list" className="bgm-list"></div>
          <button id="btn-close-bgm" className="btn-secondary" style={{ width: '100%' }}>Fechar</button>
        </div>
      </div>

      {/* Settings Modal */}
      <div id="settings-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <h2 className="modal-title">Configurações</h2>
          <p className="modal-subtitle">Escolha como diferenciar os líquidos nos tubos.</p>
          <div id="settings-list" className="settings-list"></div>
          <button id="btn-close-settings" className="btn-secondary" style={{ width: '100%' }}>Fechar</button>
        </div>
      </div>

      {/* Restart Confirmation Modal */}
      <div id="confirm-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <h2 className="modal-title">Reiniciar Rodada?</h2>
          <p className="modal-subtitle">Todo o progresso desta rodada atual será reiniciado do zero.</p>
          <div className="modal-actions">
            <button id="btn-cancel-restart" className="btn-secondary">Cancelar</button>
            <button id="btn-confirm-restart" className="btn-danger">Reiniciar</button>
          </div>
        </div>
      </div>
    </>
  );
}
