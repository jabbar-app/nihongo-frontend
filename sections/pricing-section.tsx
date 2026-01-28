'use client';

import { pricing } from "@/data/pricing";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { CircleDollarSignIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PricingSection() {
    const router = useRouter();
    const [planType, setPlanType] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <section id="pricing" className="py-12 md:py-16 px-4 bg-gray-50">
            <div className="max-w-md md:max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <CircleDollarSignIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Pricing</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Simple, transparent plans
                    </h2>
                    <p className="text-gray-600">
                        Start free, then upgrade when you want more support and insight.
                    </p>
                </div>

                {/* Plan Type Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex p-1 bg-white rounded-full border border-gray-200">
                        <button
                            onClick={() => setPlanType('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                                planType === 'monthly'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setPlanType('yearly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors relative ${
                                planType === 'yearly'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600'
                            }`}
                        >
                            Yearly
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                                20% OFF
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {pricing.map((plan, index) => (
                        <Card
                            key={index}
                            className={`p-6 ${
                                plan.type === 'popular'
                                    ? 'ring-2 ring-blue-600'
                                    : ''
                            }`}
                        >
                            <div className={`w-12 h-12 ${
                                plan.type === 'popular' ? 'bg-blue-600' : 'bg-gray-100'
                            } rounded-xl flex items-center justify-center mb-4`}>
                                <plan.icon className={`w-6 h-6 ${
                                    plan.type === 'popular' ? 'text-white' : 'text-gray-600'
                                }`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                            <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                            <div className="mb-6">
                                <span className="text-3xl font-bold text-gray-900">
                                    ${planType === 'monthly' ? plan.price : Math.floor(plan.price * 0.8)}
                                </span>
                                <span className="text-gray-600">/mo</span>
                            </div>
                            <Button
                                variant={plan.type === 'popular' ? 'primary' : 'outline'}
                                fullWidth
                                className="mb-6"
                                onClick={() => router.push('/register')}
                            >
                                {plan.linkText}
                            </Button>
                            <div className="space-y-2">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        <span className="text-sm text-gray-600">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
