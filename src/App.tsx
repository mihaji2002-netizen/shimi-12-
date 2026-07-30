import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import './App.css'
import {
  CHAPTER_NAME,
  OFFICIAL_BAROM,
  SLOTS,
  TOTAL_SCORE,
  type ChapterId,
  type SlotPrediction,
} from './data/predictions'

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
        <span>صفحه {toFa(page)} از {toFa(3)}</span>
        <span>پاسخبرگ</span>
      </header>
      <div className="sheet-rows">
        {rows.map((slot) => (
          <button
            key={slot.n}
            type="button"
            className={`sheet-row ${selected === slot.n ? 'active' : ''}`}
            onClick={() => onSelect(slot.n)}
          >
            <div className="col-num">{toFa(slot.n)}</div>
            <div className="col-body">
              <div className="part-labels">
                {slot.labels.map((l) => (
                  <span key={l}>({l})</span>
                ))}
              </div>
              <div className="row-hint">{slot.style}</div>
            </div>
            <div className="col-score">{toFa(slot.score)}</div>
          </button>
        ))}
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
  return (
    <motion.aside
      className="predict-panel"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
    >
      <div className="predict-top">
        <div>
          <div className="predict-kicker">حدس ردیف {toFa(slot.n)}</div>
          <h2>
            {toFa(slot.score)} نمره · {slot.labels.map((l) => `(${l})`).join(' ')}
          </h2>
        </div>
        <button type="button" className="btn-close" onClick={onClose}>
          بستن
        </button>
      </div>

      <div className="block style-block">
        <div className="block-label">سبک سوال</div>
        <div className="style-name">{slot.style}</div>
        <div className="meter">
          <i style={{ width: `${slot.styleChance}%` }} />
        </div>
        <div className="meter-cap">احتمال سبک حدود {toFa(slot.styleChance)}٪</div>
      </div>

      <div className="block">
        <div className="block-label">مباحث محتمل</div>
        <ul className="topic-list">
          {slot.topics.map((t) => (
            <li key={t.name}>
              <div className="topic-main">
                <strong>{t.name}</strong>
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
        <div className="block-label">از کجا میگم؟</div>
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

export default function App() {
  const [selected, setSelected] = useState<number | null>(null)
  const slot = SLOTS.find((s) => s.n === selected) ?? null

  const chapterMix = useMemo(() => {
    const map = new Map<ChapterId, number>()
    for (const s of SLOTS) {
      const top = s.topics[0]
      if (!top) continue
      map.set(top.chapter, (map.get(top.chapter) ?? 0) + s.score)
    }
    return ([1, 2, 3, 4] as ChapterId[]).map((id) => ({
      id,
      guessed: map.get(id) ?? 0,
      official: OFFICIAL_BAROM[id],
      name: CHAPTER_NAME[id],
    }))
  }, [])

  return (
    <div className="app">
      <div className="orb a" />
      <div className="orb b" />

      <main className="shell">
        <header className="hero">
          <p className="kicker">پیش‌بینی پاسخبرگ خالی</p>
          <h1>شیمی‌حدس</h1>
          <p className="lead">
            روی هر ردیف بزن. برات می‌گم احتمالاً <b>چه سبکی</b>ه و از{' '}
            <b>کدوم مبحث</b>ه — با توجه به نمره همون ردیف و الگوی نهایی‌های ۹۸ تا ۱۴۰۴
            (خرداد، شهریور، دی).
          </p>
          <div className="meta">
            <span>
              <b>{toFa(16)}</b> ردیف
            </span>
            <span>
              <b>{toFa(TOTAL_SCORE)}</b> نمره
            </span>
            <span>
              <b>۹۸→۱۴۰۴</b> الگوی سال‌ها
            </span>
          </div>
        </header>

        <div className={`layout ${slot ? 'with-panel' : ''}`}>
          <div className="sheets">
            <SheetPage
              page={1}
              slots={SLOTS}
              selected={selected}
              onSelect={setSelected}
            />
            <SheetPage
              page={2}
              slots={SLOTS}
              selected={selected}
              onSelect={setSelected}
            />
            <SheetPage
              page={3}
              slots={SLOTS}
              selected={selected}
              onSelect={setSelected}
            />
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

        {!slot && (
          <p className="hint">یه ردیف از پاسخبرگ رو لمس کن تا حدس سبک و مبحثش بیاد بالا.</p>
        )}

        <section className="barom">
          <h3>اگه مبحثِ اول هر ردیف درست باشه، بارم فصل‌ها تقریباً اینه</h3>
          <div className="barom-grid">
            {chapterMix.map((c) => (
              <div key={c.id} className="barom-card">
                <div className="barom-name">{c.name}</div>
                <div className="barom-nums">
                  حدس ≈ {toFa(c.guessed)} · رسمی {toFa(c.official)}
                </div>
              </div>
            ))}
          </div>
          <p className="foot-note">
            نمره و قسمت‌های هر ردیف از پاسخبرگ خودته و قطعه. سبک و مبحث حدسه — از روی تکرار
            همه‌ی نهایی‌های اخیر، نه فقط ۱۴۰۳ و ۱۴۰۴.
          </p>
        </section>
      </main>
    </div>
  )
}
