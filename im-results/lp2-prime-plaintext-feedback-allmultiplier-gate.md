# GP-prime plaintext-feedback cipher: original all-multiplier gate

**Decision (11 November 2026):** A natural, reversible original-LP2 interpretation of the documented GP prime values fails both a direct plaintext test and an independent, key-free doublet requirement. The requirement holds for **all 28 nonzero secret multipliers and any initial key at each word**. Across 140,387 contiguous 2,896-word source-English control windows, **none** is as doublet-suppressed as the 2,896 printed unknown-LP2 words after giving every control window its *best* multiplier. No unknown plaintext, actual LP2 key, or destination has been recovered.

## One proposed operation and its necessary consequence

The original 2013 *0_wisdom* material foregrounds the GP primes, and the authenticated 2016 message says that the book's words are the map and their numbers the direction. A reversible but **hypothetical** way to make a word's numbers direct each next letter is a causal additive plaintext-feedback cipher over the native 29-rune alphabet:

\[
 C_{w,j}=P_{w,j}+K_{w,j}\pmod{29},\qquad
 K_{w,j+1}=K_{w,j}+a\,\operatorname{GPprime}(P_{w,j})\pmod{29}.
\]

Here \(a\in\{1,\dots,28\}\) is a possibly secret but **fixed** nonzero multiplier, and \(K_{w,0}\) may be *any* unknown value **for every individual printed word**. For the direct source reading \(a=1\), seed \(K_{w,0}=3301\bmod29=24\) and reset at each printed word. Encryption and decryption are sequential and unique once their seed is specified, without plaintext guesses.

Subtracting adjacent original ciphertext positions within a word eliminates the entire secret state:

\[
 C_{w,j}=C_{w,j-1}\quad\Longleftrightarrow\quad
 P_{w,j}-P_{w,j-1}+a\,\operatorname{GPprime}(P_{w,j-1})\equiv0\pmod{29}.
\]

For a nonzero GP-prime residue, any native plaintext digram satisfies this condition at **at most one** of the 28 possible multipliers. If the preceding rune's prime weight is 29, equality can be independent of the multiplier. These cases are implemented exactly. Starting keys, page starts, outside-word transpositions or word order cannot rescue a within-word mismatch under this family. A symbol-dependent multiplier, extra encoding layer, altered word boundaries or another plaintext register would be a **different** cipher.

## Measured original and source-native controls

The canonical original unknown transcript, with transparent physical-page and printed-line wraps, yields **12,956 runes and 2,896 words**, with **32** words crossing physical pages. Within the **10,060** rune adjacencies inside words, exactly **63** are equal, a **0.006262425447** rate.

Native controls use the established longest-match GP transliteration with TH/NG/EO/OE/AE/IA/EA symbols and conventional V/K/Q/Z adaptations. For each **contiguous 2,896-word window** of Shakespeare, Emerson and Gibran, count its GP digrams that would produce ciphertext equalities under each of **all 28 multipliers**, keep the *minimum* possible rate, and compare this already-optimized outcome with the untouched original. Native control windows preserve their real word lengths and source order; the comparison uses rates because natural word lengths vary from the manuscript's. The strongest attainable result for every source is still above the original:

| Source | Windows | Smallest possible rate in any window | Numerator / within-word pairs at minimum | Best multiplier | Windows at or below LP2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare | 52,512 | **0.008089888** | 72/8,900 | 7 | 0 |
| Emerson | 75,037 | **0.009321483** | 86/9,226 | 7 | 0 |
| Gibran | 12,838 | **0.009958200** | 81/8,134 | 7 | 0 |
| **Total** | **140,387** | | | | **0** |

When evaluated over their *entire* independently sampled corpora, the best multiplier is also 7 for all three, giving equality rates approximately **0.01204**, **0.01208** and **0.01287**. The much lower original rate cannot be explained by choosing a single secret multiplier to exploit ordinary GP-English digram structure in these reference passages. The 140,387 windows overlap heavily; **zero hits is finite reference coverage, not a discovery-wide statistical p-value or a mathematical impossibility for every possible English composition**.

### Exact decryption, positive control and scope

With \(a=1\), word seed 24 and the original ciphertext, the entire 12,956-rune inverse re-encrypts exactly, but the decoded stream remains at **IoC 0.03446658935**, effectively the random-GP29 baseline \(1/29\). A separate trigram comparison using source Shakespeare shows a decoded mean **−4.17334** versus original ciphertext **−4.14750** and independently held-out native Shakespeare **−2.35182** nats/rune. No contiguous coherent plaintext appears in this direct original inversion.

As a positive control, GP-encode the authenticated 2016 signed sentence beginning *Liber Primus is the way*, encrypt it with its source-derived seed24 and each multiplier \(a=1\dots28\), then decrypt it. **Every symbol recovers exactly for all 28 multipliers**, and the predicted doublet count equals the actual encrypted doublet count in every case. This establishes the model's actual reversibility and checks the algebra on native Cicada text, separately from the original-LP2 negative.

### Research decision

The source clues establish the 29-symbol GP alphabet and prime values; **they do not prescribe this plaintext-feedback recurrence**. This experiment retires the specific **fixed-multiplier running-prime feedback** family as an explanation of the original anti-repeat ciphertext under the tested native-GP language assumption. It is not worth rescuing the model with arbitrary per-word multipliers, secret resegmentation or another speculative layer, which would discard its original clue constraints.

A useful next experiment needs an *independently observable instruction* selecting a genuinely different **state-dependent nonzero-step law or authentic key source**, followed by a frozen inverse of original untouched runes. The absence of a suitable instruction remains the material blocker.

**Executable reproducer:** [Node.js 22 single-file all-secret SFT](../sims/lp2_prime_plain_feedback_allmultiplier_sft.cjs). It reads the original 55 rune-bearing pages and three committed source controls, asserts 12,956/2,896/10,060/63 and all window minima, and tests exact 28/28 native-plant round trips. The script was also executed on the original repository-file bytes in the connected JavaScript runtime and all assertions passed.
