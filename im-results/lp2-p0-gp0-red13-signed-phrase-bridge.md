# P0 red-title GP0 graph -> SEEKS / THE / DEVOTED bridge

**Agent:** Agent10  
**Date:** 2026-11-18  
**Status:** conditional structural advance; candidate plaintext support, not a recovered cipher

## Question

The authenticated 2016 sentence says that the words are the map, their meaning is the road, and their numbers are the direction. Recent work made the narrowest shared part of that idea executable as

`whole-word GP0 sum -> zero-based p50 address`.

The current Critic audit correctly warns that later reports switch among incompatible output semantics. This note therefore asks a stricter question on p0: if the p50 byte is interpreted in one fixed way, as a zero-based p0 rune offset, does the original red title produce a closed structure that predicts independently fixed signed-message values?

## Frozen construction

Parse original p0 into its 59 complete printed words. For each word `w`:

1. compute the canonical GP0 sum `S(w)`;
2. read conventional p50 byte `T[S(w)]`;
3. interpret that byte as a zero-based p0 rune offset;
4. map that rune offset to the complete p0 word containing it.

This defines one deterministic functional graph on the 59 p0 words. No radix switch, language score, key search, or output reinterpretation occurs inside the graph.

The two original red title words are source-selected seeds. Their rune lengths are 8 and 5 and they are followed by the original large red 13-dot marker.

## Result

The graph has exactly two attractor cycles.

- The first red title word enters an 11-word cycle containing 56 ciphertext runes.
- The second red title word enters a disjoint 2-word cycle containing 15 ciphertext runes.
- The union therefore contains exactly **13 words**, matching the visible 13-dot marker, and exactly **71 runes**.

The 13-word union is:

`[50,18,9,44,22,25,41,32,28,40,36,5,10]`

in red-title seed order.

The value **71** has three independently useful properties in the already imported signed material:

- `GP0(SEEKS)=71`, and SEEKS is the **only** signed 2016 word with GP0 sum 71.
- `EPIPHANY / SEEKS` is the **only adjacent 8/5 GP-rune-length pair** in the signed 2016 word sequence, exactly matching the original p0 red title's 8/5 word shape.
- 71 is prime and `pi(71)=20=GP0(THE)`. Prime-count is independently present in the already studied p50 duplicate-bracket structure. Under the same conventional p50 byte register, **T[20]=102**, and `DEVOTED` is the only signed word with GP0 sum 102.

So the red-title graph yields the semantic chain

`13 selected cycle words -> 71 = SEEKS -> pi(71)=20 = THE -> T[20]=102 = DEVOTED`.

This strengthens the candidate red-title reading **EPIPHANY SEEKS** and the independently proposed later **THE DEVOTED** crib without claiming that either has yet been recovered by a reversible ciphertext inverse.

## Source-order four-word census

The four labels are not an unordered vocabulary hit. In the authenticated 43-word 2016 message they occur as the exact consecutive source window

`EPIPHANY SEEKS THE DEVOTED`

at zero-based word indices 5..8.

A census of all 40 consecutive four-word windows used four frozen predicates:

1. the first two words have GP-rune lengths 8/5, matching the original p0 red title shape;
2. the second word has GP0 sum 71, the red-seed graph's 13-cycle-union rune count;
3. prime-count of that second GP0 sum equals the third word's GP0 sum;
4. conventional p50 byte at the third word's GP0 sum equals the fourth word's GP0 sum.

Only the window at index 5 satisfies any of these predicates, and it alone satisfies all four:

`[8,5,2,7] ; [121,71,20,102] ; pi(71)=20 ; T[20]=102`.

This is a stronger source-order connection than selecting four matching English words after inspection. It remains evidence for a navigation/crib hypothesis until a reversible ciphertext transform reproduces those words.

## Controls and scope

The cycle-count fact is not unique among arbitrary p0 adjacent pairs. Twelve of the 58 adjacent pairs enter both realized attractors and therefore inherit the same 13-word/71-rune union. The red title is distinguished before this calculation by original red ink and the immediately following 13-dot marker, so the relevant seeds are not selected from those twelve after inspection.

A fixed-multiset p50-byte permutation control was run locally with the p0 word sums, word boundaries and byte multiset held fixed. Across 2,000,000 NumPy permutations (seed `0x7120102`):

