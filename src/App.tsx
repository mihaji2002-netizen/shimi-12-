import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import './App.css'
import { ChemText } from './chemText'
import {
  PRACTICE_EXAMS,
  type ExamLevel,
  type PracticeQuestion,
} from './data/practiceExams'
import {
  CHAPTER_FULL,
  CHAPTER_KEY_TOPICS,
  CHAPTER_NAME,
  SLOTS,
  TOTAL_SCORE,
  type ChapterId,
  type SlotPrediction,
} from './data/predictions'

type Mode = 'home' | 'predict' | 'exam'

function toFa(value: number | string) {
  return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}

function SheetPage({
  page,
  slots,
  selected,
  onSelect,
}: {
  page: 1 | 2 | 3
  slots: SlotPrediction[]
  selected: number | null
  onSelect: (n: number) => void
}) {
  const rows = slots.filter((s) => s.page === page)
  return (
    <section className="sheet-page">
      <header className="sheet-page-head">
        <span>صفحه {toFa(page)} از ۳</span>
        <span>پاسخبرگ</span>
      </header>
      <div className="sheet-rows">
        {rows.map((slot) => {
          const mainTopic = slot.topics[0]
          return (
            <button
              key={slot.n}
              type="button"
              className={`sheet-row ${selected === slot.n ? 'active' : ''}`}
              onClick={() => onSelect(slot.n)}
            >
              <div className="col-num">{toFa(slot.n)}</div>
              <div className="col-body">
                <div className="row-title">{slot.style}</div>
                <div className="row-sub">
                  {mainTopic ? `مبحث اصلی: ${mainTopic.name}` : ''}
                </div>
                <div className="part-labels">
                  قسمت‌ها: {slot.labels.map((l) => `(${l})`).join(' ')}
                </div>
              </div>
              <div className="col-score">
                <b>{toFa(slot.score)}</b>
                <small>نمره</small>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function PredictionPanel({
  slot,
  onClose,
}: {
  slot: SlotPrediction
  onClose: () => void
}) {
  const main = slot.topics[0]
  return (
    <motion.aside
      className="predict-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
    >
      <div className="predict-top">
        <div>
          <div className="predict-kicker">سوال شماره {toFa(slot.n)}</div>
          <h2>
            {toFa(slot.score)} نمره · {toFa(slot.labels.length)} قسمت
          </h2>
        </div>
        <button type="button" className="btn-close" onClick={onClose}>
          بستن
        </button>
      </div>

      <div className="block style-block">
        <div className="block-label">۱) سبک این سوال چیه؟</div>
        <div className="style-name">{slot.style}</div>
        <p className="plain">{slot.styleExplain}</p>
        <div className="example-box">
          <strong>مثال شبیه نهایی:</strong>
          <span>{slot.example}</span>
        </div>
        <div className="meter">
          <i style={{ width: `${slot.styleChance}%` }} />
        </div>
        <div className="meter-cap">
          چقدر به این سبک مطمئنیم: حدود {toFa(slot.styleChance)}٪
        </div>
      </div>

      <div className="block">
        <div className="block-label">۲) از کدوم مبحثه؟</div>
        {main && (
          <div className="main-topic">
            <div className="main-badge">مبحث اصلی</div>
            <strong>{main.name}</strong>
            <span>
              {CHAPTER_FULL[main.chapter]} · حدود {toFa(main.chance)}٪
            </span>
          </div>
        )}
        <ul className="topic-list">
          {slot.topics.map((t, idx) => (
            <li key={t.name}>
              <div className="topic-main">
                <strong>
                  {idx === 0 ? 'اولویت ۱: ' : `اولویت ${toFa(idx + 1)}: `}
                  {t.name}
                </strong>
                <span>{toFa(t.chance)}٪</span>
              </div>
              <div className="topic-sub">{CHAPTER_NAME[t.chapter]}</div>
              <div className="meter thin">
                <i style={{ width: `${t.chance}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="block why-block">
        <div className="block-label">۳) چرا اینو می‌گیم؟</div>
        <p>{slot.why}</p>
        <div className="year-row">
          {slot.years.map((y) => (
            <span key={y}>{y}</span>
          ))}
        </div>
      </div>
    </motion.aside>
  )
}

function ExamView({
  level,
  onBack,
}: {
  level: ExamLevel
  onBack: () => void
}) {
  const exam = PRACTICE_EXAMS.find((e) => e.id === level)!
  const [index, setIndex] = useState(0)
  const [showAnswers, setShowAnswers] = useState(false)
  const q: PracticeQuestion = exam.questions[index]
  const progress = ((index + 1) / exam.questions.length) * 100

  return (
    <section className="exam-wrap">
      <div className="exam-topbar">
        <button type="button" className="btn-close" onClick={onBack}>
          بازگشت
        </button>
        <div className="exam-top-title">
          <b>{exam.title}</b>
          <span>{exam.badge}</span>
        </div>
        <div className="exam-progress-label">
          {toFa(index + 1)} / {toFa(exam.questions.length)}
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <article className="exam-card">
        <div className="exam-q-head">
          <span className="chip">سوال {toFa(q.n)}</span>
          <span className="chip gold">{toFa(q.score)} نمره</span>
          <span className="chip">{toFa(q.parts.length)} قسمت</span>
        </div>
        <h2>{q.title}</h2>
        <p className="exam-intro">
          <ChemText text={q.intro} />
        </p>

        <ol className="exam-parts">
          {q.parts.map((p) => (
            <li key={p.label}>
              <div className="part-q">
                <b>({p.label})</b> <ChemText text={p.text} />
              </div>
              {showAnswers && (
                <div className="part-a">
                  <strong>جواب:</strong> <ChemText text={p.answer} />
                </div>
              )}
            </li>
          ))}
        </ol>

        <div className="exam-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowAnswers((v) => !v)}
          >
            {showAnswers ? 'پنهان کردن جواب' : 'دیدن جواب این سوال'}
          </button>
          <div className="exam-nav">
            <button
              type="button"
              className="btn-secondary"
              disabled={index === 0}
              onClick={() => {
                setIndex((i) => i - 1)
                setShowAnswers(false)
              }}
            >
              قبلی
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (index >= exam.questions.length - 1) {
                  onBack()
                  return
                }
                setIndex((i) => i + 1)
                setShowAnswers(false)
              }}
            >
              {index >= exam.questions.length - 1 ? 'تموم' : 'بعدی'}
            </button>
          </div>
        </div>
      </article>
    </section>
  )
}

export default function App() {
  const [mode, setMode] = useState<Mode>('home')
  const [examLevel, setExamLevel] = useState<ExamLevel>('easy')
  const [selected, setSelected] = useState<number | null>(1)
  const slot = SLOTS.find((s) => s.n === selected) ?? null
  const chapters = ([1, 2, 3, 4] as ChapterId[]).map((id) => ({
    id,
    name: CHAPTER_FULL[id],
    topics: CHAPTER_KEY_TOPICS[id],
  }))

  if (mode === 'exam') {
    return (
      <div className="app">
        <main className="shell">
          <ExamView level={examLevel} onBack={() => setMode('home')} />
        </main>
      </div>
    )
  }

  if (mode === 'predict') {
    return (
      <div className="app">
        <main className="shell">
          <div className="subnav">
            <button type="button" className="btn-close" onClick={() => setMode('home')}>
              صفحه اول
            </button>
            <h1 className="subnav-title">حدس پاسخبرگ</h1>
          </div>

          <div className={`layout ${slot ? 'with-panel' : ''}`}>
            <div className="sheets">
              <SheetPage page={1} slots={SLOTS} selected={selected} onSelect={setSelected} />
              <SheetPage page={2} slots={SLOTS} selected={selected} onSelect={setSelected} />
              <SheetPage page={3} slots={SLOTS} selected={selected} onSelect={setSelected} />
            </div>
            <AnimatePresence mode="wait">
              {slot && (
                <PredictionPanel
                  key={slot.n}
                  slot={slot}
                  onClose={() => setSelected(null)}
                />
              )}
            </AnimatePresence>
          </div>

          <section className="barom">
            <h3>جمع‌بندی فصل‌ها · مباحث مهم</h3>
            <div className="barom-grid">
              {chapters.map((c) => (
                <div key={c.id} className="barom-card">
                  <div className="barom-name">{c.name}</div>
                  <ul className="chapter-topics">
                    {c.topics.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <main className="shell home-shell">
        <header className="hero">
          <motion.div
            className="hero-brand"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <motion.img
              className="brand-logo"
              src={`${import.meta.env.BASE_URL}pepsinogen-logo.webp`}
              alt="لوگوی پپسینوژن"
              width={168}
              height={168}
              initial={{ scale: 0.86, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 160, damping: 16 }}
            />
            <div className="brand-copy">
              <p className="brand-name">پپسینوژن</p>
              <h1>پیش‌بینی امتحان نهایی شیمی ۱۲ام</h1>
              <p className="lead">
                پاسخبرگ خالی شیمی دوازدهم رو حدس بزن، بعد با آزمون ساده و سخت
                خودت رو آماده کن.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="meta hero-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <span>
              <b>{toFa(16)}</b> سوال
            </span>
            <span>
              <b>{toFa(TOTAL_SCORE)}</b> نمره
            </span>
            <span>
              الگو از <b>۹۸ تا ۱۴۰۴</b>
            </span>
          </motion.div>

          <motion.a
            className="channel-banner"
            href="https://t.me/pepsinogenacademy"
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <span className="channel-pulse" aria-hidden />
            <div className="channel-copy">
              <strong>ورود به کانال پپسینوژن</strong>
              <span>
                کانال رو پیگیری کن؛ یه سوپرایز خفن برای بعد از امتحان شیمی تا
                کنکور داریم.
              </span>
            </div>
            <span className="channel-cta">t.me/pepsinogenacademy</span>
          </motion.a>
        </header>

        <section className="home-grid">
          <button type="button" className="home-card" onClick={() => setMode('predict')}>
            <div className="home-card-badge">قدم ۱</div>
            <h2>حدس پاسخبرگ</h2>
            <p>روی هر شماره بزن تا بگه سبک سوال چیه و از کدوم مبحثه.</p>
          </button>

          {PRACTICE_EXAMS.map((exam) => (
            <button
              key={exam.id}
              type="button"
              className={`home-card ${exam.id === 'hard' ? 'hard' : 'easy'}`}
              onClick={() => {
                setExamLevel(exam.id)
                setMode('exam')
              }}
            >
              <div className="home-card-badge">{exam.badge}</div>
              <h2>{exam.title}</h2>
              <p>{exam.blurb}</p>
              <span className="home-card-tip">{exam.tip}</span>
            </button>
          ))}
        </section>

        <footer className="home-sign">
          <span className="sign-line">با عشق برای بچه‌های پپسینوژن</span>
          <div className="dr-sign">
            <span className="dr-name">Dr.haji</span>
            <span className="dr-heart" aria-label="قلب">
              ♥
            </span>
          </div>
        </footer>
      </main>
    </div>
  )
}
