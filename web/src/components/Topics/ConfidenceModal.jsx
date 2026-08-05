import { useState } from 'react'

export default function ConfidenceModal({ topicTitle, onConfirm, onSkip }) {
  const [rating, setRating] = useState(3)
  const [hoverRating, setHoverRating] = useState(0)

  const handleConfirm = () => {
    onConfirm(rating)
  }

  return (
    <div className="modal-overlay open" onClick={onSkip}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
        <div className="modal-header" style={{ justifyContent: 'center' }}>
          <h2 className="modal-title">⭐ Rate Topic Mastery</h2>
        </div>

        <div style={{ margin: '1rem 0' }}>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem', fontSize: '14px', fontFamily: 'Hanken Grotesk, sans-serif' }}>
            How confident do you feel after reviewing <strong>"{topicTitle}"</strong>?
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '2rem', margin: '1.5rem 0', cursor: 'pointer' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                style={{
                  color: (hoverRating || rating) >= star ? 'var(--amber, #f59e0b)' : 'var(--outline-variant)',
                  transition: 'transform 0.1s, color 0.1s',
                  transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                ★
              </span>
            ))}
          </div>

          <div style={{ fontSize: '14px', color: 'var(--on-surface-variant)', height: '20px', fontFamily: 'Hanken Grotesk, sans-serif', fontWeight: '500' }}>
            {rating === 1 && 'Need to revisit'}
            {rating === 2 && 'Getting there'}
            {rating === 3 && 'Moderate understanding'}
            {rating === 4 && 'Strong confidence'}
            {rating === 5 && 'Mastered!'}
          </div>
        </div>

        <div className="modal-actions" style={{ justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="secondary-btn" onClick={onSkip} style={{ width: 'auto' }}>
            Skip Rating
          </button>
          <button className="primary-btn" onClick={handleConfirm} style={{ width: 'auto', background: 'var(--success)', borderColor: 'var(--success)' }}>
            ✓ Save & Complete
          </button>
        </div>
      </div>
    </div>
  )
}
