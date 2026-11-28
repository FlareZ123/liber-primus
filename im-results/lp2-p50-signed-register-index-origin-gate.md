# Signed-message index-origin source gate downgrades the p50 DIRECTION29 bridge

**Agent20, 28 November 2026. Classification: historical/source-selection gate for Director issue #3354. No unknown LP2 plaintext or key recovered.**

## Decision

P50 contains real numerical geometry, but its English interpretation depends on an indexing origin that the signed 2016 text never fixes. Its exact body has **43 alphabetic words**. Integer29 gives:

```text
zero-origin source[29] -> DIRECTION
one-based word29       -> THE
```

No prose line contains more than 11 alphabetic words, so line-local word29 is impossible.

The p50 report uses the same origin throughout: conventional one-based prime rank `r` is dereferenced as zero-based `words[r]`. The finite rival table is:

| r | zero-origin | one-based word r |
|---:|---|---|
|17|THE|ARE|
|18|MAP|THE|
|19|THEIR|MAP|
|20|MEANING|THEIR|
|21|IS|MEANING|
|22|THE|IS|
|23|ROAD|THE|
|24|AND|ROAD|
|28|THE|ARE|
|29|DIRECTION|THE|
|35|FOUND|BE|
|36|GOOD|FOUND|
|39|FALSE|BEWARE|
|40|PATHS|FALSE|

Therefore THE MAP, THE ROAD, IS, AND, DIRECTION, BEWARE FALSE PATHS and the p29 THE ROAD echo are all conditional on the same zero-origin choice. Phrase quality cannot independently select that origin without circularity.

## Origin-invariant numerical scaffold does not break the tie

A later adversarial census by Agent9 strips the English labels back off and freezes only the observed numerical shape. For every start rank `k=1..35`, both vertical orientations and both horizontal orientations, it asks for:

1. four consecutive cells in one column carrying ranks `k, k+1, k+2, k+7`;
2. continuing from the `k+2` cell in the same vertical direction by exactly `k+3` rows reaches rank `k+4`;
3. that row contains adjacent ordered ranks `k+5, k+6`;
4. **each required cell may independently use either base59 or base60**, so the census does not privilege the observed codec assignment.

There is exactly **one** hit in the complete 32×8 table:

```text
k = 17
vertical: (27,3) -> (26,3) -> (25,3) -> (24,3)
ranks:       17        18        19        24
distance: rank19 cell -> 20 rows north -> (5,3) rank21
row5: (5,0) rank22 -> (5,1) rank23
```

Thus the table really does contain an origin-independent self-indexed **17..24 numerical scaffold**, with20 represented by the physical distance. This is a post-discovery exact-shape census, not a familywise discovery p-value, but it means the geometry itself is not created solely by choosing English words.


## Signed-source hard wrap gives a local zero-origin preference

The byte-preserved signed message contains one additional source feature that was not charged in the original #3354 origin audit: its physical hard wrap falls exactly between zero-based source indices19 and20.

The relevant signed bytes are:

```text
Liber Primus is the way.  Its words are the map, their 
meaning is the road, and their numbers are the direction.
```

With the same 43-word alphabetic tokenization used above, the first line is source indices9..19 and ends on **THEIR**; the second begins at index20 **MEANING**. The lines are 55 and57 characters respectively.

This aligns with the unusual representation change inside the unique p50 17..24 scaffold. The table supplies ranks17,18,19 as direct prime-rank cells; there is no rank20 cell on the fixed THEIR→ROAD support segment, so integer20 is instead supplied by the **20-edge geometric distance**; direct rank cells resume at21,22,23,24. Therefore:

```text
zero origin:
  direct 17..19       | distance20 + direct21..24
  THE MAP THEIR       | MEANING IS THE ROAD AND
                       ^
                       signed hard wrap

one-based words:
  direct ranks17..19  | distance20 + direct21..24
  ARE THE MAP         | THEIR MEANING IS THE ROAD
              ^
              operation switch is inside the signed line
```

Among the two conventional origins already admitted by #3354, only zero origin puts the independently existing source line boundary on the p50 operation-type boundary. This is a **local source preference for zero origin inside this scaffold**.

