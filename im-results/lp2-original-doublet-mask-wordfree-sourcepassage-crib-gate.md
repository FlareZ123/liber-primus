# Fixed rare-plaintext marker as a word-boundary-free source-quotation crib

**Agent10, 18 November 2026. Bounded original-input source-recovery attack, with a fully invertible positive control. No previously unknown LP2 plaintext or creator-selected key was recovered.** [Executable source-native CommonJS search](../sims/lp2_doublet_mask_sourcepassage_crib_sft.cjs) · [Node22 CI PASS 44269814190](https://github.com/FlareZ123/liber-primus/actions/runs/44269814190).

## Why this is a different cryptanalytic decision

The untouched LP2 physical pp0–55 contain 12,956 GP29 ciphertext runes, with only 86 identical adjacent pairs within physical pages. The earlier [fixed-reserved-rune gate](lp2-fixed-reserved-rune-doublet-source-gate.md) rejected a plaintext symbol marker when **original printed words must be the plaintext's true word boundaries**, using 2,896 exact-length native-English control words. That original-word-shape assumption may fail if printed separators are cipher formatting, a possibility explicitly left open by the previous source gate.

Here the printed word breaks are **entirely ignored**. Instead of sampling invented books with fixed word shapes, ask whether the source's sparse repeat positions identify an **actual contiguous passage in a previously available text**. Recovering an exact source passage would give an entire candidate plaintext chapter and allow subsequent recovery of the remaining keyed nonzero substitution. This tests an immediately usable plaintext-recovery route rather than merely fitting a statistical parameter.

Assume an unknown fixed rune `R` is encoded as a repeated ciphertext symbol, with each other GP rune mapped bijectively onto the other 28 possible successors. The 28-way mapping may be arbitrarily secret and change at **every** rune. Within each physical page, its key-independent invariant is exactly:

```text
C[i] == C[i-1]  if and only if  P[i] == R
```

The physical first rune on each page has a separate initial condition; no comparison is imposed across those page edges. A candidate source passage matching every repeated and nonrepeated position passes this **necessary marker condition** regardless of secret nonzero keys. An entire source passage is the proposed plaintext, so no language score or freely selected ciphertext decryption key is involved.

## Source-frozen search

Source input is the original [LP2 corpus](../resources/liber-primus/lp2-corpus.json); all 29 rune identities and page sizes are unchanged. Each external text is converted to **one unspaced native-GP29 rune sequence** using the previously frozen [source orthography](../sims/lp2_native_gp_source_orthography_sft.cjs): `QU→CW`, `V→U`, `K/Q→C`, `Z→S`, `ING→NG`, `IO→IA`; then greedy GP29 tokenization. Native English punctuation and **all its true word boundaries** are discarded before testing. We examine the literal forward source and its reversed GP-rune order, every possible substring start, and **all 29 choices for `R`**.

The nine existing, immutable repository texts total **713,301 native GP runes** before reversal: Shakespeare (217,106), Gibran (62,492), Emerson (321,327), 2012 Blake *Marriage of Heaven and Hell* (33,276), all three 2013 *Book of the Law* files (6,958 + 7,059 + 7,484), KJV Passion excerpts (53,675), and Tennyson *Lady of Shalott* (3,924). These contain genuine earlier Cicada-associated reading candidates alongside independent literary controls; their contents are neither represented as author-authenticated LP2 keys nor augmented with model-generated prose.

Frozen original targets:

| Original target | Exact runes | Within-page repeated pairs | Scan result (all sources, both directions, all `R`) |
| --- | ---: | ---: | --- |
| p0 alone | 262 | 2 | **57** compatible passage offsets |
| Full opening p0–2 | 729 | 4 | **0** |
| Opening after original red13, same source | 716 | 4 | **0** |
| Original scrollwork p3–7 | 1,145 | 6 | **0** |
| Dense-repeat physical p19 | 271 | 5 | **0** |
| Dense-repeat physical p24 | 270 | 5 | **0** |
| Dense-repeat physical p27 | 234 | 5 | **0** |
| Dense-repeat physical p29 | 277 | 4 | **0** |
| Dense-repeat physical p44 | 273 | 4 | **0** |

A candidate must satisfy **every** repeat event and **every** no-repeat position, with only source physical page starts unconstrained; it is not sufficient to hit two or four marked spots while ignoring extra occurrences of `R`. The 57 one-page matches demonstrate how short masks can generate plausible-looking but completely nonunique literal quotes. None extends to the complete opening chapter. The dense-repeat pages yield no full-page source candidate despite omitting original word boundaries and allowing arbitrary secret 28-way substitution at every nonmarker position.

The SFT constructs a **known native Shakespeare 729-rune plaintext plant**, uses the same exact p0–2 physical cuts, encrypts it with an explicit invertible predecessor-excluding modulo29 map and `R=EA`, then recovers its exact source offset from the marker mask with no secret 28-way map. The planted recovery, all source-zero decisions, page counts and original repeat-site offsets pass the Ubuntu Node22 CI runner. The implementation uses Windows-compatible CommonJS APIs.

## Interpretation and next decisive route

**This is a source-corpus exclusion, not a universal prohibition on rare-marker cryptography.** A newly authored original plaintext passage, a missing external keytext, an alternate encoding language, changing reserved symbol, inserted/dropped runes or a different framing rule is outside the test. A fixed `R` can be uncommon in naturally written continuous GP prose, so the earlier apparent word-start contradiction alone is insufficient to retire the model when original printed boundaries are not plaintext boundaries. Conversely, the present negative supplies no reason to prefer this model over an external pad and separate formatting layer.

The constructive next step is **source-led quotation discovery**: when a genuinely clue-selected, plausible 2014-era primary text becomes available, rerun the exact mask scan against it before proposing an invented key. A nontrivial match in an original dense-repeat page would supply a candidate **entire plaintext passage**, and would then require independent original-cipher forward reencryption and withheld-chapter prediction. Without such a source match, the family has no original plaintext, no identifiable secret nonzero mapping and no new cryptographic key.

The exact SFT reads original source artifacts directly and does not alter the shared corpus.
