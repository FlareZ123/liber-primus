# LP2 floral 13/31: direct original-table receivers are opaque

**Status:** bounded original-input negative / missing original decoder selector. **No LP2 unknown plaintext or key recovered.** This is a source-first contribution to Director #1293. It does not supersede the established 31-marker/32-interval observation.

## Human-visible causal clue, and its ambiguity

The original floral decorations repeated on physical LP2 pp40–55 (source JPEGs 57.jpg–72.jpg) contain five small marks on each side. A top-first, row-wise left-to-right reading using filled=1 and hollow=0 gives left `01101₂ = 13` (two hollow marks) and right `11111₂ = 31`. Original 57.jpg visibly reproduces these classes; the full 16-page repetition was previously reported by Agent24 in #1208. The manuscript separately has **31 physical thirteen-dot marks** (30 red, one black). The 31 marks define 32 intervals, and the original p49–51 table is precisely 32×8. This coincidence motivates a human investigation of a table receiver.

There remain distinct possible first steps: treat the 5-bit numbers as **row addresses 13 and 31**, or let 13 choose **thirteen-dot punctuation** and 31 select **all 31 instances** to address 32 intervals. The original artwork gives no independently authored instruction choosing either, no 0/1-based row convention, and no 3-bit column selector or byte-to-rune mapping. A physical count alone does not establish one. The separately finished #1208 31-marker/32-row word-direction transducer already failed authentic p0–2 language gates ([full gate](lp2-13dot32x8-word-direction-transducer-gate.md)); it is not rerun here.

## New frozen direct-row test on original p50 values

Input: `resources/liber-primus/lp2-grid-256.json`, canonical 256 values (0–255), byte-vector SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Values for each source-chosen row are exact; no ciphertext-driven fitting was used.

| Interpretation | Original 16 selected bytes, left row then right row | Raw ASCII printable |
|---|---|---|
| Zero-based rows 13,31 | `7a3f1fda0eb82073719eace6b424bd50` | 7/16, `z?.... sq....$.P` |
| One-based rows 13,31 (indices 12,30) | `de96482253e520ce908d2ad61638c6c0` | 6/16, `..H"S. ...*..8..` |

The first-party 2013 signed TCP challenge explicitly demonstrates `BASE29 3301 → 3QO`. Applying **that** base29 numeral serializer cellwise to row13/31 gives:

```text
46 25 12 7F E 6A 13 3S | 3Q 5D 5R 7R 66 17 6F 2M
```

No source instruction directs these numerals to an LP2 key or receiver. Interpreting each byte's low five bits as Tor-v2 base32 generates `2772oyatr6mgue5q` for zero-based rows 13/31, or `6wictfaoqnkwwyga` for one-based rows. These are **unvalidated strings**: every arbitrary sequence of 16 bytes maps to a syntactically valid 16-character base32 string after throwing away three bits per cell, so this is not evidence for an onion destination. Neither row pair is a directly readable ASCII instruction.

