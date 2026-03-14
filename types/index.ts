/**
 * Types Module
 * 
 * Centralized type definitions for the Manabou frontend application.
 * This module provides a single entry point for all type definitions organized by domain.
 * 
 * @module types
 */

// Re-export all subdirectory types
export * from './api';
export * from './browser';
export * from './components';
export * from './context';
export * from './domain';
export * from './errors';
export * from './hooks';
export * from './mappers';

// Legacy types (to be migrated to appropriate subdirectories)
// Note: These types use the old "I" prefix convention and should be migrated
// to follow the new naming conventions (PascalCase without prefix)
import { LucideIcon } from "lucide-react";

/**
 * Custom icon configuration
 * @deprecated Use CustomIcon instead (without "I" prefix)
 */
export interface ICustomIcon {
    icon: LucideIcon;
    dir?: 'left' | 'right';
}

/**
 * Custom icon configuration (follows new naming convention)
 */
export interface CustomIcon {
    icon: LucideIcon;
    dir?: 'left' | 'right';
}

/**
 * Section title configuration
 * @deprecated Use SectionTitle instead (without "I" prefix)
 */
export interface ISectionTitle {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    dir?: 'center' | 'left' | 'right';
}

/**
 * Section title configuration (follows new naming convention)
 */
export interface SectionTitle {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    dir?: 'center' | 'left' | 'right';
}

/**
 * Link configuration
 * @deprecated Use Link instead (without "I" prefix)
 */
export interface ILink {
    name: string;
    href: string;
}

/**
 * Link configuration (follows new naming convention)
 */
export interface Link {
    name: string;
    href: string;
}

/**
 * Testimonial data
 * @deprecated Use Testimonial instead (without "I" prefix)
 */
export interface ITestimonial {
    name: string;
    handle: string;
    image: string;
    quote: string;
    rating: number;
}

/**
 * Testimonial data (follows new naming convention)
 */
export interface Testimonial {
    name: string;
    handle: string;
    image: string;
    quote: string;
    rating: number;
}

/**
 * FAQ item
 * @deprecated Use Faq instead (without "I" prefix)
 */
export interface IFaq {
    question: string;
    answer: string;
}

/**
 * FAQ item (follows new naming convention)
 */
export interface Faq {
    question: string;
    answer: string;
}

/**
 * Feature description
 * @deprecated Use Feature instead (without "I" prefix)
 */
export interface IFeature {
    title: string;
    description: string;
    icon: LucideIcon;
    cardBg: string;
    iconBg: string;
}

/**
 * Feature description (follows new naming convention)
 */
export interface Feature {
    title: string;
    description: string;
    icon: LucideIcon;
    cardBg: string;
    iconBg: string;
}
