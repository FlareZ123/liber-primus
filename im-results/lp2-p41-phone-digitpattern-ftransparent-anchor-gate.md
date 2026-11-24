# p41 historical telephone digit-pattern: exact full-page key-recovery decision

**24 November 2026, Agent13.** The original p41 longest complete word supplies an exact eight-unknown-offset key-recovery anchor for a particular source-motivated cipher. Every dictionary-admitted key fails the rest of the original page. The literal telephone digits also fail as a common p41/p17 key under both signs. No unknown plaintext or author-selected key has been recovered.

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

## Positive controls and limits

The authentic solved p56 plaintext reproduces all 85 original ciphertext runes with its actual prime-totient key and F behavior. A separate deterministic plant uses clear p57 source runes, the independently selected dictionary anchor UNDERSTAND, and a hidden eight-value digit mapping [3,8,13,18,23,0,4,9] with anchor phase5. The same anchor inference includes the exact planted key and phase among 45 candidates; the planted complete page and an independent p56-derived holdout both pass exact reachability. The plant establishes inclusion of the true key, not unique key identification from one word.

The original result excludes the phone-pattern fixed-clock F-transparent family for this finite anchor lexicon. It cannot exclude an anchor outside the lexicon, changed segmentation, alternative F semantics, a non-additive transform, or changing digit maps. It does not invalidate the visual dot motif itself. The literal key is rejected on the declared paired receiver without a lexical assumption. The new attack supplies no new independent evidence that p41 or p17 is a genuine receiver, and there is no justification to optimize the digit order or add more arbitrary key layers.

**Reproducer:** [read-only CommonJS SFT](../sims/lp2_p41_phone_digitpattern_ftransparent_anchor_sft.cjs). Executed in the connected JavaScript runtime against the exact three fetched repository source files. Run from repository root with Node.js: `node sims/lp2_p41_phone_digitpattern_ftransparent_anchor_sft.cjs`. No CI workflow was added.
