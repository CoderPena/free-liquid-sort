export type LangCode = 'en' | 'pt' | 'es' | 'zh' | 'hi' | 'ar' | 'fr' | 'ru';

export type PhaseId = 'treinamento' | 'facil' | 'medio' | 'dificil' | 'desafiador';
export type BgmId =
  | 'calm'
  | 'elevator'
  | 'energetic'
  | 'fluid'
  | 'classical'
  | 'percussive'
  | 'chiptune'
  | 'cosmic'
  | 'dnb'
  | 'organic';
export type VisualModeId = 'color' | 'pattern' | 'both';

export interface LanguageMeta {
  code: LangCode;
  shortCode: string;
  nativeName: string;
  flag: string;
  flagSvg: string;
  bcp47: string;
  rtl: boolean;
}

export const SUPPORTED_LANGUAGES: Record<LangCode, LanguageMeta> = {
  en: {
    code: 'en',
    shortCode: 'EN',
    nativeName: 'English',
    flag: '🇬🇧',
    flagSvg:
      '<svg class="flag-svg" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="24" height="16" fill="#012169"/><path d="M0 0L24 16M24 0L0 16" stroke="#FFFFFF" stroke-width="3.2"/><path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" stroke-width="1.6"/><path d="M12 0V16M0 8H24" stroke="#FFFFFF" stroke-width="5"/><path d="M12 0V16M0 8H24" stroke="#C8102E" stroke-width="3"/></svg>',
    bcp47: 'en',
    rtl: false,
  },
  pt: {
    code: 'pt',
    shortCode: 'PT',
    nativeName: 'Português',
    flag: '🇧🇷',
    flagSvg:
      '<svg class="flag-svg" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="24" height="16" fill="#009B3A"/><polygon points="12,1.6 22,8 12,14.4 2,8" fill="#FFDF00"/><circle cx="12" cy="8" r="3.6" fill="#002776"/><path d="M8.7 7.3Q12 6.3 15.3 8.4" fill="none" stroke="#FFFFFF" stroke-width="0.9"/></svg>',
    bcp47: 'pt-BR',
    rtl: false,
  },
  es: {
    code: 'es',
    shortCode: 'ES',
    nativeName: 'Español',
    flag: '🇪🇸',
    flagSvg:
      '<svg class="flag-svg" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="24" height="16" fill="#AA151B"/><rect y="4" width="24" height="8" fill="#F1BF00"/><rect x="5.2" y="5.6" width="2.8" height="4.4" rx="0.8" fill="#AA151B"/><rect x="5.9" y="6.3" width="1.4" height="3" fill="#F1BF00"/></svg>',
    bcp47: 'es',
    rtl: false,
  },
  zh: {
    code: 'zh',
    shortCode: 'ZH',
    nativeName: '中文',
    flag: '🇨🇳',
    flagSvg:
      '<svg class="flag-svg" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="24" height="16" fill="#DE2910"/><polygon points="4.8,2.1 5.4,3.9 7.3,3.9 5.8,5 6.4,6.8 4.8,5.7 3.2,6.8 3.8,5 2.3,3.9 4.2,3.9" fill="#FFDE00"/><circle cx="9" cy="2.3" r="0.65" fill="#FFDE00"/><circle cx="10.4" cy="4" r="0.65" fill="#FFDE00"/><circle cx="10.4" cy="6.2" r="0.65" fill="#FFDE00"/><circle cx="9" cy="7.9" r="0.65" fill="#FFDE00"/></svg>',
    bcp47: 'zh-CN',
    rtl: false,
  },
  hi: {
    code: 'hi',
    shortCode: 'HI',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    flagSvg:
      '<svg class="flag-svg" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="24" height="5.34" fill="#FF9933"/><rect y="5.33" width="24" height="5.34" fill="#FFFFFF"/><rect y="10.66" width="24" height="5.34" fill="#138808"/><circle cx="12" cy="8" r="2.1" fill="none" stroke="#000080" stroke-width="0.7"/><circle cx="12" cy="8" r="0.55" fill="#000080"/></svg>',
    bcp47: 'hi',
    rtl: false,
  },
  ar: {
    code: 'ar',
    shortCode: 'AR',
    nativeName: 'العربية',
    flag: '🇸🇦',
    flagSvg:
      '<svg class="flag-svg" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="24" height="16" fill="#006C35"/><path d="M5.5 5.2H18.5M7 7.2H17M9 5.2V7.2M13 4.4V7.2M16 5.2V7.2" stroke="#FFFFFF" stroke-width="1.15" stroke-linecap="round"/><path d="M6.2 10.8H17.8M15.8 9.8L17.8 10.8L15.8 11.8" fill="none" stroke="#FFFFFF" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bcp47: 'ar',
    rtl: true,
  },
  fr: {
    code: 'fr',
    shortCode: 'FR',
    nativeName: 'Français',
    flag: '🇫🇷',
    flagSvg:
      '<svg class="flag-svg" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="8" height="16" fill="#0055A4"/><rect x="8" width="8" height="16" fill="#FFFFFF"/><rect x="16" width="8" height="16" fill="#EF4135"/></svg>',
    bcp47: 'fr',
    rtl: false,
  },
  ru: {
    code: 'ru',
    shortCode: 'RU',
    nativeName: 'Русский',
    flag: '🇷🇺',
    flagSvg:
      '<svg class="flag-svg" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="24" height="5.34" fill="#FFFFFF"/><rect y="5.33" width="24" height="5.34" fill="#0039A6"/><rect y="10.66" width="24" height="5.34" fill="#D52B1E"/></svg>',
    bcp47: 'ru',
    rtl: false,
  },
};

export const LANGUAGE_ORDER: LangCode[] = ['ar', 'en', 'es', 'fr', 'hi', 'pt', 'ru', 'zh'];

export interface TranslationDict {
  ariaSelectPhase: string;
  ariaSelectBgm: string;
  titleBgm: string;
  ariaSettings: string;
  titleSettings: string;
  ariaLanguage: string;
  titleLanguage: string;
  ariaSound: string;
  titleSound: string;

  statMoves: string;
  statIdeal: string;
  statEff: string;
  statEffFull: string;

  ctrlUndo: string;
  ctrlHint: string;
  ctrlRestart: string;
  ctrlExtra: string;

  deadlockWithExtra: string;
  deadlockNoExtra: string;
  toastTubeComplete: string;
  tubeCompleteAria: string;
  toastStreak: string;
  toastMysteryDisabled: string;
  tutorialStepCounter: string;

  victorySkipCalloutTitle: string;
  winTutorialEyebrow: string;
  winTutorialTitle: string;
  winTutorialSubtitle: string;
  winTutorialPrimaryNext: string;
  winBtnReplayLesson: string;
  winBtnChoosePhase: string;
  winGradEyebrow: string;
  winGradTitle: string;
  winGradSubtitle: string;
  winGradPrimary: string;
  winPerfectEyebrow: string;
  winPerfectLastTitle: string;
  winPerfectRoundTitle: string;
  winNormalEyebrow: string;
  winNormalLastEyebrow: string;
  winNormalLastTitle: string;
  winNormalRoundTitle: string;
  winPrimaryNextRound: string;
  winSkipCalloutText: string;
  winBtnAdvance: string;
  winBtnNextPhase: string;
  winMasterEyebrow: string;
  winReplayPhase: string;

  phasesModalTitle: string;
  phasesModalSubtitle: string;
  phaseBadgeDone: string;
  phaseBadgeCurrent: string;
  phaseBadgeGuide: string;
  phaseUnitLesson: string;
  phaseUnitRound: string;
  phaseMetaProgress: string;
  phaseMetaWon: string;
  phaseMetaPerfect: string;
  phaseAriaProgress: string;

  bgmModalTitle: string;
  bgmModalSubtitle: string;
  bgmActiveBadge: string;
  bgmBpmUnit: string;

  settingsModalTitle: string;
  settingsModalSubtitle: string;
  settingsSectionVisual: string;
  settingsSectionGameplay: string;
  settingsSectionAudio: string;
  settingsSectionData: string;
  settingsActiveBadge: string;
  settingsMysteryModeLabel: string;
  settingsHintDurationLabel: string;
  settingsHintDurationOff: string;
  settingsSfxVolumeLabel: string;
  settingsBgmVolumeLabel: string;
  settingsResetAllBtn: string;
  settingsBack: string;
  settingsStateOn: string;
  settingsStateOff: string;
  settingsSummaryGameplay: string;
  settingsSummaryAudio: string;
  settingsSummaryAudioMuted: string;
  settingsSummaryData: string;
  settingsDataHint: string;
  ariaTubeEmpty: string;
  ariaTubeLayers: string;
  ariaTubeComplete: string;
  resetConfirm1Title: string;
  resetConfirm1Subtitle: string;
  resetConfirm1Next: string;
  resetConfirm2Title: string;
  resetConfirm2Subtitle: string;
  resetConfirm2Confirm: string;
  toastProgressErased: string;

  languageModalTitle: string;
  languageModalSubtitle: string;
  languageActiveBadge: string;

  confirmModalTitle: string;
  confirmModalSubtitle: string;
  confirmCancel: string;
  confirmRestart: string;

  stuckModalSubtitle: string;
  stuckUndoBtn: string;
  stuckRestartBtn: string;

  modalClose: string;

  perfectPhrases: [string, string, string, string];
  motivationalPhrases: [string, string, string, string];
  phases: Record<PhaseId, { name: string; desc: string }>;
  tutorialLessons: Array<{ title: string; steps: string[] }>;
  bgmTracks: Record<BgmId, { name: string; desc: string }>;
  visualModes: Record<VisualModeId, { title: string; desc: string }>;
}

