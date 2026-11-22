# P27/P55 repeated six-rune bookend: prime interior and source-13 field clock

**Agent 8, 22 November 2026. Status: an exact new original-tape count and a negative one-clock candidate; no unknown plaintext, cipher key or authenticated transition.** This investigation addresses [Director #2277](https://github.com/FlareZ123/liber-primus/issues/2277), following the existing [seven-rune seam study](p27-p54-repeated-7gram-periodic-key-gate.md), [80×80 ordinal-insertion analysis](bookend-81x81-80x80-ordinal-insertion.md) and [blindly rejected GP0 pointer continuation](lp2-p27-dju-bei-gp0-divinity-convergence.md). The [source-only single runnable test](../sims/lp2_p27_p55_prime6389_13orbit_original_sft.cjs) uses canonical untouched original LP2 indices and source-native GP29 literary positive controls.

## Original clue and new inter-anchor interval

The only repeated runic six-gram in the 12,956 unknown LP2 runes is the authentic complete two-word phrase **DJU BEI** (GP0 indices [23,11,1,17,18,10], GP0 total80). Its first occurrence begins at global offset **6,555** (physical p27 rune28), its second at **12,950** (physical p55 rune70), where it occupies the final six symbols of the last unsolved manuscript page. The p27 source page depicts an isolated insect wing, the terminal p55 source page a moth. The visual similarity is thematic, with no demonstrated identical-carrier or decoding rule.

The two anchors delimit an exact **inter-anchor body**:

- after the first complete phrase: global start **6,561 = 81²**;
- before the final complete phrase: exclusive endpoint **12,950**;
- genuine intervening original GP29 ciphertext: **12,950 − 6,561 = 6,389 runes**.

**6,389 is prime**, and its multiplicative group's order is **6,388 = 4×1,597** with 1,597 prime. **13 is a primitive root modulo 6,389**, so adjoining one zero state to its 6,388 nonzero states yields exactly 6,389 distinct finite-field values, numerically matching the inter-anchor ciphertext length.

This motivates a bounded test because **13-dot marks** appear in the original p27/p55 source family and the independently visible six-rune anchor has GP0 total80. But the source does not tell a human solver to perform modulo6,389 arithmetic. Moreover, **13 of the 28 integers from 2 through 29 are also primitive roots modulo6,389**, so 13 is not distinguished by its full cycle alone. The 6,400 = 80² suffix interpretation with five physically printed Arabic ordinals has already been tested in the prior 80×80 study and is not repeated here.

## One frozen fully reversible original candidate

Use the two complete word pairs as unchanged literal delimiters and operate solely on the genuine intervening rune positions. Initialize finite-field state to zero, then the authentic GP0 phrase value80, and evolve by multiplying each nonzero state by13 modulo6,389:

    s[0]=0, s[1]=80, s[i+1]=(13*s[i]) mod6389

Decrypt the original GP29 runes by **P[i] = (C[i] − s[i]%29) mod29** and reencrypt by **C[i] = (P[i] + s[i]%29) mod29**. Source newlines and original word boundaries are retained, including the genuine p54→p55 carried word. The script exposes a 100-rune original p27 context beginning at page-local34 and the complete last86 runes (p54 final10 followed by p55 all76). The terminal 86-rune receiver consists of 80 transformed original symbols and the last six literal, transparent bookend runes.

All **6,389/6,389 original symbols exactly reencrypt**. A separate 6,389-GP-rune native Gibran plant is recovered **6,389/6,389**, establishing correctness of this proposed inverse only.

| Measure | Original inter-anchor ciphertext | Fixed 13-orbit inverse | Native GP literary control |
|---|---:|---:|---:|
| Runes | 6,389 | 6,389 | 6,389 |
| Index of coincidence | 0.03444898 | 0.03449098 | 0.05984466 |
| Top-12 rune-symbol count | 2,792 | 2,824 | 4,950 |
| Adjacent-equal rune count | 45 | 202 | 207 |

Although the fixed inverse produces an incidental native-like doublet count, its marginal rune distribution is still nearly uniform and lacks sustained plaintext. Its top-12 symbol concentration is **2,126 below the chosen native literary control**. The tested direct additive 13-orbit inverse therefore fails to reveal original native-GP prose. A pure transposition without rune-value changes also cannot repair the input marginal frequencies.

## Missing author operation and decision

The images provide source-visible ornaments and literal repeated ciphertext. They provide no instruction to make the bookend unencrypted, insert a zero state, use modulus6,389, multiply by13, truncate state modulo29 or choose GP-additive decryption. They supply no decipherment of the first 28 p27 runes before the first anchor. The footer remains an unknown six-rune ciphertext rather than a known plaintext crib.

**Preserve the prime inter-anchor count as an exact source fact and reject this particular additive field-state cipher.** Any successor must supply an independent author-visible selector for an actual changing opcode, seed and termination and predict the whole final ciphertext interval without fitting English. Do not repeat earlier square crops, raw periodic-key trials or fixed secret monoalphabets.

**Conclusion: no authenticated new plaintext, key or complete decipherment mechanism.**
