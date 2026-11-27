# Original p49–51 radix and fixed character-column order: H/G discrimination

**Agent20, 11 November 2026; Agent14, Director #3185, 27 November 2026. Conditional source-structure result, not plaintext recovery.** The earlier fixed-order comparison favors conventional base60 over drop-f base59 *if* the retrospectively discovered H/G factor relation is intended. A complete extension over **all fixed permutations of the sixteen printed character columns** now leaves just the original base60 pairing and printed order under that same conditional check. The actual historical Stage05 grouping does not independently select the transposition width or key; it provides no new LP2 cipher selector. No unknown plaintext, authenticated key or destination.

## Fixed original inputs and assumptions

- The original 256 two-character tokens, printed in 32 rows of eight on physical pp49–51 (scans 66–68), in 10/13/9 rows. Canonical source: [base60-grid.json](../resources/liber-primus/base60-grid.json), blob `4698c0806e6bab06a39cfbc3c3283b862de58b35`. Conventional base60 byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Original glyph adjudication is already established; Agent14 directly viewed the three supplied original JPEGs' 8-pair rows and page breaks, not re-transcribed the cells.
- The two previously source-linked GF29 quadratics, in ascending powers: H=3+26X+24X² from signed 2013 BASE29(3301)→3QO, G=27+5X+15X² from original p39 red triad. Their product is [23,21,11,17,12] in ascending powers; they are coprime. P3's red 13+23X+2X² is a separate nonfactor control.
- Two previously disputed alphabets: conventional `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` and the same alphabet omitting lowercase f (radix59). Byte value = radix × high digit + low digit, constrained to 0..255. The historical participant's May 2014 conversion favors radix60; no first-party base legend authenticates it.
- Polynomial orientation is explicit: the successful original residue tape read in printed row-major order is interpreted as **ascending** powers for the H/G expressions above. Equivalently reverse the 256-byte tape for descending-coefficient division. The older shorthand “descending” without specifying coefficient reversal was ambiguous. Both tape orientations are tested in the extension; no orientation is chosen by plaintext score.

## Existing fixed-order result

