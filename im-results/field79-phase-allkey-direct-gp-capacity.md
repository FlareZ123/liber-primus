# Exact all-secret capacity bounds for the source-selected 164×79 / 78-phase direct-GP register

**Decision:** this is a reproducible, conditional exclusion of specified direct-GP28 output registers, not an LP2 decryption. It does not establish that the postselected 35/79/78 framing was intended, and it supplies no authentic key, unknown plaintext, or continuation destination.

## Frozen source framing

The canonical LP2 corpus contains **12,956** unresolved runes. The tested circular framing starts at global rune offset **35** and partitions the entire stream into **164 packets × 79 positions**. In each packet, the first difference from the preceding rune is a published salt; the next **78** differences are payload steps:

- Difference (d=0) is represented as a zero-step marker (-1), conditionally interpreted as transparent GP EA.
- Nonzero difference (d\in\{1,\ldots,28\}) is represented by rank (d-1\in\{0,\ldots,27\}).
- The exact original input yields **164 nonzero salts**, **86** zero-step sites, and **12,706** nonzero GP28 ranks. All 86 original adjacent equal-ciphertext events remain at their original payload positions.

The source arithmetic motivating this *candidate*, but not authenticating it, is retrospective: p15's first four red-title prime weights sum to **149 = p35**; all nine sum to **638 = 29×22**, with **p22 = 79**; and the p53 red-51 sum is **2,262 = 29×78**.

There is also a distinct, source-visible 79-clock clue: two red ten-dot punctuation marks on physical p36 and p38 enclose five numbered red paragraphs spanning **553 = 7×79** runes. The marks lie at phase 36 mod79 and their immediately preceding runes at phase35. Reading those preceding positions and the seven intervening 79-step positions yields **HUAAUAGC**, containing the adjacent RNA stop codons **UAA UAG**. This is a potentially useful boundary/termination clue, but the RNA reading was recognized after seeing the sequence and its page-rotation null tests only that chosen motif; it is not discovery-wide evidence, a key, or an authenticated instruction. It does not establish the 78-rank direct-GP model below. See the [original-source enclosure analysis](prime79-radix29-packet-gate.md#the-original-five-numbered-paragraphs-form-seven-exact-79-rune-clock-intervals).

The packet start, width, and payload length are therefore testable source hypotheses, not established cipher instructions.

## Public phase hypotheses

For packet index (b), payload column (j=1,\ldots,78), and packet salt (s), four public clock expressions were tested:

- `global79`: (t=79b+j)
- `payload78`: (t=78b+j-1)
- `packetPlusColumn`: (t=b+j)
- `blockOnly`: (t=b)

Each clock receives the fixed offset 35 and one of four salt mixes: `none`, `addsalt` ((t+s)), `xorsalt` ((t\oplus s)), or `mulsalt` ((t+bs)). The public phase label is (t\bmod78). These are **16 finite clock/mix hypotheses**, not a search over secret keys.

## Exact all-secret invariant

For each public state (q), let (n_{q,r}) be the observed count of rank (r\in\{0,\ldots,27\}). Any fixed secret GP28 bijection for that state can only relabel these 28 counts. Therefore, for any (k) plaintext rune categories, their total possible occupancy is bounded by

[
U(k)=\sum_q\sum_{i=1}^{k} n_{q,(i)},
]

where (n_{q,(1)}\geq\cdots\geq n_{q,(28)}) are that state's counts in descending order. For a reference window with sorted rune counts (m_{(1)}\geq\cdots\geq m_{(28)}), a necessary number of changed symbols is

[
\max_{1\leq k\leq28}\left(\sum_{i=1}^{k}m_{(i)}-U(k)\right)_+.
]

This bound is independent of every secret permutation value. It is a necessary-condition test, not language-model fitting or key search.

## Results: one arbitrary permutation per phase

Across all 16 clock/mix models:

- The maximum all-secret top-1 capacity is **910**; maximum top-12 capacity is **7,549**.
- The best original same-phase collision statistic is **37,358 / 1,028,589**, for `payload78 / none`.
- The GP-encoded Shakespeare control contains **217,167** symbols after excluding EA. Every one of its **204,462** contiguous windows of length 12,706 was evaluated. The minimum native top-1 and top-12 counts are **1,381** and **9,608**.
- Combining all (k=1,ldots,28) constraints, **every one of the 204,462 windows requires at least 2,071 symbol changes under every one of the 16 models**.
- The original phase-conditioned collision result is also below all 200 evenly spaced, marker-mask-matched Shakespeare windows for every model; these spaced windows are descriptive controls, not independent trials.

Thus a direct native-GP plaintext register with one fixed arbitrary secret 28-symbol bijection per public phase is excluded for the tested source framing and Shakespeare reference corpus.

## Stronger rekey allowance: four phase tables per group

A second exact gate grants **four independent arbitrary bijections per phase**, i.e. **312 secret 28-symbol tables** per model. It tests two source-defined packet groupings:

1. Four contiguous 41-packet quarters: (g=\lfloor b/41\rfloor).
2. Four interleaved packet-index lanes: (g=b\bmod4).

The state is ((g,q)). Across the same four clocks, four salt mixes, and two groupings there are **32** models.

- Maximum all-secret top-12 capacity across the 32 models: **9,567**.
- Shakespeare's minimum top-12 count remains **9,608** over all **204,462** windows. The top-12 witness alone forces at least **41** changes; the full (k=1,ldots,28) capacity vector forces **at least 335 changes for every Shakespeare window under every model**.
- The GP-encoded Latin Vulgate control has **204,511** symbols and **191,806** contiguous windows; its minimum top-12 count is **11,028**, at least **1,461** above the maximum original capacity.

Both gates include source-shaped positive controls: the 78-table model and the 312-table model each recover **12,706/12,706** planted GP symbols exactly while preserving all 86 zero-step marker positions. The reproducible scripts assert these recoveries.

## Scope and decision

The result closes only the following conditional direct-output families:

- One arbitrary fixed GP28 permutation per public phase, for the 16 stated clock/mix combinations.
- Four arbitrary fixed GP28 permutations per phase, one per each of the two stated four-group packet partitions, for the 32 stated combinations.

It does **not** exclude a key/state that changes within a reused phase, more than four group epochs, salt×column-specific or per-packet rekeys, a different alphabet or intermediate register, variable/compressed/binary payloads, different segmentation, or plaintext outside the tested finite GP-English/Latin references. Shakespeare windows overlap and are a finite source census, not independent p-value draws. The phase35/164×79/78 framing and zero-step-EA reading remain hypotheses; the five-paragraph/ten-dot enclosure is an additional source clue to a 79-step boundary, not a direct-GP key.

**Research consequence:** do not repeat fixed per-phase or four-group direct-GP permutation searches under these clocks. A successor must supply an independently source-derived evolving state or a genuinely different lossless output register, predict untouched original offsets, account for the 86 repeats, and exactly re-encrypt the original ciphertext.

## Reproduction

Run from the repository root with Node.js 22:

```sh
node sims/field79_phase_allkey_gate.cjs
node sims/field79_fourgroup_allkey_gate.cjs
```

Both scripts use only Node built-ins plus the shared `sims/word_partition_invariant.cjs` GP encoder, read the canonical original corpus and checked-in control texts, make no writes, and contain exact assertions for source counts, exhaustive window counts, capacity bounds, and planted full recovery. The core top-k counts were independently recomputed from the current remote source corpus and control files during this promotion. No CI rerun was needed.
