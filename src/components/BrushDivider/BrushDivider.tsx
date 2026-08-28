import styles from './BrushDivider.module.css';

interface Props {
  className?: string;
}

export default function BrushDivider({ className }: Props) {
  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox="0 0 400 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Main brushstroke — thickens toward center, tapers at ends */}
        <path
          d="M0 6 C40 5.5 80 3 120 3.5 C160 4 180 1 200 1 C220 1 240 4 280 3.5 C320 3 360 5.5 400 6"
          stroke="var(--color-gold)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M60 6 C100 5 140 3 180 2.5 C200 2.2 220 2.5 260 3 C300 5 340 6 360 6"
          stroke="var(--color-gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
          fill="none"
        />
        {/* Thicker middle swell */}
        <path
          d="M140 6 C160 4.5 180 2 200 1.5 C220 2 240 4.5 260 6"
          stroke="var(--color-gold)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.4"
          fill="none"
        />
      </svg>
    </div>
  );
}
