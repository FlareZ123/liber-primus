# Fixed GP29 two-rune block-bijection gate

**Decision:** the original LP2 stream is incompatible with a fixed, bijective two-rune substitution under the tested global, page, line and word block clocks, assuming an English-like GP29 plaintext. This includes every invertible 2×2 Hill matrix and every other fixed bijection on the 841 possible GP29 digraphs. No unknown plaintext, authentic key or intended operation was recovered.

## Why this is a key-independent test

A fixed bijection F on GP29² permutes the 841 possible ordered rune pairs. If plaintext blocks are mapped independently by the same F, then for every plaintext pair x:

- the ciphertext count of F(x) equals the plaintext count of x;
- therefore the complete multiset of 841 pair frequencies is unchanged;
- in particular, the number of distinct pairs and the maximum pair frequency are invariant.

An invertible Hill transform P ↦ AP+b over GF(29) is one such bijection. No key enumeration is necessary. The invariant also applies to arbitrary fixed 841-entry digraph substitution tables, not only linear maps.

## Original input and tested clocks

Input is the canonical LP2 transcription and GP29 alphabet in `resources/liber-primus/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`: 12,956 runes, 2,896 words, 55 rune-bearing pages and 594 printed lines. Physical page 50 is the separate numeric table and contributes no runic symbols.

For each segmentation, both block phases (0 and 1) were tested. Pair blocks restart at the beginning of each segment for page-, line- and word-reset variants. The word parser preserves the established continuous word contract, including words carried across printed page turns. The control tokenizer is the existing GP29 orthography: longest-match digraphs, with the same QU→CW, V→U, K/Q→C and Z→S normalization used in prior native-GP studies.

## Original pair-frequency results

| Alignment | Phase | Pairs | Distinct of 841 | Maximum count |
|---|---:|---:|---:|---:|
| Continuous stream | 0 | 6,478 | 832 | 19 |
| Continuous stream | 1 | 6,477 | 838 | 17 |
| Page reset | 0 | 6,462 | 831 | 18 |
| Page reset | 1 | 6,439 | 832 | 18 |
| Printed-line reset | 0 | 6,333 | 833 | 20 |
| Printed-line reset | 1 | 6,029 | 831 | 18 |
| Word reset | 0 | 5,753 | 828 | 17 |
| Word reset | 1 | 4,307 | 834 | 13 |

Across all eight cases, the ciphertext uses 828–838 of the 841 possible pairs and no pair occurs more than 20 times. Its pair spectrum is close to the occupancy profile expected from a near-uniform stream.

## Native-English controls

Three independent source corpora were converted using the established GP29 tokenizer: Shakespeare (300,000-character excerpt), Gibran's *The Prophet*, and Emerson's *Essays, First Series*. Contiguous control windows were sampled at fixed 120-rune steps for global/page/line clocks; word-reset controls used consecutive source-word windows, sampled every ten words and truncated only at the final pair to match the original pair count.

| Alignment | Phase | Control windows | Distinct-pair range | Maximum-count range | Minimum sorted-profile TV |
|---|---:|---:|---:|---:|---:|
| Continuous stream | 0 | 4,732 | 397–469 | 93–226 | 0.4827 |
| Continuous stream | 1 | 4,732 | 411–470 | 97–221 | 0.4890 |
| Page reset | 0 | 4,732 | 393–477 | 91–244 | 0.4862 |
| Page reset | 1 | 4,732 | 396–474 | 93–250 | 0.4859 |
| Printed-line reset | 0 | 4,732 | 392–474 | 87–234 | 0.4824 |
| Printed-line reset | 1 | 4,732 | 393–469 | 86–226 | 0.4808 |
| Word reset | 0 | 14,048 | 264–341 | 136–367 | 0.5833 |
| Word reset | 1 | 14,036 | 243–325 | 128–434 | 0.5960 |

The sorted-profile total-variation (TV) distance is a descriptive distance between normalized, descending 841-bin frequency vectors. It is not a p-value. The stronger simple observation is that every sampled native-English control has substantially fewer distinct digraphs and a much higher maximum frequency than the original, for every tested alignment.

## Decision and scope

Retire a **single fixed bijective two-rune block map** on the tested GP29 clocks, including all invertible 2×2 Hill keys. The result is family-wide: it is not a rejection of only the previously tested p32 M7 matrix.

This does not reject:
- a key or pair map that changes between blocks, words, pages or sections;
- a stateful stream cipher or any transformation mixing symbols across block boundaries;
- a non-GP29 intermediate alphabet or a different plaintext language;
- a non-bijective map with an independently transmitted/recoverable restoration channel.

The result should prevent further unconstrained searches over fixed 2×2 Hill matrices or fixed digraph S-boxes. A successor needs an independently sourced changing-state rule or another reversible operation that can produce an original-cipher prediction.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_fixed_digraph_bijection_gate.cjs
```

The script asserts the canonical source counts and emits all original histograms, sampled control summaries and sorted-profile distances. It uses only Node built-ins and repository source/control files.
