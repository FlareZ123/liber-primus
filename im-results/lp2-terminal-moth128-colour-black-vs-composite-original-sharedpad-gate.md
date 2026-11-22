# Original terminal moth illustration: complete 128/128 two-time-pad test across p53/p54/p55

**Agent27, 22 November 2026. Classification:** original-input, finite-GP-English conditional negative. No recovered unknown LP2 plaintext, creator key, authenticated cipher or final destination.

## Human-visible source selector and independently fixed registers

Original physical p53 (`70.jpg`) has **128 black runes** followed by **51 red runes**, a source-visible complete printed-word boundary. The intervening physical p54 (`71.jpg`) begins with one uniquely enlarged red `ᚪ` (GP index24). Terminal p55 (`72.jpg`) has **76 runes** and reproduces essentially the same moth drawing as p53. This makes an exact, simple, source-selected partition: `p53 black0..127 (128)` opposite `p53 red128..178 (51) || p54 enlarged first-A (1) || p55 complete0..75 (76)` = **128**. The 128/128 symmetry and p53/p55 repeated artwork are direct original observations, although the extra step of identifying a shared cipher pad is speculative and not a first-party opcode.

The original `resources/liber-primus/lp2-ink-annotations.json` fixes the red span `[128,179)`. Canonical rune values are read from `resources/liber-primus/lp2-corpus.json`, while `resources/lp2-transcription.txt` supplies all printed complete-word boundaries. The black p53 runes0..4 continue p52's terminal word, and are unconstrained in this test. The middle inserted p54 enlarged A at composite rune51 and p55 first NG continuation at composite rune52 are also unconstrained as independent full English words. Remaining **27 black complete printed words**, **28 composite complete words**, and **48 pairs of overlapping complete words** are the entire locked search grammar. None is omitted or rephased after observing language results.

## Key-independent inversion and exact original obstructions

Test one full 128-symbol shared arbitrary GP29 additive pad `K[t]` between the two original source tracks. It need not be generated or guessed: `Cblack[t]−Ccomposite[t] ≡ Pblack[t]−Pcomposite[t] (mod29)`. For every pair of overlapping COMPLETE printed words, exhaust all source-native dictionary GP words of their original lengths. If no two full words have the exact observed rune differences in even one shared interval, the shared-pad hypothesis is impossible within that dictionary independent of any 128-rune key, beam or language-model ranking.

The finite lexicon contains **29,063 unique GP word types** from pinned TextBlob wordfreq and all **181 reconstructed complete original solved-LP1 GP words**, with Cicada source-native `ING` and `IO` rune ligatures. Exactly **three** of 48 original intersections lack a compatible full-word pair:

| Composite positions (0-based, end exclusive) | Black complete-word rune length | Composite complete-word rune length | Unsupported comparison width |
|---|---:|---:|---:|
| **75..83** | 10 | 13 | **9** |
| **88..93** | 9 | 6 | **6** |
| **107..112** | 7 | 7 | **6** |

These three local contradictions are exact for this input word inventory, since no search-state cutoff was used and all source spellings of the specified lengths were available to each word intersection. No key or other source input was fitted.

## Matching positive and negative controls

At exactly the original 27/28 whole-word lengths and boundary coordinates, build two independent authentic GP29 dictionary-text streams with source-word-compliant free fragments, encrypt with one **arbitrary 128-symbol pad shared between both** and independently verify all 48 intersections. **12 of 12** complete planted pairs pass. Replace the second stream's pad by an independent random pad, preserving exactly the same ciphertext shapes; **12 of 12** negative controls are rejected, with at least one incompatible overlap. The original complete-runic inputs are strictly asserted against the independent transcription, and no source rune/word boundary is edited.

**Source-exact Windows Node22 PASS:** [run 44981546688](https://github.com/FlareZ123/liber-primus/actions/runs/44981546688), confirming exact script path and the reported unsupported overlaps plus 12+12 controls. Read-only CommonJS reproducer: [`sims/lp2_p53_128black_51red_1ac_76moth_sharedpad_sft.cjs`](../sims/lp2_p53_128black_51red_1ac_76moth_sharedpad_sft.cjs).

## Decision and restriction

**Retire only the original-colour/artwork-selected 128/128 shared additive GP29 pad with one consumed keystream symbol per rune and both source-original word tapes.** The pairing is materially different from the already tested p53 red51 as a 128-black donor, and from directly comparing p53 first/last76 against p55 76. It supplies a new impossible 9-rune source overlap with no secret fitted key. It does not exclude XOR, other nonadditive feedback, a non-English text, new letters or alternate punctuation, an independent key for each half, or the possibility that the visually repeated moth is simply decoration. A new operation should require an independent authored clue, rather than searching new offsets in this same gap.
