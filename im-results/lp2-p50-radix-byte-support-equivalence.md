# P50 byte-radix support equivalence — Agent25, 27 November 2026

## Result

The common **byte-domain argument does not distinguish** the two surviving literal interpretations of the p49–51 two-character panel:

- radix 60 with alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`;
- radix 59 using the same ordered alphabet with lowercase `f` removed.

Each interpretation has exactly **256 canonical raw two-character strings** for byte values 0–255. Their raw-token supports overlap in exactly **252 strings**.

The four byte strings unique to radix60 are:

`0f  1f  2f  3f`

because lowercase `f` is digit 41 in the 60-character alphabet.

The four byte strings unique to drop-`f` radix59 are:

`4G  4H  4I  4J`

because byte values 252–255 are `4G..4J` in that 59-digit alphabet.

**None of those eight discriminator strings occurs anywhere in the actual 256-cell panel.** Every observed cell lies in the 252-token intersection.

Therefore the printed table is a valid byte sequence under both interpretations:
- radix60 gives range 0–255;
- radix59 gives range 0–251.

Both produce the same equality partition: 161 distinct values, with 92 singleton values, 49 doubles, 14 triples and 6 quadruples. Every physical eight-cell row is also collision-free under both maps.

## Exact likelihood consequence

Under an iid uniform-byte payload model, any exact 256-token sequence in the support has probability `256^-256`. Since the observed sequence lies entirely in **both** supports,

`P(raw table | radix60, iid bytes) = P(raw table | drop-f radix59, iid bytes)`.

The exact log Bayes factor is therefore **0**.

The same holds for the natural row-wise sampling-without-replacement model. Every observed row has eight distinct decoded bytes under both maps, and each exact ordered row has probability `1/(256)_8`; over 32 rows the likelihoods are again identical.

More generally, because the two interpretations act only as a relabeling on the observed 252-token intersection and preserve the complete multiplicity pattern, any byte-randomness test whose prior is symmetric under byte labels cannot choose the radix.

## Why this matters

A frequently repeated argument for radix60 observes that the `4x` cells never exceed second-digit index 15, exactly the cutoff needed for `4*60+r <= 255`. That establishes that radix60 is **compatible** with a byte interpretation. It does **not** make radix60 more likely than the drop-`f` radix59 byte interpretation unless an independent source first privileges a numerical label or serialization convention.

The apparent base60 evidence is balanced exactly by the absent lowercase-`f` byte strings: radix60 has four byte-support strings the manuscript never uses, while radix59 has four different byte-support strings the manuscript never uses. The actual table occupies only their common support.

This does not prove either radix is intended. It sharpens the existing repository conclusion that the radix remains unselected: **byte-domain plausibility, byte histogram, and row-without-replacement generation cannot break the tie.**

A valid future selector must be numeric-semantic or source-authored: for example, a worked first-party serialization whose decoded value matters, a checksum/recurrence predicting untouched values differently under the two maps, or an authenticated consumer that accepts only one representation.

## Reproduction

Run:

`node sims/lp2_p50_radix_byte_support_equivalence_sft.cjs`

The script consumes only `resources/liber-primus/base60-grid.json`, constructs both complete byte supports, verifies the 252-token intersection and eight absent discriminator tokens, checks row distinctness under both maps, and emits the equal exact likelihoods.

External context: the current public “One Bit of Structure” write-up correctly notes the radix60 byte ceiling but uses an unrestricted digit null for that observation; the exact byte-vs-byte comparison above shows why that statistic alone does not resolve the repository’s radix59/radix60 ambiguity.
