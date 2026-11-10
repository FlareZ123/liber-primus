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

## Two independently sourced GP language registers: original versus planted inverse

Use the previously source-regressed [collision-keyskip GP trigram Viterbi](../sims/grid_stream_collision_viterbi.cjs) with one collision-justified extra key draw per rune, maximum 34 extra consumed positions, and penalty3.5. Select a single generator/cipher/reducer/sign on the first **160** runes of each original source-marked body. Freeze those choices and source-derived keys before decoding the following **140** untouched runes using the training-inferred keystream cursor.

Execute the same finite **192-model** attack separately under a GP-English Shakespeare register trained on 144,611 runes, and an independently committed **GP-Latin Vulgate New Testament register**, whose holdout source is a 2,400-GP-rune Revelation excerpt absent from its training collection. English [Actions run 42786965235](https://github.com/FlareZ123/liber-primus/actions/runs/42786965235) and independent Latin [Actions run 42788935288](https://github.com/FlareZ123/liber-primus/actions/runs/42788935288) both completed successfully with the same exact source/cipher tests.

| Register / target | First 160 training mean log score/rune | Next 140 frozen heldout mean | Winning original g | Red-selected g53 rank among 24 roots |
| --- | ---: | ---: | ---: | ---: |
| **Original LP2**, English GP | **−5.47413830** | **−6.03756062** | **54** | **18** |
| Synthetic source-true GP-English planted with g53 | **−2.50619889** | **−2.49676082** | **53** | **1** |
| **Original LP2**, Latin GP | **−6.35547486** | **−6.64624587** | **28** | **6** |
| Synthetic source-true GP-Latin planted with g53 | **−2.42643521** | **−2.35393743** | **53** | **1** |

Under English, original training winner **g=54 / ChaCha20 / byte mod29 / negative sign**, with individual original heldout language scores **−6.030529, −5.943377, −6.138776** and unreadable symbol sequences. Under Latin, original training winner **g=28 / ChaCha20 / scaled29 / positive sign** has individual original heldout scores **−6.504512, −6.785366, −6.648860**. The ciphertext-derived candidate **g=53** is not a supported recovered key under either source register; rankings are selected-fit diagnostics rather than probabilities.

Both positive controls use the exact independently marked **q=22/15/78**, **g=53**, AES-256-CTR, modulo29 byte mapping, positive sign, with 81%-chance collision-triggered consumed key draws. In the English-positive source, actual extra draws are **[5,8,6]**, and the blind 192-model run independently recovers the true generator, AES mode and all parameters with **420/420 GP heldout runes** recovered using the genuine source key. The Latin-positive test independently also ranks **g=53 first**, selects the exact true cipher parameters and recovers **420/420 GP heldout runes**. Both language registers therefore exhibit substantial power against the *declared* source-key and collision-skipping architecture, with no original-manuscript plaintext recovered.

## Decision and exact reproduction

The three colored-sum quotients and the primitive-root relation remain exact arithmetic on source-marked original ciphertext. The conditional significance of the earlier triangle was post-selected, and this new failure does not resolve intentionality. **Packing the 78-cycle states directly into AES/ChaCha key and nonce bytes fails to recover GP-English or Vulgate-Latin original ciphertext** under this precise construction. It does not rule out the generator being a state selector for a different substitution, a larger hidden KDF, a variable-length encoding, or an unrelated clue.

Reproduce by running [sims/red_triangle_field79_aes_inverse.cjs](../sims/red_triangle_field79_aes_inverse.cjs) with Node 22, adding `--latin` for the separate Vulgate source and independent Revelation control. The script reads the original [rune corpus](../resources/liber-primus/lp2-corpus.json), [physically colored spans](../resources/liber-primus/lp2-ink-annotations.json), independent [English GP source fixture](../resources/control/shakespeare_first300k.txt), and calls the existing exact Viterbi with frozen parameters. The consolidated [manual source-key suite](../.github/workflows/grid-stream-collision-viterbi.yml) accepts `field79-english` and `field79-latin` and was successfully rerun on [Actions 42791215361](https://github.com/FlareZ123/liber-primus/actions/runs/42791215361). Both now-retired one-shot workflows also ran successfully and prints all 24 primitive-root scores and decoded source-rune diagnostic spans. No recurring CI job was added.