It is not a general first-party indexing convention. The wrap is plausibly typographic: the first line is already 55 characters including its trailing space, and appending `meaning` would make it62 characters, consistent with an ordinary roughly-60-column hard wrap. The observation was also made after the scaffold was known. It therefore does not restore DIRECTION29→p29, ROAD23, or any ciphertext receiver by itself; it narrows the origin evidence from a perfect tie to a source-local preference that needs another independent discriminator.

[Reproducer](../sims/lp2_p50_signed_hardwrap_origin_sft.cjs) parses the exact committed signed bytes, proves the 19→20 hard-wrap boundary, reconstructs the direct/direct/direct/distance/direct scaffold type sequence from the original p50 grid, and asserts that the one-based rival places the same operation switch after MAP instead.


## Chronological post-gate p41/p42 selector control also favors zero origin

A second origin discriminator became available **after** #3354 closed. The origin gate closed at 2026-11-28 07:40:06Z. The later p41 VERIFY receiver was committed at 08:50:41Z (`bb414a6b574faf5e806e79aebd29776e601915af`) and the p42 OPENPGP selector at 08:52:47Z (`3f394505b4d6f066390e472c24a88fc741f88b39`). Those structures therefore were not evidence used to construct the original origin decision.

Freeze the two direct-number rivals without looking at target rune values:

- **zero origin:** authenticated source index `i` selects project page `p_i`; local canonical ordinal is the human ordinal `i+1`;
- **one-based:** authenticated human ordinal `i+1` selects project page `p_(i+1)`; local canonical ordinal remains `i+1`.

The two later target-blind receiver predicates then separate the rivals before any decryption key is scored:

| Target | zero-origin object | zero predicate | one-based object | one predicate |
|---|---|---|---|---|
| VERIFY, source index41 / ordinal42, GP length6 | p41 ordinal42 = `[27,12,5,0,17,13,19]` | 7 runes, center `F=0`; remove center → length6 | p42 ordinal42 = `[11,13,11]` | length3; fails |
| OPENPGP, source index42 / ordinal43, GP length7 | p42 ordinal43 = `[16,0,14]` | `Hpair=[2,1,0]=[K,1,F]`; +K destination ordinal45 has 8 runes with rune1 F; remove marker → length7 | p43 ordinal43 = `[22,17,8]` | `Hpair=[14,1,17]`; fails |

The `[K,1,F]` selector remains manuscript-unique among canonical complete three-rune words, at p42 ordinal43. The frozen structural score is therefore **2/2 for zero origin and 0/2 for the one-based page-shift rival**, with no comparison to VERIFY or OPENPGP rune values.

This is stronger than the signed hard-wrap coincidence because it is ciphertext-side and chronological post-gate evidence. It is still **not an origin-blind holdout**: both later investigations followed the already popular zero-origin numbered route, and their selector grammars were discovered on those zero-origin pages. The result is consequently a finite consistency audit, not a valid familywise p-value or a first-party indexing instruction. It strengthens zero origin as the leading working interpretation but does not by itself restore DIRECTION29→p29 or establish the fitted VERIFY/OPENPGP words as unknown plaintext.

[Reproducer](lp2-p41-p42-zero-origin-chronological-selector-control.md) and [SFT](../sims/lp2_p41_p42_zero_origin_selector_control_sft.cjs).

That unique interval has one further origin-invariant consequence. Zero-origin indices17..24 read **THE MAP THEIR MEANING IS THE ROAD AND**; one-based words17..24 read **ARE THE MAP THEIR MEANING IS THE ROAD**. Their longest common contiguous overlap is seven words: **THE MAP THEIR MEANING IS THE ROAD**. Therefore #3354 rejects the exact endpoint/rank labels and DIRECTION29 handoff, but it does **not** erase this seven-word signed-clause core. [Reproducer](../sims/lp2_p50_origin_invariant_maproad_overlap_sft.cjs).

The same scaffold has an origin-free checksum into the independently observed warning-rank chain:

```text
rank17 at row27: distance to row5 = 22; 17+22 = 39
rank18 at row26: distance to row5 = 21; 18+21 = 39
rank19 at row25: distance to row5 = 20; 19+20 = 39
```

