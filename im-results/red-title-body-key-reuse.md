# Red-title-anchored section-body pad reuse: exact source test

**Classification:** bounded, replicated negative for a specific reversible key-reuse model. **No unknown LP2 rune is decrypted; no key or destination recovered.** This is a targeted check of the freshly image-validated red-title endpoints, not a general exclusion of stateful or page-specific ciphers.

## Decryption hypothesis and exact physical anchors

The ink source `resources/liber-primus/lp2-ink-annotations.json` preserves the original positions of marked red section titles. Eight substantive LP2 text sections follow red titles. A ninth section of only nine red runes is a title-and-matrix bridge and has no text body for a fair shared-body comparison. Test whether the **same additive mod-29 keystream restarts at the first black rune after each red title**, a potentially cryptographically distinguished boundary.

For two bodies beginning at their independently recorded red-title ends, a common additive pad would cancel:
`(C_A[i] - C_B[i]) mod29 = (P_A[i] - P_B[i]) mod29`.
The resulting equality rate is the plaintext coincidence rate. For independent texts from one nonuniform GP-English marginal, it is much larger than 1/29. Their full 29-bin residue-difference distribution must also be symmetric.

The eight title anchors are physical LP2 (page, rune offset, number of red title runes): `(0,0,13), (3,0,16), (8,0,12), (15,9,11), (23,0,16), (27,0,19), (33,91,8), (40,0,8)`. They align exactly against both the authoritative master transcription and the newly checked red annotations. Corresponding body rune lengths are **716, 1129, 1717, 1883, 1005, 1505, 1581, 3308**. The uncut nine-section lengths independently assert as `[729,1145,1729,9,1894,1021,1524,1589,3316]`; no physical-page splice or matrix-page runes are introduced.

## Original manuscript versus family-matched null

Every unordered pair of the eight body streams is aligned at its red-title end, giving **28 body pairs** and **32,767** rune comparisons. The pooled exact-rune equalities are **1,143/32,767 = 0.03488266**, effectively the flat 1/29 baseline. The maximum symmetric difference-histogram statistic across those 28 comparisons is **23.432338** (body index 2 against 4, 1,005 runes).

The familywise null independently circularly rotates *each original body* and rescans all 28 pairs, preserving each section's exact runes and local adjacency cycle but breaking cross-section phase synchrony. In **2,000** reproducible rotations (seed **37061337**), **644** have a pooled coincidence rate at least the real one and **1,584** have a maximal symmetric difference statistic at least the real maximum. Add-one p-values: **0.32234** and **0.79210**, respectively. There is no detected title-end shared-key phase.

## Powered known-register positive

Take `resources/liber-primus/lp1-plaintext-reference.txt` (a separately solved Cicada prose reference), strip headings, encode 3,473 GP runes by longest-token transliteration and estimate its 29-way unigram marginal. Independent GP runes sampled from that fixed marginal have theoretical same-position equality probability **0.06043006**. Use the exact eight original body lengths, independently sample each plaintext body, encrypt all with a single fresh uniform mod-29 pad *restarted at offset zero* and independently overwrite **81%** of immediate repeated ciphertext symbols to a different rune.

Across **100** seeded controls (`0x3701c51`), all planted pooled coincidence rates are **0.056612–0.062136**, with median **0.058840**, cleanly separated from LP2's **0.034883**. This positive control establishes strong power to detect the stated English-like common-key architecture despite the arbitrary modeled anti-repeat overwrite. Its overwrite step is a synthetic testing assumption, not a proven Cicada operation.

## Practical implication

A single shared additive pad restarted **immediately after every red section title** cannot account for LP2 if the bodies contain an ordinary Cicada-like GP-English symbol marginal with similar independent content. This avoids pursuing an entire family of visually attractive title-reset models without any observed common-phase support. **Different keys per section, title-dependent KDFs, ciphertext-dependent skips, unknown outer alphabets, transposition and non-English intermediate alphabets remain viable**, and no actual keystream bytes have been recovered.

Reproduce using `node sims/red_title_body_key_reuse.cjs`. It asserts every section size, every red-title string, and every body length before evaluating the original, null and planted books. The manually dispatched [successful 2026-11-10 CI run](https://github.com/FlareZ123/liber-primus/actions/runs/42767722884) includes the exact output. This result is supplementary to the broader page-position phase tests in `im-results/phase-coincidence-invariant.md`; the physical title endpoints and section-body alignment are distinct.

**Research priority after this result:** look for independently constrained title-to-key derivations or recovered key material that can invert an original interval. Further resets with only fitted alignment offsets and language scores do not supply that evidence.
