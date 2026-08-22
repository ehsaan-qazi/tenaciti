'use client';

import { useState, useEffect } from 'react';
import styles from '../HeroDemo.module.css';
import { goalParseSteps, newGoal, goals } from '../dummyData';
import {
  IconTarget,
  IconCalendar,
  IconGraduationCap,
  IconCheck,
  IconPlus,
  IconClock,
  IconSparkles,
  IconFlag,
} from '../icons';

/**
 * Scene 5 — "I want to finish Database Systems before Friday."
 *
 * Sequence:
 *  0.25s – 1.0s   User states the goal in plain language
 *  1.0s – 2.4s    Tenaciti AI parses intent → deadline → course (structured rows)
 *  2.9s           Morphs into the Goals page: existing goal + the newly created
 *                 goal card materializing with badges, fields and roadmap sync
 *  8.6s           Hands over to next scene
 */

interface Props {
  onComplete?: () => void;
}

type Phase = 'user' | 'parsing' | 'goals';

const PARSE_ICONS: Record<string, typeof IconTarget> = {
  intent: IconTarget,
  deadline: IconCalendar,
  course: IconGraduationCap,
};

const ROW_STEP = 300;
const REVEAL_AT = 2900;
const COMPLETE_AT = 8600;

export default function SceneAIGoal({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('user');
  const [visibleRows, setVisibleRows] = useState(0);
  const [doneRows, setDoneRows] = useState(0);

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];

    t.push(setTimeout(() => setPhase('parsing'), 1000));

    goalParseSteps.forEach((_, i) => {
      t.push(setTimeout(() => setVisibleRows(i + 1), 1500 + i * ROW_STEP));
      t.push(setTimeout(() => setDoneRows(i + 1), 1500 + i * ROW_STEP + 280));
    });

    t.push(setTimeout(() => setPhase('goals'), REVEAL_AT));
    t.push(setTimeout(() => onComplete?.(), COMPLETE_AT));

    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const isChat = phase !== 'goals';
  const isParsing = phase === 'parsing';

  // Existing goal shown for context on the Goals page
  const existingGoal = goals.find((g) => g.id === 'g3');

  return (
    <>
      {/* ── PHASE 1–2: ASK + INTENT PARSING ── */}
      {isChat && (
        <>
          <div className={styles.sceneHeader}>
            <div className={styles.sceneIcon}>
              <span className={styles.aiDot} />
            </div>
            <div className={styles.sceneTitle}>Tenaciti AI</div>
            <div className={styles.sceneSub}>Goal Setting</div>
          </div>

          <div className={styles.chatArea}>
            <div className={`${styles.userBubble} ${styles.userBubbleVisible}`}>
              I want to finish Database Systems before Friday.
            </div>

            {isParsing && (
              <div className={styles.aiPanel}>
                <div className={styles.aiPanelTitle}>
                  <span className={styles.aiDot} />
                  Turning that into a structured goal
                </div>

                <div className={styles.scanList}>
                  {goalParseSteps.map((step, i) => {
                    const Comp = PARSE_ICONS[step.key];
                    const isVisible = i < visibleRows;
                    const isDone = i < doneRows;

                    return (
                      <div key={step.key} className={`${styles.scanRow} ${isVisible ? styles.scanRowVisible : ''}`}>
                        <span
                          className={styles.scanTile}
                          style={{ background: 'rgba(124, 58, 237, 0.09)', color: '#7C3AED' }}
                        >
                          <Comp size={14} />
                        </span>
                        <span className={styles.scanText}>
                          <span className={styles.scanLabel}>{step.label}</span>
                          <span className={styles.scanDetail}>{step.value}</span>
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

      {/* ── PHASE 3: GOALS PAGE SURFACE ── */}
      {phase === 'goals' && (
        <div className={styles.goalsView}>
          <div className={styles.goalsHeader}>
            <div className={styles.planTitle}>Goals</div>
            <button className={styles.newGoalBtn}>
              <IconPlus size={11} />
              New Goal
            </button>
          </div>

          {/* Existing goal */}
          {existingGoal && (
            <div className={styles.goalCard}>
              <div className={styles.goalCardTop}>
                <span className={styles.goalCardTitle}>{existingGoal.title}</span>
                <span className={styles.badgePill} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16A34A' }}>
                  Active
                </span>
              </div>

              <div className={styles.goalProgressRow}>
                <span>Progress</span>
                <span>1 / {existingGoal.relatedItems + 1} tasks</span>
              </div>
              <div className={styles.progressTrackSm}>
                <div
                  className={styles.progressFillSm}
                  style={{ width: `${(1 / (existingGoal.relatedItems + 1)) * 100}%` }}
                />
              </div>

              <div className={styles.goalMetaBar}>
                <span className={styles.metaItem}>
                  <IconCalendar size={11} />
                  Fall 2026
                </span>
                <span className={styles.metaItem}>
                  <IconClock size={11} />
                  Wednesday
                </span>
                <span className={styles.metaItem}>
                  <IconGraduationCap size={11} />
                  1 course
                </span>
              </div>
            </div>
          )}

          {/* New AI-created goal */}
          <div className={`${styles.goalCard} ${styles.goalCardNew}`} style={{ animationDelay: '0.45s' }}>
            <div className={styles.goalCardTop}>
              <span className={styles.goalCardTitle}>{newGoal.title}</span>
              <span className={styles.goalAiTag}>
                <IconSparkles size={10} />
                Created by Tenaciti AI
              </span>
            </div>

            <div className={styles.goalBadges}>
              {newGoal.badges.map((badge, i) => (
                <span
                  key={badge}
                  className={i === 0 ? styles.badgePillGreen : styles.badgePillBlue}
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className={styles.goalFields}>
              {newGoal.fields.map((field, i) => (
                <div key={field.label} className={styles.fieldRow} style={{ animationDelay: `${0.75 + i * 0.22}s` }}>
                  <span className={styles.fieldLabel}>{field.label}</span>
                  <span className={styles.fieldValue}>{field.value}</span>
                </div>
              ))}
            </div>

            <div className={styles.goalProgressRow}>
              <span>Progress</span>
              <span>0 / {newGoal.tasksTotal} tasks</span>
            </div>
            <div className={styles.progressTrackSm}>
              <div className={styles.progressFillSm} style={{ width: '4%' }} />
            </div>

            <div className={styles.goalMetaBar}>
              <span className={styles.metaItem}>
                <IconFlag size={11} />
                Roadmap synced
              </span>
              <span className={styles.metaItem}>
                <IconClock size={11} />
                Fri, Aug 28
              </span>
              <span className={styles.metaItem}>
                <IconGraduationCap size={11} />
                CS-301
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
