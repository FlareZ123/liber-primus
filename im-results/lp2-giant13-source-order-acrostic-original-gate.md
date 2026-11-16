# Thirteen original illuminated initials: fixed acrostic and direct-key decision

**Source-derived result, Agent3, 16 November 2026; Director #1265.** The 13 genuinely illuminated oversized red initials on LP2's 56 unresolved physical pages spell **S · L · P · A · X · L · U · M · D · NG · IA · F · A** in **original page and reading order**. This is a reproducible extraction from original image-identified glyphs; **it does not yield a complete intelligible instruction, an authored cipher key, or unknown LP2 plaintext** under the narrowly tested authentic solved-page operations. The most direct repeated-key additive receiver leaves both independent original ciphertext regions essentially uniform. The original source does not select a nonrepeating key schedule, state initializer, or acrostic consumer.

## Exact source object, including the less obvious interior initials

The independent whole-image full-height red component classifier uses only the original solved p56 GP29 font as a glyph-label reference. Its 13 giant glyph identifications were reported before this interpretation in [the Round9 original-image audit](lp2-round9-independent-unmapped-class-audit.md). The source red spans and exact GP29 positions are asserted against `resources/liber-primus/lp2-corpus.json` and `lp2-ink-annotations.json` by the [standalone SFT](../sims/lp2_giant13_acrostic_original_sft.cjs). Original scan filename = physical page +17, e.g. p0 = `17.jpg`.

| Original physical page | Rune offset (0-based) | Enlarged red rune | Native GP29 index | GP prime |
| ---: | ---: | :---: | ---: | ---: |
| 0 | 0 | S | 15 | 53 |
| 3 | 0 | L | 20 | 73 |
| 3 | 119 | P | 13 | 43 |
| 6 | 71 | A | 24 | 97 |
| 8 | 0 | X | 14 | 47 |
| 15 | 9 | L | 20 | 73 |
| 23 | 0 | U | 1 | 3 |
| 27 | 0 | M | 19 | 71 |
| 33 | 0 | D | 23 | 89 |
| 33 | 91 | NG | 21 | 79 |
| 39 | 119 | IA | 27 | 107 |
| 40 | 0 | F | 0 | 2 |
| 54 | 0 | A | 24 | 97 |

The deliberately prominent characters occur at **11 different pages**, including two each on p3 and p33. The less obvious starts p6/rune71, p15/rune9 and p39/rune119 are required; taking only page-initials would misread the evidence. The two separate solved-image classifier controls are p56's giant AE and p57's P; they are **not** members of the 13 unknown-page sequence. `NG` and `IA` are **inventory labels**; source-attested English may render these same runes as ING and IO, so the roman letters must not be treated as a uniquely spelled English plaintext.

The exact ordered GP29 index tape is `[15,20,13,24,14,20,1,19,23,21,27,0,24]`. Its index sum is 221 and mean 17; its GP-prime sum is 834. These arithmetic observations supply no independently authored operation. The first S matches p0's first red heading rune by **shared physical identity**, not because two independent 13-rune registers agree. The p0 red heading is precisely 13 runes (8+5), followed by the large 13-dot marker at original rune offset13; no reassignment of its ink was made.

## Fixed, historically licensed readouts

A human would first read the giant letters in source order, possibly reverse the order, or apply the actual p56 GP29 prime-totient rule. The latter means subtracting `phi(p_i)=p_i-1` modulo29, with a transparent **plaintext-F** branch whenever ciphertext F occurs. These are the only tested prime-totient branch alternatives: the SFT checks the *full 85-rune original p56* against the authentic solved text (including its F bypass) before applying the rule to the initials.

- The literal 13-glyph tape, and its reversal `A F IA NG D M U L X A P L S`, are not a recognizable complete instruction.
- **Forward p56 cipher, both legal F branches:** `X-E-N-E-R-H-X-U-U-OE-Y-F-B` or `X-E-N-E-R-H-X-U-U-OE-Y-OE-P`.
- **Reverse p56 cipher, both legal F branches:** `D-F-AE-B-B-N-E-R-AE-TH-X-M-H` or `D-IA-D-S-P-W-X-TH-NG-AE-EO-P-R`.
- Direct GP29 Atbash and modulo29 rendering of the fixed GP prime values also produce no complete, source-typed instruction. The script publishes the exact prime values rather than treating the post-selected sum as a decoding key.

The documented earlier LP1 `FIRFUMFERENFE` 13-character keyword, applied once with additive/subtractive GP29 alignment, likewise yields `S-I-N-A-P-U-U-U-M-O-E-F-G` and `S-U-B-A-S-I-U-H-IA-I-W-F-P`. The string length match alone does not authorize this keyword as an LP2 acrostic decoder.

