import { useEffect, useRef } from 'react';

function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  const scrollContainerRef = useRef(null);
  const selectedButtonRef = useRef(null);

  // Auto-scroll to selected category on mobile
  useEffect(() => {
    if (selectedButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = selectedButtonRef.current;
      
      // Calculate scroll position to center the selected button
      const scrollPosition = button.offsetLeft - (container.offsetWidth / 2) + (button.offsetWidth / 2);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedCategory]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Label - Hidden on mobile, visible on desktop */}
      <div className="hidden sm:flex justify-center">
        <span className="text-xs uppercase tracking-[0.2em] text-text-tertiary font-semibold">
          Filter by:
        </span>
      </div>

      {/* Scrollable container for mobile, wrapped for desktop */}
      <div className="relative">
        {/* Gradient fade effects on mobile */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 sm:hidden" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 sm:hidden" />
        
        {/* Category buttons container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-1 
                     sm:flex-wrap sm:justify-center sm:overflow-x-visible sm:pb-0"
          style={{
            // Smooth scroll momentum on iOS
            WebkitOverflowScrolling: 'touch',
            // Hide scrollbar
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                ref={isSelected ? selectedButtonRef : null}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`
                  flex-shrink-0 px-4 sm:px-5 py-2 text-sm font-semibold tracking-wide 
                  rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap
                  ${isSelected
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'bg-white text-text-secondary border-2 border-border hover:border-primary hover:text-primary hover:shadow-sm active:scale-95'
                  }
                `}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile hint text */}
      <p className="text-xs text-center text-text-tertiary sm:hidden">
        Swipe to see more categories
      </p>
    </div>
  );
}

export default CategoryFilter;
