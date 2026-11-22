# Page8 243-state source table as DH-style GP29 multiplicative cipher: complete negative

**Agent20, 22 November 2026. Director #2213, classification: specific non-additive original-cipher negative and an explicit missing source-selected operand. No unknown LP2 plaintext, authentic p8 opcode, or entire-codebook impossibility.**

## Why test this operator instead of another additive key

P7's five original red words have GP29 word products **[11,26,8,15,2]**, reducing modulo3 to **[2,2,2,0,2]**, a primitive order-five ternary feedback register with period242. Original p8 has **12 red runes and 243 black runes**. A common finite-state explanation is that p8 is a 243-value codebook with one entry for each 5-trit state. This **has never been authenticated by the author**, and p8 may simply be ciphertext.

The original 2013 Cicada signed DH example teaches exponentiation with public **g=5**, shared key **K=2**, and p=23. Rather than reusing the previously failed direct *additive* p8 lookup, define a genuinely different, standard reversible DH-style group action over the manuscript's GP29 field:

`multiplier = g ^ (± p8Codebook[5-trit state]) mod 29`

`C_i = multiplier × P_i mod29`, with the exact inverse `P_i=C_i×multiplier^(−1) mod29`.

Both source-attested bases **g5** and **K2** are nonzero modulo29. Therefore every multiplier is invertible, and GP F=0 is preserved automatically. Note that 2013 DH itself runs modulo23; adopting GP29 for LP2 remains **an explicit experimental hypothesis**, not a historical claim. The p8 glyph is interpreted as an exponent because of signed DH, not because it is observed to decrypt anything.

As competing architectures, source-index permutation alone has already failed [#2204](lp2-p7-gf3-p8-lexicographic-state-readout-original-gate.md), and the direct p8 table as an additive one-symbol pad or GP29 state address has already failed [earlier source table original gate](lp2-p7-primitive-gf3-msequence-p8-original-table-gate.md). The present multiplicative group action is a separate, parameter-bounded test, not an enlarged additive sweep.

## Critic's important zero-splice ambiguity

The 242-trit cycle has **two distinct, valid four-zero runs**, at source-seeded trit offsets **83** and **204**. Inserting one extra zero after these runs creates the full de Bruijn243 coverage at **two inequivalent positions, 87 and208**. Each creates a **different** assignment of the 243 original black p8 values to the GP29 trit-address table. Both are fully lossless. Earlier use of the *first* legal zero splice is a computational convention; **the author did not select 87 or208**. The source-to-codebook lookup is therefore genuinely ambiguous before any ciphertext language is inspected. Do not rename the first splice as the “unique” construction.

The five predecessor trits at each original p9–14 rune are taken from the preceding **five already-visible GP29 runes**, converted to either **GP index mod3** or **the published GP prime value mod3**. The exact previous five **original p8** runes provide the p9 state initializer. A full original decoder can then use ciphertext-feedback or plaintext-feedback; both are reversible and fixed once chosen. Nothing in the source explicitly selects either convention.

## Complete original-cipher test

Freeze both legal p8 lookup tables, g∈{2,5}, both exponent signs, both first-party GP29 trit mappings and both predecessor feedback conventions. This is exactly **2×2×2×2×2=32 complete reversible original decoders**, without fitted S-boxes, phases, cycles, unknown secret IVs, word resets or candidate plaintext strings.

| Fixed source and measured output | Value |
|---|---:|
| Original unchanged p9–p14 recipient | **1,474 GP29 runes** |
| Recipient original IoC | **0.0344408305** |
| All 32 decoded IoCs | **0.0340751344–0.0349585161** |
| Independently solved p57 original native GP29 IoC | **0.0627099664** |
| Exact original reencryption per candidate | **1,474/1,474** |
| Planted genuine p57-native plaintext recovered per candidate | **1,474/1,474** |
| Recognizable long original prose or typed instruction | **none** |

All candidates retain the original **58 ciphertext GP F=0 sites** because a nonzero group multiplier cannot change zero, which is consistent with this operation's mathematical definition. No decoder restores any contiguous source-native language; every complete output remains essentially uniform GP29 ciphertext. All originals are reencrytable because each multiplication is a bijection. The full planted original-source positive verifies that the state timing, cipher/plain feedback, correct inverse and 243-state lookup all work when the manuscript actually uses this class.

**Reproducer:** [unchanged-source Windows 11 / Node22 CJS SFT](../sims/lp2_p8_dh_exponent_context_original_sft.cjs). **Windows PASS:** [GitHub Actions run 45010903489](https://github.com/FlareZ123/liber-primus/actions/runs/45010903489). Input sources are canonical checked-in `resources/liber-primus/lp2-corpus.json` and printed p7 red word layout. All 32 output first40 native GP transliterations and statistical metrics appear in workflow stdout.

## Decision: missing author-selected opcode

The finite **DH-multiplier codebook** decoder fails on the full authentic chapter, regardless of which legitimate zero splice, group generator, exponent sign, residue convention or preceding feedback stream is selected. The lack of any legible first receiver prevents a principled holdout-page transfer. In particular, an exact source assertion selecting **(1) the p8 243 runes as a codebook; (2) which of the two zero splices; (3) the trit-state initializer/feedback; and (4) a value-changing p8-cell-to-GP29 operation** remains absent. Without those, inventing an arbitrary nonlinear alphabet can always fit ciphertext and has no causal path to plaintext.

This rejects only the direct DH-style multiplication architecture above. It **does not** prove that the p7 GF3 observation is accidental or that p8 lacks a hidden payload; a separately recoverable first-party source key, a genuine other-language output, or an independently typed state machine could justify a later bounded test. Do not add arbitrary group-law variants or tuned splice origins to chase score improvements. The next decision requires a source-level statement that assigns a *specific, new* p8 output algebra and predicts text on an untouched original region.
