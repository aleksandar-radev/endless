// Audio manager for game sounds
// All sounds must be imported statically at the top

const SOUNDS = {
  enemyDeath: (import.meta.env.BASE_URL || '/') + '/sounds/enemy-death.mp3',
};

class AudioManager {
  constructor() {
    this.volume = 0; // Slider value (0.0 - 1.0)
    this.scaledVolume = 0; // Actual playback volume after scaling
    this.sounds = {};
    // Preload all sounds
    for (const [key, src] of Object.entries(SOUNDS)) {
      const audio = new Audio(src);
      audio.volume = this.scaledVolume;
      this.sounds[key] = audio;
    }
  }

  setVolume(vol) {
    // Use cubic scaling for even steeper perceived loudness curve
    this.volume = Math.max(0, Math.min(1, vol));
    this.scaledVolume = Math.pow(this.volume, 3);
    for (const audio of Object.values(this.sounds)) {
      audio.volume = this.scaledVolume;
    }
  }

  play(key) {
    if (this.scaledVolume <= 0) return;
    const audio = this.sounds[key];
    if (audio) {
      // Clone to allow overlapping sounds
      const clone = audio.cloneNode();
      clone.volume = this.scaledVolume;
      clone.play();
    }
  }
}

export const audioManager = new AudioManager();
