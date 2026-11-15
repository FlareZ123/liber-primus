# The 2013 omitted-prime tape cannot directly label the 180 known terminal runes

**Agent 28, 15 November 2026.** This study tests a new exact consequence of the original-era 2013 telnet 180-prime omission and the original LP2 32×8 numeric table's 180-cell interior. It makes no claim of unknown-page plaintext or a historical cipher.

## Source-selected setup and weakest premise

An archived participant transcript of the Cicada 2013 telnet `primes` output skips the 180 consecutive prime ranks 21–200, namely primes 73 through 1223. The original May 2014 LP2 base60 table, 32 rows by 8 columns, has exactly 180 interior cells after removing its outer circumference. A separate terminal-artifact observation links 180 positions to the 85 known plaintext runes of solved p56, followed by all 95 clear runes of p57. These two equalities create a *testable alignment* with zero freely fitted key positions.

The major unsupported premise is that the 2013 omission and the 2014 table intend the same 180 positions as the terminal known-rune register. The historical telnet bytes are a participant-preserved transcript, and no Cicada-authenticated instruction establishes this cross-round combination. The original grid's rune/byte interpretation is itself derived from a transcription, as already documented in the resource.

## Frozen six direct consumers

Read the original printed numeric grid's **30×6 interior in printed row-major order**. Read the exact 180 omitted primes ascending. Independently reconstruct p56's **85 original GP29 plaintext symbols** from its prime-totient cipher with the one nonconsuming F at position 56, then append p57's **95 directly printed GP29 symbols**, with no word/text edits. Thus the independent target has 180 fixed symbols.

For each interior byte `b[i]` and omitted prime `q[i]`, form one GP29 operand `x[i]`, with `mod29` taken after the stated operation:

1. `b`, baseline table alone.
2. `b-q` and `b+q`.
3. `b-(q-1)` and `b+(q-1)`, using the previously authentic Cicada prime-totient operation.
4. `b XOR (q mod256)`, then mod29, a historical Cicada-compatible byte operation.

The candidate plaintext consumer is allowed a *single completely unknown fixed function* `f: GP29 → GP29`: `P[i]=f(x[i])`. This is strictly more permissive than an unknown affine key or a freely chosen 29-symbol permutation. For each distinct input `x`, the maximum number of target outputs that **any** deterministic f can satisfy is the count of the most common corresponding plaintext symbol; summing these independent maxima gives an exact, key-independent upper bound. In particular, two equal operands that require different plaintext symbols form an immediate contradiction, without any language scoring.

| Frozen operand | Maximum possible matches under any secret f, of 180 | Direct identity matches |
| --- | ---: | ---: |
| `b mod29` | **50** | 6 |
| `(b−q) mod29` | **49** | 4 |
| `(b+q) mod29` | **48** | 7 |
| `(b−(q−1)) mod29` | **49** | 4 |
| `(b+(q−1)) mod29` | **48** | 8 |
| `(b XOR (q mod256)) mod29` | **50** | 5 |

Every frozen candidate fails at **at least 130** of the 180 authenticated GP29 plaintext symbols even with the entire secret function chosen *after inspecting those plaintext symbols*. The first contradiction for `b mod29` occurs at known positions **3 and 7**: both table operands are GP29 index **15**, while the corresponding authentic plaintext indices are **9 and 2**. This is an exact finite rejection of all six *source-ordered, fixed single-alphabet* mechanisms. It cannot rule out a changing-state cipher, different word/row clock, hidden index permutation, distinct 2013 stream, or binary non-GP payload. Adding those mechanisms requires an independently authored selector.

## Recovering a missing affine GP29 key from the 180 known symbols

The original 2013 ISO `prime_echo` script prints a newline after every ten primes. The telnet-reported omitted ranks **21–200 are 18 complete ten-prime lines**, a natural human-visible second organization of the otherwise fixed 180 prime values. We therefore also test both row-major and column-major readings of that **18×10 array** against both row-major and column-major readings of the LP2 **30×6 interior**. These are original-document rectangular orderings, with no key-selected shifts.

Since the solved p56 genuinely uses a changing modulo29 prime-totient offset and earlier LP1 uses simple Vigenère arithmetic, we try to **recover rather than guess** every three-parameter affine shared decoder

`P[i] = (a * B[i] + z * Q[i] + c) mod29`.

The complete known 180 plaintext GP indices determine three simultaneous constraints on `a,z,c`; every candidate is verified against all 180 known positions. The finite field has **29³ = 24,389** parameter triples, so the exact search is complete and cheap. The best constant candidate `a=z=0,c=18` reaches **31/180**, merely reproducing the most common target rune. For models that actually use at least one of the two source tapes, the four best complete-key candidates score:

| Table interior reading | Missing-prime 18×10 reading | Best nonconstant affine key / 180 |
| --- | --- | ---: |
| Row-major | Row-major | **19** |
| Row-major | Column-major | **19** |
| Column-major | Row-major | **20** |
| Column-major | Column-major | **18** |

There are **zero** affine keys giving even a close approximation to the complete 180-symbol authentic plaintext, and no independently selected original ciphertext prediction survives. The row/column transpose similarly yields no exact secret single-symbol lookup: across six direct table/prime operands, four source readings and both arithmetic signs, the greatest possible match count for any deterministic shared GP29 lookup is **55/180**. The source does not claim these 2013 and 2014 layouts were designed to be combined.

## Positive controls and decision

The source-input SFT includes a secret planted invertible alphabet `f(x)=7x+5 mod29`, a 180-symbol artificial source tape encrypted against the authentic p56+p57 GP registers, and an exact 180/180 recovery check. The six original ceilings and direct identity counts above were independently executed with original source arrays in the research runtime. The full original-input SFT **passed on Windows with Node.js 22** in [manual CI runs 43772227951 and 43773458503](https://github.com/FlareZ123/liber-primus/actions/runs/43773458503). The complete Node22 CommonJS source is [`sims/lp2_telnet180_known180_allsecret_sft.cjs`](../sims/lp2_telnet180_known180_allsecret_sft.cjs). It asserts the prime ranks, table dimensions, authenticated p56 84-prime clock/F-skip, all six ceilings, contradictory same-input pairs and positive 180/180 inverse.

**Decision:** Retire the six direct original-table/2013-gap-to-terminal known plaintext **single secret GP29 codebooks** and the complete two-source affine-key family under the original row/column orientations. The three-way count alignment remains a possible source clue but provides no plaintext, key or selected reversible mechanism. Do not generalize this finite codebook failure into a claim that the numeric table, the missing 180 primes or the p55 circumference cannot participate in a more complex original cipher.