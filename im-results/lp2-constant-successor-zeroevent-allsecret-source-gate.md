# All-key, constant-successor GP29 feedback gate against original LP2

**18 November 2026, Agent46. Classification: exact finite structural exclusion on five source-native English references; no unknown plaintext, creator key or original cipher recovered.** A particularly short reversible anti-repeat mechanism can be rejected without searching its 28-way unknown key: make the next ciphertext rune equal the previous one exactly when the next plaintext rune is a fixed displacement from the preceding plaintext rune.

## Why this mechanism deserved one exact original test

The **12,956 original LP2 pp0–55 GP29 ciphertext runes** contain only **86 adjacent equalities** within their 55 runic physical pages. A stateful cipher intended for human solution could have exposed a rare plaintext digram as ciphertext equality, then encoded all other 28 successor possibilities as nonzero differences. Unlike the already-rejected fixed-*current-rune* marker, this mechanism selects a **predecessor-dependent** plaintext event. Its most compact version uses only a single global offset **d ∈ GP29**, with no external key needed to describe which plaintext event means zero.

Here is the exact model, per rune within a physical page. Let **P** be plaintext GP29 indices and **C** the printed ciphertext. Fix any global d in0..28, and set a reserved successor **r = (P_(i−1)+d) mod29**. The cipher maps:

- **P_i = r** to **C_i = C_(i−1)**.
- Every other **P_i** bijectively to one of the **28 nonzero C_i−C_(i−1) mod29** values, with arbitrary hidden permutations or even arbitrary distinct permutations at every rune.

This is information-complete and invertible with the 28-way nonzero keys. Its crucial **key-independent invariant** is:

    C_i = C_(i−1)  if and only if  P_i = P_(i−1)+d (mod29).

No choice of the unknown nonzero-key permutation can change the count of zero events. The necessary condition survives independently secret permutations, and a page reset simply leaves each page's first rune out of the transition count. This rule has **not** been authenticated by a Cicada clue; it was chosen as a compact rival to the p39 quadratic predecessor rule, not as an asserted original cipher.

## Entire-language-register gate before any key search

Reproduce the canonical **86** original same-cipher-rune adjacent pairs within the actual 55 runic physical pages, excluding their **54** page-start transition sites. Then use the existing repository GP29 orthography convention (ING and IO ligatures, historical QU/V/K/Q/Z folding) to encode five independently pinned literary text corpora, **without fitting any unknown ciphertext**:

| Authenticated reference input in repository | Whole GP29 reference length | Smallest zero-event count across its own full 12,956-rune windows and all d |
| --- | ---: | ---: |
| Shakespeare, first 300k text | 217,106 | 166, at d18 |
| Gibran, *The Prophet* | 62,492 | **140, at d7** |
| Emerson essays | 321,327 | 152, at d18 |
| Blake, *Marriage of Heaven and Hell* | 33,276 | 185, at d4 |
| KJV Passion Gospels text | 53,675 | 171, at d4 |

Each GP-native reference allows **every contiguous start offset** with room for a complete original-shaped 12,956-symbol output, rather than assuming a known source position. At each possible start, *remove exactly the manuscript's 54 physical page-cut transitions* from the event count. For each **d=0..28**, compute all source positions exactly with prefix sums and fixed corpus/page boundaries; take the minimum. The **global minimum is 140** (Gibran, d7), which is already **54 greater** than the exact original 86. All 145 separate book×d minima exceed86, so none of the original-shaped reference windows could generate the observed source repeat inventory under this cipher family, even with an unrestricted secret 28-way codebook changing on every rune. This is strictly stronger than excluding any particular guessed table or key.

Every original-position value, all **145** minima and source offset winners are emitted by the [read-only reproducible single-file Node22 experiment](../sims/lp2_constant_successor_repeat_allsecret_sft.cjs). It also instantiates a concrete fully invertible rank-28 cipher for **all 29 d values**, encrypts the entire 12,956-rune cyclic known-clear p57 native-GP plant across the exact original page cuts, and decrypts back to the full planted text with zero mismatches. This checks that the invariant describes an actual reversible mechanism rather than an impossible assumed channel.

## Scope, competing explanations, and decision

The exclusion is exact for **constant d over the whole book**, intact plaintext rune boundaries, the declared zero-event rule, and the tested native-English reference corpora with their published normalization convention. It does **not** rule out a source-selected **nonconstant** displacement, multiple independent chapter rules, a nonlinear predecessor mapping such as the already-tested p39 polynomial, an alternative text language/register, a lost steganographic side channel, or a code whose collisions carry different meanings. Since *d* itself has no authentic source selector, expanding to arbitrary per-position choices would erase the evidence that this was a compact human-solvable rule.

**Research decision:** retire this exact key-blind constant-successor cipher family for native GP English on the five pinned books. If a real original-page clue selects a nonstationary plaintext event or a specific key, demand a complete original ciphertext inverse and a held-out native prose passage before returning to it. This exact result narrows the MDL stateful feedback frontier while recovering no unknown original LP2 plaintext.
