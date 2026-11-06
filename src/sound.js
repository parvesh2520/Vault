// Native Web Audio API Sound Synthesizer
// Zero external files, zero dependencies, works offline and instantly!

class SoundEngine {
  constructor() {
    this.ctx = null
    this.enabled = true
    this.initOnFirstInteraction = this.initOnFirstInteraction.bind(this)
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  initOnFirstInteraction() {
    this.init()
    window.removeEventListener('pointerdown', this.initOnFirstInteraction)
    window.removeEventListener('keydown', this.initOnFirstInteraction)
  }

  bindInteraction() {
    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', this.initOnFirstInteraction, { once: true })
      window.addEventListener('keydown', this.initOnFirstInteraction, { once: true })
    }
  }

  toggle() {
    this.enabled = !this.enabled
    return this.enabled
  }

  // Keypad click / beep
  playKey(key = '1') {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    // Keypad DTMF-style frequency map
    const freqs = {
      '1': 697, '2': 770, '3': 852,
      '4': 697, '5': 770, '6': 852,
      '7': 697, '8': 770, '9': 852,
      '0': 941, 'enter': 1209, 'clear': 440
    }
    const freq = freqs[key] || 800

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.06)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.06)
  }

  // Mechanical solenoid locker latch clack (heavy click + metallic resonance)
  playSolenoid() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime

    // Transient click (noise burst)
    const bufferSize = this.ctx.sampleRate * 0.04
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
    }
    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2200, now)
    filter.Q.setValueAtTime(3, now)

    const noiseGain = this.ctx.createGain()
    noiseGain.gain.setValueAtTime(0.2, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(this.ctx.destination)
    noise.start(now)

    // Low-end solenoid thud
    const sub = this.ctx.createOscillator()
    const subGain = this.ctx.createGain()
    sub.type = 'triangle'
    sub.frequency.setValueAtTime(140, now)
    sub.frequency.exponentialRampToValueAtTime(45, now + 0.08)

    subGain.gain.setValueAtTime(0.25, now)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

    sub.connect(subGain)
    subGain.connect(this.ctx.destination)
    sub.start(now)
    sub.stop(now + 0.09)
  }

  // Servo whir when door swings open
  playDoorOpen() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.12)
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.22)

    gain.gain.setValueAtTime(0.04, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1800, now)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.22)
  }

  // Barcode laser sweep chirp
  playScan() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1800, now)
    osc.frequency.exponentialRampToValueAtTime(2800, now + 0.08)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.09)
  }

  // Access Granted dual chime
  playSuccess() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const notes = [587.33, 880] // D5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const start = now + idx * 0.09

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.12, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(start)
      osc.stop(start + 0.28)
    })
  }

  // Access Denied error buzz
  playError() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(140, now)
    osc.frequency.setValueAtTime(120, now + 0.08)

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.18)
  }

  // Cryo compressor surge
  playCryoHum() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(80, now)
    osc.frequency.linearRampToValueAtTime(110, now + 0.2)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.28)
  }
}

export const sound = new SoundEngine()
sound.bindInteraction()
