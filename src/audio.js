// Audio manager for game sounds
// All sounds must be imported statically at the top

const SOUNDS = {
  enemyDeath: (import.meta.env.BASE_URL || '/') + '/sounds/enemy-death.mp3',
};

class AudioManager {
  constructor() {
    this.volume = 0; // Default volume (0.0 - 1.0)
    this.sounds = {};
    // Preload all sounds
    for (const [key, src] of Object.entries(SOUNDS)) {
      const audio = new Audio(src);
      audio.volume = this.volume;
      this.sounds[key] = audio;
    }
  }

  setVolume(vol) {
    // Use cubic scaling for even steeper perceived loudness curve
    this.volume = Math.max(0, Math.min(1, vol));
    const scaled = Math.pow(this.volume, 3);
    for (const audio of Object.values(this.sounds)) {
      audio.volume = scaled;
    }
  }

  play(key) {
    const audio = this.sounds[key];
    if (audio) {
      // Clone to allow overlapping sounds
      const clone = audio.cloneNode();
      clone.volume = this.volume;
      clone.play();
    }
  }
}

export const audioManager = new AudioManager();
