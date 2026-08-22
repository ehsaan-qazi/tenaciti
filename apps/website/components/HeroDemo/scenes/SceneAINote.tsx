'use client';

import { useState, useEffect } from 'react';
import styles from '../HeroDemo.module.css';

/**
 * Slide 3 — AI Prompt -> Persistent Morph to Notes Overview -> Minimalist Knowledge Graph
 *
 * Sequence:
 *  0.0s – 2.0s:  Phase 1 — AI prompt & real-time thinking steps
 *  2.0s – 2.8s:  Morphing transition — Chat fades out as Note Card expands into the 2x2 grid
 *  2.8s – 5.4s:  Phase 2 — Notes Overview fully assembled with new note highlighted
 *  5.4s – 8.8s:  Phase 3 — Minimalist Obsidian-style Knowledge Graph
 *  8.8s:         Trigger next slide (Slide 4)
 */

interface Props {
  onComplete?: () => void;
}

type Phase =
  | 'prompt_user'
  | 'prompt_ai'
  | 'prompt_tools'
  | 'morphing'
  | 'notes_overview'
  | 'graph_view';

export default function SceneAINote({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('prompt_user');
  const [visibleTools, setVisibleTools] = useState(0);
  const [doneTools, setDoneTools] = useState(0);

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];

    // Phase 1: AI Prompt & thinking steps
    t.push(setTimeout(() => setPhase('prompt_ai'), 550));
    t.push(setTimeout(() => setPhase('prompt_tools'), 1000));
    t.push(setTimeout(() => setVisibleTools(1), 1200));
    t.push(setTimeout(() => setDoneTools(1), 1450));
    t.push(setTimeout(() => setVisibleTools(2), 1500));
    t.push(setTimeout(() => setDoneTools(2), 1750));
    t.push(setTimeout(() => setVisibleTools(3), 1800));
    t.push(setTimeout(() => setDoneTools(3), 2050));

    // Phase 2: Noticeable morphing transition
    t.push(setTimeout(() => setPhase('morphing'), 2200));
    t.push(setTimeout(() => setPhase('notes_overview'), 2800));

    // Phase 3: Transition to Minimalist Knowledge Graph View
    t.push(setTimeout(() => setPhase('graph_view'), 5400));

    // Complete scene
    t.push(
      setTimeout(() => {
        onComplete?.();
      }, 8900)
    );

    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const isPromptOnly = ['prompt_user', 'prompt_ai', 'prompt_tools'].includes(phase);
  const showAI = ['prompt_ai', 'prompt_tools', 'morphing'].includes(phase);
  const showTools = ['prompt_tools', 'morphing'].includes(phase);
  const isMorphingOrOverview = phase === 'morphing' || phase === 'notes_overview';
  const isGraphView = phase === 'graph_view';

  return (
    <>
      {/* ── PHASE 1: AI CHAT PROMPT (Fades away during morph) ── */}
      {isPromptOnly && (
        <>
          <div className={styles.sceneHeader}>
            <div className={styles.sceneIcon}>
              <span className={styles.aiDot} />
            </div>
            <div className={styles.sceneTitle}>Tenaciti AI</div>
            <div className={styles.sceneSub}>Smart Note Creation</div>
          </div>

          <div className={styles.chatArea}>
            {/* User message */}
            <div className={`${styles.userBubble} ${styles.userBubbleVisible}`}>
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

            {/* Tool calls / thinking steps */}
            {showTools && (
              <div className={styles.toolCalls}>
                <div className={`${styles.toolCall} ${visibleTools >= 1 ? styles.toolCallVisible : ''}`}>
                  <div className={styles.toolCallLabel}>
                    <span className={styles.toolCallIcon}>📝</span>
                    Notes: Creating &quot;Teacher&apos;s Exam Hint&quot;
                  </div>
                  <span className={`${styles.toolCallStatus} ${doneTools >= 1 ? styles.toolCallDone : styles.toolCallWorking}`}>
                    {doneTools >= 1 ? '✓ Done' : '⟳ Working...'}
                  </span>
                </div>

                <div className={`${styles.toolCall} ${visibleTools >= 2 ? styles.toolCallVisible : ''}`}>
                  <div className={styles.toolCallLabel}>
                    <span className={styles.toolCallIcon}>🔗</span>
                    Topics: Linking to [[Normalization]]
                  </div>
                  <span className={`${styles.toolCallStatus} ${doneTools >= 2 ? styles.toolCallDone : (visibleTools >= 2 ? styles.toolCallWorking : styles.toolCallPending)}`}>
                    {doneTools >= 2 ? '✓ Done' : (visibleTools >= 2 ? '⟳ Working...' : '○ Pending')}
                  </span>
                </div>

                <div className={`${styles.toolCall} ${visibleTools >= 3 ? styles.toolCallVisible : ''}`}>
                  <div className={styles.toolCallLabel}>
                    <span className={styles.toolCallIcon}>⭐</span>
                    Priority: Tagging Final Exam Importance
                  </div>
                  <span className={`${styles.toolCallStatus} ${doneTools >= 3 ? styles.toolCallDone : styles.toolCallWorking}`}>
                    {doneTools >= 3 ? '✓ Done' : '⟳ Working...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PHASE 2: NOTES OVERVIEW (Expanded directly from the note creation step) ── */}
      {isMorphingOrOverview && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
          {/* Header */}
          <div className={styles.notesHeader} style={{ animation: 'slideDownFade 0.4s ease forwards' }}>
            <div className={styles.notesTitle}>
              <span>📝</span>
              <span>Notes</span>
            </div>

            <div className={styles.notesHeaderActions}>
              <div className={styles.notesViewSwitcher}>
                <button className={`${styles.notesViewBtn} ${styles.notesViewBtnActive}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  List
                </button>
                <button className={styles.notesViewBtn}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Graph
                </button>
              </div>

              <button className={styles.notesNewBtn}>
                <span>+</span> New Note
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className={styles.notesSearchRow} style={{ animation: 'slideDownFade 0.45s ease forwards' }}>
            <div className={styles.notesSearchInputWrapper}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.notesSearchInput}
                value="Normalization"
                readOnly
              />
            </div>
            <button className={styles.notesFilterBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              </svg>
            </button>
          </div>

          {/* Notes Grid with Newly Created Note Highlighted */}
          <div className={styles.notesCardsGrid}>
            {/* NEW NOTE: Teacher's Exam Hint (Noticeably morphed directly from thinking step) */}
            <div className={`${styles.notesCard} ${styles.notesCardNew} ${styles.noteCardMorphingFromTool}`}>
              <div className={styles.notesCardCornerGlow} />
              <div className={styles.notesCardHeader}>
                <div className={styles.notesCardTitleArea}>
                  <div className={styles.notesCardTitle}>📌 Teacher&apos;s Exam Hint</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span className={`${styles.notesCardBadge} ${styles.notesCardBadgePurple}`}>CS 301</span>
                    <span className={styles.notesCardBadge} style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#D97706' }}>⭐ Exam</span>
                  </div>
                </div>
              </div>
              <div className={styles.notesCardBody}>
                Teacher emphasized 3NF &amp; BCNF decompositions for the final exam. Linked to <span className={styles.notesWikilink}>[[Normalization]]</span>.
              </div>
              <div className={styles.notesCardFooter}>
                <span>Updated just now</span>
                <span style={{ color: '#7C3AED', fontWeight: 600 }}>🔗 1 link</span>
              </div>
            </div>

            {/* EXISTING NOTE 1: ACID Properties */}
            <div className={`${styles.notesCard} ${styles.staggerCard1}`}>
              <div className={styles.notesCardHeader}>
                <div className={styles.notesCardTitleArea}>
                  <div className={styles.notesCardTitle}>ACID Properties</div>
                  <span className={styles.notesCardBadge}>CS 301</span>
                </div>
              </div>
              <div className={styles.notesCardBody}>
                Atomicity, Consistency, Isolation, Durability. Core transaction guarantees in relational database engines.
              </div>
              <div className={styles.notesCardFooter}>
                <span>Updated 2d ago</span>
                <span>🔗 3 links</span>
              </div>
            </div>

            {/* EXISTING NOTE 2: ER Diagrams */}
            <div className={`${styles.notesCard} ${styles.staggerCard2}`}>
              <div className={styles.notesCardHeader}>
                <div className={styles.notesCardTitleArea}>
                  <div className={styles.notesCardTitle}>ER Diagrams &amp; Schema</div>
                  <span className={styles.notesCardBadge}>CS 301</span>
                </div>
              </div>
              <div className={styles.notesCardBody}>
                Entities, relationships, and mapping cardinalities (1:1, 1:N, N:M) to normalized tables.
              </div>
              <div className={styles.notesCardFooter}>
                <span>Updated 5d ago</span>
                <span>🔗 2 links</span>
              </div>
            </div>

            {/* EXISTING NOTE 3: Functional Dependencies */}
            <div className={`${styles.notesCard} ${styles.staggerCard3}`}>
              <div className={styles.notesCardHeader}>
                <div className={styles.notesCardTitleArea}>
                  <div className={styles.notesCardTitle}>Functional Dependencies</div>
                  <span className={styles.notesCardBadge}>CS 301</span>
                </div>
              </div>
              <div className={styles.notesCardBody}>
                Armstrong&apos;s Axioms, closure of attribute sets, and computing minimal canonical covers.
              </div>
              <div className={styles.notesCardFooter}>
                <span>Updated 1w ago</span>
                <span>🔗 4 links</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PHASE 3: MINIMALIST KNOWLEDGE GRAPH VIEW ── */}
      {isGraphView && (
        <div className={styles.graphViewWrapper}>
          {/* Top Controls Bar */}
          <div className={styles.graphTopControls}>
            <div className={styles.graphPill}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED', display: 'inline-block' }} />
              Database Systems • 6 Nodes
            </div>

            <div className={styles.notesViewSwitcher}>
              <button className={styles.notesViewBtn}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                List
              </button>
              <button className={`${styles.notesViewBtn} ${styles.notesViewBtnActive}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Graph
              </button>
            </div>
          </div>

          {/* Minimalist SVG Knowledge Graph */}
          <div className={styles.graphSvgContainer}>
            <svg width="100%" height="100%" viewBox="0 0 460 230" style={{ overflow: 'visible' }}>
              {/* Minimal Connecting Link Lines */}
              <line x1="230" y1="115" x2="140" y2="68" stroke="#E2E8F0" strokeWidth="1.5" />
              <line x1="230" y1="115" x2="140" y2="68" stroke="#7C3AED" strokeWidth="2" strokeDasharray="4,12" className={styles.energyParticle} />

              <line x1="140" y1="68" x2="70" y2="135" stroke="#E2E8F0" strokeWidth="1.5" />
              <line x1="140" y1="68" x2="70" y2="135" stroke="#D97706" strokeWidth="2" strokeDasharray="4,12" className={styles.energyParticle} />

              <line x1="140" y1="68" x2="155" y2="185" stroke="#E2E8F0" strokeWidth="1.2" />
              <line x1="70" y1="135" x2="155" y2="185" stroke="#E2E8F0" strokeWidth="1.2" strokeDasharray="3,3" />

              <line x1="230" y1="115" x2="325" y2="65" stroke="#E2E8F0" strokeWidth="1.5" />
              <line x1="230" y1="115" x2="350" y2="155" stroke="#E2E8F0" strokeWidth="1.5" />
              <line x1="230" y1="115" x2="245" y2="195" stroke="#E2E8F0" strokeWidth="1.5" />

              {/* ── MINIMALIST NODES ── */}

              {/* 1. Hub: Database Systems */}
              <g transform="translate(230, 115)">
                <circle r="22" fill="#1E293B" />
                <text y="4" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="sans-serif">CS 301</text>
                <text y="34" textAnchor="middle" fill="#1E293B" fontSize="10.5" fontWeight="700" fontFamily="sans-serif">Database Systems</text>
              </g>

              {/* 2. Concept: Normalization */}
              <g transform="translate(140, 68)">
                <circle r="18" fill="#4F46E5" />
                <text y="3" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="600" fontFamily="sans-serif">Concept</text>
                <text y="-24" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="600" fontFamily="sans-serif">Normalization</text>
              </g>

              {/* 3. NEW NOTE: Teacher's Exam Hint (Minimalist with pulse ring) */}
              <g transform="translate(70, 135)">
                <circle cx="0" cy="0" r="19" fill="none" stroke="#D97706" strokeWidth="2" className={styles.pulseCircle} />
                <circle r="19" fill="#D97706" />
                <text y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11">📝</text>

                {/* Minimalist Badge */}
                <rect x="-42" y="24" width="84" height="16" rx="8" fill="#111827" />
                <text x="0" y="35" textAnchor="middle" fill="#FBBF24" fontSize="8" fontWeight="700" fontFamily="sans-serif">⭐ Exam Hint</text>
              </g>

              {/* 4. Sub-concept: 1NF, 2NF, 3NF */}
              <g transform="translate(155, 185)">
                <circle r="14" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
                <text y="3" textAnchor="middle" fill="#10B981" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">3NF</text>
                <text y="22" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="500" fontFamily="sans-serif">1NF, 2NF, 3NF</text>
              </g>

              {/* 5. Sub-concept: Functional Dependencies */}
              <g transform="translate(325, 65)">
                <circle r="14" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" />
                <text y="3" textAnchor="middle" fill="#0EA5E9" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">FD</text>
                <text y="-20" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="500" fontFamily="sans-serif">Functional Deps</text>
              </g>

              {/* 6. Sub-concept: Transactions */}
              <g transform="translate(350, 155)">
                <circle r="14" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2" />
                <text y="3" textAnchor="middle" fill="#8B5CF6" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">ACID</text>
                <text y="22" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="500" fontFamily="sans-serif">Transactions</text>
              </g>

              {/* 7. Sub-concept: ER Schema */}
              <g transform="translate(245, 195)">
                <circle r="13" fill="#FFFFFF" stroke="#64748B" strokeWidth="2" />
                <text y="3" textAnchor="middle" fill="#64748B" fontSize="7" fontWeight="700" fontFamily="sans-serif">ER</text>
                <text y="20" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="500" fontFamily="sans-serif">ER Schema</text>
              </g>
            </svg>
          </div>

          {/* Minimalist Legend */}
          <div className={styles.graphLegend}>
            <span><span className={styles.legendDot} style={{ background: '#1E293B' }} />Hub</span>
            <span><span className={styles.legendDot} style={{ background: '#4F46E5' }} />Concept</span>
            <span><span className={styles.legendDot} style={{ background: '#D97706' }} />New Note</span>
            <span><span className={styles.legendDot} style={{ background: '#64748B' }} />Subtopics</span>
          </div>
        </div>
      )}
    </>
  );
}
