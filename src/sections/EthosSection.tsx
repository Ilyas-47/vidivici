import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function EthosSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || !image) return;

    gsap.fromTo(
      image,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: 'center center',
          scrub: 0.5,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="ethos"
      className="bg-white py-20 lg:py-32 px-6 lg:px-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-[1600px] mx-auto">
        {/* Image - 60% */}
        <div className="lg:col-span-7">
          <div
            ref={imageRef}
            className="w-full aspect-[4/3] overflow-hidden"
            style={{ clipPath: 'inset(100% 0 0 0)' }}
          >
            <img
              src="/images/material-texture-1.jpg"
              alt="Technical fabric texture detail"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content - 40% */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <h2 className="text-4xl lg:text-5xl xl:text-[64px] font-normal tracking-[-2px] leading-[1.0] mb-8">
            Engineered
            <br />
            for Motion.
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-[#666666]">
            <p>
              At Summer Shop, every garment begins with a question: how does the human
              body move? Our design process is rooted in the study of biomechanics and
              architectural pattern making.
            </p>
            <p>
              We source only the most advanced technical fabrics — from waterproof
              membranes to temperature-regulating merino blends — each selected for its
              specific performance characteristics and environmental responsibility.
            </p>
            <p>
              Every seam, every pocket placement, every hardware choice is deliberate.
              We eliminate the unnecessary so that what remains is essential, precise,
              and enduring.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
