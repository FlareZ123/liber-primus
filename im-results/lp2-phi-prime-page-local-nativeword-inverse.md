# LP2 historical prime-totient cipher: all original pages, page-reset inverse

**Agent 46, 17 November 2026.** A source-selected and executable plaintext-recovery attack on all 55 rune-bearing unknown physical LP2 pages. **No unknown plaintext, new key, or continuation recovered.** The outcome closes one independent reset interpretation of the genuinely solved p56 cipher and leaves changing key schedules, secondary layers, and non-native text open.

## The proposed human solve route

Solved physical p56 uses the GP29 key \(\phi(p_i)=p_i-1\bmod29\) for successive primes, with **plaintext** F transmitted as ciphertext F **without consuming a prime**. Ciphertext F can alternatively arise from encrypting a non-F plaintext rune and consuming a prime. This historical rule is independently real, unlike proposed LP2 cipher variants.

Prior work proved that **chapter-continuous** reuse of this operation fails on eight long unknown chapters for all first 5,000 possible prime starting indices; the last 308-rune chapter had six starts, eight legal outputs, none readable. An independently plausible alternative is that the key clock **restarts at each original physical page**, which requires materially different input scopes. The original page breaks offer a human-visible reason to try it. We therefore fixed:

- Each original physical p0–55 runic page is independent; p50 is numeric-only and skipped. There are 55 original runic ciphertext pages, 12,956 GP29 ciphertext runes.
- The exact p56 encryptor and alphabet: \(C=0\) with no key advancement if \(P=0\); otherwise \(C=P+\phi(p)\pmod{29}\), consuming exactly one prime. Plaintext zero may **never** consume a key. Every ciphertext F ambiguity is exhaustively retained.
- For each unknown page, every zero-based starting prime index **0 through 4,999 inclusive**, without fitting a shifted key separately to individual ciphertext words.
- Printed GP29 word boundaries from the checked-in transcription are preserved. A page-straddling word is evaluated as a page-local fragment, which weakens rather than fabricates full-word positive matches. The numeric p50 omission is restored to physical numbering before any scoring.
- Exact native-GP spellings of **12,140 distinct words of three or more runes** from the checked-in Shakespeare, Gibran and Emerson references, using the repository's GP digraphs and historical K/Q/V/Z spelling conventions. These are a frozen, finite English register, not the universe of possible plaintext.

## Exhaustive key/ambiguity attack

For each prime start, a dynamic program tracks the complete set of legal paths at each original word boundary. Its only persistent cipher state is the count of literal-F skips so far, because all paths with the same count consume the same future prime. It exhaustively branches on every ciphertext F. At a word boundary, it retains the path maximizing **the total number of plaintext rune positions covered by whole dictionary words of at least three runes**. Ties prefer more matched words. The DP therefore computes the exact maximum dictionary-word coverage for **every** prime start without selecting a convenient F mask after seeing a candidate phrase.

Original-source GP rune indices from the 58-page numeric corpus are asserted equal to every physical page parsed from the independently stored rune transcription. The genuine solved p56 ciphertext is re-encrypted from its known 85-rune original plaintext with the exact rule and its prime-2 start. As a blind scoring positive, the same dynamic decoder on genuine p56 recovers a best path containing **55 of its 85 runes within 14 native-reference words**. This is a strong control despite missing rarer proper nouns and inflections from the three-reference lexicon.

| Result over original input | Measured outcome |
| --- | ---: |
| Unknown physical rune-bearing pages | **55** |
| Unknown ciphertext runes | **12,956** |
| Prime start hypotheses per page | **5,000** |
| Key starts with at least one fully legal F-bypass inverse, summed over 55 pages | **9,733** |
| Original pages with ≥1 legal inverse | **55/55** |
| Best fully legal original page, **native-word rune coverage** | **10 runes** |
| Pages reaching that maximum | **p40** (231 runes), **p47** (274 runes) |
| Largest coverage on first physical page p0 (262 runes) | **9 runes** |
| p35 (271 runes) | Exactly **2** legal starts; best **3** covered runes |
| p54 (232 runes) | **14** legal starts; best **3** covered runes |
| p55 (76 runes) | **1,505** legal starts; best **4** covered runes |
| Genuine p56 solved control (85 runes, known start 0) | **55** covered runes, **14** matching words |

For p35 specifically, the only legal starting prime indices are **801** and **2,634**; each yields exactly one full-length F-branch inverse. Their respective complete-rune IoC values are **0.0352330** and **0.0343583**, characteristic of near-uniform outputs rather than the solved p56 text. The better dictionary path matches only one three-rune word. This is a particularly constrained, plainly negative page-level instance.

The **9,733** survivors demonstrate that page-local clock resets restore mathematical reachability, but every original-page output remains far below the independently authenticated p56 English-word recovery in the same lexical register. A short-page legal candidate or a one-word coincidence is therefore not evidence of an original page solution. The original ciphertext does not reveal authentic English under this specific cipher transfer.

## What this decides

**Retire the proposed direct p56 phi(prime) + plaintext-F cipher with an independent key start per original physical page, across the first 5,000 prime positions, as a route to ordinary word-preserving native English.** The branch search is exact for this fixed architecture, key-start interval, corpus and lexicon. The absence of recovered prose is an empirical language decision, not a mathematical impossibility for unknown words, different languages or non-English ciphertext intermediates.

The outcome does **not** rule out a prime start beyond 4,999, page-local extra initialization, ciphertext/word-dependent prime advancement, a different key schedule, nonadditive operators, a transposition changing the word boundaries, or a subsequent unknown encryption layer. It provides no reason to widen the prime-start interval blindly; source evidence selecting such a start or a specific further operation is needed.

**Single-file, source-only CommonJS reproducer:** [sims/lp2_p56_phi_pagewise_5000_nativeword_sft.cjs](../sims/lp2_p56_phi_pagewise_5000_nativeword_sft.cjs). It performs a full 58-page rune-identical transcription assertion, checks the original p56 plaintext encryptor, exhaustively scans all unknown pages and all F branches, asserts the original 9,733 survivor total and the two 10-rune maxima, and prints every page's strongest prime starts. No external dependency, guessed plaintext or trained model is needed.
