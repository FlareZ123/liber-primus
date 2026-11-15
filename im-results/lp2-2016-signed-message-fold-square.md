# Signed-2016 58-page fold square

**Status:** the signed-message 243/58 numerical fold square remains a provisional address clue. A separately motivated three-share reading of the original 729-rune opening chapter is now excluded as a direct stationary linear GF29 cipher, including all hidden linear coefficients and every fixed bijective output alphabet, against all 602,697 windows of three native GP-English controls. Neither route recovers LP2 plaintext or an authenticated key.

## Result

Using the canonical Gematria Primus prime values on the authenticated 2016 signed message yields three source-internal facts:

- `HELLO = LIBER = 243`. This is the only GP-prime-sum collision between distinct source words in the signed message.
- `FOUND - THE = 130 - 72 = 58`. This is the only pair of distinct source words whose sums differ by the LP2 page count, 58.
- `YOU + FOUND = 113 + 130 = 243`. This is the only pair of distinct source words whose sums total 243.

Treat a word sum as the zero-based Euclidean address

```text
sum = page + 58 * wordIndex
page = sum mod 58
wordIndex = floor(sum / 58)
```

Then the source values make a locked local prediction:

| label | GP-prime sum | address | printed destination |
|---|---:|---:|---|
| THE | 72 | p14:w1 | **FOLD** |
| FOUND | 130 | p14:w2 | NGC |
| YOU | 113 | p55:w1 | AEMIW |
| FOLD | 171 | p55:w2 | SB |

The first row follows from source words alone because FOUND = THE + 58. The destination at THE is the literal English word **FOLD**, whose GP-prime sum is 171. That closes a second 58-spaced row because FOLD = YOU + 58.

The four source labels therefore form

```text
THE    FOUND
YOU    FOLD
```

with a direct arithmetic fold:

```text
243 - THE = FOLD
243 - YOU = FOUND

THE + FOLD  = 243
YOU + FOUND = 243
HELLO = LIBER = 243
```

A diagonal fold through THE/FOLD swaps YOU with FOUND, matching the source sentence “Seek and you will be found.” The equal diagonal total is independently named twice by the source itself through the unique HELLO/LIBER collision.

This materially strengthens the earlier base58-word-map observation because the divisor 58 and the THE/FOUND adjacency are selected by a relation internal to the signed source, before reading p14.

### Conditional destination-diagonal pointers to the table flanks

Adding the *mapped destination* words along the two diagonals is an extra operation, not one stated by the signed message. It nevertheless gives a concrete, checkable prediction: **FOLD + SB = 171 + 114 = 285 = 58×4 + 53**, addressing **p53:w4 NGTHIAWSH**; **NGC + AEMIW = 59 + 222 = 281 = 58×4 + 49**, addressing **p49:w4 INGGTH**. Both addresses use word index4, on pages49 and53, which flank the p50–52 numeric table. The page separation is4, and the two diagonal sums differ by4, the length of FOLD. The two selected words both contain the GP digraph tokens **NG** and **TH** (p49 has an intervening G).

The original JPGs `resources/liber-primus/32.jpg`, `49.jpg`, and `53.jpg` add a visual check. Page32 has two 13-dot clusters flanking its red heading; p49 has another 13-dot cluster; p53 has a 10-dot cluster. The p32-left, p32-right, and p49 clusters share the same normalized three-column alternating pattern over nine rows: **center, left+right, center, left+right, center, left+right, center, left+right, center** (5 center dots + 4 pairs = 13). The p53 cluster uses the same motif over seven rows (4 center dots + 3 pairs = 10). These counts match the lengths of the 13-rune p32 window and the 10-rune Good/Luck mapped sequence, respectively; both sequences have GP-prime sum413. This may connect the fold square to the table's flanking pages, but the destination-word addition is not source-authenticated. Treat the p49/p53 pointers and marker correspondence as a navigation hypothesis only, not as a key or decryption. The exact word-address predictions are reproduced by `sims/lp2_2016_fold_square.cjs`.

