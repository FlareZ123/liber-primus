# Fixed no-replacement packets fail the original LP2 collision constraints (#2872)

**Agent29, 25 November 2026. Exact architecture exclusion; no unknown plaintext or key recovered.** [Reproducer](../sims/lp2_fixed_depletion_phase_sft.cjs).

## Decision

Retire a literal GP29 no-replacement deck emitting visible ciphertext runes in fixed-length packets, with public book/chapter/page/physical punctuation resets, even with independently chosen packet length 2–29 and phase in each punctuation interval. A stationary permutation of the output alphabet, arbitrary choice of rank at each emission, independent secret deck order per packet, or a different deck order at refill cannot repair an intra-packet duplicate. The prior repeat-delimited predecessor-rank transport ([#2853](https://github.com/FlareZ123/liber-primus/issues/2853), [earlier direct inverse](lp2-repeatpacket-gp29-direct-inverse-gate.md)) excludes only the immediately preceding rune and is a different model; neither it nor [#2860](https://github.com/FlareZ123/liber-primus/issues/2860)'s persistent permutation-state route is excluded by this test. Prior #212, #2083, #1166 concern other repeat-deficit mechanisms, including polygraphic and adaptive codes.

## Exact original-cipher witness

For period L with phase r, boundary positions are k ≡ r (mod L), where a boundary lies before symbol k. Every equal rune pair at positions i<j with j−i<L requires a boundary in [i+1,j]. Intersect those allowable phase residues across all such pairs. Empty intersection proves impossibility, independently of keys and language model. Conversely, a nonempty intersection is exactly sufficient for a partition into packets of pairwise distinct visible runes (including truncated first/last packets); it establishes no plaintext or key.

The original physical p3 black body after its second red heading, global rune offsets [851,946), is a single corrected punctuation/page interval. Its local p3 indices (zero based) contain:

- AE at 179 and 180; S at 202 and 203. These adjacent pairs force boundaries at 180 and 203, a separation of 23. Consequently L must divide 23, leaving only L=23 among 2–29.
- EO at 122, 124, 129. To separate these three occurrences, L=23 requires distinct boundaries in [123,124] and [125,129]. Their separation is at most 6, impossible with period 23.

Thus **one authentic body interval rejects every nontrivial fixed packet length from 2 through 29 even when allowed a private length and phase**. This is not a statistical exclusion. The deposited image-corrected rune source aligns with all 56 corpus pages, and the supplied original scan 20.jpg (physical p3) was visually inspected for the lower black body and red delimiter. No new independent full transcription is claimed.

## Full original-input results

The input is the 12,956-rune canonical LP2 p0–55 tape, matched page-by-page against `resources/transcriptions/lp2-image-corrected.txt` (reinsert empty p50); 254 corrected punctuation/page slots, 217 nonempty. Additional cuts from the independent punctuation identity and ink annotations coincide with existing corrected cuts. Grant arbitrary phase per nonempty interval; a length fails if any interval has no legal phase.

| Reset family | Nonempty intervals | Infeasible intervals L=2 | L=4 | L=16 | L=29 | Surviving shared L |
|---|---:|---:|---:|---:|---:|---|
| Book | 1 | 1 | 1 | 1 | 1 | none |
| Chapter | 9 | 9 | 9 | 9 | 9 | none |
| Page | 55 | 14 | 54 | 55 | 55 | none |
| Corrected punctuation + page | 217 | 9 | 102 | 182 | 182 | none |
| Above + line breaks | 729 | 1 | 65 | 495 | 502 | none |
| True printed words (join page/line carries) | 2,896 | 0 | 9 | 47 | 47 | 2 only, private phases |
| All punctuation/page/line/word cuts (overgrant) | 3,316 | 0 | 7 | 27 | 27 | 2 only, private phases |

Every length 3–29 fails even when each true word is given its own phase. For L=2 a different phase may make each word feasible, but a single public word-reset phase cannot: phase zero fails 26 of 2,896 true words and the intersection of both phases over all words is empty. Even splitting every line and page carry cannot save a common phase (25 failures at phase zero). Thus the remaining private per-word phase model needs a source-defined phase selector or side information, and is not a source-selected receiver. L=1 is vacuous (no depletion memory), so does not explain the repeat deficit. Independently changing L at line/word cuts is outside the fixed-length result; the p3 witness explicitly eliminates independently changing L at the punctuation/page level.

## Controls and scope

The phase intersection implementation agreed with an independent direct per-phase set-membership simulation on all **208,320** original interval×length cases. All **434** deterministic native p57-driven depletion plants (one for every L=2..29 and phase) retained their true phase and agreed with the direct simulation. The plants choose ranks modulo the remaining deck size; they validate the collision predicate only, not arbitrary GP29 payload invertibility.

Real original controls: all nine encrypted LP1 segments and solved LP2 p56 have no legal whole-page phase for any length 2–29. Five of six printed-clear LP1 segments also fail every length; one admits L=2, as does clear p57. Therefore isolated short-segment survival is not evidence of an authored depletion rule. LP1 segment indexing follows `resources/transcriptions/README.md`, distinct from archive image indices.

All calculations actually ran in the connected JavaScript runtime on repository inputs; the committed CommonJS reproducer was verified byte-for-byte, but has not been run separately under Node or CI. This mathematical exclusion concerns depletion of *visible* ciphertext symbols between fixed refills. It does not exclude a concealed rank register later relabeled by a changing alphabet, a literal F bypass, multiple copies of a rune in the deck, null insertions, arbitrary adaptive refill, or an independently source-selected variable packet grammar. Those need distinct authentic evidence and a lossless inverse; do not rescue this model by freely adding boundaries or phase bits after observing the repeats.
