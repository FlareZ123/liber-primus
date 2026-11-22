# Historical missing-prime 19 → original p8 XIX → black-rune-only quartic clock

**Agent17, 22 November 2026. Status: source-connected human-path hypothesis with an exact original-input prediction, no decipherment.** The unknown LP2 manuscript p0–p55 remains undeciphered. This work exposes a cross-document way a contemporary player could select a particular source number and one original chapter boundary. It does **not** recover an author-approved reversible cipher, a new key stream or plaintext.

## Independent human-visible starting clue

An archived Cicada invitation from the original onion distribution is headed `Hello. Your enlightenment awaits you.` and includes the 2014 LP2 distribution onion. The *preserved trailing/blank-line space counts* in that invitation read

`[2,3,5,7,11,13,17,23,29,31,37]`.

This is the increasing sequence of the **first twelve primes, with exactly 19 missing**. The historical gap was already documented by the earlier [2014 whitespace note](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md); the missing prime as such is *not* newly discovered. Source text: [archived invitation](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/original-onion7/message.txt.asc).

**Authentication caveat:** Trailing spaces and all-whitespace lines are not robustly protected by the canonical cleartext PGP signature. A separate [invitation mirror](https://github.com/iBotPeaches/cicada_3301/blob/master/messages/2014/hello-your-enlightenment.asc) retains the words and signature but strips the whitespace counts. Therefore treating the omission as a deliberate creator instruction is conditional on the archival byte rendering. No use of the original message as a PGP-authenticated *whitespace* key is justified.

In the original Gematria Primus alphabet, the first twelve symbol-prime pairs are exactly primes2 through37. The missing value19 is symbol index7, **W**. Restoring that one missing prime creates twelve source-ordered GP alphabet elements. This might point from the invitation toward the book's runic alphabet. The ordinary first-twelve-runic-alphabet explanation is an independent rival to a p8-specific clue.

## Original p8 red inscription and quartic

The *unchanged physical p8 opening* in original image25.jpg contains 12 red GP29 runes. Its first three runes are **ᛉᛁᛉ**, transliterating literally to **XIX**, Roman 19. Searching all 12,956 authentic unknown p0–p55 GP runes for this exact contiguous three-rune GP29 sequence (indices `14,10,14`) gives **one hit, at p8 rune offset0**. The whole red title is native GP `X I X M | U X M C TH P O B`, with red-word GP29 index products **[4,3]**.

The separately recovered five original p7 red-word products `[11,26,8,15,2]` define the *ascending-degree* polynomial

`P(x)=11+26x+8x²+15x³+2x⁴ (mod29)`.

An exact new coupling for the historical prime19 is **`P(19)=12`**, which equals the authentic number of red p8 runes. Both source-only starting values (historical prime19 and p7 coefficients) appear without searching an unknown-page plaintext or choosing a private key. This is a retrospective cross-source observation, **not** an authenticated instruction to iterate a polynomial. The original p7→p8 polynomial itself was discovered by examining the red headings, so the 12-rune match is not an independent blinded prediction.

## A new word-bounded Roman reversal and prime/totient key hint

The p8 title's **entire first original red word** is GP transliteration `XIXM` (four runes). In printed order it is not a canonical Roman numeral, while reversing **that complete, genuinely separated word** produces `MXIX`, the valid Roman numeral **1019**. Crucially **1019 is prime**, and the red page supplies two complete red words with original GP29 products `[4,3]`; these equal precisely

`1019 mod29=4`, and `φ(1019)=1018≡3 mod29`.

Thus a recognizable **word-level reversal → Roman numeral → primality/totient** operation would explain *both* adjacent original red-word products via the solved LP2 p56's authenticated use of prime totients. The source additionally gives the adjacent p7 polynomial fixed points `P(4)=4`, `P(3)=3`. This is a single algebraically interdependent chain: `φ(n)=n−1` follows automatically once n is prime, and the p7 fixed point match was already noticed using red products; these must **not** be multiplied as independent chance hits.

A deterministic whole-original-text control confirms that of the **50 fully red printed words** in all original unknown LP2 pages, only two become canonical Roman numerals when each complete red word is reversed: the one-rune `M` on p6 (1000 in either direction) and the **four-rune `XIXM` on p8** (1019 only in reverse). There is no other multi-rune fully red reversible Roman example in the original source. This gives a plausible human reason to try a *reverse-word* operation, more specific than an arbitrary end-to-end ciphertext reversal; it does not instruct how to transform the remaining 243 black runes.

The source-defined `1019` may be interpreted as a prime **value** or as a **prime-sequence position**; no first-party note selects the output type or a concrete ciphertext clock. Its GP residue4 is itself a p7 fixed point, so using it directly as the p7 recurrence seed produces a constant4, **not** an unobserved evolving keystream. The real opportunity is a separately authored instruction converting the Roman prime or its totient into a reversible alphabet operation or a key. Do not brute-force prime starts or rely on synthetically fitted prose.

[Read-only full-source 2,896-word Node22 SFT](../sims/lp2_p8_reverse_roman_prime_totient_source_sft.cjs) verifies physical word boundaries, all 50 original red words, strict Roman parsing, unique reversed `MXIX=1019`, prime/totient residues, both original p8 products and p7 source fixed points.

## Original p10 numeral7: a previously untested source-numbered origin and black-only clock

The original p8–p14 chapter has one standalone decimal **7**, physically printed in p10 after exactly **692** GP rune symbols counted from the original p8 opening. Its p10 within-page prefix is169 runes. Physical p8 begins with **12 red runes**; the black body through the numeral therefore contains **680 runes**.

The new source-specified numeric origin gives the exact relations

`P^680(19)=7`,  where 680 counts only black body runes; whereas

`P^692(19)=10`, where all opening red and later black runes count.

Earlier analysis used the p7 five-red-word relation to seed the seven-cycle at5 and found `P^692(5)=7` with *all* runes counting. These are **competing clock-origin hypotheses**, and both presently fit the visible numeral7. Neither the original artwork nor the invitation authenticates excluding the 12 red title runes from the state clock. The historical seed19 is **not unique** even within this fixed black-only polynomial model: the complete 29-source-seed enumeration attaining numeral7 after680 steps is `[14,16,17,19,24]` (five seeds). The match therefore neither identifies a unique secret key nor proves that black-only counting is intended.

There is still a plausible human path worth testing: the invitation's missing prime19 selects the unique manuscript `XIX` red start, the adjacent p7 red operands select a 29-state recurrence, and red title ink could separate rubric from ciphertext clock. A real next instruction must specify a **lossless rune-value-changing inverse** applied to the chapter's intact ciphertext; direct additive page clocks, cyclic rotations, 2014 Shamir interpretations and IV19 quartic-feedback variants were previously tested and do not yield plaintext. Do not restart those surveys or use the seven-page coincidence as permission to fit 29 unknown substitutions.

## Cheap source-typed direct-key gate and next decision

Completing the missing prime gives the *twelve* GP prime values `[2,3,5,7,11,13,17,19,23,29,31,37]` and their GP ordinal indices `[0..11]`. Either exact twelve-value additive Vigenère rule on the twelve intact p8 red runes, in both signs and natural alignment, yields nonprose, e.g. the GP ordinal subtract stream is `X N EO T Y N P IA D R OE G`, and the raw-prime subtract stream `EO W N EO M U TH S H P U N`. This rejects these four simple direct inverses without requiring phase-search, alphabet tuning or a language-model crib.

**Original-input prime1019/p56-cipher test (completed):** The strict reversed-word `MXIX=1019` is prime number **171** in the ascending prime sequence, therefore **zero-based prime cursor170** for the *actual solved p56* cipher. This fixes a specific key start independently of p8 black ciphertext. Apply the authentic p56 consecutive-prime totient rule with its necessary **transparent plaintext-F bypass** to all original **243 p8 black runes**, with no fitted key, private alphabet or guessed F mask. The exact state-machine inverse enumerates *every* legal ciphertext-F bypass choice, requiring each consuming inverse plaintext F to be rejected. The source-selected start170 fails at black-rune **offset37** in normal forward reading (ciphertext TH), so no complete legal 243-rune inverse exists. The equally source-visible reversed reading fails at offset43 (U); testing both arithmetic signs as bounded implementation rivals fails at offsets9 (C) and50 (L), respectively. The full untouched 85-rune original p56 solved-text calibration is reproduced exactly with **84 key-consuming non-F runes**. This is a mathematically decisive rejection of the **direct prime1019 → p56 cipher** on p8, while preserving the Roman/prime/totient source relation as a possible clue to a different mechanism. Do not rescue the failure by inventing a prime phase, skipping illegal F, or silently ignoring original rune positions. [Source-original F-aware rejection SFT](../sims/lp2_p8_mxix1019_p56_phi_literal_receiver_sft.cjs); [earlier exhaustive 5,000-prime-start nine-chapter gate](../im-results/lp2-p56-native-F-transparent-ninechapter-impossibility.md) also disallows any full p8–p14 transfer of this machine.

A useful positive next step would be an **original 2014 first-party instruction** connecting the omitted 19/W to a single invertible update/receiver whose entire p8–p14 black chapter can be decoded and replayed, with at least 200 untouched runes from a separate original section predicted by the same key law. If no such operation is visible, stop at a numerical navigation clue. Source-only correspondence is not recovered plaintext.

### Reproduction

[Windows11 / Node22 / CommonJS SFT](../sims/lp2_whitespace_prime19_xix_p7_blackclock_sft.cjs) checks the historical prime vector, original p8 red source and **global uniqueness** of its GP29 XIX triplet, original GP prime19=W mapping, printed red p7 polynomial, both numeral7 clocks, 29-seed multiplicity, and the four direct additive title readings. Original rune/ink data: [corpus](../resources/liber-primus/lp2-corpus.json), [ink register](../resources/liber-primus/lp2-ink-annotations.json); source numeral location and full polynomial graph independently checked in [p7 original-gate report](../im-results/lp2-p7-red-polynomial-seven-cycle-original-gate.md). The saved source ZIP and repository image25.jpg are the original p8 physical artifact.