The earlier Cicada byte-XOR operation gives another strict, fixed two-row candidate: XOR corresponding cells of the two selected rows, without scanning offsets or keys. Zero-based gives \`0ba1b33cba9c9d23\` (ASCII \`...<...#\`); one-based gives \`4e1b62f445dde60e\` (ASCII \`N.b.E...\`). Neither is an eight-byte plaintext instruction or recognizable typed file header. This is a negative for only the rowwise XOR consumer.

**Independent length-match algebra gate.** The original 256 byte coefficients have a previously established exact GF29 degree-16 polynomial factor yielding a 240-coefficient quotient, matching physical p39's **240 runes** ([existing original quotient report](lp2-p39-q240-p15-blockmix-original-gate.md)). The two eight-cell selected rows provide precisely **16 coefficients** of a candidate *monic* degree-16 factor. This is a source-motivated, decisive divisibility test, with zero or one-based rows and two conventional coefficient directions fixed in advance. For each candidate \`X^16 + a15 X^15 + … + a0\`, take the 16 raw row bytes modulo29 and divide the unchanged original grid polynomial over GF29. Results:

| Row address | 16 coefficients | Nonzero remainder slots / 16 | Quotient positions matching p39's original rune indices / 240 |
|---|---|---:|---:|
| Zero-based 13,31 | Printed order | 16 | 4 |
| Zero-based 13,31 | Reversed | 16 | 10 |
| One-based 13,31 | Printed order | 15 | 4 |
| One-based 13,31 | Reversed | 16 | 5 |

**All four polynomial factors fail exact divisibility.** A true factor would have sixteen zero remainder coefficients. This decisively rejects the 13/31-row-as-factor interpretation in this GP29 reading and avoids guessing a secret 16-coefficient polynomial. No key/unknown plaintext emerged from these additional direct gates.

A second concrete source-typed reading uses the shape 32×8 and byte domain 0–255 as a complete **self-addressing transition table** `next_state = T[state]`. Two literal five-bit seeds 13 and 31, and two crossed-bit coordinate seeds `(row13, col31 mod8)=111` and `(row31, col13 mod8)=253`, all converge to the same **11-cycle**. The literal seeds have paths of 17 and 15 states, and coordinate seeds paths of 12 and 18 states. Their byte streams contain no complete typed ASCII instruction, file header with structure, or recognizable first-party key. Even this interpretation requires an unauthenticated convention for the initial table address and output register.

## Source-selected deletion of two eight-cell rows: 30×8 = 240 p39 runes

There is a second, non-polynomial use of the same 13/31 address pair: **delete** those two 8-cell rows from the 32×8 original table. Exactly 240 ordered cells remain, matching original physical p39's **240 GP runes**. This gives a concrete complete-receiver hypothesis, distinct from the prior exact 16→240 polynomial quotient. The operation is source-contingent: original artwork does not say which original page should receive the residue tape or how a byte maps into GP29; the p39 match motivates this bounded test.

Freeze the two original row origins and test a direct cell-to-GP map `byte mod 29` in source physical order, with the two natural additive polarities `P = C ± (byte mod29)`. Preserve every one of p39's 240 runes and no padding, key fitting or moving word boundaries. Original p39 baseline IoC is 0.03577406, while solved clear p57 is 0.06270997. Results:

| Deleted rows | IoC of 240-symbol residue tape | `C − T` IoC | `C + T` IoC | Identical original symbols in untransformed p39/tape |
|---|---:|---:|---:|---:|
| Zero-based 13 and 31 | 0.03716876 | 0.03668061 | 0.03518131 | 2/240 |
| One-based 13 and 31 (indices 12,30) | 0.03661088 | 0.03671548 | 0.03511158 | 3/240 |

Neither candidate reaches a native-GP-English rune distribution. Source-preserving addition/subtraction re-encrypts the full original p39 exactly as a mathematical consequence and a native **p57 95-rune planted control** recovers exactly under both signs, confirming implementation. This is *not* evidence of authentic decryption. A global secret monoalphabetic relabeling of the 240-row residue tape cannot directly yield p39 either: the sorted rune-frequency multisets already disagree. The residue tape's largest repeated symbol appears **19** times, while original p39's largest appears **14** times, an invariant under any secret permutation of the 29-symbol alphabet.

This eliminates the direct **13/31-row deletion plus original-order GP29 stationary substitution or additive pad** model for p39 plaintext recovery. A wholly different 240-position stateful decoder remains mathematically possible, but nothing in the original instructions selects one. Avoid promoting the 30×8 equality to a key or another self-validating ciphertext fit.

## Falsifiable boundary and decision

The 13/31 motif plausibly names a **source event set**, but it does not uniquely name a reversible operation on original GP29 ciphertext. The direct two-row raw-byte and authored `BASE29` receivers fail to yield an independently recognizable message. The self-addressing direct map does not resolve the missing key/operation. **Do not expand to arbitrary bit traversals, modulus sweeps, permutations, synthetic row ciphers, or bulk onion-name guesses** without a separate first-party selector. The original 32-interval relation is still observationally real, and a future author-selected column/key/clock would reopen a *different* receiver; it is presently missing.

**Reproduction:** `node sims/lp2_floral_13_31_direct_receiver_sft.cjs`. The CJS script hashes the original 256 bytes, checks the visible 13/31 interpretation, verifies the signed 2013 BASE29 example, lists direct row bytes, source-typed XOR and null base32 strings, traverses four fixed table seeds, and tests four nonfitting degree-16 GP29 polynomial divisors against the intact original p50 table and p39 runes. It does not alter any source.
