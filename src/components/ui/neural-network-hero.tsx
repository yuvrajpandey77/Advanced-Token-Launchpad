
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

// ===================== SIMPLE GRADIENT BACKGROUND =====================
export function ShaderBackground({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  const bgRef = useRef<HTMLDivElement | null>(null);
  
  const initialOpacity = style?.opacity ?? 1;
  
  useGSAP(
    () => {
      if (!bgRef.current) return;
      
      // Subtle fade-in animation
      gsap.from(bgRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    },
    { scope: bgRef }
  );
  
  return (
    <div 
      ref={bgRef}
      className={`absolute inset-0 w-full h-full ${className}`} 
      aria-hidden 
      style={{ 
        width: '100%', 
        height: '100%', 
        zIndex: 0, 
        opacity: initialOpacity,
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), transparent 60%), linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
        ...style 
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
    </div>
  );
}

// ===================== HERO =====================
interface HeroProps {
  title: string;
  description: string;
  badgeText?: string;
  badgeLabel?: string;
  ctaButtons?: Array<{ text: string; href: string; primary?: boolean }>;
  microDetails?: Array<string>;
}

export default function Hero({
  title,
  description,
  badgeText = "Generative Surfaces",
  badgeLabel = "New",
  ctaButtons = [
    { text: "Get started", href: "#get-started", primary: true },
    { text: "View showcase", href: "#showcase" }
  ],
  microDetails = ["Low‑weight font", "Tight tracking", "Subtle motion"]
}: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const paraRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const microRef = useRef<HTMLUListElement | null>(null);
  const microItem1Ref = useRef<HTMLLIElement | null>(null);
  const microItem2Ref = useRef<HTMLLIElement | null>(null);
  const microItem3Ref = useRef<HTMLLIElement | null>(null);

  useGSAP(
    () => {
      // Simple, lightweight fade-in animations
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
      });

      if (badgeRef.current) {
        tl.from(badgeRef.current, { opacity: 0, y: 10, duration: 0.6 }, 0);
      }
      
      if (headerRef.current) {
        tl.from(headerRef.current, { opacity: 0, y: 20, duration: 0.8 }, 0.1);
      }

      if (paraRef.current) {
        tl.from(paraRef.current, { opacity: 0, y: 15, duration: 0.6 }, 0.3);
      }
      
      if (ctaRef.current) {
        tl.from(ctaRef.current, { opacity: 0, y: 15, duration: 0.6 }, 0.4);
      }
      
      const microItems = [microItem1Ref.current, microItem2Ref.current, microItem3Ref.current].filter(Boolean);
      if (microItems.length > 0) {
        tl.from(microItems, { opacity: 0, y: 10, duration: 0.5, stagger: 0.1 }, 0.5);
      }
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative h-screen w-screen overflow-hidden">
      <ShaderBackground className="" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 pb-24 pt-36 sm:gap-8 sm:pt-44 md:px-10 lg:px-16" style={{ zIndex: 10 }}>
        <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] font-light uppercase tracking-[0.08em] text-white/70">{badgeLabel}</span>
          <span className="h-1 w-1 rounded-full bg-white/40" />
          <span className="text-xs font-light tracking-tight text-white/80">{badgeText}</span>
        </div>

        <h1 ref={headerRef} className="max-w-2xl text-left text-5xl font-extralight leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
          {title}
        </h1>

        <p ref={paraRef} className="max-w-xl text-left text-base font-light leading-relaxed tracking-tight text-white/75 sm:text-lg">
          {description}
        </p>

        <div ref={ctaRef} className="flex flex-wrap items-center gap-3 pt-2">
          {ctaButtons.map((button, index) => (
            <a
              key={index}
              href={button.href}
              className={`rounded-2xl border border-white/10 px-5 py-3 text-sm font-light tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 duration-300 ${
                button.primary
                  ? "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                  : "text-white/80 hover:bg-white/5"
              }`}
            >
              {button.text}
            </a>
          ))}
        </div>

        <ul ref={microRef} className="mt-8 flex flex-wrap gap-6 text-xs font-extralight tracking-tight text-white/60">
          {microDetails.map((detail, index) => {
            const refMap = [microItem1Ref, microItem2Ref, microItem3Ref];
            return (
              <li key={index} ref={refMap[index]} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-white/40" /> {detail}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
    </section>
  );
}
