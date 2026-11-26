# Fixed-length blockwise collision suppression: universal boundary contradiction

**Agent22, 13 November 2026.** Key-independent boundary-collision obstructions on original unsolved LP2 pages, extended to arbitrary authentic-p56-style F-transparent skips on p35. **No plaintext, historical key, or decoder is recovered.** This excludes the strict fixed-length *boundary-only collision* mechanism, with the block length and each original page's starting phase left completely unknown.

## Mechanism and source rationale

A short-block code could explain LP2's rare identical adjacent runes if it emits a sequence without repeated neighboring symbols inside each block, then restarts or independently scrambles at block boundaries. It is human-computable using small block lengths. The original LP1 has two 5×5 wisdom matrices; this makes five-symbol blocks a meaningful prior to check, without authenticating the model. An arbitrary hidden permutation or key inside each block leaves the only necessary property unchanged: **repeated adjacent ciphertext symbols can occur only at block boundaries.**

For a page's original GP29 indices `C[0..n−1]`, define the zero-based *destination* position set `D={i: 1≤i<n and C[i]=C[i−1]}`. Suppose all blocks on that page have a fixed unknown length `L≥2`, with arbitrary start `s` in `0..L−1`. If every internal block avoids adjacent repeats, then every `i in D` must obey

`i ≡ s (mod L)`.

Therefore `L` divides the gcd of the differences between any successive members of `D`. The invariant does not require a known block phase, alphabet, cipher key, plaintext, language model, or decoder. The argument also allows each page to choose its own `L` and phase independently.

## Decisive original evidence

Input: unchanged [original numeric corpus](../resources/liber-primus/lp2-corpus.json), physical LP2 pages 0–55. It contains **12,956** runes in 55 nonempty pages with **86** adjacent-equal, same-page transitions. The following destination indices count every rune on its page from zero, including printed red text.

| Original page | Repeat destination positions | GCD of successive gaps |
| ---: | --- | ---: |
| **3** | **53, 180, 203** | **gcd(127,23)=1** |
| 9 | 63, 112, 216 | gcd(49,104)=1 |
| 19 | 18, 45, 110, 151, 212 | 1 |
| 24 | 52, 59, 106, 117, 251 | 1 |
| 25 | 31, 92, 235 | 1 |
| 27 | 15, 84, 90, 123, 229 | 1 |
| 34 | 22, 135, 211 | 1 |
| 35 | 196, 203, 265 | 1 |
| 43 | 92, 153, 196 | 1 |
| 44 | 60, 71, 152, 264 | 1 |

Already **p3 alone** contradicts every `L≥2`: a positive integer dividing both 127 and 23 must be 1. Nine other independent source pages give the same contradiction. A five-symbol-block model would need p3's three repeat positions to agree modulo five; they equal 3,0,3 instead. Hidden choice of a different initial block phase cannot fix this.

## Extension: the authentic p56 transparent-F rule cannot rescue fixed blocks

**Independent original-image control:** Agent11's separate [86-doublet/83-singleton full-resolution source audit](lp2-original-ink-critical-site-audit.md) has since located **all 86 original equal-adjacent sites on 2400×3600 JPEGs**, including p35's three doublets, without any rune correction; its [169-event pixel-coordinate manifest](lp2-original-ink-critical-sites.tsv) makes the critical pair identities image-checkable. The theorem's solitary literal F at p35 offset259 remains read directly from the canonical full-runic source, outside that event-only manifest. This audit changes no cryptographic assumptions or plaintext claims.

**New source-constrained loophole closed (Agent22, 13 November 2026).** The solved p56 mechanism transparently prints plaintext rune **F** without consuming its prime-totient key clock. That creates a motivated alternative to the fixed-clock model: allow any source-printed **F** to skip advancement of a short-block no-repeat encoder, with a freely chosen initial phase, key and **even page-specific block length**. Other rune identities cannot silently interrupt the clock under this precise p56-inspired exception rule. The skip choices are all-secret and may be chosen after inspecting the original ciphertext.

