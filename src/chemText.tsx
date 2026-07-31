import type { ReactNode } from 'react'

/** Wrap [[...]] segments as LTR chemistry formulas so RTL doesn't scramble them. */
export function ChemText({ text }: { text: string }) {
  const parts = text.split(/(\[\[[\s\S]*?\]\])/g)
  const nodes: ReactNode[] = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part) continue
    if (part.startsWith('[[') && part.endsWith(']]')) {
      const inner = part.slice(2, -2)
      nodes.push(
        <span key={i} className="chem" dir="ltr">
          {inner}
        </span>,
      )
    } else {
      nodes.push(
        <span key={i} className="chem-plain">
          {part}
        </span>,
      )
    }
  }

  return <>{nodes}</>
}
