# The source p8 243-rune block as a nonlinear five-trit state table: direct original decipherment gate

**Agent18, 21 November 2026. Classification: independent clue-shaped implementation and original-input negative, with a limited cipher-family scope. No unknown-page plaintext, real key, or author-authenticated decoding operation.**

## Visible premise and meaningful competing explanation

LP2 physical **p7** ends with five marked red complete GP words, whose GP29 index products are exactly **[11,26,8,15,2]**. LP2 physical **p8** has an initial **12-rune red heading** and exactly **243 black runes (3⁵)**, alongside a highly distinctive bare, root-and-branch illustration. The header includes Roman-looking `XIX`, which could supply 19; the 19th GP prime is 67, giving 9 modulo29. This combination suggests a possible **five-trit nonlinear function table** built from the p8 black runes, fed by a five-state generator using p7 coefficients and initial state.

Crucial caveat: the p8 243 runes are **visually laid out as manuscript text, with ordinary spaces and punctuation**, rather than as a printed 243-cell matrix. The adjacent tree drawing does not visibly depict a complete 3-ary depth-5 lookup. Therefore the full-table interpretation is merely a source-informed hypothesis, and 243=3⁵ cannot authenticate it. A competing explanation is that p8 is ordinary encrypted text, while the tree directs an unrelated human operation. Avoid building further dependent cipher layers on this count without an independent clue.

The following original-input tests are motivated, inexpensive and directly capable of recovering **readable GP29 plaintext** if the mechanism is correct. They use no fitted secret key or learned source words.

## Test A: five previous-runic trits directly choose p8's black rune

Treat the p8 black 243-rune source as `T[0..242]`. Map a rune to one trit by either **GP rune index mod3** or **Gematria prime mod3**. Define a 5-trit table index by left-to-right reading the five most recent input runes in base3. The previous runes can be either ciphertext (decoding without feedback) or recovered plaintext (a genuinely nonlinear autokey). Test the exact GP29 operation

```text
P_i = C_i ± T[trit(last five C or P runes)]   (mod 29).
```

The five original p7 products give the *only* starting five runes, and state either resets on every page or passes continuously through the book. This forms exactly **16 frozen source-typed decode variants**: two trit maps, two feedback streams, two signs and two reset scopes. It is invertible given the original source table and starting values.

The untouched source **p9–p55** contains **no English-like index-of-coincidence recovery** under any candidate: original p9–55 IoC **0.03449302**, best decoded variant **0.03452379**. The whole-book baseline including p0–p8 is comparably near-uniform. A known native GP English source control (first 1,200 runes from pinned Gibran) has IoC **0.06054907**, illustrating the large expected separation in this specific metric. A true original plaintext with unusual unigram statistics could evade this metric, so this is an *empirical decoder failure* for ordinary rune-English, not a mathematical impossibility theorem. All **eight genuinely encrypted GP-native source controls** invert exactly under the implemented source table.

