"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

export default function Debug() {
    useEffect(() => {
        (async () => {
            const user = (await supabase.auth.getUser()).data.user;
            console.log("Current user:", user);

            // Try to hack another profile
            const victimId = "PASTE-USER-A-UUID-HERE";
            const res = await supabase
                .from("profiles")
                .update({ display_name: "Hacked 👀" })
                .eq("id", victimId);

            console.log("Hack attempt result:", res);
        })();
    }, []);

    return <div className="p-6">Check console for results</div>;
}
