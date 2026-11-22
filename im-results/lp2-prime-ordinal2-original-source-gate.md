# All-start affine-ordinal prime residue: exact LP2 divisibility obstruction

**Status, 18 November 2026 (Agent 1):** The entire source-simple direct generator family `C[i] = (q[i] + b*i + a) mod 29`, where `q[i]` is a sequence of distinct consecutive primes and `a,b` are arbitrary modulo-29 constants, is **algebraically impossible on the full original 12,956-rune unknown corpus and separately on each of its nine source-visible visual chapters**, even when the constants and prime starting indices change independently between chapters. This requires no brute-force prime starting-index search and no English-language guess. The simpler fixed `b=2,a=0` generator gives a misleading doublet count resemblance but fails far stronger exact tests. This is a scoped exclusion of a direct prime-residue **generator**, not of a genuine plaintext-dependent prime-derived cipher. No unknown-page plaintext, key or destination was recovered.

## Motivation, original source and competing explanation

The original artifact employs a 29-rune prime-valued alphabet, a visibly prime-related 4×4 spiral on physical p15, and an established consecutive-prime-totient cipher on solved p56. These facts motivate testing an unusually simple *prime-ordinal arithmetic clock*, with consecutive primes `q[i]` and a linear position rotation:

```
C[i] = (q[i] + 2*i) mod 29
```

The `+2*i` is a **trial hypothesis**, not an author-selected instruction. The leading numeral `2` is the first GP prime, but no authenticated LP2 source says to add it per position or chooses the starting prime. This formula describes a *generator*, not a lossless plaintext cipher. The strongest rival is an arithmetic coincidence arising because prime gaps have a highly structured distribution.

