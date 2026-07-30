import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import './App.css'
import {
  ANSWER_SHEET,
  CHAPTERS,
  QUESTIONS,
  TOTAL_SCORE,
  type ChapterId,
} from './data/questions'

type Screen = 'hero' | 'quiz' | 'summary'
type Vote = 'likely' | 'unlikely' | null

function MoleculeArt() {
  return (
    <div className="molecule-plane" aria-hidden>
      <svg viewBox="0 0 420 220" fill="none">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3DD6C3" />
            <stop offset="100%" stopColor="#F0C75E" />
          </linearGradient>
        </defs>
        <path
          d="M70 120 C120 40, 180 40, 230 110 S340 190, 390 120"
          stroke="url(#g1)"
          strokeWidth="2"
          opacity="0.55"
        />
        <circle cx="78" cy="118" r="14" fill="#3DD6C3" opacity="0.85" />
        <circle cx="168" cy="62" r="10" fill="#F0C75E" opacity="0.9" />
        <circle cx="248" cy="118" r="16" fill="#7EE0D0" opacity="0.8" />
        <circle cx="328" cy="168" r="11" fill="#7EB8E8" opacity="0.85" />
        <circle cx="392" cy="118" r="9" fill="#E89B7B" opacity="0.9" />
        <line x1="78" y1="118" x2="168" y2="62" stroke="#E8F6F3" strokeOpacity="0.35" strokeWidth="2" />
        <line x1="168" y1="62" x2="248" y2="118" stroke="#E8F6F3" strokeOpacity="0.35" strokeWidth="2" />
        <line x1="248" y1="118" x2="328" y2="168" stroke="#E8F6F3" strokeOpacity="0.35" strokeWidth="2" />
        <line x1="328" y1="168" x2="392" y2="118" stroke="#E8F6F3" strokeOpacity="0.35" strokeWidth="2" />
      </svg>
    </div>
  )
}

