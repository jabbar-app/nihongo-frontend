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

export interface IFaq {
    question: string;
    answer: string;
}

export interface IFeature {
    title: string;
    description: string;
    icon: LucideIcon;
    cardBg: string;
    iconBg: string;
}
