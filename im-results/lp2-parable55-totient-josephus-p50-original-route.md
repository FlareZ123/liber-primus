# PARABLE interior totients select the runeless numerical page by a 56-page Josephus walk

**Original-source result, 14 November 2026, Agent 32.** A finite, reproducible cross-page **candidate navigation rule** lands on LP2 physical **p50**, the sole runeless numerical-table page, in two naturally ordered readings of the solved PARABLE. It supplies a source-selected *destination within the book* if the Josephus operation is authentic. This is an observation and proposed human solve path, **not recovered unknown-page plaintext, an authenticated cipher key or the final Cicada destination**.

## Human-visible instructions and independent starting facts

The original solved physical p57 PARABLE, also preserved verbatim in the 2013 original 761.MP3 ID3 TXXX frame, reads in part: "We must shed our own circumferences; find the divinity within and emerge." It contains **95 original GP29 runes in 20 printed words**. The independent 2013 `0_wisdom` clue explicitly identifies *the primes* and *the totient function* as sacred; the genuinely decrypted LP2 physical p56 uses `φ(prime) mod 29` as its running additive key. The 2016 author-signed update says "Its words are the map, their meaning is the road, and their numbers are the direction" and "The path lies empty". The manuscript's original unsolved pages are physical **p0–p55**: **56 pages**, of which **55** carry GP29 runes and **p50** carries a **32×8 numerical table without rune text**.

These independent source facts motivate a *specific proposed reading*: shed the first and last **rune** of each complete printed PARABLE word; use the remaining GP runes' published prime weights and their Euler totients to count through the 56 physical pages in their source order, eliminating a page at each step (the ordinary circular **Josephus** operation). A count starts at p0, takes the currently pointed-to surviving page as count 1, removes the counted page, and resumes at the next surviving page. No secret parameter or ciphertext-language score determines a step. The longest runes use the actual GP glyph identities, not Latin-letter lengths. The word-interior selection was independently documented previously in [the page-seed gate](lp2-parable55-source-interiors-page-key-gate.md), but its 56-page Josephus outcome was not previously tested.

**Important interpretive gap:** Cicada did not explicitly say "Josephus", define this initial cursor, or demand *unreduced* prime totients as page counts. A human could count backwards, include only rune-bearing pages, use a mod-29 step or interpret "shed" differently. The exact route is a motivated hypothesis, not a source-authenticated command.

## Exact original computation

After shedding word endpoints, the **55 GP runes** transliterate to:

```
ARABLICNSTAUNNELURFACUSHEUWIRCUMFERENCEINIUINITITHINMERG
```

The first eighteen **full** totient steps are `96,10,96,60,72,30,12,28,52,58,96,2,28,28,66,72,2,10`. The full **55** steps, and the entire removed-page order, are printed by [the single-file Node22 reproducer](../sims/lp2_parable55_totient_josephus_p50_sft.cjs). The removed-page order begins **39, 49, 35, 43, 8, 40, 54, 27, 31, 46** and ends **4, 42, 7, 21, 25, 15, 9, 22, 48, 19**. Exactly 55 distinct pages are removed. The single **remaining page is physical p50**.

| Fixed source reading and clockwise 56-page elimination | Survivor |
| --- | ---: |
| PARABLE printed interior runes → **φ(GP prime)**, all 55 full values | **p50** |
| Same 55 totient steps, in complete reverse sequence | **p50** |
| Original printed interior runes → unreduced GP prime | p21 |
| Original printed interior runes → GP zero-based rune index + 1 | p12 |
| Prime totient reduced modulo 29, with zero counted as a 29-page lap | p20 |

The last convention is an explicitly conditional workaround for zero counts in a Josephus algorithm, not a canonical source rule. It is given only to show that a previously solved **GP29** key clock does not automatically deliver this result. Full integer totients, counted through a 56-item ring, are essential for the displayed p50 selector.

The coincidence has a second finite specificity check: rotate the 55 original totient steps to each of the **55 possible start phases**. Only **printed phase zero** leaves p50 under *both* forward and reversed step order. Four shifts leave p50 forward; three leave p50 in reverse; their only common shift is zero.

## Finite null and its limitations

For a source-shape-preserving control, shuffle only the **20 complete word-interior blocks**, keeping every rune, each word's internal rune order, the 55 prime-totient values, the original 56-page circle and the fixed clockwise Josephus contract. Using seeded xorshift32 (`0x3301a871`) and **40,000** Fisher–Yates word-order permutations:

- **699 / 40,000** reach p50 with forward word-interior totients.
- **765 / 40,000** reach p50 with reversed totient sequence.
- **14 / 40,000** reach p50 with **both** forward and reverse.

The joint source-rearrangement frequency is **0.00035** in this deliberately bounded conditional ensemble. It is **not a probability of authorial intention or a discovery-adjusted p-value**: the overall research population has tested many interpretations and noticed p50 *after* calculating this one, and source word-order randomization may not model the author's choices. The duplicate direction result helps distinguish the exact source order from a random word reorder within this narrow construction; it does not establish encryption.

## Cryptanalytic decision

This is a stronger internally navigable clue than another unexplained numeric coincidence: the proposed source operation returns the **only** page with no rune text, and that selected page contains an independently nontrivial **256-cell numerical key candidate** already analyzed in [the complete GF29 factorization](lp2-grid-complete-gf29-factorization.md). It also gives an entire deterministic ordering of all other original pages, which may matter for a page-level reading or key schedule. The one known page-selection output is independent of the **12,956 still encrypted runes**. The new route does not by itself dictate how to decode the table, assign its bytes to words/pages, or break those ciphertexts.

**Highest-value next decision:** find a *second* original author-visible instruction connecting the selected p50 numeric table and/or the 55-step removed-page order to an actual reversible operation. Lock that consumer before reading its unknown-page output. Useful consumers must make independent predictions using the established p56 plaintext or a truly withheld unknown interval; a direct textual result must be shown on untouched original ciphertext and re-encipher exactly. Prior failed direct table-to-plaintext, arbitrary phase, ring interpolation and source-polynomial quotient attempts remain negative for their respective contracts. The p50 selection does not rescue any previously rejected decoder by itself.

**Source/reproduction:** [original GP29 page indices](../resources/liber-primus/lp2-corpus.json), [original punctuation and page57 word transcription](../resources/lp2-transcription.txt), [original 2013 audio source inventory](audio761-original-id3-frame-inventory.md), [2013 original Wisdom clue](../resources/external/2013-0-wisdom.txt), [2016 signed message record](../resources/cicada2016-4gq25.md), and [full read-only CJS positive/original/conditional-shuffle test](../sims/lp2_parable55_totient_josephus_p50_sft.cjs).
