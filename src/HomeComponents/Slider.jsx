import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import slider from "../Arrays/slider.js";

const AUTOPLAY_DELAY = 5000;

const arrowBtn =
  "absolute top-1/2 -translate-y-1/2 z-20 grid place-items-center size-9 sm:size-12 rounded-full bg-white/85 text-neutral-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const Slider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slider.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slider.length) % slider.length);
  }, []);

  useEffect(() => {
    if (slider.length < 2) return;

    const interval = setInterval(nextSlide, AUTOPLAY_DELAY);

    return () => clearInterval(interval);
  }, [nextSlide]);

  if (!slider.length) return null;

  return (
    <section className="w-full flex justify-center pt-4 sm:pt-8 lg:pb-10 pb-7">
      {/* grid: saari slides ek hi cell mein stack hoti hain, height image se aati hai */}
      <div className="relative grid w-[96%] overflow-hidden rounded-xl sm:rounded-2xl bg-neutral-900">
        {slider.map((item, index) => (
          <div
            key={item.id}
            className={`col-start-1 row-start-1 transition-opacity duration-700 ease-in-out ${
              activeIndex === index
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
            aria-hidden={activeIndex !== index}
          >
            <img
              src={item.image}
              alt={item.title || `Coffee banner ${index + 1}`}
              /* mobile/tablet: natural ratio (zero crop) | laptop: 400px + cover */
              className="block w-full h-auto lg:h-[400px] lg:object-cover object-center"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
            />
          </div>
        ))}

        {slider.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className={`${arrowBtn} left-2 sm:left-4`}
            >
              <ChevronLeft className="size-5 sm:size-6" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className={`${arrowBtn} right-2 sm:right-4`}
            >
              <ChevronRight className="size-5 sm:size-6" />
            </button>

            <div className="absolute bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
              {slider.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? "w-6 sm:w-10 bg-white"
                      : "w-2 sm:w-2.5 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Slider;