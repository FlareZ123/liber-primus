# Original LP2: all-secret 256-word periodic codebook obstruction

**Agent34, 15 November 2026. Decision:** The original ciphertext is incompatible with unchanged-word, source-native GP29 English under **any secret fixed symbol bijection reused every 256 printed words, separately for each position within a word**. This is an exact necessary-condition invariant with independently generated English controls, not a plaintext recovery, Cicada-authenticated mechanism or key.

## Plausible source path and weakest assumption

Physical LP2 pp49–51 print a **32×8 numerical table of 256 cells**. The unsolved physical manuscript pp0–55 contains **2,896 complete original printed words** and 12,956 runes; **2,896 = 11×256 + 80**, and the remaining **80** equals the number of cells on physical p49. These size correspondences are original-source facts, although they do not establish a shared word clock. The separate [fixed 256-value rank-driven whole-word transposition](lp2-p50-256numeric-rank-wordorder-gate.md) has already been tested and rejected on original word-length ordering; the present test instead excludes a far more generous **stationary, symbol-changing secret alphabet**. A human reader might assign the next table cell to each successive printed word, cycling back after 256 words, with a possibly different alphabet substitution at each position within a word. This is a distinct interpretation from the extensively tested 256-cell-as-256-byte pad or terminal 76+85+95-rune geometry.

The weak premise is **one table cell per whole word with a repeated 256-word clock**. No original instruction selects that unit or period; the table occurs late within the manuscript. This is an exploratory source-shape interpretation, tested before guessing any key. The grid's cell **values** or radix do not enter the invariant.

Let w be the complete printed word's zero-based ordinal, j its zero-based rune position, and let f be *any* independent secret permutation of the 29 GP29 runes for each (w mod 256, j) bucket. The candidate family is:

\[
C_{w,j}=f_{w\bmod256,j}(P_{w,j}).
\]

It permits completely unknown, arbitrarily non-linear codebooks, independently chosen for every period phase and word position. It includes direct periodic word-clock GP29 shifts and arbitrary per-position substitutions, with fixed plaintext and ciphertext word positions. It excludes models where the codebook changes between later visits to the same phase and position.

## All-key equality invariant

For any two words with the same residue modulo 256 and the same within-word position, a fixed bijection preserves equality:

\[
C_{w,j}=C_{w',j}\iff P_{w,j}=P_{w',j}.
\]

For each bucket b=(w mod 256,j), let n_b be its rune count, and n_(b,k) the count of the kth GP29 value. The following is exactly invariant under **every** choice of the unknown codebooks:

\[
Q=\frac{\sum_b\sum_{k=0}^{28}n_{b,k}(n_{b,k}-1)}
{\sum_b n_b(n_b-1)}.
\]

It is calculated without needing to know an encryption key, a byte-to-rune mapping, or the underlying plaintext. A first-rune-only version uses j=0.

**Stronger deterministic consequence:** Even if each bucket used a **possibly non-injective, arbitrary fixed function** rather than a permutation, equal plaintext symbols would still produce equal ciphertext symbols. Thus the forward implication alone gives **Q(ciphertext) ≥ Q(plaintext)** for the exact same buckets. The observed original Q is *smaller* than every source-native reference Q below, so broadening the static codebooks to lossy deterministic mappings cannot rescue this register. Injectivity is needed for a naturally reversible symbolwise cipher; the stronger one-sided result shows it is not needed for the negative gate. Randomized/homophonic one-to-many emitters with explicit state remain outside this statement.

The original runes were read from the complete canonical original transcription and checked one-by-one against the independent LP2 corpus records. The first 55 rune-bearing pages yield exactly **2,896 whole words and 12,956 GP29 runes**. Original physical line/page wraps preserve word continuity; actual printed word delimiters split them. The numerical-only p50 has no rune words, and solved pp56–57 are excluded. The original table has precisely 256 printed cells.

| Original 256-word bucket statistic | Equal ordered pairs | Eligible ordered pairs | Q |
| --- | ---: | ---: | ---: |
| First rune of each complete word | **1,000** | **29,920** | **0.0334224599** |
| Every within-word rune position | **3,340** | **96,560** | **0.0345898923** |

Both are near the uniform-rune coincidence baseline 1/29; under this architecture, ordinary GP-native prose would retain its distinctively higher positional collision count even if every key alphabet were unknown.

## Same-word-length native-GP prose controls

For each of three pinned independent English corpora, sample **1,000 whole 2,896-word books** whose **individual word lengths exactly match the source ciphertext, position by position**. Sample from each author's word pool at that exact GP29 length, with replacement. Apply the source-calibrated GP29 spellings, with TH/NG/EO/OE/AE/IA/EA digraphs, single-rune ING and IO, and historical QU/K/Q/V/Z folds. All original lengths from 1 to 14 have eligible source words. Use frozen xorshift32 seed 0x33015634.

| Source | All-rune Q mean (minimum) | First-rune Q mean (minimum) | Controls at/below original, each statistic |
| --- | ---: | ---: | ---: |
| Shakespeare | **0.080518** (0.075973) | **0.056142** (0.047794) | **0/1,000** |
| Emerson | **0.076663** (0.071251) | **0.063085** (0.055749) | **0/1,000** |
| Gibran | **0.079406** (0.074855) | **0.059526** (0.051671) | **0/1,000** |

The empirical add-one lower-tail bound is 1/1,001 for each fixed source and statistic under its stated sampled-word model. These are *conditional source-register comparisons*, not a hypothesis-search-adjusted probability that Cicada designed a particular cipher.

**Complete positive control:** A separate 29-way affine permutation is assigned to every bucket, the entire 12,956-rune original test tape is encoded and its true plaintext exactly recovered. Both exact coincidence fractions survive unchanged. Each author's sampled native-prose test also passes this inverse and invariant. The independently checked [Windows Node22 GitHub Actions run 43656545998](https://github.com/FlareZ123/liber-primus/actions/runs/43656545998) confirms all source checks, 3,000 native-book controls and positive plants.

## Research decision

The original 256-cell table supplies **no viable direct repeating per-word fixed-position codebook for ordinary GP29 prose** under any choice of its secret 29-symbol alphabets. This eliminates a large source-shaped cipher family without key hunting. The fixed-clock premise itself is an investigator hypothesis.

Still open are **stateful** table readers whose alphabet changes between visits, a stream with rune rather than whole-word timing, source-authored resets, changed printed word boundaries, transposition, a non-English/compressed intermediate register, and independent interpretations of the table. A promising future attack would need a source-defined **state transition, reset and input unit** that supplies a reproducible plaintext prediction. Repeating guesses at the static codebook cannot change the equality invariant.

**Reproducer:** [source-exact one-file Node22 CommonJS script](../sims/lp2_p50_256word_secret_codebook_sft.cjs). This read-only script prints SHA-256s of source inputs and all aggregate counters; it requires no third-party packages. It runs under the manual [Windows workflow](../.github/workflows/lp2-p50-word256-allsecret-manual.yml).
