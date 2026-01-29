import { LucideIcon } from "lucide-react";

export interface ICustomIcon {
    icon: LucideIcon;
    dir?: 'left' | 'right';
}

export interface ISectionTitle {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    dir?: 'center' | 'left' | 'right';
}

export interface ILink {
    name: string;
    href: string;
}

export interface ITestimonial {
    name: string;
    handle: string;
    image: string;
    quote: string;
    rating: number;
}

export interface IPricingPlan {
    icon: LucideIcon;
    name: string;
    description: string;
    price: number;
    linkText: string;
    linkUrl: string;
    features: string[];
    type?: 'popular' | string;
}

export interface IFaq {
    question: string;
    answer: string;
}

export interface ITeamMember {
    name: string;
    image: string;
    role: string;
}

export interface IFeature {
    title: string;
    description: string;
    icon: LucideIcon;
    cardBg: string;
    iconBg: string;
}
