# LP2 original ciphertext-feedback all-coefficient inverse

## Decision and upstream premise

A standard, human-attemptable reversible cipher is additive **ciphertext
autokey**: each output rune depends on the current plaintext rune and a
previous ciphertext rune. The exact original p15 grid uses distinct
Fibonacci values 0,1,2,3,5,8,13,21,34,55,89,... as indices into primes.
That is an authentic numerical sequence; it does not independently say
"ciphertext autokey." This experiment tests the source-motivated positive
lags **1, 2, 3, 5, 8, 13, 21, 34, 55, 89** without selecting a multiplier
from the unknown plaintext or fitting a language model.

The proposed GP29 family is

    C[i] = (P[i] + a*C[i-k] + b) mod 29,

where k is one of those ten positive lags, a is **any** element of GF(29),
and b is an unknown scalar offset. This is a deliberately generous
**hypothesis test**, not a historically authenticated Cicada rule.

Two exact inverse envelopes are tested:

1. Continuous-book a and b. At positions i >= k, the prospective plaintext
   P[i] = C[i]-a*C[i-k]-b. The additive b shifts every symbol uniformly
   and cannot affect monogram index of coincidence (IoC). Optimize over
   every a=0..28 to give this family its best possible original score.
   Discard the first k positions, whose prior state is unspecified.
2. Page-local, independently chosen a and b for **every one of the 55
   unknown rune-bearing physical pages**. Discard the first k positions
   of each page and compute within-page collision pairs. Optimize each
   page's a independently before pooling collision numerators and
   denominators, so arbitrary page-specific b values likewise cannot
   alter the result. Pages with fewer than k+2 usable positions do not
   contribute. This is much more permissive than any one global key.

The comparison uses exactly the original 12,956 ciphertext rune indices
from \`resources/liber-primus/lp2-corpus.json\`, physical p0–55 except
the rune-free numeric p50. Control material is the repository's Emerson,
Gibran and Shakespeare text, encoded into native GP29 using the same
conversion as the earlier plaintext-autokey SFT (including ING→NG,
QU→CW, K→C, V→U and Z→S), yielding
**323,083 / 62,696 / 217,644** GP runes. Their disjoint, complete
original-length windows yield **44** native-language controls. In both
envelopes the controls get the identical maximizing search as the original;
the comparison therefore allows for the same multiple-key optimization.

## Exact original-input results

Each value is the *maximum* original-symbol IoC across all allowed
secret coefficients under that envelope. Native minima are the *lowest*
among the 44 independently selected control windows, after the same
optimizing procedure. Lower values are farther from native GP prose.

| k | Best global a | Original global best | Native global minimum | Original any-a-per-page best | Native per-page minimum |
| -: | -: | -: | -: | -: | -: |
| 1 | 1 | 0.035325 | 0.058487 | 0.037015 | 0.059050 |
| 2 | 14 | 0.034523 | 0.058485 | 0.036987 | 0.059098 |
| 3 | 6 | 0.034515 | 0.058486 | 0.036972 | 0.059106 |
| 5 | 11 | 0.034526 | 0.058482 | 0.037009 | 0.059124 |
| 8 | 22 | 0.034552 | 0.058486 | 0.037005 | 0.059084 |
| 13 | 27 | 0.034511 | 0.058499 | 0.036995 | 0.059030 |
| 21 | 7 | 0.034537 | 0.058509 | 0.037317 | 0.059025 |
| 34 | 18 | 0.034532 | 0.058508 | 0.037213 | 0.058791 |
| 55 | 22 | 0.034532 | 0.058531 | 0.037359 | 0.058668 |
| 89 | 13 | 0.034511 | 0.058530 | 0.038271 | 0.058497 |

All 20 original-vs-control envelope comparisons have **0/44 native
controls at or below the original**. The strongest original continuous
result is k=1, a=1, IoC 0.035325; the most generous page-specific result
is k=89, IoC 0.038271. There is no original candidate in the reference
prose regime.

For a positive control, each of the ten lags was also used to encrypt a
full native GP29 window under **varying page-specific coefficients**
a_j=(7+3j) mod29 and b_j=(13+11j) mod29, with zero initial external
cipher state. All ten resulting ciphertexts reproduce the complete
12,956-rune plaintext exactly under the inverse. A deliberately wrong
fixed-key inverse fails. This confirms the decoder logic and source
format; synthetic success does not identify the historical cipher.

## Interpretation and scope

This **rejects the direct same-alphabet affine ciphertext-autokey
explanation for the tested ten lags under comparison with the finite
native-GP English corpus**. It establishes a stronger and genuinely
separate negative from the existing plaintext-autokey all-secret gate:
here the feedback taps **previous ciphertext**, and every multiplier
is allowed, including a=0 and independent per-page choices. Unknown
constant scalar offsets, arbitrary hidden initial-lag register symbols,
and page-local key differences cannot rescue the tested monogram
property. No language scoring or key fitting was needed.

It does **not** reject other lags, word/section resets, position-varying
multiplier streams, nonlinear feedback, encipherment in a different
alphabet, keyed permutations, transpositions coupled to feedback, or
non-English plaintext. A hidden position-dependent pad can change
the decoded IoC, so that broader family remains open. There is no
original-source instruction selecting this cipher, and this experiment
recovers **no previously unknown LP2 plaintext, authentic key, or
destination**.

The decision is to **retire this direct affine ciphertext-feedback
family at p15's ten Fibonacci lags**, rather than tune more coefficient
or initialization searches. Return to independent source-derived keys
or cipher state, especially an original clue that predicts a specific
decoder before applying it to the ciphertext.

## Reproduction

- Executable: [\`sims/lp2_ciphertext_feedback_allmultiplier_allsecret_sft.cjs\`](../sims/lp2_ciphertext_feedback_allmultiplier_allsecret_sft.cjs)
- Inputs: [canonical original GP29 indices](../resources/liber-primus/lp2-corpus.json) and three text controls under \`resources/control/\`
- Direct invocation: \`node sims/lp2_ciphertext_feedback_allmultiplier_allsecret_sft.cjs\`
- The full saved script was actually executed in this invocation with its
  repository source and control files supplied through equivalent
  in-memory \`fs.readFileSync\` responses. Its assertions and all ten
  native planted round trips passed and produced the table above.
  No GitHub Actions run is claimed.
