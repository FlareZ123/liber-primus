# LP2 opening 27×27: exact 128-bit direct-radix29 packet gate

**16 November 2026, Agent34. Experimental intermediate result:** the original 729-rune opening chapter **cannot** be a direct fixed-width GP29 serialization of 27 consecutive 128-bit cipher blocks, irrespective of secret AES key, mode, IV **or any single fixed secret bijection of all 29 rune values**. No unknown LP2 plaintext, key or destination was recovered. [One-file original-source positive-controlled SFT](../sims/lp2_p0_27square_128bit_radix29_sft.cjs) verified on original inputs in [Windows Node22 Actions run 43805921969](https://github.com/FlareZ123/liber-primus/actions/runs/43805921969) (PASS; actual AES-256-CTR plant roundtrips).

## Source-selected input and reversible test

Physical LP2 p0–p2 contain exactly **262+266+201=729=27×27** source GP29 runes. A conventional 16-byte encrypted block can be represented losslessly by exactly **27 radix29 digits**, since 29^26 is below 2^128 and 29^27 is above it. This suggests a concrete, finite 27-block packet hypothesis before any AES key search. It is only a candidate format: the source does not actually name AES or prescribe a 27×27 block readout.

Freeze source-order canonical GP indices 0..28. For each original 27-digit row, interpret the digits as an unsigned most-significant-first integer in base29. **Necessarily each integer must be below 2^128** for a direct representation of a 128-bit AES block. The secret cipher key, chaining mode, compressed plaintext and IV cannot alter this numeric range requirement after the ciphertext is fixed. For one layout sensitivity, read the 27 original columns instead. For one reading-direction sensitivity, reverse the full original rune stream and group it into consecutive rows. The input preserves the actual 27 first-rune identities under every fixed alphabet relabeling; no secret permutation is fitted.

## All-secret alphabet obstruction: 18 distinct leading glyphs versus four available digits

The first base29 digit of a 27-digit 128-bit integer is bounded by

```text
floor((2^128 - 1) / 29^26) = 3
```

**Every valid 128-bit block must begin with one of exactly four digit values: 0, 1, 2, or 3.** Suppose the actual runes secretly represent those digits under *any one fixed permutation of the 29-symbol alphabet*, unknown to the analyst. Then **all 27 source block-opening glyphs must belong to at most four distinct rune identities**. Equality and difference of printed glyphs survive all 29! possible secret symbol bijections.

The original source instead has **18 distinct first-rune identities among the 27 proposed source-order blocks**. In the column interpretation there are also **18**; in whole-stream reversed source-order blocks there are **17**. A complete **all-27-phase** enumeration further allows any possible offset of the 27-symbol packet clock, preserving all 729 source runes by cyclic wrap. Original source-order phases have **14–20 distinct opening glyphs**; original column-order phases have **14–23**; reversed source-order phases have **14–20**. Every phase in all three layouts exceeds the absolute capacity of **four** possible leading symbols. Therefore **no fixed secret GP29 digit alphabet exists** that could encode all original 27 blocks as 128-bit integers at **any global 27-rune phase** in these three layouts. This exact counting certificate does not depend on an encryption key, the contents of the blocks, their language, or the meaning of the symbol names. It is strictly stronger than the numeric range test with the public alphabet below.

**Two auxiliary bits cannot rescue the direct format.** More generously, permit an arbitrary complete binary packet of **130 bits**, so the supposed 128-bit payload gains **two additional unconstrained flag bits** (a factor of four). Then the maximum first base29 digit increases to `floor((2^130-1)/29^26)=12`, granting **thirteen possible initial rune identities** under an arbitrary secret 29-symbol bijection. The source's **smallest** leading-glyph diversity over all 81 frozen layout/phase choices is still **fourteen**. Thus **every direct 27-rune fixed-width packet of up to 130 bits is excluded**, including raw 128-bit blocks plus one or two metadata bits, under the fixed alphabet/phase assumptions. At 131 bits the leading-digit capacity rises to 26. A constructive counterexample assigns all **18 distinct original row-leading glyphs** to secret digit values 0–17, and maps the other eleven glyphs bijectively to 18–28. Under **this one globally fixed secret alphabet**, all 27 original rows then represent valid 131-bit numbers. The SFT checks the exact source mapping and all 27 numeric bounds. This is a *range-feasible serialization*, not a recovered key, readable plaintext or proof of intended format. The 130-bit exclusion is therefore sharp with respect to direct leading-glyph diversity and cannot be generalized to 131-bit or variable-width binary packing.

The SFT checks all 81 source-leading-glyph counts (27 clock phases × 3 layouts) and the exact integer bound. A separately planted genuine 432-byte AES-256-CTR binary stream passes the 27-digit block format, and a **nontrivial secret 29-symbol permutation of all 729 planted digits** preserves the four-or-fewer-leading-symbol invariant; applying its inverse recovers every planted digit and the original AES plaintext.

## Full-book all-secret 131-bit packet obstruction

The first 729 source runes offer a local 131-bit loophole only when one freely chooses a secret alphabet, as constructed above. A *single whole-manuscript* 27-rune block serialization has an additional absolute constraint. For a 131-bit binary packet, `floor((2^131-1)/29^26)=25`, so the leading GP29 digit may take at most **26 different values**. A fixed unknown permutation of the 29 printed rune identities preserves how many distinct first symbols are present.

The complete **12,956 original encrypted runes** (p0–55) yield **478 or 479 full 27-rune packets**, depending on the phase, with a trailing fragment shorter than 27 runes, under each of all **27 source-ordered possible packet phases**. **Every phase's 478–479 actual packet leaders include all 29 GP glyph identities**, an exact original-source census. Because 29 exceeds 26, **no one fixed alphabet permutation can encode the whole encrypted book as consecutive 131-bit or smaller binary packets with a global 27-rune clock**, regardless of its encryption algorithm, key, initialization vector or packet contents. The same is true if initial physical reading is globally reversed, since the reversed phase classes are the original residue classes in another order. The SFT asserts 29 distinct leaders across all 27 clocks on the untouched source, alongside the original p0–2 capacity theorem.

This global exclusion does **not** cover an independently refreshed symbol codebook per chapter/page, changing-state encoding, a 132-bit output space, irregular padding/framing, or 27-rune framing that resets at an author-marked boundary. The first-chapter 130-bit result remains an independent local obstruction to a chapter-specific direct AES128-plus-two-flag packet scheme.

## Observed original-block capacity

| Frozen 27×27 reading | Rows smaller than 2^128 | Valid zero-based rows |
| --- | ---: | --- |
| Source order, 27 consecutive rows | **5/27** | 7, 10, 13, 18, 24 |
| Fixed 27 columns of the same square | **4/27** | 7, 13, 17, 22 |
| Entire source reversed, then 27 rows | **2/27** | 10, 18 |

For source-order rows **22/27 original blocks exceed the maximum possible 128-bit value**, including the very first row, whose value is `0x4bb9e6ce689ca922dc39ba080ab4b57d3`. Such a row cannot be a directly serialized 16-byte AES output for *any* key. Under uniform random 27-digit GP29 strings only **0.1114534462** of rows should fit 128 bits, so the observed 5/27 source-order rows offer no supportive format anomaly.

The [CommonJS SFT](../sims/lp2_p0_27square_128bit_radix29_sft.cjs) reads untouched canonical original p0–p2 indices and the original p49–51 256-byte transcription. A positive control uses the table's first 32 bytes as a **synthetic test key** and a zero test IV to generate an actual 432-byte AES-256-CTR ciphertext. Each of its 27 genuine 16-byte cipher blocks is encoded into a fixed-width 27-digit GP29 row and recovered exactly, then AES-decrypted to the original 432-byte synthetic plaintext. Thus the source failure is specific to the original numeric data under this encoding, with a real working cipher transport control. The SFT also asserts the stronger all-phase 130-bit symbolic leading-diversity obstruction.

**Decision:** retire key-guessing or AES mode-swapping **within the exact 27-symbol/radix29/128-bit block format under any globally fixed packet phase and any one shared alphabet permutation for all 27 blocks**. Altered digit serialization, a different block length, a changing per-block alphabet, stateful predecessor-exclusion transport, explicit escape markers, changing geometry and a source-selected key may remain possible. In particular, the source's adjacent-equal glyph exceptions prevent silently treating all 729 runes as one uninterrupted base28 successor sequence without an additional rule. This experiment gives **no LP2 plaintext** and does not exclude AES outside the tested packet format.
