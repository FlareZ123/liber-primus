# Signed 2012 decimal postscript as a 89-rune original-p55 key: frozen negative

**Decision (13 November 2026):** The unchanged decimal postscript from Cicada's 2012 signed end-message produces an **89-rune base29 digit sequence**. The original final unsolved LP2 page p55 has **76 runes**, with a source-visible 13-dot red closing marker. The apparent **89=76+13** fit motivates one restrained historical-key transfer. The two unspecialized contiguous 76-digit slices fail direct GP29 additive decryption; a stringent independently solved p56 13-rune continuation predicts **at most one of thirteen** authentic letters. No p55 plaintext, genuine key or continuation is recovered. Reproducer: [source-locked CommonJS SFT](../sims/lp2_2012_signed_ps_base29_p55_gate_sft.cjs).

## Authenticated source and proposed path

- The archived original Cicada 2012 OpenPGP signed end-message ([pinned primary-source file](https://github.com/iBotPeaches/cicada_3301/blob/a0a616d85717af59f8b806875b43d51e06e1e874/messages/2012/hello-we-have-now.asc)) includes this unusual P.S. literal, on three lines. Its 40-, 45- and 46-digit rows concatenate to 131 decimal digits in exactly signed reading order:

  `1041279065891998535982789873959431895640`

  `442510695567564373922695237268242385295908173`

  `9834390370374475764863415203423499357108713631`

- Original 2013 Cicada's separate signed BASE29 instruction demonstrably used standard positional base29 integers (`BASE29 3301 -> 3QO`). A 131-digit decimal positive integer has exactly **89** base29 digits under that convention. Thus a human could carry an unusually long, earlier author-origin number into a later 29-rune alphabet without inventing a general KDF.
- The original LP2 p55 (source JPEG `72.jpg`) has 76 original GP runes and a **13-dot red paragraph mark at offset76**. The source-grounded census is `resources/liber-primus/lp2-ink-annotations.json`. This marker type also occurs frequently elsewhere; the matching difference **13** is explicitly *post hoc*, not proof of key alignment or intended use.
- A reader could reasonably try two unshifted 76-rune windows: the leftmost 76 of the 89 decimal-derived GP digits (13 remainder after p55) and the rightmost 76 (13 remainder before p55). For each, only the two additive GP29 directions already demonstrated on solved LP1 and p56 are tested. Word lengths, ciphertext, row order, terminal page, alphabet and trial family are unchanged.

## Decisive original-cipher outputs

All four original p55 full-length inverses are reversible, and all four recover a planted 76-rune unencrypted excerpt from original p57 after encryption. Reconstructing a ciphertext is an implementation invariant and insufficient for a claimed solve.

| Base29 slice used on p55 | Additive decode | p55 GP29 IoC | p55 output opening | Continued p56 solved control |
| --- | --- | ---: | --- | ---: |
| First 76, offset 0 | `C−K mod29` | 0.039649123 | `FMBMEOAEUCWPTHOEGLOESW` | 0/13 |
| First 76, offset 0 | `C+K mod29` | 0.034035088 | `PTHNGUTHCRDTHBOEMJPEAX` | 1/13 |
| Last 76, offset 13 | `C−K mod29` | 0.032631579 | `IOECMSXMWAEIALAEHESTIAJ` | 1/13 |
| Last 76, offset 13 | `C+K mod29` | 0.034035088 | `OEARUEATSNGPORTNSGPIAH` | 0/13 |

The p55 outputs contain no coherent native GP English text across the original page's 17 printed word slots. The independent known-text control is original p56's first 13 ciphertext runes, which correctly decode to `ANENDWITHINTHED` under the authenticated prime-totient keystream (keys `1,2,4,6,10,12,16,18,22,28,1,7,11`). If the 13 leftover source-key digits were meant to continue directly past p55 into p56 under the same sign, the first-row leftover produces 0/13 true letters; the other boundary assignment yields 1/13. Both directions are reported. This rejects a shared contiguous terminal key and also exposes why a merely equal key length cannot establish genuine plaintext.

## Independent p0 NEWBAS-address test

The separate original p0 word6 begins at page-local offset23 with six literal transliteration tokens `NEWBAS` and ends at offset33. Under a **conditional** reading of this as a cue to start a numerical rebase, the first **89 complete original runes immediately after the word**, at frozen offsets34–122, can consume the entire original 2012 P.S. base29 key without any arbitrary trim. The two authentic additive directions yield GP29 IoCs **0.036772217** (`C−K`) and **0.035495403** (`C+K`), both cipherlike. Their native GP transliterations open `BMRMWEUFSJWAEAFEAIUCPM` and `UTHHUYIAREISIAOEFOECNE`, with no coherent 89-rune plaintext. The SFT asserts the exact original p0 word and original-cipher inverse; this fixed address test likewise fails. This p0 interpretation is exploratory because the original word is actually `NEWBASOEEOINGU` in GP transliteration, not a literal complete `NEWBASE` word.

## Disposition

No more rotations, alternative seed salts, per-word phase resets, source-file edits, key aliases, or reindexed P.S. digits should be optimized against p55 from this premise. The 2012 P.S. had an independently discussed **visual 3301 after a quarter-turn** and is not documented as an LP2 pad; 2012→2014 key reuse and the chosen 13-digit trim lack an instruction. The 13-dot marker is a conventional chapter/punctuation type and has competing non-key interpretations.

The source is independently valuable as a fixed and authenticated author-origin numerical object. A future authentic *operation or trim rule* would reopen that newly specified interpretation, and would require recovering complete unknown-page plaintext and predicting untouched material. This tested direct numerical key transfer is retired.
