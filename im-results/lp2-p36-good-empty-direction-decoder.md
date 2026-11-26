# p36 GOOD: page-selected EMPTY-center local inverse

**Classification: strong provisional local inverse on a source-selected page; page-local word ordinal remains a separate, unproven convention. This is not a confirmed canonical double-index receiver.**

## 1. Receiver and exact inverse

The p36 page-local group37 at rune offsets169..173 is:

    [2,22,4,1,20]

The center rune is q=4, the signed-source word EMPTY at zero-based index4. Remove that center, leaving:

    [2,22,1,20]

The candidate direction-number key is:

    [25,19,27,26]

Subtracting modulo29 gives:

    [2,22,1,20] - [25,19,27,26] = [6,3,3,23] = GOOD

Forward addition reconstructs the four retained runes exactly. The source key typing recorded in the SFT is [p+K,B,-K,p+e]; its values are source-derived, but the slot interpretation remains a hypothesis.

## 2. Source selection and page-boundary distinction

The signed 2016 message has GOOD at zero-based word index36, selecting physical page p36 under the source-index/page rule. The p36 page contains the local inverse above.

Two different word-number conventions must not be conflated:

| Convention | Receiver position | Runes |
|---|---|---|
| Page-local reset at the physical page | group37, offsets169..173 | five runes [2,22,4,1,20] |
| Whole-manuscript complete-word parser, carrying the p35/p36 boundary fragment | complete-word index35 (zero-based), offsets169..173 | the same five runes |
| Canonical double-index word selected by source index36 | complete-word index36, offsets174..179 | six runes [1,2,15,1,23,20] |

The p36 page begins with a two-rune fragment continuing from p35. A page-local parser counts that fragment as group1 and therefore calls the receiver group37. The whole-manuscript parser carries it across the page boundary and counts the same receiver as complete-word index35. Consequently, the source index36 securely selects the page, but the claim that it selects this exact group37 under the canonical double-index convention is not established. The canonical index36 receiver is a different six-rune word.

This distinction does not invalidate the local inverse. It does limit the source-selection claim: classify this as a page-selected local candidate, not a confirmed word-level double-index hit.

## 3. Fixed-key and family controls

The page-local SFT counts 318 five-rune page-local groups, of which nine have center q=4. The narrow family tests 24 permutations of the four source key atoms and both additive directions:

    318 * 24 * 2 = 15,264 outputs

It has one authenticated four-rune hit: p36 group37, center4, decrypting to GOOD. The q-centered subset has 9*24*2=432 outputs and the same single hit.

The broader source-atom family uses all four-element subsets and permutations of {0,19,25,26,27,28}, with both signs. It produces:

    15 subsets * 24 orders * 2 signs * 318 groups = 228,960 outputs

There are three authenticated-word hits: p36 GOOD, p28 WILL, and p18 LUCK. Only p36 is q-centered at 4.

### Independent complete-word control

A second parser carries possible words across physical page boundaries and retains only complete words wholly contained on one unknown page. Under that stricter census:

- 311 complete five-rune words remain;
- nine still have center4;
- the fixed key [25,19,27,26], tested against all nine signed-source four-rune targets in both directions, has exactly one hit: p36 offsets169..173 -> GOOD;
- the broad family produces 223,920 outputs and the same three hits (p36 GOOD, p28 WILL, p18 LUCK); only p36 is q-centered at4.

The receiver therefore survives the stricter complete-word control. The parser distinction changes its ordinal, not its ciphertext or inverse.

## 4. Relationship to the source-index cycle and p2

The source-only numerical cycle remains:

    GP0(FOUND) = 36 -> signed word36 GOOD
    GP0(GOOD)  = 35 -> signed word35 FOUND

The p2 candidate independently decrypts a source-selected local receiver to GOOD. Since GOOD is at signed-source index36, it points to p36; p36 contains this separate EMPTY-center local inverse to GOOD. This is page-level cross-result convergence, not proof that the p2 output selects the p36 canonical complete-word index36 receiver. The p36 page-local ordinal issue above remains open.

The p35 FOUND candidate and source-only cycle are documented in im-results/lp2-p33-p35-found-road-map.md. The p2 entry point is documented in im-results/lp2-p2-good-reflection-pair-key.md.

## 5. Evidence boundary

Supported:

- exact reversible center deletion and GP29 subtraction on the original p36 receiver;
- a source-derived page selector (signed word36 GOOD -> p36);
- a unique fixed-key hit under both page-local and stricter complete-word controls;
- a source-index convergence with the FOUND35 <-> GOOD36 cycle and the p2 GOOD candidate.

Not established:

- that page-local group37, rather than the canonical complete-word index36 six-rune word, is the intended receiver;
- that the source-key slot typing is uniquely dictated by first-party instructions;
- a reusable page cipher or contiguous plaintext continuation.

The earlier p36 four-rune q-th-section1 candidate remains retracted. This center-removal candidate is distinct: it uses the complete five-rune group and deletes its EMPTY center.

## Reproduction

    node sims/lp2_p36_good_empty_direction_sft.cjs
