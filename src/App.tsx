/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { initLiquidSort, isDebugMode } from './liquidSort';

export default function App() {
  useEffect(() => {
    return initLiquidSort();
  }, []);

  return (
    <>
      <canvas id="ambient-canvas" aria-hidden="true"></canvas>
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
                id="btn-language"
                className="lang-pill-btn"
                aria-label="Selecionar idioma"
                title="Idioma"
              >
                <span id="lang-flag" className="lang-flag-badge" aria-hidden="true">
                  <svg className="flag-svg" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect width="24" height="16" fill="#012169" />
                    <path d="M0 0L24 16M24 0L0 16" stroke="#FFFFFF" strokeWidth="3.2" />
                    <path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.6" />
                    <path d="M12 0V16M0 8H24" stroke="#FFFFFF" strokeWidth="5" />
                    <path d="M12 0V16M0 8H24" stroke="#C8102E" strokeWidth="3" />
                  </svg>
                </span>
                <span id="lang-code">EN</span>
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
              <span className="stat-chip-label" data-i18n="statMoves">Jogadas</span>
              <span id="moves-num" className="stat-chip-val">0</span>
            </div>
            <div className="stat-chip">
              <span className="stat-chip-label" data-i18n="statIdeal">Ideal</span>
              <span id="ideal-moves-num" className="stat-chip-val">—</span>
            </div>
            <div className="stat-chip">
              <span className="stat-chip-label" data-i18n="statEff">Efic.</span>
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
          <div className="controls-dock">
            <button id="btn-undo" className="ctrl-btn" disabled>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14L4 9l5-5"></path>
                <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path>
              </svg>
              <span data-i18n="ctrlUndo">Desfazer</span>
            </button>

            <button id="btn-hint" className="ctrl-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6"></path>
                <path d="M10 22h4"></path>
                <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1.1 2h5.8c.1-.8.5-1.5 1.1-2A7 7 0 0 0 12 2Z"></path>
              </svg>
              <span data-i18n="ctrlHint">Dica</span>
            </button>

            <button id="btn-restart" className="ctrl-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span data-i18n="ctrlRestart">Reiniciar</span>
            </button>

            <button id="btn-extra" className="ctrl-btn">
              <span id="extra-badge" className="extra-badge">1</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3h6"></path>
                <path d="M10 3v14a2 2 0 0 0 4 0V3"></path>
                <path d="M18 13v6"></path>
                <path d="M15 16h6"></path>
              </svg>
              <span data-i18n="ctrlExtra">+1 Tubo</span>
            </button>
          </div>
        </footer>
      </div>

      {/* TODO: REMOVER ANTES DO LANÇAMENTO — Botão temporário de debug para testar o overlay de impasse */}
      {isDebugMode && (
        <button
          id="btn-debug-deadlock"
          type="button"
          className="debug-deadlock-btn"
          title="Forçar tela de impasse (Shift+D)"
        >
          Debug: Forçar Impasse
        </button>
      )}

      <svg id="hint-svg" aria-hidden="true"></svg>
      <svg id="pour-svg"></svg>
      <canvas id="fx-canvas"></canvas>
      <audio id="audio-pour" src="pour.mp3" preload="auto"></audio>
      <audio id="audio-complete" src="chime.mp3" preload="auto"></audio>
      <audio id="audio-error" src="error.mp3" preload="auto"></audio>

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
              <div className="stat-label" data-i18n="statMoves">Jogadas</div>
              <div className="stat-value" id="win-moves">0</div>
            </div>
            <div className="stat-pill">
              <div className="stat-label" data-i18n="statIdeal">Ideal</div>
              <div className="stat-value" id="win-ideal-moves">0</div>
            </div>
            <div className="stat-pill">
              <div className="stat-label" data-i18n="statEffFull">Eficiência</div>
              <div className="stat-value" id="win-eff">100%</div>
            </div>
          </div>

          <div id="skip-callout" className="skip-callout">
            <div className="skip-callout-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
              <span data-i18n="victorySkipCalloutTitle">Ritmo excelente!</span>
            </div>
            <p id="skip-callout-text" className="skip-callout-text"></p>
          </div>

          <div className="modal-stack-actions">
            <button id="btn-win-primary" className="btn-primary">Próxima Rodada</button>
            <button id="btn-win-advance" className="btn-advance" style={{ display: 'none' }}>
              Avançar para Fase Média (sem ônus)
            </button>
            <button id="btn-win-replay" className="btn-secondary" data-i18n="winBtnReplayLesson" style={{ display: 'none' }}>
              Repetir Lição
            </button>
            <button id="btn-win-phases" className="btn-secondary" data-i18n="winBtnChoosePhase" style={{ display: 'none' }}>
              Escolher Fase
            </button>
          </div>
        </div>
      </div>

      {/* Phase Selector Modal */}
      <div id="phases-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <h2 className="modal-title" data-i18n="phasesModalTitle">Escolher Fase</h2>
          <p className="modal-subtitle" data-i18n="phasesModalSubtitle">Todas as fases são liberadas. Comece pelo Treinamento ou escolha seu desafio.</p>
          <div id="phase-list" className="phase-list"></div>
          <button id="btn-close-phases" className="btn-secondary" data-i18n="modalClose" style={{ width: '100%' }}>Fechar</button>
        </div>
      </div>

      {/* BGM Track Selector Modal */}
      <div id="bgm-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <h2 className="modal-title" data-i18n="bgmModalTitle">Trilha Sonora</h2>
          <p className="modal-subtitle" data-i18n="bgmModalSubtitle">Escolha o ritmo de fundo para acompanhar suas partidas.</p>
          <div id="bgm-list" className="bgm-list"></div>
          <button id="btn-close-bgm" className="btn-secondary" data-i18n="modalClose" style={{ width: '100%' }}>Fechar</button>
        </div>
      </div>

      {/* Language Selector Modal */}
      <div id="language-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <h2 className="modal-title" data-i18n="languageModalTitle">Idioma</h2>
          <p className="modal-subtitle" data-i18n="languageModalSubtitle">Escolha o idioma da interface.</p>
          <div id="language-list" className="lang-list"></div>
          <button id="btn-close-language" className="btn-secondary" data-i18n="modalClose" style={{ width: '100%' }}>Fechar</button>
        </div>
      </div>

      {/* Settings Modal */}
      <div id="settings-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card settings-modal-card">
          <div className="settings-viewport">
            <div id="settings-track" className="settings-track">
              {/* Level 1: Main Settings Categories */}
              <div id="settings-pane-main" className="settings-pane" aria-hidden="false">
                <h2 className="modal-title settings-main-title" data-i18n="settingsModalTitle">Configurações</h2>
                <div className="settings-cat-list">
                  <button type="button" className="settings-cat-btn" data-settings-cat="visual">
                    <span className="settings-cat-left">
                      <span className="settings-cat-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </span>
                      <span className="settings-cat-title" data-i18n="settingsSectionVisual">Acessibilidade e Visual</span>
                    </span>
                    <span className="settings-cat-right">
                      <span id="settings-summary-visual" className="settings-cat-summary">Apenas Cores</span>
                      <svg className="settings-cat-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </span>
                  </button>

                  <button type="button" className="settings-cat-btn" data-settings-cat="gameplay">
                    <span className="settings-cat-left">
                      <span className="settings-cat-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="6" width="20" height="12" rx="4"></rect>
                          <line x1="6" y1="12" x2="10" y2="12"></line>
                          <line x1="8" y1="10" x2="8" y2="14"></line>
                          <circle cx="15" cy="11" r="1"></circle>
                          <circle cx="18" cy="13" r="1"></circle>
                        </svg>
                      </span>
                      <span className="settings-cat-title" data-i18n="settingsSectionGameplay">Jogabilidade</span>
                    </span>
                    <span className="settings-cat-right">
                      <span id="settings-summary-gameplay" className="settings-cat-summary">Dica: 1s</span>
                      <svg className="settings-cat-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </span>
                  </button>

                  <button type="button" className="settings-cat-btn" data-settings-cat="audio">
                    <span className="settings-cat-left">
                      <span className="settings-cat-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      </span>
                      <span className="settings-cat-title" data-i18n="settingsSectionAudio">Áudio</span>
                    </span>
                    <span className="settings-cat-right">
                      <span id="settings-summary-audio" className="settings-cat-summary">Efeitos 50%, Música 50%</span>
                      <svg className="settings-cat-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </span>
                  </button>

                  <button type="button" className="settings-cat-btn" data-settings-cat="data">
                    <span className="settings-cat-left">
                      <span className="settings-cat-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                        </svg>
                      </span>
                      <span className="settings-cat-title" data-i18n="settingsSectionData">Dados do Jogo</span>
                    </span>
                    <span className="settings-cat-right">
                      <span id="settings-summary-data" className="settings-cat-summary">0/105 rodadas</span>
                      <svg className="settings-cat-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              {/* Level 2: Submenu Panels */}
              <div id="settings-pane-sub" className="settings-pane" aria-hidden="true">
                <div className="settings-submenu-topbar">
                  <button id="btn-settings-back" type="button" className="settings-back-btn">
                    <svg className="settings-back-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    <span data-i18n="settingsBack">Voltar</span>
                  </button>
                  <h2 id="settings-submenu-title" className="settings-submenu-title">Acessibilidade e Visual</h2>
                </div>

                {/* Subpanel: Visual & Accessibility */}
                <div className="settings-subpanel" data-subpanel="visual">
                  <p className="modal-subtitle settings-sub-desc" data-i18n="settingsModalSubtitle">
                    Escolha como diferenciar os líquidos nos tubos.
                  </p>
                  <div id="settings-list" className="settings-list"></div>
                </div>

                {/* Subpanel: Gameplay */}
                <div className="settings-subpanel" data-subpanel="gameplay">
                  <label className="setting-toggle-row" htmlFor="toggle-mystery-mode">
                    <span className="setting-toggle-label" data-i18n="settingsMysteryModeLabel">Modo Mistério (?)</span>
                    <span className="switch">
                      <input id="toggle-mystery-mode" type="checkbox" defaultChecked />
                      <span className="switch-slider"></span>
                    </span>
                  </label>
                  <div className="setting-slider-row">
                    <div className="setting-slider-header">
                      <label className="setting-toggle-label" htmlFor="slider-hint-duration" data-i18n="settingsHintDurationLabel">
                        Tempo da Dica
                      </label>
                      <span id="hint-duration-value" className="setting-slider-val">1s</span>
                    </div>
                    <input
                      id="slider-hint-duration"
                      className="volume-slider"
                      type="range"
                      min="0"
                      max="6"
                      step="1"
                      defaultValue="1"
                    />
                    <div className="setting-slider-ends" aria-hidden="true">
                      <span>Off</span>
                      <span>∞</span>
                    </div>
                  </div>
                </div>

                {/* Subpanel: Audio */}
                <div className="settings-subpanel" data-subpanel="audio">
                  <div className="setting-slider-row">
                    <div className="setting-slider-header">
                      <label className="setting-toggle-label" htmlFor="slider-sfx-volume" data-i18n="settingsSfxVolumeLabel">
                        Volume dos Efeitos
                      </label>
                      <span id="sfx-volume-value" className="setting-slider-val">50%</span>
                    </div>
                    <input
                      id="slider-sfx-volume"
                      className="volume-slider"
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="50"
                    />
                  </div>
                  <div className="setting-slider-row">
                    <div className="setting-slider-header">
                      <label className="setting-toggle-label" htmlFor="slider-bgm-volume" data-i18n="settingsBgmVolumeLabel">
                        Volume da Música
                      </label>
                      <span id="bgm-volume-value" className="setting-slider-val">50%</span>
                    </div>
                    <input
                      id="slider-bgm-volume"
                      className="volume-slider"
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="50"
                    />
                  </div>
                </div>

                {/* Subpanel: Game Data */}
                <div className="settings-subpanel" data-subpanel="data">
                  <p className="modal-subtitle settings-sub-desc" data-i18n="settingsDataHint">
                    Apaga todas as fases concluídas, tabuleiros salvos e estatísticas.
                  </p>
                  <button
                    id="btn-reset-all-progress"
                    type="button"
                    className="setting-danger-row"
                    data-i18n="settingsResetAllBtn"
                  >
                    Apagar Todo o Progresso
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-footer">
            <button id="btn-close-settings" className="btn-secondary settings-close-btn" data-i18n="modalClose">Fechar</button>
          </div>
        </div>
      </div>

      {/* Restart Confirmation Modal */}
      <div id="confirm-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <h2 className="modal-title" data-i18n="confirmModalTitle">Reiniciar Rodada?</h2>
          <p className="modal-subtitle" data-i18n="confirmModalSubtitle">Todo o progresso desta rodada atual será reiniciado do zero.</p>
          <div className="modal-actions">
            <button id="btn-cancel-restart" className="btn-secondary" data-i18n="confirmCancel">Cancelar</button>
            <button id="btn-confirm-restart" className="btn-danger" data-i18n="confirmRestart">Reiniciar</button>
          </div>
        </div>
      </div>

      {/* Reset All Progress Confirmation Modal (Step 1) */}
      <div id="reset-confirm-1-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <h2 className="modal-title" data-i18n="resetConfirm1Title">Apagar Todo o Progresso?</h2>
          <p className="modal-subtitle" data-i18n="resetConfirm1Subtitle">
            Todas as fases concluídas, rodadas salvas e estatísticas serão apagadas.
          </p>
          <div className="modal-actions">
            <button id="btn-reset-cancel-1" className="btn-secondary" data-i18n="confirmCancel">Cancelar</button>
            <button id="btn-reset-next-1" className="btn-danger" data-i18n="resetConfirm1Next">Continuar</button>
          </div>
        </div>
      </div>

      {/* Reset All Progress Confirmation Modal (Step 2) */}
      <div id="reset-confirm-2-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <h2 className="modal-title" data-i18n="resetConfirm2Title">Tem certeza absoluta?</h2>
          <p className="modal-subtitle" data-i18n="resetConfirm2Subtitle">
            Esta ação não pode ser desfeita. Todo o seu progresso será perdido permanentemente.
          </p>
          <div className="modal-stack-actions">
            <button id="btn-reset-cancel-2" className="btn-secondary" data-i18n="confirmCancel" style={{ width: '100%' }}>
              Cancelar
            </button>
            <button id="btn-reset-confirm-2" className="btn-danger" data-i18n="resetConfirm2Confirm" style={{ width: '100%' }}>
              Sim, apagar tudo
            </button>
          </div>
        </div>
      </div>

      {/* Stuck Detection Modal */}
      <div id="stuck-modal" className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-card">
          <p className="modal-subtitle" data-i18n="stuckModalSubtitle" style={{ marginTop: '4px' }}>
            Parece que não há mais movimentos possíveis. Que tal tentar de novo?
          </p>
          <div className="modal-stack-actions">
            <button id="btn-stuck-undo" className="btn-primary" data-i18n="stuckUndoBtn">
              Desfazer Último Movimento
            </button>
            <button id="btn-stuck-extra" className="btn-advance" data-i18n="ctrlExtra">
              +1 Tubo
            </button>
            <button id="btn-stuck-restart" className="btn-secondary" data-i18n="stuckRestartBtn">
              Reiniciar Rodada
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
