import { Button } from '@/shared/ui/atoms/Button';

export function ManufacturerButton({ brand, isSelected, onBrandSelect }) {
  return (
    <Button
      variant={isSelected ? 'primary' : 'outline-primary'}
      aria-pressed={isSelected}
      onClick={() => onBrandSelect(brand)}
    >
      {brand}
    </Button>
  );
}
