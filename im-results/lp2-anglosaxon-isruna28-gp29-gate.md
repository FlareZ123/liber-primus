# Anglo-Saxon cipher-rune bridge: fixed 28-row versus full 32-row

**Agent16 · 27 November 2026. Classification: historically bounded operand narrowing. No unknown LP2 plaintext/key recovered.**

## Two distinct pre-2014 English coordinate witnesses

### 1. Salzburg Isruna: registration fixed, alphabet stops at 28

René Derolez, *Runica Manuscripta: The English Tradition* (1954), critically edits the Isruna-tract witnesses. Salzburg St Peter a IX 32 explicitly divides the runic row into **four ordines of 8, 8, 8, and 4 runes**, with group first and position second. Its worked `RACCO` example is:

`1/5  4/1  1/6  1/6  1/4 = R A C C O`.

This fixes the natural rows:

| group | positions |
|---:|---|
| 1 | F U TH O R C G W |
| 2 | H N I J EO P X S |
| 3 | T B E M L NG OE D |
| 4 | A AE Y EA |

The 28 symbols match 28 GP symbols in exact relative order. GP's IA/Ior is the only missing member. Under this **source-fixed** registration, p0 `3|3 = E`, not first-black TH.

### 2. Hackness/Sermon: full 32-symbol coverage, registration not fixed

Richard Sermon, “The Use of Permutations to Explain the Hackness Cross Tree Rune Inscription” (CAA 2001), describes the Hackness tree runes as four groups of eight and prints a **32-symbol Anglo-Saxon futhorc**. Its natural rows are:

| natural futhorc row | positions |
|---:|---|
| 1 | F U TH O R C G W |
| 2 | H N I J EO P X S |
| 3 | T B E M L NG OE D |
| 4 | A AE Y EA IO CALC GAR CWEORTH |

Thus the Hackness reconstruction **does contain every GP29 symbol** if GP `IA` is identified with historical Ior/`IO`; it also contains three extra English runes.

However Sermon explicitly states that the mapping from the four observed tree-rune groups to the four futhorc rows is unknown, producing **24 group permutations**. Alphabet coverage is therefore not the same as a fixed decoder.

Sermon's preferred permutation 19 can be recovered from his eight legible-coordinate output. The coordinates

`4/8, 4/2, 2/4, 3/8, 1/1, 3/5, 2/4, 3/2`

decode to `D B O S A E O N`, which implies observed tree groups map to natural futhorc rows:

`[1,2,3,4] -> [4,1,2,3]`.

Under that historically argued registration, p0 `3|3` maps to natural row 2 position 3 = **I**. Under the unpermuted natural registration it maps to **E**. Neither gives TH.

## Corrected state of the p0 bridge

The earlier wording “the English system is missing only IA” was incomplete. The precise situation is:

- **Salzburg/Derolez:** group registration is fixed and historically controlled, but the coordinate alphabet has only 28 runes and omits Ior/IA.
- **Hackness/Sermon:** the 32-symbol alphabet covers all GP29 symbols, including Ior/IO, but the observed tree-group → futhorc-row registration is underdetermined 24 ways; the preferred Bosa permutation is an interpretation of a damaged inscription, not a source-fixed general key.
- **Scandinavian 6:5:5:** a distinct historical convention, with the Rotbrunna worked control, gives p0 `3|3 = TH` under its own reversed group rule.

Do not splice the Salzburg fixed row assignment to Sermon's later 32-symbol row, and do not treat Sermon's natural row order as the uniquely historical Hackness tree-group key. Either move silently supplies the missing operand.

## Search decision

The bounded pre-May-2014 search therefore does **not** produce the issue's required full English coordinate receiver: one witness fixes the row registration but lacks IA, while the witness with full GP coverage does not fix row registration. This is a much narrower obstruction than “no 29-symbol historical table exists.”

A valid successor needs one independently documented rule that does both at once: fixes the tree-group registration **and** includes Ior/IA in that registered alphabet. Absent that, English p0 `3|3` remains E/I/etc. under competing historical registrations and cannot be promoted to the black TH crib.

## Reproduction

`sims/lp2_anglosaxon_isruna28_gp29_gate.cjs`

Sources:
- René Derolez, *Runica Manuscripta: The English Tradition* (1954), Isruna tract and Salzburg `RACCO` example.
- Richard Sermon, “The Use of Permutations to Explain the Hackness Cross Tree Rune Inscription,” CAA 2001, esp. pp. 521–526, Figures 2, 4, 5 and Table 5.
