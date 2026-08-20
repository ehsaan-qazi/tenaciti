'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../HeroDemo.module.css';
import { noteCreationSteps } from '../dummyData';

/**
 * Scene 3 — AI creates a connected note
 */

interface Props {
  isActive: boolean;
  onComplete?: () => void;
}

type Phase = 'idle' | 'user' | 'ai' | 'tools' | 'result';

export default function SceneAINote({ isActive, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [visibleTools, setVisibleTools] = useState(0);
  const [doneTools, setDoneTools] = useState(0);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      setVisibleTools(0);
      setDoneTools(0);
      return;
    }

    const t: ReturnType<typeof setTimeout>[] = [];

    t.push(setTimeout(() => setPhase('user'), 200));
    t.push(setTimeout(() => setPhase('ai'), 1100));
    t.push(setTimeout(() => setPhase('tools'), 1800));

    noteCreationSteps.forEach((_, i) => {
      t.push(setTimeout(() => setVisibleTools(i + 1), 2000 + i * 500));
      t.push(setTimeout(() => setDoneTools(i + 1), 2000 + i * 500 + 350));
    });

    const resultTime = 2000 + noteCreationSteps.length * 500 + 400;
    t.push(setTimeout(() => setPhase('result'), resultTime));
    t.push(setTimeout(() => {
      onCompleteRef.current?.();
    }, resultTime + 1800));

    return () => t.forEach(clearTimeout);
  }, [isActive]);

  const showUser = ['user', 'ai', 'tools', 'result'].includes(phase);
  const showAI = ['ai', 'tools', 'result'].includes(phase);
  const showTools = ['tools', 'result'].includes(phase);
  const showResult = phase === 'result';

  return (
    <>
      <div className={styles.sceneHeader}>
        <div className={styles.sceneIcon} style={{ background: 'rgba(13, 13, 13, 0.06)' }}>
          <span className={styles.aiDot} />
        </div>
        <div className={styles.sceneTitle}>Tenaciti AI</div>
        <div className={styles.sceneSub}>Note Creation</div>
      </div>

      <div className={styles.chatArea}>
        {/* User message */}
        <div className={`${styles.userBubble} ${showUser ? styles.userBubbleVisible : ''}`}>
          My teacher said Topic 4 is very important for the final exam.
        </div>

        {/* AI response */}
        <div className={`${styles.aiBubble} ${showAI ? styles.aiBubbleVisible : ''}`}>
          <div className={styles.aiLabel}>
            <span className={styles.aiDot} />
            TENACITI AI
          </div>
          I&apos;ll create a note and connect it to Normalization in Database Systems.
        </div>

        {/* Tool calls */}
        {showTools && (
          <div className={styles.toolCalls}>
            {noteCreationSteps.map((step, i) => (
              <div key={i} className={`${styles.toolCall} ${i < visibleTools ? styles.toolCallVisible : ''}`}>
                <div className={styles.toolCallLabel}>
                  <span className={styles.toolCallIcon}>
                    {step.tool === 'Notes' ? '📝' : step.tool === 'Topics' ? '🔗' : '⭐'}
                  </span>
                  {step.label}
                </div>
                <span className={`${styles.toolCallStatus} ${i < doneTools ? styles.toolCallDone : (i < visibleTools ? styles.toolCallWorking : styles.toolCallPending)}`}>
                  {i < doneTools ? '✓ Done' : (i < visibleTools ? '⟳ Working...' : '○ Pending')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Result card */}
        <div className={`${styles.resultCard} ${showResult ? styles.resultCardVisible : ''}`}>
          <div className={styles.resultTitle}>📝 Teacher&apos;s Exam Hint</div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Course</span>
            <span className={styles.resultValue}>Database Systems</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Linked to</span>
            <span className={styles.resultTag}>📋 Normalization</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Priority</span>
            <span className={styles.resultTag} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }}>⭐ Important</span>
          </div>
        </div>
      </div>
    </>
  );
}
