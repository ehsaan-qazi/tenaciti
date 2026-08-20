'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../HeroDemo.module.css';
import { searchResults } from '../dummyData';

/**
 * Scene 6 — AI searches workspace
 */

interface Props {
  isActive: boolean;
  onComplete?: () => void;
}

type Phase = 'idle' | 'user' | 'ai' | 'searching' | 'results';

export default function SceneAISearch({ isActive, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [visibleCategories, setVisibleCategories] = useState(0);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      setVisibleCategories(0);
      return;
    }

    const t: ReturnType<typeof setTimeout>[] = [];

    t.push(setTimeout(() => setPhase('user'), 200));
    t.push(setTimeout(() => setPhase('ai'), 1000));
    t.push(setTimeout(() => setPhase('searching'), 1700));

    // Reveal categories sequentially
    searchResults.forEach((_, i) => {
      t.push(setTimeout(() => setVisibleCategories(i + 1), 1900 + i * 350));
    });

    const finishTime = 1900 + searchResults.length * 350 + 400;
    t.push(setTimeout(() => setPhase('results'), finishTime));
    t.push(setTimeout(() => {
      onCompleteRef.current?.();
    }, finishTime + 2000));

    return () => t.forEach(clearTimeout);
  }, [isActive]);

  const showUser = ['user', 'ai', 'searching', 'results'].includes(phase);
  const showAI = ['ai', 'searching', 'results'].includes(phase);
  const showResults = ['searching', 'results'].includes(phase);

  return (
    <>
      <div className={styles.sceneHeader}>
        <div className={styles.sceneIcon} style={{ background: 'rgba(13, 13, 13, 0.06)' }}>
          <span className={styles.aiDot} />
        </div>
        <div className={styles.sceneTitle}>Tenaciti AI</div>
        <div className={styles.sceneSub}>Workspace Search</div>
      </div>

      <div className={styles.chatArea}>
        {/* User message */}
        <div className={`${styles.userBubble} ${showUser ? styles.userBubbleVisible : ''}`}>
          Find everything I have about normalization.
        </div>

        {/* AI response */}
        <div className={`${styles.aiBubble} ${showAI ? styles.aiBubbleVisible : ''}`}>
          <div className={styles.aiLabel}>
            <span className={styles.aiDot} />
            WORKSPACE SEARCH
          </div>
          Found 7 matching references across 4 areas in Database Systems:
        </div>

        {/* Search Results Area */}
        {showResults && (
          <div className={styles.resultCard} style={{ opacity: 1, transform: 'none', padding: '12px 14px', marginTop: 4 }}>
            {searchResults.map((cat, catIdx) => {
              if (catIdx >= visibleCategories) return null;

              const getCategoryIcon = (category: string) => {
                switch (category) {
                  case 'Notes': return '📝';
                  case 'Documents': return '📄';
                  case 'Topics': return '📋';
                  case 'Courses': return '📚';
                  default: return '🔍';
                }
              };

              return (
                <div key={cat.category} className={styles.searchCategory} style={{ marginBottom: catIdx === searchResults.length - 1 ? 0 : 8 }}>
                  <div className={styles.searchCategoryTitle}>
                    <span>{getCategoryIcon(cat.category)}</span>
                    <span>{cat.category}</span>
                    <span className={styles.searchCount}>{cat.items.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} className={styles.searchItem} style={{ fontSize: '11.5px', padding: '4px 8px' }}>
                        <span className={styles.searchItemIcon}>↳</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
