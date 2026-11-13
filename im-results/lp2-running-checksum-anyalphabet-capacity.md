# Key-independent running-ciphertext-checksum GP29 substitution gate

**Finding, 13 November 2026.** The original **12,956 GP29 runes** on LP2 physical p0–55 cannot directly decode into any contiguous 12,956-rune window from three pinned source-native English controls under **nine concrete, observable running-ciphertext checksum families** (three increments under three source-visible update clocks), even when the decoder is granted an arbitrary secret substitution permutation for **each of 29 checksum states in each of the nine original visual chapters**. This is a conditional, complete all-key exclusion of the specified models, not a decrypted page or a claim that Cicada chose them.

## A plausible causal operation and its missing selector

The GP29 chart publicly assigns each rune an index and prime; the solved p56 independently uses prime totients. The original artwork selects nine visual chapters, of lengths **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, 308**. These invite the bounded hypothesis of a cumulative, observable cipher-state register:

\[
S_{t+1}=(S_t+f(C_t))\bmod29,\qquad C_t=\sigma_{j,S_t}(P_t).
\]

Here \(C_t\) is the *original printed GP29 ciphertext rune*, \(P_t\) is the conjectured direct GP29 plaintext rune, \(j\) is the visual chapter, and \(\sigma_{j,s}\) is any unknown 29-symbol permutation. The three source-motivated increments are \(f(c)=c\), \(f(c)=\mathrm{GPprime}[c]\), and \(f(c)=\mathrm{GPprime}[c]-1\). For each complete word \(w\), let \(W_w=\sum_{i\in w} f(C_i)\bmod29\). Three update clocks are tested independently: **cumulative rune** \(S_{t+1}=S_t+f(C_t)\); **cumulative word** \(S_w=\sum_{v<w} W_v\); and **previous word** \(S_w=W_{w-1}\), all modulo29. The latter two states remain constant throughout their word, then update at the original printed word boundary. The two word-based alternatives are directly motivated by the independently signed 2016 instruction that the book's words and numbers convey directions. All **2,896** original printed words are preserved, including **32 continuations across physical-page boundaries**. Word sums are calculated on the **printed ciphertext**, never on guessed plaintext. Every visual chapter resets the checksum, and may have an entirely different set of 29 secret permutations. The simpler single-book alphabet set is tested separately.

**No Cicada source tells the player to use these running sums as the encryption state.** Their usefulness is the strong, key-independent decision available without a speculative key search.

## Exact original-input capacity inequality

For each state \(s\) and chapter \(j\), count how often ciphertext value \(c\) occurs while the previously emitted ciphertext checksum equals \(s\). The unknown permutation \(\sigma_{j,s}\) may rename the 29 values freely, yet cannot map two different ciphertext values to the *same* plaintext symbol. Therefore, independently granting the most favorable mapping in *every* state:

- maximum possible plaintext **E** = sum of the largest cipher frequency in each (chapter, state);
- maximum possible plaintext **E+O** = sum of the two largest distinct cipher frequencies in each (chapter, state).

Both bounds are exact for these isolated occupancy statistics; they give the cipher much more freedom than any realizable source-fixed 29-state key. Every state is calculated solely from the original ciphertext and the already defined GP chart.

| GP state increment | Public checksum clock | One global set of secret alphabets: max E / E+O | Nine chapter-independent sets: max E / E+O |
|---|---|---:|---:|
| Rune index | Previous **complete word** | 685 / 1,313 | **1,193 / 2,202** |
| Rune index | Cumulative **word sums** | 695 / 1,339 | **1,187 / 2,194** |
| Rune index | Cumulative **rune sums** | 692 / 1,328 | **1,245 / 2,265** |
| GP prime | Previous **complete word** | 688 / 1,321 | **1,207 / 2,206** |
| GP prime | Cumulative **word sums** | 671 / 1,292 | **1,202 / 2,210** |
| GP prime | Cumulative **rune sums** | 708 / 1,339 | **1,226 / 2,259** |
| GP totient | Previous **complete word** | 698 / 1,331 | **1,188 / 2,189** |
| GP totient | Cumulative **word sums** | 676 / 1,313 | **1,209 / 2,208** |
| GP totient | Cumulative **rune sums** | 705 / 1,360 | **1,236 / 2,266** |

