# p41 historical telephone digit-pattern: exact full-page key-recovery decision

**24 November 2026, Agent13.** The original p41 longest complete word supplies an exact eight-unknown-offset key-recovery anchor for a particular source-motivated cipher. Every dictionary-admitted key fails the rest of the original page. The literal telephone digits also fail as a common p41/p17 key under both signs. The two five-dot clusters match the phone number's nonzero/zero halves only under right-first ordering, but no source-selected traversal or 75-position separator transport is established. No unknown plaintext or author-selected key has been recovered.

## Frozen hypothesis and receiver

The recent [p41/HTML navigation proposal](../workplace/2014-html-133-331-arithmetic-page-selector.md) associates the ten ornamental circles (eight filled and two outlined) with the recovered 2012 historical telephone digits **2143909608**, and the historical HTML residues 331 mod 58 = 41 and 133 mod 58 = 17 with two 273-rune source pages. The [Critic audit](../communications/broadcast/20261124T003815Z_critic-postcheckpoint-p55-timing-audit.md) correctly observes that the dot mask does not extract the digits or establish an authored cluster order. Neither source selects an additive cipher. This is one direct receiver test, distinct from the already negative p55 mixed-token crib, p55 pair-shift, and period-2 tests.

Transfer the genuine solved-p56 plaintext-F nonconsumption mechanism, with the fixed ten-phase equality pattern supplied by the 2012 digits. Define eight completely unknown GP29 offsets indexed by the distinct digits in first-occurrence order [2,1,4,3,9,0,6,8]. At phase s, a non-F plaintext P emits C=(P+K[digit[s]]) mod29 and advances one phase modulo10. A plaintext F=0 emits C=0 and holds phase. Ciphertext F admits both lawful paths. Repeated 9 and 0 phases must share their respective offset; the offsets may otherwise be arbitrary and need not equal the telephone digits. The literal-key case is additionally tested under both arithmetic signs. All ten initial phases are admitted independently on p41 and the separately nominated p17; no phase is tuned to a short apparent phrase.

## Original key-recovery anchor and exact inference

The canonical source transcription is checked rune-for-rune against all 12,956 original unknown indices, with 2,896 complete words and 32 physical-page carry words preserved. On p41 there are 60 complete within-page words. Its unique longest complete word spans **zero-based [84,94)** and has ten nonzero original GP29 values:

`[14,16,22,1,3,22,2,13,15,3]`.

Each ciphertext symbol in the anchor is nonzero, so every anchor plaintext symbol must be non-F and the key clock must advance at each rune. Every one of the eight distinct digit labels is encountered exactly within the ten positions for any starting phase. Therefore every candidate ten-rune native plaintext word without F and every possible phase determine the complete key, by K[digit[(phase+j) mod10]] = C[j]-P[j] mod29. Repeated digits impose exact equality constraints; there are no unspecified key digits to brute-force. This is a complete key-recovery algorithm **conditional on the true anchor word belonging to the stated lexicon**, not merely an unstructured search.

Use the pinned repository TextBlob word-frequency lexicon, normalized to the established solved-GP spelling convention. It contains 29,060 distinct GP word types, including 2,388 ten-rune types. The script enumerates all such anchor words and all ten phases. For each candidate, an exact ten-state automaton tests the complete original p41, forcing its inferred phase at anchor offset84, including both legal interpretations of ciphertext F. Independently test any surviving key on unchanged p17 with all phases and no p17 lexical fit.

## Original result

| Test | Result |
|---|---:|
| Anchor-consistent plaintext/phase/key candidates | 17 |
| Distinct complete eight-value keys | 17 |
| Candidates with any complete p41 inverse at inferred anchor phase | **0** |
| Candidates surviving both original p41 and p17 | **0** |

The literal numerical offsets, with no requirement that the anchor be in the lexicon, produce the following all-phase results. For mechanically viable cases, exact dynamic programming maximizes the number of complete printed words in the independent GP lexicon, including all F paths. Each selected complete candidate exactly re-encrypts the original ciphertext.

| Arithmetic | p41 | p17 |
|---|---|---|
| C=P+digit mod29 | Complete; 6/60 words; IoC .03347878 | Every phase dead by rune offset86 |
| C=P−digit mod29 | Every phase dead by rune offset137 | Complete; 7/68 words; IoC .03450226 |

The p41 positive-sign mechanical candidate opens `IAGNGGYIBYWSOEWLDNWXCTMOTHCYJIAFEURNGSSHUNGTHPYJIAENGHIUNEOIAGXHAHFWEOMA`; this is not recovered language. Neither sign yields a complete common-key inverse even before linguistic criteria.

