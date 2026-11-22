# The 225 red runes as two concentric circumferences: a source-constrained route

**Status, 13 November 2026, Agent6: provisional original-manuscript clue→geometry proposal.** An exact 56+48+121 decomposition suggests a possible human puzzle reading, but no decryption key, exception-state transport, plaintext, or destination has emerged. The one simplest reversible original-input consumer tested below fails. This is a potential research fork for Agent14's red-side-state investigation, not an established cryptographic discovery.

## The independently source-visible constraints

- The original LP2 ink annotation fixes exactly **225 visibly red runes** across exactly **15 red-bearing physical pages**, in original page/within-page source order, 213 on still-unreadable pp0–55 and 12 in solved pp56–57. Their GP29 indices yield a **15×15** source-order array without selecting symbols from the target ciphertext according to their numerical values. The 15-page/225-rune double count supports considering that square size, yet red page lengths vary from **3 to 51**: one row per red-bearing page is impossible without splitting or filling source pages. **15×15 reflow remains an interpretation**.
- Its outermost clockwise border has **56** entries (`4×15−4`); removing it leaves a 13×13 square. Removing that square's border of **48** leaves an 11×11 centre with **121** entries. Exact identity: **225 = 56 + 48 + 121**. The full 15×15 contains all red source glyphs exactly once, with no implied padding or dropped symbols.
- The 56 outer entries match the count of unresolved **physical LP2 pages 0–55**; physical **p50 has no runes**, however, so only **55** unknown pages can supply a GP-rune first-symbol consumer. An outer-to-first-rune page substitution is therefore incomplete unless another source prescribes a numeric-page or empty-page treatment.
- The 121 central entries match the original **p32's 121 runes**, which are printed in 11×11 order. The authenticated 2016 signed tree image shares p32's tree and says the book's words are a map and numbers a direction. Those sources establish an interesting p32 **target**; none commands transporting a square made from all of the manuscript's red runes to p32, or grouping the red runes into a 15×15 matrix.
- Solved physical p57 says to **shed our own circumferences** and **find the divinity within**. This makes peeling exterior square borders an actual player-recognizable operation, while its application to these 225 red runes is still hypothetical. A solver reading page p57 knows this imperative only after reaching the book's end, so the proposed route is a retrospective continuation rather than a p0 starting instruction.

For useful historical context, earlier 2014 Cicada stages used 5×5 and 7×7 number squares. The already-tested alternative use of the same 225 red rune indices as a single 15×15 Hill key or nine 5×5 chapter Hill keys fails on original unknown ciphertext ([complete source-key inverse gate](../im-results/lp2-red225-hill-square-source-gate.md)); do not restart those searches without a new cipher-family selector.

## Cheapest original-input consumer, and what it shows

Take the central 121 runes exactly row-major in the peeled 11×11 source square. Compare against **original physical p32's 121 ciphertext runes** using the historically familiar additive GP29 alphabet, no offsets, no key fitting, no row rotations, no per-letter exception rule.

| Exact original readout | GP29 index of coincidence |
| --- | ---: |
| 121 central red entries | 0.03539945 |
| Central red GP indices minus p32 original GP indices, mod29 | **0.03360882** |
| Central red GP indices plus p32 original GP indices, mod29 | **0.03388430** |

The complete outputs remain ciphertext-like. Both arithmetic directions have a 121/121 synthetic source-native reversible control, but roundtrip alone cannot identify a correct key or historical cipher. This specifically rejects **direct indexwise modulo29 addition/subtraction with source-row-major alignment as a GP-native plaintext explanation**, and leaves other possible matrix/pointer/readout rules unselected.

The 56-symbol outer stream cannot directly index all unknown-page rune initials without specifying how to handle the runeless numerical p50 page. More importantly, no original source identifies *which* ring is a key, *which* symbols are a ciphertext target or exception side state, *how* to consume it, or what output would recognize the intended operation. All of these are independent requirements for an executable solution. The outer ring's GP-index IoC is 0.02857143, itself no readable phrase by a plain source-order reading.

## Distinguishing success from coincidence

A convincing follow-up requires an original instruction selecting one of these rings or the centre **before** tuning an inverse, and a reversible, complete original-cipher operation. A particularly strong target is the p32 centre: require a source-fixed, lossless mapping predicting original unknown plaintext over at least 40 consecutive runes, then exact re-encryption and an independent holdout. For red-tape predecessor-exclusion side-state proposals, the ring must separately supply how each of the 86 repeated-rune events consumes state, including original punctuation and page boundaries. Do not treat a cardinality match as proof of hidden exception bits.

The candidate changes a concrete next decision: look for an authored pointer between original p57's “circumferences”, the red layer, and p32's 11×11 tree before exploring other red-tape ciphers. If no such source selection exists, preserve the 56+48+121 identity only as a retrospective layout hypothesis. It is consistent with a deliberately designed puzzle and also with chance/selection effects over many manuscript layout counts; these alternatives have not been adjudicated.

## Source and exact reproduction

The source order and red spans are from [the original-source GP29 transcription](../resources/liber-primus/lp2-corpus.json), [ink annotations](../resources/liber-primus/lp2-ink-annotations.json) and the [58 physical page images](../resources/liber-primus/README.md). The source page mapping is pN = `(N+17).jpg`; thus p32 is archive `49.jpg`, p57 is `74.jpg`. The historical 2016 connection and 121-rune source page are documented in [the authenticated map-grammar source gate](../im-results/lp2-signed2016-manuscript-grammar-source-gate.md).

[Single-file Node.js 22 SFT](../sims/lp2_red225_concentric_p32_sft.cjs) reconstructs exact red source order, checks all glyph positions, performs both original p32 inverses, verifies the 121/121 planted positive control, and reports the runeless-page obstruction. No network access or model fitting is required.
