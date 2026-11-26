# Source-selector gate for a word-independent periodic crib (#2901)

**Decision: negative at the source-selection gate.** No preserved first-party 2012–2016 source supplies a new plaintext phrase *and* an independent reference to one specific original LP2 page/rune interval. Consequently, no new phrase alignment, periodic-key fit, F-schedule search, or language scoring was run. This is a bounded rejection of the proposed new-source route, not an impossibility claim about LP2 or about transformed/unpreserved quotations.

## Acceptance criterion

A candidate had to satisfy all of the following *before inspecting original ciphertext output*:

1. Be present in a preserved Cicada-authored source with an established authenticity basis.
2. Supply a contiguous phrase long enough to constrain a periodic-key receiver, with spelling and rune rendering fixed from source evidence.
3. Independently select one original LP2 page or exact interval (not merely the book, a theme, a possible picture, or a candidate word found after decoding).
4. Leave a frozen receiver/state and a long untouched continuation that could be tested without choosing among offsets, paraphrases, key phases, or F histories after seeing scores.

The native WELCOME/KOAN controls validate candidate periodic-key mechanics, but they do not provide an LP2 phrase or location. Likewise, an authentic source phrase without an LP2 address is not a crib selector.

## Preserved first-party source audit

| Source | Source wording / visible instruction | What it actually selects | LP2 location result |
|---|---|---|---|
| 2012 signed countdown and one-time RSA message (`resources/historical/cicada2012-countdown-message.asc`, `cicada2012-message-only-displayed.asc`) | “Patience is a virtue”; each participant receives a unique RSA-encrypted message/key and must return the decrypted number | A timed return and participant-specific RSA challenge | No reusable phrase, page, or rune interval |
| 2012 signed MIDI email (`resources/historical/cicada2012-midi-email.asc`) | “This song is your own path”; “Let the Chorus be your guide to the depths” | Inspect the MIDI tracks; note/timing decoding supplies participant-specific instructions and the Blake chorus | The wording selects the 2012 MIDI stage and its chorus, not an LP2 page. The chorus is a donor text already included in the historical book/source investigations |
| 2013 signed forest clue (`resources/historical/cicada2013-forest-clue.asc`) | “You can't see the forest when you're looking at the trees.” | A forest/trees metaphor in the 2013 round | Not unique: LP2 contains repeated tree strips (pp.8–14), p32 tree imagery, and p55 tree imagery. It fixes neither one page nor a rune interval |
| 2013 signed onboarding / onion / ICMP messages (`cicada2013-first-onion-hello.asc`, `cicada2013-if-you-followed.asc`, `cicada2013-no-more-testing.asc`, `cicada2013-second-onion-everything-you-need.asc`, `cicada2013-second-onion-icmp-echo.asc`, `cicada2013-welcome-and-congratulations.asc`) | Repeated greetings; “You already have everything you need to continue”; “knock on the sky and listen to the sound” | Onion-stage progress, participant administration, and the ICMP-ping continuation | No LP2 page or phrase location. The ICMP clue has a source-defined 2013 network consumer, not an LP2 receiver |
| 2013 signed TCP challenge (`resources/external/2013-tcp-server-signed-source.md`) | Explicit BASE29, DH, and NEXT protocol commands | A specified TCP protocol and worked DH example | Authentic operations, but no LP2 address, crib, or consumer |
| 2013 OS message (`resources/historical/cicada2013-os-original-message.txt`) | “The key is all around you.” | Broad contextual hint in a participant-preserved OS extraction | Not a signed source; no specific LP2 location or reversible operation |
| 2014 signed stage messages (`resources/historical/cicada2014-onion5-signed.asc`, `cicada2014-stage09-first-jpeg-recovered.asc`, `cicada2014-sixth-onion-11.jpg.asc`, `cicada2014-stage11-message.asc`) | Stage-specific upload instructions, magic-square submission, and “Your enlightenment awaits you” | The 2014 onion/form workflow | No LP2 phrase or interval. The earlier 2014 GEB book-code solve has explicit coordinates for its own stage; it does not transfer those coordinates to LP2 |
| 2015 signed denial (`resources/historical/cicada2015-planned-parenthood-denial.asc`) | Denial of association with an unrelated group | Public clarification | Not a puzzle instruction |
| 2016 authenticated OutGuess/OpenPGP message (`resources/historical/cicada2016-4gq25-outguess.asc`, archival record `resources/cicada2016-4gq25.md`) | “The path lies empty; epiphany seeks the devoted”; “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction”; “Beware false paths. Verify OpenPGP 7A35090F.” | An authenticated, book-wide semantic clue and signature-verification instruction | No page number, image-to-page binding, word/line coordinate grammar, exact phrase address, key, clock, or inverse. “Words are the map” is not itself a coordinate system |

The repeated “You have done well to come this far” greeting is not a new donor: it occurs in several rounds and has no LP2 selector. The 2012 MIDI/Blake and 2014 GEB material likewise has known stage-specific consumers, not a source-fixed LP2 interval.

## 2016 signed-word / original red-caption matches are already exhausted

