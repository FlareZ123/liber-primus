# Opening 729 runes and p8 black243: arbitrary 243-periodic substitution cannot hide triplet equalities

**Agent7, 22 November 2026. Exact key-independent, source-conditioned negative; zero new unknown plaintext.** The source counts motivate the test without authenticating the model.

## Original-source route and missing instruction

The three-cross opening LP2 physical pp0–2 contain **262+266+201=729 consecutive GP29 glyphs**. Physical p8 has **243 black runes** after a twelve-rune red heading. The ratio **729=3×243** suggests trying a 243-position key reused on the three opening strips. If true, **three-time-pad cancellation** can constrain all three plaintext slices even if every symbol substitution remains secret. The simpler p8 key and Shamir-share variants were previously tested in [the 729-p8 study](lp2-opening729-p8black243-direct-source-gate.md), but those do not exhaust unknown substitution reuse. The first-party original does not itself command reuse or the three-way cut.

## Exact all-secret equality invariant

Freeze the complete original source string and cut after positions243 and486, keeping the genuine page and word boundaries unchanged. Grant **243 entirely unrelated secret 29-symbol permutations** `Q_i` applied identically to the three strip positions `i, i+243, i+486`. This encompasses every additive shared pad, nonlinear monoalphabetic substitution and affine stream with a repeated 243-position clock; no key needs to be found.

**Bijective equality preservation** gives `C[i+243a]=C[i+243b]` exactly when `P[i+243a]=P[i+243b]`. The observed original glyph equalities are:

| Fixed 243-rune strip pair | Equal positions |
| --- | ---: |
| First–second | **7** |
| First–third | **8** |
| Second–third | **7** |
| **Total across 729 pair opportunities** | **22** |

Exactly **221/243** positional triples have three distinct source rune identities; the other22 have exactly one repeated pair, and no group is all equal. **Every possible** secret repeated alphabet must preserve these numbers in its plaintext.

## Native-GP controls and a genuine common-key positive

The [Windows Node22 CJS SFT](../sims/lp2_opening729_shared243_anybijection_keycancel_sft.cjs) applies exactly the same three-strip comparison to **20,000 seeded contiguous 729-rune source-native GP windows** from each of three pinned public-domain English texts. The native-GP encoder uses Cicada's standard QU→CW, V→U, K/Q→C, Z→S and rune ligature conventions. All samples were fixed before any fitting to the original cipher.

| Source text | Mean equal-pair count | Lowest observed | 1st percentile | Samples at most 22 of 20,000 |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | **43.8889** | 23 | 29 | **0** |
| Gibran, *The Prophet* | **44.32015** | 21 | 29 | **16** |
| Emerson essays | **44.8576** | 21 | 30 | **2** |

Those are **overlapping source-window frequencies**, not independent formal p-values. Yet the original 22 sits at the extreme low-collision tail of all three genuine-GP language registers.

A separate true-Cicada positive uses independently solved **LP1 p6's 740-rune GP-native koan text**. Its first729 runes exhibit **72** corresponding equality pairs. Encrypting them with **243 position-specific invertible affine GP29 substitutions** reused on all three strips and decrypting with the actual keys yields **729/729 plaintext** with all72 equality pairs conserved. This tests a genuine cipher of the stated all-secret family.

An additional original-marginal control permutes each original243-rune strip's indices independently. Ten thousand shuffles, keeping each exact observed rune frequency, show the original overlap22 is ordinary under its nearly uniform ciphertext marginals; mean shuffled overlap is around24. Thus the native-GP mismatch is specifically informative about a repeated-key decoding *to ordinary GP English*.

## Research decision

The opening 729:243 numerical fit does **not** identify a reusable 243-rune key or a recoverable ordinary-GP plaintext. Any **common 243-periodic positionwise bijection**, no matter how sophisticated its 243 hidden substitution tables, must retain only 22 equalities in its three plaintext strips, which is unusual for actual Cicada and three independent English controls. This excludes a genuinely broad bounded class *conditionally on ordinary GP-English output*, beyond the previous direct-source-key and three-share tests.

Other languages, an unusually nonrepetitive source, variable-length coding, keys **changing across the three strips**, or genuine plaintext feedback remain possible. A viable continuation must supply a first-party state update/key source and predict untouched original text. The experiment recovers no unknown plaintext or historical key.
