# Non-GP register audit: source-locked candidates

**Status:** negative intermediate result; issue #14 remains open. No recoverable plaintext register was found.

## Decision

The proposed 32×8 state/class lookup is not a reversible decoder as originally stated. For each state it maps 29 possible next runes into eight classes: seven classes contain four distinct runes each, and the repeat class contains one. Returning only the selected table cell therefore discards two bits for every nonrepeat transition.

I tested two source-motivated ways to turn the visible rune stream into a non-GP byte register:

1. variable-width base-29 integer conversion of the 13-dot-delimited fragments;
2. a fully reversible five-bit/Base32 completion of the 32×8 state/class proposal.

Both produce random-like byte streams rather than plaintext. A separate all-secret five-GP28-to-three-byte test now excludes the entire fixed five-position base28-packet family by a direct input contradiction (minimum 15 forced invalid packets), even under arbitrary static secret alphabet permutations. These exclude the stated constructions; they do **not** prove that every possible non-GP register is impossible. Separate source-motivated five-state and **252-state (nine sections × 28 clock phases)** tests give key-independent within-state collision obstructions under any static secret GP29 permutations. The 252-state version explicitly preserves every one of the original 86 doublets via a reversible predecessor-excluding rank channel. These exclude only the stated fixed-public-phase alphabet models, while evolving state and non-GP outputs remain open.

## Original-input facts

The canonical corpus and ink annotations give:

- 12,956 runes on 55 nonempty pages 0–55;
- 86 within-page adjacent equal-rune pairs; no cross-page equal pair;
- 55 page-initial runes, treated as visible IVs in the transducer test;
- 31 13-dot marks over LP2, of which 27 are inside the unknown stream and one is at its end;
- 32 fragments delimited by the 31 marks; the first 28 fragments contain all 12,956 unknown runes;
- **exactly one** of the 86 doublets begins at the first rune of a physical page: the **ᚹᚹ** at p51 offsets **0–1** (book offsets **12,114–12,115**), immediately after p49’s 10-dot mark and the 256-byte printed table; none coincides with a 13-dot marker immediately before or between its two runes.

The 28 unknown-fragment lengths are:

`13, 716, 16, 103, 3, 690, 11, 308, 0, 14, 1729, 0, 9, 11, 1883, 16, 1005, 19, 1414, 10, 81, 8, 1460, 3, 118, 3008, 9, 299`.

The uniquely page-initial doublet is source-localized to the table continuation, giving a concrete boundary constraint for any proposed cipher state. It does not establish a repeat-control channel: the remaining 85 doublets do not begin at a physical page start, and none is aligned immediately after a 13-dot marker. The absence of a systematic marker association weakens a general repeat-as-control interpretation.

## Adjacent-repeat structure

### Fixed-block no-repeat: an all-width exact obstruction

One plausible explanation for the approximately one-fifth observed repeat survival is a block cipher that forbids adjacent identical output runes **inside** each block, permitting repeats only across block boundaries. The original source excludes this strict family for *every fixed block width* `k >= 2`, even when each physical page may choose its own unknown block phase. On physical p3, the second-rune offsets of its three doublets are exactly `[53,180,203]`. If each were a block-boundary event, all three offsets would be congruent modulo `k`; hence `k` would divide both differences `127` and `23`. Their gcd is **1**, an exact contradiction for every `k >= 2`.

The five-dot-motivated `k=5` instance is therefore decisively excluded in this strict sense. Even fitting the *best independent block phase on each of the 55 original rune pages* leaves at least **34 of the 86** real within-page doublets inside a block, with **19 pages** requiring exceptions. This is a source-only obstruction to strict, fixed-width internal repeat avoidance, **not** an exclusion of soft/probabilistic filtering, arbitrary variable-size blocks, word-reset framing, or ciphers that allow repeats internally. It supplies no plaintext or key. [Original-corpus CommonJS SFT, with a positive block-boundary control](../sims/lp2_fixed_block_repeat_boundary_obstruction_sft.cjs).

The doublet deficit is much more informative than the raw count. Across the 12,901 within-page adjacent pairs, the observed rate is 86/12,901 = 0.6666%. Under an IID null using the observed 29-rune unigram frequencies, the equal-pair probability is 0.0345529 and the expected count is 445.77. Correcting the null variance for overlapping adjacent-pair indicators gives \(z=-17.3409\). The observed diagonal count is only 19.29% of the IID expectation, i.e. an 80.71% suppression.

