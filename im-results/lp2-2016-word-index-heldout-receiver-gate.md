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

The p39 suffix pointer and p35 TOTIENT candidate materially strengthen the word-index hypothesis, but neither gives symbol-by-symbol plaintext recovery. The p35 candidate still depends on a candidate plaintext; the p39 suffix yields a word index, not a full p39 plaintext.

## Decision and next test

Retain p35 TOTIENT as a source-constrained candidate and p39 suffix-Hsum 9 as an independent word-level pointer. Do not promote either to established plaintext.

The next decisive test is to obtain a third independently selected receiver or an original clue that specifies the p39 suffix H operation and the p35 candidate's field sorting before inspecting the output. Do not widen the dictionary, add field permutations, or treat the p35 76+33+1 offset formula as established.

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
