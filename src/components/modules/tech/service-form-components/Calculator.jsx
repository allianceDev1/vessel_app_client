import React, { useCallback, useEffect, useRef, useState } from 'react'
import './calculator.scss'

const OP_SYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' }
const MAX_DIGITS = 12

const compute = (a, b, op) => {
    switch (op) {
        case '+': return a + b
        case '-': return a - b
        case '*': return a * b
        case '/': return b === 0 ? NaN : a / b
        default: return b
    }
}

// remove floating point noise (0.1 + 0.2 => 0.3)
const clean = (n) => parseFloat(n.toPrecision(12))

const format = (str) => {
    if (str === 'Error') return str
    const neg = str.startsWith('-')
    const [int, dec] = (neg ? str.slice(1) : str).split('.')
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return `${neg ? '-' : ''}${grouped}${dec !== undefined ? '.' + dec : ''}`
}

const KEYS = [
    { l: 'C', k: 'clear', t: 'fn' },
    { l: '⌫', k: 'back', t: 'fn' },
    { l: '%', k: 'percent', t: 'fn' },
    { l: '÷', k: '/', t: 'op' },
    { l: '7', k: '7' }, { l: '8', k: '8' }, { l: '9', k: '9' },
    { l: '×', k: '*', t: 'op' },
    { l: '4', k: '4' }, { l: '5', k: '5' }, { l: '6', k: '6' },
    { l: '−', k: '-', t: 'op' },
    { l: '1', k: '1' }, { l: '2', k: '2' }, { l: '3', k: '3' },
    { l: '+', k: '+', t: 'op' },
    { l: '±', k: 'sign', t: 'fn' },
    { l: '0', k: '0' },
    { l: '.', k: '.' },
    { l: '=', k: '=', t: 'eq' },
]

const INITIAL = { current: '0', prev: null, op: null, overwrite: true, expr: '' }

const Calculator = () => {
    const [state, setState] = useState(INITIAL)
    const rootRef = useRef(null)

    useEffect(() => {
        rootRef.current?.focus()
    }, [])

    const press = useCallback((key) => {
        setState((s) => {
            const isError = s.current === 'Error'
            if (isError && key !== 'clear') return s

            if (/^\d$/.test(key)) {
                if (s.overwrite) return { ...s, current: key, overwrite: false }
                if (s.current.replace(/[-.]/g, '').length >= MAX_DIGITS) return s
                return { ...s, current: s.current === '0' ? key : s.current + key }
            }

            switch (key) {
                case '.':
                    if (s.overwrite) return { ...s, current: '0.', overwrite: false }
                    if (s.current.includes('.')) return s
                    return { ...s, current: s.current + '.' }

                case 'clear':
                    return INITIAL

                case 'back':
                    if (s.overwrite) return s
                    { const next = s.current.slice(0, -1)
                      return { ...s, current: next === '' || next === '-' ? '0' : next } }

                case 'sign':
                    if (s.current === '0') return s
                    return { ...s, current: s.current.startsWith('-') ? s.current.slice(1) : '-' + s.current }

                case 'percent': {
                    const cur = parseFloat(s.current)
                    // 200 + 10 % => 200 + 20 ; otherwise value / 100
                    const val = s.prev !== null && (s.op === '+' || s.op === '-')
                        ? (s.prev * cur) / 100
                        : cur / 100
                    return { ...s, current: String(clean(val)), overwrite: true }
                }

                case '+': case '-': case '*': case '/': {
                    const cur = parseFloat(s.current)
                    // chain: 2 + 3 + => 5 +
                    if (s.prev !== null && s.op && !s.overwrite) {
                        const res = compute(s.prev, cur, s.op)
                        if (Number.isNaN(res)) return { ...INITIAL, current: 'Error' }
                        const r = clean(res)
                        return { current: String(r), prev: r, op: key, overwrite: true, expr: `${format(String(r))} ${OP_SYMBOL[key]}` }
                    }
                    return { ...s, prev: cur, op: key, overwrite: true, expr: `${format(String(cur))} ${OP_SYMBOL[key]}` }
                }

                case '=': {
                    if (s.prev === null || !s.op) return s
                    const cur = parseFloat(s.current)
                    const res = compute(s.prev, cur, s.op)
                    const expr = `${format(String(s.prev))} ${OP_SYMBOL[s.op]} ${format(String(cur))} =`
                    if (Number.isNaN(res)) return { ...INITIAL, current: 'Error', expr }
                    return { current: String(clean(res)), prev: null, op: null, overwrite: true, expr }
                }

                default:
                    return s
            }
        })
    }, [])

    const handleKeyDown = (e) => {
        const { key } = e
        if (/^\d$/.test(key) || ['+', '-', '*', '/', '.', '%'].includes(key)) {
            press(key === '%' ? 'percent' : key)
        } else if (key === 'Enter' || key === '=') {
            press('=')
        } else if (key === 'Backspace') {
            press('back')
        } else if (key === 'Escape' || key === 'Delete') {
            press('clear')
        } else {
            return
        }
        e.preventDefault()
    }

    const value = format(state.current)

    return (
        <div className="tech-calculator" ref={rootRef} tabIndex={0} onKeyDown={handleKeyDown}>
            <div className="calc-display">
                <span className="calc-expr">{state.expr || '\u00A0'}</span>
                <span className={`calc-value ${value.length > 11 ? 'small' : ''}`}>{value}</span>
            </div>
            <div className="calc-keys">
                {KEYS.map((k) => (
                    <button
                        key={k.k}
                        type="button"
                        tabIndex={-1}
                        className={`calc-key ${k.t || ''} ${k.k === '0' ? 'zero' : ''} ${state.op === k.k && state.overwrite ? 'active' : ''}`}
                        onClick={() => { press(k.k); rootRef.current?.focus() }}
                    >
                        {k.l}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Calculator
