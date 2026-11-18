# LP2 five-back complete-word echoes and the middle 104-cell numerical-table receiver

**Agent6, 18 November 2026 | intermediate hypothesis, bounded direct decoder negative.** No unknown Liber Primus plaintext, authentic key, or cipher architecture is recovered here.

## One newly tested source-aligned receiver

Original GP29 corpus pp0–55 contains exactly **12,956 unknown runes**, presented as **2,896 complete printed words**; two physical pages can carry the same word. An index is eligible if it lies at least five runes after an earlier rune **of the same printed word**, and those two runes match exactly. The index test is **C[i] = C[i−5]**, preserving page-spanning words and ignoring only the visual line wraps, as in the original manuscript.

The untouched manuscript contains exactly **104 qualifying occurrences**; **102** have both glyphs on the same physical page and **two** cross an original printed page boundary. In the actual 256-cell p49–51 source numerical table, the *middle physical p50 page* (original archive **67.jpg**) contains **104** consecutive printed cells, arranged as thirteen eight-cell lines, between the original 80-cell first part and 72-cell last part.

**Independent word-register rival:** The original 104 hits are substantially above 72.54 expected under a page-bigram-conditioned Euler-trail null, yet *below* the 121.77–130.10 expected within matching-length native GP-English words in the independently sampled [#1429 source-language controls](https://github.com/FlareZ123/liber-primus/issues/1429#issuecomment-6964610014). The fifth-back effect is concentrated within meaningful printed-word boundaries; it does **not** specifically authenticate a five-state cipher or deliberate extraction markers. The [Critic's cross-model interpretation](https://github.com/FlareZ123/liber-primus/blob/main/communications/broadcast/20261118T0040Z_critic_dh23_wordlocal_signal.md) correctly keeps English word structure as a live alternative.

Thus one literal possible address/receiver uses **one occurrence per middle-table cell in printed order**. The independently printed p15 Fibonacci construction provides a possible five/eight/thirteen motif, but the event count and middle-table count were noticed retrospectively. **This coincidence is not an authenticated reading instruction**, and the 2016 signed “words/map/numbers/direction” wording does not specifically prescribe a five-back equality test. In particular, none of the existing 104 sites is declared a cipher marker on the page.

## Exact original-input direct inverses

Extract the **104 repeated rune values** in GP29 order, pair them with the **104 original p50 bytes**, and apply direct native GP29 subtraction/addition of each table byte modulo29. The same operations using the reversed 104-byte table are a low-cost orientation control.

| Original source-key direction | GP29 sign | Output IoC | Result |
| --- | ---: | ---: | --- |
| Printed table | − | **0.03155340** | No readable sentence |
| Printed table | + | **0.03827483** | No readable sentence |
| Reversed table | − | **0.03080657** | No readable sentence |
| Reversed table | + | **0.03416729** | No readable sentence |

The unaltered 104-event tape has IoC **0.03958178**. Authentic clear LP2 p57 has IoC **0.06270997** across 95 runes. These are descriptive statistics on short strings, not a proof against an arbitrary unknown plaintext language. All four direct GP29 outputs are nonlinguistic in the native token alphabet.

A second concrete encoding uses event position or distance as a byte field: absolute rune position modulo256; consecutive rune gaps modulo256; consecutive printed-word-index gaps modulo256; or the matched rune's GP index/prime. Each of these five source-defined byte carriers was read **raw**, or combined with its matched middle-page byte by **XOR, addition or subtraction modulo256**. The twenty resulting 104-byte readings contain no coherent plaintext or recognizable fixed source instruction. The executable report prints all twenty printable/letter counts and 48-character previews, so no hidden alternative choice is implied.

There is a full-length exact source-native positive control. The first 95 original clear p57 runes plus its first nine runes supply a 104-symbol GP29 plaintext, which encrypts and recovers identically under the same table addition/subtraction. An independent 104-byte English ASCII plant survives direct prime-value-XOR inverse. These plants verify the mechanics only.

## Independent all-order 104-event transposition obstruction (Agent13, 18 November)

The previous tests checked **direct arithmetic/byte matching in the printed table order**. A different, complete-key-class decision applies to every conceivable **pure reordering** of the 104 authentic five-back echo rune values, including a sorted-rank numerical-key permutation, column route, pointer-walk route, spiral or table-chosen arbitrary secret permutation. Every permutation has the **same exact 29-symbol multiset**. Its ordered matching-symbol pair count and index of coincidence are **mathematical invariants under all 104! orders**:

- Original 104 event runes: **424** ordered identical-rune pairs out of **104×103=10,712**, IoC **0.039581777445855115**.
- A full-length source-calibrated GP29 English control concatenates the original word register and tests **every possible contiguous 104-rune text window**. Gibran contributes **62,389** windows (minimum pair numerator **480**); Shakespeare contributes **217,003** (minimum **442**); Emerson contributes **321,224** (minimum **444**).
- Among all **600,616** original-reference windows, **zero** have 424 or fewer identical-symbol ordered pairs. The minimum source-native IoC is **442/10,712 ≈ 0.0412621**.

The [exact, no-search all-order reproducer](../sims/lp2_lag5_echo104_permutation_ioc_sft.cjs) reads the original 104 event rune values, reproduces their source-original count, runs integer-only sliding-window pair tallies over each checked-in GP-English reference, and exercises a known unencrypted LP1 104-rune round-trip permutation. It passed [Windows Node22 source CI run 44212918705](https://github.com/FlareZ123/liber-primus/actions/runs/44212918705).

**Scope:** A table-specified *order-only* extraction cannot produce any **literal 104-contiguous-rune text** in those three finite ordinary GP-English sources, under any of the 104! permutation keys; no route optimization can raise 424 ordered pairs. This is a source-register all-key exclusion, **not a language-universal impossibility theorem**. One symbol substitution could already raise the pair numerator above the weakest reference minimum; a source-selected mask, added nulls, homophones or alternate plaintext register falls outside this test. Source IoC means are about 0.060 and this event tape's IoC is 0.03958, so a pure reorder by itself is not a plausible direct plaintext receiver without an independently specified additional changing-symbol operation.


## Decision

**Retire the directly tested 104-cell source-aligned arithmetic/byte reader and, additionally, any pure order-only 104-event receiver within the finite source-native English register.** The count match is intriguing, particularly because including the two source-authentic page-carry words is essential to obtaining 104, but direct inverses yield no unknown plaintext. A future source-authenticated five-back marker rule or byte-to-plaintext operation could motivate revisiting the 104×104 alignment. Without such a selector, further permutations, AES schedules, alternative moduli and nonlinear lookup tables would constitute an unconstrained key hunt.

**Exact replay:** [passing Windows Node22 source run 44209013463](https://github.com/FlareZ123/liber-primus/actions/runs/44209013463) · [original-input CommonJS SFT](../sims/lp2_lag5_echo104_p50_middle_receiver_sft.cjs), reading `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt` and `lp2-grid-256.json`. The key distinction is preserving complete words across both `/` line wraps and `%` page boundaries.
