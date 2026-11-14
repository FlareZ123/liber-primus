# Authenticated 2014 ENLIGHTENMENT phrase: original LP2 p0 red13 crib and autokey gates

**Agent 17, 13 November 2026. Status: one source-anchored negative plaintext-continuation gate.** The original Cicada 2014 PGP-signed handoff ([source](../resources/historical/cicada2014-stage11-message.asc)) contains *"Your enlightenment awaits you."* The *first* red heading of the newly reached Liber Primus second release, physical p0 (archive `17.jpg`), contains exactly **13 GP29 runes**: `S H E O G M IA F S Y E NG C`. The source phrase **ENLIGHTENMENT** also has exactly **13 GP29 runes**. This is a plausible candidate title crib because the signed wording is original, predates the book page access, and refers directly to the player entering LP2. Crucially **no original instruction declares it to be the title**; a same-length word alone is no decryption.

Take `ENLIGHTENMENT` as a *hypothetical* plaintext for the unchanged first 13 runes. Under Cicada's historically known GP29 additive Vigenère encryption, the unique inferred periodic key is `[26,28,27,22,0,11,11,11,6,7,0,12,18]`, transliterated `Y EA IA OE F J J J G W F EO E`. It reproduces all 13 assumed title symbols **by construction**, which is only a training fit. Without changing any key value or searching for a phase, subtract the same period-13 key starting at the first following body rune, local position13, from the **716 remaining original GP29 runes** of pp0–2, using the complete original 729-rune visible first chapter.

| Frozen original-body inverse | Full body IoC | Initial GP29 decrypted symbols |
| --- | ---: | --- |
| Raw original p0–2 body | ~0.0341 | Ciphertext |
| Continuous period13 C−K | **0.03414463** | `C EO H O F F J NG O A N G E L AE B F EO EA I M O E` |
| Period13 C−K, source-visible literal ciphertext F positions do not consume key | **0.03647302** | `C EO H O F J J NG IA AE TH E A EA IA T A M I I M IA M` |

Neither output contains a convincing follow-on sentence or native English-GP frequency concentration. Both full outputs remain near the random GP29 IoC 1/29; the signed source provides no selector for any other encrypted key clock or skip schedule. The historically demonstrated LP1 literal-F exception is tested separately, using the already printed ciphertext F positions as a fixed mask. The **full 716-rune original** forward reconstruction and a separate **95-rune authentic solved-p57 plant** are exact under each fixed mask; those checks validate the arithmetic, not the hypothesis. Only the actual body continuation judges the proposed original title.

## Distinct fixed autokey follow-on (Agent 30, 14 November 2026)

A 13-rune red heading could itself be a seed rather than a periodically repeated Vigenère key. The literal GP29 recursive model is unusually cheap to reject because the first 13 original ciphertext runes, signed phrase, physical chapter and continued rune clock are fixed *before* decoding. Four source-frozen readings of the following 716 original pp0–2 runes were tested:

| Frozen operation, positions 13–728 | Original GP29 IoC | First ten decoded rune labels |
| --- | ---: | --- |
| Ciphertext feedback `P[i]=C[i]-C[i-13]` | **0.03494941** | T O B OE D NG A O D C |
| Opposite feedback `P[i]=C[i]+C[i-13]` | **0.03531273** | B M A EA G U L O A EA |
| Plaintext autokey `P[i]=C[i]-P[i-13]`, initialized by literal `ENLIGHTENMENT` | **0.03469938** | P TH S S D O G X F EO |
| Same plaintext autokey initialized by the unchanged 13 red ciphertext runes | **0.03460952** | T O B OE D NG A O D C |

The full source 729-rune baseline has IoC **0.03408252**; the authentic unencrypted p57 reference has **0.06270997**. All four original outputs remain flat and nonlinguistic. Each exact recursion independently recovers an 82-rune authentic-GP p57 synthetic plant, so the negative is not an implementation failure. The tested plaintext-autokey start is explicitly conditional on the **unproven** ENLIGHTENMENT title crib. This does not exclude autokey with a different stride, primer, reset or register, nor does the original source select an autokey opcode.

[Standalone source-exact SFT](../sims/lp2_stage11_enlightenment_red13_autokey_sft.cjs), which checks the 13 printed ciphertext runes, 729-rune chapter, all four complete 716-rune outputs and all four positive controls.

## Decision

`ENLIGHTENMENT` is a historically motivated but unsupported title interpretation. The source-locked ordinary 13-period GP29 additive key and four distinct literal stride-13 autokey continuations all fail to decipher the original chapter, despite exact positive plants. A different authored operation or additional key material would have to be independently identified. These bounded negatives supply no unknown plaintext or cipher solution.

[Reproduce with a single Windows Node22 CommonJS test](../sims/lp2_stage11_enlightenment_p0_red13_crib_sft.cjs).
