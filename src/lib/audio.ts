// Tactical Web Audio API Emergency Synthesizer
// Synthesizes realistic sweeping emergency sirens and loud alarm bursts programmatically.

let audioCtx: AudioContext | null = null;
let sirenOsc: OscillatorNode | null = null;
let sirenModulator: OscillatorNode | null = null;
let sirenModGain: GainNode | null = null;
let sirenGain: GainNode | null = null;

let alarmInterval: number | null = null;
let alarmOsc: OscillatorNode | null = null;
let alarmGain: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a realistic sweeping emergency siren (frequency sweeping 600Hz - 1200Hz)
 */
export function startSiren() {
  try {
    const ctx = getAudioContext();
    if (sirenOsc) return; // Already running

    // Gain node for volume control
    sirenGain = ctx.createGain();
    sirenGain.gain.setValueAtTime(0.4, ctx.currentTime);

    // Main carrier oscillator
    sirenOsc = ctx.createOscillator();
    sirenOsc.type = "sine";
    sirenOsc.frequency.setValueAtTime(800, ctx.currentTime);

    // Modulator oscillator for sweeping the frequency
    sirenModulator = ctx.createOscillator();
    sirenModulator.type = "sawtooth";
    sirenModulator.frequency.value = 1.2; // 1.2Hz frequency sweep rate

    // Modulator gain determines the frequency sweep range (e.g. +/- 300Hz)
    sirenModGain = ctx.createGain();
    sirenModGain.gain.value = 250;

    // Connect modulator to carrier frequency
    sirenModulator.connect(sirenModGain);
    sirenModGain.connect(sirenOsc.frequency);

    // Connect carrier to output
    sirenOsc.connect(sirenGain);
    sirenGain.connect(ctx.destination);

    // Start oscillators
    sirenModulator.start();
    sirenOsc.start();
  } catch (e) {
    console.warn("Failed to play synthesized siren:", e);
  }
}

/**
 * Stops the sweeping emergency siren
 */
export function stopSiren() {
  try {
    if (sirenOsc) {
      sirenOsc.stop();
      sirenOsc.disconnect();
      sirenOsc = null;
    }
    if (sirenModulator) {
      sirenModulator.stop();
      sirenModulator.disconnect();
      sirenModulator = null;
    }
    if (sirenModGain) {
      sirenModGain.disconnect();
      sirenModGain = null;
    }
    if (sirenGain) {
      sirenGain.disconnect();
      sirenGain = null;
    }
  } catch (e) {
    console.warn("Failed to stop sweeping siren:", e);
  }
}

/**
 * Plays a highly distinct loud dual-tone emergency alarm (staccato high pitch)
 */
export function startLoudAlarm() {
  try {
    const ctx = getAudioContext();
    if (alarmInterval) return; // Already running

    let highTone = true;

    // We cycle a loud beep every 200ms
    alarmInterval = window.setInterval(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square"; // harsher square wave for extreme alert
        osc.frequency.setValueAtTime(highTone ? 2200 : 1800, ctx.currentTime);
        highTone = !highTone;

        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (err) {
        console.error(err);
      }
    }, 200);
  } catch (e) {
    console.warn("Failed to start loud alarm:", e);
  }
}

/**
 * Stops the loud dual-tone alarm
 */
export function stopLoudAlarm() {
  if (alarmInterval !== null) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

/**
 * Global stop for all rescue signals
 */
export function stopAllEmergencyAudio() {
  stopSiren();
  stopLoudAlarm();
}
