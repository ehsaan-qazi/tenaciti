'use client';

import { useState, useEffect } from 'react';
import styles from '../HeroDemo.module.css';

/**
 * Slide 1 — Drag & Drop Syllabus + Uploaded Document with Roadmap/Topics options
 *
 * Sequence:
 *  0.0s  - Initial state: Empty dropzone
 *  0.3s  - Floating PDF badge "Lecture 19.pdf" animates & drops into dropzone
 *  1.6s  - Dropzone pulses (drag-over highlight)
 *  2.0s  - Document lands in "Uploaded Documents" with "● Processed" badge
 *  3.0s  - "✨ Topics" button clicks
 *  3.4s  - "Topics" button switches to "⟳ Extracting..." + Extraction banner slides in
 *  4.8s  - Triggers next slide (Slide 2: Extracted Topics cascade in)
 */

interface Props {
  onComplete?: () => void;
}

type Phase = 'empty' | 'dropping' | 'dropped' | 'clickingTopics' | 'extracting';

export default function SceneDocumentRoadmap({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('empty');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase('dropping'), 300));
    timers.push(setTimeout(() => setPhase('dropped'), 1800));
    timers.push(setTimeout(() => setPhase('clickingTopics'), 3000));
    timers.push(setTimeout(() => setPhase('extracting'), 3400));
    timers.push(setTimeout(() => {
      onComplete?.();
    }, 4900));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const isDropping = phase === 'dropping';
  const isDropped = ['dropped', 'clickingTopics', 'extracting'].includes(phase);
  const isClicking = phase === 'clickingTopics';
  const isExtracting = phase === 'extracting';

  return (
    <>
      {/* ── COURSE TABS HEADER ── */}
      <div className={styles.courseTabs}>
        <span className={styles.courseTab}>Overview</span>
        <span className={styles.courseTab}>Topics (65)</span>
        <span className={`${styles.courseTab} ${styles.courseTabActive}`}>Documents (4)</span>
        <span className={styles.courseTab}>Roadmap (11)</span>
        <span className={styles.courseTab}>Notes (0)</span>
      </div>

      {/* ── UPLOAD DROPZONE ── */}
      <div className={`${styles.uploadDropzone} ${isDropping ? styles.uploadDropzoneDragOver : ''}`}>
        {/* Floating document badge during drag animation */}
        {isDropping && (
          <div className={styles.floatingFileBadge}>
            <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '13px' }}>PDF</span>
            <span>Lecture 19.pdf</span>
          </div>
        )}

        <div className={`${styles.uploadIconCircle} ${isDropping ? styles.uploadIconCircleActive : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9 15 12 12 15 15" />
          </svg>
        </div>

        <div className={styles.uploadDropTitle}>Click or drag files to upload</div>
        <div className={styles.uploadDropSubtitle}>PDF, PPTX up to 25MB</div>
      </div>

      {/* ── UPLOADED DOCUMENTS SECTION (Exact Image 1) ── */}
      {isDropped && (
        <>
          <div className={styles.uploadedSectionHeader}>
            <div className={styles.uploadedHeading}>Uploaded Documents</div>
            <span className={styles.fileCountBadge}>4 FILES</span>
          </div>

          {/* Document Item: Lecture 19.pdf */}
          <div className={styles.docItemCard}>
            <div className={styles.docItemLeftAccent} />

            <div className={styles.docItemInfo}>
              <div className={styles.docPdfIcon}>PDF</div>
              <div className={styles.docTextGroup}>
                <div className={styles.docFileName}>Lecture 19.pdf</div>
                <div className={styles.docFileMeta}>444.6 KB • Syllabus</div>
              </div>
            </div>

            <div className={styles.docActionGroup}>
              <span className={styles.statusProcessedBadge}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                Processed
              </span>

              <button className={styles.docBtnAction}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3v12" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
                Roadmap
              </button>

              <button className={`${styles.docBtnAction} ${isClicking ? styles.docBtnActionActive : ''} ${isExtracting ? styles.docBtnActionExtracting : ''}`}>
                {isExtracting ? (
                  <>
                    <span className={styles.spinner} style={{ width: 10, height: 10, borderWidth: 1.5 }} />
                    Extracting...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Topics
                  </>
                )}
              </button>

              <button className={styles.docTrashBtn} title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── EXTRACTION PROGRESS INDICATOR ── */}
          {isExtracting && (
            <div className={styles.extractionLoadingCard}>
              <div className={styles.extractionLoadingHeader}>
                <span>✨ Extracting topics & key concepts...</span>
                <span style={{ color: '#16A34A', fontSize: 11 }}>AI Processing</span>
              </div>
              <div className={styles.extractionProgressBar}>
                <div className={styles.extractionProgressFill} />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