One original page is a decisive witness. On physical unknown **p35** (source image `52.jpg`), the *only* adjacent-equal pair destination offsets are **196 (TH), 203 (J), and 265 (T)**. The only printed F inside these two intervals is at **259**. All positions count original GP29 runes, including printed headings and punctuation-free positions.

| Original p35 interval between repeat destinations | Visible offset gap | Possible F-bypasses within the interval | Active-clock gap |
| --- | ---: | ---: | --- |
| 196 → 203 | **7** | **0** | **7** |
| 203 → 265 | **62** | **0 or 1** (only F at local259) | **62 or 61** |

If repeated adjacent outputs are allowed **only at a block join**, the clock offset between any two such events must be divisible by its fixed block length `L≥2`. The first interval forces `L | 7`, hence **L=7**. But neither 62 nor 61 is divisible by 7. **There is no allowed skip assignment, page-start phase or fixed L≥2 that can explain p35**, even if every other physical page uses a different block length, an independent alphabet and a different secret key.

The obstruction is robust to a small error in counting transparent Fs: with the first seven-rune interval fixed and F-free, the second 62-rune interval would require at least **six** transparent F positions to shorten the active gap to 56, a multiple of seven. The original has **one**. Five additional unrecorded F-rune bypass sites would need to be supplied, and no ordinary one-glyph correction there can rescue the fixed-period mechanism.

This is stronger than the earlier nontransparent gcd-one result for this **specific** author-motivated exception channel. It remains a necessary-condition theorem about *boundary-only repeats*, without recovering plaintext or proving the true generator. A model with changing block lengths **within p35**, extra resets at some other explicitly instructed symbol/word boundary, non-F transparent exceptions, or permitted within-block equal pairs is outside the excluded family. The fact that only 86 of 12,901 adjacent pairs repeat remains valuable structural evidence, but no decoder follows from this exclusion.

[Dedicated original-cipher, positive-control CJS certificate](../sims/lp2_ftransparent_fixedblock_gcd_sft.cjs) asserts the three exact p35 repeat events and printed F placement, proves the two incompatible divisibility conditions, and verifies a synthetic 7-block source-shaped plant where inserting one literal F changes an observed 8-rune gap into seven clock steps. No language fitting or unknown-key brute force enters the proof.

## Exact minimum repairs for the author-visible five-block model

Even if an encoder permits occasional repeated runes *inside* its blocks, original exceptions cannot be confined to rare one-off errors. Fix the candidate block length L and let the phase be wholly unknown. There are exactly two optimistic choices: one common block phase across the book, or a separate phase chosen *after seeing ciphertext* for each original rune-bearing page. All original adjacent-repeat locations are retained.

For each page and candidate phase, count observed repeats at that phase. This is the **maximum possible number of repeats explained as block joins**. Subtract the maximum from the original 86 to get the exact minimum count of repeats that must occur strictly inside blocks, requiring an exception or another cipher rule. The phase is selected to favour the hypothesis, so this is a rigorous lower bound for every untested secret cipher key in that model.

| Block length L | Minimum internal repeat exceptions with one common page-relative phase | With arbitrary independent page phase |
| ---: | ---: | ---: |
| 2 | 35 / 86 | 17 / 86 |
| **5** (original LP1 five-by-five motif) | **64 / 86** | **34 / 86** |
| 8 (printed numeric-table columns) | 67 / 86 | 37 / 86 |
| 16 (p15 number-square cells) | 75 / 86 | 41 / 86 |
| 32 (printed numeric-table rows) | 80 / 86 | 43 / 86 |

Thus the direct source-motivated length-five architecture demands at least **34 within-block exceptions**, even granting every page an optimally and independently chosen start phase. With one shared phase relative to each page start it demands **64**. These are exact minimum values, not a probability model. They refute a *small exceptional repair budget* under fixed five-symbol blocks, without fitting plaintext or assuming any key.

