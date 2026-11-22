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

## Cross-track collision-T inverse

**Agent 12; evidence class: source-anchored finite-family negative with synthetic positive controls.** This extends the direct additive test above by combining the same red-source key and nonce with the previously specified word-local collision-T rewrite. The key is the p53 51-rune span as a big-endian base-29 integer; the nonce is the p15 and p40 headings as a 17-digit base-29 integer. The inverse uses the frozen q=0.81 collision model, T6 replacement at word offsets 6 and later, and the existing word-trie / GP-trigram Viterbi with mix 0.95. No parameter was fitted to original body scores.

The two source-selected bodies are p15 local offset 20 through p22 (**1,883 runes, 432 words**) and p40 local offset 8 through p55 (**3,308 runes, 733 words**). Both cuts coincide exactly with canonical word boundaries. Stream and echo-predecessor state reset at each body, matching the earlier red-key/nonce body-reset convention.

The complete family contains **64** settings: four p53 key orientations (forward, reverse, Atbash, reverse-Atbash), four p15/p40 nonce orders, AES-256-CTR or ChaCha20, and both mod-29 signs. The best first-body Viterbi candidate is reverse-Atbash p53 key / reversed p15-p40 nonce / ChaCha20 / negative sign; its mean GP-language log probabilities are **−5.082** on the first body and **−5.383** on the frozen second body. The best heldout-body Viterbi candidate is forward p53 key / reversed p40-p15 nonce / AES-256-CTR / negative sign; its means are **−5.185** and **−5.181**. The untouched Shakespeare test control scores **−2.195** under the same trained language model. The previews are nonlinguistic; no candidate yields a plaintext passage.

Positive plants use the same original source key/nonce, exact original word lengths, q=0.81, and the same inverse. Across AES/ChaCha and both signs, rune recovery is **98.8–99.4%**. Thus the negative is not explained by a broken stream or an inverse incapable of recovering this planted generator. The T6 generator is lossy, so this is a language-model inversion test rather than a bijective exact decryption. The body split is an internal cross-body check, not a research-wide undisclosed holdout; all manuscript pages have already been explored.

**Decision:** the specified p53-base29-key / p15-p40-base29-nonce plus T6 collision-rewrite family is not a viable original-LP2 GP-English inverse across its declared 64 settings. This does not disprove the red-triangle arithmetic, other state registers, a different reversible EA/28-step mechanism, or a navigational role for the red spans. Do not repeat this key/nonce/T6 family with additional arbitrary parameter sweeps.

The manuscript's red-triangle arithmetic remains a strong **source-side clue** under its post-selected interpretation, but both the direct additive AES/ChaCha channel and the 64-model collision-T extension fail to recover original GP-English. The extension's positive controls recover 98.8–99.4% of planted runes, so its negative result is informative for that specified model. Neither test rules out other source-derived state registers, a reversible EA/28-step mechanism, a different KDF, or a navigational role for the red spans. Do not promote pseudo-English concentrations as plaintext.

**Reproduction:** direct additive test: [source](../sims/red_triangle_radix29_nonce.cjs) and [CI 42787044524](https://github.com/FlareZ123/liber-primus/actions/runs/42787044524). Collision-T extension: [source](../sims/red_triangle_t6_contextual_inverse.cjs), selectable as `triad-nonce-t6` in the existing [source-key manual workflow](../.github/workflows/red51-fivebit-key-iv-manual.yml).
