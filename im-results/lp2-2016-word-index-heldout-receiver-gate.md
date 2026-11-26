# 2016 word-index map: held-out receiver search

**Date:** 2026-11-26  
**Classification:** intermediate, source-constrained candidate; not a decryption.

## Question

Does the one-based full-message word-index map proposed for the p0 red heading have a second receiver on a different page? In particular, does an independently selected 7-rune 2|5 receiver produce a source-word signature under the same GP29 H-shell construction?

The complete signed 2016 message is tokenized into 43 words, including its opening greeting. Indices in this report are one-based.

## Test

The existing p0 work identifies 15 printed 7-rune groups with exactly one physical line break after rune 2 across the runic LP2 pages. I extended the existing p0 DEVOTED candidate search to all 15 receivers.

For each receiver:

1. Enumerate 4,776 distinct GP29 vectors from the repository's seven-letter English control list.
2. Test both residual-key directions, C-P and P-C, modulo 29.
3. Compute the existing H-shell fields: full key H-sum, prefix-two H-sum, ciphertext GP0 carrier, and suffix-five H-sum.
4. Test all 24 permutations of those four fields.
5. Retain only strict consecutive ascending signatures [n,n+1,n+2,n+3].
6. Read a valid signature as one-based positions in the complete 43-word signed message.

This is a bounded extension of the existing p0 method, not a new cipher claim. The script preserves the exact inputs, tokenizer, receiver parser, candidate set, and search.

## Result

Four hits across 3,438,720 candidate/order/sign combinations.

| Receiver | Candidate | Direction | Field order | Signature | 2016 words (one-based) |
|---|---|---|---|---|---|
| p0:237 | DEVOTED | C-P | full>prefix>carrier>suffix | 12,13,14,15 | IS THE WAY ITS |
| p0:237 | DEVOTEE | C-P | full>prefix>carrier>suffix | 12,13,14,15 | IS THE WAY ITS |
| p0:237 | DEVOTION | P-C | full>suffix>prefix>carrier | 0,1,2,3 | invalid: includes zero |
| **p35:110** | **TOTIENT** | **C-P** | **full>carrier>suffix>prefix** | **9,10,11,12** | **DEVOTED LIBER PRIMUS IS** |
| p35:110 | TOTIENT | P-C | suffix>carrier>prefix>full | 14,15,16,17 | WAY ITS WORDS THEIR |

The p35 TOTIENT candidate is the only hit on a page other than p0. Its C-P signature selects the contiguous one-based 2016 phrase DEVOTED LIBER PRIMUS IS. The hit is unique among the 4,776 GP-tokenized seven-letter control vectors for that search.

This is a genuine second-receiver candidate, but not yet independent proof of the mechanism:

- p35 itself has independent page selection: the p33 rise route lands on p35, and the p35 FOUND packet has a manuscript-wide DH-state uniqueness result (im-results/lp2-p33-p35-found-road-map.md).
- The particular p35 receiver at offset 110 is not independently selected. It is one of the 15 physical 2|5 groups.
- The field order full>carrier>suffix>prefix is one of 24 tested orders and currently lacks a source-derived selector.
- The p35 page's top sigil and line geometry have not yet been shown to select this field order before seeing TOTIENT or the 2016 output.

## Held-out controls and limitations

The independently recovered p35 FOUND receiver at offsets 25–29 does not confirm the same one-based residual-key projection:

- C-P projects to WAY ITS ARE THE MAP.
- P-C projects to LIBER ITS PRIMUS WAY IS.

The p38 FOUND control likewise gives DEVOTED ARE MAP MEANING IS or SEEKS THE LIBER IS THEIR, not a clean sentence. These controls caution against claiming that every recovered word obeys a universal word-index cipher.

The separate p0 DEVOTED receiver's C-P residual key [21,4,15,19,5,12,10] projects, after sorting unique valid one-based positions, to LIES EMPTY LIBER IS ITS MAP MEANING. This is a useful second check on p0, but it is on the same page and the projection depends on the proposed plaintext word.

The p0 heading comparison remains:

- EPIPHANY WORDS has a valid one-based residual-key projection: PATH THE WAY THE MAP THE ROAD THEIR NUMBERS.
- EPIPHANY SEEKS has two zero-valued residual positions, invalid under the same one-based map. Omitting those zeros leaves PATH THE WORDS THE MAP THE ROAD THEIR NUMBERS, but that is a different, less complete projection.
- The split packet's key values [6,16] select the full-message words EPIPHANY and WORDS, whose lengths 8 and 5 match the ciphertext heading's 8+5 layout.

None of these word-index projections establishes symbol-by-symbol plaintext recovery. In particular, the p35 TOTIENT result must not be promoted until its receiver offset and field order are selected independently of the candidate.

## Decisive next test

Inspect the original p35 header sigil and physical layout for a pre-registered reason to use full>carrier>suffix>prefix at offset 110. If no such selector exists, retire the p35 TOTIENT hit as a multiple-search candidate rather than expanding the word-list or field-order search.

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
- im-results/lp2-p33-p35-found-road-map.md
- im-results/lp2-p35-p38-found-common-decoder-gate.md
