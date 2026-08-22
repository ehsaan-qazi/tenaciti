'use client';

import { useState, useEffect } from 'react';
import styles from '../HeroDemo.module.css';
import { workspaceScanSteps, studyNext, assessments, courses } from '../dummyData';
import {
  IconBookOpen,
  IconListChecks,
  IconGauge,
  IconClipboardList,
  IconTarget,
  IconFolderOpen,
  IconCheck,
  IconClock,
  IconPlus,
  IconSparkles,
} from '../icons';

/**
 * Scene 4 — "What should I study next?"
 *
 * Sequence:
 *  0.25s – 1.0s   User asks the AI
 *  1.0s – 2.8s    Tenaciti AI scans the connected workspace (courses, topics,
 *                 progress, assessments, goals, material) — each area ticks off
 *  3.3s           Morphs into the study planner surface: a priority card with
 *                 live coverage bar, evidence chips and upcoming deadlines
 *  8.3s           Hands over to next scene
 */

interface Props {
  onComplete?: () => void;
}

type Phase = 'user' | 'scanning' | 'reveal';

const SCAN_ICONS: Record<string, { Comp: typeof IconBookOpen; bg: string; color: string }> = {
  courses: { Comp: IconBookOpen, bg: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' },
  topics: { Comp: IconListChecks, bg: 'rgba(34, 197, 94, 0.12)', color: '#16A34A' },
  progress: { Comp: IconGauge, bg: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED' },
  assessments: { Comp: IconClipboardList, bg: 'rgba(217, 119, 6, 0.12)', color: '#D97706' },
  goals: { Comp: IconTarget, bg: 'rgba(236, 72, 153, 0.1)', color: '#DB2777' },
  materials: { Comp: IconFolderOpen, bg: 'rgba(100, 116, 139, 0.14)', color: '#475569' },
};

const ROW_STEP = 260;
const REVEAL_AT = 3300;
const COMPLETE_AT = 8300;

export default function SceneAIStudyNext({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('user');
  const [visibleRows, setVisibleRows] = useState(0);
  const [doneRows, setDoneRows] = useState(0);

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];

    t.push(setTimeout(() => setPhase('scanning'), 1000));

    workspaceScanSteps.forEach((_, i) => {
      t.push(setTimeout(() => setVisibleRows(i + 1), 1200 + i * ROW_STEP));
      t.push(setTimeout(() => setDoneRows(i + 1), 1200 + i * ROW_STEP + ROW_STEP));
    });

    t.push(setTimeout(() => setPhase('reveal'), REVEAL_AT));
    t.push(setTimeout(() => onComplete?.(), COMPLETE_AT));

    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const isChat = phase !== 'reveal';
  const isScanning = phase === 'scanning';

  // "Also on your radar" — remaining assessments with live course progress
  const radar = assessments.slice(1).map((a) => ({
    ...a,
    pct: courses.find((c) => c.code === a.courseCode)?.progress ?? 0,
  }));

  return (
    <>
      {/* ── PHASE 1–2: ASK + WORKSPACE SCAN ── */}
      {isChat && (
        <>
          <div className={styles.sceneHeader}>
            <div className={styles.sceneIcon}>
              <span className={styles.aiDot} />
            </div>
            <div className={styles.sceneTitle}>Tenaciti AI</div>
            <div className={styles.sceneSub}>Study Planner</div>
          </div>

          <div className={styles.chatArea}>
            <div className={`${styles.userBubble} ${phase === 'user' || isScanning ? styles.userBubbleVisible : ''}`}>
              What should I study next?
            </div>

            {isScanning && (
              <div className={styles.aiPanel}>
                <div className={styles.aiPanelTitle}>
                  <span className={styles.aiDot} />
                  Reviewing your semester
                </div>

                <div className={styles.scanList}>
                  {workspaceScanSteps.map((step, i) => {
                    const { Comp, bg, color } = SCAN_ICONS[step.key];
                    const isVisible = i < visibleRows;
                    const isDone = i < doneRows;

                    return (
                      <div key={step.key} className={`${styles.scanRow} ${isVisible ? styles.scanRowVisible : ''}`}>
                        <span className={styles.scanTile} style={{ background: bg, color }}>
                          <Comp size={14} />
                        </span>
                        <span className={styles.scanText}>
                          <span className={styles.scanLabel}>{step.label}</span>
                          <span className={styles.scanDetail}>{step.detail}</span>
                        </span>
                        {isDone ? (
                          <span className={styles.scanDone}>
                            <IconCheck size={11} />
                          </span>
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

      {/* ── PHASE 3: STUDY PLANNER SURFACE ── */}
      {phase === 'reveal' && (
        <div className={styles.planView}>
          <div className={styles.planHeader}>
            <div className={styles.planTitle}>Next Up</div>
            <span className={styles.planChip}>
              <IconSparkles size={11} />
              Tenaciti AI
            </span>
          </div>

          {/* Priority card */}
          <div className={styles.planHero}>
            <div className={styles.planHeroTop}>
              <span className={styles.planHeroTile}>
                <IconTarget size={18} />
              </span>
              <div className={styles.planHeroTitleWrap}>
                <div className={styles.planHeroTitle}>{studyNext.topic}</div>
                <div className={styles.planHeroCourse}>
                  {studyNext.courseName} · {studyNext.courseCode}
                </div>
              </div>
              <span className={styles.priorityChip}>Priority</span>
            </div>

            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${studyNext.progressPct}%` }} />
            </div>
            <div className={styles.progressMeta}>
              <span>{studyNext.progressPct}% complete</span>
              <span>{studyNext.topicsDone} / {studyNext.topicsTotal} topics</span>
            </div>

            <div className={styles.evidenceRow}>
              <span className={styles.evidenceChip} style={{ background: 'rgba(220, 38, 38, 0.08)', color: '#DC2626' }}>
                <IconClock size={11} />
                Quiz in 3 days
              </span>
              <span className={styles.evidenceChip} style={{ background: '#F3F4F6', color: '#4B5563' }}>
                <IconListChecks size={11} />
                {studyNext.remainingTopics} topics left
              </span>
            </div>

            <div className={styles.planReason}>
              <IconSparkles size={11} />
              {studyNext.reason}
            </div>

            <button className={styles.planCta}>
              <IconPlus size={13} />
              Add to today&apos;s plan
            </button>
          </div>

          {/* Secondary deadlines */}
          <div className={styles.radarDivider}>Also on your radar</div>

          {radar.map((item, i) => (
            <div key={item.id} className={styles.radarRow} style={{ animationDelay: `${0.25 + i * 0.15}s` }}>
              <span
                className={styles.radarTile}
                style={{
                  background: item.type === 'Exam' ? 'rgba(220, 38, 38, 0.09)' : 'rgba(124, 58, 237, 0.09)',
                  color: item.type === 'Exam' ? '#DC2626' : '#7C3AED',
                }}
              >
                <IconClipboardList size={15} />
              </span>
              <span className={styles.radarText}>
                <span className={styles.radarTitle}>{item.title}</span>
                <span className={styles.radarSub}>
                  {item.courseCode} · in {item.daysUntil} days
                </span>
              </span>
              <span className={styles.radarPct}>{item.pct}%</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
