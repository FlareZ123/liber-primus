# Original LP2 keyless test of reusable page, line, and section-layout substitution alphabets

**Result, 11 November 2026:** Exact equal-rune-pair invariant excludes four whole classes of arbitrary hidden GP29 positional alphabets for ordinary GP-encoded English. The strongest grants **2,300 independent secret permutation tables**. It neither recovers unknown plaintext nor determines the actual encryption.

## Why this mechanism is plausible and testable

The original LP2 pages have recurring printed line geometry, independently marked sections, and a 32×8 table of integers. A human might try restarting a secret substitution alphabet at the beginning of a printed line or page, taking the alphabet at each printed position from a fixed source table. We can test the **entire** hidden-key family without guessing a table, alignment, or secret alphabet.

For any original position \(i\), let \(s(i)\) denote its public layout state. Allow an arbitrary unknown bijection \(\pi_s\) of all 29 runes at each distinct state, with \(C_i=\pi_{s(i)}(P_i)\). For **any pair** of positions with identical state \(s(i)=s(j)\),

\[
\mathbf{1}[C_i=C_j]=\mathbf{1}[P_i=P_j].
\]

Thus the count of equal-rune pairs *within each reused state* is exactly invariant under **every possible set of secret 29-symbol permutation alphabets**. It applies to additive ciphers, affine one-to-one tables, or fully arbitrary secret bijections.

## Four exact original-input clock/state models

The [single-file SFT](../sims/lp2_layout_secret_codebook_gate_sft.cjs) consumes the unchanged [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json) and [printed-line transcription](../resources/liber-primus/lp2-transcription.txt). Source integrity assertions cover **55 rune-bearing original unknown physical pages**, **594 printed lines**, **12,956 runes**, and original nine-section rune lengths **729/1145/1729/9/1894/1021/1524/1589/3316**. Rune positions count actual printed runes, preserving original page and line breaks and ignoring punctuation. Physical p50 is a numerical-only page with zero runes.

| Allowed reusable secret permutation state | Distinct secret tables | Source equal pairs | Comparable pairs | Ciphertext same-rune fraction | Minimum of 89 matched native-GP English windows |
| --- | ---: | ---: | ---: | ---: | ---: |
| Page-relative continuous rune offset | 277 | 10,751 | 311,132 | **0.0345545** | 0.0580686 |
| Printed line-relative rune offset | 26 | 126,508 | 3,638,562 | **0.0347687** | 0.0584014 |
| Printed two-dimensional (line ordinal, rune column), resetting each page | 301 | 10,510 | 301,221 | **0.0348913** | 0.0575557 |
| Source section + printed (line ordinal, rune column), resetting each page | **2,300** | **1,433** | **40,404** | **0.0354668** | **0.0567766** |

For scale, fully uniform GP29 gives equality probability **1/29 = 0.03448276**. These original fractions stay close to uniform even when 2,300 arbitrary independently keyed alphabets are permitted. Reassigning those keys can *never* alter the same-state equal-symbol counts.

Native GP29 controls are drawn from the repository Shakespeare, Gibran's *The Prophet*, and Emerson's *Essays*, using greedy GP tokenization and the established Latin spelling normalization. The SFT takes successive 12,956-rune windows at strides of 6,478 GP symbols, yielding **32, 8, and 49 windows respectively**. Each control window is partitioned by exactly the **same original 55 page lengths, 594 printed line lengths, and nine section lengths** as the ciphertext. Windows overlap, so the comparison is descriptive rather than 89 independent significance tests.

For the most permissive nine-section/2D-layout model, the native-control equality fractions are:

| Control | Windows | Minimum | Median | Maximum |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 32 | **0.0567766** | 0.0604643 | 0.0646223 |
| Gibran | 8 | **0.0583111** | 0.0616028 | 0.0632611 |
| Emerson | 49 | **0.0594248** | 0.0629393 | 0.0676418 |

The lowest matched native control has **2,294/40,404** equal pairs, versus only **1,433/40,404** in the original ciphertext. Thus every GP29 plaintext in this sampled source register is impossible under the stated entire hidden-alphabet family, regardless of the value of any secret key.

## Exact positive control and cryptanalytic consequence

The reproducer independently constructs a random **29-rune secret bijection at each of the 2,300 source states**, encrypts a full 12,956-rune native-English plant using those original states, and inverts **12,956/12,956** runes exactly. The planted ciphertext has **2,471/40,404** state-reused equal pairs, exactly matching its plaintext, proving the invariant under precisely the claimed adversarial model.

**Decision:** retire fixed GP29 page-reset or line-reset positional substitution codebooks, including independently keyed (section, printed line, column) substitutions, as mechanisms for ordinary GP-English plaintext. This remains a language-register constraint rather than an absolute mathematical impossibility for deliberately high-entropy input.

A genuinely live alternative needs **a changing secret alphabet when the same public state recurs**, a plaintext-dependent or hidden-history state, a multi-rune/block transform, alternate encoding, or another channel. The p50 grid's role as a key is unverified. No plaintext or authentic decryption operation is inferred from the invariant.
