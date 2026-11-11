# Signed-2016 tree JPEG as a fixed entropy-byte GP29 pad: original inverse

**Decision (Agent 18, 11 November 2026): a bounded negative on an independently visible key-source link.** The original 2016 Cicada-signed tree image's JPEG entropy-coded bytes do not directly decipher the original unknown LP2 physical pp14, 32, or 55 under a fixed-origin additive GP29 pad, even when permitting ciphertext-collision-qualified key rejects. **No new plaintext, authentic LP2 key, or continuation was recovered.**

## Why these exact source inputs and pages

The [authenticated 2016 clue](../resources/cicada2016-4gq25.md) is concealed by OutGuess inside the original **26,342-byte** JPEG `resources/historical/cicada2016-4gq25.jpg`. Its **563×569** tree image visually matches LP2 p32's tree and the original 121-rune p32's 11×11 GP-prime first-row and first-column sums are exactly **563 and 569**, as previously established in [the tree source gate](lp2-tree121-signed2016-source-gate.md). This creates an unusually direct historically visible reason to treat the signed image itself as a potential *source of pad bytes* for p32. Physical pp14 and55 are separately illustrated with the related tree/plant art and are held as two adjacent source-selected alternatives.

The experiment tests the **original JPEG's compressed entropy byte stream**, which starts at offset **623** immediately following the JPEG Start-of-Scan header and ends before the final End-of-Image marker. It is a longer-than-book literal key reservoir rather than a guessed phrase or arbitrary external dictionary. The exact Git blob SHA is `22027296dcd7df53c5127e6aadbabeaf3223f72d`. The raw stream is **25,717 bytes**; removing exactly **129 JPEG FF-00 byte-stuffing escape bytes** leaves **25,588** compressed data bytes. Both versions are source-defined transport readings.

## Freeze the inverse before looking for plaintext

For each original GP29 ciphertext rune `C_i`, decode `P_i=(C_i - sign * K_j) mod 29`. The key alphabet is one of the two ordinary reductions `byte%29` or `floor(byte*29/256)`. The sign is either positive or negative, and the entropy stream may be read as stored (including stuffed zeros) or unescaped. That is **eight named configurations**, all with image key origin **zero** at the first compressed byte. Both byte sources are identical over the short consumed prefixes for these three page targets, so the eight names represent only **four distinct readouts per page**. No secret key, initial position, phase, direction, or source offset is fitted.

The source ciphertext suppresses immediate repeats, so the decoder may consume **one additional key byte per rune** only if that byte would have produced the immediately preceding *observed* ciphertext rune for the same candidate plaintext. The fully specified Viterbi inverse uses a fixed GP trigram model trained on the first 200,000 characters of the existing Shakespeare control, fixed rejected-draw log penalty **3.5**, and a page-dependent upper bound of **ceil(0.1 × rune count)** total rejects. It accepts no arbitrary ciphertext insertions. This is deliberately more permissive than a direct additive pad while requiring the reason for every key skip to be exactly satisfied.

## Executed source-positive and original results

The [standalone Node 22 SFT](../sims/lp2_2016_carrier_entropy_pad_inverse_sft.cjs) asserts the JPEG identity, source stream geometry, ciphertext page indices and every decoder transition. Its independent held-out Shakespeare plant consists of **400 GP runes** encrypted with the same true image entropy stream and seven deliberately generated collision-conditioned key skips. The inverse recovers **400/400 exact runes and all 7 skips**, producing mean smoothed log GP trigram score **−2.50991010/rune** and GP IoC **0.05443609**. This confirms that the tested decoder can recover authentic English-like text when this fixed source key model actually encrypts it. The plant is source-shaped, not a general model-independent power guarantee.

On the **original unknown LP2 pages**, choose the strongest of the four distinct phase-zero source readings for each page:

| Original physical page | Ciphertext runes | Best byte reducer/sign | Best log trigram/rune | Decoded GP IoC | Outcome |
| ---: | ---: | --- | ---: | ---: | --- |
| **14** | **137** | `byte%29`, negative | **−5.77760759** | **0.03649635** | Noise-like; no prose |
| **32** | **121** | `byte%29`, positive | **−5.54906757** | **0.03636364** | Noise-like; no prose |
| **55** | **76** | `scaled29`, negative | **−5.65291103** | **0.03368421** | Noise-like; no prose |

The strongest p32 first 100 decoded rune names are preserved by the SFT's original CI output, alongside all 24 named candidate/page scores and literal rune predictions. No candidate generates coherent Gematria-Primus English. The source-shaped plant outperforms every original target by more than **3 log units per rune** on this reference, a very large separation; it is not an inferred discovery-wide probability.

**Execution:** [successful manual GitHub Actions run 43072404885](https://github.com/FlareZ123/liber-primus/actions/runs/43072404885), Node.js 22, exact original JPEG and canonical LP2 corpus, reproducible without external downloads using [manual-only workflow](../.github/workflows/lp2-2016-tree-carrier-entropy-pad.yml).

## What was actually learned

The 2016 signed image is an accessible original artifact with enough entropy data to serve as a full-length book pad, and its exact dimensions independently select p32. **Those are real source links.** But the direct JPEG-entropy-payload `±K mod29` inverse, with exact one-extra-draw collision rejection, returns only noise at three source-selected tree pages. The simplest portable *image file as a pad* interpretation is therefore unsupported.

The result does **not** reject DCT coefficients, extracted OutGuess payload as a different code, pixel-derived keys, key-dependent index navigation, independent page offsets, a higher-order cipher, or any unknown key source. In particular this code neither chooses a secret alignment to make random text look readable nor turns the signed 2016 JPEG into an authenticated 2014 encryption key. Do not expand to arbitrary start offsets or more KDFs without a new original clue specifying those degrees of freedom. The next useful research step is to identify an independently authored *readout operation* linking the actual 11×11 p32 rune square to this image, rather than continuing unselected pad-family variants.
