'use client';

import { useEffect, useRef } from 'react';

/**
 * useRenderMetrics Hook
 * 
 * Tracks component render performance and logs slow renders.
 * Useful for identifying performance bottlenecks during development.
 * 
 * @param componentName - Name of the component being profiled
 * @param threshold - Render time threshold in milliseconds (default: 16ms for 60fps)
 * 
 * @example
 * ```tsx
 * export function MyComponent() {
 *   useRenderMetrics('MyComponent');
 *   return <div>Component content</div>;
 * }
 * ```
 */
export function useRenderMetrics(
  componentName: string,
  threshold: number = 16
): void {
  const renderStartTime = useRef<number>(performance.now());

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    if (renderTime > threshold) {
      console.warn(
        `[Performance] Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }

    // Log in development only
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[Render] ${componentName} rendered in ${renderTime.toFixed(2)}ms`
      );
    }
  });
}

/**
 * RenderMetricsCollector
 * 
 * Collects and aggregates render metrics for multiple components.
 * Useful for performance monitoring and analysis.
 * 
 * @example
 * ```tsx
 * const collector = new RenderMetricsCollector();
 * 
 * export function MyComponent() {
 *   useRenderMetrics('MyComponent');
 *   // ...
 * }
 * 
 * // Later, get metrics
 * const metrics = collector.getMetrics();
 * ```
 */
export interface RenderMetric {
  componentName: string;
  renderTime: number;
  renderCount: number;
  averageRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
  lastRenderTime: Date;
}

class RenderMetricsCollector {
  private metrics: Map<string, RenderMetric> = new Map();

  recordRender(componentName: string, renderTime: number): void {
    const existing = this.metrics.get(componentName);

    if (existing) {
      existing.renderCount++;
      existing.renderTime += renderTime;
      existing.averageRenderTime = existing.renderTime / existing.renderCount;
      existing.maxRenderTime = Math.max(existing.maxRenderTime, renderTime);
      existing.minRenderTime = Math.min(existing.minRenderTime, renderTime);
      existing.lastRenderTime = new Date();
    } else {
      this.metrics.set(componentName, {
        componentName,
        renderTime,
        renderCount: 1,
        averageRenderTime: renderTime,
        maxRenderTime: renderTime,
        minRenderTime: renderTime,
        lastRenderTime: new Date(),
      });
    }
  }

  getMetrics(): RenderMetric[] {
    return Array.from(this.metrics.values());
  }

  getMetric(componentName: string): RenderMetric | undefined {
    return this.metrics.get(componentName);
  }

  getSlowComponents(threshold: number = 16): RenderMetric[] {
    return this.getMetrics().filter(m => m.averageRenderTime > threshold);
  }

  clear(): void {
    this.metrics.clear();
  }

  reset(componentName: string): void {
    this.metrics.delete(componentName);
  }

  printReport(): void {
    console.table(this.getMetrics());
  }

  printSlowReport(threshold: number = 16): void {
    const slowComponents = this.getSlowComponents(threshold);
    if (slowComponents.length > 0) {
      console.warn(`[Performance] ${slowComponents.length} slow components detected:`);
      console.table(slowComponents);
    } else {
      console.log('[Performance] No slow components detected');
    }
  }
}

// Global collector instance
export const renderMetricsCollector = new RenderMetricsCollector();

/**
 * useRenderMetricsWithCollection Hook
 * 
 * Extended version of useRenderMetrics that also collects metrics
 * in the global collector for analysis.
 * 
 * @param componentName - Name of the component being profiled
 * @param threshold - Render time threshold in milliseconds
 * 
 * @example
 * ```tsx
 * export function MyComponent() {
 *   useRenderMetricsWithCollection('MyComponent');
 *   return <div>Component content</div>;
 * }
 * 
 * // Later, get metrics
 * const metrics = renderMetricsCollector.getMetrics();
 * renderMetricsCollector.printSlowReport();
 * ```
 */
export function useRenderMetricsWithCollection(
  componentName: string,
  threshold: number = 16
): void {
  const renderStartTime = useRef<number>(performance.now());

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // Record in collector
    renderMetricsCollector.recordRender(componentName, renderTime);

    // Log slow renders
    if (renderTime > threshold) {
      console.warn(
        `[Performance] Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }

    // Log in development only
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[Render] ${componentName} rendered in ${renderTime.toFixed(2)}ms`
      );
    }
  });
}
