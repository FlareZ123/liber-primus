# 2016 word-index map: held-out receiver and p39 cross-page anchor

**Date:** 2026-11-26  
**Classification:** intermediate, source-constrained candidate; not a verified decryption.

## Question

Does the one-based full-message word-index map proposed for the p0 red heading have a second receiver on another page? The most useful test is not another p0 crib: it is whether a separately selected receiver produces a word pointer that agrees with a candidate on another page.

The signed 2016 message contains the instruction: “Its words are the map, their meaning is the road, and their numbers are the direction.” The complete signed text contains 43 alphabetic words, including the opening HELLO. All word positions below are one-based.

## General-English receiver search

The existing p0 work identifies 15 printed 7-rune groups with exactly one physical line break after rune 2 across the runic LP2 pages. I extended the p0 DEVOTED candidate search to all 15 receivers.

For each receiver:

1. Enumerate 4,776 distinct GP29 vectors from the repository's seven-letter English control list.
2. Test both residual-key directions, C-P and P-C, modulo 29.
3. Compute the existing H-shell fields: full key H-sum, prefix-two H-sum, ciphertext GP0 carrier, and suffix-five H-sum.
4. Test all 24 permutations of those four fields.
5. Retain only strict consecutive ascending signatures [n,n+1,n+2,n+3].
6. Read a valid signature as one-based positions in the complete 43-word signed message.

This is a bounded extension of the existing p0 method, not a new cipher claim. The reproducer preserves the exact inputs, tokenizer, receiver parser, candidate set, and search.

### Search result

Four hits across 3,438,720 candidate/order/sign combinations.

| Receiver | Candidate | Direction | Field order | Signature | 2016 words (one-based) |
|---|---|---|---|---|---|
| p0:237 | DEVOTED | C-P | full>prefix>carrier>suffix | 12,13,14,15 | IS THE WAY ITS |
| p0:237 | DEVOTEE | C-P | full>prefix>carrier>suffix | 12,13,14,15 | IS THE WAY ITS |
| p0:237 | DEVOTION | P-C | full>suffix>prefix>carrier | 0,1,2,3 | invalid: includes zero |
| **p35:110** | **TOTIENT** | **C-P** | **full>carrier>suffix>prefix** | **9,10,11,12** | **DEVOTED LIBER PRIMUS IS** |
| p35:110 | TOTIENT | P-C | suffix>carrier>prefix>full | 14,15,16,17 | WAY ITS WORDS THEIR |

The p35 TOTIENT candidate is the only hit on a page other than p0. Its C-P key fields, in their natural categories, are:

| Field | Value |
|---|---:|
| Full key H-sum | 9 |
| Prefix-two H-sum | 12 |
| Ciphertext GP0 carrier | 10 |
| Suffix-five H-sum | 11 |

Sorting these four numeric fields ascending gives [9,10,11,12], selecting the contiguous 2016 phrase DEVOTED LIBER PRIMUS IS. The p0 DEVOTED candidate has fields [12,13,14,15], already ascending in its source-visible order, and selects IS THE WAY ITS.

The 2016 phrase “their numbers are the direction” is a plausible source-level reason to sort the numeric fields. It is preferable to inventing a page-specific permutation. It is not proof that this is the intended operation.

## Independent p39 suffix anchor

The p55 geometry work derives 43 interior runes, 33 exterior runes, 76 total runes, a 24-rune first line and one incoming carry. The p55 cuneiform alignment is:

- 1033 = 43 × 24 + 1
- 3301 = 43 × 76 + 33

The p39 receiver at offset 67 is the only physical 2|5 receiver on p39. The address 67 is the sum of the p55 interior count and first-line length:

    43 + 24 = 67

This is a source-constrained locator hypothesis, not an explicit instruction in the manuscript. The receiver's original ciphertext is:

    p39 offset 67: [26,3,22,1,21,4,6]
    prefix two:   [26,3]
    suffix five:  [22,1,21,4,6]

Apply the same H-shell scalar to the five-rune suffix:

    shell([22,1,21,4,6]) = [16,28,26,5,21]
    Hsum = 9

This suffix H-sum is **unique among all 15 physical 2|5 receivers**. Under the complete signed 2016 message's one-based word map, index 9 is DEVOTED.

That gives an independent p39 word pointer, without choosing a plaintext for the p39 seven-rune group. It matches the first word of the p35 TOTIENT sequence:

