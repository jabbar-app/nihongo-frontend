import { IPricingPlan } from "@/types";
import { RocketIcon, UserIcon, UsersIcon } from "lucide-react";

export const pricing: IPricingPlan[] = [
    {
        icon: RocketIcon,
        name: "Free",
        description: "Start reviews and build a daily study habit.",
        price: 0,
        linkText: "Get started",
        linkUrl: "/register",
        features: [
            "Spaced repetition reviews",
            "Browse decks",
            "Create your own cards",
            "Basic daily plan",
            "Reading + focus tracking",
        ],
    },
    {
        icon: UserIcon,
        name: "Plus",
        description: "For serious learners who want extra help and insight.",
        price: 7,
        linkText: "Upgrade",
        linkUrl: "/register",
        features: [
            "Everything in Free",
            "Mnemonic generation (AI assist)",
            "More daily plan customization",
            "Improved dashboard stats",
            "Priority feedback",
        ],
    },
    {
        icon: UsersIcon,
        name: "Pro",
        type: "popular",
        description: "For power users and long-term study routines.",
        price: 12,
        linkText: "Go Pro",
        linkUrl: "/register",
        features: [
            "Everything in Plus",
            "Advanced review insights",
            "Faster content workflows",
            "Import/export (coming soon)",
            "Priority support",
        ],
    },
];