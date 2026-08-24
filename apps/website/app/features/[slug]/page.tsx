import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

interface FeatureData {
  title: string;
  description: string;
  h1: string;
  intro: string;
  howItWorks: Array<{ step: string; detail: string }>;
  useCases: string[];
  capabilities?: Array<{ category: string; items: string[] }>;
  examplePrompts?: string[];
  miniFaq?: Array<{ question: string; answer: string }>;
  ctaText: string;
  secondaryCta?: { text: string; href: string };
}

const FEATURES: Record<string, FeatureData> = {
  'ai-roadmap': {
    title: 'AI Syllabus & Roadmap Extraction',
    description:
      'Upload a PDF syllabus and Tenaciti extracts every assignment, quiz, exam, and deadline into a confirmable semester roadmap in seconds.',
    h1: 'AI Syllabus & Roadmap Extraction',
    intro:
      'Every syllabus buries the same information in a different format: deadlines in one paragraph, grade weights in a table three pages later, exam dates in a footnote. Tenaciti reads it once and turns it into a structured, chronological roadmap you can act on immediately.',
    howItWorks: [
      {
        step: 'Upload your PDF syllabus',
        detail:
          'Files are stored securely and deduplicated automatically, so re-uploading the same file twice never creates duplicate records.',
      },
      {
        step: 'AI extraction runs in the background',
        detail:
          'Tenaciti analyzes the document and identifies every assessment — assignments, quizzes, exams, projects, and labs — along with deadlines and grade weights.',
      },
      {
        step: 'Nothing gets silently guessed',
        detail:
          'If a deadline or weight is missing from the syllabus, that item is flagged as a placeholder rather than inventing a date — you stay in control.',
      },
      {
        step: 'Confirm and adjust your roadmap',
        detail:
          'Review extracted items, make any quick adjustments, and confirm. Your entire semester timeline is now synced and editable at any time.',
      },
    ],
    useCases: [
      'Turning a 12-page syllabus PDF into a one-glance semester timeline before the first week of classes ends',
      'Catching every hidden deadline (participation marks, surprise quizzes, lab submissions) that is easily overlooked',
      'Building a single source of truth for grade weights so GPA target forecasting is based on real course criteria',
    ],
    ctaText: 'Try AI Roadmap Extraction Free',
  },
  'knowledge-graph': {
    title: 'Knowledge Graph for Student Notes',
    description:
      'Link notes with wikilinks and watch Tenaciti build a live, force-directed knowledge graph of your courses — Obsidian-style, built for a semester.',
    h1: 'A Knowledge Graph Built for Your Semester',
    intro:
      'Most note apps store isolated pages. Tenaciti stores connections. Write in Markdown, link related ideas with [[wikilinks]], and watch Tenaciti maintain a live interactive map of how your courses, lectures, and concepts connect.',
    howItWorks: [
      {
        step: 'Write in clean Markdown',
        detail:
          'A rich markdown editor with full formatting and [[wikilinks]] — type [[Concept Title]] and Tenaciti auto-links or creates the note instantly.',
      },
      {
        step: 'Automatic bi-directional backlinks',
        detail:
          'Every note displays a context panel showing everything that links to it — no manual tagging or folder organizing required.',
      },
      {
        step: 'Explore the live graph view',
        detail:
          'A force-directed, Obsidian-style graph sizes each node by its connectivity, color-codes notes by course, and highlights neighboring connections on hover.',
      },
      {
        step: 'Filter across courses and semesters',
        detail:
          'Easily isolate a single course or view cross-disciplinary links as your knowledge base expands throughout your degree.',
      },
    ],
    useCases: [
      'Connecting a foundational concept from Week 2 to advanced applications in Week 10 without searching manually',
      'Spotting central core themes (high connection nodes) versus isolated lecture details before exams',
      'Building an interconnected review map for finals that reflects how concepts actually relate in memory',
    ],
    ctaText: 'Start Mapping Your Notes Free',
  },
  'topic-tracking': {
    title: 'Topic Tracking & Confidence Ratings',
    description:
      'Break each course into topics, rate your confidence 1–5 as you complete them, and see exactly where your weak spots are before the exam.',
    h1: 'Know What You Actually Understand',
    intro:
      '"I finished reading the chapter" and "I can score an A on this chapter in an exam" are very different. Topic tracking helps you evaluate your actual understanding in the moment so knowledge gaps appear before exam day.',
    howItWorks: [
      {
        step: 'Extract or add course topics',
        detail:
          'Topics can be extracted directly from your course slides and instructor notes, or added manually for each subject.',
      },
      {
        step: 'Organize and reorder inline',
        detail:
          'Use intuitive drag-and-drop to align topics with the actual sequence of your lectures and study modules.',
      },
      {
        step: 'Rate confidence from 1 to 5',
        detail:
          'Whenever you complete a topic, record an honest 1–5 confidence score with a confirm step to ensure deliberate self-reflection.',
      },
      {
        step: 'Merge duplicates and link to deadlines',
        detail:
          'Consolidate related subtopics across lectures without losing progress, and link topics directly to upcoming roadmap assessments.',
      },
    ],
    useCases: [
      'Generating a prioritized "study first" review list from your lowest-confidence topics before midterms',
      'Tracking calibration over time to understand whether you tend to over- or under-estimate your exam readiness',
      'Organizing scattered slide decks and lecture notes into a single structured checklist per subject',
    ],
    ctaText: 'Track Your First Course Free',
  },
  'gpa-calculator': {
    title: 'GPA Calculator & Goal Tracking',
    description:
      'Calculate SGPA and CGPA on the HEC 4.0 scale or your own custom scale, set a target GPA, and track your progress course by course.',
    h1: 'GPA Calculator & Goal Tracking',
    intro:
      'Calculate your GPA in seconds with our free online calculator — no account required. When you connect it with your Tenaciti account, it becomes a dynamic academic forecasting tool tied directly to your coursework and semester goals.',
    howItWorks: [
      {
        step: 'Calculate SGPA and CGPA with precision',
        detail:
          'Default support for Pakistan\'s official Higher Education Commission (HEC) 4.0 scale, plus full support for custom grade points and thresholds.',
      },
      {
        step: 'Set target semester GPA goals',
        detail:
          'Define minimum GPA targets required for scholarship maintenance, academic honors, or personal milestones.',
      },
      {
        step: 'Simulate grades and forecast outcomes',
        detail:
          'Run "what-if" grade simulations across remaining assignments to see exactly what scores you need to achieve your target GPA.',
      },
    ],
    useCases: [
      'Instantly calculating SGPA and cumulative CGPA without managing complex spreadsheet formulas',
      'Tracking exact grade requirements needed to maintain scholarship thresholds all semester',
      'Simulating finals grade scenarios in advance to optimize study time allocation across courses',
    ],
    ctaText: 'Track Goals With a Free Account',
    secondaryCta: {
      text: 'Open Free Interactive Calculator →',
      href: '/tools/gpa-calculator',
    },
  },
  'self-assessment': {
    title: 'Self-Assessment & Gap Analytics',
    description:
      'Log how each assignment or exam actually went, and see the gap between how confident you felt going in and how prepared you actually were.',
    h1: 'Close the Gap Between "I Studied" and "I Was Ready"',
    intro:
      'Confidence and exam readiness are not always aligned. Tenaciti\'s self-assessment loop prompts you to log how an assessment went immediately after submission — turning honest reflections into actionable insights across your semester.',
    howItWorks: [
      {
        step: 'Mark assessment complete',
        detail:
          'Submit an assignment, quiz, or exam roadmap item as completed in your workspace.',
      },
      {
        step: 'Log quick post-exam metrics',
        detail:
          'Rate output quality (1–5), mental mood (1–5), and record actual hours invested while the experience is fresh.',
      },
      {
        step: 'Capture quick qualitative reflections',
        detail:
          'Jot down brief notes on what went well, what caught you off guard, and what to adjust next time.',
      },
      {
        step: 'Analyze your calibration gaps',
        detail:
          'Tenaciti compares initial confidence ratings with post-submission outcomes to reveal time-estimation accuracy and study patterns.',
      },
    ],
    useCases: [
      'Discovering whether you consistently overestimate readiness for specific technical or quantitative subjects',
      'Seeing when actual study hours diverge from original estimates, enabling more realistic exam preparation schedules',
      'Building an honest retrospective record of what study strategies delivered the highest grades',
    ],
    ctaText: 'Start Your Self-Assessment Loop Free',
  },
  'ai-assistant': {
    title: 'AI Assistant — Manage Your Workspace by Prompt',
    description:
      'Ask Tenaciti\'s AI Assistant what to study next, have it update goals or complete topics, or build a study plan — all in plain language.',
    h1: 'AI Assistant — Manage Your Whole Workspace With a Prompt',
    intro:
      'Most "AI assistants" are chatbots detached from your actual work. Tenaciti\'s AI Assistant is different: it is a conversational command center for your entire workspace. It understands your courses, topics, progress, goals, deadlines, notes, assessments, and uploaded materials — and instead of just answering generic questions, it takes direct action on your behalf.',
    capabilities: [
      {
        category: 'Understand & Ground',
        items: [
          'Answers questions grounded in your actual course material, slides, and syllabus data',
          'Explains how specific roadmap milestones, notes, and topics connect across your semester',
          'Summarizes your real-time academic progress across individual subjects or your entire degree',
        ],
      },
      {
        category: 'Recommend & Analyze',
        items: [
          'Recommends optimal study sequences based on your lowest topic confidence ratings and upcoming deadlines',
          'Performs workspace-wide semantic search across notes, syllabi, and lecture slides in plain English',
          'Proactively surfaces academic risks: pending deadlines, low confidence topics, and courses drifting from your GPA target',
        ],
      },
      {
        category: 'Execute Workspace Actions',
        items: [
          'Creates and links notes: "Create a summary note on Bayes Theorem and link it to CS 301 roadmap"',
          'Updates academic goals: "Adjust my semester target GPA to 3.8 and recalculate needed grades"',
          'Completes and rates topics: "Mark Chapter 4 Thermodynamics done with a confidence rating of 4"',
          'Constructs study plans: "Build a structured two-week preparation schedule for my Organic Chemistry final"',
        ],
      },
    ],
    howItWorks: [
      {
        step: 'Prompt in natural conversational language',
        detail:
          'No complex syntax or commands to memorize — ask questions and request actions just like talking to a study partner.',
      },
      {
        step: 'Assistant accesses your secure workspace context',
        detail:
          'The AI grounds its reasoning directly in your courses, topics, notes, goals, and uploaded slides.',
      },
      {
        step: 'Instant answers or automated execution',
        detail:
          'Informational prompts receive direct answers. Action requests execute changes immediately in your workspace.',
      },
      {
        step: 'Full transparency and user control',
        detail:
          'All created notes, updated goals, and completed topics appear immediately across your views, exactly as if done manually.',
      },
    ],
    examplePrompts: [
      'What should I prioritize studying tonight based on my upcoming deadlines and confidence scores?',
      'Create a note on Binary Search Trees, link it to Data Structures [[Trees]], and set up 3 revision questions.',
      'Mark Lecture 8 as completed with 3/5 confidence and schedule a review session for Thursday.',
      'Generate a 10-day countdown study schedule for my Calculus II midterm prioritizing weak topics.',
    ],
    miniFaq: [
      {
        question: 'Does the AI Assistant only answer questions, or can it modify my workspace?',
        answer:
          'Both. It provides answers grounded in your course materials and can take direct actions like creating notes, updating GPA goals, marking topics completed, and scheduling study plans.',
      },
      {
        question: 'Does it use data from outside my Tenaciti workspace?',
        answer:
          'No. The AI Assistant is private and grounded exclusively in your own courses, uploaded syllabi, slides, notes, and academic targets.',
      },
    ],
    useCases: [
      'Opening Tenaciti before exam week and getting an instant, personalized breakdown of what topics need the most attention',
      'Transforming messy study thoughts into organized, wikilinked markdown notes without tedious manual formatting',
      'Generating realistic study schedules tailored to your actual course syllabi and personal confidence gaps',
    ],
    ctaText: 'Experience the AI Assistant Free',
  },
};