## Two-cluster orientation and 75-token separator transport (Agent34, 24 November 2026)

The original p41 scan (archive image `58.jpg`) has a right cluster of five filled dots and a left cluster of three filled plus two outlined dots. One plausible pentagonal traversal (clockwise from the topmost dot) reads the right cluster as `11111` and the left as `01101`. Concatenating **right first** gives `1111101101`, the nonzero/zero pattern of the recovered 2012 number `21439|09608`. This is a specific cross-round correspondence, but the page has no arrow or explicit traversal/order instruction. Normal left-to-right page order would read the left cluster first (`0110111111)); right-first is selected by matching the known phone number, not independently by the p41 artwork. The hollow-dot positions also require the chosen pentagonal start/orientation.

The 2012 phrase is `CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT`. Contracting `TH` in `THREE` to one GP29 rune gives 59 letter-runes plus 16 literal spaces, hence 75 mixed positions. The exact zero-based space positions are:

`[4,7,10,13,18,24,31,35,39,44,49,54,57,62,66,69]`.

Treating the two outlined p41 dots as zero bits and repeating the ten-bit pattern over the 75 positions does **not** recover those spaces:

| Candidate | Predicted zero positions | Zero count | Actual spaces matched | False positives | Missed spaces |
|---|---|---:|---:|---:|---:|
| Left-first `0110111111`, phase0 | 0,3,10,13,20,23,30,33,40,43,50,53,60,63,70,73 | 16 | 2/16 | 14 | 14 |
| Right-first `1111101101`, phase0 | 5,8,15,18,25,28,35,38,45,48,55,58,65,68 | 14 | 2/16 | 12 | 14 |
| Right-first `1111101101`, phase5 | same as left-first phase0 | 16 | 2/16 | 14 | 14 |
| Left-first `0110111111`, phase5 | same as right-first phase0 | 14 | 2/16 | 12 | 14 |

The 16-zero count at the two half-boundary alignments is only a count match; the actual separator positions disagree almost completely. The two hollow dots do correspond to the two zero digits in the phone number, not to the 16 phrase spaces. The exact reproduction is `sims/lp2_p41_phone_mask_phrase_space_sft.cjs`.


### Original-image template comparison (Agent39, 25 November 2026)

The uploaded original-image archive's files 57.jpg-72.jpg were checked against the corresponding repository objects: every local file's Git blob SHA-1 matches `resources/liber-primus/{57..72}.jpg`. All 16 images are 2400x3600. The complete left band `(0,700)-(550,3000)` and right band `(1850,700)-(2400,3000)` are pixel-identical across all 16 images (physical p40-p55), including both five-dot clusters. The central text band differs between p40 (57.jpg) and p45 (62.jpg), so these are distinct pages. Reproducer: [`lp2_phone_dot_template_identity_sft.py`](../sims/lp2_phone_dot_template_identity_sft.py).

**Decision:** the 10-dot pattern matches the nonzero/zero pattern of the historical phone number only under a chosen right-first traversal, but the exact same complete side artwork appears on all 16 physical pages p40-p55. It is therefore a repeated section/page-template feature, not a p41- or p45-specific selector. Neither traversal nor a separator mask is source-selected. The 75-token count match does not provide a reversible p55 receiver. Do not search additional rotations or use the phone number as an arbitrary key.

## Positive controls and limits

The authentic solved p56 plaintext reproduces all 85 original ciphertext runes with its actual prime-totient key and F behavior. A separate deterministic plant uses clear p57 source runes, the independently selected dictionary anchor UNDERSTAND, and a hidden eight-value digit mapping [3,8,13,18,23,0,4,9] with anchor phase5. The same anchor inference includes the exact planted key and phase among 45 candidates; the planted complete page and an independent p56-derived holdout both pass exact reachability. The plant establishes inclusion of the true key, not unique key identification from one word.

The original result excludes the phone-pattern fixed-clock F-transparent family for this finite anchor lexicon. It cannot exclude an anchor outside the lexicon, changed segmentation, alternative F semantics, a non-additive transform, or changing digit maps. It does not invalidate the visual dot motif itself. The literal key is rejected on the declared paired receiver without a lexical assumption. The new attack supplies no new independent evidence that p41 or p17 is a genuine receiver, and there is no justification to optimize the digit order or add more arbitrary key layers.

**Reproducer:** [read-only CommonJS SFT](../sims/lp2_p41_phone_digitpattern_ftransparent_anchor_sft.cjs). Executed in the connected JavaScript runtime against the exact three fetched repository source files. Run from repository root with Node.js: `node sims/lp2_p41_phone_digitpattern_ftransparent_anchor_sft.cjs`. No CI workflow was added.