### Marker-derived start 85 and two routes through p50

The alternating three-column markers admit a binary reading if a **single centre dot is 1** and a **left+right pair is 0**. The p32/p49 nine-row pattern is `101010101` = **341**; the p53 seven-row pattern is `1010101` = **85**. These are congruent modulo the 256-cell p50 table: **341 mod 256 = 85**. The opposite polarity gives 170 and42, which do not agree modulo256. This makes cell **85** a constrained candidate start, not a fitted table offset.

Two source-selected step sequences have the same total displacement:

- The 13 GP-prime weights of the p32 window: **107, 11, 59, 5, 2, 2, 7, 5, 23, 7, 71, 67, 47** (sum **413**).
- The 10 GP-prime weights of the mapped **Good luck** destination words p4:w2 LGFNIACX and p44:w1 GTHY: **73, 17, 2, 29, 107, 13, 47, 17, 5, 103** (sum **413**).

Walking these as positive steps through the row-major 256-cell p50 table from cell85 gives:

- p32 route positions: **192, 203, 6, 11, 13, 15, 22, 27, 50, 57, 128, 195, 242**.
- Good/Luck route positions: **158, 175, 177, 206, 57, 70, 117, 134, 139, 242**.

The routes share cells **57** and **242**. Their table values are **118** and **42**, whose difference is **76**, exactly the rune count of p55. The Good/Luck route also reads table values **171, 72** consecutively; under the same 58-page word-address rule these point to **p55:w2 SB** and **p14:w1 FOLD**, in that order.

A frozen null over all 256 possible starts is discriminating: the SB→FOLD consecutive pointer occurs at starts **44 and85**; the shared-checkpoint value difference76 occurs at **85 and223**; their conjunction occurs at **85 only**. Thus the marker-derived start is the unique start satisfying both checks. This is a strong candidate navigation mechanism connecting the 2016 message, the p32 window, p49/p53 markers, p50 table, and p14/p55 fold. It is **not yet plaintext**. The binary interpretation and prime-weight step rule remain hypotheses, even though their conjunction is sharply selected; no table readout or final decipherment has been established. Reproduction: `sims/lp2_2016_p32_p50_two_route_navigation_gate.cjs`.



## Solved-tail connection

FOLD has sum 171, so the same address rule selects p55:w2 `SB`. `SB` has sum 114, which selects p56:w1 `OESR`. The established p56 mechanism decrypts that ciphertext word to **END**.

This connection is useful as a consistency check, yet it is weak evidence by itself. Under the same pointer graph, 154 of 2,928 physical-word starts reach p56:w1, and 15 starts do so in exactly two steps. The source-internal 58/243 algebra carries more evidential weight than generic convergence to the solved tail.

## The signed 243 value as a complete first-chapter three-share consumer

**New original-input all-secret gate, 15 November 2026.** The signed message's two independent words **HELLO** and **LIBER** both have GP-prime sum **243**. The first source-visible LP2 chapter, physical pp0–2, has **729 exact GP29 runes = 3×243**. These values suggest testing the *separate* historical Cicada three-share construction: take three aligned 243-rune source tapes and use each position as a GF29 element. Two simple exhaustive layouts require no guessed starting rune: (a) three consecutive 243-rune tapes and (b) three interleaved tapes. The 2014 puzzle did demonstrate combining three byte shares, and GF29 prime arithmetic is part of Liber Primus. **The missing premise is substantial:** neither the signed 2016 sentence nor an original LP2 instruction says to treat the 729 runes as three Shamir shares; 243 was noticed after comparing two source artifacts.

Under standard degree-two Shamir shares at x1, x2 and x3, recover the x0 symbol by `P=3A−3B+C (mod29)` or predict the fourth share by `A−3B+3C`. Both registers remain nonlinguistic at the complete, unchanged source-chapter alignment. The decisive **stronger key-independent exclusion** permits *every possible stationary nonzero GF29 linear projection*, `P_i=aA_i+bB_i+cC_i`, with **all 29³−1=24,388 coefficient triples**. Any additional **unknown fixed 29-symbol bijective substitution** is allowed for free: a bijection preserves the output GP29 rune histogram and its exact index of coincidence (IoC). The all-zero projection is excluded because it would encode a constant symbol, which cannot be ordinary prose.

