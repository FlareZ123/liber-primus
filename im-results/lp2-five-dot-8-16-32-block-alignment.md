# Five-dot markers and the 8/16/32 LP2 block alignment

**Status, 17 November 2026: source-registered 8/16/32 alignment with both direct additive and nonlinear per-page RC4 consumer rejected under their fixed original-key conventions. No unknown plaintext or authentic key recovered.**

## Finding

The three-page five-dot artwork on LP2 pages 7, 23 and 56, including its mirrored variants, is already established in [the three-page artwork and transfer report](lp2-five-dot-three-page-art-and-phi-transfer.md). This report does **not** claim that artwork or its geometric congruence as a new discovery.

The additional observation is a page-layout alignment:

- The 56 unsolved pages, numbered 0–55, divide naturally into **8 + 16 + 32** pages: 0–7, 8–23 and 24–55.
- The five-dot markers occur on p7 and p23, the final pages of the first two blocks. The third marker is on p56, the first known continuation page after the 56-page unsolved sequence.
- The numerical table printed across LP2 pp49–51 is a **32 × 8** matrix of 256 base-60 tokens. Splitting its 32 rows into two 16-row halves and joining them side-by-side yields a 16 × 16 matrix. Thus its native dimensions align with the three block sizes: 8 columns, 16 folded rows, 32 native rows.

A human solver could plausibly notice the three repeated five-dot markers, the 8/16/32 page partition, and the 32×8 table, then test whether the table supplies a three-phase key schedule. That is a concrete solve-path hypothesis, not proof that the author intended it.

## Doublet count alignment

Using the canonical `lp2-corpus.json` indices, count equal adjacent rune indices **within each page**, resetting at page boundaries and ignoring word boundaries. The 86 events partition as follows:

| LP2 pages | Pages | Runes | Same-page adjacent equalities |
|---|---:|---:|---:|
| 0–7 | 8 | 1,874 | 10 |
| 8–23 | 16 | 3,845 | 20 |
| 24–55 | 32 | 7,237 | 56 |
| **Total** | **56** | **12,956** | **86** |

The block counts sum to 86, matching both the established whole-corpus count and (7+23+56=86). The last block's 56 equalities also match the continuation page number. These are exact descriptive relationships, but they are not independent evidence of a cipher: the equality rates are 10/1,866, 20/3,829 and 56/7,206 respectively, and the final block is somewhat higher. The corpus statistic counts page-local adjacencies, not only within-word pairs. No significance claim is made from the numerical coincidences.

## Bounded table-key test

The most direct interpretation of the dimensional alignment is to use the table as a page-specific additive GP29 key:

1. **8-page block (p0–7):** each of the table's eight columns supplies a 32-symbol repeating key for one page.
2. **16-page block (p8–23):** fold the 32×8 matrix into 16×16 and use each folded row as a 16-symbol repeating key for one page. The screen enumerates elementary row/column reflections, half order, folded-row direction and both additive signs.
3. **32-page block (p24–55):** each native table row supplies an 8-symbol repeating key for one page.

Keys reset at each page. Table values are read from the repository's canonical base-60 tokens (the resulting values range from 0 to 255), reduced modulo 29, and applied as (P_i=C_i\pm K_{i\bmod m}\pmod{29}). The source dimensions select the page/key lengths; the small reflection family handles the orientation ambiguity visible in the three markers.

The best candidate scores remain at the raw-ciphertext noise level and their output samples are not readable English. In the repository's Dukotah quadgram screen, the raw/best mean log scores are:

| Block | Raw | Best direct additive candidate |
|---|---:|---:|
| p0–7 | −15.744 | −15.774 |
| p8–23 | −15.836 | −15.729 |
| p24–55 | −15.757 | −15.865 |

The small middle-block score increase is not a plaintext signal; its sample remains incoherent. The quadgram file is a rough language screen, not a proof system. The exact candidate configurations and output samples are reproduced by [the SFT script](../sims/lp2_three_block_table_key_gate.cjs).

## Independent nonlinear table-key consumer on complete original pages (Agent12, 17 November)

The additive per-page test above leaves a meaningful alternative: original Cicada stages used the RC4 stream generator within OutGuess, and eight bytes are a conventional short RC4 key. Interpret each original 32×8 table row as a distinct **8-byte RC4 key for one of the final 32 pages p24–55**. For the remaining blocks use source-native 32-byte columns for p0–7 and 16-byte folded rows for p8–23, preserving the very same 8+16+32 indexing as the additive test. The complete stream decoder is reversible: standard RC4 KSA/PRGA, output-byte reduction mod29, independent page reset, GP29 add/subtract with no plaintext-dependent branch. This constitutes a **nonlinear stream-key construction** materially distinct from the prior repeating-table-key test, while the source supplies no signed RC4 decoder instruction for this specific grid.

A locked 12-combination sensitivity check covers standard RC4 beginning at stream byte0, 256-byte and 512-byte discarded prefixes, both original/reversed key byte order and both additive signs. The same original 256 cells supply all keys. The exact original p0–55 runes total 12,956, partitioned into **1,874/3,845/7,237** runes across 8/16/32 pages; source p50 has no rune payload. All three key-length classes pass a native original solved-page 85-rune encrypt/decrypt positive, and the standard RC4 key `Key` emits its known `eb9f7781b734ca72a719` prefix.

| Measured GP29 symbol coincidence | Untouched original ciphertext | Highest among all 12 source-table RC4 consumers |
| --- | ---: | ---: |
| Whole 56 unknown pages | 0.0344784 | **0.03451469** |
| 8-page first block | 0.03453103 | **0.03476351** |
| 16-page second block | 0.03451122 | **0.03459985** |
| 32-page final block | 0.03446694 | **0.03454306** |
| Independent source clear p57 | **0.06270997** | Positive control only |

The strongest complete original output remains at near-uniform coincidence and its page-level romanizations are incoherent; no contiguous 150-rune native plaintext passage appears. All 12 variations preserve original rune count, all GP29 labels and every page boundary. The tests deliberately do not fit unknown original ciphertext or adjust the table-derived secret keys. Keys are selected solely by physical table geometry and page index.

**Decision:** retire the specific 32/16/8-byte RC4-per-page consumer, including its natural drop0 and limited traditional RC4-drop variants. This is **not** a rejection of table-derived nonlinear cryptography in general. A 2014 author-visible selector is still missing for any table→key stream, and the structural 8/16/32 correlation alone cannot choose a different password, nonce, cipher primitive or page rotation.

[Exact original-corpus read-only CJS SFT](../sims/lp2_8_16_32_table_rc4_pagekey_sft.cjs) · [successfully executed Linux Node22 manual original-source CI](https://github.com/FlareZ123/liber-primus/actions/runs/44003645158).

## Decision

The 8/16/32 alignment is worth preserving as a source-visible structural hypothesis, but the straightforward table-as-additive-page-key interpretation fails. The 86 doublet partition does not supply a key or operation. This test does not exclude a nonlinear table consumer, a transposition, an external key, or another operation independently selected by an original clue. Do **not** continue broad p50 transformations merely because the dimensions fit. A separate original-source registered nonlinear RC4-page-key consumer now also fails throughout 12 frozen variants, with whole-book IoC ≤0.03451469. A first-party instruction specifying an actual table receiver remains the missing input. Without it, do not enlarge the key/mode search on geometric numerology alone.
