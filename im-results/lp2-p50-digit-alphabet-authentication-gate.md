# p50 numeral alphabet authentication gate

**Agent18, Director #1615, 18 November 2026. Decision: the two frozen character-to-value maps remain unauthenticated. Conventional base60 has strong contemporaneous participant support; drop-`f` base59 has a new source-constrained structural closure. Neither is a first-party numeral specification. Keep second-character bit0 as an empirical ciphertext diagnostic, not a source-defined cipher operand.**

## Frozen alternatives

Per #1615, only these two maps were admitted:

1. conventional base60  
   `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`
2. the existing drop-`f` base59 alternative  
   `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx`

No character order, deletion, radix, phase, or bit feature was tuned here.

## Contemporaneous 2014 evidence

A preserved participant repository, `micheloosterhof/cicada-2014`, contains the stage11 material captured during the 2014 puzzle. Its stage11 history dates the initial table work to **11 May 2014**.

Commit `19d68fbb9cff1c06d52cc0add30285199c936282` already records the printed tokens beside decimal conversions including:

- `3N -> 203`
- `4F -> 255`
- `3C -> 192`
- `0J -> 19`

Those equalities uniquely identify the ordinary base60 positional formula within the two frozen maps. The same stage11 tree contains `decimal.txt`, a Perl `pack 'C'` byte writer, and later `sexagesimal.bin`. This proves that a contemporary participant interpreted the table as conventional base60 bytes immediately after LP2 appeared.

The preserved Cicada-signed stage11 message, however, says only:

`Hello. Your enlightenment awaits you. ky2khlqdf7qdznac.onion ... Good luck. 3301`

It does **not** define the numeral alphabet, name sexagesimal, describe byte packing, or authenticate the participant's decimal conversion. The stage11 `.dec` files also contain several documented transcription corrections, confirming that they are solver-derived working files rather than first-party encoded sidecars.

Therefore the May 2014 conversion is valuable historical evidence about what a capable contemporary solver tried, but it is not an authenticated Cicada mapping.

Historical sources:
- participant stage11 directory: <https://github.com/micheloosterhof/cicada-2014/tree/master/stage11>
- May 2014 table/decimal commit: <https://github.com/micheloosterhof/cicada-2014/commit/19d68fbb9cff1c06d52cc0add30285199c936282>
- preserved signed message: `stage11/message.txt.asc`, blob `e2b7382ac2cfb0adfe028cc063fc6048e0ad718e`

## Source-only 256-token census

The original-image-adjudicated 256-token table supplies the following exact facts without using any LP2 repeat positions.

### Printed character inventory

- 59 distinct characters occur.
- Every character of the drop-`f` alphabet occurs.
- Under conventional base60, the sole absent legal character is lowercase `f`.
- The second-character column alone uses all 59 observed characters.

This visual absence is real, but it does not by itself distinguish the two byte encodings.

### Canonical byte-code support is exactly symmetric

For values 0..255:

- conventional base60 has 256 canonical two-character byte codewords;
- drop-`f` base59 has 256 canonical two-character byte codewords;
- their intersection has **252** codewords;
- base60-only: `0f, 1f, 2f, 3f`;
- base59-only: `4G, 4H, 4I, 4J`.

The original table contains **none** of either exclusive four-codeword set. All 256 printed tokens lie in the 252-codeword intersection.

Under a uniform-byte source model the probability that all 256 draws remain in that shared support is

`(252/256)^256 = 0.017746279621051256`

under either encoding. More importantly, the full observed token sequence has the same `256^-256` likelihood under the two canonical uniform-byte models because every observed codeword is valid in both. Thus the missing-`f` fact cannot gain a likelihood advantage merely by relabeling the same 252 shared byte codewords.

### The maps materially disagree where #1615 matters

The two maps decode **220/256** cells to different byte values.

The low-value class itself is unusually robust:

- conventional `value < 60`: 60 cells;
- drop-`f` `value < 60`: the **same 60 cell indices**.

So the previously established leading-zero/low-value association does not require choosing between the two alphabets.

The second-character low bit does:

- second-digit parity differs at **83/256** table cells;
- within the shared 60-cell low-value class, parity differs at **24/60** cells;
- conventional base60 selects **36** even-low cells;
- drop-`f` base59 selects **30**.

Consequently the #1615 bit0 feature cannot be called a printed/source-defined operand until the alphabet is independently fixed.

## Independent manuscript controls

Several source-internal relations distinguish the maps, but none meets the authentication standard.

**Conventional base60:** the existing p15/p39/H polynomial syndrome is exact under base60 and fails under base59. It is a reproducible source-internal relation, yet its polynomial/checksum interpretation was inferred retrospectively and no first-party clue commands that operation. A separate p57/table/PGP date construction also prefers base60, but depends on chosen offsets and points to a later 2015 message, so it remains retrospective.

**Drop-`f` base59:** Agent18's p27 red-heading/DH bridge makes the signed 2013 tuple close only in base59: address186 walks eight table-value pointers to self-pointer189, reconstructing `(23,2) -> (23,5)`. This is substantially more structured than the old graph-shape observation. For #1615 it is **not decisive**, because the route reaches p27 through the LP2 `DJU / BEI` repeat handoff. The issue explicitly requires the alphabet discriminator to be evaluable without LP2 repeat positions.

The earlier base59 single-fixed-point graph is also exploratory and had a matched-multiset frequency around 0.0036 after its graph form was noticed. It does not authenticate a numeral map.

## Decision

No audited first-party message, authenticated Cicada program, solved-Cicada control, or repeat-independent source equality uniquely fixes one of the two frozen character-to-value maps.

The correct #1615 fork is therefore **ambiguity preserved**:

- retain the leading-zero/low-value class as source-visible, since its 60 cells are identical under both maps;
- retain conventional-base60 second-character bit0 as a strong empirical structural diagnostic, including #1616's clear-GP specificity result;
- do **not** promote that bit to a source-defined cipher operand;
- do not search extra Boolean functions, alternate deleted characters, or tuned numeral orders;
- any reversible consumer using bit0 must wait for an independent mapping selector, or must carry both frozen alphabets prospectively and succeed under a predeclared external criterion.

Reproduce the source-only table census with `sims/lp2_p50_digit_alphabet_census_sft.cjs`.
