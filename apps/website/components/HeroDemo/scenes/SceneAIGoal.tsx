'use client';

import { useState, useEffect } from 'react';
import styles from '../HeroDemo.module.css';

/**
 * Scene 5 — AI creates a structured academic goal
 */

interface Props {
  onComplete?: () => void;
}

type Phase = 'idle' | 'user' | 'ai' | 'building' | 'done';

export default function SceneAIGoal({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [visibleFields, setVisibleFields] = useState(0);

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];

    t.push(setTimeout(() => setPhase('user'), 200));
    t.push(setTimeout(() => setPhase('ai'), 1100));
    t.push(setTimeout(() => setPhase('building'), 2000));

    for (let f = 1; f <= 4; f++) {
      t.push(setTimeout(() => setVisibleFields(f), 2200 + f * 300));
    }

    const doneTime = 2200 + 4 * 300 + 400;
    t.push(setTimeout(() => setPhase('done'), doneTime));
    t.push(setTimeout(() => onComplete?.(), doneTime + 2000));

    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const showUser = ['user', 'ai', 'building', 'done'].includes(phase);
  const showAI = ['ai', 'building', 'done'].includes(phase);
  const showCard = ['building', 'done'].includes(phase);

  return (
    <>
      <div className={styles.sceneHeader}>
        <div className={styles.sceneIcon}>
          <span className={styles.aiDot} />
        </div>
        <div className={styles.sceneTitle}>Tenaciti AI</div>
        <div className={styles.sceneSub}>Goal Setting</div>
      </div>

      <div className={styles.chatArea}>
        {/* User message */}
        <div className={`${styles.userBubble} ${showUser ? styles.userBubbleVisible : ''}`}>
          I want to finish Database Systems before Friday.
        </div>

        {/* AI response */}
        <div className={`${styles.aiBubble} ${showAI ? styles.aiBubbleVisible : ''}`}>
          <div className={styles.aiLabel}>
            <span className={styles.aiDot} />
            TENACITI AI
          </div>
          Creating a structured goal for Database Systems with automatic milestone tracking.
        </div>

        {/* Structured Goal Card */}
        <div className={`${styles.resultCard} ${showCard ? styles.resultCardVisible : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div className={styles.resultTitle} style={{ margin: 0 }}>🎯 Finish Database Systems</div>
            <span className={styles.resultTag} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16A34A' }}>
              {phase === 'done' ? '✓ Active' : 'Drafting...'}
            </span>
          </div>

          {visibleFields >= 1 && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Course</span>
              <span className={styles.resultValue}>Database Systems (CS-301)</span>
            </div>
          )}

          {visibleFields >= 2 && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Target Date</span>
              <span className={styles.resultValue} style={{ color: '#D97706' }}>This Friday (4 days left)</span>
            </div>
          )}

          {visibleFields >= 3 && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Linked Milestones</span>
              <span className={styles.resultTag}>3 Topics • 1 Quiz</span>
            </div>
          )}

          {visibleFields >= 4 && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Roadmap Sync</span>
              <span className={styles.resultValue} style={{ color: '#16A34A', fontSize: '11px' }}>✓ Auto-scheduled</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
