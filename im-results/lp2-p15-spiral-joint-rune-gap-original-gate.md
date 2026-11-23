# Original LP2 p15 spiral as an exact joint rune-and-wordbreak permutation

**Agent12, 23 November 2026. Classification: bounded negative on one previously untested reversible space-changing original-input model. No new unknown-page plaintext, key or cipher opcode.**

## Why this is a plausible, limited human operation

The original 2014 physical p15 image (32.jpg) prints a **4×4** numeral square with red **3299** at (row1,col1), followed by an infinity symbol and an encrypted rune paragraph. The sixteen values are independently solved as absolute differences between 3301 and Fibonacci-indexed primes. Their center-first, clockwise outward spiral defines an exact public permutation of the sixteen row-major slots:

    [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]

A reader at the time could follow that path without choosing a secret key. A distinct use, beyond direct Fibonacci-value pads or the earlier 16-*word* permutation, is to arrange **16 consecutive (rune, following separator) events** in a 4×4 square and change both rune values and boundary attachments in the indicated spiral order. The printed GP values and gaps survive intact, and the operation potentially escapes intact-word suffix invariants.

The **weak premise** is that a square of numbers is intended to move *rune-plus-separator* events. The source specifies the spiral but never specifies this operational unit, reuse on later chapters, or relative direction. We freeze both natural directions without searching phase offsets or selecting keys by language.

## Exact reversible operation and treatment of source boundaries

The source is resources/liber-primus/lp2-transcription.txt, checked value for value against resources/liber-primus/lp2-corpus.json (12,956 runes). The 4×4 permutation acts on (GP29 rune value, exact following dash, period or apostrophe) pairs. The rune and its attached word/sentence marker move **together**, rather than whole words moving while rune order remains untouched. Physical line wraps, page seams and special paragraph marks remain an unchanged **layout side tape**, never an inferred secret. This reconstructs exactly the original pair tape and page layout after the inverse.

Direction0 uses source row-major blocks read in spiral order: output[j] = input[spiral[j]]. Direction1 is its inverse. The final incomplete block stays unchanged. For the immediate section the black-rune clock begins after p15's nine-rune red heading and continues through p22; p16–21 evaluation covers its entire 1,613-rune interval. For an independent visual section the clock starts after the p40 eight-rune red heading and continues through p53; holdout p40–53 covers 3,008 runes. Source one-rune/two-rune words and all 32 whole-book page-crossing words are represented in the event tape, with all original boundaries restored by forward re-encryption.

An adjacent-word-length English log likelihood-ratio model is frozen on Gibran and Shakespeare, with 16 length bins and half-count smoothing. It is a structural diagnostic only, not a decoded-language oracle. Genuine independent Emerson text provides a GP-transliterated 3,008-rune plant to verify the fully reversible model.

## Original-source outcome

| Scope | Model | Runes | Words | One-rune words | Max length | Adjacent equal runes | Length grammar, nats/pair |
|:--|:--|--:|--:|--:|--:|--:|--:|
| p16–21 | Printed | 1,613 | 372 | 17 | 13 | 9 | -0.0073624 |
| p16–21 | Spiral readout | 1,613 | 373 | 51 | 18 | 21 | -0.0499671 |
| p16–21 | Inverse readout | 1,613 | 373 | 55 | 19 | 35 | -0.0119001 |
| p40–53 | Printed | 3,008 | 669 | 13 | 14 | 18 | -0.0184965 |
| p40–53 | Spiral readout | 3,008 | 669 | 73 | 18 | 49 | -0.0087632 |
| p40–53 | Inverse readout | 3,008 | 669 | 70 | 17 | 60 | -0.0100921 |

Both directions degrade the word-length grammar of the following p16–21 passage and triple its one-rune words. The independent p40–53 section improves in the *isolated* length-grammar score while creating approximately fivefold more one-rune words; neither result supplies readable GP-native prose. All rune-only rearrangements preserve global rune-frequency IoC, which remains near **0.03454**, far from ordinary GP-native manuscript prose. Both original-direction inverses exactly reconstruct source events, as does the independent solved-format GP-transliterated 3,008-rune plant.

This is a **negative for exactly the two 16-slot joint-rune/separator inverses with the declared starts**. It cannot exclude a separate, source-specified value-changing cipher, unknown key, different operational unit, or other historical segmentation. The heldout grammar improvement alone does not justify an intended interpretation; no published first-party source selects a 16-rune/block decoder. Additional arbitrary phases or unit searches would be speculative.

**Reproduction:** [read-only Windows Node22 SFT](../sims/lp2_p15_spiral_joint_rune_gap_original_sft.cjs) | [Windows source and positive PASS run 45146336444](https://github.com/FlareZ123/liber-primus/actions/runs/45146336444) | [manual workflow](../.github/workflows/agent12-p15-spiral-joint-boundary-manual.yml).

**Director decision:** retire a bare center-out 16-position joint-rune/boundary shuffle as a direct LP2 inverse. Seek an author-specified operand and a predictive plaintext receiver first. The historical square remains mathematically authentic and this bounded negative does not establish its intended role.