The full source-only census is in [the original p0/p15/p33/p40 2016 heading report](lp2-p0-2016-epiphany-title-crib-gate.md). It compares all 43 alphabetic words through OPENPGP in the authenticated 2016 message against all 14 original multiword red spans (13 distinct ordered GP29 word-length patterns). It finds five distinct GP29 phrase-shape matches at six source locations:

| Original red span | Signed 2016 phrase with matching GP29 word lengths | Status |
|---|---|---|
| p0 opening | EPIPHANY SEEKS | Conditional crib; not authenticated plaintext |
| p15 first red line | LIES EMPTY | Shape echo only; not promoted to plaintext |
| p15 second red line | WILL BE FOUND | Conditional candidate tested under the historical receiver; fails |
| p33 first red pair | THE DIRECTION | Shape echo only; not promoted to plaintext |
| p33 second red pair and p40 red pair | ITS WORDS | Repeated shape; not an independent source selector |

The p15 red lines are separate source spans; they must not be concatenated into one signed phrase. Eight red spans have no complete phrase-shape match. A held-out signed-word-order null gives tail frequency **0.060545** for the GP29 register and **0.117799** across the two permitted spelling registers. These are conditional word-order nulls, not authorial-intent probabilities, but they show that the observed shapes do not identify a unique caption or key. The prior DEVOTED / WORDS / READ OUT islands are explicitly excluded by #2901 and add no independent location information.

The most tempting candidate, **EPIPHANY SEEKS** at p0, has already received the relevant exact original-input tests:
- The inferred 13-symbol GP29 additive key fails the historically authentic plaintext-F-transparent receiver at p0 rune57; the original body is not decrypted.
- Agent9's independent #2896 follow-up used the source-visible first black rune TH to restrict a hypothetical body rephase to key phases 8 or 10. The complete all-F-hold phase graph dies at physical p0 offsets 166 and 85 respectively, even after removing all word boundaries. Both 249-rune WELCOME positive controls survive. This closes that conditional rephase rescue; it does not authenticate the title or exclude a different source-selected state transition.
- The other tested provisional captions likewise do not produce a coherent held-out original continuation. The existing report records the exact failures and controls; this invocation did not repeat them.

Thus the 2016 message's candidate phrase family is known and bounded. It does not provide a *new* phrase-location selector for #2901.

## Why the other tempting LP2 references do not pass

- **Forest/tree imagery:** the 2013 forest sentence has several possible LP2 targets. Separately, the 2016 carrier's oak is a different stock illustration from LP2 p32/p55; the resemblance cannot select either page.
- **2012 chorus / Blake:** the MIDI instruction selects the MIDI chorus in the 2012 stage. The completed quote-source work tested Blake and other historically motivated sources against the original LP2 quote spans without finding a qualifying direct quotation. It does not authorize a new global crib search.
- **Road / enlightenment / epiphany language:** these are thematic echoes across 2012, 2014 and 2016 messages, not an exact page or rune coordinate.
- **2013 BASE29/DH/NEXT and ICMP:** these select earlier network operations, not an LP2 recipient. Transferring them without a page-specific instruction would repeat the historical-operation fallacy.

## Existing source and cryptanalytic gates reused

- [#417](https://github.com/FlareZ123/liber-primus/issues/417) completed a finite source-linked negative for the seven original quote spans. [#2349](https://github.com/FlareZ123/liber-primus/issues/2349) was closed as a duplicate after broader attribution work. The seven original intervals total 405 runes; the longer marked spans did not match the tested period-authentic sources under frozen word/GP normalizations.
- The consolidated [pre-2014 quotation attribution report](../im-results/lp2-quotation-pre2014-source-attribution.md) includes period-motivated literary texts, Cicada's 2012 book-code texts, signed-message witnesses, and the available GEB text witness. Its negative applies to those exact sources and direct word-preserving quotations, not every altered or missing source.
- [#2703](https://github.com/FlareZ123/liber-primus/issues/2703) tested a fixed four-tap plaintext FIR on the p42–43 quote candidate and found no original path, while planted native controls recovered their hidden filters. It is not evidence for or against every periodic-key model.
- [#2887](https://github.com/FlareZ123/liber-primus/issues/2887) and #2722 address separate q8/shared-cycle key and inventory hypotheses. Their native controls calibrate those receivers; they do not select a source phrase or LP2 start.
- The existing [historical solve-path contract](../workplace/historical-player-solvepath-operator-contract.md) distinguishes successful clue→operation chains from thematic resemblance: earlier stages supplied a visible trigger, an identified input/parameter set, and a recognizable output. The 2016 message supplies no equivalent LP2 coordinate grammar.

## Decision and next prerequisite

**Close #2901 at the source-selector gate.** No candidate met the four acceptance conditions, so starting a word-independent alignment search would be an unconstrained crib sweep with a large look-elsewhere effect. No original LP2 ciphertext was scored in this invocation; no key, plaintext, or new cipher mechanism is claimed.

Reopen this route only if new first-party evidence supplies both (a) a sufficiently long, fixed phrase or key operand and (b) an independent pointer to one specific original LP2 page/interval (or a source-defined coordinate rule that uniquely computes it), plus a historically motivated reversible receiver. A source-only phrase, thematic image match, or another isolated decoded word is insufficient.
