# P3–p8 255-to-255 repeated-word differences read HEX: exploratory source cue, no authenticated consumer

**22 November 2026, Agent14. Evidence level:** authentic source-register arithmetic and one source-locked historical consumer negative; possible post-selected keyword; **no unknown plaintext, cryptographic key or hidden payload recovered**.

## Why the operation is human-plausible

Physical LP2 pp3–7 print exactly **255 complete GP29 rune words** across 1,145 runes; adjacent p8 prints exactly **255 rune characters**. Take a single p8 rune for each preceding complete scroll word in original order. Some source words are duplicated but their aligned p8 symbols differ; a human might subtract the two outputs to eliminate a word-dependent contribution. Gematria Primus arithmetic and historic Cicada Vigenere subtraction give a recognizable, source-native 29-element operation.

There is also **a second, independent selector for this physical pairing**: exhaustive counting over all 1,540 contiguous original page intervals [pA..pB], where pB≤p54 and the immediately following page is p(B+1), finds exactly **one** case where the interval's number of complete, page-carry-joined printed words equals the next physical page's rune count: **p3–p7's 255 words = p8's 255 runes**. The chapter is bounded by original p3 and p8 illuminated starts. This count identity is a genuine one-of-1,540 *corpus structural uniqueness*, although those overlapping page intervals are far from independent random tests. It strengthens the *reason to inspect* the sequential 255-to-255 interface without establishing that the author aligned word i to rune i. Reproducer: [source-gated all-interval proof](../sims/lp2_scroll255_word2rune_anylookup_obstruction_sft.cjs). [Windows Node22 all-interval **PASS 45038451377**](https://github.com/FlareZ123/liber-primus/actions/runs/45038451377).

There are only **three** duplicated complete source-word types. In increasing order of **first source-word occurrence**, subtract the rune at the later word from the rune at the earlier word, modulo29. Use zero-based indexes throughout:

| Identical original scroll words (GP29 codepoints) | Scroll positions | p8 GP29 rune pair | Earlier minus later, modulo29 | GP transliteration |
| --- | --- | --- | --- | --- |
| \`[8]\` | 47, 240 (p4→p7) | 16,8 | **8** | H |
| \`[11,19]\` | 48, 231 (p4→p7) | 11,22 | **18** | E |
| \`[23,21]\` | 235,236 (p7, p7) | 17,3 | **14** | X |

The result is **\`HEX\`** (ᚻᛖᛉ). The third word is visibly repeated **consecutively on original archive 24.jpg, p7 line8** as \`ᛞᛝ-ᛞᛝ\`. The duplicate class list is exhaustive; no key is fitted. The literal p8 phase is the **only one of 255 circular shifts** under this fixed construction that reads HEX.

**Counterexample to causal certainty:** p3–p7 also contain precisely **242 completely black words**, and p8 has **242 black runes confined to p8** once its 12 red heading runes and its last black rune carrying into p9 are removed. Their equally source-visible direct 242-to-242 pairing has three repeated-word pairs, but their same earlier-minus-later differences spell **NIAM** in canonical GP transliteration (nine, 27 and 19), not HEX. Choosing 255 rather than 242 is a key unsupported premise. Across unrelated alignment/operations one may find other short keywords.

For orientation, under the actual original p8 rune histogram and a fixed, externally specified set of the six output positions, uniform random permutation gives the *specified* ordered triplet [8,18,14] with probability **0.00004056737** (about one in 24,650). This is **not** a discovery p-value: the potential message was noticed post hoc, the alignment was not authored, and other words, operations, directions and partitions were plausible. The surviving phase0 within255 rotations also does not correct for selection of the target word.

## Prospective consumer: literal HEX in historical OutGuess 0.4

A concrete Cicada-era human operation is OutGuess 0.4 hidden-data extraction with literal uppercase password \`HEX\`. The password's candidate provenance is now pinned independently of image payload. Five original JPEG carriers have direct source relevance: archive **24.jpg** (last p3–p7 scroll page), **25.jpg** (p8 receiver), **66.jpg,67.jpg,68.jpg** (p49–51 256-cell numeric field). Test only the actual five original JPEGs. The same exact pinned OutGuess0.4 build passes a known-key embedded control and authentic LP1 default payloads (original 00.jpg,08.jpg). A freshly generated synthetic JPEG without embedded data provides a payload-free false-header control **for each** original carrier.

The [complete original source test](../sims/lp2_scroll255_hex_outguess_original_sft.cjs) ran in [Ubuntu Actions PASS 45037935333](https://github.com/FlareZ123/liber-primus/actions/runs/45037935333), rebuilding the source-pinned OutGuess executable in [a reusable runner](../.github/workflows/manual-outguess-source-runner.yml).

| Original carrier | Apparent extracted bytes | Same 32-byte apparent header as all others | Recognisable/signed payload |
| --- | ---: | --- | --- |
| 24.jpg | 42,241 | \`99e801a5a670e75a883b033d6dbdd6682d785ffe130c9a5243eb5db84996212e\` | **None** |
| 25.jpg | 42,241 | same | **None** |
| 66.jpg | 42,241 | same | **None** |
| 67.jpg | 42,241 | same | **None** |
| 68.jpg | 42,241 | same | **None** |

Every original returned the same nominal OutGuess header while the no-payload synthetic control did likewise. The candidate extracted bytes differ later but are near maximally random-looking, per-file Shannon entropy about **7.995 bits/byte**, with no recognized file, text or signature. There is **no evidence of a genuine HEX-password OutGuess payload** in these five carriers. Never count a matching OutGuess header as a success, and avoid further arbitrary passwords on other pages without an independent source selector.

An additional simple byte-domain check likewise failed: apply the repeating ASCII \`HEX\` bytes (72,69,88) or GP rune indices (8,18,14) by XOR to the full original 256-byte numeric field, and test fixed ±ASCII additions. None revealed cleartext or a recognizable file magic; no downstream key is authenticated.

## Decision / next discriminating input

The source arithmetic makes **HEX** an exact and reproducible *candidate hidden cue*. It has **not** deciphered the source words or p8; it could be a selected three-letter coincidence. The most natural independent next step is a first-party indication that **this original 255-word register should be paired 1:1 with p8**, or a creator-specified instruction using *hexadecimal encoding* of the following genuine 256-cell field. Before promoting HEX, require that such a preexisting clue predict an unknown target beyond the six selected p8 positions, ideally authentic plaintext or a byte-identifiable key. Do **not** extend the rejected OutGuess interpretation by choosing unrelated keys/carriers or flattening the observed 242-black-word competitor.

The [adjacent scroll/p8 universal stateless lookup and source-keyed five-tap exclusions](lp2-scroll255-p8-word2rune-allsecret-lookup-obstruction.md) are independently valid conditional constraints; this arithmetic interpretation uses the same 255-to-255 **unauthenticated alignment**.
