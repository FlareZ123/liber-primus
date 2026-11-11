# Signed 2016 word-map terminal fold: centered END, negative p55 inverse

**Classification, Agent 27, 11 November 2026:** Provisional source-linked reading and a bounded negative original-cipher test. **No unknown Liber Primus plaintext, verified key, encryption mechanism or continuation destination was recovered.**

## Source-defined premises and hypothesized next operation

The [original signed 2016 message](../resources/historical/cicada2016-4gq25-outguess.asc) contains 43 alphabetic words, from Hello through OpenPGP. The [existing provisional base58 word-map](lp2-2016-signed-message-base58-word-map.md) takes each source word's GP prime sum S to page S mod 58 and zero-based printed word floor(S/58). Physical LP2 pages and original word boundaries are preserved; line wraps are joined. The signed message never specifies this address rule.

The original word map selects two unusually readable destinations:

- All six source tokens THE/the select physical p14 word1, literal unknown ciphertext FOLD.
- Both source tokens their select p56 word1, whose **independently solved** p56 prime-totient plaintext is END.

The new hypothesis reads the final GP rune of every one of the 43 selected source words, in original signed-message order, and adds mirrored end-rune indices modulo29. Exactly one mapped source word, **lies** (sum224), lands on the rune-free p50 numerical page. To form a complete 43-GP-symbol key, the exploratory branch treats the last Latin character D of its original cell3 token 3D as GP rune D (index23). **The central END does not depend on that substitution:** retain the 43 signed-word positions, leave the p50 slot undefined, and compute the remaining 20 of 21 mirrored pair sums. Only pair index3 is undefined; centered pair indices9–11 still give END from six original rune-bearing LP2 word destinations. A full 43-rune key does require an independent rule for the missing value.

The exact original-sourced 43 GP index terminals, printed as canonical transliteration (multiletter GP tokens count as one symbol), are:

    WDNGDRXYDMWTHODOPOIADXRAODYLRAIADIHLWJTCXYFEOWIAM

For the 21 symmetric pairs, define F_i = (E_i + E_(42-i)) mod29, i=0..20, retaining unpaired center E_21=O for a full 43-symbol symmetric expansion. The 21 pair results read:

    YNGEAGRJJEAGENDTHPWUOEIACUE

**The exact central three GP runes, positions 9–11 zero-based, are E,N,D.** Their original source-word pairs are:

| Fold rune | Original signed words | Original end-index sum |
|---|---|---|
| E | Liber + will | W(7) + J(11) = 18 |
| N | Primus + you | TH(2) + W(7) = 9 |
| D | is + and | O(3) + L(20) = 23 |

This is a readable output **from transformed ciphertext**, separate from recovering the plaintext of any unsolved page.

## Exact conditional control

Freeze the selected multiset of 43 GP end-runes, this symmetric GP29 addition, and the **particular centered END** target. Randomly permute the 43 source positions, keeping their symbol multiplicities and repeated source word structure. Of the 4,389,446,880 possible ordered selections of the six relevant endpoint slots, **148,000** yield the three specified sums. Thus the exact multiset-conditioned probability is **0.00003371723227232676**, calculated by an integer recurrence over source symbol counts rather than Monte Carlo.

A stronger table-independent control preserves the fixed missing slot and permutes only the **42 genuine rune-word ending indices**. Exactly **135,192 of 3,776,965,920** six-position ordered draws satisfy centered END, conditional probability **0.0000357938098631295**. The centered match therefore does not require guessing a GP reading of the source's numeric table.

This is **not a discovery-wide significance level**. The base58 rule, word-end extraction, fold sign, centered position and target emerged over multiple exploratory steps. The 43-word source and two older FOLD/END pointer anchors motivated the test, but an independent historical instruction does not fix every choice. The match could be an intentionally recognizable waypoint or a postselected accident.

## Native 58-page wrong-origin controls

A stronger finite control retains the same 43 authenticated source words, the same GP prime-sum word-index derivation, the original 58 physical pages and their printed word boundaries. Change **only the page origin** by a cyclic shift 0..57; leave the end-rune selector and centered symmetric sum fixed. Two definitions are checked:

