# Delayed GP29 plaintext autokey: exact inversions under two collision-repair channels

**Evidence as of 2026-11-10:** two positive-controlled, original-LP2 **bounded negative results**; no original unknown plaintext, key, or destination. Across 2,016 different specified decoders, the best original manuscript likelihood remains below its matched uniform-source null. The same algorithms identify the true planted key at rank one and recover over 95% of heldout planted plaintext runes.

## Cryptanalytic question and original corpus

There are 12,956 original unsolved LP2 runes on 55 rune-bearing physical pages (physical page 50 is numeric-only); 2,896 intact rune words cross 32 printed page boundaries. Earlier tests documented both unusually suppressed adjacent repeat runes and **80 of 1,290** word-internal six-rune affine echoes of the transformation T(x)=24−2x modulo29. These ciphertext observations motivate testing an unknown delayed autokey with optional collision overwrites.

Within a reset scope, model the pre-repair output at position j greater than or equal to delay L as X[j] = P[j] + a P[j−L] modulo29. Test **all L=1..12** and **all a=1..28**. The first L ciphertext runes are unconstrained IV outputs, with hidden plaintext initial values assigned a pre-trained GP-English rune marginal. Both parameters are shared across the original book, for each of three alternative reset scopes: each of the 55 rune pages; each of the nine source runic sections, lengths [729,1145,1729,9,1894,1021,1524,1589,3316]; and one continuous 12,956-rune stream. Physical page breaks never create artificial word boundaries.

Two explicit alternate **hypothetical** emission mechanisms share a fixed collision-rewrite probability **q=0.81**, chosen from prior LP2 observations:

1. **U, uniform-other:** when tentative X equals prior published C, with probability q replace it with a uniformly selected glyph different from C.
2. **T6, manuscript-motivated deterministic target:** at original complete-word offset six or greater, if tentative X equals the preceding published C, with probability q publish T(the rune six positions earlier within that same original word). At word offsets zero through five use the same uniform-other replacement as U. If the T target equals preceding C, the rewrite can leave the emitted symbol unchanged.

These are separate candidate mechanisms, not discoveries of Cicada's underlying algorithm. Total finite family: 12 delays × 28 coefficients × 3 resets × 2 rewrite channels = **2,016 original models**.

## Exact plaintext-producing inverse and genuine source-disjoint positives

An **exact 29-state HMM sum-product algorithm** integrates over every latent ordinary or rewritten output. At a nonrepeating published symbol, the possible tentative symbol is either the published rune itself or the immediately preceding published rune. The latter is allowed only when the proposed rewrite can emit the actual symbol. At a repeated output, only an unrepaired collision or equal-target branch is allowed. Known word-local T6 history is derived from **published original cipher**, including words spanning physical pages. No hidden collision positions are hand-selected.

A separate Viterbi backtrace constructs an explicit model-consistent plaintext and rewrite pattern and verifies that every non-IV original ciphertext rune can be published again by the proposed generator. Exact reproduction *alone* is insufficient evidence for an authentic decryption because the model has multiple source preimages.

GP-English rune priors are trained on the first **240,000 characters** of the pinned Shakespeare control. Source for the blind key-recovery plants is restricted to the **independent final 60,000 characters** and uses identical physical manuscript page lengths and word-offset layout. Each genuine synthetic text was encrypted with **L=5, a=17**, with the candidate collision rule actually applied. T6 targets in the positive control are calculated from its own freshly published glyphs and its original word-offset layout.

| Heldout control fact | U | T6 |
| --- | ---: | ---: |
| Effective collision rewrites | 362 | 350 |
| True parameter rank among 336 page-reset candidates | **1** | **1** |
| True-model evidence gain per scored rune, nats | **+0.232516549** | **+0.232858684** |
| Second-best evidence gain, nats/rune | −0.117929252 | −0.122877996 |
| Exact Viterbi recovery of known source plaintext runes | **95.3381%** | **95.3844%** |
| Source-driven ciphertext re-emission assertion | passed | passed |

The positive controls have realistic nonzero repeated-output counts and deliberately hidden overwrite locations. They demonstrate concrete sensitivity to this family; they do not establish the real manuscript uses either channel.

## Full original ciphertext inversion

Each row shows the winning parameter values selected among **all 336 candidates of that model/scope**. The score is per-rune exact GP-English marginal likelihood minus that of the **exact same-channel iid-uniform-plaintext baseline** at the identical non-IV positions. For U, the probability of a published repeat is (1−q)/29, and each other rune has probability (1+q/28)/29. For T6 when target B differs from prior published symbol A, the probability is (1−q)/29 at A, (1+q)/29 at B, and 1/29 elsewhere; if B equals A, every output is 1/29.

| Channel | Reset scope | Best L | Best a | Scored positions | Model log likelihood/rune | Matched null log likelihood/rune | Gain/rune |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| U | 55 pages | 12 | 21 | 12,296 | −3.474261352 | −3.350455262 | **−0.123806089** |
| U | Nine sections | 1 | 1 | 12,947 | −3.500536087 | −3.349998571 | **−0.150537516** |
| U | Global | 1 | 1 | 12,955 | −3.500208329 | −3.349991642 | **−0.150216687** |
| T6 | 55 pages | 12 | 16 | 12,296 | −3.477733323 | −3.349585926 | **−0.128147397** |
| T6 | Nine sections | 1 | 1 | 12,947 | −3.513405335 | −3.349071565 | **−0.164333770** |
| T6 | Global | 1 | 1 | 12,955 | −3.513071522 | −3.349065208 | **−0.164006313** |

**All 2,016 original hypotheses produce negative likelihood gain, including the full manuscript-inspired T6 collision channel.** The decoded original MAP rune strings remain unintelligible. A simple delayed GP29 plaintext feedback with one fixed coefficient, under these specific priors/reset/rewrite assumptions, is inconsistent with the manuscript when compared with the matched flat-rune source; a genuine planted source instead gives a large positive gain and precise key recovery.

These measurements are exact model-conditional likelihood comparisons, not broadly calibrated statistical proof that all conceivable LP2 autociphers are impossible. They assume ordinary GP-English rune marginal, fixed q, no other hidden pad or output permutation, time-independent feedback multiplier, delay at most 12, and the documented source-aligned overwrite policy. Exotic plaintext encoding, different source genres, optional key skips, longer nonlinear state or additional cipher layers remain open. A stronger research direction is an independently identified source of genuine LP2 keystream information capable of decoding **unfitted** original words.

## Independent reproduction

- [Uniform-other exact inverse](../sims/delayed_plaintext_autokey_hmm.cjs) and its [successful full CI run 42784959115](https://github.com/FlareZ123/liber-primus/actions/runs/42784959115). Seed 0x1acf31ab.
- [Word-local six-back T6 exact inverse](../sims/delayed_autokey_t6_repair_hmm.cjs) and its [successful full CI run 42787025558](https://github.com/FlareZ123/liber-primus/actions/runs/42787025558). Seed 0x5a63a120.
- Both are complete runnable CommonJS tests with Node.js22 and no third-party libraries. Both workflows are manual only: [U](../.github/workflows/delayed-plaintext-autokey-hmm.yml) and [T6](../.github/workflows/delayed-autokey-t6-repair-hmm.yml).
- Canonical original sources: [rune page indices](../resources/liber-primus/lp2-corpus.json), [whole-word punctuation and offsets](../resources/lp2-transcription.txt), [independent English train/test](../resources/control/shakespeare_first300k.txt).

**No actual LP2 plaintext recovered.**
