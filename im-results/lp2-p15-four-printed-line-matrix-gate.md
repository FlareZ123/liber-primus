# Page15 physical-line Hill interpretation: original 4×17 source-aligned inverse

**13 November 2026, Agent 7.** Issue [#775](https://github.com/FlareZ123/liber-primus/issues/775). The physical p15 four-by-four numerical square is an authentic artifact feature; taking its rows across the first four **actual printed rune lines immediately below** is a distinct, human-readable hypothesis. This specific reversible operation was executed on original source and did not recover unknown LP2 plaintext. It differs from already rejected four-rune-block Hill and four-physical-PAGE Hill hypotheses.

## Frozen source input, including what the square leaves untouched

Original LP2 physical p15 is scan **32.jpg**. The unchanged source runic-line transcription is [`resources/transcriptions/liber_primus_master.txt`](../resources/transcriptions/liber_primus_master.txt), at percent-delimited page **31** because that master file also includes LP1. This is cross-checked rune-for-rune to canonical [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json) physical page15, whose first 9 runes belong to the heading preceding the numeric square. The square is:

```text
3258  3222  3152  3038
3278  3299  3298  2838
3288  3294  3296  2472
4516  1206   708  1820
```

Exactly seven body lines follow the matrix, with original rune counts **[21, 17, 22, 23, 23, 22, 22]**, totaling **150**. No lines are selected by output score. The first four original lines are frozen; take their first **17** runes each, yielding precisely 68 rune slots, read as four parallel row vectors (17 columns). The other **91** page runes remain untouched: title9, tails **4+0+5+6=15**, and final three whole body lines **23+22+22=67**. No padding, offset, word wrap, different line quartet, inserted source symbols or carried ciphertext tail is licensed.

Let `C_t` be the column of four rune indices at fixed horizontal rune offset `t`, with the published 29-element GP alphabet ordered as in canonical corpus. The four source-declared tests are `M⁻¹ C_t`, `(M⁻¹)ᵀ C_t`, `M C_t`, and `Mᵀ C_t`, each modulo29. The exact inverse matrix is:

```text
19  1  6  3
11  7  8 22
 2 10 15 28
25  4  1 15
```

No original caption explicitly declares that the square is a Hill matrix or what a solver should do with the 91 untouched runes, so the interpretation remains a constrained experiment.

## Original-input readout against native-language controls

**All four candidate outputs are nonlinguistic.** Mean source-native GP29 trigram log-likelihood (nats/rune) for the original four ciphertext lines is **−4.1143**. A Shakespeare native-GP training sample scores **−2.2631** and the six genuinely printed LP1 plaintext pages, a separate author-authentic held-out control, score **−2.4757**. The candidate outputs remain far from readable native GP29 English:

| Original 4×4 operation | Mean across four printed 17-rune lines | Decision |
| --- | ---: | --- |
| `M⁻¹` | −3.929164 | No readable original language |
| `(M⁻¹)ᵀ` | −3.835004 | No readable original language |
| `M` | −3.873251 | No readable original language |
| `Mᵀ` | −4.049116 | No readable original language |

The exact four line output streams are provided below as canonical GP alphabet transliterations, with individual rune glyph labels separated by spaces; `TH`, `EO`, `NG`, `OE`, `AE`, `IA`, and `EA` represent **one original rune each**, never character pairs.

```text
M^-1:
X M EO IA P U B C TH IA R X E O I R EA
C I NG TH A NG TH U H H B J EA S X B W
D M OE OE T A T IA EA O EO Y AE Y TH P U
IA J EA X L AE IA P Y C W D OE N U E C

(M^-1)^T:
OE F F P O L M R IA EO E J A J M R E
L P I N OE S Y G A S IA I D EO E T W
H X S F A U R H EO L TH Y O W NG I U
A EA EO N EA I C EO S M Y G Y L R E E

M:
B P OE P P X TH L W B W W J T EA O C
I EA C NG G P S U EO L B U R T T M M
N M TH O IA M OE NG B O X O H P D B F
P G W X E A TH H I S T U I G D G N

M^T:
M O H W EO NG EA H S EO H J M E EO C L
AE NG NG IA O H S X M TH D F E H R E I
L U EA IA D G A X O EO NG O NG B J OE IA
M W O I O D H T C AE C S C EO H EA NG
```

A **genuine LP1 original-native GP plaintext** four-line positive plant, each line exactly17 runes, is transformed by the printed p15 `M` and separately `Mᵀ`, and recovers all **68/68** original native rune indices by their matching inverse operators. The matrix inverse was checked elementwise modulo29 and the original p15 body transcription matched the canonical corpus at **150/150**. The [passing GitHub Actions original-source job #43482230168](https://github.com/FlareZ123/liber-primus/actions/runs/43482230168) independently ran the complete [source-frozen Node.js CJS SFT](../sims/lp2_p15_four_printed_lines_hill_sft.cjs).

## Decision and next fork

The literal source-chosen **first four printed lines, 17 aligned columns, direct Hill29** interpretation fails its decisive original-cipher plaintext gate for all four elementary row/column encode/decode orientations. There is no principled way to decode the remaining 91 symbols under this hypothesis without an additional source instruction. Retire this reading as a direct decryption route. The result does **not** invalidate other future page15 matrix consumers selected by genuinely independent image evidence, nor recover a key or unknown plaintext.
