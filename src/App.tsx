import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import './App.css'
import {
  CHAPTER_FULL,
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
            {toFa(slot.score)} نمره · {slot.labels.length} قسمت
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

export default function App() {
  const [selected, setSelected] = useState<number | null>(1)
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
      name: CHAPTER_FULL[id],
    }))
  }, [])

  return (
    <div className="app">
      <main className="shell">
        <header className="hero">
          <p className="kicker">پیش‌بینی پاسخبرگ خالی شیمی دوازدهم</p>
          <h1>شیمی‌حدس</h1>
          <p className="lead">
            این همون پاسخبرگ خالیه که فرستادی. روی هر شماره بزن تا واضح بگیم:
            <br />
            <b>این سوال چه جوریه</b> و <b>از کدوم مبحث کتابه</b>.
          </p>
          <div className="meta">
            <span>
              <b>{toFa(16)}</b> سوال
            </span>
            <span>
              <b>{toFa(TOTAL_SCORE)}</b> نمره کل
            </span>
            <span>
              الگو از نهایی‌های <b>۹۸ تا ۱۴۰۴</b>
            </span>
          </div>
        </header>

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

        {!slot && (
          <p className="hint">یکی از شماره‌های پاسخبرگ رو انتخاب کن.</p>
        )}

        <section className="barom">
          <h3>جمع‌بندی ساده فصل‌ها (اگه مبحث اصلی هر سوال درست باشه)</h3>
          <div className="barom-grid">
            {chapterMix.map((c) => (
              <div key={c.id} className="barom-card">
                <div className="barom-name">{c.name}</div>
                <div className="barom-nums">
                  حدود {toFa(c.guessed)} نمره از این پاسخبرگ · بارم رسمی نهایی{' '}
                  {toFa(c.official)}
                </div>
              </div>
            ))}
          </div>
          <p className="foot-note">
            نمره و قسمت‌های هر سوال از پاسخبرگ خودته و قطعه. نوع سوال و مبحث رو از روی تکرار
            نهایی‌های ۹۸ تا ۱۴۰۴ حدس زدیم.
          </p>
        </section>
      </main>
    </div>
  )
}
