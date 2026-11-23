# Original p49–51 table: a possible 1033-line checksum with missing page-50 byte

**Classification:** exact, source-dependent arithmetic, candidate authored integrity check; **no authenticated checksum specification, error location, key, unknown LP2 plaintext or final URL**. The small additive relationship is newly recorded here to focus a concrete next decipherment decision. It must not be promoted to established cipher inference on numerical coincidence alone.

## Original-source facts and finite arithmetic

The original physical pp49–51 contain one **32-row × 8-column** panel of **256 printed two-symbol tokens**, independently adjudicated against all 256 scanned cells. Its source transcription and conventional *conditional radix60* interpretation are in `resources/liber-primus/lp2-grid-256.json`; p49 prints ten rows, the rune-free physical page p50 prints thirteen, and p51 prints nine. The original cuneiform chapter p33 presents a visible historical sexagesimal context, and the authenticated 2014 5×5/7×7 magic-square handoff uses target sum **1033**. We do not presume radix60 was selected by an author-supplied opcode merely because it is conventional.

For the canonical byte-valued table `b[0..255]`:

```text
sum of all 256 genuine printed radix60 cell values    = 33006
original panel row count                               = 32
authenticated 2014 magic-square target                  = 1033
number of rune-free original central physical page     = 50

33006 + 50 = 33056 = 32 × 1033
```

Equivalently, the original table has an exact additive deficit of **50** relative to an imagined total of **32 rows each summing 1033**. **Value 50 itself is absent** from its 256 radix60 cell values (source token would be `0o`); it is a possible inferred **257th check byte**, although there is **no source-selected insertion position or evidence of a deliberately deleted cell**. The original 32 rows are not themselves 1033-sum magic-square rows.

The historically plausible radix59 alternative (same literal token digits with 59 in the first-place multiplier) sums to **32582**, with deficit 474 relative to `32 × 1033`. This is one independent codec control, not a general familywise significance measurement. The identity was noticed in this research after knowing the source squares and printed table.

## Alternative attractive arithmetic and nonunique corrections

Another exact relationship, not privileged by known instructions, is `10 × 3301 − 33006 = 4`. Number 10 is the count of rows printed on physical p49 (the preceding panel fragment), and 3301 is the other authenticated 2014 square target. Four plausible one-cell substitutions each increase the table sum by four:

- The original byte value **46**, token `0k`, occurs at indices **78** and **141**; replacing either with absent byte **50** (`0o`) makes the sum 33010.
- The original byte value **248**, token `48`, occurs at indices **159** and **167**; replacing either with absent byte **252** (`4C`) also makes the sum 33010.

There are **22** duplicated-byte/missing-+4-value pairs, and more alternative transformations beyond these examples. No physical source evidence licenses changing any printed token. This multiplicity is an explicit warning against post-selected checksum correction and missing-`4C` numerology.

## Exact original digest receiver: one bounded negative

The solved p56 prints a 128-hex digest; conditional SHA-512 on a hypothesized missing source byte would give a concrete receiver requiring no language modeling. The source-limited original byte tests comprised:

1. SHA-512 of the unchanged 256-byte table.
2. SHA-512 of all **257** possible 257-byte messages formed by inserting one byte of value **50** at each position, using the exact original table unchanged otherwise.
3. SHA-512 of two separately altered 256-byte tables with one original value46 replaced by50.
4. SHA-512 of two separately altered 256-byte tables with one value248 replaced by252.

**262 original candidate byte objects; zero matches** to the exact original p56 printed digest. The rule is therefore an arithmetic relation without an evidenced p56-hash handoff. It is not a universal exclusion of an unknown cipher, other hash inputs, or a recovered key.

The directly source-inspired 3,301-step terminal floral difference receiver (`im-results/lp2-floral-3301-source-edge-clock.md`) paired with the unchanged 256 original radix60 bytes in the deterministic 1033-coprime-stride key schedule, phase0, both additive GP29 signs, yields nonprose IoCs **0.03455335 / 0.03439399** on all 3,301 original deltas. The source fails to select this particular GP29 key use; it was a bounded speculative consumer and supplies no decipherment. Do not retune phases and strides from plaintext scores.

## Causal next decision and strongest rival

This numerical identity could have been an intentional **checksum/zero-sum redundancy**, or it could be one among many possible arithmetic equalities from a 256-byte nearly uniform data panel. The original panel already contains 256 cells, and Cicada history does not independently command appending physical page numbers to square-sum targets or summing rows. Crucially **a checksum by itself supplies no inverse for p49, p51 or p55**. Further progress requires a first-party operation specifying an actual destination/recipient or a transferable 256-byte-to-rune cipher and independently fixing byte serialization, clocks and key material before scoring unknown original text.

Preserve this narrow source observation; avoid treating checksum repairs as author-authenticated corrections. The p50 `1031/512` modular all-cell congruence is a separate already closed [Director #2322](https://github.com/FlareZ123/liber-primus/issues/2322), with no authenticated consumer. This 1033 **additive** relation should likewise be treated as conditional.

## Reproducibility

- Unchanged original table: `resources/liber-primus/lp2-grid-256.json`.
- Read-only Windows Node22 SFT: [`sims/lp2_p50_missing50_digest_gate_sft.cjs`](../sims/lp2_p50_missing50_digest_gate_sft.cjs).
- [Windows Node22 PASS, original 262-candidate zero-match run](https://github.com/FlareZ123/liber-primus/actions/runs/45263986844).
