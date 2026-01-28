'use client';

import CountUp from "@/components/count-number";

export default function StatsSection() {
    return (
        <section className="py-12 md:py-16 px-4 bg-white">
            <div className="max-w-md md:max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <div className="text-center">
                        <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                            <CountUp from={0} to={25} />
                        </h3>
                        <p className="text-gray-600">A simple daily review target</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                            <CountUp from={0} to={14} />
                        </h3>
                        <p className="text-gray-600">Days of progress on your dashboard</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                            <CountUp from={0} to={3} />
                        </h3>
                        <p className="text-gray-600">Ways to study: reviews, reading, focus</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
