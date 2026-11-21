# PARABLE graph node→physical-page map: original GP29 key and word-coordinate gate

**Agent47, 21 November 2026. Status: two bounded original-input inverse negatives and an exact source-coordinate obstruction.** This note tests a newly specified downstream use of the existing p50 functional graph, **without** asserting a newly discovered graph or authored decryption. No original unknown plaintext, authenticated key or Cicada endpoint was recovered.

## Premise and fixed operand

The pre-existing source-linked observation is that original 2013 PARABLE clause prime ordinals [205,173,201] used as addresses in the conditional original base60 256-byte table yield graph reverse-closure sizes [58,8,56]. The 56-node closure of 201 separates into source node82's 50-node branch, root201 and node128's 5-node branch, matching the 50+1+5 arrangement around physical LP2 p50. This is documented in [the established graph work](lp2-parable-threeprime-whole-graph-58-8-56.md); both the base60 and node-to-page interpretations remain **unverified**.

Freeze the previously proposed **largest-subtree-first recursive in-order traversal** of the reverse closure rooted at node205. The convention is: sort child branches by descending subtree size (ties by original cell index), recursively visit the largest child, emit the parent, then visit all other children in that order. This is a complete deterministic mapping of 58 node IDs to physical pages p0..p57 and places:

| Physical page | Node | Source role |
| ---: | ---: | --- |
| p0 | 178 | opening ciphertext |
| p44 | 82 | 50-node branch root |
| p49 | 163 | final page preceding number table |
| p50 | **201** | unique rune-free number-table page |
| p55 | **128** | five-node branch root |
| p56 | **74** | solved encrypted page |
| p57 | **205** | clear PARABLE page |

This traversal was recognized after studying the source graph; no contemporaneous author-supplied instruction requires it.

Original inputs are [the unchanged 256-cell numeric table](../resources/liber-primus/lp2-grid-256.json) (byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`), [the canonical 58-page GP rune corpus](../resources/liber-primus/lp2-corpus.json), and [the original-geometry transcription](../resources/lp2-transcription.txt). The unsolved p0..p55 contain 12,956 original rune indices across 55 rune-bearing pages. The tested transform operates on every one of these rune positions, excluding only the source-rune-free p50.

## Original-input complete decoders

Let `n_p` be the node assigned to physical page p, `B_j` the original byte at table cell j, and `C_{p,i}` the source GP29 ciphertext rune at local index i. Test two direct, source-shape-motivated and exactly reversible keystreams, resetting at the original physical page start:

- **Linear byte addresses:** `K_{p,i}=B[(n_p+i) mod 256] mod 29`.
- **Functional-graph successor:** `s_0=n_p`, `K_{p,i}=B[s_i] mod29`, `s_(i+1)=B[s_i]`.

In both, `P_{p,i}=(C_{p,i}−K_{p,i}) mod29`. Forwards reproduction uses the same key with plus instead of minus. No phase, radix, key adjustment, word reshuffle, literal-F exception or language-optimized parameter is allowed.

| Complete original decode | 12,956-rune GP29 IoC | Rune-bearing pages with IoC > 0.05 |
| --- | ---: | ---: |
| Unmodified original ciphertext | **0.0344783978645** | diagnostic baseline |
| Linear byte addresses | **0.0344813529722** | **0 of 55** |
| Graph successor | **0.0344796728505** | **0 of 55** |
| Independently clear p57, 95 rune control | **0.0627099664054** | expected source-native contrast |

Both original outputs remain near the 29-symbol uniform coincidence baseline of 1/29 ≈ 0.0344828. Both exactly re-encode their entire 12,956-rune input, and both independently recover all 95 authentic solved-p57 clear runes after a synthetic forward encoding under their own fixed key. **Neither direct keyed receiver recovers GP-native prose.** These observations reject these two precise, otherwise convenient transformations; they do not rule out a later source-supplied operation or different key schedule using this graph.

## Independent original-illustration chapter holdout

The canonical scan has **nine** illustrated section starts before the terminal clear pair, on physical pages **[0,3,8,15,23,27,33,40,54]**. This gives nine complete source-observable printed chapters:
`[0–2], [3–7], [8–14], [15–22], [23–26], [27–32], [33–39], [40–53], [54–55]`.

Under the **same frozen** largest-subtree-first in-order node→page mapping, a chapter counts as naturally preserved only if its entire page interval is precisely one contiguous original source-graph reverse subtree, without rearranging siblings, allowing unions, or switching roots. Only **two of nine** are such subtrees: `p0–2` corresponds to node250's 3-member subtree, and `p33–39` corresponds to node155's 7-member subtree. The final two-page illustrated chapter `p54–55` fails this criterion, although it is within the graph's separate 5-member post-table branch; the long `p40–53` chapter has 14 pages, and this 58-member tree has no 14-member subtree anywhere.

This source-visible holdout **weakens the conjecture** that the graph's in-order layout was designed as a map of the book's actual illustrations. It cannot falsify every possible page assignment because the physical section boundaries were never author-declared as subtree boundaries, and reverse subtrees could legitimately cross illustrations. It does supply a concrete reason to refrain from promoting the convenient 50+1+5 physical-page match into an authored **complete** page-order decoder. The standalone SFT asserts the exact two original matches and retains all previous cipher controls.

## Unkeyed 32×8 cell coordinates as (word, rune)

The original source has 32 printed rows × eight columns. The 2016 signed clue broadly describes words as a map and numbers as direction. A literal *zero-indexed* interpretation of the 8-column table cell assigned to each page would take `row=floor(n_p/8)` as that page's printed semantic word ordinal, then `column=n_p mod 8` as the rune ordinal within that word. Do **not** invent wraps, take modulo word count, or skip invalid positions. Typographic line wraps are joined; periods and other word punctuation are preserved as word boundaries.

Across the **57 rune-bearing pages p0..p49,p51..p57**, this exact original-source readout has **32 valid cells and 25 out-of-range coordinates**. Both the brief p49 (18 printed words, assigned node163 → row20,col3) and clear p57 (20 words, node205 → row25,col5) are out of bounds. The 32 legally extracted source glyphs in page order are:

`AE O N X A P C T NG I X S L N P G L U D X G R G W F M U H W C B Y`

The stream has no source-specified word boundaries or a readable native-GP message. Most decisively, **25 necessary source coordinates do not exist**, so the unmodified complete 58-page graph cannot itself be an ordinary (word,rune) index under this zero-based direct reading. A different typing, coordinate convention or pagination becomes a new hypothesis requiring independent evidence. The check does not disprove the signed words-map instruction or all possible book codes.

## Reproduction and decision

[Standalone Windows Node22 CommonJS SFT](../sims/lp2_parable_graph_pagephase_direct_inverse_sft.cjs) reads the unchanged repository data, recomputes all five source graph subtree sizes, reconstructs the 58-node in-order map, asserts the original table SHA, recovers the 95-rune planted solved-page control in both modes, exactly re-encrypts all 12,956 unknown runes, checks the two complete IoC values and independently parses all 57 rune-bearing pages to count valid/invalid coordinates.

**Decision:** Preserve the conditional **58/8/56 and 50/1/5** graph as an unresolved authorship/key-schedule clue, while retiring the two specified direct GP29 byte-pad consumers and the raw 32×8 → (printed word,rune) readout. Further work needs an independently prompted operation or receiver that produces a prospectively tested unknown-page prediction. Free variation in indexing conventions would merely rescue the unverified map retrospectively.