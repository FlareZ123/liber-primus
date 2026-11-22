# LP2 page15 16-cell spiral as historical Emerson letter-address candidate

**Agent1, 22 November 2026. Status: new exact cross-artifact extraction; possible but unverified 16-character address. No unknown original LP2 ciphertext has been decrypted.**

## The first-party selection path and its missing step

The original LP2 **physical page 15 (32.jpg)** contains precisely sixteen decimal numerals in a 4×4 square, with **3299** highlighted red near the center. The values are known independently to follow the exact Fibonacci-indexed prime-distance construction (see [established p15 result](../results/fibonacci-prime-spiral.md)). Starting at red **3299** and moving right, down, left twice, up twice, and around the expanding square to the outside visits each cell exactly once:

`3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516`.

The **2014 Cicada Stage1 signed poem** genuinely directed solvers to Ralph Waldo Emerson's *Self-Reliance*, then used **fifteen paragraph:sentence:word:letter coordinate tuples plus one literal digit 3** to recover a 16-character Tor v2 onion label. The [originally used source workflow](../workplace/historical-solve-path-to-original-lp2.md) fixes 1-based paragraph:sentence:word:letter units, including an inserted-essay paragraph adjustment. The version of *Self-Reliance* [archived by neuroretransmit](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/self-reliance.txt), Git blob `12a6bc018047a1276e77f2b7f633d5905732fff9`, is [mirrored byte-for-byte](../resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt) for reproduction. **Independent historical positive regression:** applying all fifteen signed 2014 coordinate tuples and the signed literal `3` to this exact witness recovers the published source-stage label `auqgnxjtvdbll3pv.onion` exactly. This gives a strong external reason to preserve this particular reconstructed text edition, although no original LP2 instruction selects its absolute-letter addressing. Its first paragraph invokes **the inmost becoming the outmost**. That phrase is consistent with a red-*center* to outer-ring reading and solved LP1's within→outside motif.

**The missing author instruction is crucial:** no examined original LP2 source orders 2014's earlier book to be reused for page15, or says to replace its old paragraph:sentence:word:letter grammar with **absolute position in a punctuation-stripped letter stream**. The following is a single natural but analyst-proposed cross-round extraction, not authenticated puzzle instructions.

## Exact original-input readout

1. Keep the complete archived 2014 essay in its source order. Convert to uppercase and remove all non-ASCII A–Z; the result has **43,516 letters**. This is a letter-only coordinate stream, without selecting or skipping any particular paragraph.
2. Interpret each of the original sixteen printed decimal values as a **one-based absolute letter position** within that stream, in the fixed original red-center-to-outer-square spiral order above.
3. Concatenate the sixteen selected letters unchanged. No Caesar shift, English candidate fitting, phase search or ciphertext interaction is involved.

Exact output:

```text
VNTEACLDTHTIRONY
vnteacldthtirony.onion
```

The 16 lowercase characters are syntactically valid as a **historical Tor v2 onion hostname** (base32 `a-z2-7` and length16). Its last five letters spell the ordinary English word **IRONY**. This is a potential address *string*, not evidence that an onion service existed or that this address is related to the original p56 deep-web SHA-512 target. No exact public web match to this label was found in the targeted search as of the research date. There is no server access, response document, PGP signature, private key or authenticated transfer.

## Frozen external controls and edition sensitivity

A matched offset control was carried out in **the same archived text**, changing only the base address by a common integer shift while preserving all five outer numeric gaps and letter ordering. Of **39,001** shifts that keep the last-five positions in range, exactly **one (the natural original zero shift)** produces the exact terminal string `IRONY`. A source-independent 29,154-word frequency list, restricted to **1,077 common five-letter tokens with frequency≥10**, finds **26 of 39,001** shifted final-five outputs as common words, again including natural shift0. This conditional **0.06666%** lexical-hit fraction is a descriptive within-source sensitivity result, **not** a calibrated probability of intentional Cicada authorship: the text, normalization, center-out direction, alphabet/edition and word criterion were considered after seeing the original artifact, and other avenues could also generate accidental words.

A distinct legitimate Emerson edition, [the locally archived Project Gutenberg *Essays: First Series*](../resources/control/emerson_essays_2944.txt), is aligned to the opening “I READ the other day some verses…” passage. Its first **2,864 letter-only characters** agree with the 2014 participant witness, but the next word uses American **BEHAVIOR** rather than archived **BEHAVIOUR**, altering later positions. Repeating the **same sixteen addresses and center-out order** produces `IVEINYEHOOTIRONO`, *not* the candidate. The result is **edition-dependent**, a substantial obstacle to an originally intended address unless the earlier 2014 stage reliably fixed the exact text witness.

The full, offline, single-file [Node.js 22/CommonJS reproducer](../sims/lp2_p15_emerson_spiral16_candidate_sft.cjs) asserts the sixteen original printed positions, exact byte-for-byte archived text Git blob, both edition-specific outputs, and the frozen shifted-tail counts. Its first-party inputs are the original original JPEG and the archived 2014 essay.

## Decipherment decision

The string is **more concrete than a free-form key guess** because the original p15 numerals, marked center, previous authentic 16-character bookcode precedent, and exact 2014 source edition specify all inputs once the missing absolute-letter-address interpretation is assumed. But a recognizable five-letter suffix is too short for attribution, a legal v2-onion syntax has no identifying power by itself, and changing an ordinary edition choice destroys the readout. A quick, *unselected* GP29 Vigenère running-key interpretation of the same sixteen letters (`V→U`) on the unmodified p16 and p40 ciphertext gives near-uniform rune IoCs, roughly **0.03562** and **0.03505**, versus the native solved register near **0.06**. It supplies no plaintext and is not evidence for a running key.

**Next discriminating action:** seek an independent contemporaneous first-party 2014 letter-address instruction *specifically tying LP2's red-centered p15 spiral to the earlier exact archived Emerson witness*, or a contemporaneous capture/PGP-signed document for this full 16-character label. An authentic matched source or cryptographically recoverable downstream message would promote the address; lacking that, keep it a provisional clue and do not multiply editions, offsets, starting directions or suffix keywords to fit text. This branch must not be merged into established decryptions in `results/README.md` without such independent evidence.
