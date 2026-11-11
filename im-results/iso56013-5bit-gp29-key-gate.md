# 2013 DATA/560.13: source-fixed 5-bit GP29 key gate

**Classification:** bounded original-cipher negative on the locally reconstructed prefix. No plaintext, key, cipher mechanism or destination recovered.

## Hypothesis and causal path

The 2013 Cicada source page \`resources/external/2013-0-wisdom-source.md\` explicitly says that primes and the totient function are sacred and that all things should be encrypted; its table also contains the word **MOBIUS**. The separate CicadaOS \`DATA/560.13\` member is a high-entropy byte stream. LP2 uses a **29-symbol** GP alphabet, so packing the 2013 bytes into 5-bit symbols is a natural byte-to-symbol candidate: five bits provide 32 values, with 29 valid GP symbols.

The weakest assumption is that this 2013 data file is an LP2 key at all. Neither the 2013 source nor the 2014/LP2 material explicitly says to pack \`DATA/560.13\` into 5-bit symbols. This is a cheap, source-motivated test of one direct-key interpretation, not a claim about authorial intent.

## Locked test

The full \`DATA/560.13\` member is reported as **118,818,811 bytes**, SHA-256 \`db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f\`. The local resource is only the independently reconstructed **15,330-byte prefix** at \`resources/derived/cicada2013-56013-reconstructed.bin\`; its reconstruction and the known phone-message control at byte offset 12821 are documented in \`resources/derived/cicada2013-56013-reconstruction.md\`. The prefix is long enough to provide 12,956 key symbols from each tested start.

The 80-model grid was fixed before scoring:

- Byte offsets **0, 133, 331, 449, 1109**. Offset 0 is the natural file start; 133 and 331 are the 2014 onion7 HTML title and div-id values; 449 and 1109 are the source-derived selectors used in the existing 2013 prime/gap sequence work.
- Five-bit packing **MSB-first** or **LSB-first**.
- Invalid values 29–31 either **folded modulo 29** or **rejected**.
- Both additive signs, \(P_i=C_i\pm K_i\pmod{29}\).
- Continuous-book or page-reset key clocks.

This tests direct additive 5-bit keys only. It does not add a skip/coin rule, reverse the stream, search arbitrary offsets, or compose another cipher layer. The existing direct byte-to-GP29 screen at four 256-byte slices remains separate (\`sims/cicada2013_56013_offset_xor_lp2_gate.cjs\`).

## Results

The original 55-page unsolved stream contains **12,956 runes** and has IoC **0.0344783979**. A 62,550-rune Gibran GP29 English control has IoC **0.0584001684**. All 80 candidate decoders passed exact planted-English encrypt/decrypt controls.

| Statistic after the full 80-model search | Observed prefix | Matched random-prefix null |
|---|---:|---:|
| Maximum full-book IoC | **0.0345380243** | median 0.0345401691; 95th percentile 0.0345684333; maximum 0.0346171211 |
| Maximum page IoC (pages with at least 140 runes) | **0.0396465250** | median 0.0400044388; 95th percentile 0.0415422886; maximum 0.0424098848 |

The observed best full-book result is at the **41st percentile** of 100 matched random 15,330-byte sources subjected to the same 80-model search. The best page-local result is at the **29th percentile** of the corresponding page-local null. The best full-book candidate is offset 449, LSB-first, reject, continuous, negative sign; the best page-local candidate is offset 0, MSB-first, reject, page-reset, positive sign (p15, 159 runes). Neither approaches the English control.

The results are consistent with random-key output, not plaintext recovery. The test therefore rejects this direct 5-bit mapping at the five selected offsets in the reconstructed prefix.

## Scope and next decision

This closes one of the specific byte-to-symbol gaps listed in the external \`pnotisdev/cicada3301\` status. It does **not** reproduce or extend the external full-file offset campaign, and it does not test the remaining 118 MB of \`DATA/560.13\`. It also does not exclude the distinct byte-to-symbol map “XOR with rune index,” skip/coin channels, or other non-additive constructions.

**Decision:** do not expand this branch into arbitrary-offset or layered key hunting. Reopen only if an independent Cicada clue selects a new offset or a different reversible operation.
