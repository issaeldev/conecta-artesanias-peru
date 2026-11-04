interface QuantityStepperProps {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseLabel?: string;
  increaseLabel?: string;
}

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  decreaseLabel = "-",
  increaseLabel = "+",
}: QuantityStepperProps) {
  return (
    <span className="qty">
      <button type="button" onClick={onDecrease} aria-label={decreaseLabel}>
        −
      </button>
      <b aria-live="polite">{value}</b>
      <button type="button" onClick={onIncrease} aria-label={increaseLabel}>
        +
      </button>
    </span>
  );
}