| Source-frozen 243-rune tape layout | Highest equal-symbol ordered pairs after any linear projection | Highest projection IoC | Coefficient triples achieving maximum |
| --- | ---: | ---: | ---: |
| Three consecutive 243-rune tapes | **2,278/58,806** | **0.0387375437880** | 28 scalar-equivalent |
| Three interleaved 243-rune tapes | **2,268/58,806** | **0.0385674931129** | 28 scalar-equivalent |

The all-secret maxima are *below every contiguous original source-native 243-rune English reference window* in the three independently retained control corpora. The test transliterates source English using the established GP29 digraph spelling (including ING→NG and K/Q→C, V→U, Z→S) and enumerates **all 602,697** possible windows; no language model is trained or fitted on LP2:

| Native reference | GP runes | Full 243-rune windows | Lowest within-window ordered equal-symbol pairs | Lowest IoC |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare first 300k characters | 217,644 | **217,402** | 2,822 | **0.0479883005136** |
| Gibran, *The Prophet* | 62,696 | **62,454** | 3,046 | **0.0517974356358** |
| Emerson essays | 323,083 | **322,841** | 2,916 | **0.0495867768595** |

This rules out **all direct stationary three-lane linear plus per-target fixed substitution ciphers** that would yield any of those complete native-GP windows, despite unknown coefficient values and 29! outer keys. It does **not** prove incompatibility with every English passage, dynamic keys, nonlinear transformations, different source register, or other 243-rune layouts. Synthetic positive controls create genuine 243-symbol Shakespeare GP plaintext and three quadratic field shares at fixed coordinates1–3; Shamir inversion recovers **243/243**, predicts a fourth share **243/243**, and yields a collision index above the same original all-key bound. No unknown p0–2 words, author-selected key or deep-web destination were recovered.

**Reproducer:** [one-file read-only Node22 CommonJS original-sources and all-secret SFT](../sims/lp2_2016_signed243_firstchapter_three_share_sft.cjs), consuming the canonical GP29 manuscript, authenticated signed 2016 text and three existing English reference corpora. The finite original and reference calculations were independently evaluated over exact repository source content. The new committed SFT has not been separately run in CI. This is one rejected, clue-constrained mechanism, not a cipher-identification result.

## What did not survive discrimination

A literal center fold of the original p14 scan, tested vertically, horizontally, and in both axes, does not produce a clean registration of the page art or text. The p14 13-red-dot marker also recurs on several other LP2 pages, so its incidental match to one pointer-walk length is not a useful selector.

## Weakest assumptions

1. GP-prime sum is the intended “number” of an English source word.
2. The 58 LP2 images define the modulus.
3. Address orientation is `page = remainder`, `wordIndex = quotient`.
4. Word indices are zero-based, consistent with the 0–57 page numbering.
5. **FOLD** denotes the 243-complement/address-square operation rather than another fold mechanism.

The first four assumptions jointly make the FOLD destination a concrete prediction. The fifth remains the unresolved step.

## Next decisive experiment

The navigation hypothesis now fixes a single candidate start (85), two step sequences, and their shared table checkpoints. The next task is to determine whether the original p49/p53 contexts, red-marker geometry, or p50 table notation prescribes how to read the visited values as plaintext or key material. Do not tune the start, direction, rotations, or permutations. The simple repeating-additive consumer has been tested and does not produce plaintext; if no source-fixed table readout survives an independent language test, retain this as navigation only and do not promote it to a decryption.

## Reproduction

Run:

```text
node sims/lp2_2016_fold_square.cjs
```

The script recomputes source-word GP sums, uniqueness of the 243 collision, uniqueness of the 58-difference pair, the 243 pair, all four addresses, the FOLD destination, and the p55→p56 pointer.
