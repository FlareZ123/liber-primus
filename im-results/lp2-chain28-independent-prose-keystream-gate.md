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

## Cryptanalytic consequence

A long natural-prose running key is **not automatically white noise**: convolution of two sharply nonuniform 28-class plaintext/key profiles retains nonuniform Fourier components. This full-tape result quantifies why hunting for further philosophical books as **independent ordinary-GP28 running keys** has low value in this sender model, even with natural affine relabelings, **before** choosing exact titles or offsets.

The stronger competing explanations are a high-entropy/nonlinguistic key, a key **dependent on plaintext or ciphertext**, a changing or permuted symbol register, a hidden-symbol channel, or an entirely different cipher. All remain live, and the original text alone does not choose between them. A new investigation should begin with a source-indicated **actual key-generation operand and clock**, or an original-cipher invariant that differentiates the competing mechanisms, not by multiplying the same independent-prose-key hypotheses.

**Reproduction:** run the single-file source test at [sims/lp2_chain28_prose_convolution_sft.cjs](../sims/lp2_chain28_prose_convolution_sft.cjs) using Node.js 22 and the existing canonical GP29 source, LP1 derived source, and frozen language controls. It asserts the original 28-bin histogram and all original runes, executes both profile-normalization scans, tests exact forward/backward GP28 chains on source-text plants, and computes seeded control distributions.

This is intermediate evidence; **no modification to the authoritative LP2 solved status follows.**
