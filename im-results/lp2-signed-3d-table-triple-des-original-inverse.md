# Source-gated original LP2 triple-DES inverse: bounded negative

**Evidence level:** exact original-input finite experiment, successful independent synthetic positive control. No unknown LP2 plaintext, authentic cipher key, original-source encryption rule, or destination is recovered.

## Why test this particular family?

The authenticated 2016 Cicada tree message says that LP2 words are the map and numbers the direction. The already frozen [base-58 word map](lp2-2016-signed-message-base58-word-map.md) sends signed **“lies”** to physical LP2 p50, table token index 3, whose original printed reading is **`3D`** (base-60 candidate byte 193). The glyphs could stand for *three-dimensional*, a literal token or a cryptographic operation; **interpreting “3D” as triple DES is an unproven hypothesis**, not a signed instruction.

The authentic LP2 table on pp49–51 has **32 rows of eight source bytes**. The **31 thirteen-dot marks** delimit 32 entire-text fragments. This fixes a natural candidate triple-DES design: neighboring rows supply 64-bit DES keys; each fragment has an original-source row schedule. Previous single-DES grid-row experiments ([DES fragment key](../sims/fragment_grid_des_inverse.cjs), [13/31 LCG schedule](../sims/fragment_grid_des_lcg_inverse.cjs)) have failed and did not cover the distinct two-/three-key EDE3 construction.

## Frozen original-source experiment

[CommonJS SFT](../sims/fragment_grid_3des_source_inverse.cjs) uses the original 12,956 unknown GP29 runes, original 32×8 base60 byte transcription, and all 31 source punctuation marks. For original fragment index *i*, take row index *i* or the i-th element of the previously documented full-period 13/31 LCG. Set 24-byte DES-EDE3 key to (K_i, K_(i+1), K_i) or (K_i, K_(i+1), K_(i+2)) with cyclic 32-row indices. Each key bytestring is supplied entirely by the printed grid, without key fitting. For every combination of two arrangements, two row orders, OFB/CTR keystream, zero/fragment IV/counter, direct GP29 or predecessor-excluding GP28 output, two byte-to-29/28 reducers (modular/scaled), and both signs, decrypt exactly the original rune positions.

This creates **2×2×2×2×2×2×2 = 128** models. All are implemented as lossless GP transforms and exactly re-encrypt their original ciphertext after inversion, including all 86 adjacent repeated source runes. Original train and holdout use the existing page boundary split and the existing trained Shakespeare GP trigram model. The best model is selected only by training score; its frozen parameters are assessed on untouched held-out pages.

### Original and positive-control results

| Measurement | Log-language score / rune | Normalized rune IoC |
| --- | ---: | ---: |
| Raw original, training | −6.1914170 | 0.0345188 |
| Raw original, holdout | −6.1853396 | 0.0344464 |
| Best 3DES training model, training | **−6.0750380** | 0.0352985 |
| That same model, holdout | **−6.1719408** | **0.0352256** |
| Source-native planted known-key English, training | **−2.4306193** | not reported |
| Source-native planted known-key English, holdout | **−2.3761700** | not reported |

Best training model: three different keys, printed row order, OFB, fragment-index IV, predecessor-excluding GP28, byte-mod reduction, negative sign. Its first original decoded fragment begins `LDFDDLIAOXEOEHR` and is nonlinguistic. Every 128-mode original output remains nonlinguistic by the evaluated language metric. In a separately enciphered 12,956-rune native Shakespeare GP plant using another frozen candidate (three-key, LCG order, CTR, fragment counter, predecessor-excluding GP28, scaled reduction, positive sign), the true candidate **ranked 1/128**, all 12,956 runes were recovered exactly, and the recovered native plaintext was exactly re-encrypted.

[GitHub Actions manual run 42955250270](https://github.com/FlareZ123/liber-primus/actions/runs/42955250270) completed successfully. The existing [source-row-DES manual workflow](../.github/workflows/agent5-des13-manual.yml) now exposes `attack=3des` while preserving `attack=des`. No automatic workflow triggers were introduced.

## Interpretation and boundary

The test rejects these **128 source-fixed EDE3 stream-key constructions as direct native-GP LP2 decoders**. It neither proves the `3D` token represents triple DES nor excludes all 3DES uses, other key derivations, ciphers on compressed/non-GP plaintext, or a genuinely source-selected three-dimensional traversal. A roundtrip by itself never identifies a bijective-family key; the planted native recovery establishes that the language-score selection can discriminate a true key **when this model family actually generated the text**.

**Next decision:** stop expanding adjacent-row DES models without a separate historical instruction selecting the key schedule and output transport. Pursue a source-derived operation from `3D`, or original-LP2 plaintext under a structurally different reversible register.