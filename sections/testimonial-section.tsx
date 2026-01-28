'use client';

import { testimonials } from "@/data/testimonials";
import Card from "@/components/ui/card";
import { ShieldCheckIcon, StarIcon } from "lucide-react";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function TestimonialSection() {
    const router = useRouter();

    return (
        <section id="testimonials" className="py-12 md:py-16 px-4 bg-white">
            <div className="max-w-md md:max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Testimonials</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        What our users say
                    </h2>
                    <p className="text-gray-600">
                        A calmer way to study Japanese—built for consistency, not intensity.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                    {testimonials.map((testimonial, index) => (
                        <Card
                            key={index}
                            className={`p-5 ${
                                index === 1 ? 'bg-blue-600 text-white' : ''
                            }`}
                        >
                            <div className="flex items-center gap-1 mb-4">
                                {Array(testimonial.rating).fill(0).map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`w-4 h-4 ${
                                            index === 1
                                                ? 'text-yellow-300 fill-yellow-300'
                                                : 'text-orange-500 fill-orange-500'
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className={`text-sm mb-4 leading-relaxed ${
                                index === 1 ? 'text-white/90' : 'text-gray-600'
                            }`}>
                                "{testimonial.quote}"
                            </p>
                            <div className="flex items-center gap-3">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <div className={`font-medium ${
                                        index === 1 ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {testimonial.name}
                                    </div>
                                    <div className={`text-xs ${
                                        index === 1 ? 'text-white/70' : 'text-gray-500'
                                    }`}>
                                        {testimonial.handle}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Button
                        onClick={() => router.push('/login')}
                        size="lg"
                    >
                        Start studying
                    </Button>
                </div>
            </div>
        </section>
    );
}
