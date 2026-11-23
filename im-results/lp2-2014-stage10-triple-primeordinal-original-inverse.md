# 2014 Stage10 filenames as three prime-ordinal LP2 locators

**Agent20 · 23 November 2026 · intermediate original-input source decision. No recovered LP2 plaintext.** [Windows Node22 complete original receiver PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45093192316). [Standalone source and original-cipher inverse](../sims/lp2_stage10_primeordinal_lp1_key_original_sft.cjs). This tests a previously unrepresented *prime-index address* hypothesis, distinct from the already rejected full-word GP-prime-sum reading of the filenames in [the earlier Stage10 word-boundary report](lp2-stage10-filenames-source-word-boundary-gate.md).

## Literal historical clue and recipient ambiguity

The original 2014 Stage10 post-square server reply, [repo-preserved exact HTML](../resources/external/2014-stage10-post-square-response.html), contains **three filenames** in order, `107.jpg`, `167.jpg`, `229.jpg`. Their names are exact primes, with one-based prime *ordinal indices*

```text
prime(28) = 107
prime(39) = 167
prime(50) = 229

prime ordinal differences = 11, 11
prime value differences   = 60, 62
```

Thus a conventional prime-index decoding yields equally spaced **28 → 39 → 50**, using only three independently published original filenames and the elementary prime sequence known to a 2014 solver. If ordinal29 means zero-based page28, three original LP2 page indices would be **28, 39, 50**. If ordinal28 selects the *first* page in a set of images originally numbered 0–57, three page indices would instead be **27, 38, 49**. The latter reading lands on the first large wing/red-title p27, fifth cuneiform unit and ten-dot marker at p38, and the first page of the 32×8 source numeral panel p49. The former lands on regular p28 GP29 text, final p39 cuneiform and red chapter, and rune-free p50 central numerical panel. These are actual original-page visual classifications, not decrypted instructions. **There is no creator-authenticated command to take prime ordinals, map them to LP2 pages, or choose which indexing convention.** The stage was served before LP2, which makes intentional advance indexing plausible but does not prove it.

As a calibration only, of the `C(50,3)=19,600` possible unordered 3-prime selections from the first 50 primes, **600** have equally spaced prime ordinals, and **28** have step exactly11; conditional frequencies ~3.061% and 0.143%, respectively, under a contrived uniformly selected subset. The original filenames are not known to be random samples from that 50-prime space, and step11 was recognized retrospectively. Neither conditional count is an authorship probability. The important typed consequence is three explicit **candidate target pages**, a finite set that can receive an actual ciphertext operation.

## Frozen original ciphertext receiver

The same historical filenames identify the source's *actual pages* in LP1, whose native GP29 solved plaintext is independently preserved: first file 107.jpg has **226** solved runes, 167.jpg has **93** solved runes, and 229.jpg has **89** runes plus the visible 1033-sum five-square. The first two exact source records are [published solved original-rune forms](../resources/external/relikd-solved-gp29-native-v1.json) and are length-checked against the [separate LP1 canonical rune transcription](../resources/transcriptions/lp1_wulfic_canonical.txt). The third potentially addresses numeric rather than runic source material.

A human wishing to use the historical images as a *key* at the proposed ordinal recipient pages could choose the simplest already-known 2014 GP29 operation: cyclic native GP29 Vigenère with one source record as key. Both algebraic signs were held fixed in advance, with page-reset at start and no learned phase, edits, or destination-specific key. Four complete unknown original page ciphertext targets were evaluated:

| Historical source image and exact GP29 key | LP2 page interpretation | Original target runes | Subtractive original page IoC | Additive original page IoC | Native solved-text plant, first block IoC |
| --- | --- | ---: | ---: | ---: | ---: |
| 107.jpg / LP1 p14 (226 GP29 runes) | zero-based **p27** | **234** | **0.03385789** | **0.03444481** | 0.07067610 |
| 167.jpg / LP1 p15 (93 GP29 runes) | zero-based **p38** | **228** | **0.03195765** | **0.03524229** | 0.07209119 |
| 107.jpg / LP1 p14 (226 GP29 runes) | one-based **p28** | **269** | **0.03420629** | **0.03384564** | 0.07000000 |
| 167.jpg / LP1 p15 (93 GP29 runes) | one-based **p39** | **240** | **0.03190377** | **0.03643654** | 0.07177673 |

Each complete original output is ciphertext-like, with unsustained accidental short English fragments and no understandable passage. The 2014 source p39 subtractive output starts **THE** followed by random-looking runes, an incidental three-rune hit with immediate failure of continuity; do not promote it as plaintext. Each target's 160–200-rune lead and disjoint 68–80-rune tail are separately printed in the Windows CI log, along with four complete original ciphertext replays and four independent solved-Cicada-native key plants. In original p50 (one-based), the exact rune count is **0**, and an original 256-cell printed numeral grid fills the page; there is no direct GP29 string for Vigenère. The zero-based third target p49 starts the same numeral panel after some printed runes. No author instruction tells how to consume it.

## Current decision and next missing input

**Reject direct native LP1-plaintext→LP2-ordinal Vigenère-key transplant** for the two unchanged runic recipient pages under both source-meaningful page conventions, both signs and declared source alignment. Preserve the **exact arithmetic progression of historical first-party prime indices** as a compact, potentially human-visible *wayfinding* observation distinct from the exhausted value/sum readings; it has no identified key, reversible manuscript opcode, third-page numeric consumer, or independently validated continuation.

A useful next research experiment needs an independent 2014-authored statement selecting *prime ordinals as addresses* and a specific key/operation on p27/p38/p49 or p28/p39/p50; without that, branching to 11-column transpositions, fitted shifts, or nonlinear arbitrary transformations would multiply coincidences. Direct Stage10 filename summation as alleged complete 107→167→229 source words was already rejected when original p26/p49 page-carry word boundaries were restored and is **not** revived here.

**Original inputs and reproducibility:** first-party Stage10 three-image HTML, original 2014 LP2 runes and p50 table, source GP29 rune chart, independent published LP1 solved native-29 key pages. Script is read-only CommonJS on Windows11 Node22; authenticated source files are exact checked-in bytes, and no unknown ciphertext was modified. [CI run 45093192316](https://github.com/FlareZ123/liber-primus/actions/runs/45093192316) reports full outputs.