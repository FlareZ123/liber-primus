# p55 five-core prime-sum / BASE29 address

**Status: intermediate source-led clue, not an established decryption.** No unknown plaintext, authentic LP2 key, reversible mechanism, or destination is recovered.

## Source observations

The solved p57 text says: “Like the instar tunneling to the surface. We must shed our own circumferences. Find the divinity within and emerge.”

The canonical parser finds 16 complete page-local words on physical p55, containing 75 runes. One incoming cross-page rune brings the physical page total to 76. Removing the first and last rune of each complete word leaves exactly **43 interior runes**. This is the literal word-edge interpretation previously tested in #343.

Original-image audit:
- p55, original scan 72.jpg: terminal 13-dot mark, 3 columns × 9 rows.
- p57, original scan 74.jpg: the 13-dot mark after the red title has the same 3×9 occupancy.
- p57's terminal 23-dot mark is 5×9. Its central column has five dots; the other 18 dots surround that spine. Selecting columns 1, 3 and 5 (zero-based 0, 2, 4) reproduces the 13-dot pattern.
- The five-dot spine is source-visible and plausibly motivates “instar” (five) and “within”. However, 13-dot punctuation recurs elsewhere in LP2; p55's count is not unique.

The occupancy patterns and original-image regions are reproduced by the dot-geometry SFT below.

## Candidate human solve path

A narrow reading is:
1. “Shed our own circumferences” selects p55's 43 word-interior runes.
2. “Instar” and the shared five-dot spine select the central five.
3. “Find the divinity within” motivates the centered window, at zero-based interior offset 19.

The selected GP indices are **[21,20,15,23,27] = [NG,L,S,D,IA]**. Their GP-prime weights are **[79,73,53,89,107]**, summing to **401**.

The ordinary BASE29 representation is **401 = 13×29 + 24**, giving digits **[13,24]**, which map to GP symbols **PA**.

Exact cross-page correspondences:
- p57's red title begins with the same two GP runes, PA (PARABLE).
- p54's red span begins with GP index 24.
- p55 has a 13-dot terminal mark; p57 also has a 13-dot mark immediately after its title. The 13-dot class is common, so this is supporting rather than unique evidence.
- 401 is the **79th prime**. The p55 and p56 word-interior streams contain 43 and 36 runes; 43 + 36 = 79.

A weaker possible reading of [13,24] against the 43 alphabetic words of the signed 2016 message gives “the” and “road” at one-based positions 13 and 24 if the opening “Hello.” is counted and numeric-only tokens / PGP metadata are excluded. Excluding the greeting shifts those positions to “way” and “and”; this tokenizer-sensitive echo is not evidence for a cipher.

## Source-local two-rune bracket around the central five

The original strict word-interior stream on p55 contains **PH | NG L S D IA | PH** at interior positions 17–25 (zero-based). The central five remain the previously established 401 → BASE29 PA candidate. The two flanking PH pairs are exact ciphertext, requiring no substitution. The left pair lies in complete p55 word 7; the right P and H span words 8 and 9 after edges are shed. Therefore the bracket becomes adjacent only upon the source-motivated stripping and concatenation. Across all 55 page-local strict-interior streams, exactly **eight** nine-rune windows have identical two-rune flanks (on pp4, 5, 6, 11, 13, 16, 45, 55), only p55 has the central sum 401, and only p55 has the symmetry at its exact centered five.

**Fixed-condition exact null.** If we independently shuffle each page's original interior rune multiset and require *both* centered-five GP-prime sum 401 and identical preceding/following two-rune pairs, the p55 favorable-count fraction is **1,778,768 / 1,705,300,112,880 = 0.00000104308208659**. Over all 55 source pages, independent per-page shuffles give the familywise probability **0.00011390651599441 (0.01139065%)**. The older PA-only any-page chance is 0.10089568. The computation removes four flank symbols from the five-element prime-sum subset generating function and exactly enumerates every possible repeated ordered flank; the synthetic positive [PH, five-core, PH] gives 1/378. See the [independent joint SFT](../sims/lp2_p55_centered_mirror_prime_joint_sft.cjs).

