# GP29 printed-word integer addition: exact all-secret carry bound

**Decision.** The complete original unsolved LP2 word stream **cannot be decoded into either of two printed-word-length-matched GP-native English controls** by ordinary, fixed-width, whole-word BASE29 integer subtraction, **even if the attacker grants a separate, completely arbitrary secret additive key for every observed word length**. Across all 2,896 original printed words, the exact upper bound on the count occupying the four most frequent plaintext initial GP rune classes is **648** (22.376%). Source-length-matched Gibran and Shakespeare GP-native controls have **1,002** and **963** (34.60% / 33.25%) respectively. No original plaintext or key was recovered.

This is a new exact hidden-key obstruction for a concrete source-motivated number-as-word candidate, not a universal rejection of every integer cipher. It differs from the unkeyed BASE29→Latin26 transcription ([related gate](lp2-word-base29-latin26-original-gate.md)) and the previously rejected *digitwise* GP29 independent Caesar offsets: this test permits ordinary arithmetic carries **across every digit inside each complete printed word**.

## Source-motivated operation and what is assumed

The Cicada-authored 2013 TCP task explicitly introduced the **BASE29 integer representation**. The authenticated 2016 instruction refers to the book's **words** and their **numbers**. A human solver might therefore interpret each printed rune word, rather than each individual rune, as one integer. These sources motivate an affordable reversible hypothesis; **neither proves the author chose it**.

For a complete printed GP29 word of length L and rune indices d0,…,d(L−1), let N = Σ dᵢ·29^(L−1−i). Test the full-word cipher family

\[
C_w \equiv P_w + K_L \pmod {29^L}
\qquad\text{and}\qquad
P_w \equiv C_w-K_L \pmod {29^L}.
\]

Retain L GP symbols on each side, including any leading F=0. Use one unknown fixed K_L per word length L=1,…,14; keys for different lengths can be totally unrelated. This exceeds the freedom of a single whole-book shared integer key. All complete words crossing physical page boundaries are joined as original typography prescribes. There are exactly **2,896 words / 12,956 runes / 32 carried words**, not 2,928 independent page fragments.

The tested class **preserves printed word widths, GP29 word boundaries and one shared plaintext alphabet**. An arbitrary different key for *each word occurrence*, length-changing stream arithmetic, a nonlinear bijection, or a second hidden homophonic layer lies outside this result.

## The complete all-secret bound, with no key search

Write a length-L ciphertext word integer as C = c₀·29^(L−1) + s, where c₀ is its first printed GP rune and s is its remaining suffix integer. Express **every** possible additive key as K_L = a·29^(L−1) + t, with 0≤a≤28 and 0≤t<29^(L−1).

Subtracting the key yields the leading plaintext digit

\[
p_0 \equiv c_0-a-b(s,t)\pmod{29},
\qquad
b(s,t)=\begin{cases}1 & s<t\\0&s\ge t.\end{cases}
\]

The entire unknown a merely rotates all 29 leading-rune categories; rotation never changes how many words occupy the four most frequent categories. The unknown suffix key t creates a **single sortable threshold**: words borrow precisely when s<t. Consequently, for each width L, sort all original ciphertext suffixes s and sweep the finitely many threshold changes t=s+1 that remain inside the valid key range. On crossing a threshold, move the affected word count from first-rune bin c₀ to bin c₀−1 mod29. Record the exact maximum top-four-bin total M_L over all permitted thresholds.

For any fixed four GP plaintext symbols, their count within length L is at most M_L. Adding the M_L across all widths is therefore an **upper bound even when every length may choose the best, unrelated secret K_L**; permitting the four winning labels to change between widths only makes the bound more permissive.

The source-original exact maxima:

| Original complete word length L | Words | Maximum M_L, all 29^L secret keys |
|---:|---:|---:|
| 1 | 83 | 20 |
| 2 | 448 | 90 |
| 3 | 720 | 145 |
| 4 | 513 | 94 |
| 5 | 317 | 66 |
| 6 | 256 | 59 |
| 7 | 216 | 54 |
| 8 | 156 | 43 |
| 9 | 78 | 31 |
| 10 | 52 | 17 |
| 11 | 32 | 12 |
| 12 | 18 | 10 |
| 13 | 4 | 4 |
| 14 | 3 | 3 |
| **All lengths** | **2,896** | **648** |

This is a deterministic upper bound, not an empirical statistical rarity or the outcome of sampled keys. An independent exhaustive check enumerates **all 29²=841 keys** for the length-two original-word subset and recovers the same maximum **90** as the suffix-threshold proof.

## Direct-native power controls with correct source geometry

Two independent public-domain corpora already retained in the repository provide the control plaintext: \`resources/control/gibran_prophet_58585.txt\` and \`resources/control/shakespeare_first300k.txt\`. For each of the original 2,896 GP word widths, select a genuine English word of exactly the matching **GP-native rune length** from the corresponding source, using the fixed source-attested transliteration (TH, ING/NG, IO, QU→CW, V→U, K/Q→C, Z→S). No native word's spelling or GP rune count is altered. This is a fixed-layout *positive construction* rather than a claim of real LP2 plaintext.

- Gibran's source-matched 2,896-word plant has 1,002 starts in its four most common GP categories.
- Shakespeare's independent source-matched 2,896-word plant has 963 such starts.
- Each plant is encrypted with a deterministic, nonzero **length-dependent full-word integer key**, using the exact GP29 modular-additive operation. The result decrypts all **2,896/2,896** original-width planted words exactly, including retained leading-zero positions. The all-secret upper bound on each planted ciphertext is verified to be at least the plaintext's true top-four count, demonstrating that the bound is sensitive to genuine positives.
- The original 648 upper bound is far below both positives and cannot be rescued by alternate K_L, unknown within-word carries or one extra *fixed* GP29 alphabet relabeling.

The control set is intentionally limited to two GP-native English constructions. Non-English, extremely atypical texts with four-rune initial count ≤648, arbitrary word-private keys, variable-length encoders and unrelated arithmetic ciphers are not ruled out.

## Reproduction and next decision

**Standalone read-only Windows 11 Node.js 22 SFT:**
[\`sims/lp2_base29_wordinteger_additive_allsecret_sft.cjs\`](../sims/lp2_base29_wordinteger_additive_allsecret_sft.cjs).
It reads the original canonical transcript and GP29 corpus, asserts exact word/rune/physical-carry counts, computes every secret-key threshold for all fourteen widths, runs the exhaustive length-two all-key crosscheck, constructs both independent native positives, encrypts/decrypts each source word, and asserts the output bounds.

**Passing original-input GitHub Actions run:** [45001813123](https://github.com/FlareZ123/liber-primus/actions/runs/45001813123), on the source script committed at \`3c11184cb43457023fba338f7302341e91f4a12c\`.

**Research fork.** Retire the **length-stationary modular-additive whole-word BASE29 cipher** as a route to ordinary GP-native English on the original book. Direct BASE29-to-Latin26 readout is independently negative. A more complex per-word private state or different output register needs a distinct first-party clue or an independently testable complete inverse; adding arbitrary word keys would erase recoverability. Keep attention on original artwork/source-selected operations that could supply an actual state or authentic plaintext.
