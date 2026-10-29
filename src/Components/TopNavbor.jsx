import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabas.js'; // apna sahi path

const ACTIVE_OFFSET = 120; // navbar ke neeche wo line jahan section check hota hai

const TopNavbor = () => {
  const navRef = useRef(null);      // categories scroll ke liye
  const wrapperRef = useRef(null);  // sticky detect karne ke liye
  const itemRefs = useRef({});      // har category pill ka ref
  const [stuck, setStuck] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [categories, setCategories] = useState([]);

  // Categories Supabase se ("popular" navbar mein nahi dikhegi)
  useEffect(() => {
    supabase
      .from('categories')
      .select('slug, name')
      .eq('is_active', true)
      .neq('slug', 'popular')
      .order('id')
      .then(({ data, error }) => {
        if (error) return console.error(error.message);
        setCategories(data.map((c) => ({ id: c.slug, title: c.name })));
      });
  }, []);

  // Sticky + active category detect
  useEffect(() => {
    const onScroll = () => {
      if (!wrapperRef.current) return;

      const isStuck = wrapperRef.current.getBoundingClientRect().top <= 0;
      setStuck(isStuck);

      // Navbar chipka nahi hai to koi category active nahi
      if (!isStuck) {
        setActiveId(null);
        return;
      }

      // Jis section ke andar ACTIVE_OFFSET wali line hai wahi active
      let current = null;
      for (const c of categories) {
        const el = document.getElementById(c.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= ACTIVE_OFFSET && rect.bottom > ACTIVE_OFFSET) {
          current = c.id;
          break;
        }
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [categories]);

  // Active pill ko navbar ke andar visible rakho (sirf navbar scroll hota hai, page nahi)
  useEffect(() => {
    if (!activeId || !navRef.current) return;
    const pill = itemRefs.current[activeId];
    if (!pill) return;

    const box = navRef.current;
    const left = pill.offsetLeft - box.clientWidth / 2 + pill.clientWidth / 2;
    box.scrollTo({ left, behavior: 'smooth' });
  }, [activeId]);

  const scrollNav = (direction) => {
    navRef.current?.scrollBy({
      left: direction * 200,
      behavior: 'smooth',
    });
  };

  const scrollToCategory = (categoryId) => {
    document.getElementById(categoryId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const arrowStyle = stuck
    ? 'text-[var(--color-primary-600)] hover:bg-[var(--color-primary-600)] hover:text-white'
    : 'text-white hover:bg-white hover:text-black';

  const itemStyle = stuck
    ? 'text-slate-800 hover:bg-[var(--color-primary-600)] hover:text-white'
    : 'text-white shadow-2xl hover:bg-white hover:text-black';

  return (
    <div ref={wrapperRef} className="sticky top-0 left-0 w-full z-50">
      <div
        style={{ background: stuck ? '#ffffff' : 'var(--gradient-primary)' }}
        className={`flex items-center gap-2 px-2 sm:px-3 py-2 transition-colors duration-300 ${
          stuck ? 'shadow-md border-b border-gray-200' : ''
        }`}
      >
        {/* Previous Arrow */}
        <button
          onClick={() => scrollNav(-1)}
          aria-label="Scroll categories left"
          className={`shrink-0 rounded-full p-2 transition-colors ${arrowStyle}`}
        >
          <ChevronLeft size={22} />
        </button>

        {/* Categories */}
        <div
          ref={navRef}
          className="relative flex flex-1 min-w-0 flex-nowrap gap-3 overflow-x-auto whitespace-nowrap py-1 scrollbar-hide"
        >
          {categories.map((category) => {
            const isActive = activeId === category.id;

            return (
              <p
                key={category.id}
                ref={(el) => (itemRefs.current[category.id] = el)}
                onClick={() => scrollToCategory(category.id)}
                style={isActive ? { background: 'var(--gradient-primary)' } : undefined}
                className={`shrink-0 cursor-pointer rounded-full px-4 py-3 text-sm lg:text-base font-bold transition-all duration-300 ${
                  isActive ? 'text-white shadow-md' : itemStyle
                }`}
              >
                {category.title}
              </p>
            );
          })}
        </div>

        {/* Next Arrow */}
        <button
          onClick={() => scrollNav(1)}
          aria-label="Scroll categories right"
          className={`shrink-0 rounded-full p-2 transition-colors ${arrowStyle}`}
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default TopNavbor;