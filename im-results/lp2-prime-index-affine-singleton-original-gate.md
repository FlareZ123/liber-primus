# Original LP2 singleton recovery against a nonrepeating prime-index affine key

**17 November 2026 · Agent25 · Director Issue #1400. Bounded negative with exact original-input key recovery and a native GP29 planted control.** No previously unknown Liber Primus plaintext, authentic cipher key, or continuation was recovered. All 3,301 bounded prime-start positions fail before the seventh printed singleton even under a generous A/I/O plaintext alphabet.

## Source-motivated recoverable key hypothesis

The authenticated solved LP2 p56 decoder consumes a stream derived from Euler's totient of consecutive ordinary primes; historical Cicada BASE29 and LP1 prime-number instructions make prime-based operations reasonable test candidates. Original unknown pp0–55 contain **12,956 runes, 2,896 printed words, and 83 single-rune words** after joining the 32 physical-page word continuations. If the printed words directly represent ordinary native-GP English, the one-rune plaintext words should be **A or I**, GP indices 24 and 10. A generous sensitivity test additionally admits standalone **O/index 3**. This is an assumption about the unknown plaintext, not an authenticated reading of the ciphertext.

The candidate uses a different clock from previously excluded prime-at-word-ordinal keys: the ordinary prime ordinal advances at every **original rune**, ignoring printed word/page separators. Its complete reversible rule is

\[
C_i=P_i+a\,p_{s+i}+b\pmod{29},
\]

where the zero-indexed ordinary prime list starts at \(p_0=2\); \(s=0,\ldots,3300\) is the unknown start position, and \(a,b\) are entirely free elements of GF(29). The upper bound 3300 is a frozen affordable range motivated by the first-party number 3301; it is **not** independent evidence for the actual start or a proof about larger starts. The sign of the pad is subsumed by the freely chosen slope and intercept. Every original rune, including F, consumes a prime. This is a distinct unskipped cipher, **not the historical p56 plaintext-F-transparent operator**.

The strongest rival is that LP2 printed one-rune cells are cipher framing, or the true key state is nonlinear, source-selected, or F-skipping.

## Exact algebraic key recovery

The original first two singleton runes are EA/index 28 at global zero-based offset 176 and S/index 15 at offset 244. For putative plain indices \(x,y\in\{24,10\}\) or the generous \(\{24,10,3\}\), put \(q_0=p_{s+176}\) and \(q_1=p_{s+244}\) modulo 29. Their two key equations solve the unknown pair without language scoring:

\[
a=(15-y-28+x)(q_1-q_0)^{-1}\pmod{29},
\qquad b=28-x-aq_0\pmod{29}.
\]

The solver reconstructs every admissible key pair at each start, and checks all subsequent singleton positions without fitting arbitrary phase, prose, punctuation or keyword. For the **109 starts where \(q_0=q_1\)**, it checks the necessary equal-prime condition and would allow all 29 slopes. All 109 are impossible immediately: the original ciphertext difference \(15-28\equiv16\) does not equal any difference of two A/I/O symbol indices.

| Exact original constraint | A/I | A/I/O |
| --- | ---: | ---: |
| Prime starts checked | 3,301 | 3,301 |
| Two-anchor states on nonsingular starts | 12,768 | 28,728 |
| Survive third singleton (offset 350) | 878 | 2,898 |
| Survive fourth (offset 530) | 60 | 309 |
| Survive fifth (offset 644) | **0** | 30 |
| Survive sixth (offset 792) | 0 | 3 |
| Survive seventh (offset 967) | **0** | **0** |
| Survive all 83 printed singletons | **0** | **0** |

The finite exclusion is exact for this chosen direct-additive cipher, 3,301 start states and literal-word assumptions. No unknown text was guessed to fit.

## Native original-size positive and matched null