- 546 produced two disjoint red-seed cycles whose union had 13 words and 71 runes;
- 52 additionally reproduced the observed ordered 11/2 cycle sizes;
- 2 also retained the already frozen downstream relation `T[20]=102`;
- 0 reproduced all of those conditions plus the ordered 11/2 split.

The broad full-chain frequency in that diagnostic is 2/2,000,000. This is **conditional evidence**, not a familywise p-value: the 13/71 graph feature was discovered on the observed object, and other graph summaries could have been noticed.

## Cipher gate from the candidate cribs

Treating the source-supported placements as tentative known plaintext gives 22 GP29 shift observations:

- p0 positions 0-7: EPIPHANY;
- p0 positions 8-12: SEEKS;
- p0 positions 235-236: THE;
- p0 positions 237-243: DEVOTED.

These observations already reject several simple reusable decoders.

- A repeated additive period-27 key fails at the overlapping phase 0: shifts 26 versus 10.
- A repeated additive period-29 key fails all nine overlapping phases 3-11.
- A stationary monoalphabetic substitution is impossible because identical ciphertext runes require multiple plaintext outputs.
- First-order affine state laws over GF(29) using current plaintext plus previous ciphertext/plaintext, and plaintext/ciphertext autokey lags 1-12, are inconsistent.
- For the p50 table used as a cyclic additive key, exhaustive phase 0-255, both directions, raw/phi/base29 quotient/base29 remainder/printed high digit/printed low digit registers, and every global affine readout `a*x+b mod29` fit at most **6/13** title shifts. Every maximum-training candidate hits **0/9** late THE/DEVOTED shifts.
- For a word-addressed decoder starting each word at its own GP0 p50 address, fixed N/E/S/W table walks fit at most **5/13** title shifts. Exhausting all 24 maps from `GP0(word) mod4` to N/E/S/W also fits at most **5/13** and no maximum-training candidate explains the late pair.

Thus the new navigation structure does not collapse into the obvious Vigenere, autokey, affine-feedback, cyclic-table, or literal word-addressed cardinal-table cipher.

The independently selected `THE ROAD` placement raises the frozen p0 candidate set to **28 GP-rune crib symbols** across six words: `EPIPHANY SEEKS`, `THE ROAD`, and `THE DEVOTED`. With all 28 positions charged, the shortest compatible repeated additive period rises to **37**, leaving only nine unfixed key phases. Exact dynamic programming under the same source-native GP trigram model gives **-524.7831** for Vigenere/Variant and **-565.8463** for Beaufort, again below every one of the 1,000 matched-shape native controls whose worst score is **-320.1538**. This closes the short periodic tabula-recta family more strongly than the earlier 22-symbol period31 gate. Reproduce with `../sims/lp2_p0_sixcrib_period37_exact_sft.cjs`.

The shortest repeated tabula-recta period compatible with the earlier 22 conditional crib symbols is 31. An exact dynamic program solved the nine unfixed period-31 key phases under the repository's source-native GP trigram model. The best Vigenere/Variant completion scores **-544.7514** and the best Beaufort completion **-532.8604**. Across 1,000 independent source-native controls with the exact original p0 word-length shape, the worst control is **-320.1538** and the median **-268.9936**. Both exact period-31 candidates therefore fall below every control. The latest Windows/Node 22 workflow run passes these assertions.

As an extra holdout, the frozen signed-word receiver maps source words `LIES`, `GOOD`, and `LUCK` to p0 ciphertext words of matching GP length. The exact Vigenere period-31 completion decodes those receivers as `ECCI`, `HNNJ`, and `LXPW`, respectively. This is another direct rejection of that cipher family, while the plaintext-assignment interpretation of those receivers remains only a test hypothesis.

## Interpretation

This result materially strengthens one candidate plaintext relation: the original p0 red title and the signed phrase `EPIPHANY SEEKS THE DEVOTED` are connected by a deterministic GP0/table graph whose selected cycle union reconstructs SEEKS and then, through already motivated prime-count/table steps, THE and DEVOTED.

It still does **not** recover the p0 encryption function. The next useful test must use this crib to predict a new untouched ciphertext feature or derive one reusable reversible operation. Further edge-by-edge arithmetic without such a prediction should not be treated as cumulative proof.

## Reproduction

See `../sims/lp2_p0_gp0_red13_signed_phrase_bridge_sft.cjs`.
