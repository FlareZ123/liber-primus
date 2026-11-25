# Historical record framing versus physical LP2 line-end checks

**Agent 10 · Director #2740 · 25 November 2026.** Source-selector gate: negative. The historical record contains genuine framing, whole-object integrity fields and a genuine phrase-level arithmetic check, but does not select a terminal GP rune field or a line-to-line cipher-state update on unknown LP2. No arbitrary checksum/width/modulus search was performed.

## The discriminating original control

The strongest candidate is the **2013 761.mp3 Parable's exact prime product**, because the same author-era text appears on clear LP2 p57. This is a better transfer witness than merely importing CRC terminology. The existing [prime-product result](../results/2013-761-parable-prime-products.md) establishes the historical label 1,595,277,641 and the three semantic sums. The new comparison freezes **physical** lines independently of those semantic divisions.

| p57 physical rune row | GP rune count (heading included) | Body prime sum (seven-rune heading excluded) | Final plaintext rune |
| --- | ---: | ---: | --- |
| 1 | 20 | 595 | T |
| 2 | 17 | 664 | E |
| 3 | 17 | 593 | C |
| 4 | 18 | 594 | TH |
| 5 | 23 | 1073 | E |

The five body-only physical sums multiply to **149,322,724,523,280**, not the historical label. The actual three semantic clauses (30/30/28 runes) sum to 1259/1031/1229 and multiply to **1,595,277,641** exactly. The heading, excluded from both comparisons, sums to 449. In particular, p57 wraps the words TUNNELING and CIRCUMFERENCES across rows, and the fourth row ends within THE. The physical and semantic divisions genuinely differ. This is a known, original instance in which the creator's numeric check is attached to **clauses**, rather than the arbitrary printed rows. It is not a source instruction to add or remove a check rune.

The other solved physical page, p56, has five rune-bearing rows of lengths 20/19/6/22/18. Its last plaintext runes are TH/A/O/R/E. The authenticated native prime-minus-one transformation (one literal plaintext F hold, 84 consuming primes) reproduces **85/85** original ciphertext runes including all five final symbols; clear p57 reproduces **95/95**, including its five final symbols. The 180-rune combined control has no spare terminal check-field symbols. A systematic extra-rune suffix interpretation is incompatible with the complete known plaintext on these two pages. It could still be an undocumented unknown-page-only operation or an implicit constraint on ordinary data symbols; no claim of mathematical exclusion of those alternatives is made. The SHA-512 string printed between p56 prose blocks is a digest of an explicitly different target page and is not a per-row check on these 85 runes.

The owner-supplied original JPEGs 17–19 and 73–74 were inspected visually: the ordinary GP text rows, repeated large red initials, semantic punctuation, and (on p56 only) the separate hex digest are visible. No separately identified regular terminal field or leading offset field is visible. This is a visual source check, not an exhaustive image-channel test. Existing [solved layout evidence](lp2-layout-order-solved-source-gate.md) and [framed capacity work](lp2-line-framed-enumerative-original-gate.md) already explain most wraps mechanically; their experiments were not rerun.

## Actual historical framing and field semantics

| Source | Genuine check/framing rule | Required missing LP2 binding |
| --- | --- | --- |
| 2013 Twitter hex stream | Seven hexadecimal digits before a colon are a byte offset; 987 chunks of 65 bytes and a final 12-byte chunk. The exact 988 archived records sort into 64,167 contiguous bytes; last offset 64,155. | No independently identified explicit GP offset field, byte serialization, or source cue for 65-byte chunks; offsets address payload positions, not secret cipher state. |
| Signed 26 Jan 2013 TCP specification | CRLF records; RAND specifies byte count, QUINE/CODE/KOAN/NEXT terminate with a line containing only a dot; DH uses explicit parameters and shares, BASE29 returns a minimal-width positional integer. | No line-terminal checksum, no recurrence mapping the last data symbol to the next secret, no GP serialization of the fields. The official examples cannot be silently reinterpreted as hidden fields. |
| 2013 ICMP/gzip | Historical 28 fragments concatenate into a 778-byte gzip member and decompress to the 959-byte signed message; gzip CRC32 and ISIZE are whole-member trailer fields. | No per-text-line gzip member boundaries or selected byte serialization; no CRC-to-key-clock rule. |
| OpenPGP armor | RFC4880 CRC24 covers a decoded packet object; the prior #2714 experiment reproduced three archived signatures' actual CRCs. | No source-selected per-GP-line packet, check width, serialization or reduction. A raw CRC24 needs at least 5 GP digits (29^4 < 2^24 < 29^5), even if a GP representation were independently selected. |
| 2013 Parable label → clear 2014 p57 | Exact sum of GP primes for each of three semantic clauses, then a single product. | No per-physical-row label, trailing state word, or definition of a key derived from the product. Known p57 positively discriminates the semantic scope from printed rows. |

The Twitter result is independently computed here from the actual preserved stream, not inferred from a nominal record length. It recovers an explicit physical byte cursor when the header is present; it cannot recover a missing *cipher* cursor merely by relabeling LP2 glyphs. The underlying 2013 XOR/JPEG handoff is prior work and is not asserted as a novel result.

References: [2013 signed TCP specification and dated participant vectors](../resources/external/2013-tcp-server-signed-source.md); [2013 hex stream](../resources/cicada2013-twitter-hex-stream.txt); [ICMP reconstruction](2013-icmp-echo-packet-reconstruction.md); [historical CRC24 gate #2714](lp2-p50-factorized-row-rank-lanes.md); [RFC 4880 §6.1](https://www.rfc-editor.org/rfc/rfc4880#section-6.1); [RFC 1952 §2.3.1](https://www.rfc-editor.org/rfc/rfc1952#section-2.3.1). The TCP and Parable artifacts are author-era evidence; the Twitter stream is a preserved participant reconstruction, not individually signature-authenticated records. Full historic coverage, especially unavailable private transports, is not claimed.

## Reproduction and decision

[Node/CommonJS SFT](../sims/lp2_historical_line_check_source_gate_sft.cjs). It uses the image-corrected transcript (blob f7b534a33edeb212d427329798438325307463d7), canonical corpus (054f2a0f780b7d46901acbe3d9bf4f0ac1801165), native solved source (1b064ef6d85819b7d96adaff31a82d1ec551598f), and Twitter stream (b3164929b090ffee06490e8ca86f495aa1db50c7). All 57 rune-bearing physical-page streams agree with the canonical corpus. The core computations were executed on those remote inputs in V8; no separate full standalone Node run or CI run is claimed.

**Stop at the source gate**, as #2740 requests. Historical precedent establishes object-level and semantic-clause checks, not an actual line-local state recovery mechanism. The withheld-original/calibrated-plant stages are conditional on a frozen source-selected field and were not reached. Do not substitute an analyst-designed modulo-29 checksum, strip end glyphs, or scan CRC variants. Reopen only with an independent visible cue defining a local field and its cipher-state consumer, or an authentic precedent specifying both. No unknown LP2 plaintext, authentic key, or continuation recovered.
