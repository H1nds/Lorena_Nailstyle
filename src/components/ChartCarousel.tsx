import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Slide = {
    key: string;
    title?: string;
    controls?: ReactNode;
    content: ReactNode;
};

export default function ChartCarousel({ slides, className }: { slides: Slide[]; className?: string }) {
    const [index, setIndex] = useState(0);
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const total = slides.length;

    // Smooth scroll to current slide
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        el.scrollTo({ left: Math.round(el.clientWidth * index), behavior: "smooth" });
    }, [index]);

    // Keyboard navigation (Left/Right)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") setIndex((i) => (i + 1) % total);
            if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + total) % total);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [total]);

    // Touch swipe support
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        let startX = 0;
        let dx = 0;
        const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; dx = 0; };
        const onTouchMove = (e: TouchEvent) => dx = e.touches[0].clientX - startX;
        const onTouchEnd = () => {
            if (dx < -40) setIndex((i) => (i + 1) % total);
            if (dx > 40) setIndex((i) => (i - 1 + total) % total);
        };
        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: true });
        el.addEventListener("touchend", onTouchEnd);
        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            el.removeEventListener("touchend", onTouchEnd);
        };
    }, [total]);

    // Helpers: next / prev with wrap
    const goNext = () => setIndex((i) => (i + 1) % total);
    const goPrev = () => setIndex((i) => (i - 1 + total) % total);

    return (
        <div className={`relative ${className ?? ""}`} aria-roledescription="carousel">
            {/* Left arrow */}
            <button
                aria-label="Anterior"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-md flex items-center justify-center shadow-sm transition-transform"
                style={{
                    background: "var(--accent-soft, #EEF7FF)", // soft themed background
                    border: "1px solid rgba(0,0,0,0.04)",
                    color: "var(--accent-black, #2563EB)",
                }}
            >
                <FaChevronLeft />
            </button>

            {/* Right arrow */}
            <button
                aria-label="Siguiente"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-md flex items-center justify-center shadow-sm transition-transform"
                style={{
                    background: "var(--accent-soft, #EEF7FF)",
                    border: "1px solid rgba(0,0,0,0.04)",
                    color: "var(--accent-black, #2563EB)",
                }}
            >
                <FaChevronRight />
            </button>

            {/* viewport */}
            <div
                ref={viewportRef}
                className="overflow-hidden"
                style={{ scrollBehavior: "smooth" }}
            >
                <div
                    className="flex"
                    style={{ width: `${100 * total}%`, minHeight: 1 }}
                >
                    {slides.map((s, i) => (
                        <section
                            key={s.key}
                            aria-hidden={i !== index}
                            className="flex-shrink-0 w-full p-3 box-border"
                            style={{ width: `${100 / total}%` }}
                        >
                            <div className="rounded-lg bg-[var(--card-bg,#fff)] shadow-sm h-full flex flex-col" style={{ minHeight: 1 }}>
                                <div className="px-4 py-3 border-b flex items-center justify-between">
                                    <div className="text-sm font-semibold">{s.title}</div>
                                    <div>{s.controls}</div>
                                </div>

                                <div className="p-3 overflow-auto" style={{ maxHeight: "calc(86vh - 120px)" }}>
                                    {s.content}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            {/* dots */}
            <div className="mt-3 flex justify-center gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        aria-label={`Ir a ${i + 1}`}
                        onClick={() => setIndex(i)}
                        className={`w-2 h-2 rounded-full ${i === index ? "bg-[var(--accent-blue,#2563EB)]" : "bg-gray-300"}`}
                    />
                ))}
            </div>
        </div>
    );
}