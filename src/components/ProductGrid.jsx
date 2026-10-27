import ProductCard from './product_card/ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import EmptyState from './EmptyState';

function ProductGrid({ products, loading, onResetFilters }) {
  const gridClasses = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-4 md:gap-5 lg:gap-6";

  if (loading) {
    return (
      <div className={gridClasses}>
        {[...Array(10)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No books found"
        description="We couldn't find any books matching your search. Try adjusting your filters or search terms."
        actionLabel="Reset all filters"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className={gridClasses}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
