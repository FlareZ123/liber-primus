# Red prime-triangle ciphertext inversion: full key plus source-heading nonce

**Agent 22, 2026-11-10. Evidence class:** original-ciphertext, source-anchored finite-family **negative**, with full planted English-GP forward and inverse controls. **No unknown LP2 plaintext, key, algorithm or destination recovered.**

## Source hypothesis and original-data contract

The established [three-page red-rune triangle](red-span-triangle.md) unites the exact source-highlighted nine-rune heading on physical LP2 page 15 (GP prime sum 638 = 29×22), eight-rune heading on page 40 (435 = 29×15), and corrected 51-rune stanza on page 53 (2262 = 29×78). The earlier F79 construction used these three inputs to derive a primitive-root stream, but that direct model failed; this test evaluates a different, fully specified **symmetric-key input serialization** of the three original red spans.

Treat page-53's **51 original GP rune indices as a single base-29 big-endian integer**, left-pad to 32 bytes as a cipher key. Treat concatenated page-15 and page-40 red-heading digits as **a single 17-digit base-29 integer**, left-pad to 12 bytes as a nonce. Prepend a 4-byte zero block counter to form the 16-byte Node.js IV for ChaCha20 and AES-256-CTR. A cipher consumes the key stream continuously **within** each source-selected body, resetting at the start of the next body; no key skips, resegmentation, or image-derived outside values are fitted.

Search precisely four reversible red-key orientations (forward, reversed, GP Atbash, reversed Atbash) and four heading serialization orders (15→40, 40→15, and the reverse of either full concatenation). AES256 CTR or ChaCha20 yields **32 fixed original grid decodes**; the two additive mod-29 signs yield **64 fixed rune decodes**. The output targets, all fixed by original image and headings, are the 256 original grid bytes; and two untouched original rune bodies: physical pages 15 from local offset20 through page22 (**1,883 runes**), and physical page40 after its eight-rune red heading through page55 (**3,308 runes**). Their combined original GP IoC is **0.03453873218**.

## Matched complete-family original-input result

| Statistic | Original source result | Matched shuffle-family null |
|---|---:|---:|
| Maximum ASCII-like count over 32 full-grid decodes | **115 of 256 bytes** | Mean family maximum 114.24625 |
| Grid nulls reaching actual 115 | | **356 of 800**, add-one p = **357/801 = 0.4456928839** |
| Maximum IoC over 64 GP inverse candidates on 5,191 original runes | **0.03466329934** | Mean family maximum 0.03461980468 |
| Rune IoC nulls reaching actual | | **87 of 800**, add-one p = **88/801 = 0.1098626717** |
| Source GP reference | **1/29 = 0.034482759** | Ordinary GP-English plant ≈ 0.067 |

The top original grid candidate uses Atbash-red key, 40→15 title nonce and ChaCha20. The best original rune candidate uses the original forward red key and 15→40 nonce, AES-256-CTR, subtraction modulo29. Its separate body IoCs are **0.03454478039** and **0.03466063888**. Neither yields a coherent GP-English passage or authenticated key.

For **800** deterministic control trials (seed 0x22534079), independently permute the **exact original 51 page-53 red rune indices**, preserving their multiset and every page-15/page-40 original nonce digit and every target original ciphertext byte/rune. Rerun **all 32 grid and 64 rune candidates** and compare each **family maximum**, not one post-selected winning key. The observed best is entirely ordinary under the matching finite search family. The two grid and rune outcomes are correlated; their individual p-values are not independent evidence.

Two independent planted passages of **actual English encoded in Gematria Primus** were encrypted with the exact same key and nonce from the original red source, preserving source-body lengths, with keystream reset on each body. The true synthetic source had IoC **0.0673795** and **0.0678634** in the two bodies; encrypted versions had IoC **0.0345222** and **0.0344612**. Exact inverse recovery succeeds on **all 5,191 runes**. This verifies the source-defined algorithm and demonstrates that original failure is distinguishable from an accidentally broken cryptographic transformation.

## Research decision and limitations

The manuscript's red-triangle arithmetic is a strong **source-side clue** under its particular post-selected arithmetic interpretation, but **the specific straightforward AES/ChaCha key+nonce channel evaluated here does not decode the original grid or the source-selected rune bodies**. Do not promote a 0.03466 pseudo-English concentration as plaintext. The negative does not rule out a secret nonpublic KDF, nonzero counter, ciphertext-dependent key skips, nonlinear plaintext representation, other encryption algorithms, or the three red spans having navigational rather than symmetric-key meaning. Any new source-derived schedule must predict original plaintext and independently reproduce it through exact forward encryption.

**Reproduction:** [complete CommonJS source](../sims/red_triangle_radix29_nonce.cjs), using only original canonical corpus, red-ink annotations and 256-byte grid; [successful original-corpus CI 42787044524](https://github.com/FlareZ123/liber-primus/actions/runs/42787044524), selected by `triad-nonce` in the shared [source-key manual workflow](../.github/workflows/red51-fivebit-key-iv-manual.yml).
