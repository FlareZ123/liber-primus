# Original p49–51 256-cell grid cannot be a stationary one-byte/two-rune codebook

**Agent12, 23 November 2026. Bounded capacity result, not an LP2 plaintext recovery.** Exact Windows Node22 source test [PASS 45274984753](https://github.com/FlareZ123/liber-primus/actions/runs/45274984753), executable [SFT](../sims/lp2_grid256_digraph_codebook_capacity_sft.cjs).

## Source premise and the proposed direct inverse

The manuscript itself prints a **32×8 panel of 256 radix60-looking two-character tokens** across original physical p49–51. A historically plausible byte representation, and a tempting way to give the panel a direct cryptographic role, is a lookup table for a *fixed* code mapping one byte to a pair of consecutive GP29 runes. A single, stateless 256-entry reversible code can output at most **256 distinct ordered rune pairs**, regardless of its private table contents or ordering. The same is true if the author selected a fresh fixed 256-entry table at each authentic visual chapter boundary. Since no source selects the digraph's starting phase, both 0 and 1 are tested independently, without choosing the better phase.

Rival readings: the panel is ciphertext, pad material, or a key schedule; alternatively the stream uses **changing state or base conversion** so that the pair representation depends on predecessor, page, clock or carry. This result makes no claim against those architectures.

## Original-input decision

The exact canonical [12,956-rune p0–55 transcript](../resources/liber-primus/lp2-corpus.json), including the runeless printed p50 and true physical page mapping, yields **832 different ordered GP29 digraphs** at book-global even alignment and **838** at odd alignment. Both are near the alphabetic capacity 29²=841 and far exceed 256.

Even giving the hypothetical codebook a separate freely chosen fixed mapping at **each one of nine printed chapters**, the first eight chapters individually exceed its 256-codeword capacity in **both** possible local pair phases:

| Physical LP2 pages | Rune count | Distinct pairs, phase 0 / phase 1 |
|---|---:|---:|
| p0–2 | 729 | 303 / 303 |
| p3–7 | 1,145 | 414 / 403 |
| p8–14 | 1,729 | 532 / 537 |
| p15–22 | 1,903 | 573 / 556 |
| p23–26 | 1,021 | 373 / 387 |
| p27–32 | 1,433 | 482 / 495 |
| p33–39 | 1,680 | 518 / 530 |
| p40–53 | 3,008 | 700 / 688 |
| p54–55 | 308 | 138 / 140 |

The **256 original [grid bytes](../resources/liber-primus/lp2-grid-256.json)** additionally contain only **161 distinct values**. Their byte multiplicity histogram is: 95 absent values; 92 values appear once, 49 twice, 14 three times, and six four times. No rearrangement of its 256 printed cells makes this byte multiset a permutation of all 0..255, so it cannot directly be a classical **bijective byte S-box** without an additional operation.

## Decision and boundary of the exclusion

A *direct fixed codebook* in which every byte always emits a single two-GP29-rune codeword is mathematically inconsistent with the unchanged original ciphertext, both book-global and per-chapter, whether the 256 entries come from the printed grid or a secret unknown table. A 256-byte **permutation/S-box interpretation** of the raw printed cell values is independently impossible due to duplicates.

**Do not rescue either direct model by changing cipher orientation, lookup row order, or the 256 private entries**; those cannot increase the number of codewords or remove duplicate table values.

What survives: page-private or rolling codebooks, variable-length arithmetic/base29 conversion, a probabilistic or many-to-one code with recoverable extra state, 2014-authored external key material, and any use of the table *other than* a direct 256-entry digraph alphabet. A per-page private mapping has not been excluded: individual original physical pages are shorter, and this experiment does not prove any page exceeds 256 paired digraph types. No decrypted unknown rune, authentic key, or creator-selected byte receiver results. Meaningful follow-up requires a source-visible **state/clock/carry opcode**, not another secret-table fit.

## Reproduction

The self-contained Windows Node22 [SFT](../sims/lp2_grid256_digraph_codebook_capacity_sft.cjs) reads the unchanged canonical corpus and original 256-value transcription; checks full 12,956-rune coverage, nine chapter inventories, two fixed pair phases, all distinct-pair numbers and byte multiplicities; then prints the excluded and surviving architectures. Exact [workflow job PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45274984753/job/138044348480). No external download, random seed or learned English scorer is required.
