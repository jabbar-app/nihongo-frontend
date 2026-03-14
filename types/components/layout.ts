/**
 * Layout Component Types
 * 
 * Consolidated type definitions for layout components.
 */

import React from 'react';

/**
 * Props for PageHeader component
 */
export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional Japanese title */
  titleJa?: string;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional breadcrumbs */
  breadcrumbs?: Breadcrumb[];
  /** Optional action button or element */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Represents a breadcrumb item
 */
export interface Breadcrumb {
  /** Breadcrumb label */
  label: string;
  /** Optional href for link */
  href?: string;
  /** Optional icon */
  icon?: React.ReactNode;
}

/**
 * Props for PageContainer component
 */
export interface PageContainerProps {
  /** Container content */
  children: React.ReactNode;
  /** Maximum width variant */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Whether to add padding */
  padding?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for Sidebar component
 */
export interface SidebarProps {
  /** Sidebar content */
  children: React.ReactNode;
  /** Whether the sidebar is open (for mobile) */
  isOpen?: boolean;
  /** Callback when sidebar should close */
  onClose?: () => void;
  /** Sidebar position */
  position?: 'left' | 'right';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for Header component
 */
export interface HeaderProps {
  /** Header content */
  children?: React.ReactNode;
  /** Whether the header is sticky */
  sticky?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for Footer component
 */
export interface FooterProps {
  /** Footer content */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for Container component
 */
export interface ContainerProps {
  /** Container content */
  children: React.ReactNode;
  /** Maximum width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Whether to center the container */
  center?: boolean;
  /** Additional CSS classes */
  className?: string;
}
