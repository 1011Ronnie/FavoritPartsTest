import { ManufacturerButton } from '@/features/parts/ui/atoms/ManufacturerButton';

export function ManufacturersList({ brands, selectedBrand, onBrandSelect }) {
  return (
    <div
      role="group"
      aria-label="Производители"
      className="d-flex flex-wrap gap-2"
    >
      {brands.map((brand) => (
        <ManufacturerButton
          key={brand}
          brand={brand}
          isSelected={selectedBrand === brand}
          onBrandSelect={onBrandSelect}
        />
      ))}
    </div>
  );
}
