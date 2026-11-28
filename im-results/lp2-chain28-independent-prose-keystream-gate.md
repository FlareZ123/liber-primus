# Original full-tape GP28 chain: independent prose-key convolution bound

**Classification (Agent11, 28 November 2026):** Conditional, original-cipher key-source-class exclusion. A complete, reversible GP28 chained encoder/decoder has been implemented for a **known key**, and the full original 12,956-rune tape has been tested against a finite family of independent prose-key marginals. No original key, unknown-page plaintext, page-56 hash preimage, or intended cipher operation was recovered. This does **not** establish that LP2 is a GP28 chain cipher.

## Causal question, not another key-title search

The original unknown pages contain **86 equal adjacent runes across 12,955 global positions**, making a precursor-excluding 28-step alphabet a plausible but **unproven** model. Existing work has directly tested particular books, prime sequences, and periodic keys. The different question here is whether *any unrelated ordinary-prose running key* of the same broad native-alphabet profile can plausibly produce the observed nearly flat **28 nonzero step classes** under a natural chained cipher, without choosing an exact text or starting offset.

Freeze the following **hypothetical, exactly invertible** transition with 29 GP glyph values and modulus28 (the reserved symbol EA has index28):

- Plaintext P=EA: emit difference D=0.
- Otherwise: emit D=1+((a P + sigma b K) mod28), with a and b units modulo28 and sigma in {−1,+1}.
- Emit C_i=(C_(i−1)+D) mod29. Decode a nonzero step using P=a^(−1)(D−1−sigma b K) mod28 and zero as EA.

The key's EA glyph either becomes residue0 (direct mod28 convention) or is skipped while consuming the next key rune. The key itself is independently produced ordinary prose. Neither convention is a first-party Cicada instruction; the second is included as a sensitivity check.

**Mathematical advantage:** Under independence of *plaintext symbol and key symbol at each position*, the model's predicted conditional distribution of each nonzero difference is the **28-point circular convolution** of their source unigram profiles after the affine transforms. It does not depend on which particular native text or offset is chosen. This allows a source-class test with no trained cipher key, phase, or inferred candidate plaintext.

## Six frozen source profiles, all permitted affine choices

The source profiles are the existing 2,916-symbol GP29 LP1-clue native reference, Shakespeare, Gibran, Emerson, corrected Old English *Beowulf*, and GP-transcribed Latin Vulgate. They cover Cicada-derived material, several English prose styles, and two plausible ancient-language alternatives. Latin and Old English inputs are **language controls**, not alleged original LP2 sources.

For each ordered plaintext/key profile pair (**36**), enumerate all 12 invertible 28-ring plaintext multipliers, all 12 invertible key multipliers, both signs, and both key-EA conventions: **20,736 specified profile/model comparisons**. The plaintext EA reserve remains fixed. As a separate robustness check, repeat with consistent ING-to-NG and IO-to-IA English-source spelling normalization versus default longest-rune reading, for a total of **41,472** parameterizations. Neither source profile, affine choice, sign, nor EA convention is selected by matching English words.

The unaltered **physical LP2 p0–55** concatenation has **12,956** runes, **86** D=0 transitions, and **12,869** nonzero differences. The latter have Pearson statistic **41.3802937291** against exact uniform28 (27 degrees of freedom; marginal upper tail about 0.038 under iid multinomial). This is a fairly flat distribution, not a proof of uniformity. Its complete frozen 28-bin histogram is asserted in the reproducer.

| Model family | Minimum Pearson statistic against actual 12,869 nonzero differences | Best donor pair |
|---|---:|---|
| Default GP text normalization; all 20,736 variants | **178.1626006687** | LP1 profile × Gibran key profile; a=13, b=3, sigma=−1, key EA→0 |
| Source ING/IO aliases; all 20,736 variants | **183.8932464729** | Same pair and affine operation |

These magnitudes are far outside ordinary 27-category multinomial fluctuation for fixed models. Even a liberal Bonferroni correction to the finite scan would not provide a routine fit under that iid approximation. **This is a bounded model-class rejection, not an unconditional probability of the authorship or intended solution.** GP spellings, nonstationary register, key/plaintext correlations, secret symbol permutations, and positional transforms outside the stated operation are not covered.

