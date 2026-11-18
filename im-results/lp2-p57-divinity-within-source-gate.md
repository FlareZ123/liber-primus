# p57 DIVINITY-within source gate

**18 November 2026, Agent30. Classification: source-selected bounded negative, with one new exact source object. No unknown LP2 plaintext or authentic key recovered.**

## Source-selected premise

The clear p57 PARABLE ends with the instruction to shed our own circumferences, find the divinity within, and emerge. Applying that operation literally to the printed GP word `DIUINITY` removes its first and last runes and yields the six-rune sequence:

[
[I,U,I,N,I,T] = [10,1,10,9,10,16].
]

This is a unusually constrained candidate because the original unknown ciphertext has a documented word-local lag-six affine echo. The six GP indices sum to **56**, equal to the number of unknown physical pages p0-p55. Separately, stripping the first and last rune from every p57 word gives exactly **55 runes**, equal to the number of rune-bearing unknown pages because p50 contains only the numerical table. These count correspondences motivate direct tests, but do not by themselves establish a cipher.

## Exact direct receivers

The standalone reproducer is [`sims/lp2_p57_divinity_within_source_gate_sft.cjs`](../sims/lp2_p57_divinity_within_source_gate_sft.cjs). It uses the immutable 12,956-rune / 2,896-word corpus and the retained solved p57 source. Dictionary diagnostics use the existing TextBlob-derived GP29 lexicon. Raw ciphertext has IoC **0.03447839786450569**, **199/2,896** dictionary hits, and longest consecutive dictionary run **3**.

### 1. IVINIT as the six-state seed for the existing T6 feedback inverse

The already-defined reversible lag-six model is:

[
C_{w,j}=P_{w,j}+24-2S_{w,j}pmod{29},
]

with (S_{w,j}) equal to the six-symbol seed for (j<6), then (C_{w,j-6}). Using the literal p57 interior `IUINIT` as that seed gives:

- IoC **0.03448262795825052**;
- dictionary hits **189/2,896**;
- longest dictionary run **2**.

The output stays at the near-uniform ciphertext baseline and does not yield readable GP prose. This rejects the source-selected `IUINIT` initializer for that exact T6 feedback architecture.

### 2. IVINIT as a word-reset six-rune additive key

The simpler historical-style GP29 subtraction

[
P_{w,j}=C_{w,j}-K_{jmod6}pmod{29},
qquad K=	ext{IUINIT}
]

gives:

- IoC **0.03447850510631894**;
- dictionary hits **196/2,896**;
- longest dictionary run **3**.

The opposite additive sign gives IoC **0.03445740230062287** and **188/2,896** dictionary hits. Neither direction recovers language. This directly tests the key clock suggested by the clue and the word-local six-rune length without searching phases, rotations or fitted keys.

### 3. All 55 p57 word interiors as one key rune per rune-bearing unknown page

The strict p57 word-interior stream is:

`ARABLICNSTAUNNELURFACUSHEUWIRCUMFERENCEINIUINITITHINMERG`

in GP transliteration, exactly 55 runes. Assigning them in printed order to the 55 rune-bearing unknown physical pages and subtracting each page's fixed key rune gives:

- IoC **0.03446806690316267**;
- dictionary hits **195/2,896**;
- longest dictionary run **2**.

The opposite sign gives IoC **0.03446208519313476**, **190/2,896** hits, and longest run **2**. Cross-page words retain the correct physical-page key on each rune. This direct 55-to-55 receiver therefore fails.

## Decision

The p57 instruction supplies a real, player-visible way to derive both a six-rune `IUINIT` object and a 55-rune word-interior stream. Their lengths line up with two genuine LP2 structures, so they were worth testing without parameter search. The three simplest reversible receivers all remain at ciphertext-like statistics and recover no unknown sentence.

Do not rotate `IUINIT`, add arbitrary phases, or tune the 55 page keys. A continuation is justified only if another original clue specifies a different operation for one of these source-selected registers. Preserve the derived objects because they may become useful operands if such an operation is found.
