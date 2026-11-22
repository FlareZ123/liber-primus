# Original p15 Fibonacci recurrence modulo29: period-14 inverse decision

**Agent40, 13 November 2026. Classification: original-source, bounded negative for a source-motivated candidate family. No unknown LP2 plaintext, historical key or destination.**

## Causal hypothesis and independent starting clue

The original physical LP2 p15 (archive JPEG \`32.jpg\`) prints a 4×4 numerical square and an infinity sign. Its exact published clockwise spiral starting at red **3299** is the already established transform \`abs(3301-prime_(F+1))\` over **sixteen distinct Fibonacci values** \`[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]\`. The ordinary Fibonacci recurrence from F₀=0,F₁=1 has **Pisano period 14 modulo29**: \`[0,1,1,2,3,5,8,13,21,5,26,2,28,1]\`, followed by \`0,1\`. Original LP2 uses 29 GP rune symbols, giving an independently defined short candidate cipher clock.

**Important weakness:** the printed sixteen distinct values skip the duplicate Fibonacci 1. The source does not say to discard the prime-index operation, use Fibonacci values modulo29, repeat a 14-state clock, or decrypt nearby text via position-wise substitution. The infinity drawing could have another meaning. This gate tests the simple reversible original-register hypothesis rather than attributing an operation to Cicada.

The initial target is the **immediately following original p16–22, unmodified**, with 1,744 runes in physical-page chunks \`[267,273,260,271,269,273,131]\`. This is different from the previous 16-spiral-entry key gates ([period16 arbitrary-secret gate](lp2-p15-period16-allsecret-source-gate.md), [source-selected F-bypass period16/prime-totient gates](lp2-p15-ftransparent-allphase-feasibility.md)). Do not rerun those.

## Decisive key-independent test

Allow each phase modulo14 **an arbitrary secret bijection of the entire 29-symbol GP alphabet**, independent of all other phases. Test both (a) continuous across all 1,744 source runes, 14 secret alphabets and (b) independently restarted at every physical page, 98 independent secret alphabets. These models include every additive, affine, Atbash or full 29-symbol substitution key at their assigned positions, even with a totally unknown author key.

For each clock class count ordered same-class equal ciphertext pairs. Any bijection preserves all symbol equalities in its class. Compare to the exact *same frozen page-length overlay* of source-native English with verified solved-LP1 spelling for single-rune ING and IO. For each of Shakespeare, Gibran, Emerson, use windows of 1,744 source-native GP symbols at **frozen stride151**. Window controls are finite comparisons, not independent probability samples.

| Clock | Original equal ordered pairs / all pairs | Original rate | Shakespeare minimum / windows | Gibran minimum / windows | Emerson minimum / windows |
| --- | ---: | ---: | ---: | ---: | ---: |
| Continuous period14 | 7372 / 215512 | **0.0342069119121** | 0.0543264412191 / 1427 | 0.0564330524518 / 403 | 0.0576487620179 / 2117 |
| Physical-page/phase period14 | 990 / 30484 | **0.0324760530114** | 0.0504526964965 / 1427 | 0.0547828368980 / 403 | 0.0547172287101 / 2117 |

**0 of 3,947** source-native control windows in either class has a collision rate as low as original. This does **not** prove that the original is non-English, since other orthographies, word order changes, fractionation, state-dependent substitutions and unknown clock interpretations remain.

The reproducer uses two **positive original-shape planted controls**: it enciphers exactly 1,744 source-native GP symbols under independently secret affine substitutions in each continuous or physical-page phase and checks full exact plaintext recovery and invariant equality statistics. This avoids confusing an original-data exclusion with an implementation bug.

## Authentic historical cipher-F gate on the frozen period14 stream

The solved LP1/p56 rule allows original plaintext F to emit ciphertext F without consuming the additive key; ciphertext F can independently result from normal encryption of a different plaintext letter. A necessary-condition dynamic program maintains **all** possible exact key-consuming positions and rejects decoded plaintext F unless the bypass was taken. With source-defined F₀=0 at the beginning of *each page* and either additive sign, the earliest impossible local rune offsets are:

| Page | Sign −1 | Sign +1 |
| --- | ---: | ---: |
| p16 | 16 | 156 |
| p17 | 44 | 126 |
| p18 | 10 | 38 |
| p19 | 60 | 18 |
| p20 | 15 | 2 |
| p21 | 2 | 38 |
| p22 | 23 | feasible |

Thus six of seven pages are impossible for **both** signs, even with every plaintext-F bypass mask and arbitrary page resets, under this single fixed period14 key and authentic F rule. The p22 sign+ feasibility is a necessary condition only, not recovered readable text. Continuous p16–22 running-key variants already fail on p16 itself. This result does not exclude F-bypass under other source-selected keystreams.

## Decision

The straightforward idea “p15's original Fibonacci spiral starts a **period14 GP29 monoalphabetic running substitution** on the following pages” does not decrypt original pp16–22. Even wholly unknown secret full alphabet bijections per phase are incompatible with every pinned source-native English control under both specified rune clocks. The *specific* authentic F-bypass, unmodified Fibonacci-key consumer has no valid original-cipher inverse on six pages. No source selects these consumers uniquely, and no unknown plaintext was recovered.

**Retire this exact period14 positional-substitution branch.** A substantively new p15 continuation proposal must supply an independently authored operator or key-selection rule that changes symbol identity relationships or the plaintext representation. The observations do not support broad speculation about other periods, numeric source mappings or unrelated recurrence variants.

**Reproducer:** [\`sims/lp2_p15_fibonacci_pisano14_original_sft.cjs\`](../sims/lp2_p15_fibonacci_pisano14_original_sft.cjs). Inputs are existing unmodified canonical \`resources/liber-primus/lp2-corpus.json\` and three \`resources/control/\` texts. Results above were independently calculated on the original repository bytes in a connected JavaScript execution environment. No CI run was dispatched.