function toPersianDigits(value: number | string) {
  return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('hero')
  const [index, setIndex] = useState(0)
  const [votes, setVotes] = useState<Record<number, Vote>>({})
  const [showAnswer, setShowAnswer] = useState(false)
  const [openReview, setOpenReview] = useState<Record<string, boolean>>({})
  const [showReviewAnswer, setShowReviewAnswer] = useState<Record<string, boolean>>({})

  const question = QUESTIONS[index]
  const progress = ((index + (screen === 'summary' ? 1 : 0)) / QUESTIONS.length) * 100

  const chapterCoverage = useMemo(() => {
    const map = new Map<ChapterId, { score: number; count: number }>()
    for (const q of QUESTIONS) {
      const prev = map.get(q.chapter) ?? { score: 0, count: 0 }
      map.set(q.chapter, {
        score: prev.score + q.score,
        count: prev.count + 1,
      })
    }
    return ([1, 2, 3, 4] as ChapterId[]).map((id) => ({
      id,
      ...CHAPTERS[id],
      predictedScore: map.get(id)?.score ?? 0,
      count: map.get(id)?.count ?? 0,
    }))
  }, [])

  const voteStats = useMemo(() => {
    const values = Object.values(votes)
    return {
      likely: values.filter((v) => v === 'likely').length,
      unlikely: values.filter((v) => v === 'unlikely').length,
    }
  }, [votes])

  const startQuiz = () => {
    setScreen('quiz')
    setIndex(0)
    setShowAnswer(false)
    setOpenReview({})
    setShowReviewAnswer({})
  }

  const goNext = () => {
    if (index >= QUESTIONS.length - 1) {
      setScreen('summary')
      return
    }
    setIndex((i) => i + 1)
    setShowAnswer(false)
    setOpenReview({})
    setShowReviewAnswer({})
  }

  const goPrev = () => {
    if (index === 0) return
    setIndex((i) => i - 1)
    setShowAnswer(false)
    setOpenReview({})
    setShowReviewAnswer({})
  }

  const castVote = (vote: Vote) => {
    setVotes((prev) => ({ ...prev, [question.id]: vote }))
  }

  const toggleReview = (key: string) => {
    setOpenReview((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="app">
      <div className="orb orb-a" />
      <div className="orb orb-b" />

      <AnimatePresence mode="wait">
        {screen === 'hero' && (
          <motion.section
            key="hero"
            className="shell hero"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45 }}
          >
            <MoleculeArt />
            <div className="hero-kicker">نهایی شیمی دوازدهم</div>
            <h1 className="hero-brand">شیمی‌حدس</h1>
            <p className="hero-lead">
              پاسخبرگ خالیتو خوندم: {toPersianDigits(16)} سوال، {toPersianDigits(20)} نمره.
              خرداد ۱۴۰۴ رو هم چک کردم. حالا ردیف‌به‌ردیف حدس می‌زنیم چی میاد — و برای هر مبحث،
              عین سوال نهایی مشابه رو هم می‌ذاریم که همون‌جا مرور کنی.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" type="button" onClick={startQuiz}>
                بزن بریم · {toPersianDigits(16)} سوال
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setScreen('summary')}
              >
                اسکلت پاسخبرگ
              </button>
            </div>
            <div className="hero-meta">
              <div>
                <strong>{toPersianDigits(QUESTIONS.length)}</strong>
                ردیف برگه
              </div>
              <div>
                <strong>{toPersianDigits(TOTAL_SCORE)}</strong>
                نمره کل
              </div>
              <div>
                <strong>۱۴۰۳ + ۱۴۰۴</strong>
                سوال واقعی برای مرور
              </div>
            </div>
          </motion.section>
        )}

        {screen === 'quiz' && question && (
          <motion.section
            key="quiz"
            className="shell quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="topbar">
              <div className="brand-mini">شیمی‌حدس</div>
              <div className="progress-wrap">
                <div className="progress-label">
                  <span>
                    {toPersianDigits(index + 1)} از {toPersianDigits(QUESTIONS.length)}
                  </span>
                  <span>{toPersianDigits(Math.round(progress))}٪</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.article
                key={question.id}
                className="question-panel"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.32 }}
              >
                <div className="q-head">
                  <span className="chip chip-strong">
                    ردیف {toPersianDigits(question.examSlot)}
                  </span>
                  <span className="chip chip-gold">
                    {toPersianDigits(question.score)} نمره
                  </span>
                  <span className="chip">فصل {toPersianDigits(question.chapter)}</span>
                  <span className="chip">
                    صفحه {toPersianDigits(ANSWER_SHEET.slots[question.examSlot - 1]?.page ?? 1)}
                  </span>
                  <span className="chip">{question.type}</span>
                </div>

                <h2 className="q-title">{question.title}</h2>
                <p className="q-prompt">{question.prompt}</p>

                <div className="confidence-meter">
                  <div className="bar">
                    <i style={{ width: `${question.confidence}%` }} />
                  </div>
                  <span>احتمال حدود {toPersianDigits(question.confidence)}٪</span>
                </div>

                <ul className="parts">
                  {question.parts.map((part, i) => (
                    <li key={`${question.partLabels[i]}-${part}`}>
                      <span>({question.partLabels[i] ?? toPersianDigits(i + 1)})</span>
                      {part}
                    </li>
                  ))}
                </ul>

                <div className="details-grid">
                  <div className="detail-block">
                    <h3>چرا اینو می‌گم؟</h3>
                    <p>{question.why}</p>
                  </div>
                  <div className="detail-block">
                    <h3>اینا رو تو ذهنت داشته باش</h3>
                    <ul>
                      {question.studyTips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <section className="review-section">
                  <h3 className="review-title">مرور سوال واقعی نهایی (همین مبحث)</h3>
                  <p className="review-lead">
                    اینا از نهایی‌های گذشته‌ن — بازشون کن و همون قسمت رو این‌جا تمرین کن.
                  </p>
                  <div className="review-list">
                    {question.review.map((item) => {
                      const key = `${question.id}-${item.year}`
                      const isOpen = Boolean(openReview[key])
                      return (
                        <div className="review-card" key={key}>
                          <button
                            type="button"
                            className="review-toggle"
                            onClick={() => toggleReview(key)}
                          >
                            <span>{item.year}</span>
                            <span className="review-chevron">{isOpen ? '−' : '+'}</span>
                          </button>
                          {isOpen && (
                            <motion.div
                              className="review-body"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                            >
                              <pre className="review-text">{item.text}</pre>
                              {showReviewAnswer[key] ? (
                                <div className="review-answer">
                                  <strong>جواب:</strong> {item.answer}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-ghost review-ans-btn"
                                  onClick={() =>
                                    setShowReviewAnswer((prev) => ({ ...prev, [key]: true }))
                                  }
                                >
                                  جوابش چی بود؟
                                </button>
                              )}
                            </motion.div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>

                {showAnswer ? (
                  <motion.div
                    className="answer-box"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <h3>حدس جواب این ردیف</h3>
                    <p>{question.likelyAnswer}</p>
                  </motion.div>
                ) : (
                  <div className="vote-row">
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => setShowAnswer(true)}
                    >
                      حدس جواب این ردیف
                    </button>
                  </div>
                )}

                <div className="vote-row">
                  <button
                    type="button"
                    className={`vote ${votes[question.id] === 'likely' ? 'active-likely' : ''}`}
                    onClick={() => castVote('likely')}
                  >
                    آره محتمله
                  </button>
                  <button
                    type="button"
                    className={`vote ${votes[question.id] === 'unlikely' ? 'active-unlikely' : ''}`}
                    onClick={() => castVote('unlikely')}
                  >
                    بعید می‌دونم
                  </button>
                </div>

                <div className="nav-row">
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={goPrev}
                    disabled={index === 0}
                  >
                    قبلی
                  </button>
                  <button className="btn btn-primary" type="button" onClick={goNext}>
                    {index === QUESTIONS.length - 1 ? 'تموم · جمع‌بندی' : 'بعدی'}
                  </button>
                </div>
              </motion.article>
            </AnimatePresence>
          </motion.section>
        )}

        {screen === 'summary' && (
          <motion.section
            key="summary"
            className="shell summary"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="topbar">
              <div className="brand-mini">شیمی‌حدس</div>
              <button className="btn btn-ghost" type="button" onClick={() => setScreen('hero')}>
                برگرد
              </button>
            </div>

            <h1>نقشه حدس برگه‌ت</h1>
            <p>
              نمره و قسمت‌ها از پاسخبرگ خودت قفل شدن. محتوا رو از الگوی ۱۴۰۳ و{' '}
              <strong>خود نهایی خرداد ۱۴۰۴</strong> حدس زدم. یه نکته: ۱۴۰۴ پانزده‌سوالی بود؛
              برگه‌ت شانزده ردیفه — پس یا نوبت دیگه‌ست یا قالب جدا.
            </p>

            <div className="stats">
              <div className="stat">
                <b>{toPersianDigits(QUESTIONS.length)}</b>
                <span>ردیف حدس‌زده</span>
              </div>
              <div className="stat">
                <b>{toPersianDigits(TOTAL_SCORE)}</b>
                <span>جمع نمره</span>
              </div>
              <div className="stat">
                <b>{toPersianDigits(voteStats.likely)}</b>
                <span>گفتی محتمله</span>
              </div>
              <div className="stat">
                <b>{toPersianDigits(voteStats.unlikely)}</b>
                <span>گفتی بعیده</span>
              </div>
            </div>

            <div className="chapter-bars">
              {chapterCoverage.map((ch) => (
                <div className="chapter-row" key={ch.id}>
                  <div className="name">
                    فصل {toPersianDigits(ch.id)} · {ch.name}
                  </div>
                  <div className="meta">
                    حدود {toPersianDigits(ch.predictedScore)} نمره حدسی · بارم رسمی{' '}
                    {toPersianDigits(ch.score)} · {toPersianDigits(ch.count)} سوال
                  </div>
                  <div className="track">
                    <i
                      style={{
                        width: `${Math.min(100, (ch.predictedScore / ch.score) * 100)}%`,
                        background: ch.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="slot-list">
              {QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  className="slot-item"
                  onClick={() => {
                    setIndex(q.examSlot - 1)
                    setShowAnswer(false)
                    setOpenReview({})
                    setShowReviewAnswer({})
                    setScreen('quiz')
                  }}
                >
                  <div className="num">{toPersianDigits(q.examSlot)}</div>
                  <div>
                    <div className="title">{q.title}</div>
                    <div className="sub">
                      {toPersianDigits(q.score)} نمره ·{' '}
                      {q.partLabels.map((l) => `(${l})`).join(' ')} ·{' '}
                      {toPersianDigits(q.review.length)} سوال واقعی برای مرور
                    </div>
                  </div>
                  <div className="vote-badge sub">
                    {votes[q.id] === 'likely'
                      ? 'محتمل'
                      : votes[q.id] === 'unlikely'
                        ? 'بعید'
                        : '—'}
                  </div>
                </button>
              ))}
            </div>

            <p className="note">{ANSWER_SHEET.note}</p>

            <div className="hero-actions">
              <button className="btn btn-primary" type="button" onClick={startQuiz}>
                از اول
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setScreen('hero')}>
                صفحه اول
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
