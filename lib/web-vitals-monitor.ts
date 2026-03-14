'use client';

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

/**
 * Web Vitals Metric
 * 
 * Represents a single Core Web Vitals metric
 */
export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  timestamp: Date;
}

/**
 * Web Vitals Monitoring Configuration
 */
export interface WebVitalsConfig {
  endpoint?: string;
  enabled?: boolean;
  debug?: boolean;
  sendBeacon?: boolean;
}

/**
 * Web Vitals Monitor
 * 
 * Collects and tracks Core Web Vitals metrics:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * 
 * @example
 * ```typescript
 * const monitor = new WebVitalsMonitor({
 *   endpoint: '/api/metrics',
 *   debug: true,
 * });
 * 
 * monitor.start();
 * ```
 */
export class WebVitalsMonitor {
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private endpoint: string;
  private enabled: boolean;
  private debug: boolean;
  private sendBeacon: boolean;

  constructor(config: WebVitalsConfig = {}) {
    this.endpoint = config.endpoint || '/api/metrics';
    this.enabled = config.enabled !== false;
    this.debug = config.debug || false;
    this.sendBeacon = config.sendBeacon !== false;
  }

  /**
   * Start monitoring Web Vitals
   */
  start(): void {
    if (!this.enabled) return;

    getCLS((metric: Metric) => this.recordMetric(metric));
    getFID((metric: Metric) => this.recordMetric(metric));
    getFCP((metric: Metric) => this.recordMetric(metric));
    getLCP((metric: Metric) => this.recordMetric(metric));
    getTTFB((metric: Metric) => this.recordMetric(metric));

    if (this.debug) {
      console.log('[Web Vitals] Monitoring started');
    }
  }

  /**
   * Record a metric
   */
  private recordMetric(metric: Metric): void {
    const webVitalsMetric: WebVitalsMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating || 'good',
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType || 'navigate',
      timestamp: new Date(),
    };

    this.metrics.set(metric.name, webVitalsMetric);

    if (this.debug) {
      console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    }

    // Send to endpoint
    this.sendMetric(webVitalsMetric);
  }

  /**
   * Send metric to endpoint
   */
  private sendMetric(metric: WebVitalsMetric): void {
    const data = JSON.stringify(metric);

    if (this.sendBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(this.endpoint, data);
    } else {
      fetch(this.endpoint, {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
      }).catch((error) => {
        if (this.debug) {
          console.error('[Web Vitals] Failed to send metric:', error);
        }
      });
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): WebVitalsMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get specific metric
   */
  getMetric(name: string): WebVitalsMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get metrics by rating
   */
  getMetricsByRating(rating: 'good' | 'needs-improvement' | 'poor'): WebVitalsMetric[] {
    return this.getMetrics().filter(m => m.rating === rating);
  }

  /**
   * Check if all metrics are good
   */
  allMetricsGood(): boolean {
    return this.getMetrics().every(m => m.rating === 'good');
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    good: number;
    needsImprovement: number;
    poor: number;
    total: number;
  } {
    const metrics = this.getMetrics();
    return {
      good: metrics.filter(m => m.rating === 'good').length,
      needsImprovement: metrics.filter(m => m.rating === 'needs-improvement').length,
      poor: metrics.filter(m => m.rating === 'poor').length,
      total: metrics.length,
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
    console.log('[Web Vitals Summary]', summary);
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

/**
 * Global Web Vitals Monitor Instance
 */
let globalMonitor: WebVitalsMonitor | null = null;

/**
 * Get or create global Web Vitals Monitor
 */
export function getWebVitalsMonitor(config?: WebVitalsConfig): WebVitalsMonitor {
  if (!globalMonitor) {
    globalMonitor = new WebVitalsMonitor(config);
  }
  return globalMonitor;
}

/**
 * Initialize Web Vitals Monitoring
 * 
 * Call this in your app layout or root component
 * 
 * @example
 * ```typescript
 * import { initWebVitalsMonitoring } from '@/lib/web-vitals-monitor';
 * 
 * export default function RootLayout() {
 *   useEffect(() => {
 *     initWebVitalsMonitoring({
 *       endpoint: '/api/metrics',
 *       debug: process.env.NODE_ENV === 'development',
 *     });
 *   }, []);
 *   
 *   return <html>{/* ... */}</html>;
 * }
 * ```
 */
export function initWebVitalsMonitoring(config?: WebVitalsConfig): void {
  if (typeof window === 'undefined') return;

  const monitor = getWebVitalsMonitor(config);
  monitor.start();
}
