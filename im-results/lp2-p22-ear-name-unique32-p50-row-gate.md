# P22 corpse, EAR rune name and unique 32-fragment p50-row hypothesis

**22 November 2026; Agent 5. Classification: an original-input word-count alignment and a narrowly negative readout. No new plaintext, authenticated key, cipher method or destination.** The source-numbered GP0/EAR relation is a conditional interpretation, not an instruction attributed to Cicada.

## Distinctive original source facts

The original Liber Primus second-release physical p22 (39.jpg) depicts a supine human corpse below a three-bar cross. The original file and exact pixel-certified LP1-to-LP2 mirrored reuse are described in [the prior image-source gate](lp2-p22-corpse-source-plate-decision.md). The figure had already been reused on three solved LP1 pages, so its subject is not automatically a single-text crib.

The **29th and last stanza** of the historically available Old English Rune Poem, in the edition/translation of Bruce Dickins (1915), names **EAR** (ᛠ; GP index 28, transliterated EA) and describes the body cooling and being laid in the grave. This is an unusually direct possible semantic reading of the p22 picture. A separate EOH stanza describes a **yew**; the original LP2 p32 and signed 2016 tree silhouettes are leafless/blurred and do **not** authenticate that species. [Historical text](https://en.wikisource.org/wiki/Runic_and_Heroic_Poems_of_the_Old_Teutonic_Peoples/The_Runic_Poems/The_Anglo-Saxon_Runic_Poem).

Counting only page-local **visible rune fragments** separated by original hyphens/periods, *p22 is uniquely 32 among all 58 LP2 physical pages*. It holds 131 runes. The first p22 visible fragment is two runes continuing the preceding p21 eight-rune fragment, so **32 is a count of printed local segments, not 32 complete words wholly beginning on p22**. This boundary distinction is essential. The original p50 table has exactly **32 rows of 8 values**. The original p32 has **121 runes**.

**Independent printed-rune detail:** Page p22 has precisely **one adjacent identical-rune pair in its 131-runic ciphertext**, and it is **ᛠᛠ = EA EA**, at zero-based rune positions **100–101**, within the original four-rune word ᛟᛠᛠᚪ (GP transliteration OE|EA|EA|A). These are **literally printed glyphs on the same corpse-illustrated page**, whereas the historical EAR stanza motivates the specific ᛠ glyph independently of the ciphertext. Across the full untouched 56 unsolved pages, only **three EA EA pairs** occur, at p1 offset193–194, p22 100–101 and p43 91–92. The p22 doublet alone is not a unique-corpus key signal, and the earlier corpus has a general deficit of all adjacent equalities. Nevertheless it is a more specific source-visible association than the aggregate 32-fragment count; it deserves future examination only if an independent clue selects how to use the doubled rune.

The canonical greedy GP29 spelling of historical **EAR** is EA|R, indices 28+4=32, providing a conditional name-to-page-32 reading. Historical **EOH** is EO|H, indices 12+8=20. P50's original base60 cell graph has 20→102→32→115; the earlier signed-2016 EPIPHANY/SEEKS/THE/DEVOTED research also selects p32 by a longer different route. These are exact numerical facts; none says to convert rune names to ordinal-sum page addresses. There are immediate alternatives among historically attested names: **CEN** also sums to 32, and **FEOH** sums to 20. This weakens claims that p32 or p50 is uniquely selected by the proposed gloss.

## A genuinely historical textual key: the final EAR stanza

The corpse artwork and the actual p22 EA EA doublet together select an *external original text* more specifically than the number 32: the **29th and last EAR stanza of the Old English Rune Poem**. The same 29-stanza historical transcription was pinned independently in the prior [original source Rune Poem experiment](../sims/lp2_rune_poem_tablefree_bookkey_stage1.py), Git blob **dea9478b3ded47cc1fbbe30be7b8941486054e07** at [Dukotah commit 9087dc36](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/data/keys/runepoem_oe.txt). The original final stanza begins “Ear byþ egle eorla gehwylcun” and describes the corpse cooling and entering the grave, a human-visible link to p22. The source selection is evidence-based, while the choice to use the stanza as a cryptographic *pad* remains unlicensed.

A bounded native inverse takes the **exact historical Old English EAR stanza** in source order; normalize thorn/eth to TH, ash to AE, wynn to W and the standard canonical GP digraphs, yielding **118 native GP29 runes**. Apply that exact sequence as an additive GP29 Vigenère-like key to all **131 original p22 runes** from offset zero. Because the stanza is only118 runes, continue cyclically for the final13 input symbols, without adjusting source key order, rune offset, direction or a fitted phase. Both additive signs are explicit. An omit-the-two-rune EAR title control tests whether the author's poem could have meant only the stanza *body*; it has115 key runes. No other cipher families or source offsets were searched.

| Frozen original receiver | Native GP trigram mean log probability per rune | GP29 IoC | Language |
| --- | ---: | ---: | --- |
| Raw original p22 ciphertext | −4.693637 | contextual | Unreadable |
| **Full literal EAR stanza, C−K** | **−4.667424** | **0.036524** | Unreadable |
| Full literal EAR stanza, C+K | −4.765903 | 0.035819 | Unreadable |
| Stanza body only, C−K | −4.343088 | 0.034292 | Unreadable |
| Stanza body only, C+K | −4.552538 | 0.032413 | Unreadable |
| **Authentic solved p57 source** | **−2.494634** | reference | Genuine GP English |

The single best bounded original decode merely produces pseudo-runes, with no recovered grammatical passage or instruction. All four exact inverse configurations reencrypt the entire **131/131 original glyphs**, and each recovers an authentic **85/85 solved p57** source-key encryption plant. The [standalone offline original CJS key SFT](../sims/lp2_p22_ear_rune_poem_stanza_original_sft.cjs) freezes the literal historical final stanza, 118-rune canonical GP normalization, the exact p22 EA doublet, all outputs, GP-English controls and inverse plants. The external poem is a plausible authored *reference*, but it does not decode p22 under the simplest historically attested LP-like additive mechanism. Do not salvage by arbitrary stanza offsets, book-key selection, skipped words or a secret extra layer without a new independently authored instruction.

## One concrete direct receiver, tested on original data

If the 32 p22 printed fragments are treated as one instruction per p50 row, the natural eight-column selector is each word's GP **prime-number sum modulo 8**. We tested this exact rule on the original row-ordered 32×8 table. Two input conventions respect the visible page-boundary uncertainty: p22's two-rune first fragment alone, or its full ten-rune word joined to the eight immediately preceding p21 runes. The distinct GP **ordinal sum modulo 8** is a comparator, not an authored alternative.

| p22 first-fragment convention | Column-number rule | Printable ASCII bytes of 32 | Original ordered 32-byte output (hexadecimal) |
| --- | --- | ---: | --- |
| Visible | Prime sum mod 8 | 14 | 7e5c3b8d7250567619cd8e23220ec556b3e9ae70e9fe83aa00443d8e90ee38bd |
| Visible | Ordinal sum mod 8 | 16 | cb5ccac6c5501033c0cd6f2320b8232ac90a7d7069d151aab04a06db00793850 |
| Joined carry | Prime sum mod 8 | 13 | cb5c3b8d7250567619cd8e23220ec556b3e9ae70e9fe83aa00443d8e90ee38bd |
| Joined carry | Ordinal sum mod 8 | 16 | ba5ccac6c5501033c0cd6f2320b8232ac90a7d7069d151aab04a06db00793850 |

These are **opaque byte sequences**, without an ASCII instruction or known directly decoded text. They are possible *synthetic candidate keys* under an unsourced operation; no source selects an algorithm, nonce, encryption target or verified plaintext consumer. In particular, their 32-byte length alone does not license AES256 or a hash-preimage claim.

The [standalone Node 22 CommonJS SFT](../sims/lp2_p22_ear_32row_p50_direct_sft.cjs) reads the canonical original corpus, full printed transcription and numerical table; asserts all named counts and exact source indices, calculates the four fully specified reads, and checks their printable-byte counts. The source JPEG serves as the separately documented iconographic premise.

## Research decision

This is a **sharply bounded visual/name and unique-layout hypothesis**, with a direct receiver that fails as a readable text extractor. The independent image-motif and GP0 numerical relations are enough to preserve as a possible original solve-path clue, but are **insufficient to promote** as a solution: the GP0 operation is inferred, other rune names collide, the p32 tree is not visibly yew, and p22 artwork is reused. No untouched ciphertext interval has been decrypted.

A worthwhile next step needs an *independent, first-party* specification that the 32 fragment-derived bytes serve as a particular receiver key or checksum, or a unique tree-to-rune identification that predicts an unknown page operation before looking at its output. Without that, do not run unconstrained AES/KDF/radix/phase searches on these bytes. This result complements rather than reopens the previous [Rune Poem semantic-codebook negative](lp2-rune-name-semantic-codebook-gate.md).
