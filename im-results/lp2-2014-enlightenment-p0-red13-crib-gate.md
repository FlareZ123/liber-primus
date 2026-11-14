# Authenticated 2014 ENLIGHTENMENT phrase: original LP2 p0 red13 crib and autokey gates

**13–14 November 2026; Agent17 finite continuation, Agent29 exact source-cipher exclusion. Status: the derived period-13 cipher is mathematically impossible on original p0 under the authentic plaintext-F skip rule; the title remains an unproved crib.** The original Cicada 2014 PGP-signed handoff ([source](../resources/historical/cicada2014-stage11-message.asc)) contains *"Your enlightenment awaits you."* The *first* red heading of the newly reached Liber Primus second release, physical p0 (archive `17.jpg`), contains exactly **13 GP29 runes**: `S H E O G M IA F S Y E NG C`. The source phrase **ENLIGHTENMENT** also has exactly **13 GP29 runes**. This is a plausible candidate title crib because the signed wording is original, predates the book page access, and refers directly to the player entering LP2. Crucially **no original instruction declares it to be the title**; a same-length word alone is no decryption.

Take `ENLIGHTENMENT` as a *hypothetical* plaintext for the unchanged first 13 runes. Under Cicada's historically known GP29 additive Vigenère encryption, the unique inferred periodic key is `[26,28,27,22,0,11,11,11,6,7,0,12,18]`, transliterated `Y EA IA OE F J J J G W F EO E`. It reproduces all 13 assumed title symbols **by construction**, which is only a training fit. Without changing any key value or searching for a phase, subtract the same period-13 key starting at the first following body rune, local position13, from the **716 remaining original GP29 runes** of pp0–2, using the complete original 729-rune visible first chapter.

| Frozen original-body inverse | Full body IoC | Initial GP29 decrypted symbols |
| --- | ---: | --- |
| Raw original p0–2 body | ~0.0341 | Ciphertext |
| Continuous period13 C−K | **0.03414463** | `C EO H O F F J NG O A N G E L AE B F EO EA I M O E` |
| Period13 C−K, source-visible literal ciphertext F positions do not consume key | **0.03647302** | `C EO H O F J J NG IA AE TH E A EA IA T A M I I M IA M` |

Neither output contains a convincing follow-on sentence or native English-GP frequency concentration. Both full outputs remain near the random GP29 IoC 1/29; the signed source provides no selector for any other encrypted key clock or skip schedule. The earlier fixed-ciphertext-F skip variant is a diagnostic surrogate rather than the authentic historical rule. Solved Cicada ciphertext F can also represent an encrypted non-F; only a *plaintext* F bypasses the cipher without consuming a key. The actual rule is tested exactly below. The **full 716-rune original** forward reconstruction and a separate **95-rune authentic solved-p57 plant** are exact under each fixed mask; those checks validate the arithmetic, not the hypothesis. Only the actual body continuation judges the proposed original title.

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

## Exact all-clock historical F-bypass gate (14 November 2026)

The earlier native-English score is superseded for this one historical cipher family by a **key-and-source contradiction**. The candidate heading ENLIGHTENMENT contains no plaintext F, so its first 13 original ciphertext runes determine the complete 13-rune additive key with no clock skips during the heading: `[26,28,27,22,0,11,11,11,6,7,0,12,18]`. Every remaining ciphertext F is permitted to represent either a literal skipped plaintext F or an ordinary encrypted non-F, but all key-consuming steps decoding to plaintext F are forbidden by the original encoder.

The original p0–2 source has **729 runes**. On p0, zero-based original rune **17** is ciphertext F; the selected key shift there is zero, so this particular F *must* be a literal plaintext F and cannot consume the key. By original rune **42**, all allowed branches collapse to one key clock, with **41** consumed key symbols. The printed ciphertext rune at 42 is **IA**, numeric index **27**, and the only scheduled key shift is `K[41 mod13]=27`. A consuming inverse would yield plaintext F, although the ciphertext is non-F. There is no bypass branch at that site. **Zero legal inverse paths survive local rune42**, irrespective of plaintext language, dictionary, or fitted F mask.

The exact source-grounded [CommonJS test](../sims/lp2_p0_enlightenment_ftransparent_exact_certificate_sft.cjs) tracks every possible key clock. Independently solved original p56 with its actual prime-totient key strictly re-encrypts **85/85** and survives its ambiguous F clock. A 729-rune native-English positive planted under the same alleged p0 key and correct bypass rule also survives to its end. The [Windows Node22 source execution](https://github.com/FlareZ123/liber-primus/actions/runs/43590806153) passes. A separate candidate from signed 2016 EPIPHANY SEEKS also suffers a hard contradiction on p0 at original rune57, as recorded in its [own source-crib study](lp2-p0-2016-epiphany-title-crib-gate.md).

This exact rejection is **specific** to the derived period-13 additive key and authentic plaintext-F skip consumer. The signed prose does not certify that ENLIGHTENMENT is the heading: it is a single word while the physical red title has an 8–5 separation. No new unknown ciphertext plaintext or key is recovered.
## Decision

`ENLIGHTENMENT` remains an unsupported title crib, with a separate 8–5 printed-word-break objection. The **historically correct period-13 plaintext-F model has zero legal inverse paths by original p0 rune42**. Earlier ordinary-period13 and stride13 autokey continuations also fail to decipher the chapter in their specified families, despite positive plants. A different authored operation or additional key material would have to be independently identified. These bounded negatives supply no unknown plaintext or cipher solution.

[Reproduce with a single Windows Node22 CommonJS test](../sims/lp2_stage11_enlightenment_p0_red13_crib_sft.cjs).
