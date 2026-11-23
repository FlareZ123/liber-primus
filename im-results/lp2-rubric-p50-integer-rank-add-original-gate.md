# LP2 natural-rubric rank shift by original p50 byte stream

**23 November 2026 · Agent20 · Director #2329.** Full original-input Windows Node22 [PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45089997111). Reproducible read-only [source SFT](../sims/lp2_rubric_p50_integer_rank_add_original_sft.cjs). **Decision: this one frozen, source-shaped integer-rank bridge produces no unknown plaintext or author-selected key.** All 56 unknown LP2 physical pages remain unsolved.

## The tested historical premise, and what is missing

The untouched book has 29 separate physical large-red ⁜ termination sites, giving 29 independently capacity-sufficient word-class rank blocks, with rune lengths exactly `[13,716,16,103,3,690,11,308,14,1729,9,11,1883,16,1005,19,1414,10,81,8,746,553,161,3,118,2474,534,9,299]`. The p49–51 source panel supplies 256 printed two-digit values, transcribed in original row-major order, with a candidate conventional base60 byte readout. Earlier Cicada material demonstrated bytewise XOR and numeric transforms. **No authenticated first-party instruction links these bytes to a whole-integer arithmetic rank cipher.** This run therefore tests exactly one predeclared demonstration rather than claiming the operation was intended.

At each original giant-red rubric block, every original printed word has a fixed length `n` and observed adjacent-equal count `e`; its exact GP29 rank lies in the codebook of size `29·C(n−1,e)·28^(n−1−e)`. Mix those ranks lexicographically in original word order to form `0 ≤ R < M`. This preserves original word structure, all 63 within-word adjacent repetitions, and the complete 12,956-rune source.

For each block, consume `ceil(bitlength(M)/8)` bytes from the original table's **big-endian, continuous, cyclic 256-byte stream**; turn them into an integer `K` and reduce modulo `M`. The exact reversible candidate is

```text
cipher rank R = (plain rank T + K) mod M
candidate T = (R - K) mod M
Q = 26^N
P = floor(T * Q / M)
E = T - ceil(P * M / Q)
recover T = ceil(P * M / Q) + E
```

Here `P` is a full fixed-length Latin26 plaintext integer, `E` is its original rank-surplus residual, and `N` is the group's original rune count. The 29 blocks consume **7,797** cyclic table bytes. An authored no-sidecar plaintext sender could choose `E=0`; arbitrary source ciphertext has a recoverable, bounded `E` and re-encodes perfectly. This algorithm is deliberately different from previously rejected characterwise GP29 p50 masks and does not silently use invalid out-of-range XOR. Wrong-key and format-preservation controls are specified in the source SFT.

## Complete original evaluation

| Receiver | Original IoC | Reversed p50 bytes | One-byte-rotated p50 bytes | True-key historic Latin26 control | Wrong-key historic control |
| --- | ---: | ---: | ---: | ---: | ---: |
| Intact p16–21: 1,613 runes | **0.038482306** | 0.038693832 | 0.038456154 | **0.071742619** | 0.038408465 |
| Disjoint p40–53: 3,008 runes | **0.038304683** | 0.038412145 | 0.038523808 | **0.069557557** | 0.038490198 |

Whole-book original `IoC=0.038436312`, close to uniform `1/26=0.038461538`, versus **0.069031031** for a full 12,956-letter planted Cicada-era *Book of the Law* Latin control. The machine test recovers **all** planted 12,956 source letters after keyed encryption, verifies 12,956/12,956 original-cipher rune replay and every original per-word repeat class, and prints 240 contiguous letters from each disjoint original receiver. Neither receiver displays sustained readable English or a typed instruction. **Only 9/29 original rubric groups** have zero rank residual under this proposed key (the keyless source-order model has 6/29); therefore a canonical `E=0` writer using this exact key/order is independently incompatible with most original groups.

**Cryptanalytic scope:** original replay is inevitable for any well-implemented bijective rank shift and cannot authenticate a key. The positive control is an actual Cicada-used literary plaintext, but it is planted, not recovered from LP2. This run retires only the **given row-major base60 bytes, continuous cyclic big-endian integer addition modulo exact word-class rank, fixed 29 original red-rubric groups, and Latin26 digit output**. It says nothing about true author-selected rank mixing, segment clocks, other ciphers, or a missing historic key. Further rank variants need an independently visible operand, rather than language-scored phase/byte/order adjustments.

## Next causal decision

The recoverable surplus `E` and 29 red original frame boundaries provide a mathematically correct transport layer, yet neither specifies a historical decoder or authentic plaintext. A new source clue would need to determine the *rank operation and reading convention* before opening an unknown passage. The next research priority should look for a first-party instruction or external key material, rather than optimizing this failed integer shift.