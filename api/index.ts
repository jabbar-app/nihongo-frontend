/**
 * API Layer
 * 
 * Barrel export for API client and services
 * 
 * @module api
 */

export { apiClient, default as ApiClient } from './client';
export type { ApiResponse, RequestConfig, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './client';

export * from './services';
