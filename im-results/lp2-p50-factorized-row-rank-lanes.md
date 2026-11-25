# Factorized p49–51 row ranks: distinct subset and ordering payloads

**Agent29, 2026-11-24.** Exact original-input negative for a distinct fixed lossless transport. No recovered plaintext, authenticated key or deep-web destination.

## Decision

The 32×8 printed numeric table has eight distinct byte values in every physical row under both candidate radices. #2626 ranks the entire ordered 8-of-256 tuple as one integer. This merges two independently recoverable properties: the choice of eight values and their ordering. A split carrier is a different hypothesis, specifically because 8! = 40,320, so each ordering rank fits a 16-bit word, and all 32 physical rows give exactly 64 bytes (the length of p56's printed digest). This is a source-shaped experiment; neither the split, the rank convention nor SHA-512 is explicitly instructed by the author.

Freeze the original row order, zero-based lexicographic subset rank among C(256,8)=409,663,695,276,000 choices, and lexicographic permutation rank relative to the sorted eight values. Pack subset ranks into 49 bits each, MSB-first continuously (196 bytes), and ordering ranks into 16-bit big-endian words (64 bytes). The two lanes together (260 bytes) uniquely determine every original row. The separate #2704 colex 7-byte subset field (224 bytes) also round-trips all rows under both radices but cannot carry a complete printable text or OpenPGP packet directly; it does not change the ordering lane. See the final section. Compare each complete lane and their subset-first concatenation literally and under SHA-512 to the p56 printed target. Also test whether the ordering lane is SHA-512 of the subset lane, i.e. an internal checksum. No tuning or candidate substring search.

## Executed original result

| Input | Subset ASCII | Ordering ASCII | Literal p56 / SHA-512 match | Ordering = SHA-512(subsets) |
|---|---:|---:|---|---|
| Base60 | 64/196 | 38/64 | 0 / 0 | false |
| Base59 | 77/196 | 38/64 | 0 / 0 | false |

Both lanes and their concatenation are invalid strict UTF-8 in both cases. All 256 cells recover exactly from the split in each radix. The 64-byte ordering lane is radix-invariant because the two digit interpretations are strictly order-preserving on the source tokens:

```
71bc256273603aab7029439589db94434c4b6808545b728f82726bbc2f4839d89b4e079321ec51ad6f3786af91455a3b0d4f56e521c361d62b1423ca58092e5d
```

SHA-512 of that lane:
```
c206868bba8bf1c687101e754a8418f1f044e86cc38423f78ae1d8cc0c07eacbebeff63a36b3b86be5f05539e19ec039c8a0acd7a755afdf0d5d283038ff1fbc
```

SHA-512 of 196-byte subset lane:
- Base60: f9fb050aaa8912168bdeaf91ccef69f748387de8a94cd65ca5c208088a67faa9ce622fdd98825342aba97a58b74f1ef06b09da0efa1d19c4f98a242fda3d917e
- Base59: f6465559828d474e0cf742858bc83b6a628b7aceea2f2fa76b5339444b647050db200dc631218fdf381c9d5ab641c14fae37d0abc10f112b28e004a0dd8fe647

SHA-512 of 260-byte subset-first concatenation:
- Base60: 5612694f2519346a1e8753e2388f7acc5751ebcc7b3aade4bb1dc7644cb783bc1bdbca51dc884995adf1abaa9e777fac1e0c1680f9af2f69c4ad436bd54e5ab7
- Base59: 2f83d772ad5dc607b68309451539b2c94bb9afc16f5fd8dca310fa7d2a31ec4cfb57a443cd628f032e7c065c173b3d1bc4752cf9fd1db2fa74ccca480b480a99

**Stronger necessary obstruction:** six of the printed p56 target's 32 big-endian 16-bit words (zero-based positions 2,14,20,28,29,31) are ≥40,320. Consequently no ordering of *any* 32 eight-element permutation ranks can literally encode this digest using the fixed two-byte representation, even with arbitrary row ordering or alphabet permutations. This is a bound on the literal transport, not on SHA-512 preimages, other encodings or the underlying table's role.

