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
      answered: values.filter(Boolean).length,
    }
  }, [votes])

  const startQuiz = () => {
    setScreen('quiz')
    setIndex(0)
    setShowAnswer(false)
  }

  const goNext = () => {
    if (index >= QUESTIONS.length - 1) {
      setScreen('summary')
      return
    }
    setIndex((i) => i + 1)
    setShowAnswer(false)
  }

  const goPrev = () => {
    if (index === 0) return
    setIndex((i) => i - 1)
    setShowAnswer(false)
  }

  const castVote = (vote: Vote) => {
    setVotes((prev) => ({ ...prev, [question.id]: vote }))
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
            <div className="hero-kicker">امتحان نهایی شیمی دوازدهم</div>
            <h1 className="hero-brand">شیمی‌حدس</h1>
            <p className="hero-lead">
              اسکلت پاسخبرگ را خواندم: {toPersianDigits(ANSWER_SHEET.questionCount)} سوال و{' '}
              {toPersianDigits(ANSWER_SHEET.totalScore)} نمره. حالا سوال‌به‌سوال حدس می‌زنیم محتوا
              چی می‌آید — با الگوی نهایی‌های گذشته و کتاب شیمی ۳.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" type="button" onClick={startQuiz}>
                شروع حدس {toPersianDigits(16)} سوالی
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  setScreen('summary')
                }}
              >
                اسکلت پاسخبرگ
              </button>
            </div>
            <div className="hero-meta">
              <div>
                <strong>{toPersianDigits(QUESTIONS.length)}</strong>
                ردیف پاسخبرگ
              </div>
              <div>
                <strong>{toPersianDigits(TOTAL_SCORE)}</strong>
                نمره کل
              </div>
              <div>
                <strong>{toPersianDigits(3)} صفحه</strong>
                اسکلت خوانده‌شده
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
                    سوال {toPersianDigits(index + 1)} از {toPersianDigits(QUESTIONS.length)}
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
                  <span className="chip chip-strong">سوال {toPersianDigits(question.examSlot)}</span>
                  <span className="chip chip-gold">{toPersianDigits(question.score)} نمره</span>
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
                  <span>احتمال محتوا {toPersianDigits(question.confidence)}٪</span>
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
                    <h3>چرا این حدس؟</h3>
                    <p>{question.why}</p>
                    <div className="years">
                      {question.pastYears.map((year) => (
                        <span className="year-tag" key={year}>
                          {year}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="detail-block">
                    <h3>قبل امتحان این‌ها را مرور کن</h3>
                    <ul>
                      {question.studyTips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {showAnswer ? (
                  <motion.div
                    className="answer-box"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <h3>پاسخبرگ احتمالی</h3>
                    <p>{question.likelyAnswer}</p>
                  </motion.div>
                ) : (
                  <div className="vote-row">
                    <button className="btn btn-ghost" type="button" onClick={() => setShowAnswer(true)}>
                      نمایش پاسخبرگ احتمالی
                    </button>
                  </div>
                )}

                <div className="vote-row">
                  <button
                    type="button"
                    className={`vote ${votes[question.id] === 'likely' ? 'active-likely' : ''}`}
                    onClick={() => castVote('likely')}
                  >
                    محتمل می‌دانم
                  </button>
                  <button
                    type="button"
                    className={`vote ${votes[question.id] === 'unlikely' ? 'active-unlikely' : ''}`}
                    onClick={() => castVote('unlikely')}
                  >
                    بعید می‌دانم
                  </button>
                </div>

                <div className="nav-row">
                  <button className="btn btn-ghost" type="button" onClick={goPrev} disabled={index === 0}>
                    سوال قبلی
                  </button>
                  <button className="btn btn-primary" type="button" onClick={goNext}>
                    {index === QUESTIONS.length - 1 ? 'جمع‌بندی نهایی' : 'سوال بعدی'}
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
                بازگشت
              </button>
            </div>

            <h1>نقشه حدس امتحان</h1>
            <p>
              نمره و تعداد قسمت‌های هر سوال از پاسخبرگ ارسالی قفل شده است (
              {toPersianDigits(16)} سوال، {toPersianDigits(20)} نمره). متن سوال‌ها در برگه پاک
              شده بود؛ محتوای هر ردیف را از الگوی نهایی‌های گذشته حدس زده‌ایم.
            </p>

            <div className="stats">
              <div className="stat">
                <b>{toPersianDigits(QUESTIONS.length)}</b>
                <span>سوال حدس‌زده</span>
              </div>
              <div className="stat">
                <b>{toPersianDigits(TOTAL_SCORE)}</b>
                <span>مجموع نمره</span>
              </div>
              <div className="stat">
                <b>{toPersianDigits(voteStats.likely)}</b>
                <span>محتمل از نظر تو</span>
              </div>
              <div className="stat">
                <b>{toPersianDigits(voteStats.unlikely)}</b>
                <span>بعید از نظر تو</span>
              </div>
            </div>

            <div className="chapter-bars">
              {chapterCoverage.map((ch) => (
                <div className="chapter-row" key={ch.id}>
                  <div className="name">
                    فصل {toPersianDigits(ch.id)} · {ch.name}
                  </div>
                  <div className="meta">
                    {toPersianDigits(ch.predictedScore)} / {toPersianDigits(ch.score)} نمره ·{' '}
                    {toPersianDigits(ch.count)} سوال
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
                    setScreen('quiz')
                  }}
                >
                  <div className="num">{toPersianDigits(q.examSlot)}</div>
                  <div>
                    <div className="title">{q.title}</div>
                    <div className="sub">
                      {toPersianDigits(q.score)} نمره · قسمت‌ها:{' '}
                      {q.partLabels.map((l) => `(${l})`).join(' ')} · فصل{' '}
                      {toPersianDigits(q.chapter)}
                    </div>
                  </div>
                  <div className="vote-badge sub">
                    {votes[q.id] === 'likely'
                      ? 'محتمل'
                      : votes[q.id] === 'unlikely'
                        ? 'بعید'
                        : 'بدون رأی'}
                  </div>
                </button>
              ))}
            </div>

            <p className="note">
              از پاسخبرگ: شماره سوال، بارم، و برچسب قسمت‌ها (الف/ب/پ/ت و آ/ب/پ/ت) خوانده شد.
              چون متن سوال‌ها سفید شده بود، عنوان و محتوای هر ردیف حدسی است — نه قطعی. اگر صفحه
              اول سوالات (نه فقط پاسخبرگ خالی) را هم بفرستی، حدس محتوا دقیق‌تر می‌شود.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary" type="button" onClick={startQuiz}>
                دوباره از سوال ۱
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
