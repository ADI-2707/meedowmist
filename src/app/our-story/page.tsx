import type { Metadata } from 'next';
import SectionReveal from '@/components/SectionReveal/SectionReveal';
import BrushDivider from '@/components/BrushDivider/BrushDivider';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Meadow Mist began as an experiment — what if everyday objects could feel as considered as something you\'d frame and hang on a wall? Read about how the brand started and how each piece is made.',
};

export default function OurStoryPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        {/* Hero */}
        <SectionReveal>
          <section className={styles.hero}>
            <p className={styles.eyebrow}>The Story Behind the Name</p>
            <h1 className={styles.title}>
              Things made by hand,<br />
              <span className={styles.script}>grown like something living.</span>
            </h1>
          </section>
        </SectionReveal>

        <BrushDivider />

        {/* Tree SVG section */}
        <SectionReveal>
          <div className={styles.treeSection}>
            <div className={styles.svgWrapper} aria-hidden="true">
              <svg className={styles.treeSvg} viewBox="0 0 200 220" fill="none">
                <path
                  className={styles.treePath}
                  d="M100 200 L100 120 M100 120 C100 120 70 100 60 75 C50 50 65 38 80 50 C72 36 90 28 98 48 C95 32 108 26 114 44 C122 30 138 38 138 62 C138 88 100 120 100 120Z"
                  stroke="var(--color-gold)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M100 120 C100 120 78 108 68 88 M100 120 C100 120 122 108 132 90"
                  stroke="var(--color-gold)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.5"
                  className={styles.treePath}
                />
                <ellipse cx="100" cy="205" rx="24" ry="4" fill="var(--color-gold)" opacity="0.15"/>
              </svg>
            </div>
            <blockquote className={styles.pullQuote}>
              <p className={styles.pullQuoteText}>
                &ldquo;The logo is a tree — branches holding a candle flame, a pottery wheel,
                a spinning wheel, and yarn. Literally: things made by hand, grown like something living.
                That&apos;s not a tagline. That&apos;s the brief.&rdquo;
              </p>
            </blockquote>
          </div>
        </SectionReveal>

        <BrushDivider />

        {/* Story sections */}
        {[
          {
            label: 'How it started',
            heading: 'An experiment in attention.',
            body: `Meadow Mist started in a small flat with a kitchen scale, a thermometer, and the
              question: what if a candle felt as deliberate as a piece of jewellery? Not expensive —
              deliberate. The kind of thing you pick up, turn over, notice the texture of.
              The first batch was eight candles. They sold out in a weekend. The second batch was eight candles.
              We've kept it that way.`,
          },
          {
            label: 'The candles',
            heading: 'Poured in eights.',
            body: `Every candle is hand-poured in runs of eight or fewer — small enough that a single person
              can watch every pour, adjust the temperature, check the set. The soy wax is clean-burning.
              The cotton wicks are self-trimming. The botanicals — wax flowers, embedded petals,
              sculpted reliefs — are made separately and placed by hand while the wax is still warm.
              Burn time is honest: we test every mould before we sell it.`,
          },
          {
            label: 'The ceramics',
            heading: 'One pair of hands.',
            body: `The ceramics are thrown on a wheel, trimmed, and glazed by one person.
              The lotus petal rim is hand-crimped before the clay stiffens — that's why every bowl
              is slightly different. The glaze bleed on the blush bowls is pigment meeting a wet surface:
              controlled loosely, never exactly. The black lotus holder's gold edging is painted petal
              by petal with a fine brush. That's not a process you can photograph meaningfully —
              you feel it when you pick the piece up.`,
          },
        ].map((section, i) => (
          <SectionReveal key={section.label} delay={i * 0.1}>
            <article className={styles.storySection}>
              <p className={styles.sectionEyebrow}>{section.label}</p>
              <h2 className={styles.sectionHeading}>{section.heading}</h2>
              <p className={styles.sectionBody}>{section.body}</p>
            </article>
          </SectionReveal>
        ))}
      </div>
    </div>
  );
}
