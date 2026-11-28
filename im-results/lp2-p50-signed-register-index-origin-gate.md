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

So the two plausible origins each obtain a locally self-consistent ROAD direction from the corresponding ROAD number. This is evidence for a deliberately structured numerical region, but **not** evidence that zero origin wins. Do not use `1R` versus `1n` to choose an origin without another first-party discriminator.

A whole-table control also rejects turning this local observation into a general word-number movement decoder. Freeze the same minimal token grammar used by the navigation experiments — a positive decimal digit followed by one of `N/S/E/W/L/R/U/D`, case-insensitive. There are **60/256** matching cells in the full table and **12/43** among addresses0..42 corresponding to the 43 signed-word-number slots. Under the exact hypergeometric null that uniformly chooses 43 cells from the fixed 256-cell token multiset, the expected count is **10.078125** and `P(X >= 12) = 0.2821018581`. The signed-register address band is therefore **not enriched** for movement-looking tokens. Preserve the specific ROAD23/ROAD24 duality as local geometry; do not promote it to “all word numbers are opcodes.”

## Historical controls

The Cicada-signed 2012 payload at `im-results/2012-845145127/162667212858-image-payload.asc` contains human book coordinates including `1:29` and `1:1`. A pinned later reconstruction at `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3` shows source-dependent origins: Britannica helper blob `13e829bae40bcd5fb51e89702668739968d05699` leaves its first coordinate un-decremented relative to the CICADA anchor but decrements the second; Agrippa helper blob `611aeafdaf002e087949f3ac1eab70d20a03ee45` decrements both. These helpers are community reconstructions, not Cicada-authored code; their bounded evidentiary value is that the same puzzle used context-specific origin conventions.

The closer 2014 signed Self-Reliance book code (`zN4h51m.jpg.asc`, blob `1f9a61b97d5de9c4ca57402c064365a503d956a9`) uses paragraph:sentence:word:letter coordinates. Its successful pinned helper `book-code.py` (blob `96a9b2dabcab8927fdbb2130b4538d162a37354e`) subtracts one from **all four** coordinates. Again the helper is later reconstruction, but this is the closest preserved textual-word coordinate and it is one-based.

The 2016 signed prose has no array syntax, index-zero marker or coordinate tuple. The OpenPGP key ID supplies hexadecimal notation, not a textual-index origin.

## Consequence

Preserve the p50 alphabets, base59/base60 values, prime ranks, adjacency/support geometry, the unique origin-invariant 17..24 numerical scaffold, its seven-word origin-invariant source overlap **THE MAP THEIR MEANING IS THE ROAD**, cell43 `1D` and its numeric values, and finite token censuses. Downgrade every exact origin-specific signed-message rank↔word label, plus DIRECTION29→p29, ROAD23/ROAD24 numbering, cell186 and downstream navigation, to a **conditional origin hypothesis**. The new `ROAD23→1R` / `ROAD24→1n` duality explicitly shows that the directional-token readout does not resolve the origin.

Issue #3347 must not treat DIRECTION29 as source-supported navigation unless a first-party clue fixes the register origin.

## Reproduction

Run `node sims/lp2_p50_signed_register_origin_sft.cjs`. It parses the committed signed 2016 message, asserts the 43-word rival table, proves line-local29 impossible, checks the local signed 2012 coordinate markers, reconstructs the original 256-cell table, exhaustively proves the unique k=17 numerical scaffold even when every required cell may choose either live radix, and verifies the ROAD23→1R / ROAD24→1n dual-origin direction readouts.

Pinned reconstruction: `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`; 2012 README blob `96c7d5ddc613fa9b26c3007fecd9072937802c2e`; 2014 README blob `7f2f414d13fa964d54cd1fdd5823f623e32c0059`.