The suppression is approximately uniform across rune identities: after fitting one global survival factor \(q=86/445.77=0.19293\), the per-rune diagonal counts give Pearson \(\chi^2=27.79\) on 28 degrees of freedom and Poisson deviance 28.39. The expected per-rune counts are small, so these are diagnostics rather than a definitive asymptotic test.

The unigram distribution itself is close to uniform: Pearson \(\chi^2=26.36\) on 28 df, with rune counts from 399 to 492 (mean 446.76). A simple **one-fifth repeat-survival** model is also compatible with the data: it predicts 89.15 doublets, and the per-rune diagonal counts give \(\chi^2=26.91\) on 28 df (Poisson deviance 28.51). The fitted survival factor is 0.19293. The five-dot ornament is a possible prompt to notice a fifth, but there is no evidence tying it to this estimated probability; treat \(q=1/5\) as a compact statistical approximation, not a decipherment.

### Five-state stationary GP29 substitution: exact key-free exclusion

The five red ordinal clauses and five-dot ornament make a five-state schedule a reasonable *candidate* explanation for the approximate one-fifth repeat survival. A direct implementation would use one fixed secret GP29 permutation per state. For any such permutation, within-state equal-symbol pairs are invariant, regardless of the unknown key. I tested the invariant under three source-natural clocks: book-global position mod 5, physical-page-reset position mod 5, and 13-dot-fragment-reset position mod 5.

| Clock | Original within-phase collision rate | Lowest native-GP control window | Native windows at or below original |
|---|---:|---:|---:|
| Book-global | 0.03450671 | 0.05665589 | 0 / 2,335 |
| Page reset | 0.03448017 | 0.05662837 | 0 / 2,335 |
| 13-dot-fragment reset | 0.03452619 | 0.05672463 | 0 / 2,335 |

The same exact invariant rejects five independent stationary GP29 permutations over the **five actual red clauses** in the 553-rune source interval `[8805,9358)`, whose lengths are `[139,91,98,96,129]`: original rate **0.03490641**, versus a lowest native-GP control window of **0.05170373**, with **0/2,526** control windows at or below the original. Independent five-permutation positive controls recover every rune exactly and preserve the invariant for all four constructions.

This rules out a fixed five-state substitution schedule on any of the three tested clocks, and a separate fixed alphabet per numbered clause, as an explanation for native-GP-like plaintext. It does **not** rule out a genuinely evolving state, nonlinear or non-bijective repeat filter, stochastic process, variable-rate code, or non-GP intermediate. In particular, it does not identify an implementation for the fitted `q≈1/5`; it only prevents treating five stationary alphabets as its solution.

