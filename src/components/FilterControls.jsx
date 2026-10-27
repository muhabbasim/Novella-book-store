import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';

function FilterControls({ 
  products, 
  searchValue, 
  onSearchChange, 
  categories, 
  selectedCategory, 
  onCategoryChange,
  resultCount,
  loading,
  onClearFilters
}) {
  const hasActiveFilters = searchValue || selectedCategory !== 'All';

  return (
    <div className="mb-8 sm:mb-12 md:mb-16">
      {/* Search Bar - Prominent & Refined */}
      <div className="mb-6 sm:mb-8">
        <div className="max-w-3xl mx-auto">
          <SearchBar 
            products={products} 
            onSearch={onSearchChange}
            searchValue={searchValue}
          />
        </div>
      </div>

      {/* Category Filters - Clean & Minimal */}
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onCategoryChange}
      />

      {/* Results count - Refined */}
      {!loading && hasActiveFilters && (
        <div className="flex items-center gap-4 text-sm justify-center mt-4 sm:mt-6">
          <p className="text-text-tertiary font-medium">
            {resultCount} {resultCount === 1 ? 'book' : 'books'} found
          </p>
          <span className="text-border">•</span>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-primary font-semibold hover:text-primary-dark transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

export default FilterControls;
