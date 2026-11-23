# P49–51 two-character byte transports: exact source-codebook ambiguity

**Status: original-input mathematical constraint; no unknown LP2 plaintext or creator-selected radix.** This narrowly resolves the proposed choice between two *uniform-byte* source grammars. It does not establish that the field is made of bytes, identify the cryptographic role of its values, or exclude a historically specified nonuniform encoding.

## Observable source and competing explanations

The untouched original images `resources/liber-primus/{66,67,68}.jpg` contain the physical LP2 p49–p51 table: **32 rows ×8 two-character cells**, laid out 10|13|9 rows. The independently image-audited tokens appear in `resources/liber-primus/base60-grid.json`; this file's name and `byte_rows` field reflect a conventional numerical hypothesis rather than an authored instruction. The 256 printed positions contain **161 distinct token spellings**. This alone rules out interpreting the table literally as a 256-entry permutation of all different bytes, but leaves a byte stream, repeated-value lookup table, pointer field, symbolic message and other types open.

Two historically discussed byte grammars use the identical printed tokens:

* **Conventional radix60:** digits `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`; each unsigned byte 0..255 is printed in exactly two digits.
* **Drop-lowercase-f radix59:** delete just `f` from that alphabet and print each unsigned byte 0..255 in exactly two digits. This is a proposed alternative, **not** a confirmed period convention.

Their byte-support sets each contain exactly 256 strings. Exhaustive enumeration proves

```text
base60-only:  0f  1f  2f  3f
base59-only:  4G  4H  4I  4J
intersection: 252 two-character strings
```

**All 256 printed source cells lie in the 252-token intersection.** There is no printed test case supported by only one of the two codebooks. The source's first cell `3N` decodes to 203 (base60) versus 200 (base59); distinct numerical readings do not supply an independent ground-truth value.

## Exact identifiability result and scope

Suppose each of the 256 source cells was produced by an independent uniform random byte from 0..255, and then encoded by either grammar. Under either grammar, **every source-observed token has probability 1/256**, so the complete unchanged printed tape has identical pointwise likelihood `(1/256)^256` under both models. The full-data likelihood ratio is exactly **1**, regardless of repeated values or row order. No post-hoc histogram/entropy score of these same printed bytes can create evidence between these *specific* models with the full tape already observed.

The equivalence is also algebraic for unconstrained downstream byte lookup functions. The 252 shared spellings induce a one-to-one map between the corresponding base59 and base60 integers; the four unused inputs and outputs can be paired to form a complete **256-symbol permutation T**. Thus on every original cell `decode60(token)=T(decode59(token))`. Any decoder class allowing arbitrary secret alphabet relabeling can absorb T and will produce the same outputs and forward replay under both interpretations. This equivalence **does not** extend to a separately authenticated fixed arithmetic, byte serializer, key schedule or other operation that is *not* closed under arbitrary relabeling.

The standalone [CommonJS test](../sims/lp2_p50_radix_codebook_overlap_sft.cjs) enumerates both entire codebooks, verifies every original printed cell, constructs the complete byte permutation T, tests all 256 round trips and publishes a row-major source digest. It also uses the eight discriminating strings as positive rejection controls. No search for fluent LP2 output is involved.

## Historical evidence gate and next discriminating action

The first-party 2013 specification gives an explicit `BASE29 3301 -> 3QO` example, whereas no surviving source-authenticated original instruction gives a p50 digit alphabet, unsigned-byte type, grouping, row direction or recipient. The original 2014 Stage11 delivery index has only sequential JPEG references and no separate table legend. The 11 May 2014 `decimal.txt`/`sexagesimal.bin` files are participant-derived from copied manuscript tokens, with documented corrections, so their base60 choices cannot settle author intent. These points are separately documented by [source-codec decision #1968](https://github.com/FlareZ123/liber-primus/issues/1968), [binary typing decision #2087](https://github.com/FlareZ123/liber-primus/issues/2087), and [exact provenance decision #2029](https://github.com/FlareZ123/liber-primus/issues/2029).

**One predeclared discriminator:** a previously unseen, creator-authenticated numeric value for the printed **first cell `3N`**. If that value is **203**, it selects the conventional base60 byte grammar; if it is **200**, it selects the drop-f base59 byte grammar. An authenticated encoding declaration or typed output of the adjacent original 138-rune pretable sentence could also decide. No inspected original artifact supplies this input. Mere source-copied participant decimal203 is not independent.

**Decision:** The source table does not currently select byte type, radix, consumer or key. Preserve the two readings as conditional, discontinue discrimination by table-only uniform-byte histograms, and seek a first-party typed example or an independently decoded table-adjacent instruction. Neither the overall LP2 cipher nor any of its 56 unknown pages is solved by this result.