export const I18N: Record<LangCode, TranslationDict> = {
  en: {
    ariaSelectPhase: 'Select phase',
    ariaSelectBgm: 'Select soundtrack',
    titleBgm: 'Soundtrack',
    ariaSettings: 'Settings',
    titleSettings: 'Settings',
    ariaLanguage: 'Select language',
    titleLanguage: 'Language',
    ariaSound: 'Toggle sound',
    titleSound: 'Mute / Sound',

    statMoves: 'Moves',
    statIdeal: 'Ideal',
    statEff: 'Eff.',
    statEffFull: 'Efficiency',

    ctrlUndo: 'Undo',
    ctrlHint: 'Hint',
    ctrlRestart: 'Restart',
    ctrlExtra: '+1 Tube',

    deadlockWithExtra: 'No moves left! Undo, restart, or use +1 Tube.',
    deadlockNoExtra: 'No moves left! Undo or restart the round.',
    toastTubeComplete: 'Tube Complete!',
    tubeCompleteAria: 'Completed tube',
    toastStreak: 'Streak x{count}!',
    toastMysteryDisabled: 'Mystery Mode off. Colors revealed.',
    tutorialStepCounter: 'Step {current} of {total}',

    victorySkipCalloutTitle: 'Great pace!',
    winTutorialEyebrow: 'Lesson Learned!',
    winTutorialTitle: 'Lesson {round} Complete!',
    winTutorialSubtitle: 'Ready for the next lesson?',
    winTutorialPrimaryNext: 'Next Lesson',
    winBtnReplayLesson: 'Replay Lesson',
    winBtnChoosePhase: 'Choose Phase',
    winGradEyebrow: 'Graduation 🎓',
    winGradTitle: 'Training Complete!',
    winGradSubtitle: 'You are ready for the Easy challenge.',
    winGradPrimary: 'Start Easy Phase',
    winPerfectEyebrow: 'Perfect Victory!',
    winPerfectLastTitle: 'Perfect! {phase} Phase 100%!',
    winPerfectRoundTitle: 'Perfect! 100% efficiency!',
    winNormalEyebrow: 'Congratulations!',
    winNormalLastEyebrow: 'Phase Mastered!',
    winNormalLastTitle: '{phase} Phase Complete!',
    winNormalRoundTitle: 'Round {round} Complete!',
    winPrimaryNextRound: 'Next Round',
    winSkipCalloutText:
      'You won {easyCount} of {totalRounds} rounds (over 25%) with 100% efficiency and no extra tube. You can advance to {nextPhase} now with no penalty.',
    winBtnAdvance: 'Advance to {nextPhase} (no penalty)',
    winBtnNextPhase: 'Go to {nextPhase}',
    winMasterEyebrow: 'Liquid Sort Master!',
    winReplayPhase: 'Play Phase Again',

    phasesModalTitle: 'Choose Phase',
    phasesModalSubtitle: 'All phases are unlocked. Start with Training or pick your challenge.',
    phaseBadgeDone: 'Done ✓',
    phaseBadgeCurrent: 'Current',
    phaseBadgeGuide: 'Guide',
    phaseUnitLesson: 'Lesson',
    phaseUnitRound: 'Round',
    phaseMetaProgress: '{unit} {current} / {total}',
    phaseMetaWon: '{completed}/{total} won',
    phaseMetaPerfect: ' • ★ {count} perfect',
    phaseAriaProgress: 'Progress in {phase}',

    bgmModalTitle: 'Soundtrack',
    bgmModalSubtitle: 'Choose the background rhythm for your games.',
    bgmActiveBadge: 'Active',
    bgmBpmUnit: '{bpm} BPM',

    settingsModalTitle: 'Settings',
    settingsModalSubtitle: 'Choose how to distinguish liquids inside the tubes.',
    settingsSectionVisual: 'Accessibility & Visuals',
    settingsSectionGameplay: 'Gameplay',
    settingsSectionAudio: 'Audio',
    settingsSectionData: 'Game Data',
    settingsActiveBadge: 'Active',
    settingsMysteryModeLabel: 'Mystery Mode (?)',
    settingsHintDurationLabel: 'Hint Duration',
    settingsHintDurationOff: 'Off',
    settingsSfxVolumeLabel: 'SFX Volume',
    settingsBgmVolumeLabel: 'Music Volume',
    settingsResetAllBtn: 'Erase All Progress',
    settingsBack: 'Back',
    settingsStateOn: 'On',
    settingsStateOff: 'Off',
    settingsSummaryGameplay: 'Hint: {hint} • ? {mystery}',
    settingsSummaryAudio: 'SFX {sfx}%, Music {bgm}%',
    settingsSummaryAudioMuted: 'Muted',
    settingsSummaryData: '{completed}/{total} rounds',
    settingsDataHint: 'Erases all completed phases, saved boards, and statistics.',
    ariaTubeEmpty: 'Tube {index}: Empty',
    ariaTubeLayers: 'Tube {index}: Top {color}, {count} layers remaining',
    ariaTubeComplete: 'Tube {index}: Complete {color} tube',
    resetConfirm1Title: 'Erase All Progress?',
    resetConfirm1Subtitle: 'All completed phases, saved rounds, and statistics will be deleted.',
    resetConfirm1Next: 'Continue',
    resetConfirm2Title: 'Are you absolutely sure?',
    resetConfirm2Subtitle: 'This action cannot be undone. All your progress will be permanently lost.',
    resetConfirm2Confirm: 'Yes, erase everything',
    toastProgressErased: 'All progress erased.',

    languageModalTitle: 'Language',
    languageModalSubtitle: 'Choose the interface language.',
    languageActiveBadge: 'Active',

    confirmModalTitle: 'Restart Round?',
    confirmModalSubtitle: 'All progress in the current round will be reset from scratch.',
    confirmCancel: 'Cancel',
    confirmRestart: 'Restart',

    stuckModalSubtitle: 'It looks like there are no possible moves left. How about trying again?',
    stuckUndoBtn: 'Undo Last Move',
    stuckRestartBtn: 'Restart Round',

    modalClose: 'Close',

    perfectPhrases: [
      'You are a master of liquid sorting!',
      'Flawless! Not a single extra move.',
      'Surgical precision!',
      'Not a drop wasted. Perfect victory!',
    ],
    motivationalPhrases: [
      'Almost there! Try beating your record next time.',
      'Nice! Every round makes you sharper.',
      'Up for a challenge? The next one could be perfect.',
      'You did it! Now try with fewer moves.',
    ],
    phases: {
      treinamento: { name: 'Training', desc: 'Learn to play in 5 guided lessons' },
      facil: { name: 'Easy', desc: '3 to 4 colors • 2 to 3 empty tubes' },
      medio: { name: 'Medium', desc: '5 to 6 colors • 2 empty tubes' },
      dificil: { name: 'Hard', desc: '7 to 8 colors • 1 to 2 empty tubes' },
      desafiador: { name: 'Challenging', desc: '9 to 10 colors • 1 to 2 empty tubes' },
    },
    tutorialLessons: [
      {
        title: 'Lesson 1: Pouring basics',
        steps: [
          'Tap the first tube to select it (it will lift up).',
          'Now tap the second tube (or the empty one) to pour the liquid.',
          'Great! Now merge both red liquids into the same tube.',
        ],
      },
      {
        title: 'Lesson 2: Only matching colors mix',
        steps: [
          'Tap the tube with red on top to select it.',
          'You can only pour onto the same color or into an empty tube. Tap the empty one!',
          'Nice! Now group the cyan layers into the same tube.',
          'Now combine the remaining reds to finish!',
        ],
      },
      {
        title: 'Lesson 3: Complete a tube',
        steps: [
          'A tube is complete with 4 units of the same color. Complete the red tube!',
          'Awesome! Now merge the cyan layers to finish the second tube.',
        ],
      },
      {
        title: 'Lesson 4: Avoid dead ends',
        steps: [
          'If the target tube is full, use the empty tube as a staging area!',
          'Now space opened up! Move the isolated color into the tube with room.',
          'Almost there! Merge the last color to win.',
        ],
      },
      {
        title: 'Lesson 5: Your first victory',
        steps: [
          'Now it is your turn! Sort all 3 colors using the empty tube. You got this!',
        ],
      },
    ],
    bgmTracks: {
      calm: { name: 'Calm', desc: 'Relaxing lo-fi ambient with soft pad and reverb' },
      elevator: { name: 'Elevator', desc: 'Light jazz / bossa nova with marimba and soft swing' },
      energetic: { name: 'Upbeat', desc: 'Lively electronic arcade with 4/4 kick and arps' },
      fluid: { name: 'Fluid', desc: 'Smooth chillwave / synthwave with night-ocean vibes' },
      classical: { name: 'Classical', desc: 'Piano and baroque strings in a minuet mood' },
      percussive: { name: 'Percussive', desc: 'Tribal world music with toms, claps, and pentatonic' },
      chiptune: { name: '8-Bit', desc: 'Retro chiptune with pure square waves and fast arps' },
      cosmic: { name: 'Cosmic', desc: 'Space ambient with deep drone, slow LFO, and stars' },
      dnb: { name: 'Energetic', desc: 'Fast drum & bass with breakbeat and syncopated bass' },
      organic: { name: 'Organic', desc: 'Fingerpicked folk guitar with gentle wood taps' },
    },
    visualModes: {
      color: {
        title: 'Colors Only',
        desc: 'Classic colored liquids with no overlaid textures.',
      },
      pattern: {
        title: 'Colorblind Only',
        desc: 'Uniform neutral base distinguished solely by geometric patterns.',
      },
      both: {
        title: 'Colors + Colorblind',
        desc: 'Combines vibrant colors with symbols and textures for maximum contrast.',
      },
    },
  },

  pt: {
    ariaSelectPhase: 'Selecionar fase',
    ariaSelectBgm: 'Selecionar trilha sonora',
    titleBgm: 'Trilha Sonora',
    ariaSettings: 'Configurações',
    titleSettings: 'Configurações',
    ariaLanguage: 'Selecionar idioma',
    titleLanguage: 'Idioma',
    ariaSound: 'Alternar som',
    titleSound: 'Mudo / Som',

    statMoves: 'Jogadas',
    statIdeal: 'Ideal',
    statEff: 'Efic.',
    statEffFull: 'Eficiência',

    ctrlUndo: 'Desfazer',
    ctrlHint: 'Dica',
    ctrlRestart: 'Reiniciar',
    ctrlExtra: '+1 Tubo',

    deadlockWithExtra: 'Sem jogadas possíveis! Desfaça, reinicie ou use +1 Tubo.',
    deadlockNoExtra: 'Sem jogadas possíveis! Desfaça ou reinicie a rodada.',
    toastTubeComplete: 'Tubo Completo!',
    tubeCompleteAria: 'Tubo completo',
    toastStreak: 'Sequência x{count}!',
    toastMysteryDisabled: 'Modo Mistério desativado. Cores reveladas.',
    tutorialStepCounter: 'Passo {current} de {total}',

    victorySkipCalloutTitle: 'Ritmo excelente!',
    winTutorialEyebrow: 'Lição Aprendida!',
    winTutorialTitle: 'Lição {round} concluída!',
    winTutorialSubtitle: 'Pronto para a próxima lição?',
    winTutorialPrimaryNext: 'Próxima Lição',
    winBtnReplayLesson: 'Repetir Lição',
    winBtnChoosePhase: 'Escolher Fase',
    winGradEyebrow: 'Formatura 🎓',
    winGradTitle: 'Treinamento concluído!',
    winGradSubtitle: 'Você está pronto para o desafio Fácil.',
    winGradPrimary: 'Começar Fase Fácil',
    winPerfectEyebrow: 'Vitória Perfeita!',
    winPerfectLastTitle: 'Perfeito! Fase {phase} com 100%!',
    winPerfectRoundTitle: 'Perfeito! 100% de eficiência!',
    winNormalEyebrow: 'Parabéns!',
    winNormalLastEyebrow: 'Fase Dominada!',
    winNormalLastTitle: 'Fase {phase} Concluída!',
    winNormalRoundTitle: 'Rodada {round} Concluída!',
    winPrimaryNextRound: 'Próxima Rodada',
    winSkipCalloutText:
      'Você venceu {easyCount} de {totalRounds} rodadas (mais de 25%) com 100% de eficiência e sem tubo extra. Pode avançar para a fase {nextPhase} agora, sem ônus.',
    winBtnAdvance: 'Avançar para Fase {nextPhase} (sem ônus)',
    winBtnNextPhase: 'Ir para Fase {nextPhase}',
    winMasterEyebrow: 'Mestre do Liquid Sort!',
    winReplayPhase: 'Jogar Fase Novamente',

    phasesModalTitle: 'Escolher Fase',
    phasesModalSubtitle: 'Todas as fases são liberadas. Comece pelo Treinamento ou escolha seu desafio.',
    phaseBadgeDone: 'Concluída ✓',
    phaseBadgeCurrent: 'Atual',
    phaseBadgeGuide: 'Guia',
    phaseUnitLesson: 'Lição',
    phaseUnitRound: 'Rodada',
    phaseMetaProgress: '{unit} {current} / {total}',
    phaseMetaWon: '{completed}/{total} vencidas',
    phaseMetaPerfect: ' • ★ {count} perfeitas',
    phaseAriaProgress: 'Progresso em {phase}',

    bgmModalTitle: 'Trilha Sonora',
    bgmModalSubtitle: 'Escolha o ritmo de fundo para acompanhar suas partidas.',
    bgmActiveBadge: 'Ativa',
    bgmBpmUnit: '{bpm} BPM',

    settingsModalTitle: 'Configurações',
    settingsModalSubtitle: 'Escolha como diferenciar os líquidos nos tubos.',
    settingsSectionVisual: 'Acessibilidade e Visual',
    settingsSectionGameplay: 'Jogabilidade',
    settingsSectionAudio: 'Áudio',
    settingsSectionData: 'Dados do Jogo',
    settingsActiveBadge: 'Ativo',
    settingsMysteryModeLabel: 'Modo Mistério (?)',
    settingsHintDurationLabel: 'Tempo da Dica',
    settingsHintDurationOff: 'Desativado',
    settingsSfxVolumeLabel: 'Volume dos Efeitos',
    settingsBgmVolumeLabel: 'Volume da Música',
    settingsResetAllBtn: 'Apagar Todo o Progresso',
    settingsBack: 'Voltar',
    settingsStateOn: 'Ativo',
    settingsStateOff: 'Off',
    settingsSummaryGameplay: 'Dica: {hint} • ? {mystery}',
    settingsSummaryAudio: 'Efeitos {sfx}%, Música {bgm}%',
    settingsSummaryAudioMuted: 'Mudo',
    settingsSummaryData: '{completed}/{total} rodadas',
    settingsDataHint: 'Apaga todas as fases concluídas, tabuleiros salvos e estatísticas.',
    ariaTubeEmpty: 'Frasco {index}: Vazio',
    ariaTubeLayers: 'Frasco {index}: Topo {color}, {count} camadas restantes',
    ariaTubeComplete: 'Frasco {index}: Tubo completo de {color}',
    resetConfirm1Title: 'Apagar Todo o Progresso?',
    resetConfirm1Subtitle: 'Todas as fases concluídas, rodadas salvas e estatísticas serão apagadas.',
    resetConfirm1Next: 'Continuar',
    resetConfirm2Title: 'Tem certeza absoluta?',
    resetConfirm2Subtitle: 'Esta ação não pode ser desfeita. Todo o seu progresso será perdido permanentemente.',
    resetConfirm2Confirm: 'Sim, apagar tudo',
    toastProgressErased: 'Todo o progresso foi apagado.',

    languageModalTitle: 'Idioma',
    languageModalSubtitle: 'Escolha o idioma da interface.',
    languageActiveBadge: 'Ativo',

    confirmModalTitle: 'Reiniciar Rodada?',
    confirmModalSubtitle: 'Todo o progresso desta rodada atual será reiniciado do zero.',
    confirmCancel: 'Cancelar',
    confirmRestart: 'Reiniciar',

    stuckModalSubtitle: 'Parece que não há mais movimentos possíveis. Que tal tentar de novo?',
    stuckUndoBtn: 'Desfazer Último Movimento',
    stuckRestartBtn: 'Reiniciar Rodada',

    modalClose: 'Fechar',

    perfectPhrases: [
      'Você é um mestre da separação de líquidos!',
      'Impecável! Nem uma jogada a mais.',
      'Precisão cirúrgica!',
      'Nenhuma gota desperdiçada. Vitória perfeita!',
    ],
    motivationalPhrases: [
      'Quase lá! Tente bater seu recorde na próxima.',
      'Boa! Cada rodada te deixa mais afiado.',
      'Desafio aceito? A próxima pode ser perfeita.',
      'Você conseguiu! Agora tente com menos jogadas.',
    ],
    phases: {
      treinamento: { name: 'Treinamento', desc: 'Aprenda a jogar em 5 lições guiadas' },
      facil: { name: 'Fácil', desc: '3 a 4 cores • 2 a 3 tubos vazios' },
      medio: { name: 'Médio', desc: '5 a 6 cores • 2 tubos vazios' },
      dificil: { name: 'Difícil', desc: '7 a 8 cores • 1 a 2 tubos vazios' },
      desafiador: { name: 'Desafiador', desc: '9 a 10 cores • 1 a 2 tubos vazios' },
    },
    tutorialLessons: [
      {
        title: 'Lição 1: O básico do derramamento',
        steps: [
          'Toque no primeiro tubo para selecioná-lo (ele vai subir).',
          'Agora toque no segundo tubo (ou no vazio) para derramar o líquido.',
          'Muito bem! Agora junte os dois líquidos vermelhos no mesmo tubo.',
        ],
      },
      {
        title: 'Lição 2: Só a mesma cor se mistura',
        steps: [
          'Toque no tubo com o topo vermelho para selecioná-lo.',
          'Você só pode derramar sobre a mesma cor ou em um tubo vazio. Toque no vazio!',
          'Muito bem! Agora junte os cianos no mesmo tubo.',
          'Agora junte os vermelhos restantes para concluir!',
        ],
      },
      {
        title: 'Lição 3: Complete um tubo',
        steps: [
          'Um tubo fica completo com 4 líquidos da mesma cor. Complete o tubo vermelho!',
          'Show! Agora junte os cianos para completar o segundo tubo.',
        ],
      },
      {
        title: 'Lição 4: Evite becos sem saída',
        steps: [
          'Se o tubo de destino estiver cheio, use o tubo vazio como área de manobra!',
          'Agora abriu espaço! Junte a cor que ficou isolada no tubo com espaço.',
          'Quase lá! Junte a última cor para vencer.',
        ],
      },
      {
        title: 'Lição 5: Sua primeira vitória',
        steps: [
          'Agora é com você! Separe todas as 3 cores usando o tubo vazio. Você consegue!',
        ],
      },
    ],
    bgmTracks: {
      calm: { name: 'Calma', desc: 'Ambiente lo-fi relaxante com pad suave e reverb' },
      elevator: { name: 'Elevador', desc: 'Jazz leve / bossa nova com marimba e swing suave' },
      energetic: { name: 'Agitada', desc: 'Eletrônico arcade animado com kick 4/4 e arpejos' },
      fluid: { name: 'Fluida', desc: 'Chillwave / synthwave suave em clima de oceano noturno' },
      classical: { name: 'Clássica', desc: 'Piano e cordas barrocas em clima de minueto' },
      percussive: { name: 'Percussiva', desc: 'World music tribal com toms, palmas e pentatônica' },
      chiptune: { name: '8-Bit', desc: 'Chiptune retrô com ondas square puras e arpejos rápidos' },
      cosmic: { name: 'Cósmica', desc: 'Ambient espacial com drone grave, LFO lento e estrelas' },
      dnb: { name: 'Enérgica', desc: "Drum'n'bass veloz com breakbeat e baixo sincopado" },
      organic: { name: 'Orgânica', desc: 'Violão folk dedilhado com batida leve de madeira' },
    },
    visualModes: {
      color: {
        title: 'Apenas Cores',
        desc: 'Líquidos coloridos clássicos, sem texturas sobrepostas.',
      },
      pattern: {
        title: 'Apenas Daltonismo',
        desc: 'Base neutra uniforme diferenciada somente por padrões geométricos.',
      },
      both: {
        title: 'Cores + Daltonismo',
        desc: 'Combina cores vibrantes com símbolos e texturas para máximo contraste.',
      },
    },
  },

  es: {
    ariaSelectPhase: 'Seleccionar fase',
    ariaSelectBgm: 'Seleccionar banda sonora',
    titleBgm: 'Banda Sonora',
    ariaSettings: 'Configuración',
    titleSettings: 'Configuración',
    ariaLanguage: 'Seleccionar idioma',
    titleLanguage: 'Idioma',
    ariaSound: 'Alternar sonido',
    titleSound: 'Silencio / Sonido',

    statMoves: 'Jugadas',
    statIdeal: 'Ideal',
    statEff: 'Efic.',
    statEffFull: 'Eficiencia',

    ctrlUndo: 'Deshacer',
    ctrlHint: 'Pista',
    ctrlRestart: 'Reiniciar',
    ctrlExtra: '+1 Tubo',

    deadlockWithExtra: '¡Sin jugadas posibles! Deshaz, reinicia o usa +1 Tubo.',
    deadlockNoExtra: '¡Sin jugadas posibles! Deshaz o reinicia la ronda.',
    toastTubeComplete: '¡Tubo Completo!',
    tubeCompleteAria: 'Tubo completado',
    toastStreak: '¡Racha x{count}!',
    toastMysteryDisabled: 'Modo Misterio desactivado. Colores revelados.',
    tutorialStepCounter: 'Paso {current} de {total}',

    victorySkipCalloutTitle: '¡Excelente ritmo!',
    winTutorialEyebrow: '¡Lección Aprendida!',
    winTutorialTitle: '¡Lección {round} completada!',
    winTutorialSubtitle: '¿Listo para la siguiente lección?',
    winTutorialPrimaryNext: 'Siguiente Lección',
    winBtnReplayLesson: 'Repetir Lección',
    winBtnChoosePhase: 'Elegir Fase',
    winGradEyebrow: 'Graduación 🎓',
    winGradTitle: '¡Entrenamiento completado!',
    winGradSubtitle: 'Estás listo para el desafío Fácil.',
    winGradPrimary: 'Empezar Fase Fácil',
    winPerfectEyebrow: '¡Victoria Perfecta!',
    winPerfectLastTitle: '¡Perfecto! ¡Fase {phase} al 100%!',
    winPerfectRoundTitle: '¡Perfecto! ¡100% de eficiencia!',
    winNormalEyebrow: '¡Felicidades!',
    winNormalLastEyebrow: '¡Fase Dominada!',
    winNormalLastTitle: '¡Fase {phase} Completada!',
    winNormalRoundTitle: '¡Ronda {round} Completada!',
    winPrimaryNextRound: 'Siguiente Ronda',
    winSkipCalloutText:
      'Ganaste {easyCount} de {totalRounds} rondas (más del 25%) con 100% de eficiencia y sin tubo extra. Puedes avanzar a la fase {nextPhase} ahora, sin penalización.',
    winBtnAdvance: 'Avanzar a Fase {nextPhase} (sin costo)',
    winBtnNextPhase: 'Ir a Fase {nextPhase}',
    winMasterEyebrow: '¡Maestro de Liquid Sort!',
    winReplayPhase: 'Jugar Fase de Nuevo',

    phasesModalTitle: 'Elegir Fase',
    phasesModalSubtitle: 'Todas las fases están desbloqueadas. Empieza en Entrenamiento o elige tu reto.',
    phaseBadgeDone: 'Completada ✓',
    phaseBadgeCurrent: 'Actual',
    phaseBadgeGuide: 'Guía',
    phaseUnitLesson: 'Lección',
    phaseUnitRound: 'Ronda',
    phaseMetaProgress: '{unit} {current} / {total}',
    phaseMetaWon: '{completed}/{total} ganadas',
    phaseMetaPerfect: ' • ★ {count} perfectas',
    phaseAriaProgress: 'Progreso en {phase}',

    bgmModalTitle: 'Banda Sonora',
    bgmModalSubtitle: 'Elige el ritmo de fondo para acompañar tus partidas.',
    bgmActiveBadge: 'Activa',
    bgmBpmUnit: '{bpm} BPM',

    settingsModalTitle: 'Configuración',
    settingsModalSubtitle: 'Elige cómo diferenciar los líquidos en los tubos.',
    settingsSectionVisual: 'Accesibilidad y Visual',
    settingsSectionGameplay: 'Jugabilidad',
    settingsSectionAudio: 'Audio',
    settingsSectionData: 'Datos del Juego',
    settingsActiveBadge: 'Activo',
    settingsMysteryModeLabel: 'Modo Misterio (?)',
    settingsHintDurationLabel: 'Duración de Pista',
    settingsHintDurationOff: 'Desactivado',
    settingsSfxVolumeLabel: 'Volumen de Efectos',
    settingsBgmVolumeLabel: 'Volumen de Música',
    settingsResetAllBtn: 'Borrar Todo el Progreso',
    settingsBack: 'Volver',
    settingsStateOn: 'Sí',
    settingsStateOff: 'Off',
    settingsSummaryGameplay: 'Pista: {hint} • ? {mystery}',
    settingsSummaryAudio: 'Efectos {sfx}%, Música {bgm}%',
    settingsSummaryAudioMuted: 'Silenciado',
    settingsSummaryData: '{completed}/{total} rondas',
    settingsDataHint: 'Elimina todas las fases completadas, tableros guardados y estadísticas.',
    ariaTubeEmpty: 'Tubo {index}: Vacío',
    ariaTubeLayers: 'Tubo {index}: Superior {color}, {count} capas restantes',
    ariaTubeComplete: 'Tubo {index}: Tubo completo de {color}',
    resetConfirm1Title: '¿Borrar Todo el Progreso?',
    resetConfirm1Subtitle: 'Se eliminarán todas las fases completadas, rondas guardadas y estadísticas.',
    resetConfirm1Next: 'Continuar',
    resetConfirm2Title: '¿Estás totalmente seguro?',
    resetConfirm2Subtitle: 'Esta acción no se puede deshacer. Todo tu progreso se perderá permanentemente.',
    resetConfirm2Confirm: 'Sí, borrar todo',
    toastProgressErased: 'Todo el progreso fue borrado.',

    languageModalTitle: 'Idioma',
    languageModalSubtitle: 'Elige el idioma de la interfaz.',
    languageActiveBadge: 'Activo',

    confirmModalTitle: '¿Reiniciar Ronda?',
    confirmModalSubtitle: 'Todo el progreso de la ronda actual se reiniciará desde cero.',
    confirmCancel: 'Cancelar',
    confirmRestart: 'Reiniciar',

    stuckModalSubtitle: 'Parece que ya no quedan movimientos posibles. ¿Qué tal intentarlo de nuevo?',
    stuckUndoBtn: 'Deshacer Último Movimiento',
    stuckRestartBtn: 'Reiniciar Ronda',

    modalClose: 'Cerrar',

    perfectPhrases: [
      '¡Eres un maestro separando líquidos!',
      '¡Impecable! Ni una jugada de más.',
      '¡Precisión quirúrgica!',
      'Ni una gota desperdiciada. ¡Victoria perfecta!',
    ],
    motivationalPhrases: [
      '¡Casi lo logras! Intenta superar tu récord en la próxima.',
      '¡Bien! Cada ronda te hace más ágil.',
      '¿Aceptas el reto? La próxima puede ser perfecta.',
      '¡Lo lograste! Ahora inténtalo con menos jugadas.',
    ],
    phases: {
      treinamento: { name: 'Entrenamiento', desc: 'Aprende a jugar en 5 lecciones guiadas' },
      facil: { name: 'Fácil', desc: '3 a 4 colores • 2 a 3 tubos vacíos' },
      medio: { name: 'Medio', desc: '5 a 6 colores • 2 tubos vacíos' },
      dificil: { name: 'Difícil', desc: '7 a 8 colores • 1 a 2 tubos vacíos' },
      desafiador: { name: 'Desafiante', desc: '9 a 10 colores • 1 a 2 tubos vacíos' },
    },
    tutorialLessons: [
      {
        title: 'Lección 1: Lo básico al verter',
        steps: [
          'Toca el primer tubo para seleccionarlo (se elevará).',
          'Ahora toca el segundo tubo (o el vacío) para verter el líquido.',
          '¡Muy bien! Ahora junta ambos líquidos rojos en el mismo tubo.',
        ],
      },
      {
        title: 'Lección 2: Solo el mismo color se mezcla',
        steps: [
          'Toca el tubo con la parte superior roja para seleccionarlo.',
          'Solo puedes verter sobre el mismo color o en un tubo vacío. ¡Toca el vacío!',
          '¡Genial! Ahora agrupa los tonos cian en el mismo tubo.',
          '¡Ahora junta los rojos restantes para terminar!',
        ],
      },
      {
        title: 'Lección 3: Completa un tubo',
        steps: [
          'Un tubo se completa con 4 líquidos del mismo color. ¡Completa el tubo rojo!',
          '¡Genial! Ahora junta los cian para completar el segundo tubo.',
        ],
      },
      {
        title: 'Lección 4: Evita callejones sin salida',
        steps: [
          'Si el tubo destino está lleno, ¡usa el tubo vacío como zona de maniobra!',
          '¡Se abrió espacio! Mueve el color aislado al tubo con espacio.',
          '¡Casi listo! Junta el último color para ganar.',
        ],
      },
      {
        title: 'Lección 5: Tu primera victoria',
        steps: [
          '¡Ahora te toca a ti! Separa los 3 colores usando el tubo vacío. ¡Tú puedes!',
        ],
      },
    ],
    bgmTracks: {
      calm: { name: 'Calma', desc: 'Ambiente lo-fi relajante con pad suave y reverb' },
      elevator: { name: 'Ascensor', desc: 'Jazz ligero / bossa nova con marimba y swing suave' },
      energetic: { name: 'Agitada', desc: 'Electrónica arcade animada con bombo 4/4 y arpegios' },
      fluid: { name: 'Fluida', desc: 'Chillwave / synthwave suave con aire de océano nocturno' },
      classical: { name: 'Clásica', desc: 'Piano y cuerdas barrocas en ambiente de minueto' },
      percussive: { name: 'Percusiva', desc: 'World music tribal con toms, palmas y pentatónica' },
      chiptune: { name: '8-Bit', desc: 'Chiptune retro con ondas cuadradas puras y arpegios rápidos' },
      cosmic: { name: 'Cósmica', desc: 'Ambient espacial con dron grave, LFO lento y estrellas' },
      dnb: { name: 'Enérgica', desc: "Drum'n'bass veloz con breakbeat y bajo sincopado" },
      organic: { name: 'Orgánica', desc: 'Guitarra folk punteada con toque suave de madera' },
    },
    visualModes: {
      color: {
        title: 'Solo Colores',
        desc: 'Líquidos coloridos clásicos, sin texturas superpuestas.',
      },
      pattern: {
        title: 'Solo Daltonismo',
        desc: 'Base neutra uniforme diferenciada únicamente por patrones geométricos.',
      },
      both: {
        title: 'Colores + Daltonismo',
        desc: 'Combina colores vibrantes con símbolos y texturas para máximo contraste.',
      },
    },
  },

  zh: {
    ariaSelectPhase: '选择阶段',
    ariaSelectBgm: '选择背景音乐',
    titleBgm: '背景音乐',
    ariaSettings: '设置',
    titleSettings: '设置',
    ariaLanguage: '选择语言',
    titleLanguage: '语言',
    ariaSound: '切换声音',
    titleSound: '静音 / 声音',

    statMoves: '步数',
    statIdeal: '最佳',
    statEff: '效率',
    statEffFull: '效率',

    ctrlUndo: '撤销',
    ctrlHint: '提示',
    ctrlRestart: '重开',
    ctrlExtra: '+1 试管',

    deadlockWithExtra: '无路可走！请撤销、重开或使用 +1 试管。',
    deadlockNoExtra: '无路可走！请撤销或重新开始本局。',
    toastTubeComplete: '试管完成！',
    tubeCompleteAria: '已完成的试管',
    toastStreak: '连击 x{count}！',
    toastMysteryDisabled: '神秘模式已关闭，颜色已显示。',
    tutorialStepCounter: '第 {current} / {total} 步',

    victorySkipCalloutTitle: '节奏极佳！',
    winTutorialEyebrow: '掌握技巧！',
    winTutorialTitle: '第 {round} 课完成！',
    winTutorialSubtitle: '准备好学习下一课了吗？',
    winTutorialPrimaryNext: '下一课',
    winBtnReplayLesson: '重玩本课',
    winBtnChoosePhase: '选择阶段',
    winGradEyebrow: '毕业 🎓',
    winGradTitle: '训练完成！',
    winGradSubtitle: '你已准备好迎接简单阶段挑战。',
    winGradPrimary: '开始简单阶段',
    winPerfectEyebrow: '完美胜利！',
    winPerfectLastTitle: '完美！{phase} 阶段达成 100%！',
    winPerfectRoundTitle: '完美！100% 效率！',
    winNormalEyebrow: '恭喜通关！',
    winNormalLastEyebrow: '阶段精通！',
    winNormalLastTitle: '{phase} 阶段完成！',
    winNormalRoundTitle: '第 {round} 关完成！',
    winPrimaryNextRound: '下一关',
    winSkipCalloutText:
      '你在 {totalRounds} 关中以 100% 效率且未使用额外试管完成了 {easyCount} 关（超过 25%）。现在可以无惩罚直接进入 {nextPhase} 阶段。',
    winBtnAdvance: '前往 {nextPhase} 阶段（无惩罚）',
    winBtnNextPhase: '进入 {nextPhase} 阶段',
    winMasterEyebrow: '液体分类大师！',
    winReplayPhase: '再玩一次本阶段',

    phasesModalTitle: '选择阶段',
    phasesModalSubtitle: '所有阶段均已解锁。从训练开始或直接选择挑战。',
    phaseBadgeDone: '已完成 ✓',
    phaseBadgeCurrent: '当前',
    phaseBadgeGuide: '引导',
    phaseUnitLesson: '课程',
    phaseUnitRound: '关卡',
    phaseMetaProgress: '{unit} {current} / {total}',
    phaseMetaWon: '已胜 {completed}/{total}',
    phaseMetaPerfect: ' • ★ {count} 完美',
    phaseAriaProgress: '{phase} 进度',

    bgmModalTitle: '背景音乐',
    bgmModalSubtitle: '选择伴随你解谜的背景节奏。',
    bgmActiveBadge: '使用中',
    bgmBpmUnit: '{bpm} BPM',

    settingsModalTitle: '设置',
    settingsModalSubtitle: '选择试管中液体的区分方式。',
    settingsSectionVisual: '无障碍与视觉',
    settingsSectionGameplay: '游戏玩法',
    settingsSectionAudio: '音频',
    settingsSectionData: '游戏数据',
    settingsActiveBadge: '已启用',
    settingsMysteryModeLabel: '神秘模式 (?)',
    settingsHintDurationLabel: '提示时长',
    settingsHintDurationOff: '已关闭',
    settingsSfxVolumeLabel: '音效音量',
    settingsBgmVolumeLabel: '背景音乐音量',
    settingsResetAllBtn: '清除所有进度',
    settingsBack: '返回',
    settingsStateOn: '开',
    settingsStateOff: '关',
    settingsSummaryGameplay: '提示: {hint} • ? {mystery}',
    settingsSummaryAudio: '音效 {sfx}%, 音乐 {bgm}%',
    settingsSummaryAudioMuted: '已静音',
    settingsSummaryData: '{completed}/{total} 关',
    settingsDataHint: '删除所有已通关阶段、已保存棋盘和统计数据。',
    ariaTubeEmpty: '第 {index} 试管：空',
    ariaTubeLayers: '第 {index} 试管：顶部 {color}，剩余 {count} 层',
    ariaTubeComplete: '第 {index} 试管：已完成的 {color} 试管',
    resetConfirm1Title: '清除所有进度？',
    resetConfirm1Subtitle: '所有已通关阶段、已保存关卡和统计数据都将被删除。',
    resetConfirm1Next: '继续',
    resetConfirm2Title: '确定要继续吗？',
    resetConfirm2Subtitle: '此操作无法撤销，你的所有进度将永久丢失。',
    resetConfirm2Confirm: '是的，全部清除',
    toastProgressErased: '已清除所有进度。',

    languageModalTitle: '语言',
    languageModalSubtitle: '选择界面显示语言。',
    languageActiveBadge: '已启用',

    confirmModalTitle: '重新开始本关？',
    confirmModalSubtitle: '当前关卡的所有进度将从头重置。',
    confirmCancel: '取消',
    confirmRestart: '重开',

    stuckModalSubtitle: '看起来没有可行的移动了。要再试一次吗？',
    stuckUndoBtn: '撤销上一步',
    stuckRestartBtn: '重新开始本关',

    modalClose: '关闭',

    perfectPhrases: [
      '你是液体分类大师！',
      '完美无瑕！没有多余的一步。',
      '外科手术般的精准！',
      '滴水不漏。完美胜利！',
    ],
    motivationalPhrases: [
      '差一点就完美了！下局试试打破纪录。',
      '干得好！每关都让你更加敏锐。',
      '接受挑战吗？下一关或许就是满分。',
      '过关成功！下次试着用更少步数。',
    ],
    phases: {
      treinamento: { name: '训练', desc: '通过 5 节引导课程学习玩法' },
      facil: { name: '简单', desc: '3 至 4 种颜色 • 2 至 3 个空管' },
      medio: { name: '中等', desc: '5 至 6 种颜色 • 2 个空管' },
      dificil: { name: '困难', desc: '7 至 8 种颜色 • 1 至 2 个空管' },
      desafiador: { name: '挑战', desc: '9 至 10 种颜色 • 1 至 2 个空管' },
    },
    tutorialLessons: [
      {
        title: '第 1 课：倒水基础',
        steps: [
          '点击第一个试管将其选中（它会向上抬起）。',
          '现在点击第二个试管（或空试管）倒入液体。',
          '很好！现在把两个红色液体合并到同一个试管中。',
        ],
      },
      {
        title: '第 2 课：仅相同颜色可混合',
        steps: [
          '点击顶部为红色的试管将其选中。',
          '只能倒入相同颜色上或空试管中。点击空试管！',
          '漂亮！现在把青色液体汇集到同一试管。',
          '最后把剩下的红色合在一起即可完成！',
        ],
      },
      {
        title: '第 3 课：装满一个试管',
        steps: [
          '当试管内有 4 格同色液体时即完成。请完成红色试管！',
          '太棒了！现在合并青色液体完成第二个试管。',
        ],
      },
      {
        title: '第 4 课：避免死局',
        steps: [
          '如果目标试管已满，请利用空试管作为中转区！',
          '腾出空间了！把孤立的颜色移入有空位的试管。',
          '快成功了！合并最后一种颜色即可获胜。',
        ],
      },
      {
        title: '第 5 课：你的首次胜利',
        steps: [
          '现在交给你了！利用空试管将全部 3 种颜色分开，加油！',
        ],
      },
    ],
    bgmTracks: {
      calm: { name: '宁静', desc: '舒缓 Lo-Fi 氛围，配有柔和铺底音与混响' },
      elevator: { name: '电梯', desc: '轻爵士 / 波萨诺瓦，搭配马林巴与轻快摇摆节奏' },
      energetic: { name: '动感', desc: '充满活力的街机电子乐，含四四拍底鼓与琶音' },
      fluid: { name: '流动', desc: '柔和 Chillwave / 合成器浪潮，宛如夜海微风' },
      classical: { name: '古典', desc: '钢琴与巴洛克弦乐，呈现小步舞曲氛围' },
      percussive: { name: '打击', desc: '部落风世界音乐，含筒鼓、拍手与五声音阶' },
      chiptune: { name: '8位机', desc: '复古芯片音乐，纯净方波与快速琶音' },
      cosmic: { name: '宇宙', desc: '太空氛围音效，深沉持续低音、慢速 LFO 与星光' },
      dnb: { name: '高能', desc: '疾速 Drum & Bass，碎拍鼓点与切分贝斯' },
      organic: { name: '原声', desc: '民谣木吉他指弹搭配轻柔木质敲击声' },
    },
    visualModes: {
      color: {
        title: '仅颜色',
        desc: '经典彩色液体，不叠加额外纹理。',
      },
      pattern: {
        title: '仅色盲模式',
        desc: '统一中性底色，完全通过几何图案进行区分。',
      },
      both: {
        title: '颜色 + 色盲模式',
        desc: '将鲜明色彩与符号纹理结合，提供最高对比度。',
      },
    },
  },

  hi: {
    ariaSelectPhase: 'चरण चुनें',
    ariaSelectBgm: 'संगीत चुनें',
    titleBgm: 'संगीत',
    ariaSettings: 'सेटिंग्स',
    titleSettings: 'सेटिंग्स',
    ariaLanguage: 'भाषा चुनें',
    titleLanguage: 'भाषा',
    ariaSound: 'ध्वनि बदलें',
    titleSound: 'म्यूट / ध्वनि',

    statMoves: 'चालें',
    statIdeal: 'आदर्श',
    statEff: 'दक्षता',
    statEffFull: 'दक्षता',

    ctrlUndo: 'पूर्ववत',
    ctrlHint: 'संकेत',
    ctrlRestart: 'रीस्टार्ट',
    ctrlExtra: '+1 ट्यूब',

    deadlockWithExtra: 'कोई चाल नहीं बची! पूर्ववत करें, रीस्टार्ट करें या +1 ट्यूब उपयोग करें।',
    deadlockNoExtra: 'कोई चाल नहीं बची! पूर्ववत करें या राउंड रीस्टार्ट करें।',
    toastTubeComplete: 'ट्यूब पूर्ण!',
    tubeCompleteAria: 'पूर्ण ट्यूब',
    toastStreak: 'लगातार x{count}!',
    toastMysteryDisabled: 'मिस्ट्री मोड बंद। रंग दिख गए।',
    tutorialStepCounter: 'चरण {current} / {total}',

    victorySkipCalloutTitle: 'शानदार गति!',
    winTutorialEyebrow: 'पाठ सीखा!',
    winTutorialTitle: 'पाठ {round} पूरा!',
    winTutorialSubtitle: 'अगले पाठ के लिए तैयार?',
    winTutorialPrimaryNext: 'अगला पाठ',
    winBtnReplayLesson: 'पाठ दोहराएं',
    winBtnChoosePhase: 'चरण चुनें',
    winGradEyebrow: 'प्रशिक्षण पूर्ण 🎓',
    winGradTitle: 'प्रशिक्षण समाप्त!',
    winGradSubtitle: 'आप आसान चुनौती के लिए तैयार हैं।',
    winGradPrimary: 'आसान चरण शुरू करें',
    winPerfectEyebrow: 'पूर्ण विजय!',
    winPerfectLastTitle: 'शानदार! {phase} चरण 100% पूर्ण!',
    winPerfectRoundTitle: 'बेहतरीन! 100% दक्षता!',
    winNormalEyebrow: 'बधाई हो!',
    winNormalLastEyebrow: 'चरण पार!',
    winNormalLastTitle: '{phase} चरण पूरा हुआ!',
    winNormalRoundTitle: 'राउंड {round} पूरा हुआ!',
    winPrimaryNextRound: 'अगला राउंड',
    winSkipCalloutText:
      'आपने {totalRounds} में से {easyCount} राउंड (25% से अधिक) बिना अतिरिक्त ट्यूब के 100% दक्षता से जीते। आप बिना किसी दंड के अभी {nextPhase} चरण पर जा सकते हैं।',
    winBtnAdvance: '{nextPhase} चरण पर जाएं (बिना दंड)',
    winBtnNextPhase: '{nextPhase} चरण में जाएं',
    winMasterEyebrow: 'लिक्विड सॉर्ट मास्टर!',
    winReplayPhase: 'चरण फिर से खेलें',

    phasesModalTitle: 'चरण चुनें',
    phasesModalSubtitle: 'सभी चरण अनलॉक हैं। प्रशिक्षण से शुरू करें या अपनी चुनौती चुनें।',
    phaseBadgeDone: 'पूर्ण ✓',
    phaseBadgeCurrent: 'वर्तमान',
    phaseBadgeGuide: 'गाइड',
    phaseUnitLesson: 'पाठ',
    phaseUnitRound: 'राउंड',
    phaseMetaProgress: '{unit} {current} / {total}',
    phaseMetaWon: '{completed}/{total} जीते',
    phaseMetaPerfect: ' • ★ {count} पूर्ण',
    phaseAriaProgress: '{phase} प्रगति',

    bgmModalTitle: 'संगीत',
    bgmModalSubtitle: 'अपने खेल के साथ चलने वाली पृष्ठभूमि लय चुनें।',
    bgmActiveBadge: 'सक्रिय',
    bgmBpmUnit: '{bpm} BPM',

    settingsModalTitle: 'सेटिंग्स',
    settingsModalSubtitle: 'ट्यूबों में तरल को अलग पहचानने का तरीका चुनें।',
    settingsSectionVisual: 'सुगम्यता और दृश्य',
    settingsSectionGameplay: 'गेमप्ले',
    settingsSectionAudio: 'ऑडियो',
    settingsSectionData: 'गेम डेटा',
    settingsActiveBadge: 'सक्रिय',
    settingsMysteryModeLabel: 'मिस्ट्री मोड (?)',
    settingsHintDurationLabel: 'संकेत अवधि',
    settingsHintDurationOff: 'बंद',
    settingsSfxVolumeLabel: 'ध्वनि वॉल्यूम',
    settingsBgmVolumeLabel: 'संगीत वॉल्यूम',
    settingsResetAllBtn: 'सारी प्रगति मिटाएं',
    settingsBack: 'वापस',
    settingsStateOn: 'चालू',
    settingsStateOff: 'बंद',
    settingsSummaryGameplay: 'संकेत: {hint} • ? {mystery}',
    settingsSummaryAudio: 'ध्वनि {sfx}%, संगीत {bgm}%',
    settingsSummaryAudioMuted: 'म्यूट',
    settingsSummaryData: '{completed}/{total} राउंड',
    settingsDataHint: 'सभी पूर्ण चरण, सहेजे गए बोर्ड और आँकड़े मिटा देता है।',
    ariaTubeEmpty: 'ट्यूब {index}: खाली',
    ariaTubeLayers: 'ट्यूब {index}: शीर्ष {color}, {count} परतें शेष',
    ariaTubeComplete: 'ट्यूब {index}: पूर्ण {color} ट्यूब',
    resetConfirm1Title: 'सारी प्रगति मिटाएं?',
    resetConfirm1Subtitle: 'सभी पूर्ण चरण, सहेजे गए राउंड और आँकड़े मिट जाएंगे।',
    resetConfirm1Next: 'आगे बढ़ें',
    resetConfirm2Title: 'क्या आप पूरी तरह सुनिश्चित हैं?',
    resetConfirm2Subtitle: 'यह क्रिया पूर्ववत नहीं की जा सकती। आपकी सारी प्रगति स्थायी रूप से खो जाएगी।',
    resetConfirm2Confirm: 'हाँ, सब मिटा दें',
    toastProgressErased: 'सारी प्रगति मिटा दी गई।',

    languageModalTitle: 'भाषा',
    languageModalSubtitle: 'इंटरफ़ेस की भाषा चुनें।',
    languageActiveBadge: 'सक्रिय',

    confirmModalTitle: 'राउंड रीस्टार्ट करें?',
    confirmModalSubtitle: 'इस वर्तमान राउंड की सारी प्रगति शुरुआत से रीसेट हो जाएगी।',
    confirmCancel: 'रद्द करें',
    confirmRestart: 'रीस्टार्ट',

    stuckModalSubtitle: 'लगता है अब कोई चाल संभव नहीं बची है। फिर से कोशिश करें?',
    stuckUndoBtn: 'पिछली चाल पूर्ववत करें',
    stuckRestartBtn: 'राउंड रीस्टार्ट करें',

    modalClose: 'बंद करें',

    perfectPhrases: [
      'आप तरल छँटाई के उस्ताद हैं!',
      'बेदाग! एक भी अतिरिक्त चाल नहीं।',
      'सटीक निपुणता!',
      'एक बूंद भी बेकार नहीं। शानदार जीत!',
    ],
    motivationalPhrases: [
      'बस करीब थे! अगली बार अपना रिकॉर्ड तोड़ने की कोशिश करें।',
      'बढ़िया! हर राउंड आपको और तेज़ बनाता है।',
      'चुनौती स्वीकार है? अगला राउंड परफेक्ट हो सकता है।',
      'आप जीत गए! अब कम चालों में प्रयास करें।',
    ],
    phases: {
      treinamento: { name: 'प्रशिक्षण', desc: '5 मार्गदर्शित पाठों में खेलना सीखें' },
      facil: { name: 'आसान', desc: '3 से 4 रंग • 2 से 3 खाली ट्यूब' },
      medio: { name: 'मध्यम', desc: '5 से 6 रंग • 2 खाली ट्यूब' },
      dificil: { name: 'कठिन', desc: '7 से 8 रंग • 1 से 2 खाली ट्यूब' },
      desafiador: { name: 'चुनौतीपूर्ण', desc: '9 से 10 रंग • 1 से 2 खाली ट्यूब' },
    },
    tutorialLessons: [
      {
        title: 'पाठ 1: डालने की मूल बातें',
        steps: [
          'चुनने के लिए पहले ट्यूब को स्पर्श करें (वह ऊपर उठेगा)।',
          'अब तरल डालने के लिए दूसरे ट्यूब (या खाली ट्यूब) को स्पर्श करें।',
          'बहुत बढ़िया! अब दोनों लाल तरल को एक ही ट्यूब में मिलाएं।',
        ],
      },
      {
        title: 'पाठ 2: केवल समान रंग मिलते हैं',
        steps: [
          'ऊपर लाल रंग वाले ट्यूब को चुनने के लिए स्पर्श करें।',
          'आप केवल उसी रंग या खाली ट्यूब में डाल सकते हैं। खाली ट्यूब को स्पर्श करें!',
          'शानदार! अब सियान रंगों को एक ही ट्यूब में इकट्ठा करें।',
          'पूरा करने के लिए अब बाकी लाल रंग मिलाएं!',
        ],
      },
      {
        title: 'पाठ 3: एक ट्यूब पूरा करें',
        steps: [
          'एक ही रंग की 4 इकाइयों से ट्यूब पूरा होता है। लाल ट्यूब पूरा करें!',
          'बढ़िया! अब दूसरा ट्यूब पूरा करने के लिए सियान मिलाएं।',
        ],
      },
      {
        title: 'पाठ 4: बंद रास्तों से बचें',
        steps: [
          'यदि लक्ष्य ट्यूब भरा है, तो खाली ट्यूब को अस्थायी जगह की तरह उपयोग करें!',
          'अब जगह बन गई! अलग बचे रंग को खाली जगह वाले ट्यूब में डालें।',
          'लगभग हो गया! जीतने के लिए आखिरी रंग मिलाएं।',
        ],
      },
      {
        title: 'पाठ 5: आपकी पहली जीत',
        steps: [
          'अब आपकी बारी है! खाली ट्यूब का उपयोग करके सभी 3 रंग अलग करें। आप कर सकते हैं!',
        ],
      },
    ],
    bgmTracks: {
      calm: { name: 'शांत', desc: 'मुलायम पैड और रिवर्ब के साथ आरामदायक लो-फ़ाई ध्वनि' },
      elevator: { name: 'एलिवेटर', desc: 'मरिंबा और हल्के स्विंग के साथ हल्का जैज़ / बोसा नोवा' },
      energetic: { name: 'तेज़', desc: '4/4 किक और आर्पेजियो के साथ जीवंत आर्केड इलेक्ट्रॉनिक' },
      fluid: { name: 'प्रवाह', desc: 'रात्रि सागर जैसे एहसास वाला स्मूद सिंथवेव' },
      classical: { name: 'शास्त्रीय', desc: 'मिनुएट शैली में पियानो और बारोक स्ट्रिंग्स' },
      percussive: { name: 'तालवाद्य', desc: 'टॉम्स, ताली और पेंटाटोनिक के साथ ट्राइबल विश्व संगीत' },
      chiptune: { name: '8-बिट', desc: 'शुद्ध स्क्वेयर वेव और तेज़ आर्पेजियो के साथ रेट्रो चिपट्यून' },
      cosmic: { name: 'ब्रह्मांड', desc: 'गहरे ड्रोन, धीमे LFO और तारों के साथ स्पेस एम्बिएंट' },
      dnb: { name: 'ऊर्जावान', desc: 'ब्रेकबीट और सिंकोपेटेड बास के साथ तेज़ ड्रम एंड बास' },
      organic: { name: 'ऑर्गेनिक', desc: 'हल्की लकड़ी की थाप के साथ फोक गिटार की धुन' },
    },
    visualModes: {
      color: {
        title: 'केवल रंग',
        desc: 'बिना किसी पैटर्न के पारंपरिक रंगीन तरल।',
      },
      pattern: {
        title: 'केवल वर्णांधता',
        desc: 'समान तटस्थ आधार, केवल ज्यामितीय पैटर्न द्वारा अंतर।',
      },
      both: {
        title: 'रंग + वर्णांधता',
        desc: 'अधिकतम स्पष्टता के लिए जीवंत रंगों के साथ चिह्न और पैटर्न।',
      },
    },
  },

  ar: {
    ariaSelectPhase: 'اختر المرحلة',
    ariaSelectBgm: 'اختر الموسيقى التصويرية',
    titleBgm: 'الموسيقى',
    ariaSettings: 'الإعدادات',
    titleSettings: 'الإعدادات',
    ariaLanguage: 'اختر اللغة',
    titleLanguage: 'اللغة',
    ariaSound: 'تبديل الصوت',
    titleSound: 'كتم / صوت',

    statMoves: 'الحركات',
    statIdeal: 'المثالي',
    statEff: 'الكفاءة',
    statEffFull: 'الكفاءة',

    ctrlUndo: 'تراجع',
    ctrlHint: 'تلميح',
    ctrlRestart: 'إعادة',
    ctrlExtra: '+1 أنبوب',

    deadlockWithExtra: 'لا توجد حركات متاحة! تراجع أو أعد التشغيل أو استخدم +1 أنبوب.',
    deadlockNoExtra: 'لا توجد حركات متاحة! تراجع أو أعد بدء الجولة.',
    toastTubeComplete: 'اكتمل الأنبوب!',
    tubeCompleteAria: 'أنبوب مكتمل',
    toastStreak: 'سلسلة x{count}!',
    toastMysteryDisabled: 'تم إيقاف الوضع الغامض. تم كشف الألوان.',
    tutorialStepCounter: 'الخطوة {current} من {total}',

    victorySkipCalloutTitle: 'إيقاع ممتاز!',
    winTutorialEyebrow: 'تم إتقان الدرس!',
    winTutorialTitle: 'اكتمل الدرس {round}!',
    winTutorialSubtitle: 'هل أنت مستعد للدرس التالي؟',
    winTutorialPrimaryNext: 'الدرس التالي',
    winBtnReplayLesson: 'إعادة الدرس',
    winBtnChoosePhase: 'اختر المرحلة',
    winGradEyebrow: 'التخرج 🎓',
    winGradTitle: 'اكتمل التدريب!',
    winGradSubtitle: 'أنت جاهز لتحدي المرحلة السهلة.',
    winGradPrimary: 'ابدأ المرحلة السهلة',
    winPerfectEyebrow: 'فوز مثالي!',
    winPerfectLastTitle: 'مثالي! المرحلة {phase} بنسبة 100%!',
    winPerfectRoundTitle: 'مثالي! كفاءة 100%!',
    winNormalEyebrow: 'مبارك!',
    winNormalLastEyebrow: 'تم إتقان المرحلة!',
    winNormalLastTitle: 'اكتملت مرحلة {phase}!',
    winNormalRoundTitle: 'اكتملت الجولة {round}!',
    winPrimaryNextRound: 'الجولة التالية',
    winSkipCalloutText:
      'لقد فزت في {easyCount} من أصل {totalRounds} جولات (أكثر من 25%) بكفاءة 100% ودون أنبوب إضافي. يمكنك الانتقال إلى مرحلة {nextPhase} الآن دون أي عقوبة.',
    winBtnAdvance: 'الانتقال إلى {nextPhase} (دون عقوبة)',
    winBtnNextPhase: 'الذهاب إلى {nextPhase}',
    winMasterEyebrow: 'سيد فرز السوائل!',
    winReplayPhase: 'إعادة لعب المرحلة',

    phasesModalTitle: 'اختر المرحلة',
    phasesModalSubtitle: 'جميع المراحل مفتوحة. ابدأ بالتدريب أو اختر التحدي المناسب لك.',
    phaseBadgeDone: 'مكتملة ✓',
    phaseBadgeCurrent: 'الحالية',
    phaseBadgeGuide: 'دليل',
    phaseUnitLesson: 'الدرس',
    phaseUnitRound: 'الجولة',
    phaseMetaProgress: '{unit} {current} / {total}',
    phaseMetaWon: 'تم الفوز {completed}/{total}',
    phaseMetaPerfect: ' • ★ {count} مثالية',
    phaseAriaProgress: 'التقدم في {phase}',

    bgmModalTitle: 'الموسيقى',
    bgmModalSubtitle: 'اختر الإيقاع الخلفي المصاحب لجولاتك.',
    bgmActiveBadge: 'نشطة',
    bgmBpmUnit: '{bpm} BPM',

    settingsModalTitle: 'الإعدادات',
    settingsModalSubtitle: 'اختر طريقة تمييز السوائل داخل الأنابيب.',
    settingsSectionVisual: 'إمكانية الوصول والمظهر',
    settingsSectionGameplay: 'أسلوب اللعب',
    settingsSectionAudio: 'الصوت',
    settingsSectionData: 'بيانات اللعبة',
    settingsActiveBadge: 'نشط',
    settingsMysteryModeLabel: 'الوضع الغامض (?)',
    settingsHintDurationLabel: 'مدة التلميح',
    settingsHintDurationOff: 'معطّل',
    settingsSfxVolumeLabel: 'مستوى صوت المؤثرات',
    settingsBgmVolumeLabel: 'مستوى صوت الموسيقى',
    settingsResetAllBtn: 'مسح كل التقدم',
    settingsBack: 'رجوع',
    settingsStateOn: 'مفعل',
    settingsStateOff: 'معطل',
    settingsSummaryGameplay: 'تلميح: {hint} • ? {mystery}',
    settingsSummaryAudio: 'المؤثرات {sfx}%، الموسيقى {bgm}%',
    settingsSummaryAudioMuted: 'صامت',
    settingsSummaryData: '{completed}/{total} جولات',
    settingsDataHint: 'يمسح جميع المراحل المكتملة واللوحات المحفوظة والإحصائيات.',
    ariaTubeEmpty: 'الأنبوب {index}: فارغ',
    ariaTubeLayers: 'الأنبوب {index}: الأعلى {color}، تبقى {count} طبقات',
    ariaTubeComplete: 'الأنبوب {index}: أنبوب {color} مكتمل',
    resetConfirm1Title: 'مسح كل التقدم؟',
    resetConfirm1Subtitle: 'سيتم حذف جميع المراحل المكتملة والجولات المحفوظة والإحصائيات.',
    resetConfirm1Next: 'متابعة',
    resetConfirm2Title: 'هل أنت متأكد تماماً؟',
    resetConfirm2Subtitle: 'لا يمكن التراجع عن هذا الإجراء. سيتم فقدان جميع تقدمك نهائياً.',
    resetConfirm2Confirm: 'نعم، امسح الكل',
    toastProgressErased: 'تم مسح كل التقدم.',

    languageModalTitle: 'اللغة',
    languageModalSubtitle: 'اختر لغة الواجهة.',
    languageActiveBadge: 'نشط',

    confirmModalTitle: 'إعادة بدء الجولة؟',
    confirmModalSubtitle: 'سيتم مسح كل التقدم في هذه الجولة والبدء من الصفر.',
    confirmCancel: 'إلغاء',
    confirmRestart: 'إعادة',

    stuckModalSubtitle: 'يبدو أنه لم تعد هناك حركات ممكنة. ما رأيك في المحاولة من جديد؟',
    stuckUndoBtn: 'تراجع عن الحركة الأخيرة',
    stuckRestartBtn: 'إعادة بدء الجولة',

    modalClose: 'إغلاق',

    perfectPhrases: [
      'أنت سيد فرز السوائل!',
      'لا تشوبه شائبة! ولا حركة إضافية.',
      'دقة جراحية!',
      'لم تُهدر قطرة واحدة. فوز مثالي!',
    ],
    motivationalPhrases: [
      'أوشكت! حاول تحطيم رقمك القياسي في المرة القادمة.',
      'أحسنت! كل جولة تزيدك مهارة.',
      'تقبل التحدي؟ قد تكون الجولة القادمة مثالية.',
      'لقد نجحت! جرب الآن بعدد حركات أقل.',
    ],
    phases: {
      treinamento: { name: 'التدريب', desc: 'تعلّم اللعب في 5 دروس موجّهة' },
      facil: { name: 'سهل', desc: '3 إلى 4 ألوان • 2 إلى 3 أنابيب فارغة' },
      medio: { name: 'متوسط', desc: '5 إلى 6 ألوان • أنبوبان فارغان' },
      dificil: { name: 'صعب', desc: '7 إلى 8 ألوان • 1 إلى 2 أنبوب فارغ' },
      desafiador: { name: 'تحدّي', desc: '9 إلى 10 ألوان • 1 إلى 2 أنبوب فارغ' },
    },
    tutorialLessons: [
      {
        title: 'الدرس 1: أساسيات السكب',
        steps: [
          'المس الأنبوب الأول لتحديده (سيرتفع للأعلى).',
          'الآن المس الأنبوب الثاني (أو الفارغ) لسكب السائل.',
          'ممتاز! الآن اجمع السائلين الأحمرين في نفس الأنبوب.',
        ],
      },
      {
        title: 'الدرس 2: تمتزج الألوان المتشابهة فقط',
        steps: [
          'المس الأنبوب الذي يعلوه اللون الأحمر لتحديده.',
          'يمكنك السكب فقط فوق نفس اللون أو في أنبوب فارغ. المس الفارغ!',
          'رائع! الآن اجمع اللون السماوي في نفس الأنبوب.',
          'الآن اجمع ما تبقى من اللون الأحمر للإنهاء!',
        ],
      },
      {
        title: 'الدرس 3: أكمل أنبوباً',
        steps: [
          'يكتمل الأنبوب بـ 4 وحدات من نفس اللون. أكمل الأنبوب الأحمر!',
          'مذهل! الآن اجمع اللون السماوي لإكمال الأنبوب الثاني.',
        ],
      },
      {
        title: 'الدرس 4: تجنّب الطرق المسدودة',
        steps: [
          'إذا كان الأنبوب المستهدف ممتلئاً، استخدم الأنبوب الفارغ كمنطقة مناورة!',
          'توفرت مساحة الآن! انقل اللون المعزول إلى الأنبوب المتاح.',
          'أوشكت! اجمع اللون الأخير للفوز.',
        ],
      },
      {
        title: 'الدرس 5: فوزك الأول',
        steps: [
          'الآن دورك! افصل جميع الألوان الثلاثة باستخدام الأنبوب الفارغ. يمكنك فعلها!',
        ],
      },
    ],
    bgmTracks: {
      calm: { name: 'هادئة', desc: 'أجواء لو-فاي مريحة مع باد ناعم وصدى' },
      elevator: { name: 'مصعد', desc: 'جاز خفيف / بوسا نوفا مع ماريمبا وإيقاع ناعم' },
      energetic: { name: 'حماسية', desc: 'إلكترونيك أركيد نشط مع إيقاع 4/4 وأربيجيو' },
      fluid: { name: 'انسيابية', desc: 'تشيل ويف / سينث ويف ناعم بأجواء محيط ليلي' },
      classical: { name: 'كلاسيكية', desc: 'بيانو وأوتار باروكية بأسلوب المينويت' },
      percussive: { name: 'إيقاعية', desc: 'موسيقى عالمية قبلية مع طبول وتصفيق وسلم خماسي' },
      chiptune: { name: '8-بت', desc: 'موسيقى ريترو كلاسيكية بموجات مربعة وأربيجيو سريع' },
      cosmic: { name: 'كونية', desc: 'موسيقى فضائية عميقة مع طنين منخفض ونجوم' },
      dnb: { name: 'سريعة', desc: 'درام آند بيس سريع مع بريك بيت وباس متقطع' },
      organic: { name: 'عضوية', desc: 'غيتار فولك هادئ مع نقرات خشبية لطيفة' },
    },
    visualModes: {
      color: {
        title: 'الألوان فقط',
        desc: 'سوائل ملونة كلاسيكية دون نقوش متداخلة.',
      },
      pattern: {
        title: 'وضع عمى الألوان فقط',
        desc: 'قاعدة محايدة موحدة يتم تمييزها بالأنماط الهندسية فقط.',
      },
      both: {
        title: 'ألوان + عمى الألوان',
        desc: 'يجمع بين الألوان الزاهية والرموز والأنماط لأقصى تباين.',
      },
    },
  },

  fr: {
    ariaSelectPhase: 'Choisir la phase',
    ariaSelectBgm: 'Choisir la bande-son',
    titleBgm: 'Bande-son',
    ariaSettings: 'Paramètres',
    titleSettings: 'Paramètres',
    ariaLanguage: 'Choisir la langue',
    titleLanguage: 'Langue',
    ariaSound: 'Activer ou couper le son',
    titleSound: 'Muet / Son',

    statMoves: 'Coups',
    statIdeal: 'Idéal',
    statEff: 'Effic.',
    statEffFull: 'Efficacité',

    ctrlUndo: 'Annuler',
    ctrlHint: 'Indice',
    ctrlRestart: 'Rejouer',
    ctrlExtra: '+1 Tube',

    deadlockWithExtra: 'Aucun coup possible ! Annulez, recommencez ou utilisez +1 Tube.',
    deadlockNoExtra: 'Aucun coup possible ! Annulez ou recommencez la manche.',
    toastTubeComplete: 'Tube complet !',
    tubeCompleteAria: 'Tube terminé',
    toastStreak: 'Série x{count} !',
    toastMysteryDisabled: 'Mode Mystère désactivé. Couleurs révélées.',
    tutorialStepCounter: 'Étape {current} sur {total}',

    victorySkipCalloutTitle: 'Excellent rythme !',
    winTutorialEyebrow: 'Leçon apprise !',
    winTutorialTitle: 'Leçon {round} terminée !',
    winTutorialSubtitle: 'Prêt pour la leçon suivante ?',
    winTutorialPrimaryNext: 'Leçon suivante',
    winBtnReplayLesson: 'Rejouer la leçon',
    winBtnChoosePhase: 'Choisir une phase',
    winGradEyebrow: 'Diplôme 🎓',
    winGradTitle: 'Entraînement terminé !',
    winGradSubtitle: 'Vous êtes prêt pour le défi Facile.',
    winGradPrimary: 'Commencer Facile',
    winPerfectEyebrow: 'Victoire parfaite !',
    winPerfectLastTitle: 'Parfait ! Phase {phase} à 100% !',
    winPerfectRoundTitle: 'Parfait ! 100% d’efficacité !',
    winNormalEyebrow: 'Bravo !',
    winNormalLastEyebrow: 'Phase maîtrisée !',
    winNormalLastTitle: 'Phase {phase} terminée !',
    winNormalRoundTitle: 'Manche {round} terminée !',
    winPrimaryNextRound: 'Manche suivante',
    winSkipCalloutText:
      'Vous avez gagné {easyCount} manches sur {totalRounds} (plus de 25%) avec 100% d’efficacité et sans tube bonus. Vous pouvez passer à {nextPhase} dès maintenant, sans pénalité.',
    winBtnAdvance: 'Passer à {nextPhase} (sans pénalité)',
    winBtnNextPhase: 'Aller à {nextPhase}',
    winMasterEyebrow: 'Maître de Liquid Sort !',
    winReplayPhase: 'Rejouer la phase',

    phasesModalTitle: 'Choisir une phase',
    phasesModalSubtitle: 'Toutes les phases sont débloquées. Commencez par l’Entraînement ou choisissez votre défi.',
    phaseBadgeDone: 'Terminée ✓',
    phaseBadgeCurrent: 'Actuelle',
    phaseBadgeGuide: 'Guide',
    phaseUnitLesson: 'Leçon',
    phaseUnitRound: 'Manche',
    phaseMetaProgress: '{unit} {current} / {total}',
    phaseMetaWon: '{completed}/{total} gagnées',
    phaseMetaPerfect: ' • ★ {count} parfaites',
    phaseAriaProgress: 'Progression dans {phase}',

    bgmModalTitle: 'Bande-son',
    bgmModalSubtitle: 'Choisissez le rythme d’ambiance pour vos parties.',
    bgmActiveBadge: 'Active',
    bgmBpmUnit: '{bpm} BPM',

    settingsModalTitle: 'Paramètres',
    settingsModalSubtitle: 'Choisissez comment différencier les liquides dans les tubes.',
    settingsSectionVisual: 'Accessibilité et Visuel',
    settingsSectionGameplay: 'Jouabilité',
    settingsSectionAudio: 'Audio',
    settingsSectionData: 'Données du Jeu',
    settingsActiveBadge: 'Actif',
    settingsMysteryModeLabel: 'Mode Mystère (?)',
    settingsHintDurationLabel: 'Durée de l’indice',
    settingsHintDurationOff: 'Désactivé',
    settingsSfxVolumeLabel: 'Volume des effets',
    settingsBgmVolumeLabel: 'Volume de la musique',
    settingsResetAllBtn: 'Effacer Toute la Progression',
    settingsBack: 'Retour',
    settingsStateOn: 'Activé',
    settingsStateOff: 'Off',
    settingsSummaryGameplay: 'Indice: {hint} • ? {mystery}',
    settingsSummaryAudio: 'Effets {sfx}%, Musique {bgm}%',
    settingsSummaryAudioMuted: 'Muet',
    settingsSummaryData: '{completed}/{total} manches',
    settingsDataHint: 'Supprime toutes les phases terminées, parties sauvegardées et statistiques.',
    ariaTubeEmpty: 'Tube {index} : Vide',
    ariaTubeLayers: 'Tube {index} : Haut {color}, {count} couches restantes',
    ariaTubeComplete: 'Tube {index} : Tube complet de {color}',
    resetConfirm1Title: 'Effacer toute la progression ?',
    resetConfirm1Subtitle: 'Toutes les phases terminées, manches sauvegardées et statistiques seront supprimées.',
    resetConfirm1Next: 'Continuer',
    resetConfirm2Title: 'Êtes-vous absolument sûr ?',
    resetConfirm2Subtitle: 'Cette action est irréversible. Toute votre progression sera définitivement perdue.',
    resetConfirm2Confirm: 'Oui, tout effacer',
    toastProgressErased: 'Toute la progression a été effacée.',

    languageModalTitle: 'Langue',
    languageModalSubtitle: 'Choisissez la langue de l’interface.',
    languageActiveBadge: 'Actif',

    confirmModalTitle: 'Recommencer la manche ?',
    confirmModalSubtitle: 'Toute la progression de la manche en cours sera réinitialisée.',
    confirmCancel: 'Annuler',
    confirmRestart: 'Rejouer',

    stuckModalSubtitle: 'Il semble qu’il n’y ait plus de coups possibles. Et si on réessayait ?',
    stuckUndoBtn: 'Annuler le dernier coup',
    stuckRestartBtn: 'Recommencer la manche',

    modalClose: 'Fermer',

    perfectPhrases: [
      'Vous êtes un maître du tri de liquides !',
      'Impeccable ! Pas un coup de trop.',
      'Précision chirurgicale !',
      'Pas une goutte perdue. Victoire parfaite !',
    ],
    motivationalPhrases: [
      'Presque ! Essayez de battre votre record la prochaine fois.',
      'Bien joué ! Chaque manche vous rend plus vif.',
      'Prêt pour le défi ? La prochaine peut être parfaite.',
      'Réussi ! Essayez maintenant en moins de coups.',
    ],
    phases: {
      treinamento: { name: 'Entraînement', desc: 'Apprenez à jouer en 5 leçons guidées' },
      facil: { name: 'Facile', desc: '3 à 4 couleurs • 2 à 3 tubes vides' },
      medio: { name: 'Moyen', desc: '5 à 6 couleurs • 2 tubes vides' },
      dificil: { name: 'Difficile', desc: '7 à 8 couleurs • 1 à 2 tubes vides' },
      desafiador: { name: 'Défi', desc: '9 à 10 couleurs • 1 à 2 tubes vides' },
    },
    tutorialLessons: [
      {
        title: 'Leçon 1 : Les bases du versement',
        steps: [
          'Touchez le premier tube pour le sélectionner (il va monter).',
          'Touchez maintenant le deuxième tube (ou le vide) pour verser le liquide.',
          'Très bien ! Réunissez maintenant les deux liquides rouges dans le même tube.',
        ],
      },
      {
        title: 'Leçon 2 : Seule la même couleur se mélange',
        steps: [
          'Touchez le tube avec le haut rouge pour le sélectionner.',
          'Vous ne pouvez verser que sur la même couleur ou dans un tube vide. Touchez le vide !',
          'Parfait ! Regroupez maintenant les liquides cyan dans le même tube.',
          'Réunissez enfin les rouges restants pour terminer !',
        ],
      },
      {
        title: 'Leçon 3 : Compléter un tube',
        steps: [
          'Un tube est complet avec 4 unités de la même couleur. Complétez le tube rouge !',
          'Super ! Réunissez les cyan pour compléter le second tube.',
        ],
      },
      {
        title: 'Leçon 4 : Éviter les impasses',
        steps: [
          'Si le tube cible est plein, utilisez le tube vide comme zone de manœuvre !',
          'De la place s’est libérée ! Déplacez la couleur isolée dans le tube libre.',
          'Presque fini ! Réunissez la dernière couleur pour gagner.',
        ],
      },
      {
        title: 'Leçon 5 : Votre première victoire',
        steps: [
          'À vous de jouer ! Séparez les 3 couleurs à l’aide du tube vide. Vous pouvez y arriver !',
        ],
      },
    ],
    bgmTracks: {
      calm: { name: 'Calme', desc: 'Ambiance lo-fi relaxante avec nappe douce et réverbération' },
      elevator: { name: 'Ascenseur', desc: 'Jazz léger / bossa nova avec marimba et swing doux' },
      energetic: { name: 'Rythmée', desc: 'Électro arcade dynamique avec kick 4/4 et arpèges' },
      fluid: { name: 'Fluide', desc: 'Chillwave / synthwave doux aux airs d’océan nocturne' },
      classical: { name: 'Classique', desc: 'Piano et cordes baroques dans un esprit menuet' },
      percussive: { name: 'Percussive', desc: 'Musique tribale avec toms, claps et pentatonique' },
      chiptune: { name: '8-Bit', desc: 'Chiptune rétro aux ondes carrées pures et arpèges rapides' },
      cosmic: { name: 'Cosmique', desc: 'Ambient spatial avec bourdon grave, LFO lent et étoiles' },
      dnb: { name: 'Énergique', desc: "Drum'n'bass rapide avec breakbeat et basse syncopée" },
      organic: { name: 'Organique', desc: 'Guitare folk arpégée avec légères percussions boisées' },
    },
    visualModes: {
      color: {
        title: 'Couleurs seules',
        desc: 'Liquides colorés classiques, sans textures superposées.',
      },
      pattern: {
        title: 'Daltonisme seul',
        desc: 'Base neutre uniforme différenciée uniquement par motifs géométriques.',
      },
      both: {
        title: 'Couleurs + Daltonisme',
        desc: 'Associe couleurs vives, symboles et textures pour un contraste maximal.',
      },
    },
  },

  ru: {
    ariaSelectPhase: 'Выбрать этап',
    ariaSelectBgm: 'Выбрать саундтрек',
    titleBgm: 'Саундтрек',
    ariaSettings: 'Настройки',
    titleSettings: 'Настройки',
    ariaLanguage: 'Выбрать язык',
    titleLanguage: 'Язык',
    ariaSound: 'Включить или выключить звук',
    titleSound: 'Звук / Без звука',

    statMoves: 'Ходы',
    statIdeal: 'Идеал',
    statEff: 'Эфф.',
    statEffFull: 'Эффект.',

    ctrlUndo: 'Отмена',
    ctrlHint: 'Подсказка',
    ctrlRestart: 'Сброс',
    ctrlExtra: '+1 Проб.',

    deadlockWithExtra: 'Ходов больше нет! Отмените ход, начните заново или добавьте +1 пробирку.',
    deadlockNoExtra: 'Ходов больше нет! Отмените ход или перезапустите раунд.',
    toastTubeComplete: 'Пробирка собрана!',
    tubeCompleteAria: 'Завершённая пробирка',
    toastStreak: 'Серия x{count}!',
    toastMysteryDisabled: 'Тайный режим выкл. Цвета открыты.',
    tutorialStepCounter: 'Шаг {current} из {total}',

    victorySkipCalloutTitle: 'Отличный темп!',
    winTutorialEyebrow: 'Урок пройден!',
    winTutorialTitle: 'Урок {round} завершён!',
    winTutorialSubtitle: 'Готовы к следующему уроку?',
    winTutorialPrimaryNext: 'Следующий урок',
    winBtnReplayLesson: 'Повторить урок',
    winBtnChoosePhase: 'Выбрать этап',
    winGradEyebrow: 'Выпуск 🎓',
    winGradTitle: 'Обучение завершено!',
    winGradSubtitle: 'Вы готовы к лёгкому этапу.',
    winGradPrimary: 'Начать Лёгкий этап',
    winPerfectEyebrow: 'Идеальная победа!',
    winPerfectLastTitle: 'Идеально! Этап «{phase}» на 100%!',
    winPerfectRoundTitle: 'Идеально! 100% эффективности!',
    winNormalEyebrow: 'Поздравляем!',
    winNormalLastEyebrow: 'Этап освоен!',
    winNormalLastTitle: 'Этап «{phase}» завершён!',
    winNormalRoundTitle: 'Раунд {round} завершён!',
    winPrimaryNextRound: 'Следующий раунд',
    winSkipCalloutText:
      'Вы прошли {easyCount} из {totalRounds} раундов (более 25%) со 100% эффективностью и без доп. пробирки. Можно перейти на этап «{nextPhase}» прямо сейчас без штрафа.',
    winBtnAdvance: 'Перейти к «{nextPhase}» (без штрафа)',
    winBtnNextPhase: 'Перейти к «{nextPhase}»',
    winMasterEyebrow: 'Мастер Liquid Sort!',
    winReplayPhase: 'Сыграть этап снова',

    phasesModalTitle: 'Выбрать этап',
    phasesModalSubtitle: 'Все этапы открыты. Начните с Обучения или выберите свой уровень сложности.',
    phaseBadgeDone: 'Пройден ✓',
    phaseBadgeCurrent: 'Текущий',
    phaseBadgeGuide: 'Гид',
    phaseUnitLesson: 'Урок',
    phaseUnitRound: 'Раунд',
    phaseMetaProgress: '{unit} {current} / {total}',
    phaseMetaWon: 'Пройдено {completed}/{total}',
    phaseMetaPerfect: ' • ★ {count} идеал.',
    phaseAriaProgress: 'Прогресс: {phase}',

    bgmModalTitle: 'Саундтрек',
    bgmModalSubtitle: 'Выберите фоновый ритм для ваших партий.',
    bgmActiveBadge: 'Активна',
    bgmBpmUnit: '{bpm} BPM',

    settingsModalTitle: 'Настройки',
    settingsModalSubtitle: 'Выберите способ различения жидкостей в пробирках.',
    settingsSectionVisual: 'Доступность и Визуал',
    settingsSectionGameplay: 'Игровой процесс',
    settingsSectionAudio: 'Аудио',
    settingsSectionData: 'Данные игры',
    settingsActiveBadge: 'Активно',
    settingsMysteryModeLabel: 'Тайный режим (?)',
    settingsHintDurationLabel: 'Длительность подсказки',
    settingsHintDurationOff: 'Выкл.',
    settingsSfxVolumeLabel: 'Громкость эффектов',
    settingsBgmVolumeLabel: 'Громкость музыки',
    settingsResetAllBtn: 'Стереть весь прогресс',
    settingsBack: 'Назад',
    settingsStateOn: 'Вкл',
    settingsStateOff: 'Выкл',
    settingsSummaryGameplay: 'Подсказка: {hint} • ? {mystery}',
    settingsSummaryAudio: 'Эффекты {sfx}%, Музыка {bgm}%',
    settingsSummaryAudioMuted: 'Без звука',
    settingsSummaryData: '{completed}/{total} раунд.',
    settingsDataHint: 'Удаляет все пройденные этапы, сохранённые доски и статистику.',
    ariaTubeEmpty: 'Пробирка {index}: Пусто',
    ariaTubeLayers: 'Пробирка {index}: Сверху {color}, слоев: {count}',
    ariaTubeComplete: 'Пробирка {index}: Завершённая пробирка ({color})',
    resetConfirm1Title: 'Стереть весь прогресс?',
    resetConfirm1Subtitle: 'Все пройденные этапы, сохранённые раунды и статистика будут удалены.',
    resetConfirm1Next: 'Продолжить',
    resetConfirm2Title: 'Вы абсолютно уверены?',
    resetConfirm2Subtitle: 'Это действие нельзя отменить. Весь ваш прогресс будет потерян навсегда.',
    resetConfirm2Confirm: 'Да, стереть всё',
    toastProgressErased: 'Весь прогресс стёрт.',

    languageModalTitle: 'Язык',
    languageModalSubtitle: 'Выберите язык интерфейса.',
    languageActiveBadge: 'Активен',

    confirmModalTitle: 'Перезапустить раунд?',
    confirmModalSubtitle: 'Весь прогресс текущего раунда будет сброшен.',
    confirmCancel: 'Отмена',
    confirmRestart: 'Сбросить',

    stuckModalSubtitle: 'Похоже, больше нет возможных ходов. Попробуем ещё раз?',
    stuckUndoBtn: 'Отменить последний ход',
    stuckRestartBtn: 'Перезапустить раунд',

    modalClose: 'Закрыть',

    perfectPhrases: [
      'Вы настоящий мастер сортировки жидкостей!',
      'Безупречно! Ни одного лишнего хода.',
      'Хирургическая точность!',
      'Ни капли мимо. Идеальная победа!',
    ],
    motivationalPhrases: [
      'Почти идеально! Попробуйте побить свой рекорд в следующий раз.',
      'Отлично! С каждым раундом вы играете точнее.',
      'Примете вызов? Следующий раунд может стать идеальным.',
      'Победа! Теперь попробуйте за меньшее число ходов.',
    ],
    phases: {
      treinamento: { name: 'Обучение', desc: 'Освойте игру за 5 пошаговых уроков' },
      facil: { name: 'Лёгкий', desc: '3–4 цвета • 2–3 пустые пробирки' },
      medio: { name: 'Средний', desc: '5–6 цветов • 2 пустые пробирки' },
      dificil: { name: 'Сложный', desc: '7–8 цветов • 1–2 пустые пробирки' },
      desafiador: { name: 'Вызов', desc: '9–10 цветов • 1–2 пустые пробирки' },
    },
    tutorialLessons: [
      {
        title: 'Урок 1: Основы переливания',
        steps: [
          'Нажмите на первую пробирку, чтобы выбрать её (она поднимется).',
          'Теперь нажмите на вторую пробирку (или на пустую), чтобы перелить жидкость.',
          'Отлично! Теперь соедините обе красные жидкости в одной пробирке.',
        ],
      },
      {
        title: 'Урок 2: Смешиваются только одинаковые цвета',
        steps: [
          'Нажмите на пробирку с красным слоем сверху, чтобы выбрать её.',
          'Переливать можно только на тот же цвет или в пустую пробирку. Нажмите на пустую!',
          'Отлично! Теперь соберите голубые слои в одну пробирку.',
          'Теперь объедините оставшиеся красные слои для победы!',
        ],
      },
      {
        title: 'Урок 3: Соберите полную пробирку',
        steps: [
          'Пробирка считается завершённой при 4 слоях одного цвета. Заполните красную пробирку!',
          'Супер! Теперь объедините голубые слои во второй пробирке.',
        ],
      },
      {
        title: 'Урок 4: Избегайте тупиков',
        steps: [
          'Если целевая пробирка заполнена, используйте пустую пробирку для манёвра!',
          'Место освободилось! Переместите отдельный цвет в свободную пробирку.',
          'Почти готово! Объедините последний цвет для победы.',
        ],
      },
      {
        title: 'Урок 5: Ваша первая победа',
        steps: [
          'Теперь ваша очередь! Разделите все 3 цвета с помощью пустой пробирки. У вас получится!',
        ],
      },
    ],
    bgmTracks: {
      calm: { name: 'Спокойная', desc: 'Расслабляющий lo-fi эмбиент с мягким пэдом и ревербом' },
      elevator: { name: 'Лифт', desc: 'Лёгкий джаз / босанова с маримбой и мягким свингом' },
      energetic: { name: 'Бодрая', desc: 'Живая аркадная электроника с 4/4 бочкой и арпеджио' },
      fluid: { name: 'Плавная', desc: 'Мягкий chillwave / synthwave в атмосфере ночного океана' },
      classical: { name: 'Классика', desc: 'Фортепиано и барочные струнные в духе менуэта' },
      percussive: { name: 'Ударная', desc: 'Этническая перкуссия с томами, хлопками и пентатоникой' },
      chiptune: { name: '8-Бит', desc: 'Ретро-чиптюн с чистыми прямоугольными волнами и арпеджио' },
      cosmic: { name: 'Космос', desc: 'Космический эмбиент с глубоким дроном, LFO и звёздами' },
      dnb: { name: 'Драйв', desc: 'Быстрый драм-н-бейс с брейкбитом и синкопированным басом' },
      organic: { name: 'Акустика', desc: 'Перебор фолк-гитары с лёгким стуком по дереву' },
    },
    visualModes: {
      color: {
        title: 'Только цвета',
        desc: 'Классические цветные жидкости без наложенных текстур.',
      },
      pattern: {
        title: 'Только узоры',
        desc: 'Нейтральная основа, различаемая только геометрическими узорами.',
      },
      both: {
        title: 'Цвета + узоры',
        desc: 'Сочетает яркие цвета со значками и текстурами для максимума контраста.',
      },
    },
  },
};

export function normalizeLangCode(raw: string | null | undefined): LangCode | null {
  if (!raw || typeof raw !== 'string') return null;
  const base = raw.trim().toLowerCase().split(/[-_]/)[0];
  if (base in SUPPORTED_LANGUAGES) {
    return base as LangCode;
  }
  return null;
}

export function detectSystemLanguage(): LangCode {
  if (typeof navigator !== 'undefined') {
    const candidates: string[] = [];
    if (Array.isArray(navigator.languages)) {
      candidates.push(...navigator.languages);
    }
    if (navigator.language) {
      candidates.push(navigator.language);
    }
    for (const c of candidates) {
      const normalized = normalizeLangCode(c);
      if (normalized) return normalized;
    }
  }
  return 'en';
}

export function formatTemplate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    return Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`;
  });
}

export function translate(
  lang: LangCode,
  key: keyof {
    [K in keyof TranslationDict as TranslationDict[K] extends string ? K : never]: string;
  },
  vars?: Record<string, string | number>
): string {
  const dict = I18N[lang] || I18N.en;
  const raw = (dict[key] as string | undefined) ?? (I18N.en[key] as string);
  return formatTemplate(raw, vars);
}
