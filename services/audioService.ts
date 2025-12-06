export const AudioController = {
  ctx: null as AudioContext | null,
  init: () => {
    if (!AudioController.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        AudioController.ctx = new AudioContextClass();
      }
    }
  },
  playTone: (freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) => {
    if (!AudioController.ctx) AudioController.init();
    if (!AudioController.ctx) return;

    const osc = AudioController.ctx.createOscillator();
    const gain = AudioController.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, AudioController.ctx.currentTime + startTime);
    gain.gain.setValueAtTime(vol, AudioController.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, AudioController.ctx.currentTime + startTime + duration);
    osc.connect(gain);
    gain.connect(AudioController.ctx.destination);
    osc.start(AudioController.ctx.currentTime + startTime);
    osc.stop(AudioController.ctx.currentTime + startTime + duration);
  },
  playCoin: (combo: number = 0) => {
    const pitch = Math.min(1.5, 1 + combo * 0.1); 
    AudioController.playTone(1200 * pitch, 'square', 0.1, 0);
    AudioController.playTone(1600 * pitch, 'square', 0.2, 0.1);
  },
  playCorrect: () => {
    AudioController.playTone(660, 'sine', 0.1, 0);
    AudioController.playTone(880, 'sine', 0.3, 0.1);
  },
  playStrokeSuccess: () => {
    AudioController.playTone(800, 'triangle', 0.05, 0, 0.05);
  },
  playWrong: () => {
    AudioController.playTone(150, 'sawtooth', 0.4, 0);
  },
  playWin: () => {
    [523, 659, 784, 1046, 784, 1046].forEach((f, i) => {
      AudioController.playTone(f, 'square', 0.2, i * 0.1);
    });
  },
  playClick: () => {
    AudioController.playTone(400, 'triangle', 0.05);
  },
  speak: (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.6; 
      utterance.volume = 1.0; 
      utterance.pitch = 1.1; 
      window.speechSynthesis.speak(utterance);
    }
  }
};