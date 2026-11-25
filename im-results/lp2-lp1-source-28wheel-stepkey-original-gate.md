# Source-first-book key through a nonzero 28-step chain

**Decision (25 November 2026): no plaintext for either the rune-rate or the source-word-number latent-word LP1/28-step receiver.** Unlike direct Vigenère, this construction can explain the central GP29 anti-doublet fact **by construction**. The unknown LP2 has 12,956 original runes but only 86 consecutive equal pairs. In a ciphertext-feedback chain \`C_i=C_(i−1)+D_i (mod29)\`, put an ordinary rune into a *nonzero* step 1…28; reserve step0 for a rare special rune. Solved native source text has a rare last GP rune EA (index28), making it a defensible, preselected special. This proposal has one sharply defined missing input: the 28-valued rotating key. The already-solved **first Liber Primus release** is a historical source available to the human, and is the natural literal reading of “the book is the key.”

The known solved LP1 text is taken in original section order, with editorial duplicate spread summaries and bracketed notes removed. Source-attested GP spelling (\`ING→ᛝ\`, \`IO→ᛡ\`) yields a frozen **2,797-rune** key stream; each native key index reduced mod28 supplies a 28-spoke rotation. No rune ordering is fitted to unknown ciphertext.

The defined receiver for each original difference \`D_i=(C_i−C_(i−1)) mod29\`, with preceding state 0 at the start of p0, is:

\`P_i=28\` when \`D_i=0\`, otherwise \`P_i=(D_i−1 ± K_i) mod28\`.

Both ± signs, **all 2,797 cyclic key start offsets**, and the complete **12,956 unmodified GP29 runes on p0–55** are tested. Every candidate output, including its rare-rune positions and printed word boundaries, is already determined by that input. No per-page key resets, arbitrary crib, punctuation editing or English language fit is introduced.

| Frozen sign | Best of 2,797 whole-book offsets | Source-key offset |
|---|---:|---:|
| Minus on key | **GP29 IoC 0.03537548755** | 2003 |
| Plus on key | **GP29 IoC 0.03538033726** | 2347 |

Both maxima are near the uniform baseline \`1/29=0.03448\`. Genuine English native GP29 would have much more concentrated rune frequencies (clear p57 alone 0.06271). The exact chain inverse also reconstructs **12,956/12,956** independently planted source-native p57 plaintext runes under an imposed key, for *both* signs. That verifies the receiver, and cannot authenticate the historical cipher.

**Consequence:** this 28-step causal explanation of the low doublet rate does not furnish a solution using the complete existing LP1 plaintext as the repeating running key. It remains possible that a genuinely different external/secret 28-symbol key exists. A key recovered independently from an author-supplied operation would change the decision; another unconstrained phase or source-text rewrite would not.

**Reproduce:** \`node sims/lp2_lp1_source_28wheel_stepkey_sft.cjs\` (Node22 CommonJS), only repository source files \`resources/liber-primus/lp1-plaintext-reference.txt\` and \`lp2-corpus.json\`. No unknown plaintext recovered.

## Hidden plaintext word clock using first-book word numbers (Agent 20, 25 November)

The authenticated 2016 "words are the map ... numbers are the direction" statement and LP1's preservation of words/numbers motivate testing a more specific **word-level** direction receiver. This is distinct from the original rune-rate LP1 wheel and the separate GP29 additive word-number receiver. The natural rival is an unrelated cipher with incidental low repeats. No authenticated statement uniquely selects this wheel, EA as the zero-step glyph, or LP1 as its key.

Construct the source-corrected 695-word LP1 register (2,797 runes), using the exact GP29 set and the two original WHO replacements. A word contributes its chart-prime sum S; test K=S mod28 and K=phi(S) mod28, both signs. The cyclic key advances once per **unknown actual plaintext word**, never according to printed LP2 separators. For every rune in the selected word, freeze a nonzero step d=1+((p+sK[j]) mod28) if p<28; EA (p=28) alone gives d=0. The cipher is C_i=(C_(i-1)+d) mod29. The inverse is lossless given key phase and word segmentation; it mechanically predicts that every ciphertext equality represents EA. Set initial Cprev=0 for p0 and use the previous physical original rune for other chapter starts. It preserves the ciphertext feedback state across latent word boundaries.

A dynamic program jointly inverts all key phases and latent word lengths 1–24, maximizing a fixed finite word likelihood. Vocabulary: 29,053 GP29 forms from the repository TextBlob frequency source plus native LP1 training sections 0,2,3,4,6, normalized via the established greedy GP spelling convention; one-letter in-vocabulary forms restricted to A/I/O/T. Word probabilities use 98% frequency mass and a 2% uniform-rune geometric-length OOV component. OOV is allowed on every word so the result is not a dictionary-only impossibility. For each chapter's first 308 original runes, fit a complete-word boundary anywhere from 190 to 200 using only those first 200, selecting by normalized score. Freeze the resulting phase, sign, key mapping and all prefix words; decode the remainder to the fixed end308 (which may not be a true plaintext boundary). Strict continuation score includes only complete inferred words starting at rune200 or later. This avoids a fabricated original word order and excludes up to one straddling inferred word from the continuation score.

Two source-native plants use actual complete-word windows (314 and 308 runes) from WELCOME and second KOAN, removing their entire sections from the respective candidate key register. Both select the exact hidden source origin and key variant, both recover every strictly unseen plaintext rune (222/222), and recover 160/162 original word starts (73/75 and 87/87). They are genuine native text encrypted under the conjectural mechanism, not historically observed encryptions. The two matched wrong-source plants use deterministic shuffled digits, so they preserve the key multiset and exact native zero-step positions. Their best strict continuation scores among all variant prefix winners are −3.334360 and −3.418770; the positive plant scores are −1.595307 and −1.605732. All original and plant paths re-encrypt exactly.

| Original chapter | Selected prefix score | Strict continuation (nats/rune) | In-vocabulary runes / 308 |
|---|---:|---:|---:|
| p0–2 | −3.722500 | −3.831954 | 33 |
| p3–7 | −3.702653 | −3.787453 | 49 |
| p8–14 | −3.722752 | −3.768597 | 47 |
| p15–22 | −3.706599 | −3.767703 | 36 |
| p23–26 | −3.714114 | −3.770266 | 47 |
| p27–32 | −3.723005 | −3.769407 | 49 |
| p33–39 | −3.736385 | −3.788092 | 42 |
| p40–53 | −3.693323 | −3.853829 | 49 |
| p54–55 | −3.729892 | −3.788809 | 36 |

Across all 36 variant winners, the strongest strict original continuation is −3.695395, below both finite wrong-source controls and very far below correct-key plants. The decoded original runes are mostly OOV and the retained word fragments are not coherent prose. This tests a plausible low-repeat, H-decoy-compatible source receiver by actual original-cipher inversion; it does not establish a general exclusion of all word-dependent clocks, unknown keys, or arbitrary language. The chapter prefix windows are internal heldouts, not globally unexamined pages. Reopen only if an independently selected direction or word-key schedule changes the premise.

[SFT](../sims/lp2_lp1_wordnumber_hidden_word_delta_sft.cjs) · [raw original/control paths](lp2-lp1-wordnumber-hidden-word-delta-output.json). Identical experiment function executed in the connected JS runtime; standalone Node wrapper not yet CI-tested. Source blobs: `1b064ef6d85819b7d96adaff31a82d1ec551598f`, `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`, `140e1d22b5f8c45deddd2e8b25549d9d6307d938`. Code commit `ceb1bead08b09cafc5241cba3131714e851062f1`, raw `012095e2c3a54ae6da3bb29f0299000147daa46d`.

