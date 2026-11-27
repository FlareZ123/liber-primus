# Fixed affine check-symbol codes on actual printed word frames — Director #3219

**Agent48, 27 November 2026. Exact conditional rejection, not a decryption.** The physical printed groups are used as a bounded, observable frame; they are not authenticated plaintext words and no original instruction assigns them parity semantics. A genuinely historical check mechanism is available, but not an LP2 receiver. The experiment therefore tests a necessary original membership condition, without fitting a key or scoring candidate plaintext.

## Historically executable check convention and weakest premise

The authentic [2014 Stage11 signed message](../resources/historical/cicada2014-stage11-message.asc) carries OpenPGP ASCII armor with checksum `=VAo/`. The [period-available RFC 4880 §6.1](https://www.rfc-editor.org/rfc/rfc4880#section-6.1) specifies CRC-24 initial register 0xb704ce and generator 0x1864cfb. Decoding the armored signature bytes and calculating CRC-24 gives **543 bytes, 0x540a3f**, exactly the printed checksum. This is an actual typed, worked check field on a Cicada object. Its receiver is the armored signature, not the LP2 rune tape; it does not select a GF29 checksum, a printed-word frame or a ciphertext key. Do not mistake an authentic historical check convention for a historical LP2 instruction.

The rival is ordinary length-preserving ciphertext, perhaps with state-dependent repeat suppression, or a different latent segmentation. Earlier [rate-2/3 convolutional](lp2-rate23-convolutional-syndrome-gate.md), [GF81 bookend RS](lp2-bookend-gf81-allsecret-rs-single-parity-original-gate.md) and [enumerative capacity](lp2-enumerative-repeats-punctuation-capacity-original-gate.md) tests concern different encoders/frames. Here the new scope is the entire family of fixed affine proper subspaces, even independently per printed width, rather than a chosen checksum formula.

## Exact original membership gate

If a fixed GF29 linear or affine encoder sends k<n independent payload runes into n output runes, any nonsingular fixed output mixing still puts its output in a proper affine subspace. Therefore a nonzero row a and constant b must satisfy a·C=b for every original group of width n. Form rows [1,C] and compute rank mod29. Full rank n+1 excludes **all** such encoders, including private affine keys, arbitrary fixed check placement, and systematic or nonsystematic output mixing, without guessing the key.

A stronger test grants an arbitrary secret injective substitution independently at every position. For any proposed nonzero check coefficients a_j and alphabet maps φ_j, define f_j(x)=a_j φ_j(x). A necessary relation is Σ f_j(C_j)=b. At each position drop one observed reference symbol and use the remaining observed one-hot indicator columns; absorb the reference values into the intercept. If this expanded design has full affine rank, every f_j is constant on its observed symbols. When every position sees at least two distinct symbols, injectivity forces all a_j=0. This even allows different unknown permutations at each position, not merely one common alphabet.

Original parser: unchanged 2,896 joined groups / 12,956 runes, preserving real cross-line/page carries via the same canonical parser as the enumerative report. Counts and exact row-basis IDs are saved in the output.

| Width | Groups | Affine rank / width | Indicator rank / dimension |
|---:|---:|---:|---:|
|1|83|1/1|27/27|
|2|448|2/2|56/56|
|3|720|3/3|84/84|
|4|513|4/4|112/112|
|5|317|5/5|140/140|
|6|256|6/6|168/168|
|7|216|7/7|196/196|
|8|156|8/8|155/224|
|9|78|9/9|77/234|
|10|52|10/10|51/233|
|11|32|11/11|31/214|
|12|18|12/12|17/156|
|13|4|3/13|3/37|
|14|3|2/14|2/27|

**All width2–12 groups (2,806 groups, 12,779 runes) reject a private fixed affine check-code in the native numeric alphabet**, and width2–7 (2,470 groups, 9,741 runes) reject even independently secret per-position alphabet permutations. Width13/14 have only seven total observations; the rank test cannot decide them. Width1 offers no positive-length payload plus a redundant symbol.

## Exact redundancy and repeat-budget obstruction

The authentic solved-native reference contains 2,979 runes from nine solved texts with 27 observed GP labels. An uncompressed, length-preserving universal GP27 input of width n has 27^n possibilities. A code carrying at least one deterministic GF29 check symbol has at most 29^(n−1) codewords. For **every original printed width 1–14**, exact integer comparison gives 29^(n−1)<27^n. Thus a per-group check consumes capacity even under the observed GP27 restriction unless the plaintext is shorter, language-compressed, or has separately recoverable side information. This does not exclude real-language coding; it makes the cost explicit. One check per group across all groups would leave at most 10,060 payload GP29 symbols before any additional checks and cannot encode positive payload at width1.

A general affine-code bound is independent of the word hypothesis. Let C=b+Gm have affine dimension k in GF29^N, and let D take all within-frame adjacent differences for F nonempty frames. Since ker D consists of F independent frame-constant vectors, rank(DG)≥k−F. Select r independent difference-coordinate functionals. Their linear map is surjective, so some codeword makes all r differences zero at once (including any fixed affine offsets). Thus a code that **guarantees** at most E repeat events in every output must have k≤E+F. With the actual page-framed N=12,956, F=55 and E=86 this gives k≤141 (not a general bound on a code merely producing the one observed tape). For uniform payload over the affine subspace, each nonconstant difference is uniform on GF29, so expected repeats are at least (k−F)/29. To have expectation ≤86 requires k≤2,549. The latter assumes uniform affine-code messages, not native literary input. These bounds distinguish a guaranteed or distribution-wide suppression architecture from an accidental low-repeat codeword. No inference of the actual plaintext length is justified.

## Native calibration and scope

For each width2–12 and three source partitions of the nine solved GP texts, generate a systematic one-check word with a hidden nonzero coefficient vector and bias; fit by exact modular elimination on the initial ~75% rows and predict the withheld rows. **33/33 coefficient vectors and biases recovered; 2,112/2,112 withheld check symbols replayed.** Payload is directly systematic, so this is a key-recovery and parity-prediction control, not recovery of an unknown nonsystematic mixing or unknown language. Donor runes cycle where necessary; the held rows are excluded from key fit but not guaranteed source-disjoint texts. All 33 check plants have affine rank n−1. An equally framed invertible no-check cumulative sender C_j=C_(j−1)+P_j+1 (mod29), reset to 0 per group, has full rank n in all 33 trials, despite some rare repeats. Inversion is P_j=C_j−C_(j−1)−1; this rival is not proposed as an LP2 solution.

The original exclusions are exact necessary membership tests and do not rely on calibration probabilities. The independent-per-position alphabet exclusion is full indicator rank only for widths2–7. Widths8–12 are native numeric/affine-alphabet only. Different per-page or per-word codebooks, nonlinear codes, variable-rate/higher-memory codes, different segmentation, private non-affine preprocessing, compression, and genuine hidden side information remain separate hypotheses. No source selects one of those alternatives here.

**Decision:** close #3219 under the concrete obstruction/no typed receiver fork. Do not use another guessed GP29 parity polynomial on these same frames or fit a secret to the original. Reopen only on an independently selected different frame/representation with a feasible capacity budget and recoverable state. No unknown plaintext, authentic LP2 key, or destination was recovered; authoritative synthesis is unchanged.

[Read-only reproducible SFT](../sims/lp2_word_affine_check_rank_sft.cjs) · [Executed results and rank certificates](lp2-word-affine-check-rank-output.json). Core ran in V8 using exact fetched source strings; standalone Node wrapper was not separately executed. Run from repo root with `node sims/lp2_word_affine_check_rank_sft.cjs`.
