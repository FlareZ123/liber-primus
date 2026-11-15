# The p3 red119 SCY/SKY clue as a typed 2014 cipher input

**Agent44, 15 November 2026; Director #982 bounded original-source decision.** A complete, historically motivated, value-changing GP29 inverse on the original p3–7 chapter fails **algebraically** under the historically attested plaintext-F convention. A separately fixed OutGuess candidate on original physical p3 produces only a false-looking extractor artifact. There is **no recovered LP2 unknown plaintext, authenticated ciphertext key, source-selected chapter decoder, or endpoint**.

## First-hand source ink: what a 2014 solver could inspect

The original publication places five unmodified physical image files **20.jpg–24.jpg** on unknown LP2 pp3–7, each with the same **paired, mirrored black scroll decorations**. These margins were previously established as a common printed template, not page-varying key bits: [image template audit](lp2-p3-p7-scrollwork-template-audit.md). The present study inspected p3 `20.jpg`, p6 `23.jpg` and p7 `24.jpg` directly from the maintainer's original-JPEG mirror. Original red-ink annotations supply exact positions:

| Original printed site | Source-visible role | Original GP29 runes | Red 13-dot stops |
| --- | --- | --- | --- |
| physical p3 offsets0–15 | red chapter-opening title, 16 runes | `L J EO H NG C TH T AE J T X H T U OE` | immediately after offset16 |
| physical p3 offsets119–121 | red standalone complete 3-rune word | **`P D TH`** = GP indices `[13,23,2]` | immediately before offset119 and after offset122 |
| physical p6 offsets71–81 | red 11-rune internal heading | `A T X B M G IA S B X EO` | immediately before offset71 and after offset82 |
| physical p7 offsets194–207 | red five-word terminal unit, 14 runes; **sole red four-dot small stop** after local rune200, source event26/global1866, splitting six then eight runes | `D O OE T TH AE · C W J X EA G EA M` | red 13-dot marks immediately before offset194 and after offset208; five filled black dots lower on the page |

These are physical printed offsets; none was chosen by a decrypted candidate. The completed prior [red119 source study](lp2-p3-p39-red119-atbash-sky-udp.md) already established that exactly two isolated complete red three-rune spans exist in the entire unknown book, both at **offset119** on p3 and p39. Applying Cicada's historically solved LP1 rune Atbash `28−r` gives `SCY` on p3 and `UDP` on p39. The label **SCY** can be interpreted as English **SKY** because the GP transliteration uses `C` for both ordinary C/K. This is a real, constrained possible source key, **not newly decoded plaintext**.

Independently, an authentic January 2013 Cicada-signed message says one should **knock on the sky and listen to the sound**. Historically that selected **ICMP ping**, returning an original stream of 28 packet data fragments from a server. It did **not** say to use SKY as a GP29 cipher key on the 2014 manuscript. The original packet route and earlier unsuccessful LP2 consumers are preserved in [the original ICMP reconstruction](2013-icmp-echo-packet-reconstruction.md) and [the prior LP2 ICMP bridge](lp2-2013-icmp28-inkfragment-original-gate.md).

The strongest competing interpretation is therefore a **network/history callback** rather than an alphabetic cipher password. The decorative scrolls offer no unique phase, rotation, key order, or encryption opcode; red p6 and p7 titles themselves are not plaintext under a direct Atbash reading. The following explicit key experiment tests one historically attested cipher transfer without asserting that a source actually selects it.

## The complete original chapter under source-keyed GP29 Vigenère

Use the exact Atbash-derived `SCY` = GP indexes **`[15,5,26]`**, equivalently the GP spelling of SKY, as a repeating Vigenère key on the **whole original p3–7 ciphertext**. The chapter has **1,145** original GP symbols on physical pages `[217,261,263,196,208]`. Source phase zero is its first printed red title rune; continue without reset through p6's rubric and p7's terminal; no guessed ciphertext deletion or word rewriting. The exact historical GP29 decipherment is `P_i=(C_i−K_clock) mod29`; Cicada's solved GP Vigenère and p56 cipher both have the special rule that **plaintext F, GP index0, must be emitted literally as ciphertext F and consumes no key**.

The [original-source standalone CommonJS test](../sims/lp2_p3_red119_sky_strictf_historical_sft.cjs) exhaustively propagates the **complete legal F-skip automaton** across the original chapter. A non-F ciphertext symbol cannot decrypt to plaintext F under this historical emission rule. Although the source has many ciphertext F glyphs deeper into the chapter, the earliest contradiction occurs *before any ciphertext F*, so no skip decision can save the model:

| Fixed original p3 phase | First contradiction, global zero-based | Actual ciphertext glyph | Required pad glyph | Illegal forced plaintext |
| --- | ---: | --- | --- | --- |
| Historical subtraction `C−K` | **20** | `Y` = GP26 | `Y` = GP26 | **F**, but ciphertext is not F |
| Opposite-sign diagnostic `C+K` | **22** | `A` = GP24 | `C` = GP5 | **F**, but ciphertext is not F |

The first 20 original p3 symbols contain **zero ciphertext F**. Therefore the first row is a universal contradiction under **every possible legal plaintext-F interrupt history**, with no need for an English-language scoring judgment. The opposite sign likewise fails before any F. Without the historical literal-F constraint, the all-consuming outputs are nonlinguistic (GP29 IoC **0.034505450881** and **0.034082511375**), far from source-native English in solved Liber Primus. Exact source runes and red spans are asserted against the canonical book and ink annotation.

