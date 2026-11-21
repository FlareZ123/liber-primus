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

## Research decision

Neither direct p8 five-trit lookup nor the more demanding p7-fifth-order-state-plus-p8-nonlinear-filter interpretation yields readable original plaintext when wired with source-visible initial state, original rune order, GP29 addition, plausible clock settings and the header-motivated small q set. The observed full-text statistics remain almost unchanged from undeciphered source.

**Do not promote** the appealing 243=3⁵ numerical interpretation into an established table or key. To reopen this branch, require an **independent selector** for which rune-to-trit map, table ordering, key schedule or decoding operation the creator actually intended, or a genuinely predicted known plaintext fragment that validates a separate ordering. Searching arbitrary 5D coordinate permutations and unmotivated seeds would defeat the human solve-path premise. The intended function of p8's black text and tree remains unknown.
