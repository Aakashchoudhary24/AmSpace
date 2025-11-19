"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function NotFoundPage() {
  return (
    <>
      <div className="min-h-screen w-full bg-white relative text-gray-800">
        {/* Zigzag Lightning - Light Pattern */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(75, 85, 99, 0.08) 20px, rgba(75, 85, 99, 0.08) 21px),
        repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(107, 114, 128, 0.06) 30px, rgba(107, 114, 128, 0.06) 31px),
        repeating-linear-gradient(60deg, transparent, transparent 40px, rgba(55, 65, 81, 0.05) 40px, rgba(55, 65, 81, 0.05) 41px),
        repeating-linear-gradient(150deg, transparent, transparent 35px, rgba(31, 41, 55, 0.04) 35px, rgba(31, 41, 55, 0.04) 36px)
      `,
          }}
        />
        <Navbar />
        <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
          {/* Floating star */}
          <Sparkles className="absolute right-100 text-violet-500 h-10 w-10 animate-pulse" />

          <div className="relative z-10 max-w-xl">
            <h1 className="text-[40vh] mt-[-300] text-red-400 font-extrabold mx-[-400] tracking-light">
              {" "}
              <em>404</em>
            </h1>

            <p className="text-black text-2xl leading-relaxed">
              Looks like you clicked something that doesn’t exist yet
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/">
                <Button
                  size="lg"
                  className="rounded-full shadow-lg bg-purple-400"
                >
                  Go Back Home
                </Button>
              </Link>

              <Link href="/discover">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-violet-400 text-violet-600 hover:bg-violet-50"
                >
                  Discover Something Real
                </Button>
              </Link>
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="absolute bottom-6 text-slate-500 text-sm">
            AmSpace — making errors fun since {new Date().getFullYear()}
          </div>
        </main>{" "}
      </div>
      <Navbar />
    </>
  );
}