1. Add shift to the full prime sum before quotient/remainder (so the word quotient increases on wrap).
2. Add shift only to the physical page residue, leaving the source word quotient unchanged.

Of 58 source-preserving phases in each model, **52** permit all six centered positions to map to genuine rune words. Under both phase conventions **only shift0** predicts END at the three central symmetric pair positions. These are exhaustive exact in-domain comparisons, not Monte Carlo. The unique source-native alignment strengthens the conditional clue relative to a random page-origin alternative. Selection of END as the observed target and of the last-rune/addition/fold conventions was exploratory, so the 1/58 rank is **not** an independently calibrated discovery p-value.

The [successful manual Node 22 CI run 43052840583](https://github.com/FlareZ123/liber-primus/actions/runs/43052840583) asserts both 58-phase controls, the table-free centered END test, both exact conditional combinatorial counts, and the original 43-unit decryption negatives.

## Direct original-cipher inverse against 43 p55 interior runes

The independently documented [p55 circumference strip](lp2-2016-p50-p55-43unit-source-selector-gate.md) yields 43 exact original ciphertext runes after word-end removal, matching the signed text's 43 terminal values. Two source keys are frozen: (1) the full 43 raw end runes; (2) a 43-symbol mirrored sum of each symmetric pair, leaving the pivot alone. These are separately tried as an additive GP29 key on the 43 original p55 interior runes, with arithmetic C−K, C+K, K−C. Each of these finite variants exactly round-trips the source ciphertext.

| Key | C−K IoC | C+K IoC | K−C IoC |
|---|---:|---:|---:|
| Raw 43 rune endings | 0.03654 | 0.04208 | 0.03654 |
| 43 symmetric sums, center retained | 0.04208 | 0.02658 | 0.04208 |

The exact C−K outputs are, respectively:

    EOTLEOMBUUIAIAYYLWGIAWMDBAEEOFUOERBLTAEGSHUSYRTHIWIAPEA
    OEEPFMLTAEJTMGEOYEOFEOSOLTHEOCYHIMBOOEEOEOGDAEOWBGPGMNG

All six variants are unreadable under the original 43-symbol segmentation. The direct source-end keys do **not** recover p55 plaintext. This excludes only these two key constructions and three arithmetic operations, leaving other source-derived transformations open.

## Direct original 43-byte p50 XOR transfer

The same 43 signed-word positions also match the **43 numeric table bytes strictly between the two occurrences of 3D=193** at global table cells 83 and127 (the existing p50 interval source selector). XOR was used in earlier Cicada puzzle stages and supplies a concrete direct bytewise inverse. Freeze the original 43 source ending GP indices, their GP prime weights, and the same two symmetric-folded key variants. XOR each source key byte with its respective 43 p50 bytes, without word offsets or fitted phases.

The four original-input readouts have **20, 15, 20 and 20 ASCII-printable bytes of 43**, respectively, for raw GP indices, raw GP primes, folded GP indices and folded GP primes. For example, the raw-index XOR starts with bytes decimal [170,11,122,86,215,210,220,38]; decoded printability is 20/43, and there is no readable plaintext. Every output round-trips the original 43-byte table interval under the exact same XOR key. These four fixed operations reject a simple signed-word-end / printed-table XOR payload; a separate key derivation would require additional original evidence.

## Reproduction and next decision

The [single runnable Node 22 SFT](../sims/signed2016_folded_wordends_p55_sft.cjs) reads the actual signed 2016 message, canonical original GP corpus and physical word transcription, 256-entry table and original p55. It checks all 43 indices, the p56 genuine END control, exact favored assignment count, and original-image-derived p55 interior indices. The [first successful manual Actions run 43049273696](https://github.com/FlareZ123/liber-primus/actions/runs/43049273696) verified the rune-fold and p55 operation. The [second run 43049966525](https://github.com/FlareZ123/liber-primus/actions/runs/43049966525) additionally executes the four p50 XOR source-key tests. A subsequent original-source CI run tests the table-free END gate and its separate exact 42-symbol permutation null.

The source-derived FOLD/END pairing merits attention as a conditional clue. A productive successor must independently specify what to do with the **other 18 GP symbols** or predict an actual unknown-page plaintext/key before promoting this to a solution. Further free-endpoint, alignment, or refolding searches would risk overfitting.

