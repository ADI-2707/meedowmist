'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SectionReveal from '@/components/SectionReveal/SectionReveal';
import styles from './page.module.css';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful, isSubmitting },
    reset,
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactForm) => {
    await new Promise((r) => setTimeout(r, 1000));
    console.log('Contact form:', data);
    reset();
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <SectionReveal>
          <div className={styles.header}>
            <p className={styles.eyebrow}>Get in Touch</p>
            <h1 className={styles.title}>Contact Us</h1>
            <p className={styles.subtitle}>
              Questions about an order, wholesale inquiries, or just want to say hello —
              we read every message and reply within 2 business days.
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.15}>
          <div className={styles.formWrapper}>
            {isSubmitSuccessful ? (
              <div className={styles.success}>
                <p className={styles.successEmoji}>✦</p>
                <h2 className={styles.successTitle}>Message sent.</h2>
                <p className={styles.successBody}>We&apos;ll be in touch within 2 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
                <div className={styles.field}>
                  <label htmlFor="contact-name" className={styles.label}>Name</label>
                  <input id="contact-name" type="text" className={`${styles.input} ${errors.name ? styles.inputError : ''}`} placeholder="Your name" {...register('name')} />
                  {errors.name && <p className={styles.error} role="alert">{errors.name.message}</p>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="contact-email" className={styles.label}>Email</label>
                  <input id="contact-email" type="email" className={`${styles.input} ${errors.email ? styles.inputError : ''}`} placeholder="your@email.com" {...register('email')} />
                  {errors.email && <p className={styles.error} role="alert">{errors.email.message}</p>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="contact-message" className={styles.label}>Message</label>
                  <textarea id="contact-message" className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`} placeholder="Tell us what's on your mind…" rows={6} {...register('message')} />
                  {errors.message && <p className={styles.error} role="alert">{errors.message.message}</p>}
                </div>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </SectionReveal>
      </div>
    </div>
  );
}
