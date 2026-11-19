# Cuneiform 1033/3301: source-authenticated BASE29 conversion and missing LP2 cipher instruction

**Agent21, 17 November 2026. Classification: original-cipher finite negative and documented source-operation boundary. No unknown Liber Primus plaintext, authentically selected key, reversible source cipher or destination recovered.**

## Human-readable source and the precise missing handoff

Seven original LP2 physical pages **p33–p39** contain repeated cuneiform-style numeral inscriptions conventionally read as **1033** and **3301**. The 2013 Cicada-signed TCP challenge explicitly defines the command **BASE29** using digits `0123456789ABCDEFGHIJKLMNOPQRS`, with the published worked example `BASE29 3301 → 3QO`. The same **historically authenticated** arithmetic predicts **`BASE29 1033 → 16I`**. The preceding original 2013 prime_echo source independently stops at both of these numeral values. These are real source relationships, but neither source instructs a player to join `16I3QO` into a decryption key, map each BASE29 digit to the corresponding *different* GP29 rune, or apply a repeating Vigenère / F-bypass operation. The latter steps are explicitly a single low-description-length investigator hypothesis.

Interpreting all six BASE29 digit values as GP29 indices gives **[1,6,18,3,26,24]**; the ordinary Gematria Primus rune names spell **`UGEOYA`**. Unlike a secret external key, this particular candidate is entirely reconstructible from the two original numbers and the 2013 signed arithmetic. Its six-term *periodic-key use* is still unsupported by the source.

The separate authenticated 2013 TCP commands do not supply a stronger source-selected LP2 receiver. `DH` requires participant-selected private inputs; `RAND` is nondeterministic; `CODE`, `QUINE` and `KOAN` output participant-chosen content; `NEXT` stores participant-provided text. `BASE29` alone changes a numerical representation, without specifying a cipher operator or state/clock. This is the crucial missing input. See [authenticated command audit](../resources/external/2013-tcp-server-signed-source.md), [original prime_echo](../resources/historical/cicada2013-os-original-prime-echo.sh), and [earlier cuneiform prime-family bounds](lp2-cuneiform-1033-3301-gp29-primeindex-gate.md).

## Frozen original-input test

The original-image section is bounded by the visible `&` separators in the canonical transcription: it begins **after physical p33's 91-rune preface** and ends at p39's first `&`, immediately after the visible three-dot separator and before the separate red-X section. Exact source lengths are **[123,261,271,238,228,228,119]**, total **1,468 GP29 original runes**. An earlier version of this report incorrectly included p39's 121-rune red-X tail, producing 1,589; that boundary is corrected here. With the source-derived six-key at phase zero per heading, test each of the two ordinary global signs of `C=P±K mod29`. Under the independently authenticated p56 convention, plaintext rune F (index0) bypasses encryption and consumes no key, while an original ciphertext F may be an encrypted non-F. Exhaust all such paths, including ambiguous F branches; forbid any non-F original ciphertext requiring plaintext F.

| Physical LP2 page | Marked runes | C=P+K: first impossible local offset | C=P−K: first impossible local offset |
| ---: | ---: | ---: | ---: |
| 33 | 123 | 13 | 8 |
| 34 | 261 | 14 | 101 |
| 35 | 271 | 48 | 34 |
| 36 | 238 | 9 | 105 |
| 37 | 228 | 2 | 20 |
| 38 | 228 | 0 | 82 |
| 39 | 119 | 12 | 27 |

**Every page fails under both signs**. In particular the first marked p33 source fails at zero-based positions 13 and 8, so the direct hypothesis is already contradicted before the corrected p39 boundary matters. Entire 1,468-rune direct no-bypass readouts have IoCs **0.0344082067** and **0.0346171634**, both essentially random-level against the unmodified source IoC **0.0343125510**; none yields readable GP29 prose. Re-encryption is an elementary identity for the no-bypass variant and is not a plaintext claim.

The SFT also generates both independently recognizable source-native positive controls: all seven original segment lengths filled with exact solved **p57** runes, encrypted with the same periodic GP29 key and correct plaintext-F transparency. It recovers **1,468/1,468** for each sign, with the complete inverse phase-state machine retaining a legal path. Thus the original impossibilities are properties of the original ciphertext, not a broken decoder.

**Reproduction:** [single-file CommonJS original-source SFT](../sims/lp2_cuneiform_base29_literal6_p33_39_sft.cjs) executed successfully on **Windows / Node.js 22** via the [manual read-only workflow, run 44168788930](https://github.com/FlareZ123/liber-primus/actions/runs/44168788930). It asserts the signed arithmetic example, the original p39 `&` boundary, every corrected source segment length and failure offset, and two full-length source-native plants.

## Decision and next research gate

Retire precisely the **`BASE29(1033)||BASE29(3301)` → direct GP29 periodic key → p56 F-transparent inverse** model, without inferring that a different 2013 command or nonperiodic source state has been excluded. The known 2013 source does **not** select any symbol-changing LP2 instruction for the cuneiform numbers. Repeating more divisor, index, period, sign, reflow or source-ambiguous receiver variants would only introduce unsupported degrees of freedom. A successor requires an actual independently visible reversible operator, typed content, or unknown original plaintext that can be held out. The seven-page chapter remains unsolved.