**Positive control:** exactly **95 source-clear original p57 rune symbols** are forward-encrypted with the same 3-rune key and authentic nonconsuming plaintext-F convention, then reconstructed all **95/95** using their known source F positions. The independent exhaustive F automaton also retains a valid complete path in both sign conventions. Thus the contradiction on physical p3 is due to the original ciphertext rather than an incorrect F-clock implementation.

The result excludes precisely the **source-key SCY full-chapter Vigenère with source phase zero**, in the authenticated historical plaintext-F mode. The GP29 Atbash clue could still be a navigation or protocol hint, and another independently authored operation might apply to p3–7; the source does not identify one.

## The unique red four-dot stop as a restricted p7 source-key handoff

An independent source-image scan now localizes the **single red four-dot diamond stop among all 138 confirmed original small stops**: it is printed inside the last red p7 caption in original image `24.jpg`, after the sixth of its 14 rune symbols, at physical p7 **local rune offset 200 / unknown-book global offset 1,866**, original punctuation event26. The two stop-defined segments have exactly **6 and 8 runes**. The original caption retains **five printed words** with GP lengths **[2,4] . [3,2,3]**, confirmed against the unaltered page transcription. The red stop selects a *sentence boundary and two recipient spans*; it supplies no visual command that selects the cipher algorithm, sign or key.

A source-motivated independent receiver, different from the whole five-page chapter rejected above, can nevertheless be frozen: use the prior p3@119 Atbash `SCY` as the exact repeating three-rune GP29 Vigenère key, now starting at the **first of the fourteen red p7 glyphs**, with the historical subtractive convention `P_i=C_i−SCY[i mod3] mod29`. Both choices for continuing the key or restarting it at the unique red stop are **mathematically identical**, because the stop is at rune6 and the key period is **3**. The stop cannot discriminate a key restart under this particular author-readable key.

The complete original red14 decoder yields the five printed GP word sequences `H.IA | AE.U.Y.EA . M.TH.X | EA.D | N.P.X` with **0/5 native-English GP words** found in the pinned 149,048-token Gibran/Shakespeare/Emerson word vocabulary. The original ciphertext is exactly reciphered by design. A synthetic plant of **five authentic GP English words** of the original [2,4,3,2,3] lengths encrypts and genuinely recovers **14/14 GP runes**, preserving both the red-stop placement and all five printed word lengths. The full exact original and source-native positive tests passed Windows Node22: [original-scoped SFT](../sims/lp2_p7_unique_redstop_scy_keyhandoff_sft.cjs), [successful run 43667692961](https://github.com/FlareZ123/liber-primus/actions/runs/43667692961).

**Source-bounded decision:** the unique red small stop establishes a distinctive *p7 local visual boundary*, which was invisible to tests treating all 138 small stops as black prose punctuation. It does **not** specify an authentic new key or recover red-caption plaintext. Applying the closest independently derived GP29 key from the same scroll chapter, with original word breaks and a fixed local phase, is nonlinguistic. More importantly, the observed red-stop location cannot by itself indicate whether this three-rune-key cipher resets, because the competing inverse operations are the same function. Absent a new literal source-typed operation or external key operand, the red-stop branch does not justify phase, alpha, rotor or historical-key menus.

## Locked OutGuess password against the original p3 carrier

The same historically signed literal English word **SKY** was tested exactly once as a case-sensitive password on original LP2 physical p3 **20.jpg**, using the repository's pinned OutGuess build and existing source-validated known-key/source-image/blank-carrier controls.

- Original image20: nominal **21,774-byte** extracted blob, SHA256 `72663eda26cf5b094c8df5aac9ea79ee76d22428a43f022f255385db96e0f3a8`; first bytes `db540e55f1203c71...`, printable **37.8892%**, entropy **7.991417 bits/byte**, no recognizable signature, file type, OpenPGP armor or plaintext.
- Known-payload-free synthetic JPEG with identical key: OutGuess reports a length-consistent **21,550-byte** blob, also no recognizable content. Hence the original image's plausible header is **not** independent evidence of authentic steganography.

The original-image job completed successfully and kept the exact raw output, synthetic false-positive readout and genuine planted controls: [GitHub Actions source run 43664899212](https://github.com/FlareZ123/liber-primus/actions/runs/43664899212). The false header behavior agrees with earlier broad LP2 original-image OutGuess source studies, which are not repeated here.

## Research decision

**This bounded route does not decipher p3–7.** The manuscript itself selects the red triad and its stop geometry, and the historically signed 2013 clue makes SKY a plausible human lead. However the manuscript supplies **no typed instruction** to feed SKY into Vigenère, a network packet decoder, or a keyed steganographic extraction on the five-page chapter. The whole-chapter historical GP inverse is algebraically incompatible with untouched source ciphertext at positions20/22; its separate p7 red-only scoped counterpart recovers no source-native words and its unique red-stop reset is period-three neutral; the one fixed JPEG decoder produces an extraction indistinguishable from a false-positive header.

A genuine successor requires an actual original source selecting **the needed value-changing opcode**, exact key/IV and receiver, or a missing historical network reply that demonstrably turns the source triad into a decoded original-rune prediction. Repeating period-three key phases, fitting new English cribs, or varying OutGuess passwords without a new source selector does not advance this clue.
