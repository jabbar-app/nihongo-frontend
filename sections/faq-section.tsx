'use client';

import { faqs } from "@/data/faqs";
import Card from "@/components/ui/card";
import { CircleQuestionMarkIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-12 md:py-16 px-4 bg-white">
            <div className="max-w-md md:max-w-2xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <CircleQuestionMarkIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">FAQ</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Got questions?
                    </h2>
                    <p className="text-gray-600">
                        Everything you need to know about Manabou and how to get started.
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <Card key={index} className="p-5">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                                <ChevronDownIcon
                                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                                        openIndex === index ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {openIndex === index && (
                                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                                    {faq.answer}
                                </p>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
