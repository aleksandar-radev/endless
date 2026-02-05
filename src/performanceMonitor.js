/**
 * Performance monitoring system for detecting bottlenecks
 * Tracks frame times, long tasks, memory usage, and function performance
 */

class PerformanceMonitor {
  constructor() {
    this.enabled = false;
    this.metrics = {
      frameTimes: [],
      longTasks: [],
      functionCalls: new Map(),
      memorySnapshots: [],
    };
    this.marks = new Map();
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.overlayElement = null;
    this.showVisual = false;
  }

  enable() {
    this.enabled = true;
    this.startMonitoring();
    console.log('📊 Performance Monitor enabled');
  }

  disable() {
    this.enabled = false;
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }
    console.log('📊 Performance Monitor disabled');
  }

  enableVisual() {
    this.showVisual = true;
    this.createOverlay();
    if (this.overlayElement) {
      this.overlayElement.classList.remove('hidden');
    }
    console.log('📊 Visual performance monitor enabled');
  }

  disableVisual() {
    this.showVisual = false;
    if (this.overlayElement) {
      this.overlayElement.classList.add('hidden');
    }
    console.log('📊 Visual performance monitor disabled');
  }

  createOverlay() {
    if (this.overlayElement) return;

    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'perf-monitor-overlay';
    this.overlayElement.innerHTML = `
      <div class="perf-title">⚡ Performance Monitor</div>
      <div class="perf-stat">
        <span class="perf-label">FPS:</span>
        <span class="perf-value" id="perf-fps">--</span>
      </div>
      <div class="perf-stat">
        <span class="perf-label">Frame Time:</span>
        <span class="perf-value" id="perf-frame-time">--</span>
      </div>
      <div class="perf-stat">
        <span class="perf-label">Memory:</span>
        <span class="perf-value" id="perf-memory">--</span>
      </div>
      <div class="perf-stat">
        <span class="perf-label">Game Loop:</span>
        <span class="perf-value" id="perf-gameloop">--</span>
      </div>
      <div class="perf-graph" id="perf-graph"></div>
    `;
    document.body.appendChild(this.overlayElement);

    // Create graph bars
    const graph = document.getElementById('perf-graph');
    for (let i = 0; i < 60; i++) {
      const bar = document.createElement('div');
      bar.className = 'perf-graph-bar';
      graph.appendChild(bar);
    }

    // Update display every 100ms
    setInterval(() => this.updateOverlay(), 100);
  }

  updateOverlay() {
    if (!this.showVisual || !this.overlayElement) return;

    const frameTimes = this.metrics.frameTimes.slice(-60);
    if (frameTimes.length === 0) return;

    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const fps = 1000 / avgFrameTime;

    // Update FPS
    const fpsEl = document.getElementById('perf-fps');
    if (fpsEl) {
      fpsEl.textContent = fps.toFixed(1);
      fpsEl.className = 'perf-value';
      if (fps < 30) fpsEl.classList.add('critical');
      else if (fps < 50) fpsEl.classList.add('warning');
    }

    // Update frame time
    const frameTimeEl = document.getElementById('perf-frame-time');
    if (frameTimeEl) {
      frameTimeEl.textContent = `${avgFrameTime.toFixed(2)}ms`;
      frameTimeEl.className = 'perf-value';
      if (avgFrameTime > 33) frameTimeEl.classList.add('critical');
      else if (avgFrameTime > 20) frameTimeEl.classList.add('warning');
    }

    // Update memory
    const memoryEl = document.getElementById('perf-memory');
    if (memoryEl && performance.memory) {
      const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
      memoryEl.textContent = `${usedMB}MB`;
      memoryEl.className = 'perf-value';
      const percent = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
      if (percent > 80) memoryEl.classList.add('critical');
      else if (percent > 60) memoryEl.classList.add('warning');
    }

    // Update game loop time
    const gameLoopEl = document.getElementById('perf-gameloop');
    if (gameLoopEl) {
      const gameLoopStats = this.metrics.functionCalls.get('gameLoop');
      if (gameLoopStats) {
        const avgTime = gameLoopStats.totalTime / gameLoopStats.count;
        gameLoopEl.textContent = `${avgTime.toFixed(2)}ms`;
        gameLoopEl.className = 'perf-value';
        if (avgTime > 10) gameLoopEl.classList.add('critical');
        else if (avgTime > 5) gameLoopEl.classList.add('warning');
      }
    }

    // Update graph
    const graph = document.getElementById('perf-graph');
    if (graph) {
      const bars = graph.querySelectorAll('.perf-graph-bar');
      const maxFrameTime = Math.max(...frameTimes, 16.67); // At least 60fps baseline
      frameTimes.slice(-60).forEach((time, i) => {
        if (bars[i]) {
          const height = (time / maxFrameTime) * 100;
          bars[i].style.height = `${height}%`;
          bars[i].className = 'perf-graph-bar';
          if (time > 33) bars[i].classList.add('critical');
          else if (time > 16.67) bars[i].classList.add('warning');
        }
      });
    }
  }

  startMonitoring() {
    // Monitor long tasks (if supported)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            });
            if (entry.duration > 50) {
              console.warn(
                `⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`,
                entry,
              );
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task API not supported in all browsers
      }
    }

    // Track frame times
    this.trackFrames();

    // Monitor memory every 5 seconds
    setInterval(() => this.checkMemory(), 5000);

    // Report summary every 30 seconds
    setInterval(() => this.reportSummary(), 30000);
  }

  trackFrames() {
    if (!this.enabled) return;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.metrics.frameTimes.push(frameTime);
    if (this.metrics.frameTimes.length > 120) {
      this.metrics.frameTimes.shift();
    }

    // Warn on dropped frames (>16.67ms = below 60fps)
    if (frameTime > 33) {
      console.warn(`🎮 Frame drop: ${frameTime.toFixed(2)}ms (${(1000/frameTime).toFixed(1)} FPS)`);
    }

    this.frameCount++;
    requestAnimationFrame(() => this.trackFrames());
  }

  checkMemory() {
    if (!this.enabled || !performance.memory) return;

    const memory = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };

    this.metrics.memorySnapshots.push(memory);
    if (this.metrics.memorySnapshots.length > 12) {
      this.metrics.memorySnapshots.shift();
    }

    const usedMB = (memory.used / 1048576).toFixed(2);
    const totalMB = (memory.total / 1048576).toFixed(2);
    const percent = ((memory.used / memory.limit) * 100).toFixed(1);

    if (percent > 80) {
      console.warn(`🧠 High memory usage: ${usedMB}MB / ${totalMB}MB (${percent}%)`);
    }
  }

  // Mark the start of a performance-critical section
  mark(name) {
    if (!this.enabled) return;
    this.marks.set(name, performance.now());
  }

  // Measure and log the duration of a marked section
  measure(name, warnThreshold = 10) {
    if (!this.enabled) return 0;

    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`❌ No mark found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    // Track function call metrics
    const existing = this.metrics.functionCalls.get(name) || {
      count: 0,
      totalTime: 0,
      maxTime: 0,
    };
    existing.count++;
    existing.totalTime += duration;
    existing.maxTime = Math.max(existing.maxTime, duration);
    this.metrics.functionCalls.set(name, existing);

    if (duration > warnThreshold) {
      console.warn(
        `⏱️ Slow operation: ${name} took ${duration.toFixed(2)}ms`,
      );
    }

    return duration;
  }

  // Wrap a function to automatically measure its performance
  wrap(fn, name) {
    if (!this.enabled) return fn;

    return (...args) => {
      this.mark(name);
      const result = fn(...args);
      this.measure(name);
      return result;
    };
  }

  reportSummary() {
    if (!this.enabled) return;

    console.group('📊 Performance Summary (last 30s)');

    // Frame time stats
    if (this.metrics.frameTimes.length > 0) {
      const avg = this.metrics.frameTimes.reduce((a, b) => a + b, 0) / this.metrics.frameTimes.length;
      const max = Math.max(...this.metrics.frameTimes);
      const min = Math.min(...this.metrics.frameTimes);
      const avgFPS = 1000 / avg;
      console.log(`🎮 Frame Time: avg ${avg.toFixed(2)}ms (${avgFPS.toFixed(1)} FPS), min ${min.toFixed(2)}ms, max ${max.toFixed(2)}ms`);
    }

    // Memory stats
    if (this.metrics.memorySnapshots.length > 0) {
      const latest = this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1];
      const usedMB = (latest.used / 1048576).toFixed(2);
      const totalMB = (latest.total / 1048576).toFixed(2);
      console.log(`🧠 Memory: ${usedMB}MB / ${totalMB}MB`);
    }

    // Top 10 slowest functions
    const sorted = Array.from(this.metrics.functionCalls.entries())
      .sort((a, b) => b[1].totalTime - a[1].totalTime)
      .slice(0, 10);

    if (sorted.length > 0) {
      console.log('⏱️ Top 10 functions by total time:');
      sorted.forEach(([name, stats]) => {
        console.log(
          `  ${name}: ${stats.count}x calls, ${stats.totalTime.toFixed(2)}ms total, ${(stats.totalTime / stats.count).toFixed(2)}ms avg, ${stats.maxTime.toFixed(2)}ms max`,
        );
      });
    }

    console.groupEnd();
  }

  getReport() {
    const frameTimes = this.metrics.frameTimes;
    const avgFrameTime = frameTimes.length > 0
      ? frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
      : 0;

    return {
      avgFPS: avgFrameTime > 0 ? 1000 / avgFrameTime : 0,
      avgFrameTime,
      longTasks: this.metrics.longTasks.length,
      memory: this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1],
      slowestFunctions: Array.from(this.metrics.functionCalls.entries())
        .sort((a, b) => b[1].totalTime - a[1].totalTime)
        .slice(0, 10)
        .map(([name, stats]) => ({
          name,
          calls: stats.count,
          totalTime: stats.totalTime,
          avgTime: stats.totalTime / stats.count,
          maxTime: stats.maxTime,
        })),
    };
  }

  reset() {
    this.metrics = {
      frameTimes: [],
      longTasks: [],
      functionCalls: new Map(),
      memorySnapshots: [],
    };
    console.log('📊 Performance metrics reset');
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  window.perfMon = performanceMonitor;
}
