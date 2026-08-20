'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../HeroDemo.module.css';

/**
 * Slide 2 — Extracted Suggested Topics & Rate Topic Mastery Modal
 * (Matches Image 3 & Image 4 from the app)
 *
 * Sequence:
 *  0.0s  - Suggested topics appear (1. FD Example, 2. B2C Business Models, 3. Three Level Architecture)
 *  1.2s  - Row 1 "1. FD Example" highlights
 *  1.8s  - "✓ Confirm" button activates/clicks
 *  2.4s  - "Rate Topic Mastery" modal opens over the topics
 *  3.2s  - Stars animate 1 -> 4
 *  4.2s  - "✓ Save & Complete" green button clicks
 *  5.0s  - Modal closes, topic is saved & confirmed
 *  6.0s  - Triggers next slide
 */

interface Props {
  isActive: boolean;
  onComplete?: () => void;
}

type Phase = 'topicsIn' | 'highlight' | 'confirmClick' | 'modalOpen' | 'stars' | 'saveClick' | 'confirmed';

export default function SceneTopicsConfidence({ isActive, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('topicsIn');
  const [activeStars, setActiveStars] = useState(0);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isActive) {
      setPhase('topicsIn');
      setActiveStars(0);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase('highlight'), 1000));
    timers.push(setTimeout(() => setPhase('confirmClick'), 1800));
    timers.push(setTimeout(() => setPhase('modalOpen'), 2400));

    // Animate stars 1 -> 4
    for (let s = 1; s <= 4; s++) {
      timers.push(setTimeout(() => setActiveStars(s), 2700 + s * 220));
    }

    timers.push(setTimeout(() => setPhase('saveClick'), 4200));
    timers.push(setTimeout(() => setPhase('confirmed'), 4800));
    timers.push(setTimeout(() => {
      onCompleteRef.current?.();
    }, 6000));

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  const isHighlighted = ['highlight', 'confirmClick'].includes(phase);
  const isConfirmClicked = phase === 'confirmClick';
  const showModal = ['modalOpen', 'stars', 'saveClick'].includes(phase);
  const isSaveClicked = phase === 'saveClick';
  const isRow1Confirmed = phase === 'confirmed';

  const confidenceLabels = ['', 'Need to revisit', 'Getting there', 'Moderate understanding', 'Strong confidence', 'Mastered!'];

  return (
    <>
      {/* ── COURSE TABS HEADER ── */}
      <div className={styles.courseTabs}>
        <span className={styles.courseTab}>Overview</span>
        <span className={`${styles.courseTab} ${styles.courseTabActive}`}>Topics (65)</span>
        <span className={styles.courseTab}>Documents (4)</span>
        <span className={styles.courseTab}>Roadmap (11)</span>
        <span className={styles.courseTab}>Notes (0)</span>
      </div>

      {/* ── SUGGESTED TOPICS LIST (Exact Image 3) ── */}
      <div className={styles.suggestedTopicsContainer}>
        {/* Topic 1: FD Example */}
        <div className={`${styles.suggestedTopicRow} ${isHighlighted ? styles.suggestedTopicRowHighlight : ''}`}>
          <div className={styles.dragHandle}>⋮⋮</div>

          <div className={`${styles.topicTitleItalic} ${isRow1Confirmed ? styles.topicTitleConfirmed : ''}`}>
            1. FD Example
          </div>

          {!isRow1Confirmed ? (
            <>
              <span className={styles.suggestedPill}>
                <span>✨</span>
                Suggested
              </span>

              <button className={`${styles.confirmPillBtn} ${isConfirmClicked ? styles.confirmPillBtnClicked : ''}`}>
                ✓ Confirm
              </button>

              <span className={styles.dismissCross}>✕</span>
            </>
          ) : (
            <span style={{ padding: '4px 10px', background: 'rgba(34, 197, 94, 0.12)', color: '#16A34A', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
              ★ 4/5 Confirmed
            </span>
          )}
        </div>

        {/* Topic 2: B2C Business Models */}
        <div className={styles.suggestedTopicRow}>
          <div className={styles.dragHandle}>⋮⋮</div>
          <div className={styles.topicTitleItalic}>2. B2C Business Models</div>
          <span className={styles.suggestedPill}>
            <span>✨</span>
            Suggested
          </span>
          <button className={styles.confirmPillBtn}>✓ Confirm</button>
          <span className={styles.dismissCross}>✕</span>
        </div>

        {/* Topic 3: Three Level Architecture */}
        <div className={styles.suggestedTopicRow}>
          <div className={styles.dragHandle}>⋮⋮</div>
          <div className={styles.topicTitleItalic}>3. Three Level Architecture</div>
          <span className={styles.suggestedPill}>
            <span>✨</span>
            Suggested
          </span>
          <button className={styles.confirmPillBtn}>✓ Confirm</button>
          <span className={styles.dismissCross}>✕</span>
        </div>
      </div>

      {/* ── RATE TOPIC MASTERY MODAL (Exact Image 4) ── */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.rateMasteryCard}>
            <div className={styles.rateModalTitle}>
              <span>⭐</span>
              Rate Topic Mastery
            </div>

            <p className={styles.rateModalDesc}>
              How confident do you feel after reviewing <strong>&quot;FD Example&quot;</strong>?
            </p>

            <div className={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`${star <= activeStars ? styles.starFilled : styles.starEmpty} ${star === activeStars ? styles.starFilledActive : ''}`}
                >
                  ★
                </span>
              ))}
            </div>

            <div className={styles.confidenceTextLabel}>
              {activeStars > 0 ? confidenceLabels[activeStars] : 'Select rating'}
            </div>

            <div className={styles.modalBtnActions}>
              <button className={styles.btnSkipRating}>Skip Rating</button>
              <button className={`${styles.btnSaveComplete} ${isSaveClicked ? styles.btnSaveCompleteActive : ''}`}>
                ✓ Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
