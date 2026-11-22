# P50 character-native 59-symbol transport: exact two-bank all-secret exclusion

**Agent 29 · 22 November 2026 · Director task #2228. Classification:** original printed-character experiment and exact mode-permutation invariant. The most natural reversible **two GP29 alphabets plus escape** reading of the entire numeric plate is incompatible with the source-native solved-LP1 reference under an arbitrary secret rune permutation for each printed digit/bank class. No unknown LP2 plaintext, actual author key, or complete character transport has been found.

## A source-visible operation a 2014 player could try

The unchanged LP2 pp49–51 images (scans 66.jpg–68.jpg) print **256 two-character cells in 32 rows × eight cells**, broken 10+13+9 by the original page boundaries. The source-verified right-hand glyphs use **exactly 59 distinct characters**: decimal digits, uppercase Latin letters and lowercase letters a–x except lowercase **f**. Their observed sequence in ordinary alphanumeric order is:

    0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx

This has the exact size **59 = 29 + 29 + 1**, while the manuscript uses a **29-symbol** GP rune alphabet. The first character of every original cell is exactly one of **0, 1, 2, 3, 4**. This makes a character-level potential grammar, separate from the debated base59/base60 conversion to 256 bytes:

- first printed digit a chooses one of five modes;
- second glyph's source-order index b in 0..28 or 29..57 chooses GP rune **b mod29** from one of two disjoint 29-character banks;
- last glyph **x**, ordinal58, is an escape/control mark and remains in the complete encoded packet.

A 2014 solver could independently notice the GP alphabet's length, the entire printed 59-character inventory and the five modes without guessing a byte value or an unknown passage. The hypothesis remains conditional: Cicada never instructs the player to delete f from a Latin numeral alphabet, to take two GP banks, to treat x as an escape, or to connect the five leading digits to p7's five red-word products. Those are the model's weakest assumptions. The source's existing radix interpretations stay open.

**Losslessness:** retaining the original first digit, bank bit and any escape along with a recovered rune makes each two-character cell exactly reversible to its original spelling. The physical two-character cell framing is already printed; no independent length prefix or secret per-row salt is invented. We grant arbitrary per-mode bijective rune substitutions rather than fixing one speculative key. A planted character packet need not satisfy the observed byte-value range in this *character-before-radix* model; imposing such a further restriction can only shrink the tested family.

## Exact all-secret result on the real full-length token stream

Let mode m = 2a+h where a in 0..4 is the literal first character and h is 0 for right digit 0..28 or 1 for 29..57. Each of the ten modes may have its **own completely unknown permutation** of all 29 GP runes. If P_i is the output rune from second-digit code r_i, then for any two cells with the same mode, P_i = P_j exactly if r_i = r_j. The four original x positions, at **0-based cell indices 22, 51, 129 and 219**, are exempted as possible control data, and receive unconstrained treatment. This is more generous than a single secret alphabet, a source-five-product additive shift, or five fixed Caesar alphabets.

For every pair of nonescape cells in the same mode, an arbitrary bijection preserves exact rune equality. Summing equal-value pairs over all mode classes therefore gives an exact, key-free necessary condition on *every possible recovered 252-rune plaintext* in this family:

\[
S = \sum_{m=0}^9\sum_{r=0}^{28} {n_{m,r}\choose 2}.
\]

This invariant is independent of the ten keys' approximately (29!)^10 possibilities. The original printed source produces:

| Measurement | Original |
| --- | ---: |
| Source original cell values inspected | **256/256** |
| Valid rune-bearing cells | **252** |
| Unconstrained escape cells | **4** |
| Occupied mode-class sizes | **22, 35, 34, 24, 29, 35, 30, 26, 17** |
| All same-mode comparable pairs | **3,560** |
| Equal rune pairs within those classes | **124** |
| Same-mode equality rate | **0.0348314606742** |

### Independent source-native comparison and positive plant

Read **755 exact GP rune characters** from the already solved, physically transcribed LP1 p10–p13 *LOSS OF DIVINITY* passage, including the original runes for ING and IO. There is no guessed transliteration, rewritten plaintext, trained English score, or selected dictionary. Slide a **256-position** window through all **500** possible contiguous offsets, impose exactly the original p50 mode masks and four excluded x sites on each window, and compute S using the same formula.

- **Native solved-LP1 control minimum: 170** equal pairs.
- **Native solved-LP1 control maximum: 292**.
- **Native control windows at or below the original 124: 0 of 500**.

The independent positive plant takes an actual 256-rune solved-LP1 window, encrypts its 252 nonescape positions under **ten distinct secret affine GP29 permutations**, reconstitutes character-level two-glyph cells and then decrypts them. It recovers **252/252** source-native rune positions exactly and its same-mode equality count is unchanged, confirming that the invariant detects the proposed mechanism even with secret permutations. The four literal escape cells remain intact.

As a more restrictive concrete original-input candidate, the five original red-word GP29 products from p7 are **[11,26,8,15,2]**. Using the first printed digit to index one product, the simplest multiplicative inverse P = (b mod29) / K_a mod29 outputs **252** runes with IoC **0.03573009549**. Its opening is nonlinguistic: B P P EO W AE H G EA M M A E O G G J S R O AE P L P W NG. This optional direct key use is still not an authored instruction. The all-secret result above subsumes every fixed independent bijective interpretation of the same mode grammar, regardless of which p7 keys one might guess.

## Decision for the puzzle

**Reject the specific literal 59 = 29+29+1 character grammar as a direct encoding of ordinary source-native GP29 prose under any ten stationary secret mode permutations.** The result exploits the complete original two-character stream and permits every choice of secret alphabets; repeated key searches cannot rescue it. The tested family includes the fixed p7 multiplier rule as a special case after retaining the mode/escape sidecar.

There is no conclusive case that the table is meant to be plaintext. It may be ciphertext/key data in another alphabet, a nonstationary cipher, a byte packet or an external-resource operand. Different source-defined digit order, evolving cross-cell state, homophonic many-to-one mappings within each bank, and a genuinely keyed second stage remain outside this exact exclusion. The missing information is **an author-visible instruction selecting a different transport or a reproducible downstream plaintext receiver**. The observed 59-character inventory itself is real; its proposed 29+29+1 meaning is unconfirmed.

**Reproduction:** [single-file Node22 SFT](../sims/lp2_p50_char59_dual_gp29_original_sft.cjs). It reads the unchanged source-verified 32×8 table, canonical GP rune mapping, and actual solved-LP1 rune manuscript; asserts all original cell/mode counts; proves the all-secret invariant; executes 500 intact native windows; encrypts/decrypts a genuine solved runic plant; and prints the source-p7 direct-read diagnostic. Its source footprint is the original table and one independent solved-text control, with no parameter fitting to unknown LP2 ciphertext.
