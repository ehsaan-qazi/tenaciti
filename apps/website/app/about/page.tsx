import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHeader } from '../../components/ui/PageHeader';
import { CtaPanel } from '../../components/ui/CtaPanel';
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER } from '../../lib/metadata';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Tenaciti was built by a student who was tired of losing track of syllabi and deadlines. Here\'s the story, and where the product is headed.',
  alternates: {
    canonical: 'https://www.tenaciti.app/about',
  },
  openGraph: {
    title: 'About Us | Tenaciti',
    description:
      'Tenaciti was built by a student who was tired of losing track of syllabi and deadlines. Here\'s the story, and where the product is headed.',
    url: 'https://www.tenaciti.app/about',
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    ...DEFAULT_TWITTER,
    title: 'About Us | Tenaciti',
    description:
      'Tenaciti was built by a student who was tired of losing track of syllabi and deadlines. Here\'s the story, and where the product is headed.',
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title="Built by a student, for students"
        sub="Tenaciti started with a simple frustration: managing university coursework is often harder than the coursework itself."
      />

      <div className={styles.wrap}>
        <section aria-label="Our story">
          <p className={styles.prose}>
            Between scattered syllabi, multiple learning management systems, and a constant fear of
            missing deadlines, students spend too much time organizing and too little time learning.
            Tenaciti was built out of that frustration to turn the pile of PDFs, spreadsheets, and
            reminders into one workspace that actually understands your courses.
          </p>
        </section>

        <section className={styles.mission} aria-label="Our mission">
          <div className={styles.missionSquares} aria-hidden="true">
            <span className={`${styles.missionSq} ${styles.missionSq1}`} />
            <span className={`${styles.missionSq} ${styles.missionSq2}`} />
          </div>
          <span className={styles.missionEyebrow}>Our Mission</span>
          <h2 className={styles.missionTitle}>
            Give every student an unfair advantage without doing the work for them.
          </h2>
          <p className={styles.missionText}>
            We believe AI shouldn&apos;t just write essays for you; it should help you learn
            better, manage your time more effectively, and reduce academic anxiety. Tenaciti
            organizes the logistics of your semester so your energy goes into actually
            understanding the material.
          </p>
        </section>

        <section aria-label="The team">
          <h2 className={styles.teamHeader}>The Team</h2>
          <div className={styles.teamCard}>
            <div className={styles.teamPhoto}>
              <Image
                src="/images/team/ehsaan.png"
                alt="Ehsaan Qazi, Founder of Tenaciti"
                width={140}
                height={140}
                className={styles.avatarImg}
                priority
              />
            </div>
            <div className={styles.teamContent}>
              <div className={styles.teamMeta}>
                <h3 className={styles.founderName}>Mohammad Ehsaan ur Rehman Qazi</h3>
                <span className={styles.founderRole}>Founder &amp; Lead Engineer</span>
              </div>
              <p className={styles.teamText}>
                <strong>Founded by a recent computer science graduate</strong> who experienced these
                problems firsthand, Tenaciti is built by students, for students. We are constantly
                iterating based on feedback from our community to build the ultimate academic
                productivity tool.
              </p>
            </div>
          </div>
        </section>
      </div>

      <CtaPanel
        title="Be part of the story."
        sub="Start free, tell us what works and what doesn't. Tenaciti improves with every student who uses it."
        primary={{ label: 'Get Started Free', href: 'https://my.tenaciti.app/signup', external: true }}
        secondary={{ label: 'Get in Touch', href: '/contact' }}
      />
    </>
  );
}