The exact model has **native-positive sender and decoder controls**: original-length source windows drawn from independent English corpora are encoded with the explicit (13,3,−1) chain and fully recovered with the known key. A seeded 200-trial source-native window calibration and separate uniform-random-key controls additionally check whether fixed donor marginals can discriminate genuine corpus-sized plants from the original. The executable SFT prints their quantiles. No random-control result is an original plaintext.


## Source-visible initial key: the actual 729 original opening runes, not a guessed book

A second, more direct original-cipher attack uses **the original 729 runes of LP2 physical pp0–2** as the complete key source for the untouched p3–55 continuation, rather than fitting a hypothetical independent prose profile. The 729=27² grouping is visible in the manuscript; the key-transfer premise remains **not authored**. Only four fixed source/key-clock interpretations are considered: raw GP29 glyph modulo28 versus their chained consecutive difference (zero→0, otherwise difference−1); 729-periodic repetition versus a **causal 729-symbol lag** of the original ciphertext, with both key signs in each case. The first key symbol always comes from original position0. No crib, phase, pad, text source, target page, or alphabet permutation is selected after ciphertext inspection. The output is decoded across **all 12,227 original runes after page2**. The prefix pages only supply the proposed key and are not counted as recovered plaintext.

The eight fixed GP28 inverses produce:

| Opening-source register | Key clock | Sign − IoC | Sign + IoC | p3 IoC for − / + |
| --- | --- | ---: | ---: | ---: |
| Raw ciphertext glyph index modulo28 | Repeat 729 | 0.03530249 | 0.03526745 | 0.03285544 / 0.03422086 |
| Raw ciphertext glyph index modulo28 | 729-lag causal | 0.03526726 | 0.03524824 | 0.03285544 / 0.03422086 |
| Ciphertext predecessor difference, zero→0 | Repeat 729 | 0.03525937 | 0.03525150 | 0.03665301 / 0.03315412 |
| Ciphertext predecessor difference, zero→0 | 729-lag causal | 0.03528242 | 0.03524453 | 0.03665301 / 0.03315412 |

All eight original whole-remainder readouts stay near flat symbol frequency and their complete page3 opening is nonprose. The deterministic forward encoder actually generates **the same key register causally from already generated ciphertext** in the sliding cases. Independently planted full-length Shakespeare GP29 text round-trips exactly with **all eight** schemes, beginning from the authentic 729 source glyphs. These are positive functional tests, not key authentication. This rejects the exact **opening-729 raw-or-difference causal/public-key transfer to the immediate following text** under the frozen GP28 rank-chain model and source-native English-output criterion. A secret transform of the 729-rune array, a different clock, red heading partition, or unrelated cipher is not tested; such repairs need a new independent clue, not fitted exceptions.

**Execution:** both the first independent-prose gate and the opening-729 extension are in the same [source and control script](../sims/lp2_chain28_prose_convolution_sft.cjs), which was run through the existing manual Node22 source runner. The **base version** passed [run 46111472981](https://github.com/FlareZ123/liber-primus/actions/runs/46111472981) on Windows at 05:19 UTC. The subsequent extension is separately tracked by [run 46111754665](https://github.com/FlareZ123/liber-primus/actions/runs/46111754665); consult its completion status before treating that extended CI as verified.

## Cryptanalytic consequence

A long natural-prose running key is **not automatically white noise**: convolution of two sharply nonuniform 28-class plaintext/key profiles retains nonuniform Fourier components. This full-tape result quantifies why hunting for further philosophical books as **independent ordinary-GP28 running keys** has low value in this sender model, even with natural affine relabelings, **before** choosing exact titles or offsets.

The stronger competing explanations are a high-entropy/nonlinguistic key, a key **dependent on plaintext or ciphertext**, a changing or permuted symbol register, a hidden-symbol channel, or an entirely different cipher. All remain live, and the original text alone does not choose between them. A new investigation should begin with a source-indicated **actual key-generation operand and clock**, or an original-cipher invariant that differentiates the competing mechanisms, not by multiplying the same independent-prose-key hypotheses.

**Reproduction:** run the single-file source test at [sims/lp2_chain28_prose_convolution_sft.cjs](../sims/lp2_chain28_prose_convolution_sft.cjs) using Node.js 22 and the existing canonical GP29 source, LP1 derived source, and frozen language controls. It asserts the original 28-bin histogram and all original runes, executes both profile-normalization scans, tests exact forward/backward GP28 chains on source-text plants, and computes seeded control distributions.

This is intermediate evidence; **no modification to the authoritative LP2 solved status follows.**
