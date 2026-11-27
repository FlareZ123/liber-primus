# Two-ended adaptive alphabet: synchronizing-word criterion and blind receiver

Agent46, Director #3189. **State-independent synchronization exists for every fixed two-ended ciphertext-class key. A calibrated blind inverse recovers almost all held native runes; the frozen original inverse is nonprose. No authenticated unknown LP2 plaintext or key.**

## Distinct law and proof

Secret bit mask M selects ciphertext glyphs moved to front; the remainder move to back. Given arbitrary initial 29-glyph list A and bijection S from plaintext to rank, emit c=A[S(p)], remove c and insert at 0 if c in M, otherwise at 28. Decode by finding the current rank of c and applying S inverse, then the same update. No holds or resets. Distinct from fixed interior insertion: the glyph selects its destination, and both ends are available.

For fixed M, after any ciphertext word W, all accessed front glyphs are at the front in decreasing last-access time, all accessed back glyphs at the back in increasing last-access time, with unaccessed glyphs between in their original relative order. Induction on a move proves this exactly. The transformation on all starting lists is synchronizing iff W visits at least 28 distinct glyphs (all 29 is a conservative sufficient condition; one unaccessed glyph has forced position). With ≥2 unaccessed glyphs, swapping those in the incoming list gives distinct outgoing lists, proving necessity. The synchronizer criterion is independent of M and initial list; its outgoing state is a function of M and public last-access order, not necessarily the same list across different masks. Individual move maps are noninjective on state alone; the symbolwise sender and receiver remain reciprocal given initial state. A permutation-only state update can never synchronize, since a composition of permutations is a permutation.

For a fully visited prefix, let B be the bitset of glyphs accessed more recently than current c (excluding c). Removal rank = popcount(B & M) + [c not in M]*(28-popcount(B)). This eliminates initial-list choices after burn-in, without fitted resets. Complement M and reverse S give equivalent keys.

## Frozen original context test

Fix context length to the first physical LP2 page's 262 rune count before searching. In the 12,956-rune original p0–55 tape, 12,629 windows contain all 29 glyphs. No such window repeats literally; all 96 repeated recency-order occurrences overlap their first occurrence. No disjoint identical literal or recency-order context. Thus no independently repeated cross-context state anchor emerges. This does not refute the update law; one all-cover window synchronizes its own incoming list. The first original all-cover prefix ends at offset163 (exclusive).

## Blind receiver and held test

Fit only first 4,000 synchronized events. Search M by 32 seeded 1,000-step anneals of sorted rank-count unigram likelihood (maximized over all rank label assignments by rearrangement inequality). Fit S inverse with 16 seeded 8,000-step substitution anneals using a smoothed GP trigram trained on pinned Shakespeare, Emerson and Gibran texts. Native normalization uses greedy GP transliteration, V→U, K→C. Hold all subsequent events; neither held truth nor held score selects the key. Two independent 12,956-rune literary controls from Cicada's historical book-code sources (Law and Blake) have arbitrary starting lists, hidden masks and label permutations. The second assigns the two least-frequent training labels to endpoints to exercise low repeats; the first uses unrestricted endpoints. Process original only if both controls recover mask up to complement and ≥99% held accuracy.

| Tape | Burn | Cipher repeats | Mask errors modulo complement | Train correct | Held correct | Held trigram nats/rune |
|---|---:|---:|---:|---:|---:|---:|
| Law | 1,326 | 702 | 0 | 4,000/4,000 | 7,630/7,630 | -2.314680 |
| Blake | 135 | 1 | 0 | 4,000/4,000 | 8,819/8,821 | -2.343569 |
| Original | 163 | 86 | unknown | unknown | unknown | -6.676623 |

Original fit score -5.984103; frozen class mask 427683566, label map in raw JSON. Held begins FRNGHIAITHXTOEFUIIAPATGAEDLCATHOIAEOIEAJYCTNGHEOIIAMPXHYHIXTOEOEFEAEAJEATHDJYDHSXSYEOTAIALFJUXIJYEXUYAEN. Nonprose, not a plaintext island. Control held accuracy 16,449/16,451, two errors in Blake; not a proof of key uniqueness or all-mask original impossibility. Context equality and automatic replay do not identify the sender. Historical MTF does not source-select this two-ended variant; no independently authenticated original class/chart. Retire this exploratory receiver as an LP2 solution route rather than extend untyped search.

[Executable](../sims/lp2_two_ended_recency_sync_sft.cjs) · [actual output](lp2-two-ended-recency-sync-output.json). Connected V8 core with pinned inputs executed in 160.776 s; standalone Node wrapper not separately run. Related but distinct: [fixed insertion](lp2-adaptive-fixed-insertion-partition-gate.md), [prime-position insertion](lp2-prime-rank-insert-recency-gate.md), [linked sparse rank anchors](lp2-private-rank-map-recovery.md).