The original controls are the complete physical p0–55 transcription: 12,956 GP29 runes and 2,896 actual printed words, preserving the p50 rune-free page and page-carry words. References: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-transcription.txt`, and original scans in `resources/liber-primus/`.

## Exact all-start, all-affine prime divisibility theorem

Permit more freedom than the trial: for each original chapter independently, let `C[i]=(q[s+i]+b*i+a) mod29`, with completely unknown prime-start index `s`, **all 29 values of offset `a`**, and **all 29 values of slope `b`**. There are 841 affine-ordinal choices per chapter, and no bound on `s`.

For fixed `a,b`, every position satisfying `(C[i]-b*i) mod29 = a` requires `q[s+i] ≡ 0 (mod29)`. **The only prime divisible by 29 is 29 itself.** An unbroken consecutive-prime tape can therefore have **at most one** such position, independently of the starting prime and any other statistics. Define

```
N(a,b) = count of positions i with (C[i]-b*i) mod29 = a.
```

Enumerate exactly the 29 slopes `b` and count occurrences of each residue `a`. The minimum over all **841** choices is a source-exact finite statistic:

| Source-original original-rune segment | Length | Minimum N(a,b) among all 841 choices |
| --- | ---: | ---: |
| Entire p0–55 unknown stream, continuous clock | 12,956 | **389** |
| p0–2 | 729 | **13** |
| p3–7 | 1,145 | **21** |
| p8–14 | 1,729 | **34** |
| p15–22 | 1,903 | **36** |
| p23–26 | 1,021 | **18** |
| p27–32 | 1,433 | **30** |
| p33–39 | 1,680 | **34** |
| p40–53 | 3,008 | **75** |
| p54–55 | 308 | **2** |

**Every minimum exceeds one**, so **every** chapter independently contradicts the generator for every start `s`, slope `b` and offset `a`. Even the shortest p54–55 chapter fails. The identical proof excludes the more permissive **23,548** source-simple choices `C[i]=(λ*q[i]+b*i+a) mod29` for every invertible scalar `λ∈{1,...,28}` and every `a,b∈{0,...,28}`: reducing `C[i]−b*i=a` gives `λ*q[i]≡0`, hence `q[i]≡0 (mod29)` regardless of `λ`. It also applies to directly emitting an affine function of `φ(q[i])=q[i]−1`, since its constant shift can be absorbed into `a`. **Consecutiveness is stronger than the proof needs:** any sequence of distinct primes (in any order) contains prime29 at most once. This is an infinite-start, finite-secret exact necessary-condition result; it does not cover repeated-prime keys or an unknown plaintext contribution. The unchanged positive plant generated from primes beginning 1,000,000,007 and `b=2,a=0` has minimum **0**, as expected. A particularly compact original counterexample for the literal `b=2,a=0` full-book clock occurs at contiguous zero-based offsets **57 and 58**, both forcing the prime 29 at different positions. The same conclusion holds if the model is given an unknown chapter-local affine clock, since the nine separate minima remain greater than one.

This argument does **not** exclude encryption involving an added unknown plaintext term, nonlinear/state-dependent position weights, symbol-specific remappings, skips or inserted values. Those are distinct mechanisms that need independently supplied source instructions; this theorem excludes the entire *direct consecutive-prime residue plus affine index* architecture. It supersedes the weaker conditional claim that only the fixed 1e9 prime-start stream is excluded.

### Extension: unknown static 29-symbol alphabet

Permit an entirely secret fixed bijection `π` applied to the generator output, independently rekeyed at each original chapter:

```
C[i] = π((q[s+i] + b*i + a) mod29).
```

If `b=0`, one output symbol `π(a)` must occur at most once, but every symbol appears at least four times even in the shortest 308-rune original chapter. If `b≠0`, the map of the 29 phases `i mod29` to the output symbols `π(b*i+a)` is an arbitrary *bijection*. Whenever the observed `C[i]` equals this phase's assigned forbidden symbol, the inferred `q[s+i]` must equal prime29. There can be **at most one** such coincidence on any true distinct-prime tape.

Without enumerating 29! alphabets, construct the **29×29 original phase/symbol count matrix** and compute its minimum-cost bijective assignment, where each chosen cell costs its observed original occurrence count. The assignment is an exact best-case lower bound allowing **every** secret static permutation, any nonzero slope and any offset. A real 1e9 prime+2i positive plant has cost **0**.

| Original interval | Best possible prime29-site count with secret π |
| --- | ---: |
| Full p0–55, continuous alphabet and clock | **251** |
| p0–2 | 0 |
| p3–7 | 0 |
| p8–14 | 1 |
| p15–22 | **2** |
| p23–26 | 0 |
| p27–32 | 0 |
| p33–39 | 1 |
| p40–53 | **15** |
| p54–55 | 0 |

The source completely excludes the **globally stationary secret-alphabet version** (minimum251), and excludes the separate **p15–22 and p40–53 chapters** even with independently secret static bijections per chapter. The seven remaining chapters' assignment lower bounds of zero or one are **necessary-condition survivors**, not recovered alphabets or plaintext. A secret alphabet that varies within chapters, non-affine clocks or a plaintext term remains outside this theorem. This sharper scope prevents incorrectly claiming that arbitrary secret permutations are excluded on all nine chapters.





## Original versus a fixed prime-stream plant

The planted stream begins at the first prime not less than 1,000,000,000 (**1,000,000,007**), continues for 12,956 consecutive primes, and applies the formula without a reset or fitted alphabet. A uniform symbol histogram is expected from the moving position offset even when prime gaps have unequal frequencies.

| Frozen measurement | Original LP2 | Prime+2i plant |
| --- | ---: | ---: |
| Runes | 12,956 | 12,956 |
| Adjacent identical runes (globally adjacent) | **86** | **76** |
| Within-source-word fifth-back equalities, fixed 2,105 opportunities | **104** | **50** |
| Minimum consecutive-prime gaps greater than 58 forced by residues and primality mod 3 | **2,876** | **530** |

The **29-bin original step histogram**, indexed by `(C[i]−C[i−1]) mod 29`, is:

```
86,459,504,440,438,446,430,470,426,510,497,455,449,504,474,
470,449,404,434,474,467,463,421,486,468,467,457,476,431
```

The identically calculated plant's histogram is:

```
76,322,49,587,928,213,886,211,1552,321,675,168,807,190,1178,
276,635,110,491,85,882,191,516,85,442,60,618,110,291
```

Their total-variation distance is **0.3375530683133925**. The prime-derived stream's easy 76/86 near-match masks a radically different distribution of nonzero steps. In particular, there is no exact generator match or source-native plaintext.

### Why the prime-gap lower bound is key-independent

If `C[i]=(q[i]+2*i) mod29` and `q[i]` are consecutive odd primes, then the unknown positive even gap `g[i]=q[i+1]−q[i]` obeys

```
g[i] = base[i] + 58*k[i],  k[i] >= 0, base[i] in {2,4,...,58}
base[i] = 2 * (15 * ((C[i+1]−C[i]−2) mod29) mod29), with 0 -> 58
```

All primes after 3 are nonzero modulo 3. The exact dynamic program retains current prime residues 1 or 2 modulo 3, tries `k=0,1,2` (sufficient to span all `k` residue classes modulo 3), rejects an intervening zero residue, and minimizes the count of `k>0`. This yields a *necessary lower bound*, not a sufficient certificate of consecutive primality. The original demands **2,876/12,955 = 22.20%** long gaps of at least 60; the fixed near-1e9 real-prime plant needs **530/12,955 = 4.09%** under the same intentionally lenient bound.

In five independent actual consecutive-prime controls starting near **3,301, 10^9, 10^12, 10^15 and 10^18**, the corresponding minimum long-gap fractions were approximately **0.077%, 4.09%, 8.58%, 12.23%, and 14.85%**, while the exact adjacent repeats were **1, 76, 104, 158 and 215**. These scales are exploratory controls, and the comparisons do not prove a universal impossibility for arbitrary giant-prime ranges, nonlinear clocks or unknown skips.

## Reproducibility and decision

The self-contained, dependency-free [read-only CommonJS SFT](../sims/lp2_prime_residue_ordinal2_original_sft.cjs) independently reads the exact original corpus, checks the theorem on the full manuscript and all nine original chapters, verifies a real consecutive-prime positive control, adds the 29×29 minimum-cost assignment gate for every arbitrary static secret GP29 alphabet, and retains the earlier prime-start, fifth-back, 29-bin first-difference and mod3 gap tests. Its first version succeeded on Windows Node.js 22 in [Actions run 44256006472](https://github.com/FlareZ123/liber-primus/actions/runs/44256006472); the enhanced all-affine theorem was committed as [45297cc](https://github.com/FlareZ123/liber-primus/commit/45297cc09c3da1598c5c49cd599f9a4fe44d08f3) and passed [Actions run 44257341671](https://github.com/FlareZ123/liber-primus/actions/runs/44257341671). The static-secret-alphabet extension is [commit fd2277e](https://github.com/FlareZ123/liber-primus/commit/fd2277e406df2551e7df75bf93e3a9c7328b574f) with [Actions run 44258299915](https://github.com/FlareZ123/liber-primus/actions/runs/44258299915).

**Research decision:** Retire **all direct consecutive-prime GP29 residue generators with arbitrary affine-index slope and offset**, including all original chapter-local starts. The universal divisibility obstruction makes further prime-start/linear-index tuning logically unnecessary. Prime-derived **keys combined with unknown plaintext** are outside this exclusion and remain conditional on a creator-visible key/clock operation. The 76-versus-86 doublet near-match is expressly superseded by this exact mathematical impossibility; no original plaintext was recovered.
