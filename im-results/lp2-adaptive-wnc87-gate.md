# WNC87 finite adaptive arithmetic receiver (#3142)

**Decision (27 November 2026, Agent 5):** reject one frozen direct, unencrypted adaptive arithmetic + canonical full-byte/BASE29 representation. All nine original physical chapter frames and the whole unknown book fail. Eight native solved records and twelve longer independent literary controls invert exactly; none of 24 altered native controls is canonical. No original plaintext, key, or continuation recovered. This is a bounded exploratory codec exclusion, not evidence that the historical author used arithmetic coding.

## Source and distinctness

- Ian H. Witten, Radford M. Neal, John G. Cleary, *Arithmetic coding for data compression*, CACM 30(6), 520–540, June 1987, [DOI](https://doi.org/10.1145/214762.214771), [paper](https://web.stanford.edu/class/ee398a/handouts/papers/WittenACM87ArithmCoding.pdf), Figs. 3–4. The actual adaptive-model and byte routines were inspected in the paper. This implementation uses its 16-bit inclusive arithmetic interval, 14-bit frequency limit, EOF, adaptive order-zero frequency model and frequency-rank tie swaps, with GP29 instead of ASCII.
- [Signed 2013 BASE29 source](../resources/external/2013-tcp-server-signed-source.md) supplies ordinary positional radix conversion. Neither LP2 nor this source specifies arithmetic coding or our byte framing.
- This is not #3129's fixed solved-frequency exact rational shortest radix29 cylinder, #1473's static rank28/EOS model, nor #2884's adaptive LZW dictionary. No key, hidden dictionary, original-specific probability count, word reset, or selected offset is added.

## Frozen exact receiver

The GP29 indices 0–28 start in chart order, with EOF=29. All 30 model counts initially equal one. Encode the current symbol using descending cumulative counts; after each non-EOF symbol, if the total is 16383, halve counts rounding up. Move the symbol to the front of its equal-count group by swapping labels and then increment its count. Use interval endpoints 0 and 65535 inclusive, the published half/quarter E1/E2/E3 renormalization, delayed opposite bits, final explicit EOF and the published final disambiguation. Pack emitted bits least-significant-bit first inside each byte. The published unconditional final flush yields a zero byte if already aligned. The inverse allows the paper's bounded post-EOF bit-reader convention (up to 14 extra byte reads of ones), then requires exact full-byte canonical re-encoding; no guessed trailing padding or arbitrary cutoff.

To retain leading zero bytes losslessly, for m bytes choose n=min{k:29^k >= 256^m} and encode the big-endian integer with exactly n GP29 digits, padding leading GP0. Because successive powers of 256 grow faster than powers of 29, n selects at most one m. On input, require that n is a legal width and the integer fits m bytes. Re-encode the complete byte stream and all n original GP digits. This full-byte-width convention is an analyst choice; the historical BASE29 command alone does not select it. It deliberately differs from the prior direct-file test's ceil(n log2(29)/8) minimal/fixed byte reads. Do not interpret a width failure as an arithmetic-model failure independent of the framing.

SFT [source](../sims/lp2_adaptive_wnc87_sft.cjs) was frozen at [8026276](https://github.com/FlareZ123/liber-primus/commit/80262761518df7966a10291849fc3c106d3466bc), before the original receiver evaluation. Numerical core executed against exact repository inputs in connected V8; standalone Node wrapper/CI not independently executed. [Raw output](lp2-adaptive-wnc87-output.json) pins all six blob IDs and each exact outcome.

## Calibration

Eight authentic native records (LP1 clear p3,8,9,10,11,14 and solved LP2 p56/57) recover every input symbol and re-encode exactly. Twelve independently sourced Emerson, Gibran and Shakespeare donor prefixes, lengths 308, 729, 3008, 12956 each, all round-trip. These prefixes overlap within each donor and are descriptive, not independent hypothesis-test replicates. An empty frame, all 256 single-byte framing values, selected leading-zero byte arrays and a 20,000-rune stress control with an actual model rescale also pass. The p56 prime-minus-one decipherment is explicitly checked. Byte truncation, byte extension, and wrong initialization (first symbol count two) on each of the eight solved-native frames: zero of 24 canonical under the attempted receiver. These controls do not prove that all corruptions must fail; another valid codeword is possible.

| 12,956-rune literary donor | Encoded GP digits | Adjacent repeats | Repeat fraction |
| --- | ---: | ---: | ---: |
| Emerson | 11,398 | 384 | 3.3693% |
| Gibran | 11,427 | 429 | 3.7546% |
| Shakespeare | 11,391 | 413 | 3.6260% |
| Original unknown LP2 | 12,956 | 86 | 0.6638% |

The three long donors predict encoded/native rune ratios 0.8792–0.8820 and repeat rates 3.37–3.75%. Even after normalizing by encoded length, the original repeat rate is far below all three; this is descriptive evidence, not a universal repeat bound. No output-length or repeat count was fitted to original values.

## Original exact results

Use the nine original visual chapter ranges and the full unknown book, including rubric runes, omitting only punctuation and rune-free p50.

| Original frame | Digits | Result |
| --- | ---: | --- |
| p0–2 | 729 | Impossible full-byte width |
| p3–7 | 1145 | Integer exceeds 695-byte capacity |
| p8–14 | 1729 | Impossible full-byte width |
| p15–22 | 1903 | 1155 bytes; EOF after 7 native symbols, canonical encoder only 6 bytes |
| p23–26 | 1021 | Impossible full-byte width |
| p27–32 | 1433 | Integer exceeds 870-byte capacity |
| p33–39 | 1680 | Integer exceeds 1020-byte capacity |
| p40–53 | 3008 | 1826 bytes; EOF after 12 native symbols, canonical encoder only 9 bytes |
| p54–55 | 308 | Integer exceeds 187-byte capacity |
| p0–55 | 12956 | Integer exceeds 7867-byte capacity |

**0/10 canonical**: 3 impossible digit widths, 5 integer overflows, 2 noncanonical EOF. Both arithmetic-legal byte frames independently reach an early EOF and fail exact replay, so no candidate text is reported. The first eight failures are specific to the declared byte/rune framing, not rejection of WNC arithmetic coding in isolation.

**Director fork:** retire this exact combined receiver. An alternate frame requires independent source evidence specifying how original rune lengths and byte boundaries are encoded, along with the actual adaptive coder selector. No parameter or padding rescue sweep; retain arbitrary other adaptive coding and encryption layers outside this finite result. The absence of an authenticated compression instruction remains the substantive gap.
