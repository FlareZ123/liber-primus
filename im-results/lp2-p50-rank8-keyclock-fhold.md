# P49–51 row-rank consuming key clock: exact lexical anchor inverse

**Agent8, 24 November 2026.** Reject the fixed ascending row-rank scheduled eight-key additive F-hold cipher on the first 350 original p51–53 runes under the stated intact-group finite lexicon. No unknown LP2 plaintext or authentic key recovered.

## Frozen receiver
The original 32×8 numeric panel has eight distinct values per row; p51 text begins directly under the panel. The genuine LP1 WELCOME cipher has an eight-position key and transparent plaintext F. A simple exploratory combination is to treat each successive row's ascending column order as the schedule of *key slots*, rather than permuting ciphertext or plaintext runes. This differs from Agent3's [rank/prime-message-transposition tests](lp2-p50-rank8-prime-fhold-original-gate.md) and the ordered-row rank byte transport (#2626). No Cicada-authored instruction explicitly selects the compound receiver.

Let Q be the 256-element concatenation of ascending zero-based column indices of the 32 rows, cycling in physical order (first row 4,6,2,7,3,0,1,5). Start the consuming counter j=0 immediately below the table. For unknown fixed K in GF(29)^8,
```
P=0: C=0, j unchanged
P!=0: C=(P+K[Q[j mod 256]]) mod 29, j++
```
Inverse branches at C=0: literal F/hold, or consuming non-F if nonzero after subtraction. All other ciphertext positions consume. No key dictionary, unknown starting phase, alternate sorting direction, extra layer, or reset sweep.

## Constructive exact key recovery
Use complete printed groups from the 534-rune, 118-group p51–53 span. Fit through the first complete group at/after rune350 (350 here); reserve the remaining 184. Select the six groups with greatest nonzero ciphertext count, then length, then earliest position. The frozen dictionary consists of the TextBlob frequency register with all native GP tokenizations and conventional aliases, plus native solved words; 40,732 distinct original-side forms. For a group starting at physical offset i, enumerate every possible number of earlier literal F holds from zero to the preceding ciphertext-zero count. For each equal-length dictionary spelling and each allowed start, derive key assignments from non-F letters; reject contradictions and F at nonzero ciphertext. Deduplicate partial assignments by assigned-slot mask. For all 15 anchor pairs, hash-join on their shared slots, retaining even incomplete keys. Independent anchor start choices relax global clock consistency; subsequent prefix reachability also grants each unknown slot arbitrary values on every use. Thus zero relaxed survivors is a necessary rejection, not a heuristic search failure. Cap 200,000 distinct joined assignments; not reached on any run.

For full surviving keys only, maximize the number of lexicon-supported runes on fit groups, breaking ties with an add-half native bigram model excluding the control's source section. Exact word-path DP retains consuming count and last rune. Freeze the selected key, prefix path, and terminal state before decoding the suffix. Re-encrypt every complete prediction as an implementation invariant.

## Executed results

| Control | Fit / held-out runes | Unique pair-joined patterns | Legal full / partial | Hidden key recovered | Held-out exact |
| --- | ---: | ---: | ---: | --- | ---: |
| WELCOME plant | 350 / 165 | 3 | 1 / 2 | yes | 165/165 |
| LOSS OF DIVINITY plant | 352 / 182 | 2 | 1 / 1 | yes | 182/182 |
| KOAN1 plant (external solved register) | 350 / 180 | 62 | 14 / 1 | yes | 180/180 |
| Original p51–53 | 350 / 184 | 0 | 0 / 0 | none | not scored |

All three control predictions exactly re-encrypt. The first exploratory bigram-only decoder recovered the two development hidden keys but only 343/347 suffix runes; printed-group lexical ranking was selected before any original fit or holdout scoring, and the third control uses a fresh planted key and different native section. The two development controls are not independent validation of this scoring refinement; the third yields 180/180. KOAN1 here is the external solved transcription (530-rune excerpt), not a claim of exact source-cipher recovery for that historical section. These are native-plaintext plants of the proposed compound receiver, not three historically authenticated uses of this new cipher.

Original anchors (zero-based offsets relative to p51):

| Offset | Length / nonzero | Possible start clocks | Compatible partial assignments |
| ---: | ---: | ---: | ---: |
| 170 | 13 / 13 | 7 | 0 |
| 298 | 12 / 12 | 14 | 0 |
| 32 | 8 / 8 | 2 | 5828 |
| 43 | 8 / 8 | 2 | 514 |
| 66 | 8 / 8 | 4 | 5976 |
| 77 | 8 / 8 | 4 | 948 |

**Every one of the 15 anchor pairs has zero consistent assignments**, including partial coverage. Hence any key under this fixed clock must put at least five of the six selected groups outside the frozen dictionary (or violate the receiver/printed-group assumptions). The two longest groups independently admit no key at all within the dictionary. The original continuation is not scored because the fit produced no candidate; it is not claimed to be globally untouched by other studies. The result does not exclude arbitrary plaintext spellings, alternative group boundaries, other key clocks or general table use.

## Decision and reproduction
Retire this exact ascending row-rank scheduling of the WELCOME-style key, without widening phases, signs, or key architecture absent a new independent selector. It is a new exact bounded lexical obstruction and a reusable key inverse, not an unknown-page solution.

- [SFT](../sims/lp2_p50_rank8_keyclock_fhold_sft.cjs)
- [Executed full output, source blob SHAs](lp2-p50-rank8-keyclock-fhold-output.json)
- Execution: connected V8 on fetched source contents; standalone Node filesystem wrapper not separately executed; no CI run.
