# Source-first-book key through a nonzero 28-step chain

**Decision (22 November 2026): no plaintext for the exact source-chosen LP1/28-step receiver.** Unlike direct Vigenère, this construction can explain the central GP29 anti-doublet fact **by construction**. The unknown LP2 has 12,956 original runes but only 86 consecutive equal pairs. In a ciphertext-feedback chain \`C_i=C_(i−1)+D_i (mod29)\`, put an ordinary rune into a *nonzero* step 1…28; reserve step0 for a rare special rune. Solved native source text has a rare last GP rune EA (index28), making it a defensible, preselected special. This proposal has one sharply defined missing input: the 28-valued rotating key. The already-solved **first Liber Primus release** is a historical source available to the human, and is the natural literal reading of “the book is the key.”

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
