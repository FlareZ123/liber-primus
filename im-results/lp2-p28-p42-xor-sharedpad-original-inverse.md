# Original pages 28 and 42: joint 5-bit XOR two-time-pad inverse

**Agent37, 15 November 2026. Original-cipher complete 269-position inverse and source-native controls. Result: negative for direct aligned shared XOR pad; no recovered original plaintext or key.**

## Independent premise and missing historical instruction

The already-examined physical pages **28** and **42** have an unusually high **21 equal rune pairs** at their first 269 printed corresponding indices. Earlier source work tested *additive* shared GP29 pads, with no recovered text. A materially different, historically elementary operation is bitwise XOR on each rune's **five-bit index**: if both pages were encrypted under the **identical positionwise XOR pad**, the secret cancels exactly,

`(C28[t] XOR C42[t]) = (P28[t] XOR P42[t])`.

The original two pages are independent original 2014 ciphertext images (source scans `45.jpg` and `59.jpg`), both fixed before scoring; p28 has 269 rune indices and p42 has 272. Their physical drawings do not name a shared key, XOR, or a paired-page operation. Moreover, bitwise XOR is not closed on the 29-symbol GP alphabet: three of the 32 five-bit outputs (29,30,31) are illegal. A 5-bit XOR model would require the creator to condition key bytes on both plaintexts or prescribe some other way of keeping ciphertext in range. No such creator instruction exists. This is a falsifiable hypothetical decoder, **not an asserted Cicada cipher**.

**Stronger source-independent XOR group obstruction.** Let `S={0,1,…,28}` and `T={29,30,31}` in the five-bit 32-symbol group. For every **nonzero** five-bit key `k`, `x→x XOR k` pairs all 32 inputs into two-element orbits without fixed points. If it mapped *all 29* GP runes back into GP29, it would permute `S`, hence preserve the three-element complement `T`. But an odd-sized set cannot be a union of two-element orbits. Therefore **only k=0 can be a complete GP29→GP29 XOR alphabet permutation**; any useful nonzero 5-bit XOR key necessarily gives at least one forbidden output on some lawful GP29 plaintext. If its key is independently uniform across 269 positions, the probability of observing a legal GP29 ciphertext at every position of even one page is at most `(29/32)^269 = 3.16022×10⁻¹²`, regardless of its unknown plaintext (a second page restricts the key further). This exact necessary condition does not exclude conditional key selection, an escape symbol, or byte-level ciphertext recoding, none of which is source-selected here.

## Complete source-position decoder

Use the **unchanged first 269 rune indices** of both pages. At every position `t`, compute `D[t]=C28[t] XOR C42[t]`; every `D[t]` lies in 0–31 and the actual 32-bin histogram has **21 zeros** and **no unobserved bin**. The two-time-pad inverse allows only `(p,q)` with `0≤p,q<29` and `p XOR q=D[t]`. Rather than presuming an arbitrary plaintext, jointly optimize both GP strings over every legal pair using a **word-aware trigram Viterbi search**. The scoring model is the independent Shakespeare first 240k characters rendered to native GP29 with the existing authentic multi-rune spellings; it includes original p28 and p42 word starts/ends. No cipher key, transcript glyph, word break, alphabet permutation or page offset is changed.

The source-unshifted original inverse has language score **−1307.299245** for both 269-rune texts together. It produces word-shaped but incoherent fragments, e.g. p28 **`TO TORDS BEEPTUR THEREW SIOLARN WARWITH A DIDED`** and p42 **`I HEED DOTH ANTERUCES INIS INTLE THE UND`**. Both recovered streams exactly satisfy every original one-step XOR-cancellation identity by construction; that algebraic satisfaction is not plaintext evidence.

## Discriminating alignment and historical-language controls

Rank original p28/p42 alignment zero among **all 272** circular offsets of the printed p42 rune sequence against the 269 p28 runes, each scored with the same model and fixed original page-42 punctuation masks. Zero alignment ranks **49/272** (−1307.299245); another offset, 218, scores **−1283.283697**. Thus the original positionwise pairing is *not* a maximum-language-output alignment under this decoder. These rotations are diagnostics, not a search for a new cryptographic offset; their shifted ciphertext and original word masks are deliberately not fitted together.

Two distinct planted source-language controls use actual valid GP29 plaintext:

1. A 269+269 pair of native GP Shakespeare heldout words, both encrypted under the same deterministic positionwise five-bit XOR key. At each position the synthetic key is selected among those that keep **both resulting ciphertext runes** in 0–28 (rather than silently creating impossible glyphs). The identical uninformed joint inverse recovers **184/269 = 68.4%** of *each* plaintext's rune indices at shift zero, with score **−1184.666644**. All nine reported shifted comparators have scores between **−1346.7 and −1374.2**.
2. **Genuine solved Cicada LP1 p03–04 plaintext**, 515 original authentic runes: split the clear runes into a 251-symbol first and 264-symbol second stream with original printed word breaks, encrypt under an independently planted shared five-bit key that guarantees valid GP29 ciphertext, and jointly invert without receiving the key. The decoder recovers **152/251 = 60.56%** of both original 251-rune overlapping sections. The true zero offset is **rank 1/264**, score **−1116.738003**, second best offset244 **−1199.096186**, a positive 82.36-log-point separation. This tests the exact native Cicada spelling/register rather than only machine-transliterated English.

The positive plant is deliberately simpler than authentic LP2; it establishes that the Viterbi instrument can identify a *real* shared XOR pad and recover native GP rune words at these lengths. It cannot exclude an intermediate nonlinguistic payload or an additional source-instructed cryptographic layer. For the original p28/p42 only, the source-aligned language output is much poorer and fails to dominate the other 271 offsets. The earlier source-motivated choice of this page pair and the 269-position overlap are retrospective; no discovery-wide p-value is claimed.

## Decision and reproducibility

**Retire the direct page28+page42 same-position bitwise-XOR-pad-to-GP-prose candidate.** This closes a new, fully implemented *XOR* cancellation family independent of the already-exhausted *additive-mod29* two-time-pad model. An alternative source-confirmed index transform, non-English intermediate, synchronized key schedule or clue-selected plaintext would require separate independent evidence. Do not promote the p28/p42 unusual number of equality events into a recovered key.

- [Single Windows-compatible Node22 CJS SFT, complete 272+264 alignment screens, native-LP1 control](../sims/lp2_p28_p42_xor_twotimepad_original_sft.cjs).
- [Successful source-exact GitHub Actions run 43685623073](https://github.com/FlareZ123/liber-primus/actions/runs/43685623073) (all original-page, heldout English and authentic-LP1 tests passed). A prior intermediate run with the same source-original test and a smaller nine-offset diagnostic also passed [43685383736](https://github.com/FlareZ123/liber-primus/actions/runs/43685383736).
- [Earlier additive-mod29 shared-pad trigram probe](../sims/relative_key_trigram_probe.cjs) and [actual historical LP1 register control](../sims/relative_key_cicada_register_control.cjs).
