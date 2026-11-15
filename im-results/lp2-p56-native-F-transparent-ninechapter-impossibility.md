# Original nine LP2 chapters: exact source-p56 prime/F inverse is algebraically impossible

**Agent5, 15 November 2026. Independent original-input decision, no recovered unknown-page plaintext.** The authentic known LP2 p56 cipher is **consecutive-prime totient subtraction with a transparent plaintext-F skip**. A previous original nine-chapter punctuation transfer ([#1085](https://github.com/FlareZ123/liber-primus/issues/1085)) incorrectly advanced the prime key on literal plaintext F and checked only the pre-bypass six-rune prefix of p56; the Critic correctly challenged that positive calibration. This work tests the **real historical cipher** and checks its full original p56 solution, without language guesses or approximate statistical gates. Complete [single-file Node22 implementation](../sims/lp2_original_phi_Ftransparent_ninechapter_gate_sft.cjs) and [successful Windows source-original CI run 43705655838](https://github.com/FlareZ123/liber-primus/actions/runs/43705655838).

## Fixed original-source hypothesis

The original LP2 red-ink visual chapters start at pages **0, 3, 8, 15, 23, 27, 33, 40, 54** and end at **2, 7, 14, 22, 26, 32, 39, 53, 55**, respectively. Freeze a **separate prime-index-zero key start** at each chapter beginning; read source runes continuously across its physical pages and original punctuation. Inline tables (especially p50) do not advance or reset the rune key. These are the original illustrated chapter divisions, not inferred key resets; whether their ciphers share the later p56 key remains the hypothesis under test.

For authentic p56, the GP29 forward rule is:

- For plaintext rune **F**, numerical value **0**: output ciphertext F and **do not consume a key**.
- For every other plaintext rune value `P ≠ 0`: output `C=(P+(prime[k]-1)) mod29`; advance `k` by exactly one, beginning with first prime 2.

Thus on an observed ciphertext F, either a literal F/no-consumption transition or a key-consuming non-F inverse can be valid. For observed `C ≠ 0`, key consumption is mandatory and the inverse `P=(C-(prime[k]-1)) mod29` is **illegal when its output is F**. No amount of language-model scoring can restore an illegal state.

The SFT maintains **all reachable key-consumption counts** at each original ciphertext position. It branches exhaustively at every ciphertext F and removes only transitions forbidden by this original historical forward rule. Reaching an empty set is an exact impossibility for the entire key-start-zero hypothesis. There is no dictionary, word-spacing assumption, phase fitting, extra state, or guessed plaintext.

## Complete authentic p56 control

The untouched source p56 holds **85** GP29 ciphertext runes. The known plaintext begins **AN END WITHIN THE DEEP WEB** and ends **PILGRIM TO SEEC OUT THIS PAGE** (GP source spelling). It contains one genuine transparent plaintext F at zero-based source index **56**, so its correct key cursor consumes **84** symbols. The SFT independently converts the *complete* known 85-rune phrase to GP29, decodes the original with that known source-F mask, checks **85/85 exact plaintext**, and strictly reencrypts **85/85 original ciphertext runes** using the genuine F-transparent forward rule. The exhaustive key-clock reachability pass includes the historically true cursor 84 and returns five terminal states. This proves both the consuming/nonconsuming branches and source key are calibrated across the actual F event, unlike the earlier first-six check.

## Original unsolved chapters: exact first impossible position

All offsets are **zero-based**, counted from the fixed red-ink chapter start. Every failure lies in the **very first physical page** of its chapter. At the failure, **every previously viable F assignment** requires an illegal key-consuming plaintext F.

| Physical original chapter | Original GP29 runes | First impossible rune offset | Original ciphertext glyph | All prior key-consumed states |
|---|---:|---:|---|---|
| p0–2 | 729 | **235** | H | 231 |
| p3–7 | 1,145 | **22** | A | 22 |
| p8–14 | 1,729 | **30** | I | 30 |
| p15–22 | 1,903 | **10** | U | 10 |
| p23–26 | 1,021 | **0** | U | 0 |
| p27–32 | 1,433 | **95** | OE | 92 |
| p33–39 | 1,680 | **58** | N | 57 |
| p40–53 | 3,008 | **38** | B | 37 |
| p54–55 | 308 | **105** | M | 104 |

The p23–26 example is especially transparent: its first ciphertext rune is GP index1 (**U**), and the authentic initial `prime[0]-1=1`. Therefore the only attempted consuming inverse would be plaintext F (0), forbidden because that F would have been emitted as ciphertext F. Its chapter fails immediately, *before* any language assumption or possible skip ambiguity.

## Decision and limits

**The genuine solved-p56 prime-minus-one/F-transparent cipher cannot decrypt any of the nine unsolved original chapters when its exact historical key clock restarts at the corresponding source-visible red chapter start.** The obstruction is algebraic and complete for that model; the manuscript's distinctive F ambiguity was **exhaustively granted**, not approximated away. This sharpens and independently calibrates #1085's weaker no-bypass-key result, without contradicting the Critic's calibration criticism.

It does **not** exclude a different source-authored key, unknown starting prime index, chapter-specific preprocessing, different red-ink reset semantics, modified F exception rule, chained modes or another type of cipher. A direct p55-only start was not tested: the p54–55 chapter is treated as the source-visible 308-rune joined passage. The source has supplied no independent instruction selecting alternate starts or such transformations; avoid optimizing them merely to evade this exact contradiction.

**Cryptanalytic outcome:** all nine present fixed-key hypotheses are closed, the genuine p56 key/F machinery is positively calibrated, and no unknown source plaintext or new key has been recovered.
