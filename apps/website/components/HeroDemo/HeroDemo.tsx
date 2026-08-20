'use client';

import { useState, useCallback, useRef } from 'react';
import styles from './HeroDemo.module.css';

import SceneDocumentRoadmap from './scenes/SceneDocumentRoadmap';
import SceneTopicsConfidence from './scenes/SceneTopicsConfidence';
import SceneAINote from './scenes/SceneAINote';
import SceneAIStudyNext from './scenes/SceneAIStudyNext';
import SceneAIGoal from './scenes/SceneAIGoal';
import SceneAISearch from './scenes/SceneAISearch';

const SCENES = [
  { id: 0, title: 'Roadmap', component: SceneDocumentRoadmap },
  { id: 1, title: 'Topics', component: SceneTopicsConfidence },
  { id: 2, title: 'Notes', component: SceneAINote },
  { id: 3, title: 'Study', component: SceneAIStudyNext },
  { id: 4, title: 'Goals', component: SceneAIGoal },
  { id: 5, title: 'Search', component: SceneAISearch },
];

export default function HeroDemo() {
  const [activeScene, setActiveScene] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSceneComplete = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActiveScene((prev) => (prev + 1) % SCENES.length);
    }, 400);
  }, []);

  const handleSelectScene = (idx: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveScene(idx);
  };

  const handlePrevScene = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveScene((prev) => (prev - 1 + SCENES.length) % SCENES.length);
  };

  const handleNextScene = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveScene((prev) => (prev + 1) % SCENES.length);
  };

  return (
    <div
      className={styles.demoContainer}
      role="region"
      aria-label="Tenaciti Interactive Product Simulation"
    >
      <div className={styles.demoCard}>
        <div className={styles.demoTopbar} />

        {/* Floating Left/Right Navigation Arrows */}
        <button
          className={`${styles.navArrow} ${styles.navArrowLeft}`}
          onClick={handlePrevScene}
          aria-label="Previous Demo Slide"
          title="Previous Slide"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          className={`${styles.navArrow} ${styles.navArrowRight}`}
          onClick={handleNextScene}
          aria-label="Next Demo Slide"
          title="Next Slide"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className={styles.demoBody}>
          {SCENES.map((scene, idx) => {
            const Component = scene.component;
            const isActive = activeScene === idx;

            return (
              <div
                key={scene.id}
                className={`${styles.sceneWrapper} ${isActive ? styles.sceneActive : ''}`}
                aria-hidden={!isActive}
              >
                {isActive && (
                  <Component onComplete={handleSceneComplete} />
                )}
              </div>
            );
          })}
        </div>

        {/* Scene Navigation Indicator Dots */}
        <div className={styles.sceneDots}>
          {SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => handleSelectScene(idx)}
              className={`${styles.sceneDot} ${activeScene === idx ? styles.sceneDotActive : ''}`}
              title={`Jump to ${scene.title} scene`}
              aria-label={`Demo Scene ${idx + 1}: ${scene.title}`}
              style={{ border: 'none', cursor: 'pointer', padding: 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
