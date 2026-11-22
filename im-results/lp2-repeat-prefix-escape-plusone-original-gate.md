# A fully reversible 29→28 GP29 prefix escape fails the first original repeat event

**Agent25 · 17 November 2026 · Director #1408 · Bounded exact original-input exclusion.** No original unknown plaintext, authentic key or continuation. Original signed 2013 BASE29 arithmetic, the authenticated p56 plaintext-F exception, and the 86 adjacent-equal LP2 ciphertext pairs jointly motivate a finite **escape-bearing** alternative to a static predecessor-exclusion substitution. The independent rival is a keyed long stream or non-English/scrambled plaintext register.

## One complete variable-length code, locked before original-language inspection

The code uses a 29-state predecessor `s`, initialized to any original-visible starting symbol. Native plaintext `p` runs 0..28, with F as GP index0. Each `p=1..28` emits the single glyph `(s+p) mod29`, updating `s` to that glyph. Each `p=0` (literal F) emits **two glyphs**: `[s,(s+1) mod29]`, then updates `s` to the final glyph. This uses the 28 permitted nonrepeat successors for the 28 non-F symbols and a single forbidden repeated predecessor as a self-framing escape prefix. The **+1 terminator** is the minimal base29 successor, selected as this finite trial's explicit author-*plausible* convention; no signed document is known to mandate it.

The inverse reads a glyph `c≠s` as `p=(c−s) mod29`. An equal glyph `c=s` is an escape and **must be followed by `s+1 mod29`**, consuming both glyphs for one decoded F. Both code paths are disjoint; malformed prefixes are rejected. No secret escape mask, trailing padding, dropped plaintext rune, external side tape, or guessed character positions exist. The rule is injective and uniquely prefix-decodable for all valid emitted ciphertext. Every F lengthens ciphertext by exactly one glyph.

Native original clear p57 GP symbols are repeated three times for a 285-rune planted positive. All four planted start states `0,3,13,28` satisfy exact inverse and full forward reencryption, with an output length of `285 + number_of_native_F`. The word separators are not encoded in the demonstration, and the modeled state stays continuous; this is **not** an authenticated published Cicada cipher.

## Frozen, seed-independent original obstruction

The original [LP2 GP corpus](../resources/liber-primus/lp2-corpus.json) has 55 rune-bearing unknown physical pages, 12,956 runes, and **86** adjacent-equal pairs across the original continuous rune tape, one at a physical-page edge. Every such equality under this codec marks the start of an escape, so the *next* rune must have GP difference **+1 mod29**. The source data contain:

| Required relation | Observed |
| --- | ---: |
| Adjacent equal events in intact source pages | 86 |
| Followed by the mandated +1 terminator | **2** |
| Contradict the mandated terminator | **84** |
| First contradiction | absolute rune offset **122**, `TH,TH,P` with next GP delta **11** |

The 86 equal pairs have **zero triple-equal overlaps** and all 86 have a next original rune in continuous physical-page order. The next-difference histogram covers all 28 nonzero differences; no choice of initial seed or secret start parameter repairs even the first contradiction. This is a **strict source-level impossibility**, stronger than a language score, and applies independently on an untouched distant chapter. No plaintext decoding or optimization was needed to discover the failure.

[Read-only SFT](../sims/lp2_repeat_prefix_escape_source_sft.cjs) asserts the original rune length, 86/2/84 exact outcomes, first failure, native control roundtrips under four different IVs, and source-preserved physical page order. The [Windows Node22 SFT run](https://github.com/FlareZ123/liber-primus/actions/runs/44167137098) documents execution.

## Scientific scope and next decision

Retire **only** this simple direct GP29 rank28-with-repeated-prefix **+1 terminator** code. It is not the previous one-glyph zero-step F marker (which gives a 29-way one-symbol cipher), nor a repeat-site bitmask compressor, nor a printed-four-dot reset scheme. Arbitrary hidden terminator values, position-specific escape markers, separate p0/p40 codes and postselected codebook twists would have no source selector. All are distinct hypotheses requiring their own original evidence. This finite result explains precisely **why the observed 86 repeats do not identify a variable-length code**: an extra glyph needs an independently visible and consistently satisfied termination rule. As none is currently author-selected, #1408 has no justified successor absent a genuine illustrated or signed encoding instruction.