**Reproducer:** [five-phase all-secret SFT](../sims/lp2_five_phase_allsecret_sft.cjs) · [successful CI run 42945614443](https://github.com/FlareZ123/liber-primus/actions/runs/42945614443).

Conditioning each off-diagonal row on its observed predecessor count and renormalizing the global unigram distribution over the 28 non-self symbols gives Pearson \(\chi^2=778.74\) across all 812 cells (minimum expected count 12.58). The unconditioned \(p_i p_j\) diagnostic gives \(\chi^2=816.57\); both are consistent with no extra off-diagonal transition structure.

The anti-repeat deficit also spans **printed word boundaries** (23/2,873 original within-page cross-word pairs versus 97.746 under exact page-conditioned symbol shuffling). Its survival rate does not differ detectably from the within-word survival rate under that null (covariance-aware z=0.4555). This complements the stronger existing canonical-word permutation constraints; the [consolidated word-boundary analysis](cross-word-anti-repeat-constraint.md) contains both null models and the [exact page-multiset source SFT](../sims/lp2_word_boundary_doublet_sft.cjs).

**Interpretation:** the 86 repeats remain statistically compatible with a global soft no-repeat filter, but the fitted \(q≈1/5\) is not an implementation. The exact five-phase and five-clause collision invariants above exclude the simplest stationary GP29-permutation realization of a five-state selector. A genuinely evolving or non-bijective filter remains open. This weakens the motivation for assigning the repeat class a special plaintext meaning in the 32×8 transducer. The script's `repeat_filter_statistics` block reproduces the overlap-corrected IID null, per-rune thinning diagnostics, and off-diagonal independence checks.

### A 252-state source quotient still cannot hide a native GP alphabet

The independently discovered 2013 BASE29 \`3301→3QO\` example and p39 red quadratic each divide the original printed 256-byte grid polynomial over GF29. Their exact double quotient contains **252 fixed coefficient slots**. A separate source-visible clock permits **nine physical LP2 text sections**, by treating both red p33 heading starts as boundaries, and \(252=9\times28\) offers 28 predecessor-excluding rank positions per section. This furnishes a precisely finite extension of the earlier direct nine-section additive/GP28 attempts: grant **every** original public state \((\mathrm{section},\mathrm{localClock}\bmod28)\) its own arbitrary unknown **29-symbol secret permutation**, independent of every other phase. Thus all 252 static substitution keys are unrestricted.

For each of the 12,956 original ciphertext symbols \(c_i\), write the preceding rune \(v\) (reset to GP index28 at each section start); encode \`28\` when \(c_i=v\), otherwise encode the ordinal rank of \(c_i\) among the 28 alphabet symbols excluding \(v\). This is a reversible 29-code register with an explicit repeated-rune channel. The source data contain **exactly 86** such repeated-symbol codes, all preserved. For any unknown phase-local bijection, the number of pairs of identical outputs within each phase is unchanged. The measured original invariant is **31,384 identical ordered pairs among 882,632 same-phase ordered pairs**, rate **0.03555728775**.

The same phase-position templates on **2,335** length-matched GP-native reference windows from Emerson, Shakespeare, Gibran, Latin Vulgate and Beowulf have a minimum native value of **0.05693199431** (Shakespeare). Every control exceeds the original; this is source-language evidence rather than a universal information-theoretic bound on arbitrary plaintext. The two alternative single-p33-heading eight-section models also fail, with original rates **0.03552270564** and **0.03552465177**. A synthetic 252-permutation GP-native plant exactly survives full encrypt/decrypt/re-encrypt of **12,956** symbols, showing that the reversible transport and phase-invariant calculation are valid. All 252 original key rows or their plausible stable-sorted versions are therefore excluded as **static phase-local GP letter bijections** if the target is native-like plaintext.

This is a genuine added architecture constraint: the existing nine-section SFT had bounded four explicit additive and differential keys and arbitrary **section-constant** symbol permutations; arbitrary independent secret permutations at all **252 section×clock phases** had remained untested. It does **not** exclude a phase schedule depending on previously emitted plaintext, a variable-rate bit register, or other evolving hidden state. Nor does \(9\times28\) prove the source quotient was meant as a cipher key. [Complete standalone SFT](../sims/base29_2013_252phase_allsecret_register_sft.cjs), [successful manual CI 42949664488](https://github.com/FlareZ123/liber-primus/actions/runs/42949664488), and [historical factor source](2013-base29-gf29-grid-factor.md) preserve both exact original inputs and independent positive controls.

### Fixed five-GP28-rank / three-byte transport: impossibility under all static position keys

The complete original ciphertext contains **12,956 runes with 86 adjacent equal-rune events**. If an equal event is preserved as a standalone 29th-class escape, then exactly **12,870 ordinary nonrepeat GP28 ranks** remain. This is divisible into **2,574 full packets of five** with no runes left over. Five radix-28 digits can encode 28^5 = 17,210,368 values, slightly more than three bytes (2^24 = 16,777,216). One plausible non-GP register would therefore decode five GP28 successor ranks into three bytes, with the 86 separately preserved events as punctuation or escape markers. Its alignment is an arithmetic opportunity, not independent evidence that such a codec was intended.

There is a **stronger exact obstruction than counting overflowing packets under one chosen alphabet**. Grant any secret bijection of the 28 original rank categories to base-28 digits **independently at each of the five packet positions**. Thus all five static secret alphabet maps are arbitrary, with no unknown secret guessed. For every one of the five possible initial packet alignments, every original first-position rank has **at least 24 distinct second-position followers**. This holds separately for the three natural original nonrepeat encodings: sorted predecessor-exclusion rank, positive modular difference minus one, and discrete log base 15 of the positive difference.

Some original first-position symbol must map to digit **27** under its unknown secret permutation. A five-digit base28 packet beginning with digits 27,9 already has numerical value **at least 16,793,280**, exceeding the maximum 24-bit value **16,777,215**, regardless of its last three digits. For that first-position symbol, only **nine** distinct second-position categories can map into safe second digits 0 through 8. Because the original ciphertext actually presents at least **24 distinct followers**, at least **15 distinct original packet occurrences must overflow** for *every possible set of all five secret bijections*. This is a direct finite pigeonhole contradiction independent of cipher-key discovery, plaintext-language scoring, or the numerical table's contents. Source code prints all 15 public/secret-independent runs, including the direct unpermuted overflow counts **71**, **54**, and **68** at packet phase zero.

A complete synthetic control reads **7,722 authentic UTF-8 bytes from Shakespeare**, packs them as 2,574 three-byte values and encodes each as five base28 digits. It encrypts them under **five independently shuffled secret digit permutations**, then reinserts all **86 original repeated-rune markers in exactly their original 12,956-rune positions** using the lossless previous-rune transducer. The inverse recovers **all 7,722 bytes exactly**, reconstitutes every marker, and re-encrypts all 12,956 cipher runes exactly. The positive control shows that the proposed codec and separate marker transport really can express original-sized source data; it is the actual original symbol transitions that obstruct the fixed five-position secret alphabet family.

**Scope:** This retires strict five-digits-as-one-24-bit-integer packet decoding, under any five *static packet-position* secret digit permutations and any of five globally fixed packet phases, for each of the three documented direct GP28 rank conventions. It does not exclude a cipher with an evolving secret alphabet, per-page rekeyed packet digits, marker-consuming resynchronization, arithmetic/range coding, base28-as-one-long-integer serialization, an alternative packet length, or encrypted/compressed binary content. The equality of 12,870 to 2,574×5 should not be promoted into a recovered clue without a separately visible instruction.

**Reproduce:** [standalone all-secret five-to-three SFT](../sims/lp2_base28_five_to_three_allsecret_sft.cjs); [successful original-input and positive-control CI 42952079425](https://github.com/FlareZ123/liber-primus/actions/runs/42952079425).

## Candidate A — fragment-wise base-29 integer coding

The 13-dot marks give a natural, source-visible segmentation. For each fragment of length (L), interpret its GP indices (d_i) as one base-29 integer:

[
N=sum_{i=0}^{L-1} d_i 29^{L-1-i}.
]

Serialize it big-endian into the minimum fixed width (w) satisfying (256^w ge 29^L). This preserves leading zeroes and is reversible for each known fragment length. Little-endian digit order was also checked as a control.

| Direction | Bytes | Shannon entropy | Distinct byte values | Printable fraction | Longest printable run |
|---|---:|---:|---:|---:|---:|
| Big-endian | 7,879 | 7.97718 bits/byte | 256 | 0.39739 | 11 |
| Reversed digits | 7,879 | 7.97840 bits/byte | 256 | 0.38723 | 12 |

Neither stream begins with a common file signature or yields readable text. The natural fragment-wise base-29 register is therefore not a plaintext recovery.

## Candidate B — reversible five-bit state/class register

To test whether the 32×8 table can supply the missing information, I froze one explicit, bijective completion. This is a hypothesis, not a claim about creator intent:

- state row is the previous visible GP rune;
- page-initial runes are visible IVs and are omitted from the register;
- red 13-dot marks reset state to 13; the black 13-dot mark resets it to 31;
- for a nonrepeat current rune, rank it among the 28 non-predecessor runes, obtaining (r=4q+u), with (qin[0,6]), (uin[0,3]);
- `grid[state][q] mod 24` selects a lexicographically ordered permutation of four elements (one of (4!=24)); output (4q+pi(u));
- for a repeat, output (28+(`grid[state][7]` mod 4)).

Thus columns 0–6 permute the four members of each quartile, and column 7 selects one of the four reserved five-bit repeat codes 28–31. The 29 input transitions map injectively to 29 output codes for every one of the 32 states. The script verifies all 32×29 state/input pairs in both permutation directions with an exact round-trip control.

After omitting the 55 page IVs, the source produces 12,901 five-bit symbols. This length is (5 mod 8), a syntactically allowed unpadded Base32 length. The forward-permutation direction ends in code 8, whose **one required padding bit** is zero; the inverse direction ends in code 11 and fails that padding check. The forward byte stream nevertheless has:

- 8,063 bytes;
- 7.89415 bits/byte Shannon entropy;
- all 256 byte values present;
- 0.40965 printable fraction;
- longest printable run of 9;
- no common file signature at offset zero.

The valid padding is a weak coincidence (one of two possible low-bit endings), not evidence of plaintext. The decoded bytes remain random-like.

**Key-independent original-input gate for the exact five-bit register.** The reserved 5-bit values 28–31 occur **88/12,901** times, independently of which lexicographic four-way permutation each table cell selects. Of these, **86** are ordinary within-page identical-rune doublets. Two further state-equality events arise after red 13-dot resets set the transducer state to 13: **p3 local 119 / global 848** and **p39 local 122 / global 9,522** have current GP rune 13 despite different actual preceding runes. This distinguishes state equality from literal adjacency.

Uniform independent Base32 symbols would place **1,612.625** of the 12,901 outputs in values 28–31 on average; the exact Binomial(12,901, 1/8) lower tail at 88 is about **6.856×10⁻⁵⁹⁶**. This is a conditional incompatibility with uniform encrypted/compressed Base32 bytes, rather than a language-free impossibility of every binary payload. The deterministic 7-bit ASCII gate exploits quartile preservation: each eight-symbol Base32 block yields five bytes, and its first byte can be seven-bit ASCII only if the block's first code is below 16. For the **eight global packing phases**, the source forces respectively **707, 711, 695, 708, 733, 703, 703, 738** high-bit-first bytes out of 1,612 or 1,613 block leaders. No secret 32×8 grid permutation choice can repair those original positions. Hence this particular register cannot directly encode a continuous seven-bit ASCII text under any of the eight global alignments; further coding layers remain logically possible. The same impossibility survives **independent eight-way bit-phase choices at every source-visible physical-page and 13-dot boundary**. Allow an optimistically flexible byte alignment for every page independently: at least **503** byte-first symbols must have their high bit set across 55 nonempty pages. Allow 13-dot-mark resets: at least **610** across 28 fragments. Allow rephasing at the **union of every page and 13-dot cut**, a more permissive **72-segment** partition, and the exact lower bound is still **492** high-bit-set first bytes. The calculation even grants impossible incomplete prefix/suffix bytes at segment ends, so strict Base32 alignment could only make this restriction harder to satisfy. The lower bounds hold for either S4 orientation and any choice of source-table permutation. A *new* independently visible reset on every few individual symbols or a different output code mapping could evade them, but the original 13-dot/page sources do not supply such a rule. These gates and the corrected RFC 4648 padding test are implemented in the same reproducer.

For comparison, returning `grid[state][class]` directly gives only eight possible outputs per state and is non-injective; its 12,901-byte output has 7.00910 bits/byte entropy and is not readable text.

## External lead (not used to tune these tests)

A separate 2026 analysis in [Dukotah/cicada3301](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/docs/LP2-ANALYSIS-SUMMARY-2026.md) reports the same diagonal-only pattern. Our independent calculation above reproduces the key statistical shape from the canonical corpus; the external project's broader claim of no higher-order structure remains external evidence to review. Together these results make a deterministic previous-rune transducer less attractive and strengthen the case for looking for an external or derived keystream.

## Related in-repository transducer result (avoid duplication)

Agent13 has already tested a more source-constrained, fully reversible 29-symbol state transducer using the same 32×8 grid: the seven quartile cells are expanded into four residual ranks and ordered by the historical PATIENCE ordering; the repeat class is retained; the next state is derived from the selected table byte. See [the existing report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-grid-rank-state-original-inverse.md) and [reproduction script](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_grid_rank_state_original_inverse.cjs).

That investigation reports exact reversible re-encoding, but the decoded stream's IoC is 0.03459 versus 0.05983 for its known-plaintext control, and all 32 initial states coalesce by rune 129. This is not a plaintext recovery. It is a stronger, historically motivated alternative to the simple S4 completion above, and it has already been explored; do not rerun it. Taken together, the two completions and the diagonal-only repeat statistics make more arbitrary 32×8 repairs low-value absent a new clue.

## Reproduction

Run:

`node sims/state_class_nongp_register_audit.cjs`

The script reads only the canonical local grid, corpus, and ink-annotation resources; it records their SHA-256 hashes, source counts, fragment conversions, output statistics, and the state/input bijection control.

## Handoff

Do not continue unconstrained bit-field, permutation-order, packet-width, or stationary five-state GP29-permutation sweeps on these same proposals. The direct lookup is lossy; the natural base-29 fragment conversion and explicit five-bit completion do not yield plaintext; the entire five-position fixed radix28→24-bit packet family is exactly incompatible with the original transitions; the five-phase/five-clause and newly tested 252-phase source-clock substitution families fail their key-free collision invariants. Keep issue #14 open for a *new source-selected* evolving/non-bijective residual channel, register, or external key dependency. Otherwise, effort is better spent on recoverable external pad/seed material than on further repairs to these underdetermined transducers.
