'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../HeroDemo.module.css';
import { contextCheckSteps } from '../dummyData';

/**
 * Scene 4 — AI recommends what to study next
 */

interface Props {
  isActive: boolean;
  onComplete?: () => void;
}

type Phase = 'idle' | 'user' | 'thinking' | 'result';

export default function SceneAIStudyNext({ isActive, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [visibleChecks, setVisibleChecks] = useState(0);
  const [doneChecks, setDoneChecks] = useState(0);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      setVisibleChecks(0);
      setDoneChecks(0);
      return;
    }

    const t: ReturnType<typeof setTimeout>[] = [];

    t.push(setTimeout(() => setPhase('user'), 200));
    t.push(setTimeout(() => setPhase('thinking'), 1000));

    // Context checks
    contextCheckSteps.forEach((_, i) => {
      t.push(setTimeout(() => setVisibleChecks(i + 1), 1200 + i * 200));
      t.push(setTimeout(() => setDoneChecks(i + 1), 1200 + i * 200 + 150));
    });

    const resultTime = 1200 + contextCheckSteps.length * 200 + 300;
    t.push(setTimeout(() => setPhase('result'), resultTime));
    t.push(setTimeout(() => {
      onCompleteRef.current?.();
    }, resultTime + 2200));

    return () => t.forEach(clearTimeout);
  }, [isActive]);

  const showUser = ['user', 'thinking', 'result'].includes(phase);
  const showThinking = ['thinking'].includes(phase);
  const showResult = phase === 'result';

  return (
    <>
      <div className={styles.sceneHeader}>
        <div className={styles.sceneIcon} style={{ background: 'rgba(13, 13, 13, 0.06)' }}>
          <span className={styles.aiDot} />
        </div>
        <div className={styles.sceneTitle}>Tenaciti AI</div>
        <div className={styles.sceneSub}>Study Recommendation</div>
      </div>

      <div className={styles.chatArea}>
        <div className={`${styles.userBubble} ${showUser ? styles.userBubbleVisible : ''}`}>
          What should I study next?
        </div>

        {/* Context checks */}
        {showThinking && (
          <div className={`${styles.aiBubble} ${styles.aiBubbleVisible}`}>
            <div className={styles.aiLabel}>
              <span className={styles.aiDot} />
              ANALYZING WORKSPACE
            </div>
            <div className={styles.toolCalls} style={{ marginTop: 4 }}>
              {contextCheckSteps.map((step, i) => (
                <div key={i} className={`${styles.toolCall} ${i < visibleChecks ? styles.toolCallVisible : ''}`} style={{ padding: '5px 10px' }}>
                  <div className={styles.toolCallLabel}>
                    <span className={styles.toolCallIcon}>{step.icon}</span>
                    {step.label}
                  </div>
                  <span className={`${styles.toolCallStatus} ${i < doneChecks ? styles.toolCallDone : (i < visibleChecks ? styles.toolCallWorking : styles.toolCallPending)}`}>
                    {i < doneChecks ? '✓' : (i < visibleChecks ? '⟳' : '○')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        {showResult && (
          <>
            <div className={`${styles.aiBubble} ${styles.aiBubbleVisible}`}>
              <div className={styles.aiLabel}>
                <span className={styles.aiDot} />
                TENACITI AI
              </div>
              Based on your upcoming DBMS Quiz in 3 days and your current progress, I recommend:
            </div>

            <div className={`${styles.resultCard} ${styles.resultCardVisible}`}>
              <div className={styles.resultTitle}>📚 Database Normalization</div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Course</span>
                <span className={styles.resultValue}>Database Systems</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Progress</span>
                <span className={styles.resultValue}>42%</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Next deadline</span>
                <span className={styles.resultTag} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626' }}>⏰ Quiz in 3 days</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Remaining topics</span>
                <span className={styles.resultValue}>2 topics</span>
              </div>
              <button className={styles.resultActionBtn}>+ Add to today&apos;s plan</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
