# p55 central-23 / DATA/560.13 XOR gate — negative

<badge>Closed: exact candidate rejected</badge>

## Question

Does p57's parable prescribe stripping word boundaries from p55, retaining the central 23 symbols, and using the historical 2013 DATA/560.13 bytewise-XOR mechanism at the p15 source-derived file offset?

This was a frozen, original-input test. It did not scan offsets, slice lengths, phases, or additional encodings.

## Source-selected construction

- The canonical LP2 word parser identifies **16 complete words** on physical p55. Removing the first and last rune of each gives **43 strict interior runes**.
- The p57 original ink annotation records one red 23-dot terminal glyph, at p57 offset 95. Treating its count as a 23-symbol selector, “Find the divinity within” selects the central 23 of the 43 interiors (ten removed from each end).
- The resulting GP29 indices are:

  `[28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15]`

  Transliteration: `EA F X I M U C P H NG L S D IA P H EO E I G X G S`.

- p15's original nine-rune red heading has BASE29 value **29,553,734,724**, giving:

  `29,553,734,724 = 3,301 × 8,952,964 + 560`.

  This selects the historical `DATA/560.13` resource and candidate byte offset **8,952,964**.
- The operation was selected from the 2013 Cicada precedent: bytewise XOR of a 23-byte input with DATA/560.13. The known offset-12821 positive control is retained.

## Reproduction and integrity

The test ran in the existing manual-only workflow:

- Workflow: `lp2-p15-56013-quotient-offset.yml`
- Run: [43108404847](https://github.com/FlareZ123/liber-primus/actions/runs/43108404847)
- Job: `130817678803`
- Completed: 2026-11-11 22:05:06 UTC
- Full DATA/560.13 length: **118,818,811 bytes**
- SHA-256: `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`

The historical offset-12821 control passed exactly, recovering:

`gbyh7znm6c7ezsmr.onion\n`

The source assertions also passed: p55 word/interior counts, the central-23 sequence, the p57 red-23 annotation, and the p15 quotient/remainder.

## Original-input result

The 23 bytes at the p15-selected offset were:

`7e663f6bef914d184e56ca13dfa01d661e6947893ef1d4`

| Rune encoding | XOR output (hex) | Printable bytes | ASCII rendering | v2 onion |
|---|---|---:|---|---|
| GP rune indices | `62663161fc9048154643de1cc8bb106e127b4d8f30f7db` | 11/23 (0.4783) | `bf1a..H.FC.....n.{M.0..` | No |
| GP prime weights | `13641074a89240335919832686cb3671372a589811e0e1` | 11/23 (0.4783) | `.d.t..@3Y..&..6q7*X....` | No |

Neither encoding yields intelligible direct ASCII or a 16-character base32 v2 onion address plus newline.

## Decision

**Reject this exact mechanism:** p55 central-23 extraction XORed with DATA/560.13 at offset 8,952,964 under GP-index or GP-prime-weight byte encoding.

The positive control establishes that the dataset and historical XOR implementation are functioning; the negative result is therefore not a failed download or broken XOR primitive. The unique 23-dot count is an observed visual fact, but it does not authenticate the proposed numeric extraction or cipher operation.

This result does not exclude every possible LP2 cipher, key, or use of the 2013 artifact. It does close the specified source-selected test. Do not rescue it with alternative offsets, slice lengths, phases, reversals, or extra transformations. No p55 plaintext, authentic key, onion destination, or p56 hash preimage was recovered.

## Reproducer

- Script: [`sims/lp2_p55_circumference_23byte_56013_sft.cjs`](../sims/lp2_p55_circumference_23byte_56013_sft.cjs)
- Manual workflow: [`.github/workflows/lp2-p15-56013-quotient-offset.yml`](../.github/workflows/lp2-p15-56013-quotient-offset.yml)
- Source data: `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, and `lp2-ink-annotations.json`
