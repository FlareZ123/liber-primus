# Red prime-pointer triangle as an AES/ChaCha 78-state field-cycle key

**Classification (Agent 32, 2026-11-10): directly executed source-based decryption hypothesis and exact 24-generator contrast.** The actual original text fails its source-selected key test, while an independently planted correct field-cycle cipher is identified and completely decrypted on heldout material. This does not recover an authentic LP2 plaintext, cipher or key.

## One source-constrained cryptographic mechanism

Three independently red-colored physical LP2 spans carry GP-prime sums divisible by 29:

| LP2 physical page | Original rune offsets | Prime sum | Source quotient |
| --- | ---: | ---: | ---: |
| 15 | [0,9) | 638 | **22** |
| 40 | [0,8) | 435 | **15** |
| 53 | [128,179) | 2262 | **78** |

The earlier exact [red-span triangle](red-span-triangle.md) ties these three ciphertext-colored values to GP index15 and prime value **53**, the 22nd ordinary prime **79**, and Euler's **φ(79)=78**. Its selected generator 53 has exact full multiplicative order78 modulo79: **53^15 ≡ 15 mod79**. This current inversion asks whether those source values literally initialize a 256-bit symmetric key and its IV, rather than simply an additive 29-valued pad. Such a use is plausible to test and remains entirely **hypothetical**, with no independent instruction to apply AES or ChaCha20.

For each source quotient q in **[22,15,78]** and candidate generator g, set state = g^q (mod79). Take 48 consecutive nonzero field states from the recurrence state←g×state (mod79), pack the first **32 states as 32 literal bytes** for one AES-256-CTR or ChaCha20 key and the next **16 states as the 128-bit IV**. Derive a new source key for each anchor. Other than an overall cipher and GP-byte convention shared by all three bodies, there is no fitted key material. Source-target alignments are fixed at the first 300 runes after physical p15 red headings (local offset20), after p40 red heading (local offset8), and the terminal body beginning p54 after the entire p53 red stanza. The source grid is *not* used by this model.

Instead of only the red-selected primitive generator 53, exhaust **all 24 primitive roots of the 78-element nonzero field group F79** as a finite contrast, with both AES-256-CTR/ChaCha20, byte-to-GP mod29/scaled29 reduction, and both signs: **24×2×2×2 = 192 fully specified decoders**. This exact comparator differs from ad hoc retuning source powers against English scores. All input red spans are rechecked against the original 29 GP prime assignments in the implementation.

## Real original and powered synthetic blind inversion

Use the previously source-regressed [collision-keyskip GP trigram Viterbi](../sims/grid_stream_collision_viterbi.cjs) with at most one collision-justified consumed extra key symbol per rune, maximum34 extra consumed positions, and fixed skip penalty3.5. Select a common generator/cipher/reducer/sign on only the first **160** runes of each original target. Keep the chosen configuration and source-derived keys frozen, and decode the next **140** independently designated runes using the training-inferred keystream offset.

[Successful independent original-data Actions run 42786965235](https://github.com/FlareZ123/liber-primus/actions/runs/42786965235) reported:

| Test | First 160/rune mean train | Next 140/rune mean heldout |
| --- | ---: | ---: |
| **Actual LP2**, best of 192 original models | **−5.47413830** | **−6.03756062** |
| Source-true independently planted GP English, blind same 192 scan | **−2.50619889** | **−2.49676082** |

The **real original training winner is generator g=54**, ChaCha20, byte mod29, negative sign. Its heldout readings of the three source-anchored bodies have per-rune language scores **−6.030529, −5.943377, −6.138776**, all unreadable. Crucially, the red-selected **g=53 ranked 18th out of 24 possible primitive roots** by real original training score. It exhibits no special original-cipher advantage under the proposed field-byte/AES architecture.

The independent positive uses three heldout GP-English Shakespeare excerpts and exactly the **source's original q=22/15/78** with selected **g=53**, AES-256-CTR, byte modulo29, positive sign. It physically consumed **[5,8,6] additional field-key-stream draws** under 81%-probability same-output collision rejection. The full blind 192-model inversion recovered **g=53 at rank1**, selected the original true cipher/reducer/sign and reconstructed **all 420/420 heldout original GP plaintext runes** using the genuine source key and Viterbi-inferred key skips. This is a direct power check with the very same numbers and skip mechanism, rather than a generic checksum.

## Decision and exact reproduction

The three colored-sum quotients and the primitive-root relation remain exact arithmetic on source-marked original ciphertext. The conditional significance of the earlier triangle was post-selected, and this new failure does not resolve intentionality. **Packing the 78-cycle states directly into AES/ChaCha key and nonce bytes fails to recover original ciphertext** under this precise construction. It does not rule out the generator being a state selector for a different substitution, a larger hidden KDF, a variable-length encoding, or an unrelated clue.

Reproduce by running [sims/red_triangle_field79_aes_inverse.cjs](../sims/red_triangle_field79_aes_inverse.cjs) with Node 22. The script reads the original [rune corpus](../resources/liber-primus/lp2-corpus.json), [physically colored spans](../resources/liber-primus/lp2-ink-annotations.json), independent [English GP source fixture](../resources/control/shakespeare_first300k.txt), and calls the existing exact Viterbi with frozen parameters. [Manual workflow](../.github/workflows/red-triangle-field79-aes-inverse.yml) ran successfully and prints all 24 primitive-root scores and decoded source-rune diagnostic spans. No recurring CI job was added.
