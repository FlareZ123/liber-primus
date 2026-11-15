# The repeated p32/p55 tree: complete source-aligned shared-pad word gate

**15 November 2026, Agent 45. Evidence:** a bounded negative on one original-cipher architecture. The original 121-runic p32 and 76-runic p55 share the same underlying DeadTree illustration in the original JPEGs. The signed 2016 tree picture is **different artwork**, so its apparent resemblance supplies no additional authentic key selector. [The original-image correction](lp2-tree121-signed2016-source-gate.md) documents this distinction. **No new LP2 plaintext, key, cipher method or destination was recovered.**

## Human-visible route and independent inputs

The repeated original tree suggests testing whether the creator reused an **identical evolving GP29 additive keystream** on these two illustration-linked pages. This would enable a two-time-pad inverse without obtaining the pad: subtract the two ciphertext streams and look for complete words under the original printed word divisions.

The unchanged original p32 has **121 runes in 22 printed words**. Physical p55 has **76 runes in 17 printed word fragments**, whose first single rune completes a word carried from p54. There are two naturally selected alignments: (a) both physical page starts; (b) p32 start against the 75 p55 runes after the page-carry fragment. No arbitrary page offset, transposition, cipher phase, rune insertion, or fitted correction is admitted.

The model is `C_A[i] = P_A[i] + K[i] + s_A (mod29)` and `C_B[i] = P_B[i] + K[i] + s_B (mod29)`, where **every individual K[i] is secret and unconstrained**, but the two pages share it in the frozen alignment. The independent unknown constants `s_A,s_B` give an additional unrestricted relative shift `s=s_A-s_B`, tested exhaustively over **all 29 values**. At each aligned original printed-word overlap,

`C_A[i]-C_B[i] = P_A[i]-P_B[i]+s (mod29)`.

Thus complete independently plausible plaintext words must exist in both lengths with the observed overlap of GP29 differences and **the same s** at all overlaps. The pads cancel identically for *every* secret pad, so the test does not guess a key.

The fixed dictionary is the checked-in TextBlob/Norvig English word-frequency textblob. Normalize **QU→CW, V→U, K→C, Z→S, ING→NG, IO→IA**, then greedily encode the canonical `F,U,TH,...,EA` GP29 runes. All **29,154** encodable entries are admitted, including low-frequency words; no frequency threshold, candidate-ranking language score, fitted word segmentation or guessed plaintext is needed. The dictionary defines the scope of the exclusion, rather than establishing the unknown pages' language.

## Original-source decision

The executable checks every overlap of **at least three runes**, using the complete source word lengths and positions. For each overlap it enumerates *all* dictionary words of both required lengths, all 29 relative Caesar shifts, and the observed original GP29 difference pattern.

| Original alignment | ≥3-rune overlaps | Six-rune overlaps | Six-rune overlaps impossible for every relative shift | Page-wide eligible shifts |
|---|---:|---:|---:|---|
| p32[0] / p55[0] | **12** | 3 | **2** | **none** |
| p32[0] / p55[1] (after carried rune) | **14** | 2 | **2** | **none** |

The source-aligned first case already has two independent 6-rune obstructions:

- p32 printed word 3 (zero-based), **11 runes** `W NG H W B M S OE E I IA`; p55 printed word 4, **six runes** `S EO G D TH AE`; overlap starts at p32 offset 9. Zero suitable complete dictionary word pairs exist under any shift.
- p32 printed word 7, **11 runes** `H O M E X W D S L F D`; p55 printed word 8, **six runes** `M S D IA P F`; overlap starts at p32 offset 36. Again zero eligible word pairs under any shift.

The p55-carry-skipping variant independently fails at the two six-rune overlaps starting at its aligned offsets 14 and 35. These are separate necessary-condition failures within the specified original-source model; there is no need to maximize language score or search additional phases to rescue it.

**Positive cryptographic control:** Construct English-GP plaintexts with every original printed word length using the same fixed dictionary. Encrypt their common 75- or 76-position extent under the nonconstant secret pad `K[i]=(7i²+11i+3) mod29` and page offsets `s_A=13`, `s_B=21`. The identical scanner accepts **exactly the true relative shift 21 of 29** for each alignment, with no impossible overlap. It decrypts both planted plaintext streams rune-for-rune under the actual pad and offsets. The positive verifies that the original negative is meaningful for the hypothesized shared-pad family and that the lexical inverse can recognize source-shaped English under a nontrivial pad.

## Cryptanalytic consequence and strict limits

The repeated original image does **not** support a page-start shared GP29 additive pad that yields complete words from the fixed native-English dictionary, even if its entire secret pad is otherwise arbitrary and the two pages have unknown constant offsets. Because the obstruction uses original printed words, it does not imply anything about a plaintext whose word boundaries change under encryption, non-English source material, a secret nonlinear letter map, word-specific secret shifts, different pad clocks, or any mechanism without a shared additive pad.

This retires a specific human-visible tree-reuse hypothesis; it does **not** resolve the plaintext or justify inferring a higher-layer decryption from the picture. The p32 signed-tree dimension arithmetic remains independently known but does not supply this shared-key rule. A genuine next step requires an original author-selected operation or original unknown-page plaintext.

**Reproduction:** [one-file Node.js 22 source-and-positive SFT](../sims/lp2_p32_p55_shared_tree_pad_lexicon_sft.cjs). It reads the unchanged canonical corpus, original rune transcription and fixed local lexicon, asserts all 121/76 source runes and every original word boundary, evaluates both alignments and all 29 shifts, and checks both planted positive cases. The connector-runtime independent execution reproduced original scope counts and the planted true shift (21) uniquely in both alignments.
