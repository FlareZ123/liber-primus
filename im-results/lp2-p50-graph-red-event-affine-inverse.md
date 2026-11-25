# P50 successor graph as a red-event affine cipher: exact inverse and predictive decision

**Agent12, 25 November 2026.** No unknown LP2 plaintext or authentic key. The two fixed interpretations below use the actual pp49–51 table, all 225 red runes plus 31 large 13-dot marks, and GF29 arithmetic. They reject a specific graph-coupled decipherment route, not the independently established table graph or the broader "numbers are direction" clue.

## Why a player could attempt this

The signed 2016 wording describes words as the map and numbers as the direction. The actual 256-cell numeral table admits a literal address→successor graph under both base60 and the source-missing-f base59 reading. Independently, the original colored event census has 225 red runes and 31 13-dot marks, exactly 256 events in physical order. The direct byte-to-event static lookup, aligned affine byte map and cryptographic key derivation have already been rejected in [prior work](red13dot-256-event-grid-inverse.md) and [all-secret lookup](lp2-red256-table-byte-allsecret-gate.md). Here the table selects a **dependency on another plaintext symbol**, not its direct value or a phase key. This is an independently executable conjecture, not a first-party instruction specifying a cipher. The 256-event selection omits the 10/23-dot marks and is itself conditional.

Use chronological source events, punctuation before a rune at the same offset, original row-major table, canonical GP indices. At every rune vertex i the hypothetical encryption is

```
C[i] = a*P[i] + b*P[f(i)] + d mod29
```

where f is the literal byte successor, a,b are independent nonzero GF29 coefficients, d is a shared offset, and every marker is a boundary with one unknown common GF29 value M. Marker vertices do not carry encryption equations. This grants the model an arbitrary marker code rather than fixing 13 or 29.

Reverse traversal from each marker and one variable at each remaining directed cycle expresses every plaintext symbol as an affine function of M, d and cycle seed(s). Each seed equation is restored as an exact GF29 linear constraint. No iteration convergence, language-fitting of individual nodes, or selected root guesses are needed. Exact forward replay is an implementation invariant; it does not identify a key.

## Two deliberately different uses of solved headings

**Unified receiver:** treat p56 AN END (five red runes) and p57 PARABLE (seven red runes) as encrypted by the same graph law. Fit the five genuine p56 plaintext anchors, then predict p57. Both radix maps have one remaining cycle after cutting marker edges (base59 root189; base60 root158). Across all 784 coefficient pairs per radix, no pair satisfies the p56 heading and cycle constraints. Three constructed p57-derived controls per radix retain the correct key and recover all 225 runes after p57 constraints; five of six have a unique prefix-supported state and predict all seven held-out runes, while base60 a=b=1 leaves 29 prefix states and is resolved only by the held-out heading. That ambiguous control is not a blind prediction.

Because the genuine solved pages have independently established, different cipher laws, the unified-model negative alone does not exclude a separate graph cipher on p0–55. The stronger **external-boundary receiver** makes both solved headings literal known boundary values and never applies the hypothetical graph encryption to their ciphertext. All 213 unknown red runes remain unknown. Base59 has one unanchored cycle; base60 has none. Exact closure gives 659,344 legal complete parameter states per radix, covering every a,b,d,M and cycle value, with no cap.

## Exact original-input recovery attempts with the solved headings as external boundaries

| Frozen criterion | Base59 | Base60 |
|---|---:|---:|
| Feasible complete states | 659,344 | 659,344 |
| States whose p0 first 8 red runes form a word in 32,124-form lexicon | 0 | 0 |
| States with no EO/OE anywhere among the 213 unknown red runes | 0 | 0 |
| Exact minimum EO/OE count over all complete states | 1 (5 states) | 1 (1 state) |
| Spacing-free prefix optimum, nats/rune | −4.005118 | −4.119833 |
| Frozen 156-rune continuation, nats/rune | −6.526740 | −6.656036 |

The lexical register combines repository Shakespeare, Gibran, Emerson, LP1 references and TextBlob, using the source chart and documented C/K, V/U, Z/S, Q/C, ING/NG and IO/IA spelling conventions. Only p0's physically confirmed first eight red runes are used for lexical selection. Four constructed dictionary-shaped plants, two per radix, recover unique keys and all 41 remaining fully red printed words. They are not independently authored natural prose.

The EO/OE support test grants arbitrary word boundaries and checks every complete state. It is conditional on the native 27-rune register observed in solved Cicada, not a universal claim about English. One rare rune is not by itself strong language evidence.

The independent spacing-free test fits only 57 red runes on p0–7 in five physically contiguous red spans and holds out 156 red runes on p8–55 in ten spans. It uses a fixed smoothed backoff trigram model trained on 600,925 GP runes from the three literary donors, with context restarted at each span. Exhaustive exact state scoring selects one unique prefix maximum for each radix; the continuation is evaluated without changing the state. Original winners (a,b,M,d,root)=(21,12,9,7,7) and (a,b,M,d)=(24,20,20,3) are incoherent. Four independently parameterized p57-derived contiguous-span plants recover their exact full state and all 156 withheld runes, with prefix scores −2.424581/−2.433734 and held-out scores −2.258369/−2.429667. The two radices share each of the two donor fixtures; these are four graph/key recovery tests, not four independent natural-language documents. The original holdout is experiment-local, not an untouched manuscript sample across the entire project.

## Decision and reproducibility

Retire this particular common affine graph equation, both radices, with marker boundaries and either unified or external solved-heading treatment. No proposed decode is promoted. Arbitrary nonlinear graph transitions, different event serialization, independent keys or unrelated source uses are outside this result; do not retune the same coefficients, marker code or graph root.

- [Unified receiver SFT](../sims/lp2_p50_graph_red_event_affine_inverse_sft.cjs)
- [External-boundary exact lexical/GP27 SFT](../sims/lp2_p50_graph_red_event_boundary_inverse_sft.cjs) and [raw output](lp2-p50-graph-red-event-boundary-output.json)
- [Spacing-free predictive SFT](../sims/lp2_p50_graph_red_event_spacingfree_inverse_sft.cjs) and [raw output](lp2-p50-graph-red-event-spacingfree-output.json)
- Input blobs: table 2550eae357442912220e05dc51147523a61dd75a; ink annotations 0614aca67969a14ae006e0c1ae6aee6dcd8136e6; corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. Every red event rune is checked against the corpus at its physical offset.

All three computational cores were actually executed in the connected V8 runtime; standalone CJS launch on Windows and CI were not performed. No new CI workflow is needed.