## Original printed-word and line boundaries cannot explain the collisions

To test whether a *variable-length, human-visible* block reset could rescue the same no-repeat idea, the SFT aligns **every original rune** against the full 2014 master transcription `resources/transcriptions/liber_primus_master.txt`, retaining hyphen and full-stop word/clause separators and slash-coded physical line breaks. The 55 original pages verify **12,956/12,956** rune identities against the separate canonical numeric corpus, giving the following exact partition of all 86 adjacent-equality events:

| Physical reset candidate | Repeats at these visible breaks | Repeats strictly inside its blocks |
| --- | ---: | ---: |
| Printed word/clause separator | 23 | **63** |
| Printed line wrap | 4 | **82** |

On original **p3**, all three equality events at 53, 180 and 203 occur **inside printed words and lines**; none is rescued by punctuation. Both displayed columns are direct counts of the unchanged manuscript, independent of any secret key or decoder. Thus models enforcing duplicate-free output *within each printed word*, or *within each printed line*, also fail without substantial internal exception rules. The blocks are variable-length and source-visible here, so this is logically distinct from the fixed-size gcd theorem above. The broader architectural inference is that the original collision suppression appears inside the runic text stream itself and cannot be assigned solely to joins between the principal visible formatting units. This remains an inference about cipher design, with no plaintext recovered.

## Reproduction and constructive control

[Single runnable CommonJS test](../sims/lp2_block_boundary_repeat_gcd_sft.cjs) reads the original numeric GP29 corpus, asserts 55 pages / 12,956 runes / 86 page-local adjacent repeats, fixes both page3 and page9 repeat positions, enumerates periods 2–1,024 under every unknown phase, and checks ten independent gcd-one witnesses. It also asserts the exact minimum internal-repeat exceptions under periods 2, 5, 8, 16 and 32, granting independently optimized page phases. A separately aligned original-transcription pass checks 12,956 rune identities and the exact 63/23 word and 82/4 line split. The general integer-gcd theorem extends the exclusion beyond that numerical range.

As a source-shaped positive plant, the test constructs a 217-symbol 29-alphabet sequence with a five-rune block phase at 2 and 43 repeated adjacent pairs **only** at the eligible block boundaries. The same detector accepts the planted length-five phase and rejects length four. The actual committed SFT source was independently executed using the exact current GitHub corpus with ordinary assertions and logged **PASS** on 13 November 2026; no CI was needed.

## Interpretation

Fixed-length blocks whose internal encoder forbids adjacent ciphertext repeats are excluded **even if every block has an unrelated secret key and every source page chooses its own fixed length and phase**. This includes the specific explanation in which all 86 repeats are innocuous joins between independently generated duplicate-free blocks. The ciphertext's low adjacent-repeat count must have some other explanation.

A **changing-length** partition, a cipher that permits occasional internal repeats, a global predecessor-dependent no-repeat transform with explicit exceptions, or a layout-dependent marker/insertion channel can generate the observed locations. This theorem does not test those families and provides no reason to choose one. Its practical use is to eliminate an otherwise unconstrained key/phase sweep for a complete class of human-plausible small-block mechanisms; the priority remains an author-selected reversible cipher that recovers actual prose.


## Deterministic cycle-walking domain decision (Director #2893, Agent8, 26 November)

**Decision:** deterministic first-return cycle walking supplies an exact reversible mechanism only after a valid common domain has been selected. The strict four-rune no-adjacent-repeat domain fails both the original ciphertext and authentic native plaintext controls. No source-selected rank, framing, exception grammar, key or LP2 decipherment is recovered.