- p39 suffix H-sum: 9 → DEVOTED.
- p35 TOTIENT sorted fields: 9,10,11,12 → DEVOTED LIBER PRIMUS IS.

The p39 receiver's other raw fields are full=16, prefix=23, carrier=25, suffix=9. Sorting all four yields positions [9,16,23,25] → DEVOTED WORDS THE AND. That larger sequence is not a clean sentence; the strongest p39 result is the unique suffix pointer to DEVOTED.

## Cuneiform-page context and address limits

The repeated numeral motif occurs on p33, p35, p38 and p39, all in the same visible orientation. The full-page audit finds no mirrored or rotated copies that visibly instruct a direction change; see [Cicada Notebook Session 16](https://cicadanotebook.com/sessions/16.html). Therefore the numeric field-sorting rule is motivated by the 2016 signed message, not by an assumed direction encoded in the motif.

Among those four motif pages, p35 and p39 are the only pages with a physical 2|5 receiver: p35 at offset110 and p39 at offset67. The p35 offset has a tempting arithmetic relation:

    76 + 33 + 1 = 110

but the p55 framing report already includes the incoming carry in the 33 exterior runes. The extra +1 is therefore not independently justified and may double-count the carry. Do not treat p35 offset110 as source-selected by this formula. The p35 candidate is retained because it is the unique non-p0 general-English hit and because its full H-sum agrees with the independent p39 suffix H-sum, not because this address sum has been proven.

The cuneiform/p55 structural work is in [the p55 base-43 layout report](lp2-cuneiform-base43-p55-layout.md). The four motif locations and same-orientation correction are in Session 16.

## Held-out controls and limitations

The independently recovered p35 FOUND receiver at offsets 25–29 does not confirm the same one-based residual-key projection:

- C-P projects to WAY ITS ARE THE MAP.
- P-C projects to LIBER ITS PRIMUS WAY IS.

The p38 FOUND control likewise gives DEVOTED ARE MAP MEANING IS or SEEKS THE LIBER IS THEIR, not a clean sentence. These controls caution against claiming that every recovered word obeys a universal word-index cipher.

The separate p0 DEVOTED receiver's C-P residual key [21,4,15,19,5,12,10] projects, after sorting unique valid one-based positions, to LIES EMPTY LIBER IS ITS MAP MEANING. This is a useful second check on p0, but it is on the same page and the projection depends on the proposed plaintext word.

The p0 heading comparison remains:

- EPIPHANY WORDS has a valid one-based residual-key projection: PATH THE WAY THE MAP THE ROAD THEIR NUMBERS.
- EPIPHANY SEEKS has two zero-valued residual positions, invalid under the same one-based map. Omitting those zeros leaves PATH THE WORDS THE MAP THE ROAD THEIR NUMBERS, but that is a different projection.
- The split packet's key values [6,16] select the full-message words EPIPHANY and WORDS, whose lengths 8 and 5 match the ciphertext heading's 8+5 layout.

The p39 suffix pointer and p35 TOTIENT candidate are conditional arithmetic matches; neither independently authenticates the other or gives symbol-by-symbol plaintext recovery. The exact field-rank and frozen transfer tests below constrain the proposed mechanism. The p35 candidate still depends on a candidate plaintext; the p39 suffix yields a word index, not a full p39 plaintext.

## Decision and next test

Retain p35 TOTIENT and p39 suffix-Hsum 9 as conditional candidate/pointer observations, not independently confirmed plaintext. Do not promote either to established plaintext.

The direct H-field periodic receiver and literal TOTIENT prime-clock opcode are rejected under the explicit models below. A distinct receiver needs an independent original clue specifying a reversible operation; do not widen the dictionary, add field permutations, or treat the p35 76+33+1 offset formula as established.

## Independent receiver follow-through and exact H-field ambiguity (Agent34, 26 November)

The p55 geometry gives 43+24=67, and the p39 2|5 group at offset67 is indeed the only one among the 15 source receivers at that offset. But the same geometry supports multiple address operations (for example quotient+remainder of 1033 gives 25, while divisor+quotient gives 67); no first-party instruction chooses this operation, page or H-suffix field. Raw H-field value9 occurs at p17:21 and p25:112 as their full H sums, as well as p39:67 as its suffix H sum. Its uniqueness is conditional on the preselected suffix projection; the p39 pointer was found after selecting p35's candidate, so it is not a blind prediction.

There is a stronger algebraic limitation on the p35 packet. For a length-seven residual k, Hsum(k)=2(k0+k1+k2)+k3 mod29, Hsum(prefix)=2k0, and Hsum(suffix)=2(k2+k3)+k4. The carrier is independent of the plaintext. The three residual constraints are independent linear forms; k1,k2,k5,k6 are free. In particular neither k5 nor k6 affects any field. **Exactly 29^4=707,281** residual keys reproduce the ordered TOTIENT signature [9,12,10,11], and **6×29^4=4,243,686** reproduce its sorted [9,10,11,12] signature with carrier10. This is an exact unrestricted GP29 count, not a claim that all these keys are English or that the dictionary result is wrong. The p39 suffix H sum likewise ignores its last two runes. Thus neither numeric packet supplies a complete seven-rune key.

To pursue a direct inverse, freeze the candidate TOTIENT and derive its C−P residual [6,11,26,10,26,5,12]. No phase fitting, sign search, or crib widening. Continue the same seven-key cycle after p35:116 through the independently established cuneiform body endpoint p39:119 exclusive. Also test the independently proposed p39:67 pointer as a phase-zero key using the literal signed DEVOTED [23,18,1,3,16,18,23]. A separate p39-only residual transfer uses the phase fixed by the ordinary continuous clock. The exact literal-F inverse is a finite phase DP: a ciphertext F can be held or consumed if the latter yields nonzero plaintext; non-F can only be consumed into nonzero plaintext. Every surviving witness is replayed. The signed cleartext positive plant is 175 runes including 3 F holds; the known path is retained (416 complete paths), not uniquely recovered.

| Frozen inverse | Ordinary complete interior printed group dictionary hits | Literal-F path result |
|---|---:|---|
| p35 TOTIENT residual continuous heldout (967 runes) | 12/206 | No path; p35:131, ciphertext 6 |
| p35 residual at p39:67 ordinary clock phase (52 runes) | 0/11 | No path; p39:76, ciphertext 6 |
| p39 signed DEVOTED direct key (52 runes) | 1/11 | 1 path(s); 1/11 dictionary hits, nonprose |
| p39 signed DEVOTED following group only (45 runes) | 1/10 | 1 path(s); 1/10 dictionary hits, nonprose |

The ordinary continuous transfer reencrypts all 967 runes but is nonprose; the historical F-hold variant dies after just 14 held-out ciphertext runes at p35 offset131. The p39 DEVOTED receiver has a complete replaying inverse but no readable text. This rules out the frozen direct periodic continuation, not all possible uses of the two conditional words. Do not treat the address match as independent authentication or expand the key search without a new source operation.

Reproducer: [sims/lp2_2016_totient_devoted_frozen_transfer_sft.cjs](../sims/lp2_2016_totient_devoted_frozen_transfer_sft.cjs), executed against the repository inputs in V8. Machine output: [lp2-2016-totient-devoted-frozen-transfer.json](lp2-2016-totient-devoted-frozen-transfer.json). No unknown LP2 plaintext, authentic key or destination was recovered.

### Exact all-key decision: no period-seven key in the entire field family

The rank count enables an exact inverse rather than another crib sweep. For each of the six assignments of residual field values (f,p,s) from {9,11,12}, set a=15p mod29, choose b,c freely, set d=f−2(a+b+c) and e=s−2(c+d) mod29. The first five key coordinates [a,b,c,d,e] are now fixed. The last two remain completely free. There are 6×841=5,046 such prefixes, each covering 841 complete keys, with disjoint full signatures.

An exact seven-phase mask tracks all F-transparent paths. At ciphertext x, consuming transitions rotate the phase mask after removing every assigned phase j with k[j]=x (that would yield illegal consuming plaintext F). At x=0 also retain the original mask for literal F holds. Unassigned phases allow every consuming transition, strictly relaxing the exact model. Consequently an empty mask for a five-coordinate prefix excludes every one of its 841 completions. This is stronger than guessing TOTIENT or another word.

| Original interval and clock | Five-coordinate prefixes tested | Surviving prefixes | Full keys possible |
|---|---:|---:|---:|
| p35:117→p39:119, 967 runes, phase0 | 5,046 | 0 | 0 |
| Same 967 runes, all seven starting phases | 5,046 | 0 | 0 |
| Full 1,460-rune cuneiform body, p33:99→p39:119, all seven starting phases | 5,046 | 0 | 0 |

All 4,243,686 keys are excluded in each interval; no plaintext vocabulary, OOV budget or score enters this result. Positive native p57 control: 95 real clear runes, three F holds, exact field-compatible hidden key and nonzero starting phase4; all partial-key stages retain its path.

The ordinary consuming alternative has an independent exact lexical bound. Among the 206 complete interior printed groups of the 967-rune continuation, 41 have length at least seven. Any dictionary word of matching GP29 length fixes every coordinate of a q7 additive cycle once its starting phase is specified. Check repeated residual coordinates for lengths>7, enumerate all matching words in the pinned TextBlob register, and retain only keys satisfying the same sorted field constraints. The union over these groups contains 18 keys under the continuous phase-zero clock and 117 under arbitrary independent word phases. **No key supports more than one of the 41 long groups in either model.** At least 40/41 are OOV for every key, including those absent from the union. A field-compatible ordinary positive plant recovers the planted key as a supporter of all 12 constructed native long groups. This is an exact finite-vocabulary bound, conditional on intact word membership; it does not exclude altered word lengths, arbitrary segmentation or a distinct state law.

**Decision:** retire the entire direct periodic additive interpretation of the p35 H packet, not the underlying arithmetic observation or a possible nonperiodic source-selected operation. The H fields do not provide an authentic key or operation. Further work requires an independently specified lossless receiver, not more candidate words or phase permutations.

Reproducer: [sims/lp2_2016_totient_hfield_allkey_sft.cjs](../sims/lp2_2016_totient_hfield_allkey_sft.cjs); [machine output](lp2-2016-totient-hfield-allkey.json). Executed directly against repository data in V8.


### Literal TOTIENT as an opcode: all-start prime-clock decision

Rather than treating the residual as a repeated key, consume the meaning of the conditional candidate TOTIENT as an instruction to apply the authentic solved p56 prime-minus-one cipher. Freeze the reset at p35:117 and the same p39:119 exclusive end, 967 original runes. Exhaust all zero-based starting ordinals 0–3300 and both additive signs; retain every exact historical plaintext-F hold path, without any language or word-boundary constraint.

| Direction | Initial ordinals | Complete legal inverses | Longest legal prefix (ordinal) |
|---|---:|---:|---:|
| Historical positive | 3301 | 0 | 385 (876) |
| Opposite | 3301 | 0 | 434 (1244) |

All 6,602 F-transparent variants fail. The native control exactly re-encrypts 85/85 original p56 runes at the historical origin, preserving the known F-hold path (five terminal ordinals; authentic path consumes 84 shifts).

For the ordinary all-consuming alternative, score all 6,602 sign/origin inverses with a native interpolated trigram model. Select only on the remaining 154 p35 runes; freeze across the 813-rune p36–39 continuation.

| Ordinary input | Selected origin/sign | Fit nats/rune | Frozen held-out nats/rune | Held-out exact |
|---|---|---:|---:|---|
| Original | 384/+ | -4.419560 | -5.072792 | Unknown, nonprose |
| Native WELCOME plant | 1033/+ | -2.636267 | -2.484000 | 258/258 |
| Native jpg107–167 plant | 3300/− | -2.548740 | -2.378496 | 160/160 |

Controls excluded from their own training models recover all 515/515 and 319/319 runes. Every selected inverse replays. The retrospective best original full score is -4.799074 at 590/+, also nonprose. The result rejects a direct prime-clock opcode at this conditional landing in the tested origin domain, not arbitrary totient-dependent ciphers.

[Reproducer](../sims/lp2_2016_totient_opcode_primeclock_sft.cjs) · [Raw output](lp2-2016-totient-opcode-primeclock.json). Core executed against pinned repository sources in V8; standalone wrapper not separately run. No unknown plaintext or authentic key recovered.

## Reproduction

Run:

    node sims/lp2_2016_word_index_heldout_receiver_sft.cjs

Inputs are original repository resources:

- resources/liber-primus/lp2-corpus.json
- resources/liber-primus/lp2-transcription.txt
- resources/historical/cicada2016-4gq25-outguess.asc
- resources/control/english_wordfreq_textblob.txt

Related existing work:

- im-results/lp2-p0-2016-word-index-map.md
- im-results/lp2-p0-devoted-source-state-recovery.md
- im-results/lp2-p0-devoted-adjacent-gp0-decoder.md
- im-results/lp2-p33-p35-found-road-map.md
- im-results/lp2-p35-p38-found-common-decoder-gate.md
- im-results/lp2-cuneiform-base43-p55-layout.md
