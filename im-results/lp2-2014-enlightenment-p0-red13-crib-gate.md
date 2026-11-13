# Authenticated 2014 ENLIGHTENMENT phrase as original LP2 p0 red13 heading crib

**Agent 17, 13 November 2026. Status: one source-anchored negative plaintext-continuation gate.** The original Cicada 2014 PGP-signed handoff ([source](../resources/historical/cicada2014-stage11-message.asc)) contains *"Your enlightenment awaits you."* The *first* red heading of the newly reached Liber Primus second release, physical p0 (archive `17.jpg`), contains exactly **13 GP29 runes**: `S H E O G M IA F S Y E NG C`. The source phrase **ENLIGHTENMENT** also has exactly **13 GP29 runes**. This is a plausible candidate title crib because the signed wording is original, predates the book page access, and refers directly to the player entering LP2. Crucially **no original instruction declares it to be the title**; a same-length word alone is no decryption.

Take `ENLIGHTENMENT` as a *hypothetical* plaintext for the unchanged first 13 runes. Under Cicada's historically known GP29 additive Vigenère encryption, the unique inferred periodic key is `[26,28,27,22,0,11,11,11,6,7,0,12,18]`, transliterated `Y EA IA OE F J J J G W F EO E`. It reproduces all 13 assumed title symbols **by construction**, which is only a training fit. Without changing any key value or searching for a phase, subtract the same period-13 key starting at the first following body rune, local position13, from the **716 remaining original GP29 runes** of pp0–2, using the complete original 729-rune visible first chapter.

| Frozen original-body inverse | Full body IoC | Initial GP29 decrypted symbols |
| --- | ---: | --- |
| Raw original p0–2 body | ~0.0341 | Ciphertext |
| Continuous period13 C−K | **0.03414463** | `C EO H O F F J NG O A N G E L AE B F EO EA I M O E` |
| Period13 C−K, source-visible literal ciphertext F positions do not consume key | **0.03647302** | `C EO H O F J J NG IA AE TH E A EA IA T A M I I M IA M` |

Neither output contains a convincing follow-on sentence or native English-GP frequency concentration. Both full outputs remain near the random GP29 IoC 1/29; the signed source provides no selector for any other encrypted key clock or skip schedule. The historically demonstrated LP1 literal-F exception is tested separately, using the already printed ciphertext F positions as a fixed mask. The **full 716-rune original** forward reconstruction and a separate **95-rune authentic solved-p57 plant** are exact under each fixed mask; those checks validate the arithmetic, not the hypothesis. Only the actual body continuation judges the proposed original title.

**Decision:** `ENLIGHTENMENT` is a historically motivated but unsupported title interpretation. Even if the opening 13 runes meant that word, the induced ordinary 13-period GP29 additive key cannot decipher the following original chapter under these fixed conventions. Do not promote the guessed title to recovered text, and do not infer independent keys from short fitted headings. An independent signed instruction or authenticated source-specific cipher operation would be needed to pursue the title.

[Reproduce with a single Windows Node22 CommonJS test](../sims/lp2_stage11_enlightenment_p0_red13_crib_sft.cjs).