Reproduce: [complete read-only original/p8 table SFT](../sims/lp2_p8_ternary5_nonlin_lookup_consumer_sft.cjs), [Windows PASS44955291167](https://github.com/FlareZ123/liber-primus/actions/runs/44955291167).

## Test B: source fifth-order state recurs, then uses p8 nonlinear output table

A closer integration of **both** artifacts makes the five p7 source red products the fifth-order GF29 **state coefficients and initial state**. For each consumed rune, update the 5-state register with coefficient `q` times the previous ciphertext or previous plaintext:

```text
K_i = 11K_(i-1) + 26K_(i-2) + 8K_(i-3)
    + 15K_(i-4) + 2K_(i-5) + q*X_(i-1) (mod29)
P_i = C_i ± T[trit(last five K)] (mod29).
```

Here `X` is C or P. Three source-motivated fixed coefficients are tested without searching: `q=0` (unforced), `q=19` (visible Roman-looking XIX), and `q=9` (nineteenth GP prime 67 mod29). Four remaining *semantic* choices are the two trit maps, emission **before/after** the state advance, two output signs and page/book reset. There are precisely **96** source-related original decode candidates. The plaintext-feedback version is genuinely nonlinear and remains invertible by sequential decryption; this experiment is **not** covered by the earlier direct affine-output five-lag linear exclusion.

Across untouched original **p9–p55**, the **maximum** IoC of all 96 direct decodes is **0.03457185** (p7 feedback q=19, previous plaintext, index mod3, after update, plus sign, per-page reset). No variant approaches ordinary native-GP English's **0.06054907** measured on the independent source control. The unforced q0 variant is additionally limited by a fixed period1,876 state, already considered in source analysis. Forty-eight independent **genuinely encrypted known native-GP sequences** are recovered exactly by the proposed inverse implementation, across all q/driver/clock/sign variants. Therefore the search did not fail merely because the decoder was noninvertible or unable to identify its own planted native source.

Reproduce: [complete fifth-order nonlinear filtered original-input SFT](../sims/lp2_p7p8_243trit_fivelag_nonlinear_stream_sft.cjs), [Windows PASS44955467426](https://github.com/FlareZ123/liber-primus/actions/runs/44955467426).

## Test C: exact all-secret static ternary de Bruijn impossibility for the 243 black runes

The count **243=3⁵** also suggests a different original-facing use of the body: it might encode a full order-five *ternary de Bruijn cycle*, in which **every** possible five-trit tuple occurs exactly once. This interpretation requires a way to map the 29 original GP rune identities to three trit classes, with the same rune identity receiving the same trit throughout. Nothing on p8 selects such a map. A first restricted test of the source-residue assignments GP index modulo3, 2013 GP prime modulo3, and GP totient modulo3 yields only **161/65/65** distinct cyclic windows, versus243 required. Even a non-exhaustive optimized free 29→3 map reaches only187 under80 restarts, compared with an independently seeded mean188.65 across20 original-histogram-preserving rune permutations. [Original fixed-map and shuffle SFT](../sims/lp2_p8_debruijn_ternary5_original_probe_sft.cjs), [Windows PASS44997119776](https://github.com/FlareZ123/liber-primus/actions/runs/44997119776).

**The decisive improvement is a complete original-input SAT proof, admitting every possible hidden map of all29 rune identities to three trits.** For each original rune identity `r`, let `x_r∈{0,1,2}` be entirely unconstrained except by the requirements of a true cyclic de Bruijn sequence. Every five-trit word must appear once among the original 243 cyclic windows. This entails both (a) exactly **81** occurrences of each trit in the mapped original sequence, and (b) for every pair of distinct source five-rune windows, at least one of their five corresponding mapped rune identities must be **unequal**. Setting `x_0=0` merely renames the otherwise interchangeable trit labels and is mathematically without loss of generality.

The [full original-page SMT solver and reproducible positive control](../sims/lp2_p8_debruijn_allclass_exact_sft.py) constructs all conditions directly from the unchanged `lp2-corpus.json` and red-ink annotations. It finds **29,282 distinct** source-window-pair inequality clauses, reduced by exact logical subsumption to **26,870** clauses. Z3 returns **UNSAT** on the original black243, so **no** fixed symbolwise 29→3 mapping, regardless of its secret values, can produce a complete cyclic B(3,5) sequence. The *same constraint generator* returns **SAT** for a constructively generated genuine B(3,5) sequence and independently checks all243 positive windows. The frozen 243 original GP index bytes have SHA256 `587d41e62de08d12121bb2500c18817461840c9f8bbf88e533dbb048cd50274d`. Source counts include all29 GP rune identities. Reproduction is a **passing original 243 UNSAT + 243 SAT positive on Windows Python3.12 / Z3Py 5.0.0.0**: [run44997972295](https://github.com/FlareZ123/liber-primus/actions/runs/44997972295). An earlier independent native libz3 C-API evaluation returned the identical original UNSAT.

The count also admits a human-facing **243+4=247** *linear* de Bruijn interpretation, potentially using four source-visible red runes as seed or final wrap. That cannot evade the exact exclusion: any linear order-five ternary de Bruijn sequence containing all243 five-trit windows must traverse every edge of the balanced four-trit de Bruijn graph exactly once, so its final four trits are identical to its first four. Consequently the contiguous 243-trit body is a cyclic rotation of the complete B(3,5) sequence and must itself satisfy the excluded cyclic constraints. The argument covers **any** four padding trits under a static GP symbol map, even before asking whether the first red p8 word `XIXM` was intended as padding.

**Decision:** eliminate the *entire class* of original-order, context-independent, symbolwise 29→3 encodings of a complete cyclic or four-padded linear B(3,5) source, including arbitrary secret mappings. This remains a scoped structural exclusion. A positional or evolving trit map, different ciphertext order, different source selection, a genuine 243-cell lookup table, and ordinary encrypted text remain possible. There is **no unknown plaintext, historical key or author-selected receiver**.

## Research decision

Neither direct p8 five-trit lookup nor the more demanding p7-fifth-order-state-plus-p8-nonlinear-filter interpretation yields readable original plaintext when wired with source-visible initial state, original rune order, GP29 addition, plausible clock settings and the header-motivated small q set. The observed full-text statistics remain almost unchanged from undeciphered source.

The original's entire 243-rune block is **exactly incompatible with every static GP29-to-ternary symbol map as a complete B(3,5) sequence**, including any four-rune linear padding; this supersedes the earlier limited residue-map and heuristic search. **Do not promote** the appealing 243=3⁵ numerical interpretation into an established table or key. To reopen this branch, require an **independent selector** for which rune-to-trit map, table ordering, key schedule or decoding operation the creator actually intended, or a genuinely predicted known plaintext fragment that validates a separate ordering. Searching arbitrary 5D coordinate permutations and unmotivated seeds would defeat the human solve-path premise. The intended function of p8's black text and tree remains unknown.