const BASE_URL = 'https://www.tenaciti.app';

export function generateStaticParams() {
  return Object.keys(FEATURES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const feature = FEATURES[slug];
  if (!feature) return {};

  return {
    title: feature.title,
    description: feature.description,
    alternates: {
      canonical: `${BASE_URL}/features/${slug}`,
    },
    openGraph: {
      title: `${feature.title} | Tenaciti`,
      description: feature.description,
      url: `${BASE_URL}/features/${slug}`,
    },
    twitter: {
      title: `${feature.title} | Tenaciti`,
      description: feature.description,
    },
  };
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const feature = FEATURES[slug];

  if (!feature) notFound();

  // HowTo JSON-LD schema for search engines
  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${feature.title} in Tenaciti`,
    description: feature.description,
    step: feature.howItWorks.map((item, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: item.step,
      itemListElement: [
        {
          '@type': 'HowToDirection',
          text: item.detail,
        },
      ],
    })),
  };

  // Breadcrumb schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Features',
        item: `${BASE_URL}/features`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: feature.title,
        item: `${BASE_URL}/features/${slug}`,
      },
    ],
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--on-surface-variant, #666)' }}>
          <Link href="/" style={{ color: 'var(--on-surface-variant, #666)' }}>Home</Link>
          <span>/</span>
          <Link href="/features" style={{ color: 'var(--on-surface-variant, #666)' }}>Features</Link>
          <span>/</span>
          <span style={{ color: 'var(--ink, #0d0d0d)', fontWeight: 600 }}>{feature.title}</span>
        </div>
      </nav>

      {/* Header */}
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', color: 'var(--ink, #0d0d0d)', letterSpacing: '-0.02em' }}>
          {feature.h1}
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant, #555)', lineHeight: 1.7 }}>
          {feature.intro}
        </p>
      </header>

      {/* Secondary Action if available */}
      {feature.secondaryCta && (
        <div style={{ marginBottom: '3rem', padding: '1.25rem 1.5rem', background: 'var(--surface-sunken, #f8f9fa)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--surface-border, #eee)' }}>
          <span style={{ fontWeight: 600, color: 'var(--ink, #0d0d0d)' }}>Need a quick GPA calculation without an account?</span>
          <Link href={feature.secondaryCta.href} style={{ color: 'var(--primary, #007bff)', fontWeight: 700 }}>
            {feature.secondaryCta.text}
          </Link>
        </div>
      )}

      {/* Capabilities breakdown for AI Assistant */}
      {feature.capabilities && (
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--ink, #0d0d0d)' }}>
            What the AI Assistant Can Do
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {feature.capabilities.map((cat, idx) => (
              <div key={idx} style={{ background: 'var(--surface-sunken, #f8f9fa)', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--surface-border, #eee)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--ink, #0d0d0d)' }}>
                  {cat.category}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cat.items.map((item, iIdx) => (
                    <li key={iIdx} style={{ fontSize: '0.95rem', color: 'var(--on-surface-variant, #555)', lineHeight: 1.5, display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--primary, #007bff)', fontWeight: 'bold' }}>✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Example Prompts for AI Assistant */}
      {feature.examplePrompts && (
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--ink, #0d0d0d)' }}>
            Example Prompts You Can Use
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {feature.examplePrompts.map((prompt, pIdx) => (
              <div key={pIdx} style={{ padding: '1.25rem 1.5rem', background: 'var(--surface-default, #fff)', border: '1px solid var(--surface-border, #e0e0e0)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: '1.25rem' }}>💬</span>
                <span style={{ fontStyle: 'italic', color: 'var(--ink, #0d0d0d)', fontSize: '1rem', fontWeight: 500 }}>&ldquo;{prompt}&rdquo;</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.75rem', color: 'var(--ink, #0d0d0d)' }}>
          How it Works
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {feature.howItWorks.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--ink, #0d0d0d)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.95rem' }}>
                {index + 1}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--ink, #0d0d0d)' }}>
                  {item.step}
                </h3>
                <p style={{ color: 'var(--on-surface-variant, #555)', lineHeight: 1.6, fontSize: '1rem' }}>
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section style={{ marginBottom: '4rem', background: 'var(--surface-sunken, #f8f9fa)', padding: '2.5rem', borderRadius: '20px', border: '1px solid var(--surface-border, #eee)' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--ink, #0d0d0d)' }}>
          Real Student Use Cases
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {feature.useCases.map((useCase, uIdx) => (
            <li key={uIdx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--on-surface-variant, #444)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--primary, #007bff)', fontSize: '1.2rem' }}>•</span>
              <span>{useCase}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Mini FAQ if available */}
      {feature.miniFaq && (
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--ink, #0d0d0d)' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {feature.miniFaq.map((faq, fIdx) => (
              <div key={fIdx} style={{ borderBottom: '1px solid var(--surface-border, #eee)', paddingBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--ink, #0d0d0d)' }}>
                  {faq.question}
                </h3>
                <p style={{ color: 'var(--on-surface-variant, #555)', lineHeight: 1.6 }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Primary CTA */}
      <div style={{ marginTop: '4rem', padding: '3.5rem 2rem', background: 'var(--ink, #0d0d0d)', color: 'white', borderRadius: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>
          Master your semester with {feature.title.split('—')[0].trim()}
        </h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--grey-300, #b9b9b7)', maxWidth: '540px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Join thousands of university students organizing courses, tracking deadlines, and boosting academic outcomes.
        </p>
        <a
          href="https://my.tenaciti.app/signup"
          style={{
            display: 'inline-block',
            padding: '1rem 2.5rem',
            background: 'var(--white, #ffffff)',
            color: 'var(--ink, #0d0d0d)',
            borderRadius: '999px',
            fontWeight: 700,
            fontSize: '1.125rem',
            textDecoration: 'none',
            transition: 'transform 0.15s ease',
          }}
        >
          {feature.ctaText}
        </a>
      </div>

      {/* Structured Data: HowTo + Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
    </div>
  );
}