These results use the full original 12,956-rune stream, including original visual chapter boundaries, all 2,896 original word lengths, and all printed rune symbols; no suspected plaintext or external encryption key is fitted. Both word clocks were also run with **every possible hidden alphabet for every public word-sum state**. The best original upper bound across all nine models remains **1,245 E / 2,266 E+O**, from separate rune-clock models; the most permissive six word-clock bounds are **1,209 E / 2,210 E+O**.

## Source-native English controls and exact positive inverse

Apply the already-checked GP orthography from solved LP1 and held-out solved LP2 p57, including single-rune **ING** and **IO**, to all three pinned literary source texts. In *every possible contiguous 12,956-rune window* of each source:

| Fixed control text | Minimum E | Minimum E+O |
|---|---:|---:|
| Gibran, *The Prophet* | **1,416** | **2,548** |
| Shakespeare sample | **1,408** | **2,441** |
| Emerson essays | **1,491** | **2,408** |

The strongest original allowance, from *any* of the tested chapter-independent checksum models, is at most **1,245 E** and **2,266 E+O**, while the minima among all three source texts are **1,408 E** and **2,408 E+O**. At least **163 E** or **142 E/O** capacity is missing. A bijective secret alphabet cannot fix these deficits.

Complete source-native Gibran plants were separately encrypted with the GP-prime-checksum model, 29 evolving states and nine independently keyed chapters. The selected secret affine tables are \(C=(11P+7S+3j)\bmod29\), whose inverse is \(P=8(C-7S-3j)\bmod29\). **All 12,956 planted runes decrypt exactly and re-encrypt exactly**; the blind ciphertext capacity accepts its 1,529 actual E and 2,661 actual E/O with maxima 2,554 and 4,292 respectively. The two additionally planted **previous-word** and **cumulative-word** prime-checksum ciphers exactly recover all 12,956 native-GP runes, and their blind occupancy maxima are **1,832 / 3,285** and **1,850 / 3,287** respectively, both accepting the 1,529 actual E and 2,661 actual E+O. This verifies the gates can accept genuine source-native instances under all three clocks. It does not authenticate those tables for LP2.

## Interpretation

This excludes direct native-GP English for **every possible choice of secret GP29 substitution tables** (up to \((29!)^{9\times29}\) independent codebook assignments), under each of the nine frozen clock/increment combinations. The calculation does not require that the ciphertext state be distributed uniformly, that the secret alphabets be affine, or that the key be known.

It leaves open **page- or word-specific independent alphabets**, plaintext-dependent or hidden state, other evolving nonlinear rules, extra symbol transformations, non-English plaintext, a different alphabet register, or an external source-supplied high-entropy pad. Giving every *physical page* its own set of 29 secret tables is too permissive for this occupancy gate: the observed one-letter upper bounds rise to 2,667–2,691 and E/O to 4,656–4,681, so those variants are not excluded.

**Decision:** do not invest in index/prime/totient public running-*ciphertext*-sum substitutions on any of these three frozen word/rune clocks with book- or visible-chapter-stationary alphabets. Source-selection of a genuinely different state or authenticated key remains the useful missing input. No original LP2 plaintext, decoder or final destination was recovered.

**Reproduction status:** Both complete original-source Node.js22 SFTs pass [manual GitHub Actions run 43467088870](https://github.com/FlareZ123/liber-primus/actions/runs/43467088870), including the 12,956-rune exact positive implants, all three native English corpora, the full 2,896-word source stream, and every published bound.

**Reproducers:** [cumulative rune-clock CommonJS SFT](../sims/lp2_running_checksum_anyalphabet_sft.cjs) and [complete previous-word and cumulative-word all-secret SFT](../sims/lp2_running_wordprime_anyalphabet_sft.cjs) using [GP29 corpus](../resources/liber-primus/lp2-corpus.json), the [already calibrated GP spelling implementation](../sims/lp2_native_gp_source_orthography_sft.cjs), and the three checked-in control texts.
