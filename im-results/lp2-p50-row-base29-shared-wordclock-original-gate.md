# Original numeric-table row BASE29 key-block clock

Agent28, 24 November 2026, Director [#2479](https://github.com/FlareZ123/liber-primus/issues/2479). **Recoverable finite architecture on blinded plants; original shared key fails. No unknown LP2 plaintext.**

## Why this particular operation

Original p49–51 has 32 physical rows of 8 printed tokens. The source-corrected grid establishes all 256 characters; conventional radix60 yields one byte per cell, a conditional interpretation also used by the prior missing-4C bridge. Signed 2013 BASE29 establishes whole-integer conversion, including 3301→[3,26,24]. Read each actual eight-byte row as a big-endian 64-bit integer, then serialize in the minimal universal fixed width of 14 base29 digits, because 29^13 < 2^64 ≤ 29^14. The longest complete original printed GP word is also 14 runes. This is a typed row-block candidate, not proof the creator selected row geometry, base60, endianness, right alignment or the transition.

Use exactly 32 different source key blocks. For word length L, add the last L digits of selected row s, componentwise modulo29, and update s = (a*s + L + b) mod32. All 16 odd a, 32 b, 32 initial s (16,384 possibilities, 14 bits) are granted. No free per-word keys, alternate radix, arbitrary direction, row reshuffle, secret F holds, or per-page resets. Odd a makes each fixed-L state update a permutation. Right alignment is selected as the low-digit BASE29 residue corresponding to the actual word width. The cipher is fully length preserving. Distinct from the prior H×G table polynomial, direct whole-panel modulus29 readout #2412, and stationary terminal-ring 180-known-symbol #1052/#712; neither uses a reusable 32-entry row key-block dictionary with a word-length-driven common transition.

## Recovery experiment

All exact 12,956 original p0–55 runes, 2,896 words, and canonical carried words are parsed and asserted. Train using ONLY the 177 length1–3 words of the 413 complete p0–7 words (1,874 total runes). Gibran and Emerson supply a length-conditional empirical exact-word score with pseudocount 0.25; unknown words are permitted rather than hard-forbidden. Exhaust all 16,384 shared transitions; calculate one unique best score and next-best margin. Freeze key and continue state through intervening original words without reading any holdout words for scoring. Report p16–21 (372 complete words, 1,605 runes) and p40–53 (669 complete words, 3,008 runes), excluding words which cross the outer evaluation edges but preserving their state updates.

Blind controls: 2 exact-shape plants drawn from the 740-word solved-Cicada native source, 2 independently from Shakespeare, each encrypted under a different fixed shared triple. The scorer never receives the planted plaintext or triple; Gibran/Emerson are separate training donors. All four recover the exact triple uniquely, with score margins 534.19–632.05 nats, and **all 12,956/12,956 plaintext runes each**, including the untouched evaluation regions. Genuine clear p57 roundtrip also passes 95/95.

## Original receiver

The best training triple is (a,b,s0)=(9,24,28), margin 0.9952 nats. This is a noise-fit candidate, **not an authenticated key**.

| Scope | Original best decoded full-word lexical count | Short-word count | Short mean log likelihood | IoC | Native control IoC range |
|---|---:|---:|---:|---:|---:|
| p0–7 training | 22/413 | 22/177 | -10.7517 | .034624 | .059509–.061063 |
| p16–21 untouched | 14/372 | 14/171 | -10.9834 | .034363 | .056846–.061148 |
| p40–53 untouched | 12/669 | 12/284 | -11.2780 | .034695 | .060519–.061781 |

All four native controls achieve ≥168/171 and ≥279/284 short-word matches in the two held-out regions (training ≥172/177). Original first words, with each GP glyph transliterated in print order, are EOEFTWEAAEW EAIAIAMEO EXCH NUF WOR BIFCTEAAERIIAIA ROEOOEM BFNEA SOI LEOE. No coherent prose. Full original forward replay 12,956/12,956 is automatic for every triple, not a key validation.

**Decision:** The actual finite inference engine identifies every planted key, yet its best original solution has a tiny margin, chance-like IoC and no held-out text. Retire this exact row-block serialization plus transition. The codebook's physical row grouping and exact 14-digit capacity motivate a concrete hypothesis but the original numeric table supplies no authenticated recipient or row-transition law. Do not rescue this failed shared model with private block choices or more phase/radix scans. Independent first-party table-to-receiver evidence or a genuinely different, recoverable mechanism is needed.

Reproducer: [CommonJS SFT](../sims/lp2_p50_row_base29_shared_wordclock_sft.cjs). The actual function ran against seven exact repository input texts in V8; no Windows CI result asserted. Run from repo root with `node sims/lp2_p50_row_base29_shared_wordclock_sft.cjs`.
