# Five-dot artwork reflections as a direct solved-totient decoding instruction

**Evidence: source-constrained bounded negative. 10 November 2026.** No original unsolved LP2 plaintext, authentic key, or continuation recovered.

The five-dot stencil in [source-image reflection study](black-dot-template-reflections.md) is reused on LP2 physical page 7 as its baseline, page 23 in vertical reflection, and solved page 56 in horizontal reflection. Original JPEG pages are 24, 40 and 73. If these choices instruct a solver to read ciphertext *as it appears in the solved page's reference orientation*, unknown page 7 must be read with its printed-line rune order mirrored horizontally, and unknown page 23 must reverse its printed-line rune order **and** line order. The original artwork proves the reflected stencil; the suggested cipher-reading rule remains a conjecture.

## Source-fixed original test

The [runnable original-source inverse](../sims/fivedot_reflection_totient_inverse.cjs) reads GP glyph values from the canonical [LP2 corpus](../resources/liber-primus/lp2-corpus.json) and **physical line widths** from the [master transcription](../resources/transcriptions/liber_primus_master.txt), asserting exact p7/p23/p56 runic agreement. It uses independently known [solved page-56 prime-totient decoding](../sims/authentic_lp2_p56_totient_regression.cjs): successive ordinary-prime Euler totients modulo 29, subtraction on ciphertext indices, zero-based prime index, and a variable literal-F mask. A fixed add-half conditional GP trigram model uses the checked-in 218,800-rune Shakespeare reference, giving nats per GP rune.

| Page | Source-prescribed reading | Key | Best literal-F mask | GP trigram nats/rune | Finding |
| --- | --- | --- | ---: | ---: | --- |
| 56 (solved) | Original | φ(primes), sign −1, start 0 | 8 | **−2.6224436692** | Authentic 85-rune plaintext, exact |
| 7 (unknown) | Horizontal reflection | Same authentic key | 0 | **−4.1244232253** | No readable plaintext |
| 23 (unknown) | Horizontal plus vertical reflection | Same authentic key | 87 | **−4.0433283291** | No readable plaintext |

The authentic solved text is `AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE`. This is independently authenticated and reproduced exactly. The p7/p23 source-directed models permit only exhaustive mask selection, while their key, source transform, and clock are fixed by the explicit conjecture.

For diagnostic breadth the same tool also scans **all four original line orientations, raw prime versus totient shifts, both signs, starts 0–28, and all literal-F masks**. Best original scores, selected after examining original ciphertext, are **−3.9330809279** for p7 (HV, raw prime, −1, start18, mask1), **−3.8747270237** for p23 (HV, totient, −1, start3, mask24). None gives readable prose. These are model-selection maxima and must not be interpreted as independent holdouts.

## Independent GP-language plants and original reciphering

The SFT encrypts 120 distinct contiguous GP-Shakespeare passages of the original length **per unknown page** using the authenticated page-56 procedure, one synthetically designated literal-F position, and the original physical line-width/reflection encoding. Every planted ciphertext is inverted back to its exact original plaintext and reencryped identically. All 120 positive best-mask decoded scores per page exceed the original LP2 source-directed score. The test therefore detects its target architecture when source-native GP prose is actually encrypted with it. A wrong-key roundtrip alone would not identify a historical key.

**Verified passing manual GitHub Actions:** [run 42861441037](https://github.com/FlareZ123/liber-primus/actions/runs/42861441037). The script runs under the existing *dispatch-only* `authentic-decryptions.yml` workflow; no per-commit CI was created.

## Alternative: mirror the prime-key clock, keep original plaintext reading order

A distinct geometric instruction would mirror the **prime-key visitation order**, while leaving the decoded plaintext in its original printed page order. The same complete SFT now tests this alternative independently of the reflected-text hypothesis. It applies source-fixed p7 horizontal and p23 horizontal+vertical key paths to the original physical glyph positions, masks F in the key-path encounter order, and scores the recovered runes in their unreflected printed order.

| Page | Source-fixed key traversal | Best literal-F mask | Native-order decoded trigram score |
| --- | --- | ---: | ---: |
| 56 (known control) | Original | 8 | **−2.6224436692** |
| 7 (unknown) | Horizontal | 0 | **−4.1580156388** |
| 23 (unknown) | Horizontal plus vertical | 26 | **−4.0649503028** |

This separate reversible interpretation also failed to recover recognizable words. There are a further **120 exact source-language plants per unknown page**, all inverted and reciphered correctly with the true source-selected key clock; all best-mask positives outscore the original unknown page. The expanded test passed [manual Actions run 42862702328](https://github.com/FlareZ123/liber-primus/actions/runs/42862702328). This tests a key-clock reflection hypothesis in addition to reflected plaintext reading, without redefining the original five-dot source geometry.

## Interpretation

Both reflected-reading and reflected-prime-key-traversal tests disfavor the direct idea that the five-dot stencil's exact reflections instruct the user to apply page 56's solved totient cipher to reflected page 7 or 23 rune lines. It does not challenge the image reflections themselves, exclude other artwork-driven key schedules or hidden intermediate alphabets, or claim any unknown LP2 decryption. The manuscript-wide state remains that no unknown page plaintext or authentic key has been recovered.
