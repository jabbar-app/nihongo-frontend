'use client';

import { team } from "@/data/team";
import { HandshakeIcon } from "lucide-react";
import Card from "@/components/ui/card";

export default function OurTeamSection() {
    return (
        <section className="py-12 md:py-16 px-4 bg-gray-50">
            <div className="max-w-md md:max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <HandshakeIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Team</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Meet Our Team
                    </h2>
                    <p className="text-gray-600">
                        A small team building a calmer way to study Japanese—one good daily session at a time.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {team.map((member, index) => (
                        <Card key={index} className="p-4 text-center">
                            <img
                                src={member.image}
                                alt={member.name}
                                className="w-full aspect-[3/4] object-cover rounded-xl mb-3"
                            />
                            <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
                            <p className="text-sm text-gray-600">{member.role}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