## Original-cipher direct additive consumer

As a bounded check, use the 13 **original** cap indices directly as a repeated modulo29 additive key, without fitting anything from the unknown ciphertext:

`P_i=(C_i-K_(i mod 13)) mod 29`; also inspect the opposite sign, `P_i=(C_i+K_(i mod13)) mod 29`. The tested receiver is an intentionally weak historical-Vigenère transfer, **not** an authored nonrepeating key schedule. Its origin is frozen at the start of each named input region. Native clear p57 is an exact positive plant under the same encoder/inverse; exact forward reencryption of every original rune is verified as an implementation invariant, rather than evidence that a key is correct.

| Original region | Original runes | Cipher IoC | Subtract-caps IoC | Add-caps IoC |
| --- | ---: | ---: | ---: | ---: |
| p0 black body + p1–2 (no p0 red title) | **716** | 0.03410165 | **0.03412509** | 0.03417979 |
| disjoint p3–7 | **1,145** | 0.03463371 | **0.03451919** | 0.03434208 |
| native p57 clear positive, for comparison | **95** | **0.06270997** | 0.04076148 | 0.03449048 |

The subtract-caps 716-rune result begins `T-L-OE-U-S-L-NG-P-S-I-J-E-E-O-TH-R-TH-IA-I-A-M-L` and the held-out 1,145-rune result begins `C-L-EA-P-W-X-U-Y-TH-M-E-X-P-U-I-N-L-EA-P`, with no apparent contiguous GP-native English. An unrelated, original 13-rune p1 control key (`A-I-M-S-N-S-OE-R-U-W-S-L-IA`) yields **0.03399226** on p0 and **0.03436956** on p3–7. Thus the cap-key output cannot be distinguished from this local original-source negative control by the same statistic. The p57 comparison is a short cleartext reference, not a formal p-value; the first 80-rune outputs and all exact computations are emitted by the SFT.

## Independent original-source Fibonacci13 seed/clock candidate

The original p15 prime-square is indexed by the Fibonacci sequence; the consecutive Fibonacci values **5, 8, 13** can motivate a 13-stage additive recurrence when combined with the genuinely image-identified thirteen giant initials. This yields a limited, source-legible alternative to a **repeated** 13-glyph key: freeze the source-index seed `K[0..12]` above and extend it deterministically by `K[i] = (K[i−8] + K[i−13]) mod 29` for `i≥13`. This is a plausible designer operation, **not an authenticated instruction to apply this recurrence to these initials**. The test has **no tuned cipher parameters**. The key begins `15,20,13,24,14,20,1,19,23,21,27,0,24,6,21,3,18,6,18,1,14,0,13,1`.

Use the standard known-page additive convention `C=(P+K) mod29`. Start the key clock at the first **black** p0 rune after the original 13-rune red heading, run continuously through 716 p0–2 original body runes, then continue without reset through 1,145 untouched p3–7 runes. A full original rune-by-rune inverse and forward-encryption assertion passes. A separate source-native p57 positive plant decrypts **95/95** runes with this exact key. Original results:

| Frozen original test | Rune positions | Decoded IoC | First decoded GP29 tokens |
| --- | ---: | ---: | --- |
| p0 black + p1–2 | 716 | **0.034765792866** | `T L OE U S L NG P S I J E EO J O OE R G NG L` |
| holdout p3–7, same continuous key | 1,145 | **0.034604696613** | `P E A U U O EO R IA EO C IA X W E OE I D L F` |
| genuinely clear p57 language reference | 95 | **0.062709966405** | `P A R A B L E L I C E...` |

Both outputs are essentially uniform GP29 registers and contain no sustained recognizably grammatical plaintext. The accompanying independent natural rule that **plaintext F bypasses the cipher and does not consume key**, exactly as authenticated on solved p56, is even more decisively impossible. The exact F-branch state automaton tracks **every** possible consumed-clock count (ciphertext F may be a bypass or an encrypted non-F). It loses all legal paths at zero-based p0-black offset **39**; on the withheld p3–7 section it loses all paths at offset **19** with a continuous key, or **73** with a reset. The native p57 95-rune F-transparent planted positive fully decodes. This excludes the **specific** Fibonacci lag8+lag13 initial-key stream under either of those natural cipher-transport conventions, rather than all Fibonacci schemes or all uses of giant initials.

This frozen additional test is in the **same** [source-locked runnable SFT](../sims/lp2_giant13_acrostic_original_sft.cjs), executed with all assertions passing against the exact original corpus and ink JSON inputs. It does not change the primary issue's conclusion: no source-selected key/clock or actual unknown plaintext has emerged. The result discourages further Fibonacci coefficient fitting absent a new historical instruction.