**Scope:** the two-rune bracket, target 401 and PA correspondence were selected during exploratory inspection. Consequently these probabilities are conditional diagnostics rather than valid discovery-wide evidence for author intent. No original instruction specifies two-rune flanks, an inverse or use of the 401 value as a decryption key. A direct outward GP-prime/BASE29 pair reading gives 66→THH for the first two enclosing pairs, failing to continue p57's title PARABLE. The new bracket is a bounded candidate *locator* of the already-known core, not new plaintext.

## Direct two-rune PH key test

Treat the newly observed repeated PH flanks as a literal two-rune GP29 Vigenère key. Preserve the exact 43-rune strict-interior stream and, separately, all original 76 p55 runes. Test both PH/HP orderings and both symmetric addition/subtraction signs, with unmodified rune ordering and key phase zero. These eight reversible candidates have exact ciphertext re-encoding and a 43-rune solved-p57 native-language plant as implementation controls. The interior inverses have GP29 indices of coincidence **0.02768549–0.02879291**, compared with raw p55 interior **0.03433001**; the complete-page inverses are **0.03473684–0.03719298**, compared with raw 76-rune p55 **0.03789474**. All eight remain visually nonlinguistic. Reproducer: the joint SFT above now includes this finite direct PH-key check.

This rejects only the literal repeating PH-key transfer on these two source clocks. It does not reject every nonlinear or word-conditional interpretation of the PH frame, nor does it promote the postselected PH observation to an authenticated key.

## Controls and limits

The five-rune block crosses the boundary between p55 complete words 7 and 8. The documented prime-sum convention is source-backed for word-based operations, but applying it to this five-rune cross-word block is an **extension**, not an authenticated Cicada instruction. The signed 2013 TCP challenge authenticates BASE29 as a protocol operation; it does not prescribe this prime-sum → BASE29 composition.

A permutation null preserving p55's 43 interior symbols gives **751 / 962,598 = 0.00078018** of five-symbol subsets with prime-weight sum 401 (0.0780%). Across all 55 unsolved pages, the probability that at least one page's central five sums to 401 under independent within-page shuffles is approximately **0.10089568 (10.09%)**. The p55-specific selection is essential; the p55-only figure is not a discovery-wide p-value.

The same centered-five prime-sum / BASE29 calculation on solved p56 and p57 gives **HI** and **THM**, not a generic plaintext output. A quick direct repeating-additive GP29 screen using PA or PARABLE as the key on p55's 43 interiors, both signs, does not yield readable text. These negative screens reject only those immediate repeating-key interpretations.

## Direct p57 word-address test (negative)

A fixed direct-address interpretation was tested across all 55 unsolved pages: strip each complete page-local word's first and last rune, take the central five of the resulting interior stream, sum their GP-prime weights, reduce modulo the p57 known-plaintext word count, then use the one-based remainder (with zero mapped to the final word) as an index into p57. The two source-visible alternatives are 20 words including the red title PARABLE, or 19 body words excluding it.

Neither whole-book output is readable plaintext. The 20-word sequence begins “FIND OUR OUR OWN AND FIND PARABLE FIND THE WE TUNNELING ...”; the 19-body sequence begins “MUST THE LIKE SURFACE CIRCUMFERENCES THE THE SURFACE EMERGE ...”. The p55-only result is PARABLE under the 20-word model and THE under the 19-word model, but those isolated hits do not generalize. The exact sequences are emitted by the arithmetic SFT. This is a direct word-address test, not Agent35's distinct p57 internal word-map graph-walk hypothesis; do not conflate them.

## Separate black branch-tip circles and the 2013 SSSS analogy

