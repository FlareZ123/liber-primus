# Signed 2016 message self-points to a 43-node p50 tree

**21 November 2026 | Agent31 | New source-constrained navigational hypothesis; no unknown plaintext or key.** A previously unlinked signed-source word count and two independently selected signed words point to the same base60 cell/node of the actual 256-cell p50 table. That node has exactly the signed message's word count as its reverse descendant count and occupies the p32 blurred-tree page in the conditional 56-page tree traversal. This supplies a possible *intended route* from the 2016 instruction to a concrete 43-page receiver. Immediate direct source-word page keys fail.

## Source-derived selection with no fitted page, value, or word

The authenticated 2016 signed message, including the greeting and final OpenPGP admonition, has **exactly 43 alphabetic words** when numeric 3301 and the alphanumeric key ID are excluded. Its first word **HELLO** has GP0 runic index sum **69**, and its LIBER word (source word index9) independently shares **69**. The semantically explicit word **DIRECTION** (source word index29) gives GP0 sum **112** under the established **IO→IA** ligature convention; the alternative literal-IO convention gives 98 and a *different* previously documented route.

In the unchanged **conventional base60** interpretation of the original printed 32×8 table, the exact cells at zero-based indices **43, 69 and 112** all contain the same literal token **1D = 73**. The three inputs are respectively the complete signed message's word count, its opening word's GP0 sum, and the word DIRECTION's GP0 sum. The table has **four** occurrences of value73 at addresses **43,69,112,226**, so the match is inspectable at source-token level.

Treating printed table bytes as graph successors T, the reverse predecessor closure S(73), including node73, has **exactly 43 distinct nodes**, the original signed word count. In fact, **43 is the unique address n in 1..255 satisfying |S(T[n])|=n** in the original 256-cell functional graph. This is a concrete, self-consistent, finite count→address→node→count instruction. Nothing is fitted to an English plaintext candidate.

A second independent, source-derived path selects S(201) of size**56** from the authentic 2013 PARABLE prime rank201. S(73) lies wholly inside S(201). Under the **previously proposed, not authenticated** largest-child-subtree-first recursive in-order traversal, S(73) is **exactly the first43 page nodes p0..42** of the 56-node core, with its root node73 at **physical p32** (the original blurred-tree illustration). The branch's two outer parents are node79 at proposed physical p43, then node82 at proposed p44, which precede numeric-only p50 node201. This makes one 2016 signed word per encrypted original physical page p0..42 a plausible testable receiver rather than a freely chosen length.

**Important unproven premises:** base60 rather than the documented base59 rival; the reverse-predecessor interpretation and candidate recursion; using the signed text's entire 43-word envelope as a ciphertext keyset, although its grammar says that *Liber Primus's* words are the map. These constraints may be coincidence despite the source-exact numerical equalities.

## Genuine original-cipher tests

Freeze the 43 signed source words in their unchanged textual order, one per original encrypted physical page p0..42. Encode each source word into its complete native GP29 rune index vector and try only two standard per-page Vigenère readers, direct periodic and plaintext-autokey, both additive signs, page-local clock at rune0. These are **four fixed models** over **all 10,416 untouched original rune symbols** in the selected 43 pages, with original printed cuts unchanged. None produces coherent native GP English:

| Fixed model | GP29 IoC across all 10,416 resulting runes |
| --- | ---: |
| Direct periodic, subtraction | **0.034482236052** |
| Direct periodic, addition | **0.034506922029** |
| Plaintext autokey, subtraction | **0.034491785967** |
| Plaintext autokey, addition | **0.034499566014** |

No individual page in any of the four candidates has IoC ≥0.048, versus original solved p57 cleartext **0.062710**. An independently clear p57 sequence encrypted using the first signed HELLO key under the same direct-periodic mechanism recovers exactly **95/95** runes when decrypted; this is a method control, not an original unknown-page decryption.

The separately authenticated p56 original prime/totient-F-transparent cipher provides one other source-constrained interpretation: assign each signed word's GP0 sum or its literal p50 table successor T[GP0] as its original page's zero-based initial prime index. Full legal F-skip inversion on all43 original pages yields only **p13** arithmetically surviving under the direct GP0 seed and **no complete original page** under T[GP0]. Thus this directly transferred historical cipher is ruled out for a 43-page continuous solution; further offsets, restarts and secret inverses were not searched.

## Chance calibration, constraints, and decision

Under a random permutation of the **original 256 byte-token multiset**, the chance that *three fixed, distinct addresses* select the same value, of any kind, is exactly **0.000013750579**, computed from the frozen multiplicities by the hypergeometric count of ordered equal triples. This number is descriptive of that narrow selection rule, and it is **not an unbiased probability that the source was authored to encode our interpretation**. The particular three addresses and equality were noticed after extensive prior source searches.

An independent fixed-multiset conditional experiment holds only the three original equal-73 cells at addresses43/69/112 fixed, shuffles all 253 other original table values using Fisher–Yates (LCG seed 0x0c1cada), and recomputes S(73) across **100,000** trials. Exactly **469** have subtree size43 (conditional fraction **0.00469**). This is a deliberately conditional reference class; the signed word framing, radix, graph direction, GP0 transliteration and target subtree are still hypotheses. It cannot establish a global creator-design likelihood.

**Decision:** preserve this as a newly constrained candidate human solve path and a concrete 43-page key-receiver assignment. Retire the four original periodic/plaintext-autokey outputs and the direct native p56 GP0/node-prime clock transfers. The next valuable test must derive an actual **source-selected operation for 43 words as graph directions**, or an independent original ciphertext prediction, before scoring additional substitutions or fitting a key. An authentic repeated-word remapping, text readout or original-page plaintext is still absent.

[Source-frozen CommonJS SFT](../sims/lp2_signed43_p50_tree_selfpointer_sft.cjs) reads the original table, canonical GP corpus and complete authenticated 2016 signed text; asserts the unique self-pointer, both original-word addresses, p32/43-node candidate mapping, source-key original cipher negatives and native positive plant. [Provisional parent 56-tree traversal](lp2-p55-parable-threeprime-3x25-totient-original-gate.md#source-original-50--1--5-physical-page-split-inside-the-56-node-core).