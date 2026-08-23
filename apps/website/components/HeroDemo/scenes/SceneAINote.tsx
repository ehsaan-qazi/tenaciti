'use client';

import { useState, useEffect } from 'react';
import styles from '../HeroDemo.module.css';
import {
  IconFileText,
  IconLink,
  IconStar,
  IconSearch,
  IconPlus,
  IconCheck,
} from '../icons';

/**
 * Slide 3 — AI Prompt → Persistent Morph to Notes Overview → Minimalist Knowledge Graph
 *
 * Sequence:
 *  0.0s – 2.05s:  Phase 1 — AI prompt & structured tool-call steps
 *  2.7s – 3.05s:  Morphing crossfade — chat shell lifts away while the notes
 *                 overview fades in underneath it (overlapping animations)
 *  3.05s – 6.5s:  Phase 2 — Notes overview assembled, new note pops in last
 *  6.5s – 9.6s:   Phase 3 — Obsidian-style knowledge graph (circular dot nodes
 *                 with floating labels, edges drawing in, one animated accent
 *                 edge streaming into the new note)
 *  9.6s:          Trigger next slide (Slide 4)
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

/** Mini colored icon tile for tool-call rows — echoes the scan tiles in slides 4–6 */
function ToolTile({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: 5,
        background: bg,
        color,
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

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

    // Phase 2: Crossfade morph — chat exits while overview enters underneath
    t.push(setTimeout(() => setPhase('morphing'), 2700));
    t.push(setTimeout(() => setPhase('notes_overview'), 3050));

    // Phase 3: Transition to minimalist knowledge graph view
    t.push(setTimeout(() => setPhase('graph_view'), 6500));

    // Complete scene
    t.push(
      setTimeout(() => {
        onComplete?.();
      }, 9600)
    );

    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const showChat = ['prompt_user', 'prompt_ai', 'prompt_tools', 'morphing'].includes(phase);
  const showAI = ['prompt_ai', 'prompt_tools', 'morphing'].includes(phase);
  const showTools = ['prompt_tools', 'morphing'].includes(phase);
  const isMorphing = phase === 'morphing';
  const showOverview = phase === 'morphing' || phase === 'notes_overview';
  const isGraphView = phase === 'graph_view';

  const toolRows = [
    {
      icon: <IconFileText size={11} />,
      tileBg: 'rgba(124, 58, 237, 0.09)',
      tileColor: '#7C3AED',
      label: <>Notes: Creating &quot;Teacher&apos;s Exam Hint&quot;</>,
    },
    {
      icon: <IconLink size={11} />,
      tileBg: 'rgba(79, 70, 229, 0.09)',
      tileColor: '#4F46E5',
      label: (
        <>
          Topics: Linking to <span className={styles.notesWikilink}>[[Normalization]]</span>
        </>
      ),
    },
    {
      icon: <IconStar size={11} filled />,
      tileBg: 'rgba(217, 119, 6, 0.1)',
      tileColor: '#D97706',
      label: <>Priority: Tagging Final Exam Importance</>,
    },
  ];

  return (
    <div className={styles.scene3Root}>
      {/* ── PHASE 1: AI CHAT PROMPT (lifts away during the morph) ── */}
      {showChat && (
        <div className={`${styles.chatShell} ${isMorphing ? styles.chatExit : ''}`}>
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
                {toolRows.map((row, i) => {
                  const n = i + 1;
                  const isVisible = visibleTools >= n;
                  const isDone = doneTools >= n;

                  return (
                    <div key={n} className={`${styles.toolCall} ${isVisible ? styles.toolCallVisible : ''}`}>
                      <div className={styles.toolCallLabel}>
                        <ToolTile bg={row.tileBg} color={row.tileColor}>
                          {row.icon}
                        </ToolTile>
                        {row.label}
                      </div>
                      {isDone ? (
                        <span
                          className={`${styles.toolCallStatus} ${styles.toolCallDone}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <IconCheck size={10} />
                          Done
                        </span>
                      ) : isVisible ? (
                        <span className={styles.spinRing} style={{ marginLeft: 0 }} />
                      ) : (
                        <span
                          className={`${styles.toolCallStatus} ${styles.toolCallPending}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <span className={styles.statusHollow} />
                          Pending
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PHASE 2: NOTES OVERVIEW (crossfades in under the exiting chat) ── */}
      {showOverview && (
        <div className={styles.notesOverviewRoot}>
          {/* Header */}
          <div className={`${styles.notesHeader} ${styles.enterDown}`}>
            <div className={styles.notesTitle}>
              <IconFileText size={14} style={{ color: '#7C3AED' }} />
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
                <IconPlus size={10} /> New Note
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className={`${styles.notesSearchRow} ${styles.enterDown}`} style={{ animationDelay: '0.07s' }}>
            <div className={styles.notesSearchInputWrapper}>
              <IconSearch size={13} style={{ color: '#9CA3AF', flexShrink: 0 }} />
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
            {/* NEW NOTE: created by the tool calls above */}
            <div className={`${styles.notesCard} ${styles.notesCardNew} ${styles.noteBorn}`}>
              <div className={styles.notesCardCornerGlow} />
              <div className={styles.notesCardHeader}>
                <div className={styles.notesCardTitleArea}>
                  <div className={styles.notesCardTitle}>Teacher&apos;s Exam Hint</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span className={`${styles.notesCardBadge} ${styles.notesCardBadgePurple}`}>CS 301</span>
                    <span
                      className={styles.notesCardBadge}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(245, 158, 11, 0.12)', color: '#D97706' }}
                    >
                      <IconStar size={9} filled />
                      Exam
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.notesCardBody}>
                Teacher emphasized 3NF &amp; BCNF decompositions for the final exam. Linked to <span className={styles.notesWikilink}>[[Normalization]]</span>.
              </div>
              <div className={styles.notesCardFooter}>
                <span>Updated just now</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#7C3AED', fontWeight: 600 }}>
                  <IconLink size={10} />
                  1 link
                </span>
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <IconLink size={10} />
                  3 links
                </span>
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <IconLink size={10} />
                  2 links
                </span>
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <IconLink size={10} />
                  4 links
                </span>
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
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#111827', display: 'inline-block' }} />
              Database Systems • 8 Nodes
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

          {/* Obsidian-style knowledge graph — circular nodes, floating labels, hairline edges */}
          <div className={styles.graphSvgContainer}>
            <svg width="100%" height="100%" viewBox="0 0 460 230" style={{ overflow: 'visible' }}>
              {/* ── Edges: hairlines draw themselves in as the graph assembles ── */}
              <line className={styles.graphEdge} pathLength={1} style={{ animationDelay: '0.3s' }} x1="142" y1="116" x2="206" y2="28" stroke="#E2E8F0" strokeWidth="1.5" />
              <line className={styles.graphEdge} pathLength={1} style={{ animationDelay: '0.36s' }} x1="142" y1="116" x2="36" y2="122" stroke="#E2E8F0" strokeWidth="1.5" />
              <line className={styles.graphEdge} pathLength={1} style={{ animationDelay: '0.45s' }} x1="142" y1="116" x2="270" y2="66" stroke="#E2E8F0" strokeWidth="1.5" />
              <line className={styles.graphEdge} pathLength={1} style={{ animationDelay: '0.58s' }} x1="270" y1="66" x2="398" y2="90" stroke="#E2E8F0" strokeWidth="1.5" />
              <line className={styles.graphEdge} pathLength={1} style={{ animationDelay: '0.7s' }} x1="270" y1="66" x2="64" y2="52" stroke="#E2E8F0" strokeWidth="1.5" />
              <line className={styles.graphEdge} pathLength={1} style={{ animationDelay: '0.78s' }} x1="142" y1="116" x2="58" y2="178" stroke="#E2E8F0" strokeWidth="1.5" />

              {/* Accent connection: Normalization → new note (base + streaming energy) */}
              <line className={styles.graphEdge} pathLength={1} style={{ animationDelay: '0.95s' }} x1="270" y1="66" x2="326" y2="158" stroke="#E2E8F0" strokeWidth="1.5" />
              <line className={styles.energyParticleLate} x1="270" y1="66" x2="326" y2="158" stroke="#D97706" strokeWidth="2" strokeDasharray="4,10" strokeLinecap="round" />

              {/* ── Faint satellite dots: the wider course graph continues ── */}
              <circle className={styles.graphNode} style={{ animationDelay: '0.3s', transformBox: 'fill-box', transformOrigin: 'center' }} cx="206" cy="28" r="4.5" fill="#CBD5E1" />
              <circle className={styles.graphNode} style={{ animationDelay: '0.36s', transformBox: 'fill-box', transformOrigin: 'center' }} cx="36" cy="122" r="4" fill="#CBD5E1" />
              <circle className={styles.graphNode} style={{ animationDelay: '0.58s', transformBox: 'fill-box', transformOrigin: 'center' }} cx="398" cy="90" r="4" fill="#CBD5E1" />

              {/* Hub: Database Systems (course) — sized by connections, Obsidian-style */}
              <g className={styles.graphNode} style={{ animationDelay: '0.15s', transformBox: 'fill-box', transformOrigin: 'center' }}>
                <circle cx="142" cy="116" r="13.5" fill="#111827" />
                <text x="142" y="144" textAnchor="middle" fontSize="10" fontWeight="700" fill="#111827" className={styles.graphLabel}>
                  Database Systems
                </text>
              </g>

              {/* Topic: Normalization — soft halo marks it as this view's focus */}
              <g className={styles.graphNode} style={{ animationDelay: '0.45s', transformBox: 'fill-box', transformOrigin: 'center' }}>
                <circle cx="270" cy="66" r="15.5" fill="none" stroke="#4F46E5" strokeWidth="5" opacity="0.14" />
                <circle cx="270" cy="66" r="10.5" fill="#4F46E5" />
                <text x="270" y="92" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#4F46E5" className={styles.graphLabel}>
                  Normalization
                </text>
              </g>

              {/* Related notes */}
              <g className={styles.graphNode} style={{ animationDelay: '0.7s', transformBox: 'fill-box', transformOrigin: 'center' }}>
                <circle cx="64" cy="52" r="8" fill="#94A3B8" />
                <text x="64" y="74" textAnchor="middle" fontSize="9" fontWeight="500" fill="#64748B" className={styles.graphLabel}>
                  Functional Dependencies
                </text>
              </g>

              <g className={styles.graphNode} style={{ animationDelay: '0.78s', transformBox: 'fill-box', transformOrigin: 'center' }}>
                <circle cx="58" cy="178" r="7.5" fill="#94A3B8" />
                <text x="58" y="198" textAnchor="middle" fontSize="9" fontWeight="500" fill="#64748B" className={styles.graphLabel}>
                  ACID Properties
                </text>
              </g>

              {/* NEW NOTE: created by the AI tool calls above */}
              <g className={styles.graphNode} style={{ animationDelay: '0.95s', transformBox: 'fill-box', transformOrigin: 'center' }}>
                <circle className={styles.pulseRingSm} cx="326" cy="158" r="11" fill="none" stroke="#D97706" strokeWidth="1.5" />
                <circle cx="326" cy="158" r="9" fill="#D97706" />
                <text x="326" y="182" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#B45309" className={styles.graphLabel}>
                  Teacher&apos;s Exam Hint
                </text>
                <rect x="344" y="151" width="30" height="14" rx="7" fill="#111827" />
                <text x="359" y="160.5" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#FFFFFF">NEW</text>
              </g>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
