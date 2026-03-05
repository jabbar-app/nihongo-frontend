"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { api as apiClient } from "@/lib/api";
import CanDoScenarioView from "@/components/practice/can-do-scenario-view";

interface CanDoTarget {
    id: number;
    description_jp: string;
    description_id: string;
    chapter: number;
}

export default function CanDoPracticePage() {
    const params = useParams();
    const router = useRouter();
    const [target, setTarget] = useState<CanDoTarget | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const targetId = params.target_id as string;

    useEffect(() => {
        // We only need the target's basic info to display it as a header
        // so we can fetch all targets and find this one.
        // Realistically, there should be a dedicated GET /cando-targets/{id} endpoint,
        // but we can just find it from the list for now if it doesn't exist.
        const fetchTarget = async () => {
            try {
                const data = await apiClient.get('/api/v1/cando-targets');

                let chapters: any[] = [];
                if (Array.isArray(data)) {
                    chapters = data;
                } else if (data && typeof data === 'object') {
                    chapters = Object.values(data);
                }

                const allTargets: CanDoTarget[] = chapters.flatMap(c => c.targets || []);
                const found = allTargets.find(t => t.id.toString() === targetId);

                if (found) {
                    setTarget(found);
                } else {
                    setErrorMsg("Target not found");
                }
            } catch (error) {
                console.error("Failed to fetch target:", error);
                setErrorMsg("Error fetching target");
            } finally {
                setLoading(false);
            }
        };

        if (targetId) {
            fetchTarget();
        }
    }, [targetId, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-4">
                <div className="text-red-500 font-semibold">{errorMsg}</div>
                <Button variant="outline" size="sm" onClick={() => router.push('/test')}>Return to Test List</Button>
            </div>
        );
    }

    if (!target) return null;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => router.push('/test')} className="px-3">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Can-do Practice: Chapter {target.chapter}</h1>
                    <p className="text-muted-foreground mt-1">
                        <span className="font-semibold block">{target.description_jp}</span>
                        <span className="text-sm">{target.description_id}</span>
                    </p>
                </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl border mt-4">
                <CanDoScenarioView targetId={target.id} />
            </div>
        </div>
    );
}