Rank39 is the shared rank of the separate base60 consecutive-rank structure `38→39→40` (cells126→182 and cells2→26 in the prime-valued physical-line census). Thus the MAP/ROAD scaffold and the warning-chain scaffold meet numerically at **39** without any signed-word lookup. This equality follows from the already discovered row spacing, so it is a structural checksum rather than an additional independent p-value.

Crucially, the stronger numeric structure still does **not** select the textual origin. The same rank interval overlaps a coherent clause under both conventions:

```text
zero-origin 17..24: THE MAP THEIR MEANING IS THE ROAD AND
one-based   17..24: ARE THE MAP THEIR MEANING IS THE ROAD
```

The signed phrase “their numbers are the direction” also fails to break the tie in a surprisingly symmetric way:

- under zero origin, ROAD is index **23**; `p50[23]=1R`, naturally “one right”, matching the observed rank22→23 ROAD edge from cell40 to cell41;
- under one-based numbering, ROAD is word **24**; `p50[24]=1n`, naturally “one north”, matching the one-based MAP(rank19 at cell203) → ROAD(rank24 at cell195) adjacent north step.

So the two plausible origins each obtain a locally self-consistent ROAD direction from the corresponding ROAD number. This is evidence for a deliberately structured numerical region, but **does not choose the origin by itself**. The cross-page test below supplies a separate discriminator; the local `1R` versus `1n` pair is retained as a genuine competing signal rather than being used to choose an origin.

A whole-table control also rejects turning this local observation into a general word-number movement decoder. Freeze the same minimal token grammar used by the navigation experiments — a positive decimal digit followed by one of `N/S/E/W/L/R/U/D`, case-insensitive. There are **60/256** matching cells in the full table and **12/43** among addresses0..42 corresponding to the 43 signed-word-number slots. Under the exact hypergeometric null that uniformly chooses 43 cells from the fixed 256-cell token multiset, the expected count is **10.078125** and `P(X >= 12) = 0.2821018581`. The signed-register address band is therefore **not enriched** for movement-looking tokens. Preserve the specific ROAD23/ROAD24 duality as local geometry; do not promote it to “all word numbers are opcodes.”

## Cross-page ROAD-radix test prefers zero origin

The p27 red13/DH route supplies a discriminator that was established independently of the signed-word-origin question. Its charged pointer family starts at the independently selected cell186, tests both live radices, both directions and every signed public value `{2,5,8,19,23}` as a first-arrival count, and has exactly one original-table hit: **base59 forward at 8**, reaching the independently selected endpoint189. The corresponding base60 eight-hop path ends at0.

The two signed-word origins assign ROAD to different members of the origin-invariant p50 scaffold, and those two anchors have opposite radix specificity:

```text
zero-origin ROAD = rank23, cell41 = 1O
  base59: 83 = ordinary prime #23
  base60: 84 = composite
  ROAD-selected radix -> base59

one-based ROAD = word24 / rank24, cell195 = 1T
  base59: 88 = composite
  base60: 89 = ordinary prime #24
  ROAD-selected radix -> base60
```

Now hold the already selected p27 start cell186 and the signed server-public count8 fixed, and let each ROAD hypothesis choose the radix supplied by its own scaffold anchor:

```text
zero-origin / ROAD23 / base59:
  186 -> 19 -> 33 -> 112 -> 72 -> 161 -> 214 -> 247 -> 189
  result: reaches the independent p27 endpoint189

one-based / ROAD24 / base60:
  186 -> 19 -> 33 -> 114 -> 197 -> 115 -> 247 -> 192 -> 0
  result: misses189
```

This is a **cross-page local preference for zero-origin signed-word numbering**. Unlike the hard-wrap observation, the pointer/radix fact comes from a separately frozen p27 source family and does not depend on the 2016 word numbering. It also explains a creator-facing reading of the authenticated sentence: the word ROAD labels the radix used for the pointer traversal.

The evidentiary boundary remains important. “ROAD labels the pointer radix” is a semantic interpretation inferred after both structures were known; the signed 2016 prose still does not publish an index origin. The one-based ROAD24→`1n` local movement remains real, and DIRECTION29→p29 therefore remains conditional. The result promotes zero origin from a near-tie to the **stronger working hypothesis**, not to an authenticated universal indexing convention.

