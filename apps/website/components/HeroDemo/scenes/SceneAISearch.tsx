'use client';

import { useState, useEffect } from 'react';
import styles from '../HeroDemo.module.css';
import { searchHits, searchAreas, type SearchArea } from '../dummyData';
import { IconSearch, IconFileText, IconListChecks, IconCheck, IconGraduationCap } from '../icons';

/**
 * Scene 6 — "Find everything I have about normalization."
 *
 * Sequence:
 *  0.25s – 1.0s   User asks across their workspace
 *  1.0s – 2.1s    Tenaciti AI sweeps Notes / Documents / Topics / Courses,
 *                 each area reporting its match count
 *  2.6s           Morphs into the global search palette: query pinned in the
 *                 search bar, filter chips, grouped results cascading in with
 *                 the query highlighted
 *  8.8s           Hands over to next scene (loops back to Scene 1)
 */

interface Props {
  onComplete?: () => void;
}

type Phase = 'user' | 'sweeping' | 'results';

const QUERY = 'normalization';
const HIGHLIGHT = 'normal';

const ROW_STEP = 240;
const REVEAL_AT = 2600;
const COMPLETE_AT = 8800;

function Highlight({ text }: { text: string }) {
  const idx = text.toLowerCase().indexOf(HIGHLIGHT);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className={styles.hlMark}>{text.slice(idx, idx + HIGHLIGHT.length)}</span>
      {text.slice(idx + HIGHLIGHT.length)}
    </>
  );
}

export default function SceneAISearch({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('user');
  const [visibleRows, setVisibleRows] = useState(0);
  const [doneRows, setDoneRows] = useState(0);

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];

    t.push(setTimeout(() => setPhase('sweeping'), 1000));

    searchAreas.forEach((_, i) => {
      t.push(setTimeout(() => setVisibleRows(i + 1), 1150 + i * ROW_STEP));
      t.push(setTimeout(() => setDoneRows(i + 1), 1150 + i * ROW_STEP + ROW_STEP));
    });

    t.push(setTimeout(() => setPhase('results'), REVEAL_AT));
    t.push(setTimeout(() => onComplete?.(), COMPLETE_AT));

    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const isChat = phase !== 'results';
  const isSweeping = phase === 'sweeping';

  const countFor = (area: SearchArea) => searchHits.filter((h) => h.area === area).length;
  // Flat index of every hit across all groups → pure stagger delays
  const globalIndex = new Map(searchHits.map((h, i) => [h.id, i]));

  return (
    <>
      {/* ── PHASE 1–2: ASK + WORKSPACE SWEEP ── */}
      {isChat && (
        <>
          <div className={styles.sceneHeader}>
            <div className={styles.sceneIcon}>
              <span className={styles.aiDot} />
            </div>
            <div className={styles.sceneTitle}>Tenaciti AI</div>
            <div className={styles.sceneSub}>Workspace Search</div>
          </div>

          <div className={styles.chatArea}>
            <div className={`${styles.userBubble} ${phase === 'user' || isSweeping ? styles.userBubbleVisible : ''}`}>
              Find everything I have about normalization.
            </div>

            {isSweeping && (
              <div className={styles.aiPanel}>
                <div className={styles.aiPanelTitle}>
                  <span className={styles.aiDot} />
                  Searching your workspace
                </div>

                <div className={styles.scanList}>
                  {searchAreas.map((area, i) => {
                    const isVisible = i < visibleRows;
                    const isDone = i < doneRows;

                    return (
                      <div key={area} className={`${styles.scanRow} ${isVisible ? styles.scanRowVisible : ''}`}>
                        <span className={styles.scanTile} style={{ background: '#F3F4F6', color: '#374151' }}>
                          <IconSearch size={13} />
                        </span>
                        <span className={styles.scanText}>
                          <span className={styles.scanLabel}>{area}</span>
                        </span>
                        {isDone ? (
                          <span className={styles.scanCountChip}>{countFor(area)} matches</span>
                        ) : (
                          <span className={styles.spinRing} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PHASE 3: GLOBAL SEARCH PALETTE ── */}
      {phase === 'results' && (
        <div className={styles.paletteView}>
          {/* Pinned query */}
          <div className={styles.searchBar}>
            <IconSearch size={14} className={styles.searchBarIcon} />
            <span className={styles.searchQuery}>
              {QUERY}
              <span className={styles.caret} />
            </span>
            <span className={styles.resultsCount}>{searchHits.length} results</span>
          </div>

          {/* Filter chips */}
          <div className={styles.chipsRow}>
            <span className={`${styles.chip} ${styles.chipActive}`}>All</span>
            {searchAreas.map((area) => (
              <span key={area} className={styles.chip}>
                {area}
              </span>
            ))}
          </div>

          {/* Grouped results */}
          {searchAreas.map((area) => {
            const hits = searchHits.filter((h) => h.area === area);

            return (
              <div key={area} className={styles.resultGroup}>
                <div className={styles.groupHead}>
                  {area}
                  <span className={styles.searchCount}>{hits.length}</span>
                </div>

                {hits.map((hit) => (
                  <div
                    key={hit.id}
                    className={styles.hitRow}
                    style={{ animationDelay: `${0.1 + 0.07 * (globalIndex.get(hit.id) ?? 0)}s` }}
                  >
                      {hit.area === 'Documents' ? (
                        <span className={styles.hitPdfTile}>PDF</span>
                      ) : hit.area === 'Notes' ? (
                        <span className={styles.hitTile} style={{ background: 'rgba(124, 58, 237, 0.09)', color: '#7C3AED' }}>
                          <IconFileText size={14} />
                        </span>
                      ) : hit.area === 'Topics' ? (
                        <span className={styles.hitTile} style={{ background: 'rgba(79, 70, 229, 0.09)', color: '#4F46E5' }}>
                          <IconListChecks size={14} />
                        </span>
                      ) : (
                        <span className={styles.hitTile} style={{ background: 'rgba(71, 85, 105, 0.12)', color: '#334155' }}>
                          <IconGraduationCap size={14} />
                        </span>
                      )}

                      <span className={styles.hitMain}>
                        <span className={styles.hitTitle}>
                          <Highlight text={hit.title} />
                        </span>
                        {hit.sub && <span className={styles.hitSub}>{hit.sub}</span>}
                      </span>

                      <span className={styles.hitMeta}>
                        {hit.area === 'Topics' && <IconCheck size={10} className={styles.hitMetaIcon} />}
                        {hit.meta}
                      </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
