# Joint period-8 literal-F recovery at the two bracketed scroll rubrics

Agent 5 — 2026-11-24 — [Director #2522](https://github.com/FlareZ123/liber-primus/issues/2522).

## Original source and fixed hypothesis

The scroll sequence pp3–7 has red-bracketed internal spans at p3:119–122 and p6:71–82, each bounded by 13-dot red punctuation. Test a shared unknown GP29 eight-rune additive key, independently initialized at phase zero after each rubric, with the known LP1 literal plaintext F rule (emit F, do not advance). The black passages are p3:122 through p6:71 (690 runes) and p6:82 through p7:194 (308 runes). All red spans excluded. First complete words totaling at most 140 runes in each passage are training; later words are held out. Original word lengths are assumed to be plaintext word lengths, and the first ciphertext F-free word of length >=8 in each training fragment is assumed to be a native dictionary word. These are conditional plaintext assumptions, not established facts.

Distinct from the previous scroll mirror-linear shared key test and arbitrary aligned two-time-pad tests: this attack recovers an actual shared short key while allowing independent latent F pauses. A ciphertext F can be literal F or a non-F plaintext rune encrypted to F. For an F-free anchor, all its plaintext symbols must consume key phases. Enumerate every number of preceding holds between 0 and the number of preceding ciphertext F sites; every native F-free dictionary word of the anchor length determines all eight key values, or is rejected for a repeated-phase contradiction. Intersect both key sets before scoring other words. For surviving keys, exact phase-state DP enumerates all legal literal-F paths per word and selects a path using independent TextBlob unigram/bigram statistics and lexical bonus. Fit only the two training fragments; propagate frozen ending phases into held-out words. Exact encryption replay is mandatory.

## Actual original result

| | Passage A | Passage B |
|---|---:|---:|
| Total runes |690|308|
| Training runes |139|137|
| First F-free anchor length |8|8|
| Anchor offset |76|30|
| Ciphertext F sites before anchor |3|0|
| Distinct anchor-derived keys |15464|3866|

The 29,060 distinct normalized dictionary entries produce **zero common key candidates**. The complete intersection of radius-one Hamming neighborhoods of both anchor key sets is also empty: permitting one arbitrary incorrect derived key symbol independently in each anchor cannot rescue the hypothesis. Because the original anchors contain exactly eight runes, this relaxed result covers one substituted plaintext symbol per anchor (same native word length), allowing every preceding pause count. It does not cover insertion/deletion, arbitrary nonwords, different key periods, relative phases, different framing, or hidden interruptions besides F. The lexical gate is exact within the stated assumptions; no original held-out plaintext could be predicted.

## Calibration

Re-encrypt editor-normalized solved LP1 reference text in two independently initialized streams under the arbitrary secret key [6,18,1,17,9,22,3,12]. Pair the opening 82 words of LP1 p3 with each of six other solved sections; strip editorial continuation annotations, and use the same 140-rune training and anchor rule, with independent external dictionary. This is a planted-key validation on authentic solved-text content, not a recovery of the historical LP1 ciphertext key.

| Second LP1 section | Joint keys | Viable keys | Exact result |
|---|---:|---:|---|
|6|0|0|No eligible anchor in second training fragment|
|10|3|1|Both training and held-out plaintexts exact; key exact, replay exact (630 runes total)|
|11|1|1|Both full plaintexts exact; second section entirely training|
|12|1|1|Both training and held-out plaintexts exact; key exact, replay exact (557 runes total)|
|13|1|1|Both full plaintexts exact; second section entirely training|
|14|0|0|No eligible anchor in second training fragment|

Four applicable pairs recover the secret key, two with nonempty held-out portions on both streams. Two pairs demonstrate the explicit anchor availability failure. Original both anchors are eligible; rejection is not an absence of sufficiently long ciphertext words.

## Reproduction and implication

Run `node sims/lp2_scroll_joint_fhold_period8_sft.cjs`. The complete experiment was executed in the connected JavaScript runtime with exact repository source inputs, including the two control failures and the one-symbol relaxed original test. [Implementation](../sims/lp2_scroll_joint_fhold_period8_sft.cjs).

No unknown LP2 plaintext or key recovered. Retire the specific shared phase-zero period-8 literal-F dictionary-anchor route. A different cipher or independently motivated key/clock remains possible. No additional arbitrary periods or shifted alignments are warranted by this result.
