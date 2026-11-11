# Fixed reserved-repeat GP29 predecessor transport: all-symbol source gate

**Decision (11 November 2026).** An exactly reversible one-special-rune predecessor-exclusion channel is strongly incompatible with the original LP2 printed-word positions under each of four real native-GP reference registers, after granting every possible one of the 29 GP plaintext symbols as the reserved rune. There is no recovered unknown plaintext, authentic key or complete decipherment.

## Mechanism and necessary original prediction

The canonical original pp0–55 contain 12,956 GP29 ciphertext runes in 2,896 printed words, with exactly 86 adjacent equal output pairs: 23 at word starts, 19 at ends and 44 strictly interior. Line and physical-page wraps do not terminate a printed word. A candidate injective, stateful GP29 transport reserves the previous ciphertext symbol as output for a single fixed plaintext rune S; the other 28 GP plaintext symbols map bijectively to the remaining 28 outputs. The map among the 28 could depend on an arbitrary unknown key and change every position. Given the initial predecessor, all 29 outputs have unambiguous inverses. At every position after the first, equal adjacent ciphertext symbols are *exactly* plaintext S occurrences, regardless of the key. The first original output has no observable predecessor, so both an unmarked and a possible extra initial-S case are allowed.

The earlier EA-only analysis, now superseded by this consolidated report, found that the 86 events have much too many start and end locations for EA to be a plausible marker. This all-rune test evaluates the other 28 possibilities rather than treating EA as special by fiat. No original Cicada instruction selects this predecessor-exclusion transport or S; the architecture is a proposed explanation of the unusually suppressed repeat rate.

## Four original-input controls

[Executable CommonJS SFT](../sims/lp2_reserved_anyrune_repeat_original_gate.cjs) encodes solved LP1 prose, Shakespeare, Gibran and Emerson with the stored native-GP longest-match transliteration and normalizations QU→CW, V→U, K→C, Z→S. For **each** reference and **each** S, the test retains the exact 2,896 original printed-word lengths and computes analytical expected counts and SDs for S at all positions, at word starts, and at word ends if original slots were independently filled from source words of equal GP-rune length. The score is the largest absolute coordinate Z; both possible original first-rune cases are compared, and the candidate with the **smallest** maximum deviation among all 29 is reported.

| Native reference | Best S on original event vector | Rounded maximum coordinate deviation without first-rune concession |
| --- | --- | ---: |
| Solved LP1 | B | 8.5 |
| Shakespeare | P | 8.3 |
| Gibran | G | 7.7 |
| Emerson | G | 6.4 |

The executable acceptance criterion checks that the best score is **over 6** in each reference *after* the first-rune concession. Scores describe reference-conditional deviations, not universal probabilities for all possible English messages or a discovery-wide p-value.

The combined marginal native-GP counts for EA and NG would imply approximately 95 and 86 occurrences respectively in a 12,956-rune sample, closest to the original 86 events. But EA rarely occupies the final GP position of a native word, and NG never occupies the initial position in the three large controls. The original's **19 ends and 23 starts** are independent contradictions. Across all other runes, even a superficially plausible start/end mix comes with an incompatible number of total symbol occurrences.

A second source-specific exact test compares the binary presence patterns of S in every original printed word with the union of words from those four finite reference texts, using words of the identical GP length and allowing either status at the first unobservable position. The count of original words with no matching native pattern is **14 for EA**, **28 for NG**; N, S and E happen to match every finite pattern but fail the separate frequency/word-edge reference gate. The finite reference inventory is not a complete English lexicon.

## Corrected Old English source-register challenge (Agent 33, 11 November 2026)

An earlier purported Old English *Beowulf* GP29 profile silently discarded thousands of lowercase thorn/eth/ash glyphs. The [corrected full 48,012-rune / 10,885-word source](../resources/control/beowulf_oe_gp_profile_corrected.json) restores authentic `TH=2078`, `AE=560` and `EA=1036`. This changes native spellings and the strength of a potential old-language alternative to the four English controls above.

The complete corrected Old English source contains **no 14-rune word**, whereas three of the original 2,896 printed LP2 words have length14. To avoid an unjustified exclusion from this source coverage gap, **grant these three original words arbitrary plaintext** and omit them from the source-conditioned test. They contain zero repeat events. The remaining **2,893** original words retain exactly **86** repeated adjacent ciphertext glyphs: **23 starts, 19 ends**. All 29 possible special plaintext GP symbols are tested under source-word-length-matched **native word marginals** as above, allowing the unknown very first predecessor to account for an additional marked first-rune event.

The most permissive single-rune candidate is **AE**, whose expected source-conditioned event vector is **[141.0385 total, 29.3991 starts, 5.5499 ends]** versus original **[86,23,19]**, with conditional SD **[11.5769,5.3584,2.3412]**. Its best maximum coordinate deviation is still **5.74499985 SD**; the runner asserts every one of the 29 GP candidates is above 5.7. Second-best **EO** scores 7.3943. In the exact finite corrected Beowulf word inventory, **30** of the 2,893 original marker-word patterns cannot be reproduced with AE at the same GP word length, even allowing an uncertain initial bit. These source-dependent statements are descriptive conditional evidence, not mathematical proof that all possible Old English plaintexts lack those shapes.

A dedicated [source-corrected SFT](../sims/lp2_corrected_oldenglish_reserved_marker_sft.cjs) successfully round-trips **29/29** independently encoded source-native full-register controls via an explicit invertible 29-symbol predecessor-exclusion channel, and reproduces all original event counts and the AE best-case. [Exact original-input Actions run 43043853456](https://github.com/FlareZ123/liber-primus/actions/runs/43043853456) passed. The combined five-source conclusion remains that no **single fixed GP special rune** naturally explains the original word-edge repeat pattern; it does not exclude alternative languages, changing reserved symbols, or different spacing semantics.

## Fully reversible positive controls and scope

For each reference register, the SFT samples native words at every original length, encodes a synthetic 12,956-rune plaintext under every S in 0..28 through an explicit invertible 28-way permutation, and exactly recovers the full text. **116/116** independently parameterized full-length tests confirm lossless forward/inverse recovery and the repeat-marker equivalence. This establishes that the key-independent event test faithfully targets a reversible channel. Synthetic plants do not identify any historical cipher or key.

**The rejection is conditional on** direct native GP29 English-like plaintext, a single fixed special rune S throughout the unknown manuscript, a continuous observed-ciphertext predecessor across printed words, and original printed-word boundaries as plaintext word boundaries. The test does not exclude special symbols that change with a source-selected clock, multiple escape forms, altered word segmentation, non-GP intermediate text, or a separate word-reset state. The solved p56 literal F skip does not select a universal special symbol for the unsolved pages.

**Next evidence needed:** an original, dated Cicada instruction that specifies a recoverable state/clock or a reversible escape transport. Further unrestricted searches of 28-way keys cannot rescue a fixed S against this key-independent original marker invariant.
