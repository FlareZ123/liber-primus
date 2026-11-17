# Original single-rune words impose key-independent limits on simple periodic keys

**Evidence status: conditional original-cipher exclusion; no recovered LP2 plaintext or source-selected key.** This test uses the canonical, unmodified original LP2 rune stream and every authentic printed word separator. It does not guess plaintext beyond the standard native-GP single-word vocabulary A, I and O.

## An exact, cheap gate before searching keys

The 55 unresolved rune-bearing LP2 pages contain **12,956 runes in 2,896 printed words**, including **83 single-rune words with 28 distinct ciphertext glyphs**. The complete transcription, including p56 and p57, has 13,136 runes; the parser reconstructs all of the corpus indices exactly. The first eleven single-rune original global offsets are 176, 244, 350, 530, 644, 792, 967, 1025, 1062, 1250, 1316.

Assume that every one-rune printed word is one intact native-GP English word from {A,I,O}, indices {24,10,3}, and that each ciphertext rune consumes exactly one key state. Give an adversary an **arbitrary secret key** at every clock state; no dictionary frequency or key candidate is assumed. Test both modular-29 additive directions (cipher = key plus/minus plaintext) and bytewise XOR (cipher = key XOR plaintext). The clock is phase = (global rune offset + a × global completed-word ordinal) mod L, where the period L and constant per-word extra advancement a are unknown. Exhaust every a from 0 through L−1.

At each observed singleton, the three hypothesized plaintext values permit only three key values. The intersection of these sets must be nonempty for every group of original singleton words sharing a clock state. A zero intersection decisively rejects the entire unlimited-key family for that clock, without any language scoring or plaintext search.

| All-secret cipher family | Smallest period L admitting **any** word-advance a | First period if a=0 | First period if a=1 |
|---|---:|---:|---:|
| GP29 addition (+) | **276** (a=247) | 377 | 589 |
| GP29 subtraction (−) | **276** (a=247) | 377 | 589 |
| Native index XOR | **343** (a=284) | 439 | 664 |

These are **necessary-condition passes**, not recovered keys or credible decryption proposals. They show every global L from 1 through 275 is impossible for additive and every L from 1 through 342 is impossible for XOR in this model, **even after freely optimizing every key value and the word-advance constant**. In particular, a direct globally repeating **256-position p50-table key** is impossible in all three families for every a from 0 to 255.

## Independent page-reset obstruction with original glyph witnesses

Suppose the same deterministic key state is restarted at each physical page, using within-page rune offset and completed-word ordinal (both reset to zero at the page), with no page-specific initial secret or hidden key-consuming symbols. The source has two one-rune words at exactly **page-local rune offset 244 and local word ordinal 54**: p0 ciphertext **S** (GP index 15), and p16 ciphertext **I** (index 10). Their difference is 5 modulo29. The only nonzero signed differences between plaintext A/I/O are ±7, ±14 and ±21 modulo29, none 5; similarly the ciphertext XOR 15 XOR 10 = 5 cannot equal any plaintext-pair XOR {9,18,27}. No common key value exists, **regardless of key period, sequence contents or word-advance constant**.

Independently, p2, p25 and p39 contain one-rune words at page-local rune offset 2 and word ordinal 1, with ciphertext U/G/TH (indices 1/6/2). Their three key constraints likewise have empty intersection. Thus even an unrestricted key function of the page-local rune/word coordinates cannot reproduce the original singletons under the additive/XOR families, if the function is shared across pages.

## The page-number salt escape fails the actual numerical-table key

A more generous clue-motivated alternative lets the p50 table repeat with a **page-indexed clock**: phase = (page-local rune index + a × local completed-word ordinal + b × printed page number) mod256. Permit both unknown coefficients a,b and an otherwise arbitrary secret 256-position additive GP29 key. Exhaustively checking all 65,536 ordered coefficient pairs leaves exactly **one** singleton-compatible pair on the original: a=155, b=46. This is a post-selected fit, not a historical instruction. The same 65,536-test screen finds at least one admissible coefficient pair for **16 of 30** fixed-seed matched shuffles of the original singleton glyphs, so uniqueness of a pair supplies no discriminating evidence.

Read the actual 256 original p49–51 table bytes in printed row-major order and use the frozen a=155,b=46 clock as a GP29 additive key. The untouched original 83 one-rune words then decode as A/I/O at only **9/83** sites under subtraction of the table values, and **8/83** under addition. Thus this precisely specified page-number-salt rescue also fails as a direct p50 key receiver. Other page-dependent/hidden-state rules remain unresolved; these tuned numerical coefficients should not be promoted to a key.

## What this does and does not decide

The result retires simple **literal-word-preserving, no-skip, deterministic GP29 additive/XOR** inverses whose key is indexed by a global short repeating rune/word clock or identically reset on every physical page. The 256-cell p50 table cannot serve as a direct periodic key under those exact rules, irrespective of its cell values or any secret fixed key relabeling that stays additive/XOR at each phase.

It does **not** exclude nonstationary key drift, unknown F-transparent key skips, invisible inserted symbols, a page-dependent initial key phase, variable per-word advances, different plaintext word boundaries, arbitrary non-additive 29-symbol substitution tables, or a p50 table used for another purpose. The assumption that the printed singleton words really mean A/I/O is intentionally strong and remains unverified on unsolved LP2 pages.

**Reproducer:** [source-native CommonJS SFT](../sims/lp2_singleton_phase_key_bounds_sft.cjs). It checks all 13,136 original corpus indices against the transcription, exact singleton positions, both independent original page-reset witnesses, all original period/advance combinations in scope, and positive 13-period planted examples under every clock/family. The JSON PASS report is emitted without changing repository files. The computation is key-independent and does not use original unknown plaintext as a target.
