# Primitive-root ordering of LP2's 28 nonzero transitions

**Status:** intermediate negative. This is a fully reversible, source-motivated candidate tested on the original runes and native controls; it is not an authenticated Cicada operation, recovered key, or plaintext.

## Hypothesis and frozen operation

The 29-symbol Gematria Primus alphabet gives a natural field F29. The solved "Some Wisdom" text explicitly names primes and the totient function; φ(29)=28, and 2 is the least positive primitive root modulo 29. Its powers enumerate all 28 nonzero residues:

1, 2, 4, 8, 16, 3, 6, 12, 24, 19, 9, 18, 7, 14, 28, 27, 25, 21, 13, 26, 23, 17, 5, 10, 20, 11, 22, 15.

This suggests one precise ordering of the 28 nonzero transitions, rather than an arbitrary 28! table. Freeze the following variable-length receiver:

1. The first original ciphertext rune is the seed and is not emitted as plaintext.
2. For each later ciphertext rune, compute dᵢ = (Cᵢ − Cᵢ₋₁) mod 29.
3. If dᵢ=0, treat the repeated ciphertext rune as a block delimiter.
4. Otherwise replace dᵢ by eᵢ = log₂(dᵢ) in F₂₉*; eᵢ is a base-28 digit in 0…27.
5. Convert each complete big-endian base-28 digit block to base-29 positional digits, preserving the number of leading zero digits. Do not reset at page boundaries; page carries are continuous. Every output rune, including F, is ordinary data; there is no transparent-F clock, fitted key, salt, or extra side channel.

The inverse is exact: convert each plaintext block from base 29 to base 28 with leading-zero preservation, map each digit e to 2ᵉ mod 29, accumulate those nonzero differences from the prior ciphertext rune, and insert an equal ciphertext rune between blocks. This gives a complete forward encoder and inverse for the stated block format.

The operation is motivated by the prime field, φ(29), and the source's explicit prime/totient language. The manuscript does **not** uniquely instruct a solver to choose primitive root 2, use repeated transitions as delimiters, or apply this radix conversion; that selector remains a hypothesis.

## Original-cipher and native-control results

The frozen implementation exactly re-encrypts the complete 12,956-rune original tape. The original seed is GP15, there are 86 repeated-transition delimiters and 87 blocks, and the inverse emits 12,760 candidate GP29 runes (196 fewer than the source tape).

| Frozen original region | Complete blocks | Candidate runes | IoC | Native-GP trigram nats/rune | 128 within-block shuffle nulls ≥ actual |
|---|---:|---:|---:|---:|---:|
| p0–p2 | 4 | 644 | 0.03571670 | −3.42981087 | 43/128 |
| p16–p21 | 8 | 1,389 | 0.03424395 | −3.43971625 | 113/128 |
| Full unknown tape | 87 | 12,760 | 0.03450367 | −3.43768394 | — |

The trigram model is trained on seven of nine solved GP29 source sections, holding out WELCOME and the second KOAN. The shuffle null independently permutes the frozen primitive-root digits within each original block, preserving each block's digit multiset and length, then applies the same base-28→base-29 conversion; xorshift32 seed 3301 fixes the 128 shuffles. Neither original region is distinguished from its within-block null. The first 120 transliterated opening symbols are JSOEXNGUNGHRTCFWDMNGEONGUUTINBBEADNGNGHSGDHGAEXCYMORGGEAEOJHORPWYIADPESOHROEAEDLNGBAEDHTDDHBPIATYNEDJDDOWWOEYGIAHUTHRPIATHAIAFPIYTHTOAYIUYUOJBJ; the disjoint p16–p21 region begins THBIAEAONGEENXOAENAEFIAFGMJXNGCIAJMDGBCOEANFMYWBLBIAXXNLMWEOSHEAFHIBDMDCMAPFFEALOYAEFMWIASCNGHXGXOEUIAAEAENGTRRDIEEASTUTHFMGSXUXEOCSSENGBGEBEAEOM. These are nonlinguistic streams, not plausible plaintext.

The two independent native controls are the 515-rune WELCOME and 319-rune second KOAN. Each was split into fixed 128-rune plaintext blocks, encoded with a distinct public test seed, then decoded and re-encoded exactly. Recovery is 515/515 and 319/319; the resulting ciphertexts contain four and two inserted repeat delimiters respectively. This validates the inverse, not its historical use.

For comparison, Agent25's direct ordinal ordering of the same nonzero transitions produced p0–p2 trigram −3.432625 (55/128 shuffles at least as good) and p16–p21 −3.434132 (77/128 at least as good). The primitive-root order does not improve the disjoint original holdout; do not continue with other generators or radix permutations absent a new source selector.

## Original-image mark-carrier audit

The 27 red 13-dot marks on unknown pages all have the same normalized 3×9 occupancy pattern:

    010
    101
    010
    101
    010
    101
    010
    101
    010

The three red 10-dot marks likewise share one 3×7 template:

    010
    101
    010
    101
    010
    101
    010

The separate black 13-dot mark is not included in this red-ink morphology comparison. Thus the red ornaments' internal dot geometry does not supply independent per-dot exception bits. The pattern audit reads the original page images (LP2 page p uses image p+17); it does not infer glyph positions from decoded text.

The canonical corpus/ink annotations give 213 red runes in 16 red spans and 86 within-page repeated transitions. Only one repeated pair is wholly inside a red span (p27, rune offset 229). None of the 86 repeat transitions lies within one rune of any of the 31 large punctuation marks; the nearest is p27's mark at offset 19 to a repeat at offset 15 (raw offset difference four). This rejects a direct local red-span/large-mark exception marker. It does not exclude a global key or a code in the positions of the marks or red spans.

## Research consequence

This candidate is rejected narrowly: primitive-root discrete-log ordering plus repeat-delimited base-28→base-29 conversion does not recover native prose on the original. Exact forward replay and planted native controls are necessary but not sufficient.

The larger enumerative question remains open. The fixed-length exact-repeat-mask model needs 446 side-information bits across the 55 pages; the red/special-mark ceiling previously established is at most 275 bits. Printed word-boundary positions have 9,638 bits of combinatorial capacity, so a universal capacity impossibility does not follow. However, no independently source-selected reversible mapping from those positions to the missing information has been found. The earlier physical-line-framed and direct repeat-delimited radix inverses fail native-language tests; the self-contained histogram inverse also replays the original but produces no long native-language matches. A genuine external sidecar remains possible but must be source-authenticated.

**Next decision:** do not repeat the direct ordinal rank, other primitive-root permutations, line-rank, or histogram/type-class sweeps. Reopen this branch only when an original clue selects a concrete word-boundary operation or an authenticated external object supplies the missing state. Otherwise redirect compute toward a distinct route to authentic plaintext or key material.

## Reproduction

- node sims/lp2_repeat_delimited_primitive_root_radix_sft.cjs
- python sims/lp2_large_mark_morphology_sft.py
