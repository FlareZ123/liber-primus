# Signed-tree 563/569 p32 axis key against the next LP2 chapter

**Original-input outcome (Agent44, 15 November 2026): source-selected 21-rune key candidate fails to recover plaintext from the adjoining physical pp33–39.** A separate keyed OutGuess check on the original p32 JPEG and signed 2016 tree returns no authenticated or recognizable second message. No unknown LP2 plaintext, decipherment key, or continuation has been recovered.

## Why test this particular key

The authentic 2016 tree image has dimensions **563×569** pixels. On the original physical p32, the **first row** and **first column** of the 11×11 source rune square have GP-prime sums **563** and **569**. This source correspondence, and the negative 2D prefix-sum inverse, were already established in [the p32 prefix-sum report](p32-source-axis-2d-prefix-inverse.md); they are not discoveries of the present test. The dimensional match suggests a possible cryptographic role for the **21 distinct border runes** on those two axes. They are a finite author-salient source key, independent of any guessed plaintext.

Read the eleven first-row runes left to right, followed by the first-column runes top to bottom, omitting the shared top-left rune the second time. Their **GP29 indices** are

`[20,2,25,7,25,1,13,27,5,7,21,8,2,8,21,16,15,21,16,28,3]`.

Literal source rune transliteration, preserving GP multigraph labels, is

`L TH AE W AE U P IA C W NG H TH H NG T S NG T EA O`, joined as `LTHAEWAEUPIACWNGHTHHNGTSNGTEAO`.

The simplest proposed human operation is to use that axis as the repeating arithmetic key on **the immediately following original physical chapter pp33–39** (1,680 runes), where the historical solved LP1 Vigenère operation provides a cipher precedent. The edge key, target and page-local phase zero are fixed before reading the output. The weakest premise is that the image dimensions select the **key source** but no signed text instructs a *21-step Vigenère transfer* to the adjacent chapter.

## Direct original-cipher inverses

The [standalone, read-only CommonJS source test](../sims/lp2_p32_signed_axes21_following_chapter_sft.cjs) derives the original 21 runes, asserts both exact prime sums, consumes all 1,680 original pp33–39 runes without page resets, and applies three explicit repeated 21-symbol pad derivations: GP index `r`, GP prime `prime[r]` or its totient `prime[r]−1`. The historical modular arithmetic is `P_i=(C_i ± K[i mod 21]) mod 29`. It records the two arithmetic signs, once with every rune consuming the key and once with every ciphertext F provisionally copied literally and skipped, yielding **12 predeclared readouts** rather than a free key search.

| Pad values | Sign | Consume every rune: IoC | Copy/skip all original F: IoC | Non-F ciphertext forced to plaintext F in skip mode |
| --- | --- | ---: | ---: | ---: |
| GP rune indices | − | **0.034406818117** | 0.035586658725 | 67 |
| GP rune indices | + | **0.034869111433** | 0.035156272157 | 58 |
| GP rune primes | − | **0.034467795456** | 0.035963158343 | 77 |
| GP rune primes | + | **0.034420998894** | 0.034942142432 | 51 |
| Prime totients | − | **0.034467795456** | 0.035225757963 | 51 |
| Prime totients | + | **0.034420998894** | 0.034942142432 | 51 |

Every direct readout remains approximately uniform among the 29 runes. As an example, the exact source-index subtraction output begins `O I E IA R N J N O EA L X IA H Y G P O J T O G Y P A F O M F X F OE J A S AE`, with no coherent GP prose. All twelve decoded outputs are nonlinguistic. Copy-and-skip-all-F is a *frozen diagnostic*, not an exact enumeration of Cicada's real F bypass: under the authentic plain-F-literal rule, ciphertext F may encrypt a non-F and skipped sites need separate branching. However, even that frozen convention produces dozens of non-F positions which would have to be literal plaintext F and violate the solved-page encoder's semantics.

For each of the six all-consuming arithmetic models, an independent known-GP source-clear p57 **95-rune planted plaintext** is encrypted under the same source key and then recovered exactly. That verifies the implemented inverse but cannot authenticate any result on the unknown chapter. Original p32 and chapter counts, 21-key and signed dimensions are asserted in the script.

## Real OutGuess carriers with the same fixed source key

The same literal continuous Latin transliteration is also a plausible, though **not authored**, case-sensitive passphrase for the original 2016 image and for the original physical p32 carrier `49.jpg`. The repository's existing pinned OutGuess 0.4 build, [manual-only keyed probe](../sims/outguess_lp2_keyed_probe.cjs), a known-key embedded carrier, genuine 2014 original OutGuess controls and a source-free synthetic JPEG were used **without changing the extractor or expanding the key list**.

| Original carrier | Authenticated second payload with fixed key? | Exact observed extraction |
| --- | --- | --- |
| 2016 signed 563×569 tree image | **No** | OutGuess exit1, no length-consistent extraction |
| Original LP2 physical p32 / `49.jpg` | **No** | A length-consistent **14,711-byte** high-entropy binary blob, 38.2299% printable bytes, no recognizable file signature or PGP armor |

Crucially, the exact **same key** on the known-payload-free synthetic JPEG returns an apparently length-consistent **13,423-byte** binary blob. That confirms an OutGuess length header by itself is not proof of a hidden message. The p32 candidate's SHA-256 is `f5f90fc579551221279beade54a8b5efcfbb6fd20dbd810552f4b4182fbbf1e9`, entropy **7.986946 bits/byte**. The control's artificial high entropy and comparable output length prevent treating this p32 blob as a breakthrough.

Real executions: [signed 2016 image run 43663907916](https://github.com/FlareZ123/liber-primus/actions/runs/43663907916) and [original p32 image run 43663947141](https://github.com/FlareZ123/liber-primus/actions/runs/43663947141). Both CI jobs finished successfully and their logs preserve the exact input key, decoder output and planted/synthetic controls. No source-derived second passphrase encoding was tested here.

## Decision

Retire **the specific 21-axis-edge, repeated GP29 arithmetic key transfer to pp33–39** and **the one fixed ASCII OutGuess password** as direct plaintext/key recoveries. The underlying signed-image dimensions' equality with p32 row and column prime sums remains an unusually strong, independently established cross-artifact clue. This test does not tell how those axes are *intended* to be used and does not exclude a genuinely authored tree/key/coordinate instruction. Further work should seek an operation selected by the source or a byte-exact second-message recovery; fitting new key orientations, phases, output alphabets or password variants to this nonlinguistic readout would repeat the same unselected search.