## All-secret 13-seed extension: a recurrence annihilator eliminates every possible initial key

The fixed giant-cap seed above could fail simply because the **initial thirteen key symbols are wrong**. A stronger and mathematically independent question grants *every one of the 29¹³ possible initial thirteen-GP-rune seeds* under the **same source-motivated Fibonacci taps**. For ordinary mod29 additive encryption `C=P+K` with `K_i=K_(i−8)+K_(i−13)`, define the linear residual at each position `i≥13`:

```text
Y(X)[i] = X[i] − X[i−8] − X[i−13] (mod 29).
```

Every such unknown seeded key satisfies `Y(K)=0`; therefore **`Y(C)=Y(P)` exactly, at every single non-rekeyed position**, without ever guessing the key. A direct original-source check can compare the complete **29-bin** residual histogram against historical GP-native English references. If two histograms disagree, no initial key can fix it; each allowed independent recurrence fault can repair at most one histogram count, giving exact lower bound `½Σ |hist(Y(C))−hist(Y(P))|`, even after unrealistically allowing all positions to reorder.

An all-source scan uses every consecutive full-length source-native original GP29 English rune window in Shakespeare, Gibran and Emerson, with their established manuscript-attested **ING→ᛝ** and **IO→ᛡ** spellings. The three control lengths are **217,106**, **62,492**, **321,327** original-token GP runes. Both separate p0-black and p3–7 chapter scopes and the whole unknown book are frozen. These numbers are the **minimum required recurrence-error glyphs**, among *all* corresponding native-English comparator windows; even the most favorable word sequence in each reference is admitted:

| Original ciphertext scope / residual positions | Shakespeare | Gibran | Emerson |
| --- | ---: | ---: | ---: |
| p0-black through p2, **703** residuals | **42 / 216,391** tested windows | **45 / 61,777** | **43 / 320,612** |
| Disjoint p3–7, **1,132** residuals | **59 / 215,962** | **49 / 61,348** | **58 / 320,183** |
| All untouched p0–55, **12,943** residuals | **335 / 204,151** | **370 / 49,537** | **322 / 308,372** |

There are **zero exact matches** in every cell; no possible thirteen-rune initial key produces any of the tested source-native passages by **this exact additive Fibonacci recurrence with no faults**. The p0 and p3 heldouts demand **at least 42/703 =5.97%** and **49/1,132 =4.33%** exceptions respectively to imitate even one tested native-English residual histogram. Over the full book the lower bound is smaller (as low as **322/12,943 =2.49%**), but still excludes a single error-free stream. The full original GP index order is preserved in each scope. A 95-rune independently solved p57 positive is encrypted using two *different unknown thirteen-rune initial keys*, with the same recurrence: the residuals match in **82/82** positions and both complete 95-rune decryptions round-trip perfectly.

This is a **key-independent finite-register obstruction** and an exact quantitative requirement for fault-bearing/rekeyed variants; it does not exclude arbitrary unknown prose with a precisely matching residual distribution, source encoding not tested, a cipher inserting/deleting runes, a key skipping positions for F, or alternative recurrences. The original manuscript's visual Fibonacci spiral motivates the tested taps but does not authenticate this coding model or the use of giant initials as a seed. The [standalone read-only Windows CommonJS SFT](../sims/lp2_giant13_fib8_13_allseed_hist_sft.cjs) was executed against all four exact checked-in sources with **all hard assertions and two independent planted positives passing**. Unlike searching 29¹³ seeds, the histogram proof is complete for the stated algebraic family.

## Decision and a real next gate

**Close #1265 as a sourced acrostic hypothesis with a completed narrow direct-consumer negative.** The image-derived 13-symbol string is genuine and reusable, but no first-party Cicada instruction presently selects its transposition, alphabet-to-key serialization, GP29 receiver, clock, or exact location within the manuscript. Source-natural prime/totient and the direct repeated-key attack produced no original plaintext. Neither result excludes some future, independently source-selected *nonrepeating* interpretation of the initials.

A meaningful successor needs **one new authored instruction** that specifically selects the giant capitals and a reversible consumer/clock. It must then predict original p0 black body prose from the **entire 716-rune source**, survive a held-out p3–7 chapter without retuning, and support an independently intelligible continuation. More offsets, shift searches or post-selected numerical coincidences against this 13-symbol string are not justified.

**Reproduce:** `node sims/lp2_giant13_acrostic_original_sft.cjs` in the repository. Inputs are checked-in exact GP29 original corpus, original ink spans and the independently verified giant-cap list; no external network access is required.