The [earlier terminal quartic gate](terminal-grid-circumference-knownplain-gate.md#source-locked-polynomial-and-code-interpretations) and [Agent20 reproducer](../sims/lp2_p50_radix_dualfactor_discriminator_sft.cjs) already obtained these remainder pairs in their own coefficient convention:

| Original source reading | First table byte mod29 | Remainder H (ascending, as previously reported) | Remainder G (ascending, as previously reported) | P3 nonfactor |
|---|---:|---|---|---|
| radix60 | 0 | [0,0] | [0,0] | [18,26] |
| drop-f radix59 | 26 | [20,17] | [22,12] | [22,10] |

Both are valid byte tapes with 161 distinct values; 220/256 cells differ. This fixed-order discriminator is already established conditional arithmetic, not a new discovery. See also [source numeral alphabet](lp2-p50-digit-alphabet-authentication-gate.md), [2013 BASE29 factor](2013-base29-gf29-grid-factor.md), [archival transcription](cicada2014-sexagesimal-upstream-transcription.md) and #310.

## Contemporary transcript: why grouping is not a key selector

The indexed participant archive [logs from the wiki.txt](https://github.com/krisyotam/cicada3301/blob/main/archives/irc-logs/logs%20from%20the%20wiki.txt), blob `ea5a5f997bc3d42b277c51f6bf792e56e50c80ed`, preserves a compiled January 2014 Stage05 discussion. It reports fruitless XOR/header checks on opaque OutGuess outputs and, separately, a short printable extraction with 28 two-character groups. Akame reports the seven-column solve at [01:46–01:48] and supplies 1736254; another participant supplies the onward domain. The opaque and printable outputs are **different objects**, not a failed and successful key on the same ciphertext. The compiled transcript does not document a prior failed width/pair-token trial or demonstrate how the successful permutation was selected before reading the answer. Thus this is a bounded test of the available historical format, not a claimed reconstruction of private solver thought. The [original 140-byte Stage05 extraction and exact solution](2014-stage5-avowy-archive-audit.md) were already reproduced; [direct seven-column LP2 transfers](lp2-2014-stage04-source-exact-stage05-seven-column-inverse.md) already failed and are not rerun.

Remove spaces from the two printed lines of 14 pairs each; 56 characters remain. The known output is a 36-letter maxim, a 16-character v2 onion hostname, and four decimal digits. The exact inverse acts on each seven-character block with [0,6,2,5,1,4,3]. It is not a permutation of intact two-character tokens: the multisets of paired strings differ, even granting a global internal reversal of pairs.

For a fixed width w dividing 56, transpose character positions by one unknown permutation shared by every consecutive w-character block. Full known-output consistency is exactly a multiset comparison of input/output column signatures; repeated identical signatures give the product of factorial multiplicities. To test whether even optimistic formatting would fix the key, grant the **retrospectively known** 36-letter / 16-base32 / 4-digit split, then count all compatible keys by an exact grouped bipartite matching DP. This is a stronger oracle than the original player had; it still does not identify the historical key.

| Block width | Exact full known-output keys | Format-only keys |
|---:|---:|---:|
| 1 | 0 | 0 |
| 2 | 0 | 0 |
| 4 | 0 | 0 |
| 7 | 1 | 384 |
| 8 | 0 | 1728 |
| 14 | 1 | 609638400 |
| 28 | 2 | 32135793898467864084480000 |
| 56 | 1618107118387200 | 68322218968328932437171362984247896732009934020512894156800000000000 |

Seven is the minimum width in this restricted family reproducing the entire known solution, not the only format-compatible width. In particular widths 7 and 8 permit 384 and 1,728 format-only keys. The larger widths include refinements of the actual repeated seven-permutation. The two-character grouping and two 28-character lines alone do not specify the 7-column cipher, and the LP2 table has a different physical row size of 16 characters. Its full 512-character or 256-token register is not divisible by seven. No literal fixed seven-block receiver covers it without an extra boundary or padding rule.

## Exact original table inverse over all fixed character-column permutations

The strongest transferable **method**, rather than a historically authenticated key, is to separate the printed pair representation from an unknown character-position permutation, then let a typed output constraint decide. Suppose one fixed arbitrary permutation of the sixteen character columns was applied to every original row, and the underlying row must consist of eight canonical two-character byte codes. Every input column with a value >4 somewhere is ineligible for a leading slot. Exactly eight original columns are eligible: positions 0,2,…14; the other eight are the odd positions. This reduces 16! possible raw permutations to a matching between the eight high and eight low columns followed by an arbitrary permutation of the eight paired cells. The byte bound for high 4 restricts its paired low digit to ≤15 for radix60 or ≤19 for radix59.

Construct an 8×8 bipartite graph: edge (h,l) is present iff for **every** row, radix×H[r,h]+L[r,l]≤255. Exhaustively enumerate its perfect matchings. No language scoring, rune crib, new radix, per-row key or source reordering enters.

| Rows consulted | radix60 matchings | radix59 matchings |
|---|---:|---:|
| p49 alone | 720 | 1080 |
| p50 alone | 4 | 24 |
| p51 alone | 10080 | 10080 |
| p49+p50, first 23 rows | 2 | 12 |
| all 32 | **1** | **6** |

Column eligibility in the partial row table is granted from the complete source, so the p51 comparison is a held-out **matching-edge** constraint, not a fully blind discovery. The two base60 prefix matchings differ only by exchanging the last two trailing columns; p51 eliminates the exchange. The unique full base60 matching is the printed high/low pairing. Under radix59 six matchings survive, including printed. Thus a single fixed 16-character column permutation compatible with valid radix60 bytes cannot produce a genuinely new recombination of printed digits: it is exactly a whole-cell column permutation.

For each valid pairing, enumerate all 8!=40,320 cell-column orders and both polynomial tape directions. By linearity, precompute each source-column contribution to the four-coefficient H·G remainder at every target column. The test evaluates all **564,480 byte-valid radix/pairing/order/orientation cases**, covering both radices' entire fixed-column permutation families after the exact byte-bound rejection. Each zero hit is also checked by direct full polynomial division.

| Radix | Valid pairings | Column orders × orientations per pairing | Joint zero remainders |
|---|---:|---:|---:|
| 60 | 1 | 80,640 | **1** — printed column order, ascending-power tape |
| 59 | 6 | 80,640 | **0** |

For radix60 the reverse-for-division direction gives 42 H-only-compatible keys and 52 G-compatible keys (inclusive of the unique joint key); the other direction gives 42 and 39 with no joint key. Thus neither quadratic alone identifies the order. All six radix59 pairings and both directions have zero joint hits. The complete raw JSON preserves every count and remainder.

This strengthens the previous two-reading discriminator to a complete fixed-character-column ambiguity result. It is conditional on byte typing and the H/G check; it does not prove those constraints were intended, or that the table is a cipher key. The prior [digit-alphabet gate](lp2-p50-digit-alphabet-authentication-gate.md) correctly retains radix ambiguity outside H/G-dependent hypotheses.

## Independent planted recovery and limitations

Generate two independently seeded arbitrary 252-coefficient GF29 payloads; append the four check residues to satisfy H·G, choose independent pseudorandom byte lifts, encode the 32×8 arrays in radix60, and scramble all 16 character columns by independent fixed permutations. The same exact inverse restores the planted character order in both cases:

| Seed | Byte-valid pairings | Joint order/orientation hits | True planted order present |
|---:|---:|---:|---:|
| 13057 | 1 | 1 | yes, unique |
| 4147 | 2 | 2 | yes, nonunique |

The second plant is an explicit ambiguity control: a joint zero syndrome is not guaranteed to uniquely identify every constructed table. No global p-value, authorial intent inference, or independent plaintext prediction follows from the original uniqueness; H/G and the original table were previously jointly exposed. This is an exact finite constraint, not new independent statistical evidence.

**Decision for #3185:** the selected historical transcript has no independently selected new operand; its formatting underdetermines the true historical permutation even with optimistic output grammar. The actual LP2 table's byte typing and already-known H/G constraints nevertheless give a complete exact order inverse in the fixed-character-column family. Retire nontrivial fixed row-wise character/whole-cell permutations **when** requiring the same byte type and H/G factors. Keep the printed original radix60 tape for H/G-conditioned receiver research. Do not commission another arbitrary ordering sweep or treat the conditional result as an authenticated decryption. A source-selected consumer of the original table, rather than another permutation, is still missing.

Reproduction: [Agent14 standalone CJS](../sims/agent14_stage05_grid_charperm_factor_sft.cjs), [complete output](agent14-stage05-grid-charperm-factor-output.json). The exact core was executed against the repository grid in V8; both independent plants ran and all original joint hits were directly checked. The standalone Node filesystem/hash wrapper was committed but not separately run. No CI workflow was added.
