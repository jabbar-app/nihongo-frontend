/**
 * Render Profiler
 * 
 * Tracks component render times and identifies performance bottlenecks.
 * Helps identify slow components and re-render patterns.
 */

/**
 * Render metrics for a component
 */
export interface RenderMetrics {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
}

/**
 * Render profiler configuration
 */
export interface RenderProfilerConfig {
  enabled?: boolean;
  debug?: boolean;
  slowRenderThreshold?: number; // ms
  endpoint?: string;
}

/**
 * Render Profiler
 * 
 * Tracks component render times and identifies slow renders
 * 
 * @example
 * ```typescript
 * const profiler = new RenderProfiler({
 *   debug: true,
 *   slowRenderThreshold: 16,
 * });
 * 
 * profiler.recordRender('MyComponent', 25);
 * ```
 */
export class RenderProfiler {
  private metrics: Map<string, RenderMetrics> = new Map();
  private renderTimes: Map<string, number[]> = new Map();
  private enabled: boolean;
  private debug: boolean;
  private slowRenderThreshold: number;
  private endpoint: string;

  constructor(config: RenderProfilerConfig = {}) {
    this.enabled = config.enabled !== false;
    this.debug = config.debug || false;
    this.slowRenderThreshold = config.slowRenderThreshold || 16;
    this.endpoint = config.endpoint || '/api/render-metrics';
  }

  /**
   * Record a component render
   */
  recordRender(componentName: string, renderTime: number): void {
    if (!this.enabled) return;

    // Get or create metrics
    const existing = this.metrics.get(componentName) || {
      componentName,
      renderTime: 0,
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      maxRenderTime: 0,
      minRenderTime: Infinity,
    };

    // Update metrics
    existing.renderCount++;
    existing.renderTime += renderTime;
    existing.lastRenderTime = renderTime;
    existing.maxRenderTime = Math.max(existing.maxRenderTime, renderTime);
    existing.minRenderTime = Math.min(existing.minRenderTime, renderTime);
    existing.averageRenderTime = existing.renderTime / existing.renderCount;

    this.metrics.set(componentName, existing);

    // Track render times for analysis
    const times = this.renderTimes.get(componentName) || [];
    times.push(renderTime);
    this.renderTimes.set(componentName, times);

    // Log slow renders
    if (renderTime > this.slowRenderThreshold) {
      if (this.debug) {
        console.warn(
          `[Render Profiler] Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`
        );
      }
      this.sendSlowRenderAlert(componentName, renderTime);
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): RenderMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get specific component metrics
   */
  getComponentMetrics(componentName: string): RenderMetrics | undefined {
    return this.metrics.get(componentName);
  }

  /**
   * Get slow components
   */
  getSlowComponents(threshold?: number): RenderMetrics[] {
    const t = threshold || this.slowRenderThreshold;
    return this.getMetrics().filter(m => m.lastRenderTime > t);
  }

  /**
   * Get components by render count
   */
  getComponentsByRenderCount(minCount: number = 1): RenderMetrics[] {
    return this.getMetrics()
      .filter(m => m.renderCount >= minCount)
      .sort((a, b) => b.renderCount - a.renderCount);
  }

  /**
   * Get components by average render time
   */
  getComponentsByAverageRenderTime(): RenderMetrics[] {
    return this.getMetrics()
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  }

  /**
   * Get re-render patterns
   */
  getReRenderPatterns(): {
    componentName: string;
    renderCount: number;
    averageRenderTime: number;
  }[] {
    return this.getMetrics()
      .filter(m => m.renderCount > 1)
      .map(m => ({
        componentName: m.componentName,
        renderCount: m.renderCount,
        averageRenderTime: m.averageRenderTime,
      }))
      .sort((a, b) => b.renderCount - a.renderCount);
  }

  /**
   * Get render time trend for a component
   */
  getRenderTimeTrend(componentName: string): number[] {
    return this.renderTimes.get(componentName) || [];
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalComponents: number;
    totalRenders: number;
    averageRenderTime: number;
    slowComponents: number;
    fastestComponent: string | null;
    slowestComponent: string | null;
  } {
    const metrics = this.getMetrics();
    const totalRenders = metrics.reduce((sum, m) => sum + m.renderCount, 0);
    const totalRenderTime = metrics.reduce((sum, m) => sum + m.renderTime, 0);

    let fastestComponent: string | null = null;
    let slowestComponent: string | null = null;
    let minTime = Infinity;
    let maxTime = 0;

    for (const m of metrics) {
      if (m.averageRenderTime < minTime) {
        minTime = m.averageRenderTime;
        fastestComponent = m.componentName;
      }
      if (m.averageRenderTime > maxTime) {
        maxTime = m.averageRenderTime;
        slowestComponent = m.componentName;
      }
    }

    return {
      totalComponents: metrics.length,
      totalRenders,
      averageRenderTime: totalRenders > 0 ? totalRenderTime / totalRenders : 0,
      slowComponents: this.getSlowComponents().length,
      fastestComponent,
      slowestComponent,
    };
  }

  /**
   * Print metrics report
   */
  printReport(): void {
    console.table(this.getMetrics());
  }

  /**
   * Print summary
   */
  printSummary(): void {
    const summary = this.getSummary();
    console.log('[Render Profiler Summary]', summary);
  }

  /**
   * Print slow components
   */
  printSlowComponents(): void {
    const slow = this.getSlowComponents();
    if (slow.length === 0) {
      console.log('[Render Profiler] No slow components detected');
      return;
    }
    console.table(slow);
  }

  /**
   * Print re-render patterns
   */
  printReRenderPatterns(): void {
    const patterns = this.getReRenderPatterns();
    if (patterns.length === 0) {
      console.log('[Render Profiler] No re-render patterns detected');
      return;
    }
    console.table(patterns);
  }

  /**
   * Send slow render alert
   */
  private sendSlowRenderAlert(componentName: string, renderTime: number): void {
    const data = JSON.stringify({
      componentName,
      renderTime,
      threshold: this.slowRenderThreshold,
      timestamp: new Date().toISOString(),
    });

    fetch(this.endpoint, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
    }).catch((error) => {
      if (this.debug) {
        console.error('[Render Profiler] Failed to send alert:', error);
      }
    });
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics.clear();
    this.renderTimes.clear();
  }

  /**
   * Enable profiler
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable profiler
   */
  disable(): void {
    this.enabled = false;
  }
}

/**
 * Global render profiler instance
 */
let globalProfiler: RenderProfiler | null = null;

/**
 * Get or create global render profiler
 */
export function getRenderProfiler(config?: RenderProfilerConfig): RenderProfiler {
  if (!globalProfiler) {
    globalProfiler = new RenderProfiler(config);
  }
  return globalProfiler;
}

/**
 * Initialize render profiler
 * 
 * @example
 * ```typescript
 * import { initRenderProfiler } from '@/lib/render-profiler';
 * 
 * initRenderProfiler({
 *   debug: process.env.NODE_ENV === 'development',
 *   slowRenderThreshold: 16,
 * });
 * ```
 */
export function initRenderProfiler(config?: RenderProfilerConfig): void {
  getRenderProfiler(config);
}
