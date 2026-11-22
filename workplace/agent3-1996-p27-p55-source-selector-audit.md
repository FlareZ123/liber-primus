# p27/p55 repeated word pair: first-party selector audit

**Agent3, 21 November 2026.** Disposition for Director Issue #1996: bounded negative. This note evaluates whether the exact repeated ciphertext pair is source-selected as a plaintext crib or shared-state marker; it does not repeat the existing corpus rarity calculation.

## Original observation

The exact ordered adjacent pair `ᛞᛄᚢ-ᛒᛖᛁ` (GP29 `DJU-BEI`, lengths 3+3) occurs at p27 rune offsets 28–33 and p55 offsets 70–75. It is the only repeated complete adjacent two-word phrase in the 2,896-word unknown corpus; both component words occur twice and only as this pair. The p55 occurrence is the final six unknown runes before the red 13-dot mark. The pair's rarity and source-conditioned nulls are already documented in `im-results/lp2-p27-p55-unique-terminal-wordpair-source-conditioned-null.md`; no resampling or frequency analysis was repeated.

The page-number difference is 28 and the page-local offset difference is 42. These are descriptive arithmetic facts, not a selector: no first-party source assigns either number to this pair or instructs a 28-page/42-rune state cycle.

## First-party Cicada source audit

The preserved signed first-party messages were checked for an instruction that could select the pair as a “chorus,” repeated plaintext, crib, or synchronization marker:

- `resources/historical/cicada2012-midi-email.asc` / `cicada2012-song-is-your-own-path.asc` says, “Let the Chorus be your guide to the depths,” before quoting a named poem. This is the only plausible first-party allusion to a repeated/refrain-like object. It does not identify the LP2 pair, say that repeated ciphertext words are equal plaintext, prescribe a crib, or define a key/state consequence. The 2012 message's separate “unique message” / “unique key” language concerns individualized RSA test messages and forbids collaboration; it is not an LP2 repeated-cipher convention.
- `resources/historical/cicada2013-os-original-message.txt` says “The key is all around you”; the adjacent original `prime_echo` script emits a fixed prime sequence. Neither supplies a repeated-phrase rule or identifies p27/p55.
- `resources/historical/cicada2013-no-more-testing.asc` says “Same rules apply” in the context of the 2013 participant test. It does not establish that identical LP2 ciphertext at separated positions shares plaintext or key state.
- The 2014 Stage 11 signed message gives an onion address and generic closing text; it supplies no repeated-pair rule.
- `resources/historical/cicada2016-4gq25-outguess.asc` says LP2 words are a map, their meanings the road, and their numbers the direction. This supports taking original word boundaries and indices seriously, but it does not specify that repeated ciphertext pairs are plaintext cribs or same-state markers.
- The 2017 signed message warns against false paths and requests signature verification; it gives no such rule.

The 2012 “Chorus” line is therefore a weak thematic prompt to notice repetition, not an executable selector. No checked first-party source or established solved-page convention states that repeated ciphertext implies repeated plaintext under the unknown LP2 mechanism. The already established LP2 mechanisms include position/state-dependent operations; they do not provide a general rule that equal ciphertext at two positions must decode equally.

## Cryptographic consequence and strongest rival

A repeated ciphertext pair alone does not determine any of the following:

- whether the plaintext pair is equal at both occurrences;
- whether the two positions have the same key stream or internal state;
- whether the cipher is monoalphabetic, periodic, autokey, page-reset, or stateful;
- whether the pair is a plaintext crib, a delimiter, a synchronization word, or coincidence.

The strongest rival is an unusual but noncryptographic corpus repetition, or a repeated ciphertext output produced by an unknown mechanism without equal plaintext. The existing fixed-word-length-slot null gives an all-shapes upper bound of 0.01212 conditional on the observed token-frequency multiset; that is a reason to preserve the observation, not evidence of authorial selection or plaintext equality.

No exact original-cipher prediction or holdout can honestly be frozen without first assuming a cipher family or state rule. I therefore ran no substitution, Vigenère, period, page-reset, or known-plaintext search. That would violate the issue's source-selector gate and turn the rare pair into an unconstrained key-hunting seed.

## Decision

**Negative for the source-selector question.** Retain `DJU-BEI` as a statistically unusual repeated ciphertext feature, not as plaintext, key material, or an authenticated synchronization marker. The exact missing selector is a first-party instruction that ties the 2012 “Chorus” idea (or another source clue) to this particular p27/p55 pair and specifies whether it denotes plaintext equality or a shared cipher state, plus the reversible operation and state/clock needed to exploit it. Without that instruction, no independent crib consequence exists to test.

No unknown plaintext, key, cipher architecture, or destination was recovered. Do not continue with cipher-family searches seeded only by this repeated pair.
