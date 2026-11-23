import {
  BgmId,
  detectSystemLanguage,
  I18N,
  LANGUAGE_ORDER,
  LangCode,
  normalizeLangCode,
  PhaseId,
  SUPPORTED_LANGUAGES,
  translate,
  VisualModeId,
} from './i18n';

interface ColorDef {
  name: string;
  main: string;
  light: string;
  dark: string;
}

interface PhaseDef {
  id: string;
  name: string;
  totalRounds: number;
  isTutorial?: boolean;
  colorRange: [number, number];
  colorSplitRange: [number, number];
  emptyRange: [number, number];
  emptySplitRange: [number, number];
  nextPhaseId: string | null;
  desc: string;
}

interface HistoryEntry {
  from: number;
  to: number;
  count: number;
}

interface BoardState {
  round: number;
  tubes: number[][];
  initialTubes: number[][];
  hiddenCounts?: number[];
  initialHiddenCounts?: number[];
  history: HistoryEntry[];
  moves: number;
  idealMoves: number;
  baseIdealMoves: number;
  extraTubeUsed: boolean;
  tutorialStep?: number;
}

interface PhaseData {
  currentRound: number;
  completedRounds: number[];
  easyRounds: number[];
  phaseCompleted: boolean;
  seed: number;
  board: BoardState | null;
}

type VisualMode = 'color' | 'pattern' | 'both';
type HintDurationStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface AppState {
  language: LangCode;
  activePhaseId: string;
  bgmTrack: string;
  muted: boolean;
  sfxVolume: number;
  bgmVolume: number;
  visualMode: VisualMode;
  mysteryModeEnabled: boolean;
  hintDuration: HintDurationStep;
  phases: Record<string, PhaseData>;
}

interface TutorialStep {
  text: string;
  condition: (board: BoardState, sel: number | null) => boolean;
  highlightTube: (board: BoardState, sel: number | null) => number | null;
}

interface TutorialLesson {
  title: string;
  tubes: number[][];
  idealMoves: number;
  steps: TutorialStep[];
}

interface BgmTrackDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  bpm: number;
  stepDuration: number;
  schedule: (step: number, time: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  drag: number;
  rot: number;
  vRot: number;
  wobble: number;
  isCircle: boolean;
  glow?: boolean;
}

interface LayoutResult {
  counts: number[];
  tubeW: number;
  tubeH: number;
  tubeGap: number;
  rowGap: number;
  score?: number;
}

interface SolverHeapItem {
  tubes: number[][];
  key: string;
  g: number;
  f: number;
  priority: number;
}

// TODO: REMOVER ANTES DO LANÇAMENTO — Controla a exibição do botão temporário de debug de impasse
export const isDebugMode: boolean =
  import.meta.env.VITE_DEBUG_MODE !== 'false' &&
  (import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV);