Agent50's inspection of the original p57 illustration found two discrete clusters of five circles at the upper ends of the tree branches. They are separate from the red punctuation: the left cluster has three filled and two hollow circles; the right cluster has five filled circles. Their asymmetry and integration into the tree make them insufficient evidence for ten equivalent LP2 shares. Approximate original-image centroids and radii are recorded in [Agent50's handoff](../communications/agent21/20261111T225600Z_agent50_p57-dot-centroids.md).

The historical 2013 threshold-5-of-10 SSSS mechanism is now independently reconstructed: decimal share IDs, all seven observed shares consistent, and all 21 five-share subsets recover the same polynomial; the three missing shares had already been derived by Agent33. This verifies a real cross-round precedent, not an LP2 mapping. The natural p49 ten-row × eight-byte GF(256) carrier test returned 0/40 exact held-out predictions; that excludes only that specified carrier, not every possible SSSS encoding. No LP2 share payload or source-fixed x/y mapping is currently identified.

## Related p55 routes and non-rescue boundary

The unique p57 red 23-dot mark separately selects the central 23 of p55's 43 interiors. That stronger selector was tested with the full DATA/560.13 artifact at the p15 source-fixed byte offset 8,952,964. Workflow 43108404847 verified the full-file hash and the historical offset-12821 XOR positive control, but both frozen GP-index and GP-prime-weight 23-byte XOR candidates produced only 11/23 printable bytes and no v2 onion address. This closes that **direct central23/XOR** interpretation at the fixed offset; the five-core prime-sum result here is not a rescue of it. See the Agent14 result in [the Agent4 handoff](../communications/agent4/20261111T2206Z_agent14_56013_central23_result.md).

The raw five central p55 runes were also tested by Agent20 as a repeating GP29 Vigenère key over pages 0–54, both directions; both scored below the raw stream under independent Shakespeare and Gibran trigram models. The direct PA/PARABLE repeating-additive screens on p55's 43 interiors described above are likewise unreadable. These close the immediate direct-key readings, not the prime-sum/BASE29 block interpretation.

The historical 2013 threshold-5-of-10 SSSS mechanism is now independently reconstructed (decimal share IDs; seven observed shares consistent; all 21 five-share subsets recover the same polynomial; three missing shares previously derived by Agent33). This verifies the cross-round precedent only. Agent50's p57 branch-tip circles are five per side but asymmetric (left 3 filled/2 hollow, right 5 filled) and distinct from red punctuation. The direct p49 ten-row × eight-byte GF(256) carrier model has 0/40 exact holdout predictions; this excludes only that specified carrier. No LP2 share payload or source-fixed x/y mapping is established.

## Decision

Retain this as a candidate **selector/checksum or human-solve-path clue**, not plaintext and not a key. Its strongest exploratory feature is the exact 401→BASE29 PA title echo accompanied by the newly discovered PH ... PH framing of the same centered five. Both the word-spanning sum and postselected two-rune bracket lack an original instruction selecting a real cipher.

The next useful decision is whether an independent source clue authenticates PH-framing and supplies a reversible consumer for [13,24]/PA. Retire the direct 19/20-word p57 address variants above; do not treat PA or PARABLE as an established key, do not reopen the literal 43-word-length pad, and do not run unconstrained offsets, phases, or cipher-family sweeps.

Reproduction:
- Arithmetic and permutation SFT: ../sims/p55_five_core_prime_base29_sft.cjs
- Exact centered-flank joint SFT: ../sims/lp2_p55_centered_mirror_prime_joint_sft.cjs
- Original-image dot geometry SFT: ../sims/lp2_p55_p57_red_dot_core_sft.py
- Inputs: ../sims/lp2_word_pages.cjs, ../resources/lp2-transcription.txt, ../resources/liber-primus/lp2-corpus.json, ../resources/liber-primus/lp2-ink-annotations.json, original scans ../resources/liber-primus/72.jpg and ../resources/liber-primus/74.jpg, and ../resources/historical/cicada2016-4gq25-outguess.asc.
