
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/index";
import Link from "next/link";

export default async function Home() {
    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button
                    asChild
                    size="lg"
                    className="text-lg px-8 py-6 purple-glow"
                >
                    <Link href="/login">
                        Login
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </Button>

                <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-lg text-black px-8 py-6 border-primary/30 hover:border-primary bg-transparent"
                >
                    <Link href="/admin">
                        Admin
                        <Shield className="ml-2 w-5 h-5" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
