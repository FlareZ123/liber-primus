# Exact two-transparent-rune prime clock: all-pair chapter gate and predictive inverse

**Agent3, 24 November 2026.** No unknown plaintext or key. This extends the established [single-F nine-chapter gate](lp2-p56-native-F-transparent-ninechapter-impossibility.md), [all29 single markers at p0](lp2-p56-all29-transparent-original-gate.md), and [TH / F+TH origin test](lp2-p0-thorn-transparent-prime-origin-gate.md). The new scope is every distinct two-symbol set, both arithmetic signs, 5,000 initial prime indices, and both full chapter and post-rubric starts on all nine chapters. The endpoints F+EA are a conditional alphabet-circumference interpretation, not a source-selected cipher instruction.

## Exact search

For plaintext p in marker set S={a,b}, emit p unchanged, without consuming the next key. Otherwise emit (p + sign*(prime[k]-1)) mod29 and increment k. At ciphertext c, preserve every legal unchanged-marker branch, and consume a prime only if its inferred plaintext is outside S. Printed separators do not enter the computation.

Let M[d] be the bitset of absolute prime indices whose totient residue is d. The state is the bitset R of reachable absolute prime indices, initialized to all 0..4999. For each c:

```
bad = M[sign*(c-a) mod29] | M[sign*(c-b) mod29]
R = ((R & ~bad) << 1) | (c in S ? R : 0)
```

Union over all initial indices loses no existence information because future transitions depend only on the absolute cursor. A zero state proves impossibility of every plaintext for that set/sign/start domain. The 406 distinct pairs and two signs represent 4,060,000 parameter triples per start convention. The independent post-rubric starts remove [13,16,12,9,16,19,10,8,9] original heading runes respectively. No intra-chapter resets, alternative prime sequence or transpositions are granted.

## Original exact outcome

| Chapter | Full length | Furthest legal prefix | Post-rubric length | Furthest legal prefix | Complete pair/sign families (full/body) |
|---|---:|---:|---:|---:|---:|
| p0–2 | 729 | 572 | 716 | 559 | 0 / 0 |
| p3–7 | 1145 | 528 | 1129 | 580 | 0 / 0 |
| p8–14 | 1729 | 520 | 1717 | 508 | 0 / 0 |
| p15–22 | 1903 | 482 | 1894 | 473 | 0 / 0 |
| p23–26 | 1021 | 545 | 1005 | 529 | 0 / 0 |
| p27–32 | 1433 | 495 | 1414 | 497 | 0 / 0 |
| p33–39 | 1680 | 523 | 1670 | 513 | 0 / 0 |
| p40–53 | 3008 | 533 | 3000 | 525 | 0 / 0 |
| p54–55 | 308 | 308 | 299 | 299 | 154 / 173 |

All eight long chapters fail even with independently chosen pairs, signs and starts. The final chapter admits respectively 495 and 472 complete pair/sign/origin triples (counted separately, not unique plaintexts). F+EA with forward arithmetic is among the final-chapter survivors; this is arithmetic feasibility, not key recovery.

## Constructive exact Viterbi

Backward reachable-cursor bitsets constrain the forward maximum-score DP over (absolute cursor, preceding two plaintext runes). For each pair/sign, all legal initial indices and all marker choices are searched without beam caps. A GP29 trigram model uses the nine native solved sections, excluding the planted target section, unigram pseudocount 0.5, bigram backoff 20 and trigram backoff 12. Choose the model and cursor/history on the first 232 ciphertext runes alone, then freeze that complete boundary state and decode the last 76. The two original p54 training conventions are 232 and 223 runes, both predicting untouched p55.

| Native control | Hidden and recovered pair / sign / origin | Prefix exact | Withheld exact | Withheld nats/rune |
|---|---|---:|---:|---:|
| WELCOME | F+EA / + / 137 | 228/232 | 76/76 | −2.511469 |
| LOSS OF DIVINITY | I+E / − / 911 | 232/232 | 76/76 | −2.716910 |
| First KOAN | F+TH / + / 3301 | 232/232 | 76/76 | −2.271793 |

The original p56 known solution replays 85/85 under its authentic singleton F. Eight additional dual-marker positive plants on clear p57 retain the true terminal cursor. The three constructive plants all recover both marks, sign and origin; four WELCOME training symbols remain ambiguous, but all 228 held-out symbols are exact.

| Original start | Best prefix pair/sign/origin | Prefix nats/rune | Frozen p55 nats/rune | Retrospective complete optimum |
|---|---|---:|---:|---:|
| p54 including red9 | EO+M / − / 2300 | −4.392716 | −4.985077 | −4.453110 |
| p54 excluding red9 | O+OE / − / 208 | −4.386877 | No legal continuation | −4.457805 |

Both retrospective optima select C+J, +, starts 4647 and 4656 respectively, and give nonprose, IoC 0.036825 / 0.036969. The separately fitted source-endpoint F+EA candidate yields −5.059689 nats/rune on p55 under both starts. All legal candidate outputs forward-replay exactly by construction; this does not authenticate plaintext.

**Disposition:** retire this complete bounded two-transparent-symbol extension of the direct continuous prime-minus-one clock. The first eight results are exact language-independent contradictions; the last is a calibrated predictive and retrospective language rejection, not algebraic impossibility. Do not extend to arbitrary new marker counts or prime offsets absent source evidence. Other prime generators, interior resets, nontransparent symbols, and layered transformations remain open.

[Single-file CommonJS reproducer](../sims/lp2_two_transparent_prime_clock_sft.cjs) · [Complete output](lp2-two-transparent-prime-clock-output.json). Core executed directly on the repository corpus and native source bytes in connected JavaScript; standalone Node wrapper not independently run. Source corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native source blob 1b064ef6d85819b7d96adaff31a82d1ec551598f. Computation commit dc07b7d98b9ae28c9c9acb1408fb27ff9dc6abcf.
