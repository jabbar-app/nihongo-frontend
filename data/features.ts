import { BookOpenIcon, BrainIcon, SparklesIcon, TimerIcon, ListTodoIcon, RepeatIcon } from "lucide-react";
import { IFeature } from "../types";

export const features: IFeature[] = [
    {
        title: "Spaced repetition reviews",
        description:
            "A focused review queue that schedules cards at the right time so you remember more with less effort.",
        icon: RepeatIcon,
        cardBg: "bg-orange-100",
        iconBg: "bg-orange-500"
    },
    {
        title: "Decks for real study goals",
        description:
            "Browse curated decks (JLPT + more) and study in an order that makes sense.",
        icon: BookOpenIcon,
        cardBg: "bg-green-100",
        iconBg: "bg-green-500"
    },
    {
        title: "Mnemonics when you’re stuck",
        description:
            "Create your own mnemonic or generate suggestions to make tough words finally click.",
        icon: BrainIcon,
        cardBg: "bg-indigo-100",
        iconBg: "bg-indigo-500"
    },
    {
        title: "Daily plan that keeps you moving",
        description:
            "Quick wins, momentum tasks, and a main quest—so you always know what to do next.",
        icon: ListTodoIcon,

        cardBg: "bg-pink-100",
        iconBg: "bg-pink-500"
    },
    {
        title: "Reading + time tracking",
        description:
            "Save anything you read (articles, conversations, stories) and track sessions automatically.",
        icon: TimerIcon,
        cardBg: "bg-lime-100",
        iconBg: "bg-lime-500"
    },
    {
        title: "AI assist (optional)",
        description:
            "Use AI to generate mnemonic ideas—your learning stays in your control.",
        icon: SparklesIcon,
        cardBg: "bg-gray-50",
        iconBg: "bg-orange-500",
    },
]