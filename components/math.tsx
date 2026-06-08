'use client'

// Componente para renderizar fórmulas matemáticas con KaTeX.
import 'katex/dist/katex.min.css'
import { BlockMath, InlineMath } from 'react-katex'

export function Math({ children }: { children: string }) {
  return <InlineMath math={children} />
}

export function MathBlock({ children }: { children: string }) {
  return <BlockMath math={children} />
}