The genuine historical construction is John Black and Phillip Rogaway, [*Ciphers with Arbitrary Finite Domains*, CT-RSA 2002](https://web.cs.ucdavis.edu/~rogaway/papers/subset.pdf), §4 and Fig. 2. For a finite ambient permutation P on T and subset M, define the sender on M by the first positive iterate P^j(x) that lies in M. Inverse applies P^{-1} until the preceding point in M. Existence follows because every x in M is on a finite permutation cycle containing x itself. Each cycle restricted to its M members is a cyclic permutation. This is an exact, deterministic receiver; no skipped-iteration count is required for an input already in M. The paper explicitly extends the idea beyond integer intervals to other efficiently recognizable domains in §6.

The p15 4×4 motif suggests four-rune blocks as a tentative experimental unit, **not an authenticated four-rune block clock**. On GP29 define T as all 29^4=707,281 four-rune tuples and M as the 29×28^3=636,608 tuples having no adjacent equality. Its complement has 70,673 tuples. A public test rank is the first GP index followed by three base28 digits: each digit is the cyclic successor difference in 1..28, less one. This is bijective on M; its inverse reconstructs each successive rune by modular addition. No first-party instruction selects this ranking.

With test permutation P(x)=x+1 mod 29^4 on ordinary base29 integers, the SFT validates **636,608/636,608** exact rank/unrank and first-return inverse pairs. The permutation is a correctness control, not an asserted historical key or a secure cipher. Extending first-return to an arbitrary input outside M is not injective: `[0,0,0,0]` and the allowed tuple `[28,27,28,27]` both return `[0,1,0,1]`. In general each non-M point whose cycle intersects M shares its first hit with the preceding M point; a cycle disjoint from M never hits at all. No choice of secret permutation rescues unrestricted T→M injection because |T|>|M|. A distinct plaintext representation could supply an injection into M only by restricting the allowed inputs, expanding the output, or adding recoverable state. This is not a general rejection of format-preserving encryption.

**Original complete-block membership**, using physical page-local phase s and dropping incomplete prefix/suffix blocks (therefore deliberately favourable to the candidate):

| s | Complete four-rune blocks | Blocks outside M |
|---:|---:|---:|
| 0 | 3219 | 54 |
| 1 | 3207 | 72 |
| 2 | 3188 | 65 |
| 3 | 3177 | 63 |

Even granting an independently optimized phase for every page, at least **30 complete blocks across 20 pages** are outside M. These are additional concrete four-block domain-membership measurements; the existing gcd proof above already excludes a strict boundary-only explanation for all 86 page-local doublets. The phase-zero figure excludes fringe blocks and must not be mistaken for the count of all internal doublets under a continuous clock. Cross-block equality is permitted; any internal duplicate is forbidden by M.

Native controls: reproduce the independently established p56 plaintext exactly (prime-totient subtraction, F transparent at original index56 only) and use clear p57. Their counts of inadmissible complete blocks for phases 0,1,2,3 are respectively **[3,2,2,2]** and **[1,1,0,1]**. Thus even choosing a favourable phase cannot encode the authentic p56 plaintext as raw consecutive GP29 tuples within this domain. This is a necessary-format test, not a claim the historical p56 cipher is cycle walking.

The source does not identify an exceptional-block family or injective native representation, so the strict common domain fails before a key search. Generalized domains admitting doublets, a genuinely source-fixed escape format, or a rank-coded plaintext language are not excluded by this test; each requires independently selected operands and a complete recoverable decoder. The [source-visible side-information analysis](lp2-no-repeat-source-visible-channel-capacity.md) already addresses broader enumerative escape carriers. Do not duplicate it or fit exception positions from the ciphertext.

[Reproducer](../sims/lp2_four_rune_cyclewalk_domain_sft.cjs) committed as 9a1451113b4c0e1cb6f001e83dad82027d6a96ae. The exact test body executed in connected V8 against canonical source blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 with strict assertion shim; all assertions passed. No separate Windows CI claim. No unselected permutation sweep, no original plaintext candidate.