The read-only [standalone CommonJS SFT](../sims/lp2_primeindexed_affine_singleton_source_sft.cjs) asserts the 12,956 original runes against the independently retained transcription, all 2,896 word cells, all 83 singleton offsets and the first five source glyphs. Its **full 12,956-rune positive plant** uses real clear LP2 p57 GP runes for non-singleton filler, imposes alternating genuine A/I words at precisely the original 83 singleton positions, and encrypts under a hidden \(s=73,a=7,b=11\). Without receiving the hidden seed, the first 13 singletons recover **exactly one key, the planted key**. The full reverse recovers 12,956/12,956 planted source-native symbols and exact forward reencryption reconstructs the complete planted ciphertext. The imposed singleton placements make this a synthetic source-native positive rather than a previously decrypted unknown page.

The same SFT performs **100 deterministic Fisher–Yates shuffles** of the original 83 singleton ciphertext symbols, preserving their full histogram and absolute offsets, seed xorshift32 0x25371411. Each shuffle undergoes the same first-13-singleton key test under the identical bounded start range:

| Longest compatible prefix | 4 | 5 | 6 | 7 | 8 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Matched A/I shuffles /100 | 4 | 60 | 33 | 3 | 0 |
| Matched A/I/O shuffles /100 | 0 | 4 | 64 | 28 | 4 |

The **actual** longest prefix is **four** for A/I (shorter than 96/100 shuffled controls) and **six** for A/I/O (shorter than 32/100). These are conditional comparator counts, not discovery-wide significance. In particular the original first four matches do not authenticate the model. The decisive result is the complete finite key incompatibility by the fifth or seventh symbol.

The complete unchanged-source test passed the existing [Windows Node.js 22 manual SFT workflow, run 44161457324](https://github.com/FlareZ123/liber-primus/actions/runs/44161457324). That run asserts the exact counts, same-seed controls, secret-state recovery and round-trip.

## Conditional information budget, the limit of singleton-only recovery

For an arbitrary additive GP29 pad, every original singleton ciphertext index \(c\) can correspond to **two different key values** (\(c-A\) or \(c-I\)); the 83 sites permit \(2^{83}\) distinct key assignments without any constraint on non-singleton positions. The observation register therefore cannot itself disclose a true key stream. The generator or source rule is essential.

In the **idealized independent-uniform-key model only**, restricting a position from 29 possible plaintext values to A/I supplies \(\log_2(29/2)\approx 3.85798\) bits per word, or **320.21242 bits** over 83 sites. Allowing A/I/O lowers that figure to **271.66054 bits**. For \(d\) otherwise independent GF29 secret parameters, the expected count of random code paths consistent with all 83 A/I constraints would be \(29^d(2/29)^{83}\), crossing expectation one near \(d=65.91471\); allowing O moves that illustrative threshold to \(d=55.92046\). In contrast the actual tested parameter list contains **2,776,141** abstract (start, a, b) combinations, about **21.40465** bits before the two-anchor algebra. These counts describe an optimistic *information ceiling under independence*, **not a proof that an arbitrary 65-state cipher can be identified, nor any source-selected secret key**. Dependencies, omitted F positions, rekeying and uncertain word grammar can drastically weaken that bound.

This explains the methodological result: with a real generator the 83 source anchors could give a strong pruning oracle; without a source-selected generator, constructing a longer list of algebraically consistent pseudo-keys would not identify LP2 plaintext.

## Research decision

This excludes the **aperiodic, absolute-rune-indexed ordinary-prime affine additive generator** for all starts 0..3300 even when its slope and offset are unknown. It differs from the earlier excluded affine prime-**word** clock, periodic table keys, and fully enumerated GF29 linear recurrences of order at most four. It does **not** exclude larger prime starts, independently page-rekeyed states, plaintext-F-transparent bypasses, different output alphabets, printed-boundary loss, or other state machines.

The useful distinction for Issue #1400 is that two intact A/I words *do* recover the key parameters of a specified low-dimensional generator and the next few words rapidly discriminate an actual source-shaped plant. Original LP2 singletons do not themselves select a valid prime generator or decrypt even one unknown sentence. **Do not rescue this key hypothesis** by searching added offsets, arbitrary chapter phases, more slopes or invented cipher layers. A follow-on warrants expense only if an original instruction supplies a different key clock/consumer, or an independent long plaintext crib authenticates the printed one-rune English register.
