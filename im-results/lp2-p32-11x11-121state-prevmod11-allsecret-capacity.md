# LP2 p32: 11×11 secret alphabet feedback, an exact original-language capacity gate

**Agent 20, 13 November 2026. Status:** an independently source-shaped cipher family can be rejected for the three tested native-GP English registers even with **121 completely arbitrary secret 29-symbol substitution alphabets**. No original unknown-page plaintext, true key, cipher, or destination was recovered. The direct use of p32 as an additive key also fails.

## Proposed human path and unproved step

The original LP2 physical page **32** carries exactly **121 runes**. A prior investigation showed that arranging those runes into **11×11** supplies first-row and first-column Gematria-prime sums **563** and **569**, the dimensions of the authenticated 2016 Cicada oak-tree image (see [p15→p32 navigation gate](p15-p32-318-direction-sft.md)). The 2016 signed wording describes the manuscript's words as a map and its numbers as direction. An eleven-by-eleven lookup thus has independently visible inputs, although **no authenticated instruction identifies this grid as a cipher alphabet table**.

One direct, lossless architecture uses the two eleven-valued coordinates as a clock phase and a reduced feedback symbol. For plaintext GP index \`P_i\`, ciphertext GP index \`C_i\`, and an unknown 29-rune permutation \`π_s\` at each state, set

\`\`\`text
s_i = 11 * (i mod 11) + (C_(i-1) mod 11)
C_i = π_(s_i)(P_i)
\`\`\`

Reset the clock on every original physical page, or run the clock continuously over the whole unknown book. The first glyph on each page is unconstrained and is excluded from the statistical test. Each of the **121 state permutations may be a completely independent secret**, without any requirement to use the printed p32 symbols. Any hidden alphabet key compatible with this exact state machine is therefore covered.

This tests a *new state partition* relative to the [existing previous-ciphertext entropy analysis](lp2-cipher-feedback-conditional-entropy-gate.md): the older 11-phase test used **29 distinct previous-ciphertext states per phase** and its finite-sample bound was too weak to exclude native English. Reducing the previous rune to its **modulo-11 class** gives only 121 states and a discriminating exact bound. The reduction modulo 11 itself is an inference from the inferred 11×11 grid, not an original decoding instruction.

## Key-independent exact calculation

For fixed public state \`s\`, a secret permutation merely relabels the histogram of plaintext glyphs. Hence the conditional empirical entropy is **exactly invariant**:

\`\`\`text
H(C_i | s_i) = H(P_i | s_i) <= H(P_i).
\`\`\`

The original unsolved p0–55 has **12,956** GP29 runes on **55** nonempty physical pages, yielding exactly **12,901** within-page transitions. All 121 candidate states occur.

| Model | Original conditional ciphertext entropy, bits/rune | Native-GP control maximum, bits/rune | Excess over controls |
|---|---:|---:|---:|
| Page-reset eleven-phase × previous C mod11 | **4.62707585899637** | **4.30658587056843** | **0.32048998842794** |
| Book-global eleven-phase × previous C mod11 | **4.64448470673944** | **4.30658587056843** | **0.33789883617101** |

The native-GP comparator is computed over precisely the same destination positions, excluding the original page starts. It uses **88 independently fixed sliding source windows** across the three checked-in public-domain English excerpts: Shakespeare 32, Gibran 8 and Emerson 48. The source spelling normalizer maps historical **ING→NG** and **IO→IA** as single printed original GP runes; this improves the fidelity of those English controls relative to earlier general tokenizers. The maximum is Shakespeare's **4.30658587056843** bits per rune. These windows overlap and are illustrative language controls, **not a universal statistical bound on every possible original plaintext**, including unusual English or a compressed intermediary.

The invariant holds even if all 121 alphabets are secret and selected adversarially. No 121-state per-symbol permutation decoder with either clock, no inserted/removed runes and the stated feedback rule can map the original ciphertext into any of those 88 native-prose windows. A genuine permutation could preserve a more entropic plaintext, so the mathematical result constrains the *target register* rather than ruling out the architecture as a general-purpose cipher.

## Reversible positive and direct printed-key attack

The [single-file CommonJS SFT](../sims/lp2_p32_11x11_previous_mod11_allsecret_sft.cjs) creates 121 unrelated secret 29-rune permutations, encrypts and decodes a complete **12,956-rune** native-GP English plant, and verifies every symbol and the exact conditional-entropy identity for **both page and global clocks**. The genuine English plant's conditional ciphertext entropy remains lower than its own marginal plaintext entropy as required. The same executable reconstructs every original-state histogram and evaluates all 88 English windows.

A finite stronger-source subclass reads **the 121 actual p32 rune values** as additive GP29 shifts for the row/column mapping, both signs and both clocks, eight reversible original-cipher configurations. Their complete-output IoCs lie in **0.0344–0.0346**, indistinguishable in practical terms from the original entire unknown-book **0.03447840** and far below the solved p57 **0.06271** native-GP benchmark. They produce no readable unknown-page English.

An additional exploratory, source-keyed **plaintext-feedback** direction was also run: use the 121 printed symbols to encrypt/decrypt conditioned on the *previous decoded plaintext rune mod11*, both signs and table orientations, and choose among the 29 possible page-initial register values from only the first 35 runes. All four plaintext-state variants still produce held-out GP-trigram scores about **−4.44 to −4.46 nats/rune**, against a disjoint Shakespeare native-GP reference near **−2.24**. This is a negative for the direct p32 key under that fixed model, not an all-secret plaintext-feedback impossibility.

## Research decision

Retire a **fixed, direct, GP29 English previous-ciphertext feedback alphabet with 121 states and eleven-phase clocks** as the mechanism explaining the unsolved book. Arbitrary 121 secret alphabets cannot repair its original conditional entropy. Also retire the basic eight direct p32 additive shifts and four previous-plaintext source-key choices, none of which unlocks text. Unproven alternatives include a hidden evolving state, a genuine high-entropy intermediate code, explicit rune insertion/omission, or a different source-selected grid operation.

A useful successor must specify an **authentic reversible operation and its key/state** from independent image, plaintext, or historical clues, then recover held-out original plaintext. Further language-score tuning within this fixed 121-state family is already blocked by the exact invariant.