export function initLiquidSort(): () => void {
  // v3 starts fresh from v2 to cleanly initialize Treinamento and bgmTrack
  const STORAGE_KEY = 'liquid_sort_save_v3';
  const TUBE_CAPACITY = 4;

  const COLORS: ColorDef[] = [
    { name: 'Rubi',      main: '#FF2E54', light: '#FF7892', dark: '#BD1132' },
    { name: 'Ciano',     main: '#00C8FF', light: '#73E4FF', dark: '#008BB5' },
    { name: 'Amarelo',   main: '#FFD600', light: '#FFF066', dark: '#C49A00' },
    { name: 'Esmeralda', main: '#00DC73', light: '#6CF5B1', dark: '#009B4F' },
    { name: 'Violeta',   main: '#A248FF', light: '#CC99FF', dark: '#6E1DC4' },
    { name: 'Laranja',   main: '#FF7700', light: '#FFA857', dark: '#BF5100' },
    { name: 'Magenta',   main: '#FF45C6', light: '#FF8EE0', dark: '#BA188B' },
    { name: 'Azul',      main: '#3D5AFE', light: '#8094FF', dark: '#1A34C4' },
    { name: 'Pérola',    main: '#E6EEFF', light: '#FFFFFF', dark: '#A6B7D9' },
    { name: 'Caramelo',  main: '#A65628', light: '#D18354', dark: '#6B3110' }
  ];

  const PERFECT_PHRASES = [
    'Você é um mestre da separação de líquidos!',
    'Impecável! Nem uma jogada a mais.',
    'Precisão cirúrgica!',
    'Nenhuma gota desperdiçada. Vitória perfeita!'
  ];

  const MOTIVATIONAL_PHRASES = [
    'Quase lá! Tente bater seu recorde na próxima.',
    'Boa! Cada rodada te deixa mais afiado.',
    'Desafio aceito? A próxima pode ser perfeita.',
    'Você conseguiu! Agora tente com menos jogadas.'
  ];

  const PHASES: PhaseDef[] = [
    {
      id: 'treinamento',
      name: 'Treinamento',
      totalRounds: 5,
      isTutorial: true,
      colorRange: [2, 2],
      colorSplitRange: [1, 2],
      emptyRange: [2, 2],
      emptySplitRange: [1, 1],
      nextPhaseId: 'facil',
      desc: 'Aprenda a jogar em 5 lições guiadas'
    },
    {
      id: 'facil',
      name: 'Fácil',
      totalRounds: 8,
      colorRange: [3, 4],
      colorSplitRange: [3, 5],
      emptyRange: [3, 2],
      emptySplitRange: [4, 6],
      nextPhaseId: 'medio',
      desc: '3 a 4 cores • 2 a 3 tubos vazios'
    },
    {
      id: 'medio',
      name: 'Médio',
      totalRounds: 12,
      colorRange: [5, 6],
      colorSplitRange: [5, 7],
      emptyRange: [2, 2],
      emptySplitRange: [12, 12],
      nextPhaseId: 'dificil',
      desc: '5 a 6 cores • 2 tubos vazios'
    },
    {
      id: 'dificil',
      name: 'Difícil',
      totalRounds: 12,
      colorRange: [7, 8],
      colorSplitRange: [5, 7],
      emptyRange: [2, 1],
      emptySplitRange: [7, 9],
      nextPhaseId: 'desafiador',
      desc: '7 a 8 cores • 1 a 2 tubos vazios'
    },
    {
      id: 'desafiador',
      name: 'Desafiador',
      totalRounds: 16,
      colorRange: [9, 10],
      colorSplitRange: [5, 8],
      emptyRange: [2, 1],
      emptySplitRange: [2, 4],
      nextPhaseId: null,
      desc: '9 a 10 cores • 1 a 2 tubos vazios'
    }
  ];

  // --- TUTORIAL ---
  const TUTORIAL_LESSONS: TutorialLesson[] = [
    {
      title: 'Lição 1: O básico do derramamento',
      tubes: [[0, 0], [0, 0], []],
      idealMoves: 1,
      steps: [
        {
          text: 'Toque no primeiro tubo para selecioná-lo (ele vai subir).',
          condition: (board, sel) => sel !== null || board.moves >= 1,
          highlightTube: () => 0
        },
        {
          text: 'Agora toque no segundo tubo (ou no vazio) para derramar o líquido.',
          condition: (board) => board.moves >= 1,
          highlightTube: (_board, sel) => (sel === 0 ? 1 : (sel === 1 ? 0 : 2))
        },
        {
          text: 'Muito bem! Agora junte os dois líquidos vermelhos no mesmo tubo.',
          condition: (board) => isGameWon(board.tubes),
          highlightTube: (board, sel) => {
            const nonEmpty: number[] = [];
            for (let i = 0; i < board.tubes.length; i++) {
              if (board.tubes[i].length > 0 && !isTubeComplete(board.tubes[i])) nonEmpty.push(i);
            }
            if (nonEmpty.length < 2) return null;
            return sel === null ? nonEmpty[0] : nonEmpty.find(i => i !== sel) ?? null;
          }
        }
      ]
    },
    {
      title: 'Lição 2: Só a mesma cor se mistura',
      tubes: [[1, 1, 0, 0], [0, 0, 1, 1], []],
      idealMoves: 3,
      steps: [
        {
          text: 'Toque no tubo com o topo vermelho para selecioná-lo.',
          condition: (board, sel) => sel === 0 || board.tubes[2].length > 0 || isGameWon(board.tubes),
          highlightTube: () => 0
        },
        {
          text: 'Você só pode derramar sobre a mesma cor ou em um tubo vazio. Toque no vazio!',
          condition: (board) => board.tubes[2].length > 0 || isGameWon(board.tubes),
          highlightTube: (_board, sel) => (sel === 0 || sel === 1 ? 2 : 0)
        },
        {
          text: 'Muito bem! Agora junte os cianos no mesmo tubo.',
          condition: (board) => isTubeComplete(board.tubes[0]) || isTubeComplete(board.tubes[1]) || isGameWon(board.tubes),
          highlightTube: (board, sel) => {
            const idxA = board.tubes.findIndex(t => t.length > 0 && t[t.length - 1] === 1);
            const idxB = board.tubes.findIndex((t, i) => i !== idxA && t.length > 0 && t[t.length - 1] === 1);
            if (idxA < 0 || idxB < 0) return null;
            return sel === idxB ? idxA : idxB;
          }
        },
        {
          text: 'Agora junte os vermelhos restantes para concluir!',
          condition: (board) => isGameWon(board.tubes),
          highlightTube: (board, sel) => {
            const reds: number[] = [];
            for (let i = 0; i < board.tubes.length; i++) {
              if (board.tubes[i].length > 0 && !isTubeComplete(board.tubes[i])) reds.push(i);
            }
            if (reds.length < 2) return null;
            return sel === null ? reds[0] : reds.find(i => i !== sel) ?? null;
          }
        }
      ]
    },
    {
      title: 'Lição 3: Complete um tubo',
      tubes: [[0, 0, 0], [1, 1, 1, 0], [1]],
      idealMoves: 2,
      steps: [
        {
          text: 'Um tubo fica completo com 4 líquidos da mesma cor. Complete o tubo vermelho!',
          condition: (board) => isTubeComplete(board.tubes[0]) || isGameWon(board.tubes),
          highlightTube: (_board, sel) => (sel === 1 ? 0 : 1)
        },
        {
          text: 'Show! Agora junte os cianos para completar o segundo tubo.',
          condition: (board) => isGameWon(board.tubes),
          highlightTube: (_board, sel) => (sel === 1 ? 2 : 1)
        }
      ]
    },
    {
      title: 'Lição 4: Evite becos sem saída',
      tubes: [[0, 1, 1, 1], [1, 0, 0, 0], []],
      idealMoves: 3,
      steps: [
        {
          text: 'Se o tubo de destino estiver cheio, use o tubo vazio como área de manobra!',
          condition: (board) => board.tubes[2].length > 0 || isGameWon(board.tubes),
          highlightTube: (_board, sel) => (sel === 0 || sel === 1 ? 2 : 0)
        },
        {
          text: 'Agora abriu espaço! Junte a cor que ficou isolada no tubo com espaço.',
          condition: (board) => board.tubes.some(isTubeComplete) || isGameWon(board.tubes),
          highlightTube: (board, sel) => {
            const target = board.tubes.findIndex(t => t.length === 1);
            if (target < 0) return null;
            const color = board.tubes[target][0];
            const source = board.tubes.findIndex((t, i) => i !== target && t.length === 4 && t[3] === color);
            if (source < 0) return null;
            return sel === source ? target : source;
          }
        },
        {
          text: 'Quase lá! Junte a última cor para vencer.',
          condition: (board) => isGameWon(board.tubes),
          highlightTube: (board, sel) => {
            const rem: number[] = [];
            for (let i = 0; i < board.tubes.length; i++) {
              if (board.tubes[i].length > 0 && !isTubeComplete(board.tubes[i])) rem.push(i);
            }
            if (rem.length < 2) return null;
            return sel === null ? rem[0] : rem.find(i => i !== sel) ?? null;
          }
        }
      ]
    },
    {
      title: 'Lição 5: Sua primeira vitória',
      tubes: [[0, 1, 1, 1], [1, 2, 2, 2], [2, 0, 0, 0], []],
      idealMoves: 4,
      steps: [
        {
          text: 'Agora é com você! Separe todas as 3 cores usando o tubo vazio. Você consegue!',
          condition: (board) => isGameWon(board.tubes),
          highlightTube: () => null
        }
      ]
    }
  ];

  function getPhaseDef(phaseId: string): PhaseDef {
    return PHASES.find(p => p.id === phaseId) || PHASES[0];
  }

  function randomSeedInt(): number {
    return (Math.floor(Math.random() * 0x7FFFFFFF) + 1) >>> 0;
  }

  function createDefaultPhaseData(): PhaseData {
    return {
      currentRound: 1,
      completedRounds: [],
      easyRounds: [],
      phaseCompleted: false,
      seed: randomSeedInt(),
      board: null
    };
  }

  let appState: AppState = {
    language: detectSystemLanguage(),
    activePhaseId: 'treinamento',
    bgmTrack: 'elevator',
    muted: false,
    sfxVolume: 50,
    bgmVolume: 50,
    visualMode: 'color',
    mysteryModeEnabled: true,
    hintDuration: 1,
    phases: {}
  };

  const t: typeof translate extends (lang: LangCode, key: infer K, vars?: infer V) => string
    ? (key: K, vars?: V) => string
    : never = (key, vars) => translate(appState.language, key, vars);

  function getLocalizedPhase(phaseId: string): { name: string; desc: string } {
    const dict = I18N[appState.language] || I18N.en;
    return dict.phases[phaseId as PhaseId] || { name: getPhaseDef(phaseId).name, desc: getPhaseDef(phaseId).desc };
  }

  function getLocalizedBgm(trackId: string): { name: string; desc: string } {
    const dict = I18N[appState.language] || I18N.en;
    return dict.bgmTracks[trackId as BgmId] || { name: BGM_TRACKS[trackId].name, desc: BGM_TRACKS[trackId].desc };
  }

  function getLocalizedVisualMode(modeId: VisualMode): { title: string; desc: string } {
    const dict = I18N[appState.language] || I18N.en;
    return dict.visualModes[modeId as VisualModeId];
  }

  let selectedIdx: number | null = null;
  let isAnimating = false;
  // TODO: REMOVER ANTES DO LANÇAMENTO — Estado temporário para forçar alerta/overlay de impasse via debug
  let isDebugDeadlockForced = false;
  let currentRowCounts: number[] = [];

  // Tube Complete Sequence Tracking
  let lastTubeCompleteTime = 0;
  let tubeCompleteStreak = 0;
  let victoryFxTimers: ReturnType<typeof setTimeout>[] = [];

  // DOM References
  const boardWrapEl = document.getElementById('board-wrap') as HTMLElement;
  const boardEl = document.getElementById('board') as HTMLElement;
  const btnPhases = document.getElementById('btn-phases') as HTMLButtonElement;
  const phaseDotEl = document.getElementById('phase-dot') as HTMLElement;
  const phaseNameEl = document.getElementById('phase-name') as HTMLElement;
  const roundNumEl = document.getElementById('round-num') as HTMLElement;
  const roundTotalEl = document.getElementById('round-total') as HTMLElement;

  const btnBgm = document.getElementById('btn-bgm') as HTMLButtonElement;
  const bgmEmojiEl = document.getElementById('bgm-emoji') as HTMLElement;
  const bgmLabelEl = document.getElementById('bgm-label') as HTMLElement;

  const btnLanguage = document.getElementById('btn-language') as HTMLButtonElement;
  const langFlagEl = document.getElementById('lang-flag') as HTMLElement;
  const langCodeEl = document.getElementById('lang-code') as HTMLElement;

  const movesNumEl = document.getElementById('moves-num') as HTMLElement;
  const idealMovesNumEl = document.getElementById('ideal-moves-num') as HTMLElement;
  const effNumEl = document.getElementById('eff-num') as HTMLElement;

  const tutorialTipEl = document.getElementById('tutorial-tip') as HTMLElement;
  const tutorialTipTitleEl = document.getElementById('tutorial-tip-title') as HTMLElement;
  const tutorialTipStepEl = document.getElementById('tutorial-tip-step') as HTMLElement;
  const tutorialTipTextEl = document.getElementById('tutorial-tip-text') as HTMLElement;

  const comboToastEl = document.getElementById('combo-toast') as HTMLElement;
  const deadlockBannerEl = document.getElementById('deadlock-banner') as HTMLElement;
  const deadlockTextEl = document.getElementById('deadlock-text') as HTMLElement;

  const btnUndo = document.getElementById('btn-undo') as HTMLButtonElement;
  const btnHint = document.getElementById('btn-hint') as HTMLButtonElement;
  const btnRestart = document.getElementById('btn-restart') as HTMLButtonElement;
  const btnExtra = document.getElementById('btn-extra') as HTMLButtonElement;
  const extraBadgeEl = document.getElementById('extra-badge') as HTMLElement;
  const btnSettings = document.getElementById('btn-settings') as HTMLButtonElement;
  const btnSound = document.getElementById('btn-sound') as HTMLButtonElement;
  const iconSoundOn = document.getElementById('icon-sound-on') as unknown as SVGSVGElement;
  const iconSoundOff = document.getElementById('icon-sound-off') as unknown as SVGSVGElement;
  const ambientCanvas = document.getElementById('ambient-canvas') as HTMLCanvasElement | null;
  const ambientCtx = ambientCanvas ? ambientCanvas.getContext('2d') : null;
  const hintSvg = document.getElementById('hint-svg') as unknown as SVGSVGElement | null;
  const pourSvg = document.getElementById('pour-svg') as unknown as SVGSVGElement;
  const fxCanvas = document.getElementById('fx-canvas') as HTMLCanvasElement;
  const fxCtx = fxCanvas.getContext('2d')!;
  const audioPourEl = document.getElementById('audio-pour') as HTMLAudioElement | null;
  const audioCompleteEl = document.getElementById('audio-complete') as HTMLAudioElement | null;
  const audioErrorEl = document.getElementById('audio-error') as HTMLAudioElement | null;

  const victoryModal = document.getElementById('victory-modal') as HTMLElement;
  const winEyebrowEl = document.getElementById('win-eyebrow') as HTMLElement;
  const winTitleEl = document.getElementById('win-title') as HTMLElement;
  const winSubtitleEl = document.getElementById('win-subtitle') as HTMLElement;
  const winMovesEl = document.getElementById('win-moves') as HTMLElement;
  const winIdealMovesEl = document.getElementById('win-ideal-moves') as HTMLElement;
  const winEffEl = document.getElementById('win-eff') as HTMLElement;
  const skipCalloutEl = document.getElementById('skip-callout') as HTMLElement;
  const skipCalloutTextEl = document.getElementById('skip-callout-text') as HTMLElement;
  const btnWinPrimary = document.getElementById('btn-win-primary') as HTMLButtonElement;
  const btnWinAdvance = document.getElementById('btn-win-advance') as HTMLButtonElement;
  const btnWinReplay = document.getElementById('btn-win-replay') as HTMLButtonElement;
  const btnWinPhases = document.getElementById('btn-win-phases') as HTMLButtonElement;

  const phasesModal = document.getElementById('phases-modal') as HTMLElement;
  const phaseListEl = document.getElementById('phase-list') as HTMLElement;
  const btnClosePhases = document.getElementById('btn-close-phases') as HTMLButtonElement;

  const bgmModal = document.getElementById('bgm-modal') as HTMLElement;
  const bgmListEl = document.getElementById('bgm-list') as HTMLElement;
  const btnCloseBgm = document.getElementById('btn-close-bgm') as HTMLButtonElement;

  const languageModal = document.getElementById('language-modal') as HTMLElement;
  const languageListEl = document.getElementById('language-list') as HTMLElement;
  const btnCloseLanguage = document.getElementById('btn-close-language') as HTMLButtonElement;

  const settingsModal = document.getElementById('settings-modal') as HTMLElement;
  const settingsTrackEl = document.getElementById('settings-track') as HTMLElement | null;
  const settingsPaneMainEl = document.getElementById('settings-pane-main') as HTMLElement | null;
  const settingsPaneSubEl = document.getElementById('settings-pane-sub') as HTMLElement | null;
  const btnSettingsBack = document.getElementById('btn-settings-back') as HTMLButtonElement | null;
  const settingsSubmenuTitleEl = document.getElementById('settings-submenu-title') as HTMLElement | null;
  const settingsSummaryVisualEl = document.getElementById('settings-summary-visual') as HTMLElement | null;
  const settingsSummaryGameplayEl = document.getElementById('settings-summary-gameplay') as HTMLElement | null;
  const settingsSummaryAudioEl = document.getElementById('settings-summary-audio') as HTMLElement | null;
  const settingsSummaryDataEl = document.getElementById('settings-summary-data') as HTMLElement | null;
  const settingsCatBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-settings-cat]'));
  const settingsSubpanels = Array.from(document.querySelectorAll<HTMLElement>('[data-subpanel]'));
  const settingsListEl = document.getElementById('settings-list') as HTMLElement;
  const toggleMysteryMode = document.getElementById('toggle-mystery-mode') as HTMLInputElement | null;
  const sliderHintDuration = document.getElementById('slider-hint-duration') as HTMLInputElement | null;
  const hintDurationValueEl = document.getElementById('hint-duration-value') as HTMLElement | null;
  const sliderSfxVolume = document.getElementById('slider-sfx-volume') as HTMLInputElement | null;
  const sfxVolumeValueEl = document.getElementById('sfx-volume-value') as HTMLElement | null;
  const sliderBgmVolume = document.getElementById('slider-bgm-volume') as HTMLInputElement | null;
  const bgmVolumeValueEl = document.getElementById('bgm-volume-value') as HTMLElement | null;
  const btnResetAllProgress = document.getElementById('btn-reset-all-progress') as HTMLButtonElement | null;
  const btnCloseSettings = document.getElementById('btn-close-settings') as HTMLButtonElement;

  const confirmModal = document.getElementById('confirm-modal') as HTMLElement;
  const btnCancelRestart = document.getElementById('btn-cancel-restart') as HTMLButtonElement;
  const btnConfirmRestart = document.getElementById('btn-confirm-restart') as HTMLButtonElement;

  const resetConfirm1Modal = document.getElementById('reset-confirm-1-modal') as HTMLElement | null;
  const btnResetCancel1 = document.getElementById('btn-reset-cancel-1') as HTMLButtonElement | null;
  const btnResetNext1 = document.getElementById('btn-reset-next-1') as HTMLButtonElement | null;
  const resetConfirm2Modal = document.getElementById('reset-confirm-2-modal') as HTMLElement | null;
  const btnResetCancel2 = document.getElementById('btn-reset-cancel-2') as HTMLButtonElement | null;
  const btnResetConfirm2 = document.getElementById('btn-reset-confirm-2') as HTMLButtonElement | null;

  const stuckModal = document.getElementById('stuck-modal') as HTMLElement;
  const btnStuckUndo = document.getElementById('btn-stuck-undo') as HTMLButtonElement;
  const btnStuckExtra = document.getElementById('btn-stuck-extra') as HTMLButtonElement | null;
  const btnStuckRestart = document.getElementById('btn-stuck-restart') as HTMLButtonElement;
  // TODO: REMOVER ANTES DO LANÇAMENTO
  const btnDebugDeadlock = document.getElementById('btn-debug-deadlock') as HTMLButtonElement | null;

  function applyStaticTranslations() {
    const meta = SUPPORTED_LANGUAGES[appState.language] || SUPPORTED_LANGUAGES.en;
    document.documentElement.lang = meta.bcp47;
    document.documentElement.dir = meta.rtl ? 'rtl' : 'ltr';

    langFlagEl.innerHTML = meta.flagSvg;
    langCodeEl.textContent = meta.shortCode;

    btnPhases.setAttribute('aria-label', t('ariaSelectPhase'));
    btnBgm.setAttribute('aria-label', t('ariaSelectBgm'));
    btnBgm.setAttribute('title', t('titleBgm'));
    btnLanguage.setAttribute('aria-label', t('ariaLanguage'));
    btnLanguage.setAttribute('title', t('titleLanguage'));
    btnSettings.setAttribute('aria-label', t('ariaSettings'));
    btnSettings.setAttribute('title', t('titleSettings'));
    btnSound.setAttribute('aria-label', t('ariaSound'));
    btnSound.setAttribute('title', t('titleSound'));

    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n as Parameters<typeof t>[0] | undefined;
      if (key) {
        el.textContent = t(key);
      }
    });
    syncHintSettingsUI();
  }

  function activePhaseDef(): PhaseDef {
    return getPhaseDef(appState.activePhaseId);
  }

  function activePhaseData(): PhaseData {
    return appState.phases[appState.activePhaseId];
  }

  function activeBoard(): BoardState {
    return activePhaseData().board!;
  }

  // =========================================================
  // --- BGM TRACKS --- Procedural Web Audio Synthesizer
  // =========================================================
  let audioCtx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let bgmGain: GainNode | null = null;
  let bgmSidechainGain: GainNode | null = null;
  let sfxGain: GainNode | null = null;
  let sfxVolume = 0.5;
  let bgmVolume = 0.5;
  let reverbNode: ConvolverNode | null = null;
  let sharedNoiseBuffer: AudioBuffer | null = null;

  let bgmTimerId: ReturnType<typeof setInterval> | null = null;
  let bgmNextNoteTime = 0;
  let bgmCurrentStep = 0;
  let bgmTotalStep = 0;
  let nextCosmicStarStep = 32;

  // Track 1: Calma (Lo-fi Ambient, Am - F - C - G)
  const CALM_CHORDS = [
    { bass: 110.00, pad: [220.00, 261.63, 329.63], bell: 659.25 }, // Am
    { bass: 87.31,  pad: [174.61, 220.00, 261.63], bell: 523.25 }, // F
    { bass: 130.81, pad: [261.63, 329.63, 392.00], bell: 783.99 }, // C
    { bass: 98.00,  pad: [196.00, 246.94, 293.66], bell: 587.33 }  // G
  ];

  function scheduleCalmStep(step: number, time: number) {
    const bar = Math.floor(step / 16) % 4;
    const beatStep = step % 16;
    const chord = CALM_CHORDS[bar];

    // Long warm ambient pad on bar start (1 full bar)
    if (beatStep === 0) {
      scheduleBassNote(chord.bass, time, 1.9, 0.042, 'sine');
      chord.pad.forEach(freq => {
        scheduleAmbientPad(freq, time, 3.1, 0.022);
      });
    }

    // Gentle distant bell note on beats 2 and 4
    if (beatStep === 4 || beatStep === 12) {
      const f = beatStep === 4 ? chord.bell : chord.bell * 0.75;
      scheduleAmbientBell(f, time, 1.1, 0.018);
    }

    // Very subtle shaker once every 2 bars
    if (beatStep === 0 && (bar === 0 || bar === 2)) {
      scheduleShaker(time, 0.007, 4200);
    }
  }

  // Track 2: Elevador (Bossa Nova / Jazz Leve, Cmaj7 - Am7 - Dm7 - G7)
  const ELEVATOR_CHORDS: Array<{
    walk: number[];
    seventh: number[];
    mel: Record<number, number>;
  }> = [
    { walk: [130.81, 164.81, 196.00, 220.00], seventh: [261.63, 329.63, 392.00, 493.88], mel: { 0: 523.25, 3: 659.25, 6: 783.99, 8: 659.25, 11: 880.00, 14: 783.99 } }, // Cmaj7
    { walk: [110.00, 130.81, 164.81, 196.00], seventh: [220.00, 261.63, 329.63, 392.00], mel: { 0: 659.25, 3: 880.00, 6: 1046.50, 8: 880.00, 11: 783.99, 14: 659.25 } }, // Am7
    { walk: [146.83, 174.61, 220.00, 261.63], seventh: [293.66, 349.23, 440.00, 523.25], mel: { 0: 587.33, 3: 698.46, 6: 880.00, 8: 783.99, 11: 698.46, 14: 587.33 } }, // Dm7
    { walk: [98.00,  123.47, 146.83, 174.61], seventh: [246.94, 293.66, 349.23, 392.00], mel: { 0: 587.33, 3: 783.99, 6: 987.77, 8: 880.00, 11: 783.99, 14: 587.33 } }  // G7
  ];

  function scheduleElevatorStep(step: number, time: number) {
    const bar = Math.floor(step / 16) % 4;
    const beatStep = step % 16;
    const chord = ELEVATOR_CHORDS[bar];

    // Tropical marimba melody
    const noteFreq = chord.mel[beatStep];
    if (noteFreq) {
      scheduleMarimbaNote(noteFreq, time, 0.22, 0.044);
    }

    // Smooth walking bass on quarter notes (0, 4, 8, 12)
    if (beatStep % 4 === 0) {
      const walkFreq = chord.walk[beatStep / 4];
      scheduleBassNote(walkFreq, time, 0.34, 0.055, 'triangle');
    }

    // Warm 7th chord bossa stabs (steps 0 and 6)
    if (beatStep === 0 || beatStep === 6) {
      chord.seventh.forEach(freq => {
        scheduleSoftChordNote(freq, time, beatStep === 0 ? 0.36 : 0.24, 0.014);
      });
    }

    // Light bossa swing on offbeat shakers
    if (beatStep % 2 === 1) {
      const swingOffset = 0.018;
      scheduleShaker(time + swingOffset, beatStep % 4 === 3 ? 0.015 : 0.009, 5600);
    } else if (beatStep === 0 || beatStep === 8) {
      scheduleKick(time, 0.042);
    }
  }

  // Track 3: Agitada (Energetic Electronic/Arcade, Am - F - C - G)
  const ENERGETIC_PROGRESSION = [
    { bass: 110.00, arp: [220.00, 261.63, 329.63, 440.00] }, // Am
    { bass: 87.31,  arp: [174.61, 220.00, 261.63, 349.23] }, // F
    { bass: 130.81, arp: [261.63, 329.63, 392.00, 523.25] }, // C
    { bass: 98.00,  arp: [196.00, 246.94, 293.66, 392.00] }  // G
  ];

  function scheduleEnergeticStep(step: number, time: number) {
    const bar = Math.floor(step / 16) % 4;
    const beatStep = step % 16;
    const chord = ENERGETIC_PROGRESSION[bar];

    // 4/4 Kick + simple sidechain pump on bgmSidechainGain
    if (beatStep % 4 === 0) {
      scheduleKick(time, 0.085);
      if (bgmSidechainGain) {
        bgmSidechainGain.gain.cancelScheduledValues(time);
        bgmSidechainGain.gain.setValueAtTime(0.42, time);
        bgmSidechainGain.gain.linearRampToValueAtTime(1.0, time + 0.11);
      }
    }

    // Hi-hat on 8th notes
    if (beatStep % 2 === 0) {
      scheduleShaker(time, beatStep % 4 === 2 ? 0.024 : 0.012, 7600);
    }

    // Filtered sawtooth bass groove (8th-note driving pattern)
    if (beatStep % 2 === 0) {
      const octaveBoost = beatStep % 4 === 2 ? 2 : 1;
      scheduleFilteredSawBass(chord.bass * octaveBoost, time, 0.11, 0.045);
    }

    // Alternating-octave 16th-note arcade arpeggio
    const arpIdx = beatStep % 4;
    const octaveMult = (Math.floor(beatStep / 4) % 2 === 1) ? 2 : 1;
    const arpFreq = chord.arp[arpIdx] * octaveMult;
    scheduleArcadeArp(arpFreq, time, 0.095, 0.025, beatStep % 2 === 0 ? 'square' : 'sawtooth');
  }

  // Track 4: Fluida (Chillwave / synthwave suave, F - G - Am - Em)
  const FLUID_PROGRESSION = [
    { bass: 87.31,  pad: [174.61, 220.00, 261.63], lead: [523.25, 440.00] }, // F
    { bass: 98.00,  pad: [196.00, 246.94, 293.66], lead: [587.33, 493.88] }, // G
    { bass: 110.00, pad: [220.00, 261.63, 329.63], lead: [659.25, 523.25] }, // Am
    { bass: 82.41,  pad: [164.81, 196.00, 246.94], lead: [493.88, 392.00] }  // Em
  ];

  function scheduleFluidStep(step: number, time: number) {
    const bar = Math.floor(step / 16) % 4;
    const beatStep = step % 16;
    const chord = FLUID_PROGRESSION[bar];

    if (beatStep === 0) {
      scheduleBassNote(chord.bass, time, 1.45, 0.048, 'triangle');
      chord.pad.forEach(freq => {
        scheduleFilteredSawPad(freq, time, 2.5, 0.015, 1200);
      });
    }

    if (beatStep % 4 === 2) {
      scheduleShaker(time, 0.011, 5400);
    }

    if (beatStep === 4 || beatStep === 12) {
      const f = beatStep === 4 ? chord.lead[0] : chord.lead[1];
      scheduleDelayLead(f, time, 0.24, 0.026);
    }
  }

  // Track 5: Clássica (Piano / quarteto barroco, C - Am - F - G)
  const CLASSICAL_PROGRESSION = [
    { bass: 130.81, arp: [261.63, 329.63, 392.00, 523.25], violin: { 0: 659.25, 6: 587.33, 10: 523.25 } as Record<number, number> }, // C
    { bass: 110.00, arp: [220.00, 261.63, 329.63, 440.00], violin: { 0: 523.25, 6: 659.25, 10: 440.00 } as Record<number, number> }, // Am
    { bass: 87.31,  arp: [174.61, 220.00, 261.63, 349.23], violin: { 0: 587.33, 6: 523.25, 10: 440.00 } as Record<number, number> }, // F
    { bass: 98.00,  arp: [196.00, 246.94, 293.66, 392.00], violin: { 0: 587.33, 6: 493.88, 10: 392.00 } as Record<number, number> }  // G
  ];

  function scheduleClassicalStep(step: number, time: number) {
    const bar = Math.floor(step / 16) % 4;
    const beatStep = step % 16;
    const chord = CLASSICAL_PROGRESSION[bar];

    if (beatStep === 0) {
      scheduleBassNote(chord.bass, time, 1.4, 0.046, 'triangle');
    }

    if (beatStep % 2 === 0) {
      const idx = (beatStep / 2) % 4;
      const order = [0, 1, 2, 3];
      const freq = chord.arp[order[idx]];
      scheduleSoftChordNote(freq, time, 0.34, 0.028);
    }

    const vFreq = chord.violin[beatStep];
    if (vFreq) {
      scheduleViolinNote(vFreq, time, 0.55, 0.032);
    }
  }

  // Track 6: Percussiva (World music / tribal orgânico, pentatônica de Lá menor)
  const PERCUSSIVE_BASS = [110.00, 130.81, 146.83, 164.81, 196.00];

  function schedulePercussiveStep(step: number, time: number) {
    const bar = Math.floor(step / 16) % 4;
    const beatStep = step % 16;

    if (beatStep === 0 || beatStep === 8) {
      scheduleKick(time, 0.068);
    }

    if (beatStep === 3) scheduleTom(180, 95, time, 0.14, 0.048);
    if (beatStep === 6) scheduleTom(140, 72, time, 0.15, 0.045);
    if (beatStep === 10) scheduleTom(160, 82, time, 0.14, 0.046);
    if (beatStep === 14) scheduleTom(115, 62, time, 0.16, 0.048);

    const shakerVol = beatStep % 4 === 0 ? 0.022 : (beatStep % 2 === 0 ? 0.013 : 0.008);
    scheduleShaker(time, shakerVol, 5200);

    if (beatStep === 4 || beatStep === 12 || (bar % 2 === 1 && beatStep === 14)) {
      scheduleClap(time, 0.032);
    }

    if (beatStep === 0 || beatStep === 6 || beatStep === 10) {
      const noteIdx = (bar * 2 + Math.floor(beatStep / 4)) % PERCUSSIVE_BASS.length;
      scheduleBassNote(PERCUSSIVE_BASS[noteIdx], time, 0.32, 0.052, 'triangle');
    }
  }

  // Track 7: 8-Bit (Chiptune / retro game, Am - F - C - G)
  const CHIPTUNE_PROGRESSION = [
    { bass: 110.00, arp: [220.00, 261.63, 329.63, 440.00], mel: { 0: 659.25, 4: 523.25, 8: 587.33, 12: 659.25 } as Record<number, number> },
    { bass: 87.31,  arp: [174.61, 220.00, 261.63, 349.23], mel: { 0: 698.46, 4: 587.33, 8: 523.25, 12: 698.46 } as Record<number, number> },
    { bass: 130.81, arp: [261.63, 329.63, 392.00, 523.25], mel: { 0: 783.99, 4: 659.25, 8: 523.25, 12: 783.99 } as Record<number, number> },
    { bass: 98.00,  arp: [196.00, 246.94, 293.66, 392.00], mel: { 0: 783.99, 4: 587.33, 8: 493.88, 12: 587.33 } as Record<number, number> }
  ];

  function scheduleChiptuneStep(step: number, time: number) {
    const bar = Math.floor(step / 16) % 4;
    const beatStep = step % 16;
    const chord = CHIPTUNE_PROGRESSION[bar];

    if (beatStep % 2 === 0) {
      const oct = beatStep % 4 === 2 ? 2 : 1;
      scheduleBassNote(chord.bass * oct, time, 0.14, 0.044, 'triangle');
    } else {
      scheduleShaker(time, 0.014, 6000);
    }

    const arpFreq = chord.arp[beatStep % 4];
    schedulePureSquareNote(arpFreq, time, 0.085, 0.018);

    const melFreq = chord.mel[beatStep];
    if (melFreq) {
      schedulePureSquareNote(melFreq, time, 0.16, 0.024);
    }
  }

  // Track 8: Cósmica (Ambient espacial / drone)
  const COSMIC_PADS = [
    [110.00, 164.81, 261.63],
    [87.31,  130.81, 220.00]
  ];

  function scheduleCosmicStep(step: number, time: number) {
    const bar = Math.floor(step / 16) % 4;
    const beatStep = step % 16;

    // Continuous 55 Hz + 110 Hz sine drone crossfaded every bar (4.0s at 60 BPM)
    if (beatStep === 0) {
      scheduleDroneTone(55, time, 4.35, 0.028);
      scheduleDroneTone(110, time, 4.35, 0.016);
    }

    // Slow LFO-modulated triangle pads every 2 bars
    if (beatStep === 0 && (bar === 0 || bar === 2)) {
      const freqs = COSMIC_PADS[bar === 0 ? 0 : 1];
      freqs.forEach(freq => {
        scheduleCosmicLfoPad(freq, time, 7.6, 0.02);
      });
    }

    // Sparse high sine stars every 4–8 bars (64–128 steps)
    if (bgmTotalStep >= nextCosmicStarStep) {
      const starFreq = 1500 + Math.random() * 1500;
      scheduleAmbientBell(starFreq, time, 0.9, 0.016);
      nextCosmicStarStep = bgmTotalStep + 64 + Math.floor(Math.random() * 64);
    }
  }

  // Track 9: Enérgica (Drum'n'bass / breakbeat, Am - F - C - G)
  const DNB_PROGRESSION = [
    { bass: 110.00, lead: 440.00 },
    { bass: 87.31,  lead: 523.25 },
    { bass: 130.81, lead: 659.25 },
    { bass: 98.00,  lead: 587.33 }
  ];

  function scheduleDnbStep(step: number, time: number) {
    const bar = Math.floor(step / 16) % 4;
    const beatStep = step % 16;
    const chord = DNB_PROGRESSION[bar];

    // Kick on 1 & 3
    if (beatStep === 0 || beatStep === 8) {
      scheduleKick(time, 0.072);
    }

    // Snare on 2 & 4 (bandpass ~2kHz noise + 180Hz triangle body)
    if (beatStep === 4 || beatStep === 12) {
      scheduleDnbSnare(time, 0.042);
    }

    // 16th hi-hat with accent variation
    const hatVol = beatStep % 4 === 2 ? 0.018 : (beatStep % 2 === 0 ? 0.011 : 0.007);
    scheduleShaker(time, hatVol, 6800);

    // Syncopated filtered sawtooth bass (lowpass ~400 Hz)
    if (beatStep === 0 || beatStep === 3 || beatStep === 6 || beatStep === 10 || beatStep === 14) {
      scheduleDnbBass(chord.bass, time, 0.14, 0.048);
    }

    // Sparse square lead
    if (beatStep === 0 || (bar % 2 === 1 && beatStep === 10)) {
      scheduleArcadeArp(chord.lead, time, 0.16, 0.018, 'square');
    }
  }

  // Track 10: Orgânica (Folk / acústico leve, G - D - Em - C)
  const ORGANIC_PROGRESSION = [
    { bass: 98.00,  arp: [196.00, 246.94, 293.66, 392.00] }, // G
    { bass: 73.42,  arp: [146.83, 220.00, 293.66, 369.99] }, // D
    { bass: 82.41,  arp: [164.81, 246.94, 329.63, 392.00] }, // Em
    { bass: 130.81, arp: [130.81, 196.00, 261.63, 329.63] }  // C
  ];

  function scheduleOrganicStep(step: number, time: number) {
    const bar = Math.floor(step / 16) % 4;
    const beatStep = step % 16;
    const chord = ORGANIC_PROGRESSION[bar];

    if (beatStep === 0) {
      scheduleBassNote(chord.bass, time, 1.15, 0.048, 'sine');
    }

    if (beatStep % 2 === 0) {
      const pattern = [0, 1, 2, 3, 2, 1, 3, 2];
      const noteFreq = chord.arp[pattern[(beatStep / 2) % pattern.length]];
      scheduleGuitarPluck(noteFreq, time, 0.36, 0.032);
    }

    // Acoustic guitar body tap on beats 2 & 4
    if (beatStep === 4 || beatStep === 12) {
      scheduleWoodTap(time, 0.05);
    }
  }

  const BGM_TRACKS: Record<string, BgmTrackDef> = {
    calm: {
      id: 'calm',
      name: 'Calma',
      icon: '🌙',
      desc: 'Ambiente lo-fi relaxante com pad suave e reverb',
      bpm: 72,
      stepDuration: 60 / 72 / 4,
      schedule: scheduleCalmStep
    },
    elevator: {
      id: 'elevator',
      name: 'Elevador',
      icon: '🛗',
      desc: 'Jazz leve / bossa nova com marimba e swing suave',
      bpm: 100,
      stepDuration: 60 / 100 / 4,
      schedule: scheduleElevatorStep
    },
    energetic: {
      id: 'energetic',
      name: 'Agitada',
      icon: '⚡',
      desc: 'Eletrônico arcade animado com kick 4/4 e arpejos',
      bpm: 132,
      stepDuration: 60 / 132 / 4,
      schedule: scheduleEnergeticStep
    },
    fluid: {
      id: 'fluid',
      name: 'Fluida',
      icon: '🌊',
      desc: 'Chillwave / synthwave suave em clima de oceano noturno',
      bpm: 88,
      stepDuration: 60 / 88 / 4,
      schedule: scheduleFluidStep
    },
    classical: {
      id: 'classical',
      name: 'Clássica',
      icon: '🎹',
      desc: 'Piano e cordas barrocas em clima de minueto',
      bpm: 84,
      stepDuration: 60 / 84 / 4,
      schedule: scheduleClassicalStep
    },
    percussive: {
      id: 'percussive',
      name: 'Percussiva',
      icon: '🥁',
      desc: 'World music tribal com toms, palmas e pentatônica',
      bpm: 106,
      stepDuration: 60 / 106 / 4,
      schedule: schedulePercussiveStep
    },
    chiptune: {
      id: 'chiptune',
      name: '8-Bit',
      icon: '🎮',
      desc: 'Chiptune retrô com ondas square puras e arpejos rápidos',
      bpm: 126,
      stepDuration: 60 / 126 / 4,
      schedule: scheduleChiptuneStep
    },
    cosmic: {
      id: 'cosmic',
      name: 'Cósmica',
      icon: '🌌',
      desc: 'Ambient espacial com drone grave, LFO lento e estrelas',
      bpm: 60,
      stepDuration: 60 / 60 / 4,
      schedule: scheduleCosmicStep
    },
    dnb: {
      id: 'dnb',
      name: 'Enérgica',
      icon: '🔥',
      desc: 'Drum\'n\'bass veloz com breakbeat e baixo sincopado',
      bpm: 165,
      stepDuration: 60 / 165 / 4,
      schedule: scheduleDnbStep
    },
    organic: {
      id: 'organic',
      name: 'Orgânica',
      icon: '🍃',
      desc: 'Violão folk dedilhado com batida leve de madeira',
      bpm: 96,
      stepDuration: 60 / 96 / 4,
      schedule: scheduleOrganicStep
    }
  };

  function createAmbientReverb(ctx: AudioContext): ConvolverNode {
    const len = Math.floor(ctx.sampleRate * 0.9);
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let smooth = 0;
      for (let i = 0; i < len; i++) {
        const decay = Math.pow(1 - i / len, 2.5);
        const raw = (Math.random() * 2 - 1) * decay * 0.38;
        smooth = smooth * 0.6 + raw * 0.4;
        data[i] = smooth;
      }
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  function initAudioGraph(): boolean {
    if (audioCtx) return true;
    const win = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctx = win.AudioContext || win.webkitAudioContext;
    if (!Ctx) return false;
    audioCtx = new Ctx();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = appState.muted ? 0 : 1;
    masterGain.connect(audioCtx.destination);

    bgmGain = audioCtx.createGain();
    bgmGain.gain.value = appState.muted ? 0 : bgmVolume;
    bgmGain.connect(masterGain);

    const bgmNormalizeGain = audioCtx.createGain();
    bgmNormalizeGain.gain.value = 0.82;
    bgmNormalizeGain.connect(bgmGain);

    bgmSidechainGain = audioCtx.createGain();
    bgmSidechainGain.gain.value = 1;
    bgmSidechainGain.connect(bgmNormalizeGain);

    reverbNode = createAmbientReverb(audioCtx);
    const reverbReturn = audioCtx.createGain();
    reverbReturn.gain.value = 0.55;
    reverbNode.connect(reverbReturn);
    reverbReturn.connect(bgmSidechainGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = appState.muted ? 0 : sfxVolume;
    sfxGain.connect(masterGain);

    const len = audioCtx.sampleRate;
    sharedNoiseBuffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = sharedNoiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return true;
  }

  function ensureAudio(): AudioContext | null {
    if (appState.muted) return null;
    if (!initAudioGraph() || !audioCtx) return null;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    if (masterGain) {
      masterGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.02);
    }
    if (!bgmTimerId && !document.hidden) {
      startBgm();
    }
    return audioCtx;
  }

  function scheduleAmbientPad(freq: number, time: number, dur: number, vol: number) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.35);
    gain.gain.setValueAtTime(vol * 0.85, time + dur - 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bgmSidechainGain);
    if (reverbNode) gain.connect(reverbNode);

    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  function scheduleAmbientBell(freq: number, time: number, dur: number, vol: number) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(gain);
    gain.connect(bgmSidechainGain);
    if (reverbNode) gain.connect(reverbNode);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  function scheduleSoftChordNote(freq: number, time: number, dur: number, vol: number) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bgmSidechainGain);
    osc.start(time);
    osc.stop(time + dur + 0.03);
  }

  function scheduleMarimbaNote(freq: number, time: number, dur = 0.2, vol = 0.05) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 4, time);
    const harmGain = audioCtx.createGain();
    harmGain.gain.setValueAtTime(0.18, time);
    harmGain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc1.connect(gain);
    osc2.connect(harmGain);
    harmGain.connect(gain);
    gain.connect(bgmSidechainGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + dur + 0.02);
    osc2.stop(time + dur + 0.02);
  }

  function scheduleBassNote(freq: number, time: number, dur = 0.28, vol = 0.055, type: OscillatorType = 'triangle') {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(360, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bgmSidechainGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  function scheduleFilteredSawBass(freq: number, time: number, dur: number, vol: number) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(3.2, time);
    filter.frequency.setValueAtTime(920, time);
    filter.frequency.exponentialRampToValueAtTime(170, time + dur);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bgmSidechainGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  function scheduleArcadeArp(freq: number, time: number, dur: number, vol: number, type: OscillatorType = 'square') {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bgmSidechainGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  function scheduleKick(time: number, vol = 0.05) {
    if (!audioCtx || !bgmGain) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(132, time);
    osc.frequency.exponentialRampToValueAtTime(46, time + 0.085);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.095);
    osc.connect(gain);
    gain.connect(bgmGain); // Kick stays un-ducked
    osc.start(time);
    osc.stop(time + 0.11);
  }

  function scheduleShaker(time: number, vol = 0.014, cutoff = 5800) {
    if (!audioCtx || !bgmSidechainGain || !sharedNoiseBuffer) return;
    const src = audioCtx.createBufferSource();
    src.buffer = sharedNoiseBuffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(cutoff, time);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(bgmSidechainGain);
    src.start(time, Math.random() * 0.5, 0.05);
  }

  function scheduleFilteredSawPad(freq: number, time: number, dur: number, vol: number, cutoff = 1200) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.32);
    gain.gain.setValueAtTime(vol * 0.85, time + dur - 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bgmSidechainGain);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  function scheduleDelayLead(freq: number, time: number, dur: number, vol: number) {
    if (!audioCtx || !bgmSidechainGain) return;
    [0, 0.28, 0.56].forEach((offset, idx) => {
      const t = time + offset;
      const v = vol * Math.pow(0.45, idx);
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(v, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(bgmSidechainGain!);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    });
  }

  function scheduleViolinNote(freq: number, time: number, dur: number, vol: number) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.09);
    gain.gain.setValueAtTime(vol * 0.85, time + dur - 0.14);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(bgmSidechainGain);
    osc.start(time);
    osc.stop(time + dur + 0.04);
  }

  function scheduleTom(startFreq: number, endFreq: number, time: number, dur: number, vol: number) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + dur * 0.75);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(bgmSidechainGain);
    osc.start(time);
    osc.stop(time + dur + 0.03);
  }

  function scheduleClap(time: number, vol = 0.032) {
    if (!audioCtx || !bgmSidechainGain || !sharedNoiseBuffer) return;
    const src = audioCtx.createBufferSource();
    src.buffer = sharedNoiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, time);
    filter.Q.setValueAtTime(1.8, time);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bgmSidechainGain);
    src.start(time, Math.random() * 0.4, 0.1);
  }

  function schedulePureSquareNote(freq: number, time: number, dur: number, vol: number) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(bgmSidechainGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  function scheduleDroneTone(freq: number, time: number, dur: number, vol: number) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.35);
    gain.gain.setValueAtTime(vol, time + dur - 0.45);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(bgmSidechainGain);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  function scheduleCosmicLfoPad(freq: number, time: number, dur: number, vol: number) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(620, time);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, time);
    lfoGain.gain.setValueAtTime(260, time);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.9);
    gain.gain.setValueAtTime(vol * 0.85, time + dur - 1.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bgmSidechainGain);
    if (reverbNode) gain.connect(reverbNode);

    lfo.start(time);
    osc.start(time);
    lfo.stop(time + dur + 0.06);
    osc.stop(time + dur + 0.06);
  }

  function scheduleDnbSnare(time: number, vol = 0.042) {
    if (!audioCtx || !bgmSidechainGain) return;
    if (sharedNoiseBuffer) {
      const src = audioCtx.createBufferSource();
      src.buffer = sharedNoiseBuffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2000, time);
      filter.Q.setValueAtTime(1.2, time);
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.11);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(bgmSidechainGain);
      src.start(time, Math.random() * 0.3, 0.12);
    }

    const body = audioCtx.createOscillator();
    const bodyGain = audioCtx.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(180, time);
    body.frequency.exponentialRampToValueAtTime(110, time + 0.07);
    bodyGain.gain.setValueAtTime(vol * 0.75, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
    body.connect(bodyGain);
    bodyGain.connect(bgmSidechainGain);
    body.start(time);
    body.stop(time + 0.09);
  }

  function scheduleDnbBass(freq: number, time: number, dur: number, vol: number) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bgmSidechainGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  function scheduleGuitarPluck(freq: number, time: number, dur: number, vol: number) {
    if (!audioCtx || !bgmSidechainGain) return;
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, time);
    filter.frequency.exponentialRampToValueAtTime(520, time + dur);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bgmSidechainGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  function scheduleWoodTap(time: number, vol = 0.05) {
    if (!audioCtx || !bgmSidechainGain || !sharedNoiseBuffer) return;
    const src = audioCtx.createBufferSource();
    src.buffer = sharedNoiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, time);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bgmSidechainGain);
    src.start(time, Math.random() * 0.4, 0.07);
  }

  function getCurrentBgmTrack(): BgmTrackDef {
    return BGM_TRACKS[appState.bgmTrack] || BGM_TRACKS.elevator;
  }

  function bgmSchedulerTick() {
    if (!audioCtx || appState.muted || document.hidden) return;
    const track = getCurrentBgmTrack();
    const lookahead = 0.12;
    while (bgmNextNoteTime < audioCtx.currentTime + lookahead) {
      track.schedule(bgmCurrentStep, bgmNextNoteTime);
      bgmNextNoteTime += track.stepDuration;
      bgmCurrentStep = (bgmCurrentStep + 1) % 64;
      bgmTotalStep++;
    }
  }

  function startBgm() {
    if (!audioCtx || appState.muted || bgmTimerId) return;
    if (bgmSidechainGain) {
      bgmSidechainGain.gain.cancelScheduledValues(audioCtx.currentTime);
      bgmSidechainGain.gain.setValueAtTime(1, audioCtx.currentTime);
    }
    bgmNextNoteTime = audioCtx.currentTime + 0.05;
    bgmTimerId = setInterval(bgmSchedulerTick, 30);
  }

  function stopBgm() {
    if (bgmTimerId) {
      clearInterval(bgmTimerId);
      bgmTimerId = null;
    }
  }

  function duckBgm(durationSec = 1.6) {
    if (!audioCtx || !bgmGain || appState.muted) return;
    const now = audioCtx.currentTime;
    const duckedLevel = bgmVolume * 0.22;
    bgmGain.gain.cancelScheduledValues(now);
    bgmGain.gain.setTargetAtTime(duckedLevel, now, 0.04);
    bgmGain.gain.setTargetAtTime(bgmVolume, now + durationSec, 0.35);
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopAmbientLoop();
      stopBgm();
      if (audioCtx && audioCtx.state === 'running') {
        audioCtx.suspend().catch(() => {});
      }
    } else {
      startAmbientLoop();
      if (!appState.muted && audioCtx) {
        audioCtx.resume().then(() => startBgm()).catch(() => {});
      }
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  function playSelectSound() {
    const ctx = ensureAudio();
    if (!ctx || !sfxGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.055);
    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  function playAudioTagOrFallback(el: HTMLAudioElement | null, fallback: () => void) {
    if (appState.muted) return;
    if (el && !el.error && el.networkState !== HTMLMediaElement.NETWORK_NO_SOURCE) {
      try {
        el.volume = sfxVolume;
        el.currentTime = 0;
        const playPromise = el.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            fallback();
          });
        }
        return;
      } catch {
        // Fallback to procedural Web Audio synth
      }
    }
    fallback();
  }

  function playErrorSound() {
    playAudioTagOrFallback(audioErrorEl, () => {
      const ctx = ensureAudio();
      if (!ctx || !sfxGain) return;
      const now = ctx.currentTime;
      // Opção A: Buzz duplo de negação (square filtrado em lowpass 900 Hz)
      [200, 140].forEach((freq, idx) => {
        const t = now + idx * 0.135; // 0.09s pulso + 0.045s intervalo
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, t);
        filter.Q.setValueAtTime(0.7, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.10, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain!);
        osc.start(t);
        osc.stop(t + 0.095);
      });
    });
  }

  function playDeadlockSound() {
    const ctx = ensureAudio();
    if (!ctx || !sfxGain) return;
    const now = ctx.currentTime;
    [330, 261.63, 220].forEach((freq, idx) => {
      const t = now + idx * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(sfxGain!);
      osc.start(t);
      osc.stop(t + 0.17);
    });
  }

  function playPourSound(dropCount = 1) {
    playAudioTagOrFallback(audioPourEl, () => {
      const ctx = ensureAudio();
      if (!ctx || !sfxGain) return;
      const now = ctx.currentTime;
      const clampedCount = Math.min(4, Math.max(1, dropCount));
      const duration = 0.22 + clampedCount * 0.055;

      if (sharedNoiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = sharedNoiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(3.8 + clampedCount * 0.4, now);
        filter.frequency.setValueAtTime(380 + clampedCount * 30, now);
        filter.frequency.exponentialRampToValueAtTime(1050 + clampedCount * 80, now + duration * 0.72);
        filter.frequency.exponentialRampToValueAtTime(620, now + duration);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, now);
        noiseGain.gain.linearRampToValueAtTime(0.14 + clampedCount * 0.025, now + 0.04);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(sfxGain);
        noise.start(now, Math.random() * 0.3, duration + 0.03);
      }

      const bubbles = 3 + clampedCount * 2;
      for (let i = 0; i < bubbles; i++) {
        const t = now + 0.028 + (i * (duration - 0.06)) / bubbles + Math.random() * 0.018;
        const bOsc = ctx.createOscillator();
        const bGain = ctx.createGain();
        const baseFreq = 320 + i * 75 + (clampedCount * 20) + Math.random() * 80;
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(baseFreq, t);
        bOsc.frequency.exponentialRampToValueAtTime(baseFreq * (1.7 + clampedCount * 0.08), t + 0.052);

        bGain.gain.setValueAtTime(0.001, t);
        bGain.gain.linearRampToValueAtTime(0.07 + clampedCount * 0.006, t + 0.01);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.054);

        bOsc.connect(bGain);
        bGain.connect(sfxGain);
        bOsc.start(t);
        bOsc.stop(t + 0.062);
      }
    });
  }

  // Ascending "plim!" chime when completing an individual tube
  function playTubeCompleteSound(streakBonus = 0) {
    playAudioTagOrFallback(audioCompleteEl, () => {
      const ctx = ensureAudio();
      if (!ctx || !sfxGain) return;
      const now = ctx.currentTime;
      const pitchMult = Math.pow(1.06, Math.min(streakBonus, 4));
      const notes = [659.25, 880, 1318.51, 1760];

      notes.forEach((freq, idx) => {
        const t = now + idx * 0.052;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq * pitchMult, t);

        const peak = idx === notes.length - 1 ? 0.13 : 0.085;
        const decay = idx === notes.length - 1 ? 0.42 : 0.25;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(peak, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0005, t + decay);

        osc.connect(gain);
        gain.connect(sfxGain!);
        osc.start(t);
        osc.stop(t + decay + 0.02);
      });
    });
  }

  // Subtle crystal chime when revealing a Mystery (?) layer
  function playMysteryRevealSound() {
    const ctx = ensureAudio();
    if (!ctx || !sfxGain) return;
    const now = ctx.currentTime;
    const tones = [
      { freq: 1174.66, delay: 0, peak: 0.055, dur: 0.24, type: 'sine' as OscillatorType },
      { freq: 1760.0, delay: 0.045, peak: 0.065, dur: 0.3, type: 'triangle' as OscillatorType }
    ];
    tones.forEach((tone) => {
      const t0 = now + tone.delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = tone.type;
      osc.frequency.setValueAtTime(tone.freq, t0);
      gain.gain.setValueAtTime(0.0005, t0);
      gain.gain.linearRampToValueAtTime(tone.peak, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0005, t0 + tone.dur);
      osc.connect(gain);
      gain.connect(sfxGain!);
      osc.start(t0);
      osc.stop(t0 + tone.dur + 0.02);
    });
  }

  function playVictoryFanfare() {
    const ctx = ensureAudio();
    if (!ctx || !sfxGain) return;
    duckBgm(1.8);
    const now = ctx.currentTime;

    const lead = [
      { f: 523.25, t: 0.00, d: 0.14 },
      { f: 659.25, t: 0.09, d: 0.14 },
      { f: 783.99, t: 0.18, d: 0.14 },
      { f: 1046.50, t: 0.28, d: 0.24 },
      { f: 880.00, t: 0.46, d: 0.14 },
      { f: 1046.50, t: 0.58, d: 0.72 }
    ];

    lead.forEach(n => {
      const t0 = now + n.t;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(n.f, t0);
      osc2.frequency.setValueAtTime(n.f * 2, t0);

      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.13, t0 + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + n.d);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(sfxGain!);
      osc1.start(t0);
      osc2.start(t0);
      osc1.stop(t0 + n.d + 0.03);
      osc2.stop(t0 + n.d + 0.03);
    });

    const chord = [261.63, 329.63, 392.00, 523.25];
    chord.forEach(freq => {
      const t0 = now + 0.58;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.06, t0 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.78);
      osc.connect(gain);
      gain.connect(sfxGain!);
      osc.start(t0);
      osc.stop(t0 + 0.82);
    });

    [1318.51, 1567.98, 2093.00].forEach((freq, idx) => {
      const t0 = now + 0.64 + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.065, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
      osc.connect(gain);
      gain.connect(sfxGain!);
      osc.start(t0);
      osc.stop(t0 + 0.42);
    });
  }

  // =========================================================
  // Confetti & Fireworks Particle System
  // =========================================================
  const particles: Particle[] = [];
  let fxRafId: number | null = null;

  function resizeFxCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fxCanvas.width = window.innerWidth * dpr;
    fxCanvas.height = window.innerHeight * dpr;
    fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeFxCanvas);
  resizeFxCanvas();

  // Burst of shiny confetti spraying out of the tube's mouth
  function spawnTubeConfetti(tubeEl: HTMLElement, colorObj: ColorDef) {
    const rect = tubeEl.getBoundingClientRect();
    const mouthX = rect.left + rect.width / 2;
    const mouthY = rect.top + 4;
    const palette = [colorObj.main, colorObj.light, '#FFD600', '#FFFFFF', '#00E5FF'];

    for (let i = 0; i < 36; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.35;
      const speed = 3.2 + Math.random() * 5.8;
      const isRibbon = i % 3 !== 0;
      particles.push({
        x: mouthX + (Math.random() - 0.5) * (rect.width * 0.55),
        y: mouthY + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.6,
        w: isRibbon ? 5 + Math.random() * 5 : 4 + Math.random() * 3,
        h: isRibbon ? 3 + Math.random() * 3.5 : 4 + Math.random() * 3,
        color: palette[i % palette.length],
        alpha: 1,
        decay: 0.013 + Math.random() * 0.012,
        gravity: 0.18,
        drag: 0.985,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.32,
        wobble: Math.random() * Math.PI * 2,
        isCircle: !isRibbon
      });
    }
    startFxLoop();
  }

  // Full-screen celebratory confetti shower falling from above
  function spawnVictoryConfettiShower(light = false) {
    const emitWave = (count: number, fromTopOnly = false) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (let i = 0; i < count; i++) {
        const c = COLORS[i % COLORS.length];
        const color = i % 7 === 0 ? '#FFFFFF' : (i % 5 === 0 ? '#FFD600' : c.main);
        const startX = fromTopOnly
          ? Math.random() * w
          : (i % 2 === 0 ? w * (0.05 + Math.random() * 0.35) : w * (0.6 + Math.random() * 0.35));
        const startY = fromTopOnly ? -12 - Math.random() * 60 : h * (0.28 + Math.random() * 0.25);

        particles.push({
          x: startX,
          y: startY,
          vx: fromTopOnly ? (Math.random() - 0.5) * 3.2 : (startX < w / 2 ? 1.5 + Math.random() * 5.5 : -1.5 - Math.random() * 5.5),
          vy: fromTopOnly ? 1.8 + Math.random() * 3.5 : -5.5 - Math.random() * 6.5,
          w: 6 + Math.random() * 6,
          h: 4 + Math.random() * 4,
          color,
          alpha: 1,
          decay: 0.0055 + Math.random() * 0.0055,
          gravity: fromTopOnly ? 0.08 : 0.16,
          drag: 0.99,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.22,
          wobble: Math.random() * Math.PI * 2,
          isCircle: i % 6 === 0
        });
      }
      startFxLoop();
    };

    if (light) {
      emitWave(45, true);
    } else {
      emitWave(70, false);
      victoryFxTimers.push(setTimeout(() => emitWave(60, true), 280));
      victoryFxTimers.push(setTimeout(() => emitWave(55, true), 680));
    }
  }

  // Radial fireworks bursts in the upper half of the screen for 100% efficiency
  function spawnFireworksShow() {
    const bursts = 4;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const triggerBurst = (cx: number, cy: number, baseColorIdx: number) => {
      const count = 46 + Math.floor(Math.random() * 15);
      const colorA = COLORS[baseColorIdx % COLORS.length];
      const colorB = COLORS[(baseColorIdx + 3) % COLORS.length];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.18;
        const speed = 2.2 + Math.random() * 5.6;
        const pick = i % 5 === 0 ? '#FFFFFF' : (i % 3 === 0 ? '#FFD600' : (i % 2 === 0 ? colorA.main : colorB.light));

        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          w: 4.5 + Math.random() * 3.5,
          h: 4.5,
          color: pick,
          alpha: 1,
          decay: 0.012 + Math.random() * 0.01,
          gravity: 0.095,
          drag: 0.965,
          rot: 0,
          vRot: 0,
          wobble: Math.random() * Math.PI * 2,
          isCircle: true,
          glow: true
        });
      }
      startFxLoop();
    };

    for (let b = 0; b < bursts; b++) {
      const delay = b * 230;
      victoryFxTimers.push(setTimeout(() => {
        const cx = w * (0.18 + Math.random() * 0.64);
        const cy = h * (0.14 + Math.random() * 0.30);
        const colorIdx = Math.floor(Math.random() * COLORS.length);
        triggerBurst(cx, cy, colorIdx);
      }, delay));
    }
  }

  function clearVictoryFxTimers() {
    victoryFxTimers.forEach(t => clearTimeout(t));
    victoryFxTimers = [];
  }

  function startFxLoop() {
    if (fxRafId) return;
    const tick = () => {
      const h = window.innerHeight;
      fxCtx.clearRect(0, 0, window.innerWidth, h);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.wobble += 0.12;
        p.x += p.vx + (p.isCircle ? 0 : Math.sin(p.wobble) * 0.35);
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.isCircle ? p.drag : 1;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > h + 30) {
          particles.splice(i, 1);
          continue;
        }

        fxCtx.save();
        fxCtx.globalAlpha = Math.max(0, p.alpha);
        fxCtx.fillStyle = p.color;
        if (p.glow) {
          fxCtx.shadowBlur = 8;
          fxCtx.shadowColor = p.color;
        }
        fxCtx.translate(p.x, p.y);
        if (p.isCircle) {
          fxCtx.beginPath();
          fxCtx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2);
          fxCtx.fill();
        } else {
          p.rot += p.vRot;
          fxCtx.rotate(p.rot);
          const flipScale = Math.cos(p.wobble * 1.4);
          fxCtx.scale(1, Math.max(0.25, Math.abs(flipScale)));
          fxCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        fxCtx.restore();
      }
      if (particles.length > 0) {
        fxRafId = requestAnimationFrame(tick);
      } else {
        fxRafId = null;
      }
    };
    fxRafId = requestAnimationFrame(tick);
  }

  // =========================================================
  // Ambient Micro-Particles (Subtle Living Background)
  // =========================================================
  interface AmbientMote {
    x: number;
    y: number;
    r: number;
    vy: number;
    driftAmp: number;
    driftSpeed: number;
    phase: number;
    alpha: number;
    isCyan: boolean;
  }

  const ambientMotes: AmbientMote[] = [];
  let ambientRafId: number | null = null;
  const reducedMotionQuery = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function isReducedMotionActive(): boolean {
    return Boolean(reducedMotionQuery && reducedMotionQuery.matches);
  }

  function resizeAmbientCanvas() {
    if (!ambientCanvas || !ambientCtx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ambientCanvas.width = window.innerWidth * dpr;
    ambientCanvas.height = window.innerHeight * dpr;
    ambientCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seedAmbientMotes() {
    ambientMotes.length = 0;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const count = Math.min(32, Math.max(18, Math.round((w * h) / 28000)));
    for (let i = 0; i < count; i++) {
      ambientMotes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.7 + Math.random() * 1.4,
        vy: 0.12 + Math.random() * 0.22,
        driftAmp: 0.14 + Math.random() * 0.28,
        driftSpeed: 0.008 + Math.random() * 0.012,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.06 + Math.random() * 0.14,
        isCyan: i % 3 !== 0
      });
    }
  }

  function stopAmbientLoop() {
    if (ambientRafId !== null) {
      cancelAnimationFrame(ambientRafId);
      ambientRafId = null;
    }
    if (ambientCtx && isReducedMotionActive()) {
      ambientCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function startAmbientLoop() {
    if (!ambientCanvas || !ambientCtx || ambientRafId !== null) return;
    if (document.hidden || isReducedMotionActive()) {
      ambientCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      return;
    }
    if (ambientMotes.length === 0) {
      resizeAmbientCanvas();
      seedAmbientMotes();
    }
    const tickAmbient = () => {
      if (document.hidden || isReducedMotionActive()) {
        stopAmbientLoop();
        return;
      }
      const w = window.innerWidth;
      const h = window.innerHeight;
      ambientCtx.clearRect(0, 0, w, h);

      for (let i = 0; i < ambientMotes.length; i++) {
        const m = ambientMotes[i];
        m.phase += m.driftSpeed;
        m.y -= m.vy;
        m.x += Math.sin(m.phase) * m.driftAmp;

        if (m.y < -8) {
          m.y = h + 8;
          m.x = Math.random() * w;
        }
        if (m.x < -8) m.x = w + 8;
        if (m.x > w + 8) m.x = -8;

        const twinkle = 0.75 + 0.25 * Math.sin(m.phase * 1.8);
        ambientCtx.globalAlpha = m.alpha * twinkle;
        ambientCtx.fillStyle = m.isCyan ? '#73E4FF' : '#E2E8F0';
        ambientCtx.beginPath();
        ambientCtx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ambientCtx.fill();
      }
      ambientCtx.globalAlpha = 1;
      ambientRafId = requestAnimationFrame(tickAmbient);
    };
    ambientRafId = requestAnimationFrame(tickAmbient);
  }

  const handleAmbientResize = () => {
    resizeAmbientCanvas();
    if (!isReducedMotionActive() && ambientMotes.length === 0) {
      seedAmbientMotes();
    }
  };
  const handleReducedMotionChange = () => {
    if (isReducedMotionActive()) {
      stopAmbientLoop();
    } else {
      resizeAmbientCanvas();
      seedAmbientMotes();
      startAmbientLoop();
    }
  };
  window.addEventListener('resize', handleAmbientResize);
  reducedMotionQuery?.addEventListener('change', handleReducedMotionChange);
  resizeAmbientCanvas();
  if (!isReducedMotionActive()) {
    seedAmbientMotes();
    startAmbientLoop();
  }

  // =========================================================
  // Sequence Toast Helper (Tube Completion Only)
  // =========================================================
  function showSequenceToast(text: string, styleClass = '') {
    comboToastEl.textContent = text;
    comboToastEl.className = 'combo-toast' + (styleClass ? ` ${styleClass}` : '');
    void comboToastEl.offsetWidth;
    comboToastEl.classList.add('animate');
  }

  function resetTubeSequence() {
    lastTubeCompleteTime = 0;
    tubeCompleteStreak = 0;
  }

  // =========================================================
  // Core Rules, Exact Ideal-Moves Solver & Round Generation
  // =========================================================
  function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function isTubeComplete(tube: number[]): boolean {
    return (
      tube.length === TUBE_CAPACITY &&
      tube[0] === tube[1] &&
      tube[1] === tube[2] &&
      tube[2] === tube[3]
    );
  }

  function isTubeMono(tube: number[]): boolean {
    if (tube.length === 0) return false;
    const c = tube[0];
    for (let i = 1; i < tube.length; i++) {
      if (tube[i] !== c) return false;
    }
    return true;
  }

  function isGameWon(tubes: number[][]): boolean {
    for (let i = 0; i < tubes.length; i++) {
      if (tubes[i].length !== 0 && !isTubeComplete(tubes[i])) {
        return false;
      }
    }
    return true;
  }

  function getTopRunLength(tube: number[]): number {
    if (tube.length === 0) return 0;
    const top = tube[tube.length - 1];
    let count = 1;
    for (let i = tube.length - 2; i >= 0; i--) {
      if (tube[i] === top) count++;
      else break;
    }
    return count;
  }

  function canPour(src: number[], dst: number[]): boolean {
    if (src.length === 0 || dst.length >= TUBE_CAPACITY) return false;
    if (dst.length === 0) return true;
    return src[src.length - 1] === dst[dst.length - 1];
  }

  function findUsefulMoves(tubes: number[][]): Array<{ from: number; to: number; color: number; toEmpty: boolean }> {
    const usefulMoves: Array<{ from: number; to: number; color: number; toEmpty: boolean }> = [];

    for (let i = 0; i < tubes.length; i++) {
      const src = tubes[i];
      if (!Array.isArray(src) || src.length === 0 || isTubeComplete(src)) continue;
      const srcTop = src[src.length - 1];

      for (let j = 0; j < tubes.length; j++) {
        if (i === j) continue;
        const dst = tubes[j];
        if (!Array.isArray(dst)) continue;

        // Strictly verify destination has less than 4 liquids (capacity = 4)
        if (dst.length >= TUBE_CAPACITY) continue;

        const isEmptyDst = dst.length === 0;
        const matchesTopColor = !isEmptyDst && dst[dst.length - 1] === srcTop;
        if (!isEmptyDst && !matchesTopColor) continue;

        // Filter out useless pours into empty tubes
        if (isEmptyDst) {
          if (isTubeMono(src)) continue;

          let appearsElsewhere = false;
          let totalUnits = 0;
          for (let k = 0; k < tubes.length; k++) {
            const tube = tubes[k];
            for (let u = 0; u < tube.length; u++) {
              if (tube[u] === srcTop) {
                totalUnits++;
                if (k !== i) appearsElsewhere = true;
              }
            }
          }

          if (!appearsElsewhere || totalUnits < TUBE_CAPACITY) continue;
        }

        usefulMoves.push({ from: i, to: j, color: srcTop, toEmpty: isEmptyDst });
      }
    }

    return usefulMoves;
  }

  const solvabilityCache = new Map<string, boolean>();

  function isBoardSolvableOrUncertain(startTubes: number[][], maxNodes = 6000, maxMs = 25): boolean {
    if (isGameWon(startTubes)) return true;

    const rootKey = canonicalKey(startTubes);
    const cached = solvabilityCache.get(rootKey);
    if (cached !== undefined) return cached;

    const t0 = performance.now();
    const visited = new Set<string>();
    const stack: number[][][] = [cloneTubes(startTubes)];
    let nodes = 0;
    let budgetHit = false;

    while (stack.length > 0) {
      if (nodes >= maxNodes || (nodes > 0 && (nodes & 63) === 0 && performance.now() - t0 > maxMs)) {
        budgetHit = true;
        break;
      }

      const cur = stack.pop()!;
      if (isGameWon(cur)) {
        if (solvabilityCache.size > 512) solvabilityCache.clear();
        solvabilityCache.set(rootKey, true);
        return true;
      }

      const key = canonicalKey(cur);
      if (visited.has(key)) continue;
      visited.add(key);
      nodes++;

      let firstEmpty = -1;
      for (let i = 0; i < cur.length; i++) {
        if (cur[i].length === 0) {
          firstEmpty = i;
          break;
        }
      }

      let forced: { i: number; j: number; amt: number } | null = null;
      const cands: Array<{ i: number; j: number; amt: number; score: number }> = [];

      for (let i = 0; i < cur.length; i++) {
        const src = cur[i];
        if (src.length === 0 || isTubeComplete(src)) continue;
        const topColor = src[src.length - 1];
        const runLen = getTopRunLength(src);
        const srcMono = runLen === src.length;

        for (let j = 0; j < cur.length; j++) {
          if (i === j) continue;
          const dst = cur[j];
          if (dst.length >= TUBE_CAPACITY) continue;

          const space = TUBE_CAPACITY - dst.length;
          const amt = Math.min(runLen, space);

          if (dst.length === 0) {
            if (srcMono || j !== firstEmpty) continue;
            cands.push({ i, j, amt, score: 100 });
          } else if (dst[dst.length - 1] === topColor) {
            const dstMono = isTubeMono(dst);
            if (dstMono && (dst.length + amt === TUBE_CAPACITY || (srcMono && runLen <= space))) {
              forced = { i, j, amt };
              break;
            }
            let score = dstMono ? 650 : 420;
            if (srcMono && runLen <= space) score += 120;
            cands.push({ i, j, amt, score });
          }
        }
        if (forced) break;
      }

      if (forced) {
        const next = cloneTubes(cur);
        for (let k = 0; k < forced.amt; k++) next[forced.j].push(next[forced.i].pop()!);
        stack.push(next);
        continue;
      }

      cands.sort((a, b) => a.score - b.score);
      for (let c = 0; c < cands.length; c++) {
        const m = cands[c];
        const next = cloneTubes(cur);
        for (let k = 0; k < m.amt; k++) next[m.j].push(next[m.i].pop()!);
        stack.push(next);
      }
    }

    if (budgetHit) {
      return true;
    }

    if (solvabilityCache.size > 512) solvabilityCache.clear();
    solvabilityCache.set(rootKey, false);
    return false;
  }

  function hasValidMoves(tubes: number[][]): boolean {
    const validMoves = findUsefulMoves(tubes);
    if (validMoves.length === 0) {
      return false;
    }

    if (!isBoardSolvableOrUncertain(tubes)) {
      console.log('[StuckDetection] Deadlock detected (only dead-end/cyclic moves remain):', validMoves);
      return false;
    }

    console.log('[StuckDetection] Valid moves:', validMoves);
    return true;
  }

  function hasAnyUsefulMove(tubes: number[][]): boolean {
    return findUsefulMoves(tubes).length > 0 && isBoardSolvableOrUncertain(tubes);
  }

  function cloneTubes(tubes: number[][]): number[][] {
    return tubes.map(t => t.slice());
  }

  function canonicalKey(tubes: number[][]): string {
    return tubes.map(t => t.join(',')).sort().join('|');
  }

  function computeHeuristic(tubes: number[][]): number {
    let aboveBottom = 0;
    const bottomCounts = new Int8Array(COLORS.length);

    for (let i = 0; i < tubes.length; i++) {
      const t = tubes[i];
      const len = t.length;
      if (len === 0) continue;

      bottomCounts[t[0]]++;
      let segments = 1;
      for (let k = 1; k < len; k++) {
        if (t[k] !== t[k - 1]) segments++;
      }
      aboveBottom += segments - 1;
    }

    let extraBottom = 0;
    for (let c = 0; c < bottomCounts.length; c++) {
      if (bottomCounts[c] > 1) {
        extraBottom += bottomCounts[c] - 1;
      }
    }
    return aboveBottom + extraBottom;
  }

  class MinHeap<T extends { priority: number }> {
    private data: T[] = [];

    get size(): number {
      return this.data.length;
    }

    push(item: T) {
      const a = this.data;
      a.push(item);
      let i = a.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (a[p].priority <= a[i].priority) break;
        const tmp = a[p];
        a[p] = a[i];
        a[i] = tmp;
        i = p;
      }
    }

    pop(): T {
      const a = this.data;
      const top = a[0];
      const last = a.pop()!;
      if (a.length > 0) {
        a[0] = last;
        let i = 0;
        const n = a.length;
        while (true) {
          let best = i;
          const l = (i << 1) + 1;
          const r = l + 1;
          if (l < n && a[l].priority < a[best].priority) best = l;
          if (r < n && a[r].priority < a[best].priority) best = r;
          if (best === i) break;
          const tmp = a[i];
          a[i] = a[best];
          a[best] = tmp;
          i = best;
        }
      }
      return top;
    }
  }

  function findQuickDFSMoves(startTubes: number[][], maxNodes = 18000): number {
    const visited = new Set<string>();
    const stack: Array<{ tubes: number[][]; g: number }> = [{ tubes: cloneTubes(startTubes), g: 0 }];
    let nodes = 0;

    while (stack.length > 0 && nodes < maxNodes) {
      const cur = stack.pop()!;
      nodes++;
      if (isGameWon(cur.tubes)) return cur.g;

      const key = canonicalKey(cur.tubes);
      if (visited.has(key)) continue;
      visited.add(key);

      let firstEmpty = -1;
      for (let i = 0; i < cur.tubes.length; i++) {
        if (cur.tubes[i].length === 0) {
          firstEmpty = i;
          break;
        }
      }

      let forced: { i: number; j: number; amt: number } | null = null;
      const cands: Array<{ i: number; j: number; amt: number; score: number }> = [];
      for (let i = 0; i < cur.tubes.length; i++) {
        const src = cur.tubes[i];
        if (src.length === 0 || isTubeComplete(src)) continue;
        const topColor = src[src.length - 1];
        const runLen = getTopRunLength(src);
        const srcMono = runLen === src.length;

        for (let j = 0; j < cur.tubes.length; j++) {
          if (i === j) continue;
          const dst = cur.tubes[j];
          if (dst.length >= TUBE_CAPACITY) continue;
          const space = TUBE_CAPACITY - dst.length;
          const amt = Math.min(runLen, space);

          if (dst.length === 0) {
            if (srcMono || j !== firstEmpty) continue;
            cands.push({ i, j, amt, score: 100 });
          } else if (dst[dst.length - 1] === topColor) {
            const dstMono = isTubeMono(dst);
            if (dstMono && (dst.length + amt === TUBE_CAPACITY || (srcMono && runLen <= space))) {
              forced = { i, j, amt };
              break;
            }
            let score = dstMono ? 650 : 420;
            if (srcMono && runLen <= space) score += 120;
            cands.push({ i, j, amt, score });
          }
        }
        if (forced) break;
      }

      if (forced) {
        const next = cloneTubes(cur.tubes);
        for (let k = 0; k < forced.amt; k++) next[forced.j].push(next[forced.i].pop()!);
        stack.push({ tubes: next, g: cur.g + 1 });
        continue;
      }

      cands.sort((a, b) => a.score - b.score);
      for (let c = 0; c < cands.length; c++) {
        const m = cands[c];
        const next = cloneTubes(cur.tubes);
        for (let k = 0; k < m.amt; k++) next[m.j].push(next[m.i].pop()!);
        stack.push({ tubes: next, g: cur.g + 1 });
      }
    }
    return -1;
  }

  function findIdealMoves(startTubes: number[][], maxNodes = 32000, maxMs = 110): { idealMoves: number; exact: boolean } | null {
    const t0 = performance.now();
    const heap = new MinHeap<SolverHeapItem>();
    const bestG = new Map<string, number>();

    const startCopy = cloneTubes(startTubes);
    const startH = computeHeuristic(startCopy);
    const startKey = canonicalKey(startCopy);
    bestG.set(startKey, 0);
    heap.push({
      tubes: startCopy,
      key: startKey,
      g: 0,
      f: startH,
      priority: startH * 1024
    });

    let nodes = 0;
    while (heap.size > 0 && nodes < maxNodes) {
      if ((nodes & 255) === 0 && performance.now() - t0 > maxMs) {
        break;
      }
      const cur = heap.pop();
      nodes++;

      if (isGameWon(cur.tubes)) {
        return { idealMoves: cur.g, exact: true };
      }

      const knownG = bestG.get(cur.key);
      if (knownG !== undefined && knownG < cur.g) continue;

      let firstEmpty = -1;
      for (let i = 0; i < cur.tubes.length; i++) {
        if (cur.tubes[i].length === 0) {
          firstEmpty = i;
          break;
        }
      }

      let forced: { i: number; j: number; amt: number } | null = null;
      const moves: Array<{ i: number; j: number; amt: number }> = [];

      for (let i = 0; i < cur.tubes.length; i++) {
        const src = cur.tubes[i];
        if (src.length === 0 || isTubeComplete(src)) continue;
        const topColor = src[src.length - 1];
        const runLen = getTopRunLength(src);
        const srcMono = runLen === src.length;

        for (let j = 0; j < cur.tubes.length; j++) {
          if (i === j) continue;
          const dst = cur.tubes[j];
          if (dst.length >= TUBE_CAPACITY) continue;

          const space = TUBE_CAPACITY - dst.length;
          const amt = Math.min(runLen, space);

          if (dst.length === 0) {
            if (srcMono || j !== firstEmpty) continue;
            moves.push({ i, j, amt });
          } else if (dst[dst.length - 1] === topColor) {
            const dstMono = isTubeMono(dst);
            if (dstMono && (dst.length + amt === TUBE_CAPACITY || (srcMono && runLen <= space))) {
              forced = { i, j, amt };
              break;
            }
            moves.push({ i, j, amt });
          }
        }
        if (forced) break;
      }

      const nextList = forced ? [forced] : moves;
      const nextG = cur.g + 1;

      for (let mIdx = 0; mIdx < nextList.length; mIdx++) {
        const m = nextList[mIdx];
        const nextTubes = cloneTubes(cur.tubes);
        for (let k = 0; k < m.amt; k++) {
          nextTubes[m.j].push(nextTubes[m.i].pop()!);
        }
        const nextKey = canonicalKey(nextTubes);
        const prevG = bestG.get(nextKey);
        if (prevG !== undefined && prevG <= nextG) continue;

        bestG.set(nextKey, nextG);
        const h = computeHeuristic(nextTubes);
        const f = nextG + h;
        heap.push({
          tubes: nextTubes,
          key: nextKey,
          g: nextG,
          f,
          priority: f * 1024 - nextG
        });
      }
    }

    const quick = findQuickDFSMoves(startTubes, 20000);
    if (quick >= 0) {
      return { idealMoves: quick, exact: false };
    }
    return null;
  }

  function findBestNextMove(startTubes: number[][]): { from: number; to: number } | null {
    if (isGameWon(startTubes)) return null;

    interface HintHeapItem {
      tubes: number[][];
      key: string;
      g: number;
      priority: number;
      firstMove: { from: number; to: number } | null;
    }

    const t0 = performance.now();
    const heap = new MinHeap<HintHeapItem>();
    const bestG = new Map<string, number>();

    const startCopy = cloneTubes(startTubes);
    const startH = computeHeuristic(startCopy);
    const startKey = canonicalKey(startCopy);
    bestG.set(startKey, 0);
    heap.push({
      tubes: startCopy,
      key: startKey,
      g: 0,
      priority: startH * 1024,
      firstMove: null
    });

    let nodes = 0;
    const maxNodes = 16000;
    const maxMs = 65;

    while (heap.size > 0 && nodes < maxNodes) {
      if ((nodes & 255) === 0 && performance.now() - t0 > maxMs) {
        break;
      }
      const cur = heap.pop();
      nodes++;

      if (isGameWon(cur.tubes)) {
        return cur.firstMove;
      }

      const knownG = bestG.get(cur.key);
      if (knownG !== undefined && knownG < cur.g) continue;

      let firstEmpty = -1;
      for (let i = 0; i < cur.tubes.length; i++) {
        if (cur.tubes[i].length === 0) {
          firstEmpty = i;
          break;
        }
      }

      let forced: { i: number; j: number; amt: number } | null = null;
      const moves: Array<{ i: number; j: number; amt: number }> = [];

      for (let i = 0; i < cur.tubes.length; i++) {
        const src = cur.tubes[i];
        if (src.length === 0 || isTubeComplete(src)) continue;
        const topColor = src[src.length - 1];
        const runLen = getTopRunLength(src);
        const srcMono = runLen === src.length;

        for (let j = 0; j < cur.tubes.length; j++) {
          if (i === j) continue;
          const dst = cur.tubes[j];
          if (dst.length >= TUBE_CAPACITY) continue;

          const space = TUBE_CAPACITY - dst.length;
          const amt = Math.min(runLen, space);

          if (dst.length === 0) {
            if (srcMono || j !== firstEmpty) continue;
            moves.push({ i, j, amt });
          } else if (dst[dst.length - 1] === topColor) {
            const dstMono = isTubeMono(dst);
            if (dstMono && (dst.length + amt === TUBE_CAPACITY || (srcMono && runLen <= space))) {
              forced = { i, j, amt };
              break;
            }
            moves.push({ i, j, amt });
          }
        }
        if (forced) break;
      }

      const nextList = forced ? [forced] : moves;
      const nextG = cur.g + 1;

      for (let mIdx = 0; mIdx < nextList.length; mIdx++) {
        const m = nextList[mIdx];
        const nextTubes = cloneTubes(cur.tubes);
        for (let k = 0; k < m.amt; k++) {
          nextTubes[m.j].push(nextTubes[m.i].pop()!);
        }
        const nextKey = canonicalKey(nextTubes);
        const prevG = bestG.get(nextKey);
        if (prevG !== undefined && prevG <= nextG) continue;

        bestG.set(nextKey, nextG);
        const h = computeHeuristic(nextTubes);
        const f = nextG + h;
        heap.push({
          tubes: nextTubes,
          key: nextKey,
          g: nextG,
          priority: f * 1024 - nextG,
          firstMove: cur.firstMove ?? { from: m.i, to: m.j }
        });
      }
    }

    // Guided DFS fallback tracking first move
    const dfsT0 = performance.now();
    const visited = new Set<string>();
    const stack: Array<{ tubes: number[][]; firstMove: { from: number; to: number } | null }> = [
      { tubes: cloneTubes(startTubes), firstMove: null }
    ];
    let dfsNodes = 0;

    while (stack.length > 0 && dfsNodes < 16000) {
      if ((dfsNodes & 255) === 0 && performance.now() - dfsT0 > 35) break;
      const cur = stack.pop()!;
      dfsNodes++;
      if (isGameWon(cur.tubes)) return cur.firstMove;

      const key = canonicalKey(cur.tubes);
      if (visited.has(key)) continue;
      visited.add(key);

      let firstEmpty = -1;
      for (let i = 0; i < cur.tubes.length; i++) {
        if (cur.tubes[i].length === 0) {
          firstEmpty = i;
          break;
        }
      }

      let forced: { i: number; j: number; amt: number } | null = null;
      const cands: Array<{ i: number; j: number; amt: number; score: number }> = [];
      for (let i = 0; i < cur.tubes.length; i++) {
        const src = cur.tubes[i];
        if (src.length === 0 || isTubeComplete(src)) continue;
        const topColor = src[src.length - 1];
        const runLen = getTopRunLength(src);
        const srcMono = runLen === src.length;

        for (let j = 0; j < cur.tubes.length; j++) {
          if (i === j) continue;
          const dst = cur.tubes[j];
          if (dst.length >= TUBE_CAPACITY) continue;
          const space = TUBE_CAPACITY - dst.length;
          const amt = Math.min(runLen, space);

          if (dst.length === 0) {
            if (srcMono || j !== firstEmpty) continue;
            cands.push({ i, j, amt, score: 100 });
          } else if (dst[dst.length - 1] === topColor) {
            const dstMono = isTubeMono(dst);
            if (dstMono && (dst.length + amt === TUBE_CAPACITY || (srcMono && runLen <= space))) {
              forced = { i, j, amt };
              break;
            }
            let score = dstMono ? 650 : 420;
            if (srcMono && runLen <= space) score += 120;
            cands.push({ i, j, amt, score });
          }
        }
        if (forced) break;
      }

      if (forced) {
        const next = cloneTubes(cur.tubes);
        for (let k = 0; k < forced.amt; k++) next[forced.j].push(next[forced.i].pop()!);
        stack.push({
          tubes: next,
          firstMove: cur.firstMove ?? { from: forced.i, to: forced.j }
        });
        continue;
      }

      cands.sort((a, b) => a.score - b.score);
      for (let c = 0; c < cands.length; c++) {
        const m = cands[c];
        const next = cloneTubes(cur.tubes);
        for (let k = 0; k < m.amt; k++) next[m.j].push(next[m.i].pop()!);
        stack.push({
          tubes: next,
          firstMove: cur.firstMove ?? { from: m.i, to: m.j }
        });
      }
    }

    // If provably deadlocked, return null; otherwise return best immediate heuristic move
    if (!isBoardSolvableOrUncertain(startTubes)) return null;

    const useful = findUsefulMoves(startTubes);
    if (useful.length === 0) return null;

    let bestMove: { from: number; to: number } | null = null;
    let bestScore = -Infinity;

    for (let idx = 0; idx < useful.length; idx++) {
      const m = useful[idx];
      const src = startTubes[m.from];
      const dst = startTubes[m.to];
      const runLen = getTopRunLength(src);
      const space = TUBE_CAPACITY - dst.length;
      const amt = Math.min(runLen, space);
      const next = cloneTubes(startTubes);
      for (let k = 0; k < amt; k++) next[m.to].push(next[m.from].pop()!);
      if (!isBoardSolvableOrUncertain(next, 1200, 8)) continue;

      let score = -computeHeuristic(next) * 100;
      if (dst.length > 0 && isTubeMono(dst)) score += 300;
      if (dst.length + amt === TUBE_CAPACITY && isTubeMono(next[m.to])) score += 500;
      if (score > bestScore) {
        bestScore = score;
        bestMove = { from: m.from, to: m.to };
      }
    }

    return bestMove ?? { from: useful[0].from, to: useful[0].to };
  }

  function getRoundSpecs(phase: PhaseDef, roundNum: number, phaseSeed: number): { numColors: number; emptyCount: number } {
    const rng = mulberry32(phaseSeed ^ (phase.id.length * 2654435761));
    const cMinSplit = phase.colorSplitRange[0];
    const cMaxSplit = phase.colorSplitRange[1];
    const colorSplit = cMinSplit + Math.floor(rng() * (cMaxSplit - cMinSplit + 1));

    const eMinSplit = phase.emptySplitRange[0];
    const eMaxSplit = phase.emptySplitRange[1];
    const emptySplit = eMinSplit + Math.floor(rng() * (eMaxSplit - eMinSplit + 1));

    const numColors = roundNum <= colorSplit ? phase.colorRange[0] : phase.colorRange[1];
    const emptyCount = roundNum <= emptySplit ? phase.emptyRange[0] : phase.emptyRange[1];
    return { numColors, emptyCount };
  }

  function shuffleArray<T>(arr: T[], rng: () => number): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function generateOneEmptyBoard(palette: number[], rng: () => number): number[][] {
    const n = palette.length;
    const tubes: number[][] = [];
    for (let i = 0; i < n; i++) {
      const c = palette[i];
      tubes.push([c, c, c, c]);
    }
    const emptyIdx = n;
    tubes.push([]);

    const applyCascade = (k: number) => {
      let perm: number[] | null = null;
      for (let tries = 0; tries < 30; tries++) {
        const cand = shuffleArray([...Array(n).keys()], rng);
        let ok = true;
        for (let m = 1; m < n; m++) {
          const tSrc = tubes[cand[m]];
          const tDst = tubes[cand[m - 1]];
          const srcTop = tSrc[tSrc.length - 1];
          const dstTop = tDst[tDst.length - 1];
          if (srcTop === dstTop || getTopRunLength(tSrc) <= k) {
            ok = false;
            break;
          }
        }
        if (ok && getTopRunLength(tubes[cand[0]]) > k) {
          perm = cand;
          break;
        }
      }
      if (!perm) return false;

      for (let step = 0; step < k; step++) tubes[emptyIdx].push(tubes[perm[0]].pop()!);
      for (let m = 1; m < n; m++) {
        for (let step = 0; step < k; step++) tubes[perm[m - 1]].push(tubes[perm[m]].pop()!);
      }
      while (tubes[emptyIdx].length > 0) tubes[perm[n - 1]].push(tubes[emptyIdx].pop()!);
      return true;
    };

    applyCascade(3);
    applyCascade(2);
    applyCascade(1);

    const nonEmpty = tubes.slice(0, n);
    shuffleArray(nonEmpty, rng);
    return [...nonEmpty, []];
  }

  function generateRoundBoard(phase: PhaseDef, roundNum: number, phaseSeed: number): {
    tubes: number[][];
    idealMoves: number;
    numColors: number;
    emptyCount: number;
  } {
    const { numColors, emptyCount } = getRoundSpecs(phase, roundNum, phaseSeed);
    const roundRng = mulberry32((phaseSeed + roundNum * 104729) >>> 0);

    const allColorIndices = shuffleArray([...Array(COLORS.length).keys()], roundRng);
    const palette = allColorIndices.slice(0, numColors);

    let fallbackCandidate: { tubes: number[][]; idealMoves: number; numColors: number; emptyCount: number } | null = null;
    const maxAttempts = emptyCount === 1 ? 25 : 40;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const rng = mulberry32((phaseSeed * 31 + roundNum * 1000003 + attempt * 7919) >>> 0);
      let tubes: number[][];

      if (emptyCount === 1) {
        tubes = generateOneEmptyBoard(palette, rng);
        let solvedFound = false;
        let transitions = 0;
        for (let t = 0; t < numColors; t++) {
          if (isTubeComplete(tubes[t])) {
            solvedFound = true;
            break;
          }
          for (let k = 1; k < TUBE_CAPACITY; k++) {
            if (tubes[t][k] !== tubes[t][k - 1]) transitions++;
          }
        }
        if (solvedFound || transitions < numColors * 2) continue;
      } else {
        const pool: number[] = [];
        for (let c = 0; c < numColors; c++) {
          for (let k = 0; k < TUBE_CAPACITY; k++) pool.push(palette[c]);
        }
        shuffleArray(pool, rng);

        tubes = [];
        let solvedFound = false;
        let transitions = 0;

        for (let t = 0; t < numColors; t++) {
          const tube = pool.slice(t * TUBE_CAPACITY, (t + 1) * TUBE_CAPACITY);
          if (isTubeComplete(tube)) {
            solvedFound = true;
            break;
          }
          for (let k = 1; k < TUBE_CAPACITY; k++) {
            if (tube[k] !== tube[k - 1]) transitions++;
          }
          tubes.push(tube);
        }
        if (solvedFound || transitions < Math.floor(numColors * 1.5)) continue;

        for (let e = 0; e < emptyCount; e++) tubes.push([]);
      }

      const res = findIdealMoves(tubes, 32000, attempt < 12 ? 90 : 130);
      if (res) {
        if (res.exact) {
          return { tubes, idealMoves: res.idealMoves, numColors, emptyCount };
        }
        if (!fallbackCandidate) {
          fallbackCandidate = { tubes, idealMoves: res.idealMoves, numColors, emptyCount };
        }
      }
    }

    if (fallbackCandidate) return fallbackCandidate;

    const safeTubes = generateOneEmptyBoard(palette, roundRng);
    while (safeTubes.length < numColors + emptyCount) safeTubes.push([]);
    const res = findIdealMoves(safeTubes, 25000, 120);
    return {
      tubes: safeTubes,
      idealMoves: res ? res.idealMoves : numColors * 3,
      numColors,
      emptyCount
    };
  }

  // =========================================================
  // Persistence & Phase Management
  // =========================================================
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch {
      // Ignore storage errors
    }
  }

  function initDefaultState() {
    sfxVolume = 0.5;
    bgmVolume = 0.5;
    appState = {
      language: detectSystemLanguage(),
      activePhaseId: 'treinamento',
      bgmTrack: 'elevator',
      muted: false,
      sfxVolume: 50,
      bgmVolume: 50,
      visualMode: 'color',
      mysteryModeEnabled: true,
      hintDuration: 1,
      phases: {}
    };
    PHASES.forEach(p => {
      appState.phases[p.id] = createDefaultPhaseData();
    });
  }

  function generateMysteryHiddenCounts(
    phase: PhaseDef,
    roundNum: number,
    tubes: number[][],
    seed: number
  ): number[] {
    const counts = new Array(tubes.length).fill(0);
    if (phase.isTutorial || phase.id === 'facil') {
      return counts;
    }

    let totalFilledBlocks = 0;
    for (let i = 0; i < tubes.length; i++) {
      totalFilledBlocks += tubes[i].length;
    }
    if (totalFilledBlocks === 0) return counts;

    const progress = phase.totalRounds > 1
      ? Math.min(1, Math.max(0, (roundNum - 1) / (phase.totalRounds - 1)))
      : 1;

    let minRatio = 0.18;
    let maxRatio = 0.36;
    let maxPerTube = 2;

    if (phase.id === 'dificil') {
      minRatio = 0.36;
      maxRatio = 0.58;
      maxPerTube = 3;
    } else if (phase.id === 'desafiador') {
      minRatio = 0.5;
      maxRatio = 0.68;
      maxPerTube = 3;
    }

    // Hard cap: max 68% hidden blocks so at least ~32% of board colors stay visible
    const hardMaxHidden = Math.floor(totalFilledBlocks * 0.68);
    const targetHidden = Math.min(
      hardMaxHidden,
      Math.round(totalFilledBlocks * (minRatio + (maxRatio - minRatio) * progress))
    );
    if (targetHidden <= 0) return counts;

    const rand = mulberry32((seed ^ Math.imul(roundNum, 0x9E3779B9) ^ 0x517CC1B7) >>> 0);
    const maxPossiblePerTube = tubes.map((tube) => {
      if (tube.length <= 1) return 0;
      return Math.min(maxPerTube, Math.max(0, tube.length - getTopRunLength(tube)));
    });

    const candidateTubes: number[] = [];
    for (let i = 0; i < tubes.length; i++) {
      if (maxPossiblePerTube[i] > 0) candidateTubes.push(i);
    }
    if (candidateTubes.length === 0) return counts;

    for (let i = candidateTubes.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [candidateTubes[i], candidateTubes[j]] = [candidateTubes[j], candidateTubes[i]];
    }

    let hiddenSoFar = 0;
    for (let depth = 1; depth <= maxPerTube && hiddenSoFar < targetHidden; depth++) {
      for (let k = 0; k < candidateTubes.length && hiddenSoFar < targetHidden; k++) {
        const tubeIdx = candidateTubes[k];
        if (phase.id === 'medio' && k === candidateTubes.length - 1 && candidateTubes.length > 2) continue;
        if (counts[tubeIdx] < maxPossiblePerTube[tubeIdx]) {
          counts[tubeIdx]++;
          hiddenSoFar++;
        }
      }
    }

    return counts;
  }

  function ensureBoardMysteryArrays(board: BoardState) {
    if (!Array.isArray(board.hiddenCounts) || board.hiddenCounts.length !== board.tubes.length) {
      board.hiddenCounts = board.tubes.map((_, i) =>
        Array.isArray(board.hiddenCounts) && typeof board.hiddenCounts[i] === 'number'
          ? Math.max(0, board.hiddenCounts[i])
          : 0
      );
    }
    if (!Array.isArray(board.initialHiddenCounts) || board.initialHiddenCounts.length !== board.initialTubes.length) {
      board.initialHiddenCounts = new Array(board.initialTubes.length).fill(0);
    }
  }

  function loadState(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.phases !== 'object') return false;

      initDefaultState();
      const savedLang = normalizeLangCode(parsed.language);
      appState.language = savedLang || detectSystemLanguage();
      if (PHASES.some(p => p.id === parsed.activePhaseId)) {
        appState.activePhaseId = parsed.activePhaseId;
      }
      if (BGM_TRACKS[parsed.bgmTrack]) {
        appState.bgmTrack = parsed.bgmTrack;
      }
      appState.muted = Boolean(parsed.muted);
      const savedSfxVol = typeof parsed.sfxVolume === 'number' && !Number.isNaN(parsed.sfxVolume)
        ? Math.min(100, Math.max(0, Math.round(parsed.sfxVolume)))
        : 50;
      appState.sfxVolume = savedSfxVol;
      sfxVolume = savedSfxVol / 100;
      const savedBgmVol = typeof parsed.bgmVolume === 'number' && !Number.isNaN(parsed.bgmVolume)
        ? Math.min(100, Math.max(0, Math.round(parsed.bgmVolume)))
        : 50;
      appState.bgmVolume = savedBgmVol;
      bgmVolume = savedBgmVol / 100;
      if (parsed.visualMode === 'color' || parsed.visualMode === 'pattern' || parsed.visualMode === 'both') {
        appState.visualMode = parsed.visualMode;
      } else {
        appState.visualMode = 'color';
      }
      appState.mysteryModeEnabled = typeof parsed.mysteryModeEnabled === 'boolean' ? parsed.mysteryModeEnabled : true;
      if (parsed.inhibitHints === true) {
        appState.hintDuration = 0;
      } else if (parsed.hintDuration === 'infinite') {
        appState.hintDuration = 6;
      } else if (
        typeof parsed.hintDuration === 'number' &&
        !Number.isNaN(parsed.hintDuration) &&
        parsed.hintDuration >= 0 &&
        parsed.hintDuration <= 6
      ) {
        appState.hintDuration = Math.round(parsed.hintDuration) as HintDurationStep;
      } else {
        appState.hintDuration = 1;
      }

      PHASES.forEach(p => {
        const savedP = parsed.phases[p.id];
        if (savedP && typeof savedP.currentRound === 'number') {
          const loadedBoard: BoardState | null = savedP.board && Array.isArray(savedP.board.tubes) ? savedP.board : null;
          if (loadedBoard) {
            ensureBoardMysteryArrays(loadedBoard);
          }
          appState.phases[p.id] = {
            currentRound: Math.min(p.totalRounds, Math.max(1, savedP.currentRound)),
            completedRounds: Array.isArray(savedP.completedRounds) ? savedP.completedRounds : [],
            easyRounds: Array.isArray(savedP.easyRounds) ? savedP.easyRounds : [],
            phaseCompleted: Boolean(savedP.phaseCompleted),
            seed: typeof savedP.seed === 'number' ? savedP.seed : randomSeedInt(),
            board: loadedBoard
          };
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  function loadOrCreateRoundBoard(phaseId: string, roundNum: number) {
    const phase = getPhaseDef(phaseId);
    const pData = appState.phases[phaseId];
    pData.currentRound = roundNum;

    if (phase.isTutorial) {
      const lesson = TUTORIAL_LESSONS[roundNum - 1];
      const zeroHidden = new Array(lesson.tubes.length).fill(0);
      pData.board = {
        round: roundNum,
        tubes: cloneTubes(lesson.tubes),
        initialTubes: cloneTubes(lesson.tubes),
        hiddenCounts: [...zeroHidden],
        initialHiddenCounts: [...zeroHidden],
        history: [],
        moves: 0,
        idealMoves: lesson.idealMoves,
        baseIdealMoves: lesson.idealMoves,
        extraTubeUsed: false,
        tutorialStep: 0
      };
      resetTubeSequence();
      saveState();
      return;
    }

    const gen = generateRoundBoard(phase, roundNum, pData.seed);
    const initialHidden = appState.mysteryModeEnabled
      ? generateMysteryHiddenCounts(phase, roundNum, gen.tubes, pData.seed)
      : new Array(gen.tubes.length).fill(0);
    pData.board = {
      round: roundNum,
      tubes: cloneTubes(gen.tubes),
      initialTubes: cloneTubes(gen.tubes),
      hiddenCounts: [...initialHidden],
      initialHiddenCounts: [...initialHidden],
      history: [],
      moves: 0,
      idealMoves: gen.idealMoves,
      baseIdealMoves: gen.idealMoves,
      extraTubeUsed: false
    };
    resetTubeSequence();
    saveState();
  }

  function switchToPhase(phaseId: string) {
    const phase = getPhaseDef(phaseId);
    appState.activePhaseId = phase.id;
    const pData = appState.phases[phase.id];

    if (!pData.board || pData.board.round !== pData.currentRound) {
      loadOrCreateRoundBoard(phase.id, pData.currentRound);
    }
    selectedIdx = null;
    isAnimating = false;
    resetTubeSequence();
    saveState();
    render();
  }

  // =========================================================
  // Responsive Layout Solver
  // =========================================================
  function splitIntoRows(total: number, rowCount: number): number[] {
    const base = Math.floor(total / rowCount);
    const rem = total % rowCount;
    const rows: number[] = [];
    for (let r = 0; r < rowCount; r++) {
      rows.push(base + (r < rem ? 1 : 0));
    }
    return rows;
  }

  function computeOptimalLayout(total: number): LayoutResult {
    const wrapRect = boardWrapEl.getBoundingClientRect();
    const availW = Math.max(240, wrapRect.width - 24);
    const availH = Math.max(180, wrapRect.height - 12);

    const candidateRowCounts = total <= 4 ? [1, 2] : (total >= 11 ? [2, 3] : [2]);
    let best: LayoutResult | null = null;

    for (let idx = 0; idx < candidateRowCounts.length; idx++) {
      const rows = candidateRowCounts[idx];
      const counts = splitIntoRows(total, rows);
      const maxCols = counts[0];

      const rowGap = rows === 3 ? 12 : 18;
      const tubeGap = maxCols >= 6 ? 6 : (maxCols === 5 ? 10 : 14);
      const rimAllowance = 8;

      const wLimit = Math.min(64, (availW - (maxCols - 1) * tubeGap) / maxCols - rimAllowance);
      const hLimit = Math.min(188, (availH - (rows - 1) * rowGap) / rows - 26);

      if (wLimit < 24 || hLimit < 76) continue;

      let tubeW: number;
      let tubeH: number;
      if (wLimit * 3.0 <= hLimit) {
        tubeW = wLimit;
        tubeH = tubeW * 3.0;
      } else {
        tubeH = hLimit;
        tubeW = Math.min(wLimit, tubeH / 2.65);
      }

      tubeW = Math.floor(tubeW);
      tubeH = Math.floor(tubeH);

      const score = tubeW * 1000 + tubeH;
      if (!best || score > (best.score ?? -1)) {
        best = { counts, tubeW, tubeH, tubeGap, rowGap, score };
      }
    }

    if (!best) {
      const counts = splitIntoRows(total, total >= 10 ? 3 : 2);
      const maxCols = counts[0];
      const tubeW = Math.max(24, Math.floor((availW - (maxCols - 1) * 6) / maxCols - 8));
      const tubeH = Math.max(76, Math.floor(tubeW * 2.8));
      best = { counts, tubeW, tubeH, tubeGap: 6, rowGap: 10 };
    }

    return best;
  }

  function applyLayoutVariables(layout: LayoutResult) {
    boardEl.style.setProperty('--tube-w', `${layout.tubeW}px`);
    boardEl.style.setProperty('--tube-h', `${layout.tubeH}px`);
    boardEl.style.setProperty('--tube-gap', `${layout.tubeGap}px`);
    boardEl.style.setProperty('--row-gap', `${layout.rowGap}px`);
  }

  function arraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // =========================================================
  // --- TUTORIAL --- Contextual Tip & Tube Hint Highlight
  // =========================================================
  function updateTutorialTip() {
    const phase = activePhaseDef();
    const board = activeBoard();

    // Clear any existing hints first
    const prevHints = boardEl.querySelectorAll('.tube.tutorial-hint');
    prevHints.forEach(el => el.classList.remove('tutorial-hint'));

    if (!phase.isTutorial || !board) {
      tutorialTipEl.classList.remove('visible');
      return;
    }

    const lesson = TUTORIAL_LESSONS[board.round - 1];
    if (!lesson) {
      tutorialTipEl.classList.remove('visible');
      return;
    }

    const steps = lesson.steps;
    let stepIdx = steps.findIndex(s => !s.condition(board, selectedIdx));
    if (stepIdx === -1) {
      stepIdx = steps.length - 1;
    }
    board.tutorialStep = stepIdx;

    const currentStep = steps[stepIdx];
    const localizedLessons = (I18N[appState.language] || I18N.en).tutorialLessons;
    const localizedLesson = localizedLessons[board.round - 1];
    tutorialTipTitleEl.textContent = localizedLesson ? localizedLesson.title : lesson.title;
    tutorialTipStepEl.textContent = t('tutorialStepCounter', { current: stepIdx + 1, total: steps.length });
    tutorialTipStepEl.style.display = steps.length > 1 ? 'inline-block' : 'none';
    tutorialTipTextEl.textContent = (localizedLesson && localizedLesson.steps[stepIdx]) || currentStep.text;
    tutorialTipEl.classList.add('visible');

    if (!isAnimating && !isGameWon(board.tubes) && typeof currentStep.highlightTube === 'function') {
      const hintIdx = currentStep.highlightTube(board, selectedIdx);
      if (hintIdx !== null && hintIdx !== undefined && hintIdx !== selectedIdx) {
        const hintEl = getTubeElement(hintIdx);
        if (hintEl) hintEl.classList.add('tutorial-hint');
      }
    }
  }

  // =========================================================
  // Rendering & Efficiency Metrics
  // =========================================================
  function computeEfficiency(moves: number, idealMoves: number): number | null {
    if (moves <= 0 || idealMoves <= 0) return null;
    return Math.min(100, Math.round((idealMoves / moves) * 100));
  }

  function getEfficiencyClass(eff: number | null): string {
    if (eff === null) return '';
    if (eff >= 90) return 'eff-high';
    if (eff >= 70) return 'eff-mid';
    return 'eff-low';
  }

  function getSegments(tube: number[], hiddenCount = 0): Array<{ color: number; count: number; isMystery: boolean }> {
    const segs: Array<{ color: number; count: number; isMystery: boolean }> = [];
    const safeHidden = Math.min(hiddenCount, Math.max(0, tube.length - getTopRunLength(tube)));
    for (let i = 0; i < tube.length; i++) {
      if (i < safeHidden) {
        segs.push({ color: -1, count: 1, isMystery: true });
        continue;
      }
      const c = tube[i];
      if (segs.length > 0 && !segs[segs.length - 1].isMystery && segs[segs.length - 1].color === c) {
        segs[segs.length - 1].count++;
      } else {
        segs.push({ color: c, count: 1, isMystery: false });
      }
    }
    return segs;
  }

  function createSegmentElement(
    colorIdx: number,
    heightPct: number,
    isTop: boolean,
    isMystery = false,
    justRevealed = false
  ): HTMLDivElement {
    const seg = document.createElement('div');
    if (isMystery) {
      seg.className = 'liquid-segment is-mystery';
      seg.style.height = heightPct + '%';
      const mark = document.createElement('span');
      mark.className = 'liquid-mystery-mark';
      mark.textContent = '?';
      mark.setAttribute('aria-hidden', 'true');
      seg.appendChild(mark);
      return seg;
    }
    const c = COLORS[colorIdx];
    seg.className = 'liquid-segment' + (isTop ? ' is-top' : '') + (justRevealed ? ' mystery-revealed' : '');
    seg.dataset.color = String(colorIdx);
    seg.style.height = heightPct + '%';
    if (appState.visualMode === 'pattern') {
      seg.style.background = 'linear-gradient(90deg, #334155 0%, #475569 32%, #64748B 52%, #475569 74%, #334155 100%)';
    } else {
      seg.style.background = `linear-gradient(90deg, ${c.dark} 0%, ${c.main} 32%, ${c.light} 52%, ${c.main} 74%, ${c.dark} 100%)`;
    }
    const shimmer = document.createElement('span');
    shimmer.className = 'liquid-shimmer';
    shimmer.style.animationDelay = `${-((colorIdx * 0.65) % 4).toFixed(2)}s`;
    shimmer.setAttribute('aria-hidden', 'true');
    seg.appendChild(shimmer);
    return seg;
  }

  function getTubeElement(idx: number): HTMLElement | null {
    return boardEl.querySelector(`.tube[data-index="${idx}"]`);
  }

  function updateUIHeaderAndControls() {
    const phase = activePhaseDef();
    const pData = activePhaseData();
    const board = activeBoard();

    phaseDotEl.className = `phase-dot ${phase.id}`;
    phaseNameEl.textContent = getLocalizedPhase(phase.id).name;
    roundNumEl.textContent = String(pData.currentRound);
    roundTotalEl.textContent = String(phase.totalRounds);

    const currentTrack = getCurrentBgmTrack();
    bgmEmojiEl.textContent = currentTrack.icon;
    bgmLabelEl.textContent = getLocalizedBgm(currentTrack.id).name;

    movesNumEl.textContent = String(board.moves);
    idealMovesNumEl.textContent = board.idealMoves > 0 ? String(board.idealMoves) : '—';

    const eff = computeEfficiency(board.moves, board.idealMoves);
    effNumEl.textContent = eff === null ? '—' : `${eff}%`;
    effNumEl.className = 'stat-chip-val ' + getEfficiencyClass(eff);

    const won = isGameWon(board.tubes);
    const deadlocked = !isAnimating && !won && (!hasAnyUsefulMove(board.tubes) || isDebugDeadlockForced);

    btnUndo.disabled = board.history.length === 0 || isAnimating;
    const hintsDisabled = !areHintsEnabled();
    btnHint.style.display = hintsDisabled ? 'none' : '';
    btnHint.disabled = hintsDisabled || isAnimating || won || deadlocked;
    btnRestart.disabled = isAnimating;
    btnExtra.disabled = Boolean(phase.isTutorial) || board.extraTubeUsed || isAnimating;
    extraBadgeEl.textContent = phase.isTutorial ? '—' : (board.extraTubeUsed ? '0' : '1');

    btnUndo.classList.toggle('highlight-hint', deadlocked && board.history.length > 0);
    btnExtra.classList.toggle('highlight-hint', deadlocked && !phase.isTutorial && !board.extraTubeUsed);
    btnRestart.classList.toggle('highlight-hint', deadlocked && board.history.length === 0 && (Boolean(phase.isTutorial) || board.extraTubeUsed));

    const ghostEl = boardEl.querySelector<HTMLElement>('.tube-ghost');
    if (ghostEl) {
      ghostEl.classList.toggle('highlight-hint', deadlocked && !phase.isTutorial && !board.extraTubeUsed);
      ghostEl.setAttribute('aria-label', t('ctrlExtra'));
      ghostEl.title = t('ctrlExtra');
    }

    if (deadlocked) {
      deadlockTextEl.textContent = (phase.isTutorial || board.extraTubeUsed)
        ? t('deadlockNoExtra')
        : t('deadlockWithExtra');
    }
    deadlockBannerEl.classList.toggle('visible', deadlocked);

    btnSound.classList.toggle('muted', appState.muted);
    iconSoundOn.style.display = appState.muted ? 'none' : 'block';
    iconSoundOff.style.display = appState.muted ? 'block' : 'none';

    const showPatterns = appState.visualMode === 'pattern' || appState.visualMode === 'both';
    const isMono = appState.visualMode === 'pattern';
    boardEl.classList.toggle('patterns-on', showPatterns);
    boardEl.classList.toggle('patterns-mono', isMono);
    btnSettings.classList.toggle('settings-active', appState.visualMode !== 'color');
  }

  function shouldShowGhostExtraSlot(board: BoardState): boolean {
    const phase = activePhaseDef();
    return !phase.isTutorial && !board.extraTubeUsed;
  }

  function render(newTubeIdx = -1, justCompletedIdx = -1, revealedSrcIdx = -1) {
    const board = activeBoard();
    ensureBoardMysteryArrays(board);
    const showGhost = shouldShowGhostExtraSlot(board);
    const totalSlots = board.tubes.length + (showGhost ? 1 : 0);
    const layout = computeOptimalLayout(totalSlots);
    currentRowCounts = layout.counts;
    applyLayoutVariables(layout);

    boardEl.innerHTML = '';
    let cursor = 0;

    for (let r = 0; r < layout.counts.length; r++) {
      const count = layout.counts[r];
      const row = document.createElement('div');
      row.className = 'tube-row';

      for (let k = 0; k < count; k++) {
        const i = cursor++;
        if (i >= board.tubes.length) {
          const ghostSlot = document.createElement('div');
          ghostSlot.className = 'tube-slot tube-slot-ghost';

          const ghostBtn = document.createElement('button');
          ghostBtn.type = 'button';
          ghostBtn.className = 'tube tube-ghost';
          ghostBtn.setAttribute('aria-label', t('ctrlExtra'));
          ghostBtn.title = t('ctrlExtra');
          ghostBtn.innerHTML = `
            <span class="tube-ghost-level-line" aria-hidden="true"></span>
            <span class="tube-ghost-inner" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span class="tube-ghost-label">+1</span>
            </span>
          `;
          ghostBtn.addEventListener('click', handleExtraTube);

          ghostSlot.appendChild(ghostBtn);
          row.appendChild(ghostSlot);
          continue;
        }

        const tubeData = board.tubes[i];
        const complete = isTubeComplete(tubeData);

        const slot = document.createElement('div');
        slot.className = 'tube-slot' + (complete ? ' completed' : '') + (i === justCompletedIdx ? ' just-completed' : '');

        if (complete) {
          const cork = document.createElement('div');
          cork.className = 'tube-cork';
          cork.setAttribute('aria-hidden', 'true');
          slot.appendChild(cork);
        }

        const tubeEl = document.createElement('div');
        tubeEl.className = 'tube';
        if (i === selectedIdx) tubeEl.classList.add('selected');

        const tubeIndexLabel = i + 1;
        if (tubeData.length === 0) {
          tubeEl.setAttribute('aria-label', t('ariaTubeEmpty', { index: tubeIndexLabel }));
        } else if (complete) {
          tubeEl.classList.add('completed');
          const topColorName = COLORS[tubeData[tubeData.length - 1]].name;
          tubeEl.setAttribute('aria-label', t('ariaTubeComplete', { index: tubeIndexLabel, color: topColorName }));
        } else {
          const topColorName = COLORS[tubeData[tubeData.length - 1]].name;
          const layersCount = tubeData.length;
          const hiddenCount = appState.mysteryModeEnabled ? (board.hiddenCounts?.[i] ?? 0) : 0;
          const visibleLayers = layersCount - hiddenCount;
          const colorDesc = hiddenCount > 0 && visibleLayers <= 0 ? '?' : topColorName;
          tubeEl.setAttribute('aria-label', t('ariaTubeLayers', {
            index: tubeIndexLabel,
            color: colorDesc,
            count: layersCount
          }));
        }

        if (i === justCompletedIdx) tubeEl.classList.add('just-completed');
        if (i === newTubeIdx) tubeEl.classList.add('pop-in');
        tubeEl.dataset.index = String(i);

        const liqContainer = document.createElement('div');
        liqContainer.className = 'liquid-container';

        const hiddenCount = appState.mysteryModeEnabled ? (board.hiddenCounts?.[i] ?? 0) : 0;
        const segs = getSegments(tubeData, hiddenCount);
        segs.forEach((s, segIndex) => {
          const isTop = segIndex === segs.length - 1;
          const justRevealed = i === revealedSrcIdx && isTop && !s.isMystery;
          liqContainer.appendChild(createSegmentElement(s.color, s.count * 25, isTop, s.isMystery, justRevealed));
        });

        tubeEl.appendChild(liqContainer);
        tubeEl.addEventListener('click', () => handleTubeTap(i));

        slot.appendChild(tubeEl);
        row.appendChild(slot);
      }

      boardEl.appendChild(row);
    }

    updateUIHeaderAndControls();
    updateTutorialTip();
    updateColorFocus();
    updateHintHighlight();
  }

  let resizeObserver: ResizeObserver | null = null;
  const handleWindowResize = () => {
    const board = activeBoard();
    if (board && board.tubes.length > 0 && !isAnimating) render();
  };

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      const board = activeBoard();
      if (!board || board.tubes.length === 0 || isAnimating) return;
      const totalSlots = board.tubes.length + (shouldShowGhostExtraSlot(board) ? 1 : 0);
      const layout = computeOptimalLayout(totalSlots);
      if (!arraysEqual(layout.counts, currentRowCounts)) {
        render();
      } else {
        applyLayoutVariables(layout);
        updateHintHighlight();
      }
    });
    resizeObserver.observe(boardWrapEl);
  } else {
    window.addEventListener('resize', handleWindowResize);
  }

  // =========================================================
  // Smooth Pouring Animation & Gameplay Logic
  // =========================================================
  function triggerShake(idx: number) {
    const el = getTubeElement(idx);
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 360);
  }

  let activeFocusTubeIdx: number | null = null;
  let activeHint: { from: number; to: number } | null = null;
  let hintTimerId: ReturnType<typeof setTimeout> | null = null;
  let hintAutoSelectedFrom: number | null = null;
  let hintLongPressTimerId: ReturnType<typeof setTimeout> | null = null;
  let hintLongPressTriggered = false;

  function updateColorFocus() {
    const board = activeBoard();
    const tubeEls = boardEl.querySelectorAll<HTMLElement>('.tube:not(.tube-ghost)');
    if (
      activeFocusTubeIdx === null ||
      selectedIdx !== activeFocusTubeIdx ||
      !board.tubes[activeFocusTubeIdx] ||
      board.tubes[activeFocusTubeIdx].length === 0
    ) {
      tubeEls.forEach((el) => {
        el.classList.remove('focus-valid', 'focus-dimmed');
        el.parentElement?.classList.remove('focus-dimmed');
      });
      return;
    }

    const srcTube = board.tubes[activeFocusTubeIdx];
    const topColor = srcTube[srcTube.length - 1];
    tubeEls.forEach((el) => {
      const i = Number(el.dataset.index);
      if (i === activeFocusTubeIdx) {
        el.classList.remove('focus-valid', 'focus-dimmed');
        el.parentElement?.classList.remove('focus-dimmed');
        return;
      }
      const dstTube = board.tubes[i];
      const isEmpty = Array.isArray(dstTube) && dstTube.length === 0;
      const hasMatchingTopWithSpace =
        Array.isArray(dstTube) &&
        dstTube.length < TUBE_CAPACITY &&
        dstTube[dstTube.length - 1] === topColor;
      const valid = isEmpty || hasMatchingTopWithSpace;

      el.classList.toggle('focus-valid', valid);
      el.classList.toggle('focus-dimmed', !valid);
      el.parentElement?.classList.toggle('focus-dimmed', !valid);
    });
  }

  function clearHintTimer() {
    if (hintTimerId !== null) {
      clearTimeout(hintTimerId);
      hintTimerId = null;
    }
  }

  function cancelHintLongPress() {
    if (hintLongPressTimerId !== null) {
      clearTimeout(hintLongPressTimerId);
      hintLongPressTimerId = null;
    }
    btnHint.classList.remove('is-long-pressing');
  }

  function updateHintHighlight() {
    const tubeEls = boardEl.querySelectorAll<HTMLElement>('.tube:not(.tube-ghost)');
    tubeEls.forEach((el) => {
      const i = Number(el.dataset.index);
      el.classList.toggle('hint-source', Boolean(activeHint && i === activeHint.from));
      el.classList.toggle('hint-target', Boolean(activeHint && i === activeHint.to));
    });

    if (!hintSvg) return;
    hintSvg.innerHTML = '';
    const showHintArrow = appState.activePhaseId === 'treinamento' || appState.activePhaseId === 'facil';
    if (!activeHint || isAnimating || !showHintArrow) return;

    const srcEl = getTubeElement(activeHint.from);
    const dstEl = getTubeElement(activeHint.to);
    if (!srcEl || !dstEl) return;

    const srcRefRect = (srcEl.parentElement ?? srcEl).getBoundingClientRect();
    const dstRefRect = (dstEl.parentElement ?? dstEl).getBoundingClientRect();
    if (srcRefRect.width <= 0 || dstRefRect.width <= 0) return;

    const x1 = srcRefRect.left + srcRefRect.width / 2;
    const y1 = srcEl.parentElement
      ? (srcEl.classList.contains('selected') ? srcRefRect.top - 7 : srcRefRect.top + 6)
      : srcRefRect.top - 16;
    const x2 = dstRefRect.left + dstRefRect.width / 2;
    const y2 = dstEl.parentElement ? dstRefRect.top + 4 : dstRefRect.top - 16;
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const arcLift = Math.min(72, Math.max(30, dist * 0.26));
    const cx = (x1 + x2) / 2;
    const cy = Math.min(y1, y2) - arcLift;
    const pathD = `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;

    const ns = 'http://www.w3.org/2000/svg';
    const defs = document.createElementNS(ns, 'defs');

    const grad = document.createElementNS(ns, 'linearGradient');
    grad.setAttribute('id', 'hint-arrow-grad');
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    grad.setAttribute('x1', String(x1));
    grad.setAttribute('y1', String(y1));
    grad.setAttribute('x2', String(x2));
    grad.setAttribute('y2', String(y2));
    const stop1 = document.createElementNS(ns, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#FFD600');
    const stop2 = document.createElementNS(ns, 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#00DC73');
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);

    const marker = document.createElementNS(ns, 'marker');
    marker.setAttribute('id', 'hint-arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '7');
    marker.setAttribute('refY', '5');
    marker.setAttribute('orient', 'auto');
    const arrowPoly = document.createElementNS(ns, 'polygon');
    arrowPoly.setAttribute('points', '0 1.2, 8.5 5, 0 8.8, 1.8 5');
    arrowPoly.setAttribute('fill', '#00DC73');
    marker.appendChild(arrowPoly);
    defs.appendChild(marker);
    hintSvg.appendChild(defs);

    const glowPath = document.createElementNS(ns, 'path');
    glowPath.setAttribute('class', 'hint-arrow-glow');
    glowPath.setAttribute('d', pathD);
    glowPath.setAttribute('fill', 'none');
    glowPath.setAttribute('stroke', 'url(#hint-arrow-grad)');
    glowPath.setAttribute('stroke-width', '6');
    glowPath.setAttribute('stroke-linecap', 'round');
    glowPath.style.filter = 'blur(3px)';
    hintSvg.appendChild(glowPath);

    const mainPath = document.createElementNS(ns, 'path');
    mainPath.setAttribute('class', 'hint-arrow-path');
    mainPath.setAttribute('d', pathD);
    mainPath.setAttribute('fill', 'none');
    mainPath.setAttribute('stroke', 'url(#hint-arrow-grad)');
    mainPath.setAttribute('stroke-width', '3.2');
    mainPath.setAttribute('stroke-linecap', 'round');
    mainPath.setAttribute('marker-end', 'url(#hint-arrowhead)');
    hintSvg.appendChild(mainPath);
  }

  function clearActiveHint() {
    clearHintTimer();
    hintAutoSelectedFrom = null;
    if (activeFocusTubeIdx !== null) {
      activeFocusTubeIdx = null;
      updateColorFocus();
    }
    if (activeHint !== null) {
      activeHint = null;
      updateHintHighlight();
    }
  }

  function handleTubeTap(idx: number) {
    if (isAnimating) return;
    ensureAudio();

    const board = activeBoard();
    const tapped = board.tubes[idx];

    if (selectedIdx === null) {
      // Caso 5: tocar em tubo vazio sem nada selecionado = ação inválida com som de erro
      if (tapped.length === 0) {
        clearActiveHint();
        triggerShake(idx);
        playErrorSound();
        return;
      }
      // Caso 1: tubo já completo = erro sonoro
      if (isTubeComplete(tapped)) {
        clearActiveHint();
        triggerShake(idx);
        playErrorSound();
        return;
      }
      if (activeHint && idx !== activeHint.from) {
        clearActiveHint();
      }
      selectedIdx = idx;
      playSelectSound();
      const el = getTubeElement(idx);
      if (el) el.classList.add('selected');
      updateColorFocus();
      updateHintHighlight();
      updateTutorialTip();
      return;
    }

    // Desseleção: mesmo tubo -> silencioso
    if (selectedIdx === idx) {
      const el = getTubeElement(idx);
      if (el) el.classList.remove('selected');
      selectedIdx = null;
      clearActiveHint();
      updateColorFocus();
      updateTutorialTip();
      return;
    }

    const src = board.tubes[selectedIdx];
    if (canPour(src, tapped)) {
      clearActiveHint();
      executePour(selectedIdx, idx);
    } else {
      // Casos 2, 3 e 4: cor diferente em tubo não vazio, tubo cheio (4/4) ou tubo completo
      const prevEl = getTubeElement(selectedIdx);
      if (prevEl) prevEl.classList.remove('selected');
      selectedIdx = null;
      clearActiveHint();
      updateColorFocus();
      triggerShake(idx);
      playErrorSound();
      updateTutorialTip();
    }
  }

  function triggerTubeCompleteFeedback() {
    const now = performance.now();
    if (lastTubeCompleteTime > 0 && now - lastTubeCompleteTime <= 7000) {
      tubeCompleteStreak++;
    } else {
      tubeCompleteStreak = 1;
    }
    lastTubeCompleteTime = now;

    if (tubeCompleteStreak >= 2) {
      showSequenceToast(t('toastStreak', { count: tubeCompleteStreak }), 'style-green');
    } else {
      showSequenceToast(t('toastTubeComplete'), '');
    }
    playTubeCompleteSound(tubeCompleteStreak);
  }

  function executePour(srcIdx: number, dstIdx: number) {
    isAnimating = true;
    selectedIdx = null;
    clearActiveHint();
    boardEl.classList.add('is-pouring');
    updateColorFocus();
    updateUIHeaderAndControls();

    const board = activeBoard();
    const srcArr = board.tubes[srcIdx];
    const dstArr = board.tubes[dstIdx];
    const topColor = srcArr[srcArr.length - 1];
    const runLen = getTopRunLength(srcArr);
    const space = TUBE_CAPACITY - dstArr.length;
    const pourCount = Math.min(runLen, space);

    const srcEl = getTubeElement(srcIdx)!;
    const dstEl = getTubeElement(dstIdx)!;

    playPourSound(pourCount);

    const srcRect = srcEl.getBoundingClientRect();
    const dstRect = dstEl.getBoundingClientRect();
    const goingRight = dstRect.left >= srcRect.left;

    srcEl.classList.remove('selected');
    srcEl.classList.add(goingRight ? 'pouring-right' : 'pouring-left');

    const x1 = goingRight ? srcRect.right - srcRect.width * 0.24 : srcRect.left + srcRect.width * 0.24;
    const y1 = srcRect.top - 1;
    const x2 = dstRect.left + dstRect.width / 2;
    const dstEmptyRatio = 1 - (dstArr.length + pourCount * 0.5) / TUBE_CAPACITY;
    const y2 = dstRect.top + 14 + dstEmptyRatio * (dstRect.height - 22);

    const cx = (x1 + x2) / 2;
    const cy = Math.min(y1, dstRect.top) - 42;

    const colorObj = appState.visualMode === 'pattern'
      ? { name: 'Padrão', main: '#94A3B8', light: '#CBD5E1', dark: '#475569' }
      : COLORS[topColor];
    const pathD = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'pour-stream');
    path.setAttribute('d', pathD);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', colorObj.main);
    path.setAttribute('stroke-width', '7');
    path.setAttribute('stroke-linecap', 'round');
    path.style.filter = `drop-shadow(0 0 6px ${colorObj.main})`;

    const sheenPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    sheenPath.setAttribute('class', 'pour-stream pour-stream-sheen');
    sheenPath.setAttribute('d', pathD);
    sheenPath.setAttribute('fill', 'none');
    sheenPath.setAttribute('stroke', 'rgba(255, 255, 255, 0.52)');
    sheenPath.setAttribute('stroke-width', '2.2');
    sheenPath.setAttribute('stroke-linecap', 'round');

    const pathLen = 600;
    path.style.strokeDasharray = `${pathLen}`;
    path.style.strokeDashoffset = `${pathLen}`;
    sheenPath.style.strokeDasharray = `${pathLen}`;
    sheenPath.style.strokeDashoffset = `${pathLen}`;
    pourSvg.appendChild(path);
    pourSvg.appendChild(sheenPath);

    const srcContainer = srcEl.querySelector('.liquid-container') as HTMLElement;
    const dstContainer = dstEl.querySelector('.liquid-container') as HTMLElement;

    const srcTopSeg = srcContainer.lastElementChild as HTMLElement | null;
    const remainingInTopSeg = runLen - pourCount;

    let dstTargetSeg: HTMLElement | null = null;
    let dstTargetPct = 0;

    if (dstArr.length === 0) {
      dstTargetSeg = createSegmentElement(topColor, 0, true);
      dstContainer.appendChild(dstTargetSeg);
      dstTargetPct = pourCount * 25;
    } else {
      dstTargetSeg = dstContainer.lastElementChild as HTMLElement | null;
      const existingRun = getTopRunLength(dstArr);
      dstTargetPct = (existingRun + pourCount) * 25;
    }

    void dstContainer.offsetHeight;

    requestAnimationFrame(() => {
      path.style.strokeDashoffset = '0';
      sheenPath.style.strokeDashoffset = '0';
      if (srcTopSeg) {
        srcTopSeg.style.height = (remainingInTopSeg * 25) + '%';
        if (remainingInTopSeg === 0) srcTopSeg.classList.remove('is-top');
      }
      setTimeout(() => {
        dstEl.classList.remove('receiving-pour');
        void dstEl.offsetWidth;
        dstEl.classList.add('receiving-pour');
        if (dstTargetSeg) {
          dstTargetSeg.style.height = dstTargetPct + '%';
        }
      }, 60);
    });

    setTimeout(() => {
      path.style.opacity = '0';
      sheenPath.style.opacity = '0';
    }, 260);

    setTimeout(() => {
      pourSvg.innerHTML = '';
      srcEl.classList.remove('pouring-right', 'pouring-left');
      boardEl.classList.remove('is-pouring');

      for (let k = 0; k < pourCount; k++) {
        dstArr.push(srcArr.pop()!);
      }
      ensureBoardMysteryArrays(board);
      const prevHidden = board.hiddenCounts![srcIdx] ?? 0;
      const maxAllowedHidden = srcArr.length > 0 ? Math.max(0, srcArr.length - getTopRunLength(srcArr)) : 0;
      const nextHidden = Math.min(prevHidden, maxAllowedHidden);
      const didRevealMystery = appState.mysteryModeEnabled && nextHidden < prevHidden && srcArr.length > 0;
      board.hiddenCounts![srcIdx] = nextHidden;

      board.history.push({ from: srcIdx, to: dstIdx, count: pourCount });
      board.moves++;
      isAnimating = false;

      const justCompleted = isTubeComplete(dstArr);
      saveState();
      render(-1, justCompleted ? dstIdx : -1, didRevealMystery ? srcIdx : -1);

      if (didRevealMystery) {
        playMysteryRevealSound();
      }

      const updatedDstEl = getTubeElement(dstIdx);
      if (justCompleted && updatedDstEl) {
        spawnTubeConfetti(updatedDstEl, colorObj);
        triggerTubeCompleteFeedback();
      }

      if (isGameWon(board.tubes)) {
        recordRoundVictory();
        setTimeout(() => {
          playVictoryFanfare();
          showVictoryModal();
        }, 340);
      } else if (!hasValidMoves(board.tubes)) {
        setTimeout(() => {
          playDeadlockSound();
          showStuckModal();
        }, 220);
      }
    }, 400);
  }

  function recordRoundVictory() {
    const phase = activePhaseDef();
    const pData = activePhaseData();
    const board = activeBoard();
    const eff = computeEfficiency(board.moves, board.idealMoves) ?? 100;

    if (!pData.completedRounds.includes(pData.currentRound)) {
      pData.completedRounds.push(pData.currentRound);
    }
    // Training does not count toward easyRounds / skip-advance logic
    if (!phase.isTutorial && eff === 100 && !board.extraTubeUsed && !pData.easyRounds.includes(pData.currentRound)) {
      pData.easyRounds.push(pData.currentRound);
    }
    if (pData.currentRound >= phase.totalRounds) {
      pData.phaseCompleted = true;
    }
    saveState();
  }

  // =========================================================
  // Controls & Modals
  // =========================================================
  function handleUndo() {
    const board = activeBoard();
    if (isAnimating || board.history.length === 0) return;
    isDebugDeadlockForced = false;
    ensureAudio();
    ensureBoardMysteryArrays(board);
    const last = board.history.pop()!;
    for (let k = 0; k < last.count; k++) {
      board.tubes[last.from].push(board.tubes[last.to].pop()!);
    }
    // Golden Rule of Undo: never re-hide layers that were already revealed on last.from.
    // Clamp last.to hiddenCount safely in case tube length shrank.
    const dstTube = board.tubes[last.to];
    const maxDstHidden = dstTube.length > 0 ? Math.max(0, dstTube.length - getTopRunLength(dstTube)) : 0;
    board.hiddenCounts![last.to] = Math.min(board.hiddenCounts![last.to] ?? 0, maxDstHidden);

    // Undo conta como +1 jogada (ônus do usuário ao desfazer para tentar outro caminho).
    board.moves++;
    selectedIdx = null;
    clearActiveHint();
    resetTubeSequence();
    playSelectSound();
    saveState();
    render();
  }

  function areHintsEnabled(): boolean {
    return appState.hintDuration > 0;
  }

  function scheduleHintTimer(mode: 'focus' | 'move') {
    clearHintTimer();
    if (appState.hintDuration === 6 || appState.hintDuration <= 0) return;
    const durationMs = appState.hintDuration * 1000;
    hintTimerId = setTimeout(() => {
      hintTimerId = null;
      if (mode === 'focus') {
        activeFocusTubeIdx = null;
        updateColorFocus();
        return;
      }
      const autoFrom = hintAutoSelectedFrom;
      hintAutoSelectedFrom = null;
      activeHint = null;
      updateHintHighlight();
      if (!isAnimating && autoFrom !== null && selectedIdx === autoFrom) {
        const el = getTubeElement(autoFrom);
        if (el) el.classList.remove('selected');
        selectedIdx = null;
        updateColorFocus();
        updateTutorialTip();
      }
    }, durationMs);
  }

  function activateFocusHint(tubeIdx: number) {
    clearHintTimer();
    hintAutoSelectedFrom = null;
    if (activeHint !== null) {
      activeHint = null;
      updateHintHighlight();
    }
    activeFocusTubeIdx = tubeIdx;
    playSelectSound();
    updateColorFocus();
    scheduleHintTimer('focus');
  }

  function activateSolverHint() {
    if (isAnimating || !areHintsEnabled()) return;
    ensureAudio();
    const board = activeBoard();
    if (isGameWon(board.tubes)) return;

    const move = findBestNextMove(board.tubes);
    if (!move) {
      clearActiveHint();
      if (!hasValidMoves(board.tubes)) {
        playDeadlockSound();
        showStuckModal();
      } else {
        playErrorSound();
      }
      return;
    }

    clearHintTimer();
    activeFocusTubeIdx = null;
    if (selectedIdx !== null && selectedIdx !== move.from) {
      const prevEl = getTubeElement(selectedIdx);
      if (prevEl) prevEl.classList.remove('selected');
    }

    activeHint = move;
    hintAutoSelectedFrom = move.from;
    selectedIdx = move.from;
    const srcEl = getTubeElement(move.from);
    if (srcEl) srcEl.classList.add('selected');
    playSelectSound();
    updateColorFocus();
    updateHintHighlight();
    updateTutorialTip();
    scheduleHintTimer('move');
  }

  function handleHintClick() {
    if (hintLongPressTriggered) {
      hintLongPressTriggered = false;
      return;
    }
    if (isAnimating || !areHintsEnabled()) return;
    ensureAudio();
    const board = activeBoard();
    if (isGameWon(board.tubes)) return;

    // 2nd tap while Level 1 (valid destinations for selected tube) is active -> Level 2 (solver best move)
    if (selectedIdx !== null && activeFocusTubeIdx === selectedIdx) {
      activateSolverHint();
      return;
    }

    // 1st tap with a tube selected -> Level 1 (show valid destinations for selected tube)
    if (selectedIdx !== null && board.tubes[selectedIdx]?.length > 0) {
      activateFocusHint(selectedIdx);
      return;
    }

    // No tube selected yet -> directly show Level 2 (solver best move)
    activateSolverHint();
  }

  function executeRestart() {
    const phase = activePhaseDef();
    const pData = activePhaseData();
    const board = activeBoard();
    board.tubes = cloneTubes(board.initialTubes);
    if (appState.mysteryModeEnabled) {
      const hasInitialMystery = Array.isArray(board.initialHiddenCounts) && board.initialHiddenCounts.some(c => c > 0);
      board.hiddenCounts = hasInitialMystery
        ? [...board.initialHiddenCounts!]
        : generateMysteryHiddenCounts(phase, board.round, board.initialTubes, pData.seed);
      board.initialHiddenCounts = [...board.hiddenCounts];
    } else {
      board.hiddenCounts = new Array(board.initialTubes.length).fill(0);
    }
    board.history = [];
    board.moves = 0;
    board.idealMoves = board.baseIdealMoves;
    board.extraTubeUsed = false;
    isDebugDeadlockForced = false;
    selectedIdx = null;
    clearActiveHint();
    resetTubeSequence();
    saveState();
    render();
  }

  function handleRestartClick() {
    if (isAnimating) return;
    ensureAudio();
    const board = activeBoard();
    if (board.moves <= 2 && !board.extraTubeUsed) {
      playSelectSound();
      executeRestart();
    } else {
      confirmModal.classList.add('open');
    }
  }

  function handleExtraTube() {
    const phase = activePhaseDef();
    const board = activeBoard();
    if (isAnimating || phase.isTutorial || board.extraTubeUsed) return;
    isDebugDeadlockForced = false;
    ensureAudio();
    clearActiveHint();
    ensureBoardMysteryArrays(board);
    board.extraTubeUsed = true;
    board.tubes.push([]);
    board.hiddenCounts!.push(0);
    selectedIdx = null;
    resetTubeSequence();

    const initialWithExtra = cloneTubes(board.initialTubes);
    initialWithExtra.push([]);
    const res = findIdealMoves(initialWithExtra, 30000, 110);
    if (res) {
      board.idealMoves = Math.min(board.baseIdealMoves, res.idealMoves);
    }

    playTubeCompleteSound(0);
    saveState();
    render(board.tubes.length - 1);
  }

  function applySfxVolume() {
    const effectiveVolume = appState.muted ? 0 : sfxVolume;
    [audioPourEl, audioCompleteEl, audioErrorEl].forEach((el) => {
      if (el) {
        el.volume = effectiveVolume;
      }
    });
    if (sfxGain) {
      if (audioCtx) {
        sfxGain.gain.setTargetAtTime(effectiveVolume, audioCtx.currentTime, 0.015);
      } else {
        sfxGain.gain.value = effectiveVolume;
      }
    }
  }

  function applyBgmVolume() {
    const effectiveBgmVolume = appState.muted ? 0 : bgmVolume;
    if (bgmGain) {
      if (audioCtx) {
        bgmGain.gain.cancelScheduledValues(audioCtx.currentTime);
        bgmGain.gain.setTargetAtTime(effectiveBgmVolume, audioCtx.currentTime, 0.02);
      } else {
        bgmGain.gain.value = effectiveBgmVolume;
      }
    }
  }

  function applyAudioVolume() {
    applySfxVolume();
    applyBgmVolume();
  }

  function syncVolumeSliderUI() {
    const sfxPct = Math.round(Math.min(100, Math.max(0, appState.sfxVolume)));
    if (sliderSfxVolume) {
      sliderSfxVolume.value = String(sfxPct);
      sliderSfxVolume.style.setProperty('--slider-pct', `${sfxPct}%`);
    }
    if (sfxVolumeValueEl) {
      sfxVolumeValueEl.textContent = `${sfxPct}%`;
    }

    const bgmPct = Math.round(Math.min(100, Math.max(0, appState.bgmVolume)));
    if (sliderBgmVolume) {
      sliderBgmVolume.value = String(bgmPct);
      sliderBgmVolume.style.setProperty('--slider-pct', `${bgmPct}%`);
    }
    if (bgmVolumeValueEl) {
      bgmVolumeValueEl.textContent = `${bgmPct}%`;
    }
  }

  function handleToggleSound() {
    appState.muted = !appState.muted;
    if (appState.muted) {
      stopBgm();
      [audioPourEl, audioCompleteEl, audioErrorEl].forEach((el) => {
        if (el) {
          el.pause();
          el.currentTime = 0;
          el.volume = 0;
        }
      });
      if (audioCtx && masterGain) {
        masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.025);
      }
    } else {
      ensureAudio();
      applyAudioVolume();
      playSelectSound();
    }
    applyAudioVolume();
    saveState();
    updateSettingsSummaries();
    updateUIHeaderAndControls();
  }

  const VISUAL_MODE_OPTIONS: Array<{
    id: VisualMode;
    title: string;
    desc: string;
    swatches: Array<{ bg: string; patClass?: string }>;
  }> = [
    {
      id: 'color',
      title: 'Apenas Cores',
      desc: 'Líquidos coloridos clássicos, sem texturas sobrepostas.',
      swatches: [
        { bg: '#FF2E54' },
        { bg: '#00C8FF' },
        { bg: '#FFD600' }
      ]
    },
    {
      id: 'pattern',
      title: 'Apenas Daltonismo',
      desc: 'Base neutra uniforme diferenciada somente por padrões geométricos.',
      swatches: [
        { bg: '#475569', patClass: 'pat-stripes' },
        { bg: '#475569', patClass: 'pat-dots' },
        { bg: '#475569', patClass: 'pat-bars' }
      ]
    },
    {
      id: 'both',
      title: 'Cores + Daltonismo',
      desc: 'Combina cores vibrantes com símbolos e texturas para máximo contraste.',
      swatches: [
        { bg: '#FF2E54', patClass: 'pat-stripes' },
        { bg: '#00C8FF', patClass: 'pat-dots dark-ink' },
        { bg: '#FFD600', patClass: 'pat-bars dark-ink' }
      ]
    }
  ];

  function pickRandomPhrase(list: string[]): string {
    return list[Math.floor(Math.random() * list.length)];
  }

  function showVictoryModal() {
    const phase = activePhaseDef();
    const pData = activePhaseData();
    const board = activeBoard();
    const eff = computeEfficiency(board.moves, board.idealMoves) ?? 100;

    const isLastRound = pData.currentRound >= phase.totalRounds;
    const nextPhase = phase.nextPhaseId ? getPhaseDef(phase.nextPhaseId) : null;
    const phaseName = getLocalizedPhase(phase.id).name;
    const nextPhaseName = nextPhase ? getLocalizedPhase(nextPhase.id).name : '';
    const isPerfectRealWin = !phase.isTutorial && eff === 100 && !board.extraTubeUsed;
    const langDict = I18N[appState.language] || I18N.en;

    winMovesEl.textContent = String(board.moves);
    winIdealMovesEl.textContent = String(board.idealMoves);
    winEffEl.textContent = `${eff}%`;
    winEffEl.className = 'stat-value ' + getEfficiencyClass(eff);

    skipCalloutEl.classList.remove('visible');
    btnWinAdvance.style.display = 'none';
    btnWinReplay.style.display = 'none';
    btnWinPhases.style.display = 'none';
    winTitleEl.classList.remove('perfect-win');

    if (phase.isTutorial) {
      // Fireworks reserved strictly for real phases (no fireworks in tutorial)
      spawnVictoryConfettiShower(true);

      if (!isLastRound) {
        winEyebrowEl.textContent = t('winTutorialEyebrow');
        winTitleEl.textContent = t('winTutorialTitle', { round: pData.currentRound });
        winSubtitleEl.textContent = t('winTutorialSubtitle');
        btnWinPrimary.textContent = t('winTutorialPrimaryNext');
        btnWinPrimary.dataset.action = 'next-round';
        btnWinReplay.style.display = 'block';
      } else {
        winEyebrowEl.textContent = t('winGradEyebrow');
        winTitleEl.textContent = t('winGradTitle');
        winSubtitleEl.textContent = t('winGradSubtitle');
        btnWinPrimary.textContent = t('winGradPrimary');
        btnWinPrimary.dataset.action = 'start-facil';
        btnWinReplay.style.display = 'block';
        btnWinPhases.style.display = 'block';
      }

      victoryModal.classList.add('open');
      return;
    }

    // Real Phases: Case A (100% Efficiency without extra tube) vs Case B (< 100% or extra tube)
    if (isPerfectRealWin) {
      spawnFireworksShow();
      spawnVictoryConfettiShower(false);
      winTitleEl.classList.add('perfect-win');
      winEyebrowEl.textContent = t('winPerfectEyebrow');
      winTitleEl.textContent = isLastRound
        ? t('winPerfectLastTitle', { phase: phaseName })
        : t('winPerfectRoundTitle');
      winSubtitleEl.textContent = pickRandomPhrase(langDict.perfectPhrases);
    } else {
      spawnVictoryConfettiShower(true);
      winEyebrowEl.textContent = isLastRound ? t('winNormalLastEyebrow') : t('winNormalEyebrow');
      winTitleEl.textContent = isLastRound
        ? t('winNormalLastTitle', { phase: phaseName })
        : t('winNormalRoundTitle', { round: pData.currentRound });
      winSubtitleEl.textContent = pickRandomPhrase(langDict.motivationalPhrases);
    }

    const easyThreshold = Math.floor(phase.totalRounds * 0.25) + 1;
    const qualifiedForEasyAdvance =
      Boolean(nextPhase) &&
      !isLastRound &&
      pData.easyRounds.length >= easyThreshold;

    skipCalloutEl.classList.toggle('visible', qualifiedForEasyAdvance);

    if (!isLastRound) {
      btnWinPrimary.textContent = t('winPrimaryNextRound');
      btnWinPrimary.dataset.action = 'next-round';

      if (qualifiedForEasyAdvance && nextPhase) {
        skipCalloutTextEl.textContent = t('winSkipCalloutText', {
          easyCount: pData.easyRounds.length,
          totalRounds: phase.totalRounds,
          nextPhase: nextPhaseName
        });
        btnWinAdvance.style.display = 'block';
        btnWinAdvance.textContent = t('winBtnAdvance', { nextPhase: nextPhaseName });
      }
    } else if (nextPhase) {
      btnWinPrimary.textContent = t('winBtnNextPhase', { nextPhase: nextPhaseName });
      btnWinPrimary.dataset.action = 'next-phase';
      btnWinPhases.style.display = 'block';
    } else {
      winEyebrowEl.textContent = t('winMasterEyebrow');
      btnWinPrimary.textContent = t('winReplayPhase');
      btnWinPrimary.dataset.action = 'replay-phase';
      btnWinPhases.style.display = 'block';
    }

    victoryModal.classList.add('open');
  }

  function renderPhasesModal() {
    phaseListEl.innerHTML = '';

    PHASES.forEach(p => {
      const pData = appState.phases[p.id];
      const isCurrent = appState.activePhaseId === p.id;
      const completedCount = Math.min(p.totalRounds, pData.completedRounds.length);
      const pct = Math.min(100, Math.max(0, Math.round((completedCount / p.totalRounds) * 100)));
      const loc = getLocalizedPhase(p.id);

      const card = document.createElement('button');
      card.className = 'phase-card' + (isCurrent ? ' active' : '');

      let badgeHtml = '';
      if (p.isTutorial) {
        badgeHtml = pData.phaseCompleted
          ? `<span class="phase-pill done">${t('phaseBadgeDone')}</span>`
          : `<span class="phase-pill tutorial">🎓 ${isCurrent ? t('phaseBadgeCurrent') : t('phaseBadgeGuide')}</span>`;
      } else if (isCurrent) {
        badgeHtml = `<span class="phase-pill current">${t('phaseBadgeCurrent')}</span>`;
      } else if (pData.phaseCompleted) {
        badgeHtml = `<span class="phase-pill done">${t('phaseBadgeDone')}</span>`;
      }

      const unitLabel = p.isTutorial ? t('phaseUnitLesson') : t('phaseUnitRound');
      const easyInfo = !p.isTutorial && pData.easyRounds.length > 0
        ? t('phaseMetaPerfect', { count: pData.easyRounds.length })
        : '';

      card.innerHTML = `
        <div class="phase-card-top">
          <div class="phase-card-title">
            <span class="phase-dot ${p.id}"></span>
            <span>${loc.name}</span>
          </div>
          ${badgeHtml}
        </div>
        <div class="phase-card-desc">${loc.desc}</div>
        <div class="phase-card-meta">
          <span>${t('phaseMetaProgress', { unit: unitLabel, current: pData.currentRound, total: p.totalRounds })}</span>
          <span>${t('phaseMetaWon', { completed: completedCount, total: p.totalRounds })}${easyInfo}</span>
        </div>
        <div class="phase-progress-row">
          <div class="phase-progress-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${t('phaseAriaProgress', { phase: loc.name })}">
            <div class="phase-progress-fill${pct === 100 ? ' complete' : ''}" style="width: ${pct}%"></div>
          </div>
          <span class="phase-progress-pct${pct === 100 ? ' complete' : ''}">${pct}%</span>
        </div>
      `;

      card.addEventListener('click', () => {
        ensureAudio();
        playSelectSound();
        phasesModal.classList.remove('open');
        if (p.id !== appState.activePhaseId) {
          switchToPhase(p.id);
        }
      });

      phaseListEl.appendChild(card);
    });
  }

  function renderBgmModal() {
    bgmListEl.innerHTML = '';

    Object.values(BGM_TRACKS).forEach(track => {
      const isActive = appState.bgmTrack === track.id;
      const loc = getLocalizedBgm(track.id);
      const card = document.createElement('button');
      card.className = 'bgm-card' + (isActive ? ' active' : '');

      card.innerHTML = `
        <div class="phase-card-top">
          <div class="phase-card-title">
            <span>${track.icon}</span>
            <span>${loc.name}</span>
          </div>
          ${isActive ? `<span class="phase-pill current">${t('bgmActiveBadge')}</span>` : `<span class="phase-sub">${t('bgmBpmUnit', { bpm: track.bpm })}</span>`}
        </div>
        <div class="phase-card-desc">${loc.desc}</div>
      `;

      card.addEventListener('click', () => {
        appState.bgmTrack = track.id;
        bgmCurrentStep = 0;
        bgmTotalStep = 0;
        nextCosmicStarStep = 32;
        saveState();
        updateUIHeaderAndControls();
        bgmModal.classList.remove('open');

        if (!appState.muted) {
          stopBgm();
          ensureAudio();
          startBgm();
          playSelectSound();
        }
      });

      bgmListEl.appendChild(card);
    });
  }

  type SettingsCategory = 'visual' | 'gameplay' | 'audio' | 'data';
  let activeSettingsSubmenu: SettingsCategory | null = null;

  function getHintDurationLabel(step: HintDurationStep): string {
    if (step === 0) return t('settingsHintDurationOff');
    if (step === 6) return '∞';
    return `${step}s`;
  }

  function updateSettingsSummaries() {
    if (settingsSummaryVisualEl) {
      settingsSummaryVisualEl.textContent = getLocalizedVisualMode(appState.visualMode).title;
    }
    if (settingsSummaryGameplayEl) {
      const hintLabel = getHintDurationLabel(appState.hintDuration);
      const mysteryLabel = appState.mysteryModeEnabled ? t('settingsStateOn') : t('settingsStateOff');
      settingsSummaryGameplayEl.textContent = t('settingsSummaryGameplay', {
        hint: hintLabel,
        mystery: mysteryLabel
      });
    }
    if (settingsSummaryAudioEl) {
      if (appState.muted) {
        settingsSummaryAudioEl.textContent = t('settingsSummaryAudioMuted');
      } else {
        const sfxPct = Math.round(Math.min(100, Math.max(0, appState.sfxVolume)));
        const bgmPct = Math.round(Math.min(100, Math.max(0, appState.bgmVolume)));
        settingsSummaryAudioEl.textContent = t('settingsSummaryAudio', {
          sfx: sfxPct,
          bgm: bgmPct
        });
      }
    }
    if (settingsSummaryDataEl) {
      let completed = 0;
      let total = 0;
      PHASES.forEach(p => {
        total += p.totalRounds;
        completed += Math.min(p.totalRounds, appState.phases[p.id]?.completedRounds.length ?? 0);
      });
      settingsSummaryDataEl.textContent = t('settingsSummaryData', { completed, total });
    }
    if (activeSettingsSubmenu && settingsSubmenuTitleEl) {
      const titleKeyMap: Record<SettingsCategory, 'settingsSectionVisual' | 'settingsSectionGameplay' | 'settingsSectionAudio' | 'settingsSectionData'> = {
        visual: 'settingsSectionVisual',
        gameplay: 'settingsSectionGameplay',
        audio: 'settingsSectionAudio',
        data: 'settingsSectionData'
      };
      settingsSubmenuTitleEl.textContent = t(titleKeyMap[activeSettingsSubmenu]);
    }
  }

  function setSettingsSubmenu(category: SettingsCategory | null) {
    activeSettingsSubmenu = category;
    const inSub = category !== null;

    if (settingsTrackEl) {
      settingsTrackEl.classList.toggle('in-submenu', inSub);
    }
    if (settingsPaneMainEl) {
      settingsPaneMainEl.setAttribute('aria-hidden', inSub ? 'true' : 'false');
      if (inSub) {
        settingsPaneMainEl.setAttribute('inert', '');
      } else {
        settingsPaneMainEl.removeAttribute('inert');
      }
    }
    if (settingsPaneSubEl) {
      settingsPaneSubEl.setAttribute('aria-hidden', inSub ? 'false' : 'true');
      if (inSub) {
        settingsPaneSubEl.removeAttribute('inert');
        settingsPaneSubEl.scrollTop = 0;
      } else {
        settingsPaneSubEl.setAttribute('inert', '');
      }
    }
    settingsSubpanels.forEach(panel => {
      const matches = inSub && panel.dataset.subpanel === category;
      panel.classList.toggle('active', matches);
    });
    updateSettingsSummaries();
  }

  function syncHintSettingsUI() {
    const step = appState.hintDuration;
    const pct = (step / 6) * 100;
    if (sliderHintDuration) {
      sliderHintDuration.value = String(step);
      sliderHintDuration.style.setProperty('--slider-pct', `${pct}%`);
    }
    if (hintDurationValueEl) {
      hintDurationValueEl.textContent = getHintDurationLabel(step);
    }
  }

  function syncMysterySettingsUI() {
    if (toggleMysteryMode) {
      toggleMysteryMode.checked = appState.mysteryModeEnabled;
    }
  }

  function renderSettingsVisualCards() {
    settingsListEl.innerHTML = '';

    VISUAL_MODE_OPTIONS.forEach(opt => {
      const isActive = appState.visualMode === opt.id;
      const loc = getLocalizedVisualMode(opt.id);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'setting-card' + (isActive ? ' active' : '');

      const swatchesHtml = opt.swatches
        .map(s => `<span class="setting-swatch ${s.patClass || ''}" style="background-color: ${s.bg};"></span>`)
        .join('');

      card.innerHTML = `
        <div class="phase-card-top">
          <div class="phase-card-title">
            <span>${loc.title}</span>
          </div>
          ${isActive ? `<span class="phase-pill current">${t('settingsActiveBadge')}</span>` : ''}
        </div>
        <div class="phase-card-desc">${loc.desc}</div>
        <div class="setting-preview-row">${swatchesHtml}</div>
      `;

      card.addEventListener('click', () => {
        ensureAudio();
        playSelectSound();
        appState.visualMode = opt.id;
        saveState();
        render();
        renderSettingsVisualCards();
        updateSettingsSummaries();
      });

      settingsListEl.appendChild(card);
    });
  }

  function renderSettingsModal() {
    syncMysterySettingsUI();
    syncHintSettingsUI();
    syncVolumeSliderUI();
    renderSettingsVisualCards();
    updateSettingsSummaries();
  }

  function setLanguage(lang: LangCode) {
    appState.language = lang;
    saveState();
    applyStaticTranslations();
    updateSettingsSummaries();
    render();
    if (victoryModal.classList.contains('open')) {
      showVictoryModal();
    }
  }

  function renderLanguageModal() {
    languageListEl.innerHTML = '';
    const orderedCodes: LangCode[] = [
      appState.language,
      ...LANGUAGE_ORDER.filter(code => code !== appState.language)
    ];

    orderedCodes.forEach(code => {
      const meta = SUPPORTED_LANGUAGES[code];
      const isActive = appState.language === code;
      const item = document.createElement('button');
      item.className = 'lang-item' + (isActive ? ' active' : '');

      item.innerHTML = `
        <div class="lang-item-main">
          <span class="lang-item-flag" aria-hidden="true">${meta.flagSvg}</span>
          <span class="lang-item-name">${meta.nativeName}</span>
        </div>
        <div class="lang-item-meta">
          <span class="lang-item-code">${meta.shortCode}</span>
          ${isActive ? '<span class="lang-item-check" aria-hidden="true">✓</span>' : ''}
        </div>
      `;

      item.addEventListener('click', () => {
        ensureAudio();
        playSelectSound();
        languageModal.classList.remove('open');
        if (code !== appState.language) {
          setLanguage(code);
        }
      });

      languageListEl.appendChild(item);
    });
  }

  function openPhasesModal() {
    if (isAnimating) return;
    ensureAudio();
    playSelectSound();
    renderPhasesModal();
    phasesModal.classList.add('open');
  }

  function openBgmModal() {
    ensureAudio();
    playSelectSound();
    renderBgmModal();
    bgmModal.classList.add('open');
  }

  function openLanguageModal() {
    ensureAudio();
    playSelectSound();
    renderLanguageModal();
    languageModal.classList.add('open');
  }

  function showStuckModal(forced = false) {
    const phase = activePhaseDef();
    const board = activeBoard();
    const hasHistory = board.history.length > 0;
    const canAddExtra = !phase.isTutorial && !board.extraTubeUsed;

    btnStuckUndo.style.display = (hasHistory || forced) ? 'block' : 'none';
    if (btnStuckExtra) {
      btnStuckExtra.style.display = 'block';
      btnStuckExtra.disabled = !canAddExtra;
    }
    stuckModal.classList.add('open');
  }

  // TODO: REMOVER ANTES DO LANÇAMENTO — Função temporária para forçar o overlay/alerta de impasse
  function forceDebugDeadlock() {
    if (isAnimating) return;
    ensureAudio();
    if (selectedIdx !== null) {
      getTubeElement(selectedIdx)?.classList.remove('selected');
      selectedIdx = null;
    }
    clearActiveHint();
    isDebugDeadlockForced = true;
    playDeadlockSound();
    updateUIHeaderAndControls();
    showStuckModal(true);
  }

  function openSettingsModal() {
    if (isAnimating) return;
    ensureAudio();
    playSelectSound();
    setSettingsSubmenu(null);
    if (settingsPaneMainEl) settingsPaneMainEl.scrollTop = 0;
    renderSettingsModal();
    settingsModal.classList.add('open');
  }

  // Unlock Web Audio + start BGM cleanly on first interaction anywhere
  const unlockAudioOnce = () => {
    if (!appState.muted) {
      ensureAudio();
    }
    document.removeEventListener('pointerdown', unlockAudioOnce);
  };
  document.addEventListener('pointerdown', unlockAudioOnce, { passive: true });

  const onClosePhases = () => phasesModal.classList.remove('open');
  const onBackdropPhases = (e: MouseEvent) => {
    if (e.target === phasesModal) phasesModal.classList.remove('open');
  };
  const onCloseBgm = () => bgmModal.classList.remove('open');
  const onBackdropBgm = (e: MouseEvent) => {
    if (e.target === bgmModal) bgmModal.classList.remove('open');
  };
  const onCloseLanguage = () => languageModal.classList.remove('open');
  const onBackdropLanguage = (e: MouseEvent) => {
    if (e.target === languageModal) languageModal.classList.remove('open');
  };
  const onCloseSettings = () => settingsModal.classList.remove('open');
  const onBackdropSettings = (e: MouseEvent) => {
    if (e.target === settingsModal) settingsModal.classList.remove('open');
  };
  const onWinPrimary = () => {
    ensureAudio();
    playSelectSound();
    clearVictoryFxTimers();
    victoryModal.classList.remove('open');

    const phase = activePhaseDef();
    const pData = activePhaseData();
    const action = btnWinPrimary.dataset.action;

    if (action === 'next-round') {
      loadOrCreateRoundBoard(phase.id, pData.currentRound + 1);
      selectedIdx = null;
      render();
    } else if (action === 'start-facil') {
      switchToPhase('facil');
    } else if (action === 'next-phase' && phase.nextPhaseId) {
      switchToPhase(phase.nextPhaseId);
    } else if (action === 'replay-phase') {
      pData.currentRound = 1;
      pData.completedRounds = [];
      pData.easyRounds = [];
      pData.phaseCompleted = false;
      pData.seed = randomSeedInt();
      loadOrCreateRoundBoard(phase.id, 1);
      selectedIdx = null;
      render();
    }
  };
  const onWinAdvance = () => {
    ensureAudio();
    playSelectSound();
    clearVictoryFxTimers();
    victoryModal.classList.remove('open');
    const phase = activePhaseDef();
    if (phase.nextPhaseId) {
      switchToPhase(phase.nextPhaseId);
    }
  };
  const onWinReplay = () => {
    ensureAudio();
    playSelectSound();
    clearVictoryFxTimers();
    victoryModal.classList.remove('open');
    executeRestart();
  };
  const onWinPhases = () => {
    clearVictoryFxTimers();
    victoryModal.classList.remove('open');
    openPhasesModal();
  };
  const onCancelRestart = () => confirmModal.classList.remove('open');
  const onConfirmRestart = () => {
    playSelectSound();
    confirmModal.classList.remove('open');
    executeRestart();
  };
  const onBackdropConfirm = (e: MouseEvent) => {
    if (e.target === confirmModal) confirmModal.classList.remove('open');
  };

  function executeResetAllProgress() {
    clearHintTimer();
    cancelHintLongPress();
    clearVictoryFxTimers();
    isDebugDeadlockForced = false;
    selectedIdx = null;
    activeFocusTubeIdx = null;
    activeHint = null;
    hintAutoSelectedFrom = null;
    resetTubeSequence();

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }

    appState.activePhaseId = 'treinamento';
    PHASES.forEach(p => {
      appState.phases[p.id] = createDefaultPhaseData();
    });

    settingsModal.classList.remove('open');
    resetConfirm1Modal?.classList.remove('open');
    resetConfirm2Modal?.classList.remove('open');
    stuckModal.classList.remove('open');
    victoryModal.classList.remove('open');
    phasesModal.classList.remove('open');
    confirmModal.classList.remove('open');

    loadOrCreateRoundBoard('treinamento', 1);
    saveState();
    updateSettingsSummaries();
    render();
    showSequenceToast(t('toastProgressErased'), 'style-danger');
  }

  const onSettingsCatClick = (e: Event) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const cat = btn.dataset.settingsCat as SettingsCategory | undefined;
    if (!cat) return;
    ensureAudio();
    playSelectSound();
    setSettingsSubmenu(cat);
  };
  const onSettingsBackClick = () => {
    ensureAudio();
    playSelectSound();
    setSettingsSubmenu(null);
  };

  const onResetAllClick = () => {
    ensureAudio();
    playSelectSound();
    settingsModal.classList.remove('open');
    resetConfirm1Modal?.classList.add('open');
  };
  const onResetCancel1 = () => {
    playSelectSound();
    resetConfirm1Modal?.classList.remove('open');
  };
  const onBackdropReset1 = (e: MouseEvent) => {
    if (resetConfirm1Modal && e.target === resetConfirm1Modal) {
      resetConfirm1Modal.classList.remove('open');
    }
  };
  const onResetNext1 = () => {
    ensureAudio();
    playSelectSound();
    resetConfirm1Modal?.classList.remove('open');
    resetConfirm2Modal?.classList.add('open');
  };
  const onResetCancel2 = () => {
    playSelectSound();
    resetConfirm2Modal?.classList.remove('open');
  };
  const onBackdropReset2 = (e: MouseEvent) => {
    if (resetConfirm2Modal && e.target === resetConfirm2Modal) {
      resetConfirm2Modal.classList.remove('open');
    }
  };
  const onResetConfirm2 = () => {
    ensureAudio();
    playSelectSound();
    executeResetAllProgress();
  };
  const onStuckUndo = () => {
    isDebugDeadlockForced = false;
    stuckModal.classList.remove('open');
    if (activeBoard().history.length > 0) {
      handleUndo();
    } else {
      updateUIHeaderAndControls();
    }
  };
  const onStuckExtra = () => {
    isDebugDeadlockForced = false;
    stuckModal.classList.remove('open');
    const phase = activePhaseDef();
    const board = activeBoard();
    if (!phase.isTutorial && !board.extraTubeUsed) {
      handleExtraTube();
    } else {
      updateUIHeaderAndControls();
    }
  };
  const onStuckRestart = () => {
    isDebugDeadlockForced = false;
    ensureAudio();
    playSelectSound();
    stuckModal.classList.remove('open');
    executeRestart();
  };
  const onBackdropStuck = (e: MouseEvent) => {
    if (e.target === stuckModal) {
      isDebugDeadlockForced = false;
      stuckModal.classList.remove('open');
      updateUIHeaderAndControls();
    }
  };
  // TODO: REMOVER ANTES DO LANÇAMENTO
  const onDebugDeadlockClick = () => {
    forceDebugDeadlock();
  };
  const onDebugKeyDown = (e: KeyboardEvent) => {
    if (!isDebugMode) return;
    if (e.shiftKey && e.key.toLowerCase() === 'd') {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      e.preventDefault();
      forceDebugDeadlock();
    }
  };

  const onHintPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || btnHint.disabled || isAnimating || !areHintsEnabled()) return;
    hintLongPressTriggered = false;
    cancelHintLongPress();
    btnHint.classList.add('is-long-pressing');
    hintLongPressTimerId = setTimeout(() => {
      hintLongPressTimerId = null;
      btnHint.classList.remove('is-long-pressing');
      if (btnHint.disabled || isAnimating || !areHintsEnabled()) return;
      hintLongPressTriggered = true;
      activateSolverHint();
    }, 450);
  };

  const onHintPointerUpOrCancel = () => {
    cancelHintLongPress();
  };

  btnUndo.addEventListener('click', handleUndo);
  btnHint.addEventListener('click', handleHintClick);
  btnHint.addEventListener('pointerdown', onHintPointerDown);
  btnHint.addEventListener('pointerup', onHintPointerUpOrCancel);
  btnHint.addEventListener('pointercancel', onHintPointerUpOrCancel);
  btnHint.addEventListener('pointerleave', onHintPointerUpOrCancel);
  btnRestart.addEventListener('click', handleRestartClick);
  btnExtra.addEventListener('click', handleExtraTube);
  btnLanguage.addEventListener('click', openLanguageModal);
  btnSettings.addEventListener('click', openSettingsModal);
  btnSound.addEventListener('click', handleToggleSound);
  btnPhases.addEventListener('click', openPhasesModal);
  btnBgm.addEventListener('click', openBgmModal);

  btnClosePhases.addEventListener('click', onClosePhases);
  phasesModal.addEventListener('click', onBackdropPhases);
  btnCloseBgm.addEventListener('click', onCloseBgm);
  bgmModal.addEventListener('click', onBackdropBgm);
  btnCloseLanguage.addEventListener('click', onCloseLanguage);
  languageModal.addEventListener('click', onBackdropLanguage);
  btnCloseSettings.addEventListener('click', onCloseSettings);
  settingsModal.addEventListener('click', onBackdropSettings);

  btnWinPrimary.addEventListener('click', onWinPrimary);
  btnWinAdvance.addEventListener('click', onWinAdvance);
  btnWinReplay.addEventListener('click', onWinReplay);
  btnWinPhases.addEventListener('click', onWinPhases);

  btnCancelRestart.addEventListener('click', onCancelRestart);
  btnConfirmRestart.addEventListener('click', onConfirmRestart);
  confirmModal.addEventListener('click', onBackdropConfirm);

  settingsCatBtns.forEach(btn => btn.addEventListener('click', onSettingsCatClick));
  btnSettingsBack?.addEventListener('click', onSettingsBackClick);

  btnResetAllProgress?.addEventListener('click', onResetAllClick);
  btnResetCancel1?.addEventListener('click', onResetCancel1);
  btnResetNext1?.addEventListener('click', onResetNext1);
  resetConfirm1Modal?.addEventListener('click', onBackdropReset1);
  btnResetCancel2?.addEventListener('click', onResetCancel2);
  btnResetConfirm2?.addEventListener('click', onResetConfirm2);
  resetConfirm2Modal?.addEventListener('click', onBackdropReset2);

  const onHintDurationSliderInput = () => {
    if (!sliderHintDuration) return;
    const step = Math.min(6, Math.max(0, Math.round(Number(sliderHintDuration.value) || 0))) as HintDurationStep;
    appState.hintDuration = step;
    if (step === 0) {
      cancelHintLongPress();
      if (hintAutoSelectedFrom !== null && selectedIdx === hintAutoSelectedFrom && !isAnimating) {
        getTubeElement(hintAutoSelectedFrom)?.classList.remove('selected');
        selectedIdx = null;
        updateColorFocus();
        updateTutorialTip();
      }
      clearActiveHint();
    } else if (step === 6) {
      clearHintTimer();
    }
    syncHintSettingsUI();
    updateSettingsSummaries();
    updateUIHeaderAndControls();
    saveState();
  };

  const onToggleMysteryMode = () => {
    ensureAudio();
    playSelectSound();
    const nextEnabled = Boolean(toggleMysteryMode?.checked);
    appState.mysteryModeEnabled = nextEnabled;
    const board = activeBoard();
    ensureBoardMysteryArrays(board);

    if (!nextEnabled) {
      board.hiddenCounts = board.hiddenCounts!.map(() => 0);
      if (!isGameWon(board.tubes)) {
        showSequenceToast(t('toastMysteryDisabled'), 'style-mystery');
      }
    } else if (board.moves === 0 && board.history.length === 0) {
      const phase = activePhaseDef();
      const pData = activePhaseData();
      const freshHidden = generateMysteryHiddenCounts(phase, board.round, board.initialTubes, pData.seed);
      board.hiddenCounts = [...freshHidden];
      board.initialHiddenCounts = [...freshHidden];
    }

    saveState();
    syncMysterySettingsUI();
    updateSettingsSummaries();
    render();
  };

  const onVolumeSliderInput = () => {
    if (!sliderSfxVolume) return;
    const pct = Math.min(100, Math.max(0, Math.round(Number(sliderSfxVolume.value) || 0)));
    appState.sfxVolume = pct;
    sfxVolume = pct / 100;
    syncVolumeSliderUI();
    updateSettingsSummaries();
    applySfxVolume();
    saveState();
  };

  const onBgmVolumeSliderInput = () => {
    if (!sliderBgmVolume) return;
    const pct = Math.min(100, Math.max(0, Math.round(Number(sliderBgmVolume.value) || 0)));
    appState.bgmVolume = pct;
    bgmVolume = pct / 100;
    syncVolumeSliderUI();
    updateSettingsSummaries();
    applyBgmVolume();
    saveState();
  };

  btnStuckUndo.addEventListener('click', onStuckUndo);
  btnStuckExtra?.addEventListener('click', onStuckExtra);
  btnStuckRestart.addEventListener('click', onStuckRestart);
  stuckModal.addEventListener('click', onBackdropStuck);
  // TODO: REMOVER ANTES DO LANÇAMENTO
  if (isDebugMode) {
    btnDebugDeadlock?.addEventListener('click', onDebugDeadlockClick);
    document.addEventListener('keydown', onDebugKeyDown);
  }
  toggleMysteryMode?.addEventListener('change', onToggleMysteryMode);
  sliderHintDuration?.addEventListener('input', onHintDurationSliderInput);
  sliderSfxVolume?.addEventListener('input', onVolumeSliderInput);
  sliderBgmVolume?.addEventListener('input', onBgmVolumeSliderInput);

  // Initialize Game
  if (!loadState()) {
    initDefaultState();
  }
  syncMysterySettingsUI();
  syncHintSettingsUI();
  syncVolumeSliderUI();
  applyAudioVolume();
  applyStaticTranslations();
  setSettingsSubmenu(null);
  const startPhase = activePhaseDef();
  const startPhaseData = activePhaseData();
  if (!startPhaseData.board || startPhaseData.board.round !== startPhaseData.currentRound) {
    loadOrCreateRoundBoard(startPhase.id, startPhaseData.currentRound);
  }
  render();
  if (isGameWon(activeBoard().tubes)) {
    showVictoryModal();
  } else if (!hasValidMoves(activeBoard().tubes)) {
    showStuckModal();
  }

  return () => {
    stopBgm();
    clearHintTimer();
    cancelHintLongPress();
    clearVictoryFxTimers();
    stopAmbientLoop();
    if (fxRafId) cancelAnimationFrame(fxRafId);
    if (resizeObserver) resizeObserver.disconnect();
    window.removeEventListener('resize', resizeFxCanvas);
    window.removeEventListener('resize', handleAmbientResize);
    window.removeEventListener('resize', handleWindowResize);
    reducedMotionQuery?.removeEventListener('change', handleReducedMotionChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('pointerdown', unlockAudioOnce);

    btnUndo.removeEventListener('click', handleUndo);
    btnHint.removeEventListener('click', handleHintClick);
    btnHint.removeEventListener('pointerdown', onHintPointerDown);
    btnHint.removeEventListener('pointerup', onHintPointerUpOrCancel);
    btnHint.removeEventListener('pointercancel', onHintPointerUpOrCancel);
    btnHint.removeEventListener('pointerleave', onHintPointerUpOrCancel);
    btnRestart.removeEventListener('click', handleRestartClick);
    btnExtra.removeEventListener('click', handleExtraTube);
    btnLanguage.removeEventListener('click', openLanguageModal);
    btnSettings.removeEventListener('click', openSettingsModal);
    btnSound.removeEventListener('click', handleToggleSound);
    btnPhases.removeEventListener('click', openPhasesModal);
    btnBgm.removeEventListener('click', openBgmModal);

    btnClosePhases.removeEventListener('click', onClosePhases);
    phasesModal.removeEventListener('click', onBackdropPhases);
    btnCloseBgm.removeEventListener('click', onCloseBgm);
    bgmModal.removeEventListener('click', onBackdropBgm);
    btnCloseLanguage.removeEventListener('click', onCloseLanguage);
    languageModal.removeEventListener('click', onBackdropLanguage);
    btnCloseSettings.removeEventListener('click', onCloseSettings);
    settingsModal.removeEventListener('click', onBackdropSettings);

    btnWinPrimary.removeEventListener('click', onWinPrimary);
    btnWinAdvance.removeEventListener('click', onWinAdvance);
    btnWinReplay.removeEventListener('click', onWinReplay);
    btnWinPhases.removeEventListener('click', onWinPhases);

    btnCancelRestart.removeEventListener('click', onCancelRestart);
    btnConfirmRestart.removeEventListener('click', onConfirmRestart);
    confirmModal.removeEventListener('click', onBackdropConfirm);

    settingsCatBtns.forEach(btn => btn.removeEventListener('click', onSettingsCatClick));
    btnSettingsBack?.removeEventListener('click', onSettingsBackClick);

    btnResetAllProgress?.removeEventListener('click', onResetAllClick);
    btnResetCancel1?.removeEventListener('click', onResetCancel1);
    btnResetNext1?.removeEventListener('click', onResetNext1);
    resetConfirm1Modal?.removeEventListener('click', onBackdropReset1);
    btnResetCancel2?.removeEventListener('click', onResetCancel2);
    btnResetConfirm2?.removeEventListener('click', onResetConfirm2);
    resetConfirm2Modal?.removeEventListener('click', onBackdropReset2);

    btnStuckUndo.removeEventListener('click', onStuckUndo);
    btnStuckExtra?.removeEventListener('click', onStuckExtra);
    btnStuckRestart.removeEventListener('click', onStuckRestart);
    stuckModal.removeEventListener('click', onBackdropStuck);
    // TODO: REMOVER ANTES DO LANÇAMENTO
    btnDebugDeadlock?.removeEventListener('click', onDebugDeadlockClick);
    document.removeEventListener('keydown', onDebugKeyDown);
    toggleMysteryMode?.removeEventListener('change', onToggleMysteryMode);
    sliderHintDuration?.removeEventListener('input', onHintDurationSliderInput);
    sliderSfxVolume?.removeEventListener('input', onVolumeSliderInput);
    sliderBgmVolume?.removeEventListener('input', onBgmVolumeSliderInput);

    if (audioCtx && audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
    }
  };
}
