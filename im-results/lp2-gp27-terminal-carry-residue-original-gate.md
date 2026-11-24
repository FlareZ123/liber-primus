# GP27 terminal carry: exact 48-bit lexical inverse gate (2026-11-24)

Agent1, Director #2273. Continuation of [streaming constrained word-rank gate](lp2-streaming-constrained-wordrank-carry-original-gate.md).

**Result:** All 24 previously defined GP27 quotient-carry rank variants were searched exhaustively for terminal integer (0\le T<2^{48}), subject to the final consecutive words belonging to the frozen source-native GP27 dictionary. There are 33 variant/state pairs satisfying the last five printed words, **zero satisfying six**. All 33 were decoded across the complete 12,956 original runes / 2,896 words: maximum four dictionary hits among the 1,132 words of length ≥5, maximum total hits 252, maximum GP27 IoC 0.03707310162031656 (uniform baseline 1/27). No plausible plaintext. This does not exclude larger terminal states, non-dictionary final words, or alternative enumerative encoders.

## Exact search
For the same word row (M,r,L) and (P=27^L), invert (s=(M s'+r-p)/P), (p=(M s'+r)\bmod P). Represent each surviving terminal class as (T=t+h u) with (0\le u\le U) and current backwards state (s'=c+d u). A chosen dictionary integer (p) is possible iff
```
M*d*u ≡ p - M*c - r (mod P)
g = gcd(M*d,P)
g divides p-M*c-r
m = P/g
u ≡ inverse(M*d/g mod m)*(p-M*c-r)/g mod m
```
For residue (u_0\in[0,m)) satisfying (u_0\le U), restrict (u=u_0+m v); update (t\gets t+h u_0), (h\gets h m), (c\gets \lfloor(M(c+d u_0)+r)/P\rfloor), (d\gets M d m/P), (U\gets\lfloor(U-u_0)/m\rfloor). Enumerate exact sorted dictionary residue buckets by (p\bmod g), with a circular interval query for legal (u_0). This avoids visiting the full numerical key space. Prefixes shared by rank variants are searched once, then continuations separately. Source GP27 alphabet omits EO/OE; lexicon contains all allowed transliteration segmentations of frozen TextBlob words and exact solved donor forms, with lengths 2,3,6,7 containing 183,769,5984,6685 ranks respectively. A planted 32-bit target 2147486949 has exactly one surviving five-word candidate, the true target.

## Original outcome
At 40 bits no candidate satisfies five words. At 48 bits, each of eight distinct four-word rank prefixes leaves 1,663,740–1,669,572 states after the fourth word. Across full 24 configurations:
| head mode | successor rank | five-word states | six-word states |
|---|---|---:|---:|
| word | sorted | 5 | 0 |
| word | cyclic | 8 | 0 |
| gap | sorted | 5 | 0 |
| gap | cyclic | 15 | 0 |
Examples of chance five-word strings include BESTIAL XI FILIAL FAS RING and PETERED RA BANGING WRY RUB. The full-book continuation rejects all of them independently of a single omitted or misspelled sixth word. No authenticated key or new plaintext.

Reproduce with Node22 from repository root:
```
node sims/lp2_gp27_terminal_carry_residue_sft.cjs 48
```
Optionally append one of word:0, word:1, gap:0, gap:1 to run just that group. [All 33 full-decode candidate metrics](lp2-gp27-terminal-carry-48bit-candidates.json). Source run executed in JavaScript on fetched canonical repository inputs, not a claimed Windows CI run. The 48-bit range is a bounded computational probe, not an independently selected source key size. Do not extend the state bound indiscriminately without an authentic operation or key-length clue.
