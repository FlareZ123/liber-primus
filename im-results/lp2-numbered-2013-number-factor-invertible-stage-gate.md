# Five numbered LP2 passages: source-typed reversible NUMBER factor program fails on original stage 1→2

**Agent8, 22 November 2026, Director #2227. Classification: a bounded exact negative source-program test.** All five original numbered passages remain undeciphered. No historical operation was identified that maps complete original passage1 into passage2, and no authentic key, plaintext or Cicada continuation was recovered. The apparent five-step program remains an interpretation, with five standalone numbered aphorisms as a genuine rival.

## Source-motivated, completely specified variable-length program

Physical pp33–39 repeatedly print the identical two-line Babylonian numeral motif. It reads **1033** and **3301** in sexagesimal notation. The two output decimal numbers are digit reversals, which could prompt a period solver to revisit a known operation from the 2013 puzzles. The **signed** January 2013 TCP-server challenge specifies integer conversion `BASE29 3301 → 3QO`. The separate 2013 *first-onion NUMBER* decimal-reversal/factor handling is a **participant/archive reconstruction**, rather than part of that signed challenge ([source distinctions](../resources/external/2013-tcp-server-signed-source.md)). This matters: the following mixed historical program is motivated but **not an authenticated LP2 command**.

Physical p36–38 visibly print **red 1,2,3,4,5**, delimiting five complete rune paragraphs. Their original rune lengths are **139, 91, 98, 96, 129** and their printed word counts **30,20,25,19,28**. Original photographic layout has text before and after the numbered list, and the cuneiform heading is unchanged, with no original per-stage operation text in the margin. The prior [length-preserving stage no-go](../sims/lp2_numbered_fivestage_program_invariants_sft.cjs) does not by itself exclude length-changing mathematical algorithms.

One *new*, reversible variable-length program was [frozen before evaluating the source integers](../workplace/agent8-2227-numbered-numberfactor-program-frozen.md):

1. Read the complete 139 original GP29 runes of passage1 as a single unsigned BASE29 integer using the canonical GP ordinal indices0..28 in printed order, dropping word separators only for this numerical argument.
2. Reverse the integer's **decimal** digits, using the explicitly documented reconstructed `NUMBER` behavior. Leading zeros after reversal disappear.
3. Read each of passage2's **20 genuine printed rune words** as one integer in the same GP29 digit encoding. Treat these as the full, source-ordered list of prime factors, including repeated factors as repeated words, with no unprinted exponents or sideband.
4. Require **exact equality** between the decimal-reversed passage1 number and the product of all original passage2 factor words. This checks the actual next complete paragraph without fitting a cipher key, sign, phase, prime index, word grouping, or language output.

If equality and genuine primality held, the program could be inverted by multiplying the listed factors, reversing decimal digits and reconverting to base29, subject to retaining decimal trailing-zero information. Only then would passage3 qualify as an untouched prospective program holdout.

## Exact original-input decision

The [source-locked BigInt CJS test](../sims/lp2_numbered_2013_number_factor_stage_original_sft.cjs), passed in [Windows Node22 run 45014132455](https://github.com/FlareZ123/liber-primus/actions/runs/45014132455), reads the canonical original physical GP29 passage texts and their original punctuation, asserts the exact five rune/word lengths and parses all 20 proposed prime-factor words without modification.

| Object | Exact original input / calculation | Integer size |
|---|---|---:|
| Complete original passage1 `N` | 139 GP29 rune digits, initial digit20, no leading zero | **675 bits**, 204 decimal digits |
| Required reversed decimal integer `R(N)` | First digits `785944551185532587…`; reversal retains all204 decimal digits | **678 bits**, 140 base29 digits |
| Product `M` of all20 untouched printed words in passage2 | 91 GP29 rune digits split by original word boundaries | **402 bits**, 121 decimal digits, 83 base29 digits |

The original equality **`R(N) = M` is false**. Stronger exact arithmetic yields **`gcd(R(N),M)=1`**, so M does not even divide the original required value; the printed word factors cannot be a partial subset of its prime factorization. The second original proposed factor is **220758**, and the third **442374030**, both composite even integers, independently contradicting a list of prime factors. Even granting an unspecified additional multiplicative factor, the missing quotient would need **57 base29 digits** before the already contradictory divisibility issue.

There is also a simple necessary bound independent of factor ordering or primality: with 91 total GP29 digit positions, the product of the proposed positive factor integers is strictly **less than 29^91**. The original reverse-decimal value is 140 GP29 digits. No reassignment of the existing **20** word separators, without changing their glyph/digit content or introducing factor exponents, can overcome this difference. A general *total injective* mapping from all 139-rune GP29 strings to 91-rune GP29 strings would need at least **48 extra base29-equivalent symbols**, approximately **233.18 bits** of side information. This does **not** forbid all conceivable compressors for a restricted nonuniform plaintext language; it forbids universal lossless recoding with no additional carrier.

The CJS SFT additionally constructs a genuine synthetic complete list of **20 factor-three values**, converts their product through decimal reversal into canonical base29, and recovers the exact product and factor list. Deliberately changing one factor is rejected. The original failure is thus a contradiction of the input and typed operation, independent of implementation arithmetic.

## Decision for Director #2227

The historically motivated **BASE29 → reverse decimal → factor into source GP29 words** algorithm is *not* the transformation from original numbered passage1 to passage2. It fails exact value equality, factor primality, bit capacity and even gcd divisibility. Consequently source passage3–5 must remain untouched; adapting radix, added exponents, byte packing, prefix omissions, factor order, or an invented second cipher to salvage the model would no longer be the source-selected experiment.

More generally, the cuneiform 1033/3301 rubric establishes number identity and sexagesimal display, while the five red numerals establish enumeration. The original artwork supplies **no author-authenticated program of five typed operations** (no source-selected input/output alphabets, reversible packet grammar, word-boundary conversion, error-correction convention, nonce or variable-size coding rule). The five passages may instead be independently encrypted enumerated prose. A separate already-negative natural interpretation treats the 0–4 high base60 digits of the p50 byte array as selectors into these paragraphs, but those high values are also exactly what ordinary 0..255 bytes in base60 necessarily produce ([existing book-code receiver](../sims/lp2_fivepassage_base60_bookcode_original_sft.cjs)). Neither reading recovers plaintext.

**Retire this exact reversible NUMBER-factor program and do not commission a five-stage chain until a genuinely new original or historical source selects the first variable-length opcode and input representation.** Prioritize direct decipherment of a whole numbered passage or a source-specific instruction before assuming the remaining four numbers are serial transformation steps. No recovered unknown plaintext, original key or destination.
