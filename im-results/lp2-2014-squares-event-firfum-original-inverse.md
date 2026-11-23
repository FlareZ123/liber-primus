# Original LP2 source-99 square-event permutation combined with the historical 2014 rune cipher

**23 November 2026, Agent32, Director #2278. Finite source-constrained original-input negative; no new unknown plaintext, author-selected key, cipher, or Cicada destination.** These results belong to the supporting experiments in `im-results/`. The overall established state remains [results/README.md](../results/README.md).

## Concrete human-visible clue and weakness

The verified original 2014 OpenPuff payload [`resources/cicada2014-openpuff-magic-squares.txt`](../resources/cicada2014-openpuff-magic-squares.txt) contains 5×5, 7×7, 5×5 numbered squares totaling 99 cells. In the actual 2014 solution, the [post-upload Vigenère key](2014-onion5-geb-onion6-chain.md) `FIRFUMFERENFE` was used in Gematria Primus with the 13-symbol modulo-29 shift vector `[0,19,25,0,28,10,0,11,25,11,20,0,11]`. The genuinely solved p57 says to shed circumferences. These are candidate historical visual operands for a human to recognize.

The **critical unsupported connection** is to transport the 2014 square data and keyword into unknown LP2 *together*, convert original word dividers into a 30th event type, and shuffle **individual runes and dividers** in 99-event blocks. The original historical instructions do not select that combination, or authorize either sorting square values or taking clockwise square perimeters as the ciphertext traversal. This experiment tests a frozen, finite candidate rather than treating the connection as authentic.

## Complete original-event inverse

Read all 55 rune-bearing unknown LP2 physical pages p0–55 in original order, transparently joining the 32 words carried across pages. Represent GP29 glyphs as 0–28 and each of the original 2,896 complete-word separators as 29. The result is a **15,852-event** tape containing **12,956 unchanged original rune glyphs**. The code verifies original rune sequences page by page and the exact event counts before any decoding.

Each consecutive complete block of 99 events is divided in source order into literal 25/49/25-square fields. The remaining 12 events at the end of the original book are passed through unchanged by the permutation. Two literal, bounded square readings are used:

1. **Rank:** stable increasing numerical order of the historical cells, with printed row-major tie breaking.
2. **Spiral:** top-left clockwise outside-in order on each source 5×5 or 7×7 square, motivated by the printed nested circumferences; not independently selected for the 2014 values.

Each of the three per-block fields can be read or scattered under its index permutation (eight masks). After the same complete original-event permutation, apply the historical GP29 Vigenère by either modular sign, leaving SPACE=29 unchanged. Its 13-symbol key advances either on runes only or on all 30-ary source events. This tests **2×8×2×2=64** frozen complete original decoders. Both stages have explicitly implemented inverses; the **entire original 15,852-event source tape** is identically recovered by forward encoding after decoding in **64/64 cases**. The Vigenère key values and three-square numbers are genuine historically present operands, whereas the composition and two square readouts remain hypotheses.

## Original untouched results

| Statistic | True original p16–21 | True original p40–53 | Best of all 64 joint models, p16–21 | Same model, p40–53 |
| --- | ---: | ---: | ---: | ---: |
| GP29 runes | 1,613 | 3,008 | 1,612 | 3,009 |
| GAP symbols | 372 | 669 | 373 | 668 |
| Adjacent empty gaps | 0 | 0 | **24** | **68** |
| Longest uninterrupted word, runes | 13 | 14 | **22** | **24** |
| GP29 index of coincidence | 0.0345494655 | 0.0345426275 | **0.0346431867** | **0.0346449570** |

The model in the last two columns is the **best by maximum minimum IoC across the two fixed original ranges** among all 64, hence a post-selected upper diagnostic rather than a source-selected cipher. It uses the spiral family, mask=1, additive sign +1, whole-event key clock. Even that most favorable source-output pair is uniform-like, has dozens of illegal adjacent word dividers and contains no sustained GP-native natural-language sentence. Every tested candidate's IoC is **below 0.04 on both original ranges**. The source's pre-existing word morphology is damaged by the transposition; key shifts do not repair it.

The original p57 **95 known plaintext runes and 20 real printed word separators** furnish a source-native positive. The script independently forms ciphertext using each of the 64 exact forward operators and correctly decodes **all 115 known plaintext events in each case**. All original unknown-page inverses re-encode **all 15,852** events identically. As usual, bijective re-encryption checks implementation only; it does not establish a historical key.

## Reproduction and decision

- [Windows Node22/CommonJS original source SFT](../sims/lp2_2014_squares_event_and_firfum_original_sft.cjs)
- [GitHub Actions manual run 45178418065, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45178418065)
- Inputs: only the original GP source corpus, original transcription, and the recovered real 2014 magic-square values, all fixed paths in the SFT.

**Retire this composed square-event permutation + historical keyword cipher** in its stated 64-case scope, without adding fitted phases, synthetic F punctuation, alternative arbitrary operators or further 99-cell magic variants. This result tests **actual runes and movable spaces**, unlike earlier whole-word transposition and direct mod30 addition, but obtains no unknown plaintext. A human-solvable continuation still requires an original instruction that chooses the **kind of event transformation**, how page-boundary state works, and which untouched passage it predicts. Other independently sourced changing-state and variable-output mechanisms remain unresolved.