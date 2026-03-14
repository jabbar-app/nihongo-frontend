/**
 * API Services
 * 
 * Barrel export for all API services
 * 
 * @module api/services
 */

export { BaseService } from './base-service';
export { userService, default as UserService } from './user-service';
export { authService, default as AuthService } from './auth-service';
export type { LoginResponse, RegisterResponse } from './auth-service';