## Reproduction and limits

Run `python sims/lp2_p50_factorized_rank_sft.py` from the repository. Executed in the local Python runtime on the exact 256 tokens retrieved from [canonical grid](../resources/liber-primus/lp2-grid-256.json). Decoded base60 byte SHA-256 is 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290, matching the earlier report; base59 is 511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79. Script emits all ranks, exact bytes, source hashes, candidate hashes and results. All lexicographically enumerated combinations n≤9 and permutations k≤7 matched their independent enumeration rank and inverse. A fixed-seed 32-row full-width plant including minimum and maximum ranks recovered all 64 planted ranks; SHA-512 abc known-answer passed.

Retire this fixed split as literal digest, SHA-512 preimage, internal checksum or direct UTF-8 transport. This is narrower than the underlying claim that the table separates data from order. The ordering lane's radix invariance means it cannot select base59 versus base60. The 64-byte length is structural, not evidence of a meaningful hash. Do not tune ordering/packing or arbitrary key receivers on these negatives.

Related: [joint ordered rank](lp2-p50-ordered-row-enumerative-rank-gate.md), [independent tree-sibling 64-byte lane](lp2-p50-base59-siblingrank64-p56-original-digest-gate.md), [rank-based key clock](lp2-p50-rank8-keyclock-fhold.md).

## Director #2704: fixed-width colex subset lane

Agent18, 25 November. The ordering representation is identical to the earlier section; its 64-byte value and six impossible p56 words are reused, not treated as new evidence. The only new encoding is colex combinadic rank `sum_i choose(s[i],i+1)` for ascending eight-element subsets, serialized in the smallest whole-byte width (7 bytes per physical row, 224 total). Preserve 10|13|9 original row breaks. The frozen grid blob is 2550eae357442912220e05dc51147523a61dd75a. No alternate endian/order or additional hash tested.

| New subset lane | Base60 | Base59 |
|---|---:|---:|
| Exact restored source cells | 256/256 | 256/256 |
| Bytes | 224 | 224 |
| Printable ASCII | 84/224 | 73/224 |
| Strict UTF-8 | invalid | invalid |
| First byte | 00 | 00 |
| Direct p56 digest | impossible (length) | impossible (length) |

The colex rank space is 409,663,695,276,000, so every seven-byte field starts with 00 or 01. This is a **key-independent obstruction** to a direct complete printable ASCII text or an OpenPGP packet beginning at the first byte, even under arbitrary source row reorderings or subset selection. The usual PNG/JPEG/ZIP/GZIP file signatures likewise cannot begin with that byte. No stripping leading field bytes, embedding-offset search or format expansion is authorized. The actual order lane starts 71, not a binary OpenPGP header, and has invalid UTF-8. Both radices share its exact bytes because their digit mappings preserve ordering. No native typed object or independent receiver is supplied.

Controls: 7,800 exhaustive small-domain ascending-bitmask/colex rank and inverse comparisons; 32 independently planted colex ranks including both extrema recover exactly; an independently selected legal 64-byte ASCII order-lane message recovers 64/64. In 256 seeded matched random distinct-row tables, no complete ASCII or strict UTF-8 stream appeared; 57/256 ordering lanes had a high-bit header, illustrating that such a header alone is not a typed packet. No random lane equals p56. Full output retained; no GnuPG invocation was needed for the original lanes because their first bytes cannot mark binary OpenPGP packets, and no armored text framing was present.

Reproduce [SFT](../sims/lp2_p50_colex_order_channel_sft.cjs), frozen 717b152d564ec012716f8f35d918ac8816b42a9d; [raw](lp2-p50-colex-order-channel-output.json), f127d43530306a80486d0d2c1533b5e73fc8710c. Exact core executed in connected V8, not independent Windows CI. The original lexicographic 49-bit lane and previous checksum checks were not rerun. Retire the stated separate-channel representation as direct typed transport; it remains a lossless recoding, not evidence of an authentic cipher or key.
