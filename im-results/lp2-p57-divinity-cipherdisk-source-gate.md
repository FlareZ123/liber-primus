# P57 “circumferences / DIVINITY within” as a bounded GP29 cipher-disk gate

**Agent9 · 18 November 2026 · independent source-led exploration. Status: finite original-input negative; no unknown plaintext, key, mechanism or destination recovered.**

## Human-solver premise

The already-clear physical p57 PARABLE says, in sequence, “LIKE THE INSTAR TUNNELING TO THE SURFACE”, “WE MUST SHED OUR OWN CIRCUMFERENCES”, and “FIND THE DIVINITY WITHIN AND EMERGE”. Literal first/last-rune word shedding, recursive word cores and direct `DIVINITY` Vigenere transfers have already been tested elsewhere in this repository. This test asks a materially different question: whether **circumferences** describes two concentric cipher alphabets and **DIVINITY within** supplies the inner alphabet.

That reading is historically executable. Classical cipher disks use concentric alphabets with a movable inner disk; Alberti-style operation can also use visible signal letters to select new alignments. This is a clue interpretation, not evidence that Cicada selected Alberti.

Use only source-authenticated GP material:

- outer ring: the ordinary 29-symbol Gematria Primus order;
- inner ring: GP-normalized `DIVINITY = DIUINITY`, duplicates removed in first-occurrence order, followed by every still-unused GP symbol in ordinary source order;
- resulting exact inner ring: `D I U N T Y F TH O R C G W H J EO P X S B E M L NG OE A AE IA EA`;
- original unknown input: all 12,956 p0-p55 GP29 runes;
- language control: the repository's pinned Shakespeare GP29 register, using the same QU/V/K/Q/Z and ING/IO transliteration conventions as existing controls.

No candidate output is used to choose a keyword, alphabet, period, page, word, or reset position.

## Gate 1: one-cell progressive disk

The cheapest complete progressive interpretation rotates the inner disk by exactly one cell after every rune. Exhaust the whole finite family produced by the source wheel:

- normal or reversed inner-wheel orientation;
- clockwise or counter-clockwise one-cell motion;
- all 29 initial alignments.

That is exactly **116** variants. The best original-cipher output is normal inner order, +1 motion, initial alignment 18, with Shakespeare GP29 bigram mean log score **-4.526777268280663**. Its first 80 transliterated GP symbols begin:

`FDFTEIAOINGWNGDNCJWNGFWTEAOEAELWIARNUGAEITHNNTHSRNXMTHAEPSIANWEATPDCGSURIBIALXAEOENIMRACOESAUHPAOEAG`

The four source-zero-alignment orientation/direction variants score **-4.540874 to -4.572993**. Three independent 12,956-rune native-GP windows score **-2.595309 to -2.628453** under the identical model. The gap is large and the candidate output is nonprose.

The reproducer forward-encrypts a 12,956-rune native-GP plant under the same progressive disk and recovers **12,956/12,956** runes exactly.

## Gate 2: original red spans as Alberti-style signals

A historically closer interpretation uses a visible symbol to reset disk alignment. The exact original ink annotation has **16 red-span starts on p0-p55**. Freeze each first red rune as the outer-ring signal, omit that signal rune from the candidate plaintext, and hold the resulting alignment until the next red span. For the inner-ring index symbol, test only the six distinct symbols actually supplied by `DIUINITY`: `D I U N T Y`. With two wheel orientations this is **12** variants, not a free alphabet search.

The best result is normal inner order with index `Y`, score **-4.541535049097408** across 12,940 decoded runes. The more literal index `D` scores **-4.546996665179601** in normal orientation and **-4.564339101364694** reversed. The best candidate begins:

`DUENGTHHTEASURLBANGWTACEPBPUOEFGEACAEJREOPWNGJBDFPHYFPAEABGRSIAFIYUHTIANGTEAYXTYEORSRIAHSDFEONGEYRWBJWDIABYNGSTRLABGTHJRJ`

Again this is far below the native-GP control and yields no sustained readable passage. A source-position-preserving positive plant uses the same 16 original signal values and positions and recovers **12,940/12,940** planted plaintext runes.

## Decision

Retire these two exact source-motivated cipher-disk readings:

1. GP outer ring + `DIUINITY` inner ring + one-cell progressive motion;
2. the same ring pair with original red-span starts as alignment signals and a `DIUINITY` index symbol.

The negative does **not** cover an arbitrary keyed wheel, tuned rotation period, p50-derived schedule, Chaocipher-like alphabet mutation, or a freely invented signal grammar. Those would introduce new operands absent from this clue and should not be searched merely to rescue the disk metaphor. Reopen only if an independent first-party source specifies a different disk schedule, alphabet construction, or signal rule.

Reproduce with [`sims/lp2_p57_divinity_cipherdisk_sft.cjs`](../sims/lp2_p57_divinity_cipherdisk_sft.cjs). It reads only the canonical original corpus, original ink annotations and pinned Shakespeare control; it asserts all variant counts, exact best scores and two full positive round trips.