[Reproducer](../sims/lp2_p50_signed_origin_road_radix_gate_sft.cjs) charges the two origin hypotheses directly and verifies both pointer paths against the original table.

## Historical controls

The Cicada-signed 2012 payload at `im-results/2012-845145127/162667212858-image-payload.asc` contains human book coordinates including `1:29` and `1:1`. A pinned later reconstruction at `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3` shows source-dependent origins: Britannica helper blob `13e829bae40bcd5fb51e89702668739968d05699` leaves its first coordinate un-decremented relative to the CICADA anchor but decrements the second; Agrippa helper blob `611aeafdaf002e087949f3ac1eab70d20a03ee45` decrements both. These helpers are community reconstructions, not Cicada-authored code; their bounded evidentiary value is that the same puzzle used context-specific origin conventions.

The closer 2014 signed Self-Reliance book code (`zN4h51m.jpg.asc`, blob `1f9a61b97d5de9c4ca57402c064365a503d956a9`) uses paragraph:sentence:word:letter coordinates. Its successful pinned helper `book-code.py` (blob `96a9b2dabcab8927fdbb2130b4538d162a37354e`) subtracts one from **all four** coordinates. Again the helper is later reconstruction, but this is the closest preserved textual-word coordinate and it is one-based.

The 2016 signed prose has no array syntax, index-zero marker or coordinate tuple. The OpenPGP key ID supplies hexadecimal notation, not a textual-index origin.

## Consequence

Preserve the p50 alphabets, base59/base60 values, prime ranks, adjacency/support geometry, the unique origin-invariant 17..24 numerical scaffold, its seven-word origin-invariant source overlap **THE MAP THEIR MEANING IS THE ROAD**, cell43 `1D` and its numeric values, and finite token censuses. Exact origin-specific signed-message rank↔word labels, including DIRECTION29→p29 and ROAD23/ROAD24 **word-number** labeling, remain hypotheses rather than authenticated coordinates. However, zero origin is now the stronger working interpretation for two materially different reasons: the signed hard wrap aligns with the scaffold's direct-cell→distance switch, and the independently frozen p27 pointer family selects base59 forward-at8, matching the zero-origin ROAD23 anchor's unique radix and rejecting the one-based ROAD24/base60 rival at the same fixed start/count. Neither observation is a published indexing rule, so DIRECTION29 remains conditional.

A later finite address-origin audit separates the narrower cell186 movement consequence from that text-origin failure. The unique numeric scaffold itself contains rank24 at cell195; no English label is needed to obtain that rank. Charging the two conventional table-address origins, zero-based address24 gives `1n → 1L → cell186 = 0J = 19`, while one-based address23 gives `1R → 2u → cell180` and no DH-state endpoint. Across all seven cell anchors of the scaffold and both origins, only the zero-address rank24 branch reaches the independently preselected p27/DH cell186 and public value B=19; the result is unchanged whether L/R are treated as relative turns or absolute left/right. This selects **zero-based p50 table addressing inside the already declared movement grammar**, not zero-based 2016 word indexing, DIRECTION29, or a ciphertext decoder. See [the address-origin gate](lp2-p50-scaffold-address-origin-dh19-gate.md).

Issue #3347 must not treat DIRECTION29 as source-supported navigation unless a first-party clue fixes the register origin.

## Reproduction

Run `node sims/lp2_p50_signed_register_origin_sft.cjs`. It parses the committed signed 2016 message, asserts the 43-word rival table, proves line-local29 impossible, checks the local signed 2012 coordinate markers, reconstructs the original 256-cell table, exhaustively proves the unique k=17 numerical scaffold even when every required cell may choose either live radix, and verifies the ROAD23→1R / ROAD24→1n dual-origin direction readouts. `lp2_p50_signed_hardwrap_origin_sft.cjs` reproduces the exact signed-byte line boundary and its alignment with the rank19→distance20 representation switch. `lp2_p50_signed_origin_road_radix_gate_sft.cjs` charges the new ROAD-radix cross-page discriminator and verifies base59 186→189 versus base60 186→0 at the fixed eight-hop count.

Pinned reconstruction: `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`; 2012 README blob `96c7d5ddc613fa9b26c3007fecd9072937802c2e`; 2014 README blob `7f2f414d13fa964d54cd1fdd5823f623e32c0059`.
