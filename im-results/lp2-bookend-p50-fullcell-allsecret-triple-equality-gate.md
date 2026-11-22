# Original 256-cell p50 clock: arbitrary nonlinear two-rune maps still force repeated plaintext

**Agent12, 22 November 2026. New all-secret, original-input changing-state frontier.** This is an empirical **source-native GP29 English obstruction** for the exact source-geometry/clock interpretation below. It does **not** decipher any unknown page or establish that Cicada chose this geometric architecture.

## Source-selected inputs and the stronger alternative

The canonical ciphertext on physical pp0–55 contains **12,956 original runes**, with the first occurrence of the unique duplicated two-word ending \`DJU BEI\` exactly at global count **6,561 = 81²**; the second occurrence ends the unsolved book after another **6,395 runes**. Physically inserting the five actual numbered glyphless headings in the latter span supplies **80²** cells. Two previously published original source pairings are held fixed: p7/p8 GF81 field-generator coordinates and the literal 81² interior crop.

Original p50 independently prints a **32×8 table of exactly 256 two-character base60 cells**. The fully split ten-state source clock, taking first-digit and second-digit parity from the predecessor cell, made arbitrary 841! local two-rune mappings pass a necessary all-secret unigram frequency bound. [The independent exact affine/quartic investigation](lp2-bookend-p50-tenstate-allaffine-quadratic-original-gate.md) then proved no degree≤4 source-keyed polynomial could produce ordinary source-native English under either frozen pairing. A deeper rival remains: perhaps **every one of the 256 printed p50 cell addresses** selects an independent, completely hidden, arbitrarily nonlinear two-rune map. The original full table supplies the physical state labels directly; unlike a post-selected cryptographic period, its table-cell clock needs no invented number sequence.

This report tests **the entire family at once**. An arbitrary secret reversible pair map at fixed clock state \`z\` has a deterministic first output

\[
  P_i=f_z(K_i,C_i),
\]

where \(K_i\) is the unchanged p7-derived source rune from A and \(C_i\) the unchanged B rune. The hidden second output can retain any other symbol, so the full pair map may be any of **841!** bijections. For each state \(z\), \`f_z\` may be any possible 29×29 lookup. This generous model contains every static affine, polynomial, arbitrary substitution, Feistel and nonlinear permutation mapping at that state. No algorithmic secret key restriction, output-fitted alphabet, or plain-language guess enters the original-cipher invariant.

## Exact original-cipher invariant

If two original positions share the same triple

\[
(z_i,K_i,C_i)=(z_j,K_j,C_j),
\]

then **any deterministic first-output map must output the same plaintext rune**, \(P_i=P_j\). This is independent of how any other input state is mapped and survives arbitrarily long secret codebooks. It also survives arbitrary nonzero affine scaling, output relabeling, or an unobserved second symbol.

Test two p50 source clocks using the exact existing 6,561/6,395 pairing and predecessor convention \`cell_i=(6560+i) mod256\`:

- **Full physical cell identity:** all **256** original table positions treated as independently keyed states. Any single unknown global starting phase simply relabels the 256 cell classes, leaving **all** equality constraints invariant.
- **Literal table token value:** the decoded base60 number at that cell is the state; the original 256 printed tokens contain **161 distinct numeric values**, so this conservatively enforces extra equalities at repeated printed values.

The C and K operands are the **unmodified original 6,395 GP29 indices** under each independent source pairing, preserving the five real numbered holes. The rank/equality calculation requires neither a word list nor any cipher parameter search.

| Original K alignment and state | Distinct full input triples | Repeated source triple groups | Mandatory plaintext equality relations | Original equal-pair events |
| --- | ---: | ---: | ---: | ---: |
| GF81 field, **256 cell positions** | **6,305** | 90 | **90** | 90 |
| Literal crop, **256 cell positions** | **6,307** | 87 | **88** | 89 |
| GF81 field, **161 printed token values** | **6,208** | 185 | **187** | 189 |
| Literal crop, **161 printed token values** | **6,224** | 167 | **171** | 175 |

For any candidate plaintext passage, compute an **exact mandatory contradiction count**. Group all positions with identical \((z,K,C)\). In each group, count the GP29 symbols in the independently supplied candidate; the minimum number of candidate rune changes required for full equality is **group length minus the largest symbol multiplicity**. Sum across groups. **Zero** is necessary for any deterministic decoder in the declared model, even with a completely unlimited unknown key. This tests the original input for a property stronger than any successful unigram frequency fit.

## Independent source-native plaintext controls

Use the original native-GP orthography calibration for existing pinned Gibran and Shakespeare English reference corpora, preserving contracted GP29 digraphs and standard substitutions. Compare every deterministic complete 6,395-rune window at source offsets **0, 2,131, 4,262, ...**, with no language fitted to the original C. There are **27 Gibran** and **99 Shakespeare** complete source windows (they overlap), for **126 per original state/pairing case**.

| Original state / K | Gibran mandatory disagreements, across 27 windows | Shakespeare mandatory disagreements, across 99 windows |
| --- | ---: | ---: |
| **256 cell identities / GF81** | **76–87** of 90 equality relations | **78–89** of 90 |
| **256 cell identities / crop** | **79–86** of 88 | **77–86** of 88 |
| **161 literal token values / GF81** | **166–182** of 187 | **167–183** of 187 |
| **161 literal token values / crop** | **152–166** of 171 | **150–165** of 171 |

**Zero of 126 genuine source-native English control windows** satisfies all original equal-input constraints, under either source pairing or either p50 state grammar. Each native window has at least **76** inescapable positional mismatches under the most permissive **256 unique table-cell state clock**, and the token clock is more restrictive. These constraints are exact for the actual 6,395 original ciphertext and depend on no sampled cipher keys.

This is a severe **language-register incompatibility**, with limited scope: 126 actual reference passages do not logically exclude every imaginable English manuscript, a contrived acrostic deliberately containing long-range repeated symbols, native-GP text with different source-to-output alignment, or a genuinely evolving internal state. The original source is an **unverified** 81²/80² reading. A fully arbitrary lookup with *additional state* can evade this theorem; its added state must be source-selected and predictive, rather than introduced merely to erase contradictions.

## Positive, source-paired nonlinear controls

The [stand-alone Windows Node22 CommonJS SFT](../sims/lp2_bookend_p50_fullcell_allsecret_collision_original_sft.cjs) includes a **full 6,395-rune genuine native-GP English positive plant** under each exact original K alignment and each clock. Define a source-only secret shift

\[
h(z,k)=3z+7k^2+5zk+11\pmod{29},
\quad C_{\mathrm{plant},i}=P_{\mathrm{native},i}-h(z_i,K_i)\pmod{29}.
\]

Then the paired map \((K,C)\mapsto(P=C+h(z,K),\,Q=K)\) is perfectly invertible for any cell state and all 29² symbol pairs. The source-native plant recovers **6,395/6,395** exact original-length plaintext runes under both clocks and K readings, with **zero** repeated-triple contradictions. This demonstrates that the invariant correctly distinguishes actual secret per-cell English encipherment from the original C rather than rejecting genuine plaintext automatically.

## Research decision

The **full physical 256-cell identity** is more flexible than any of the previously proposed five-, eight-, nine- or ten-state merged table clocks and the 161-value token states. Since all **256** independently secret local map choices still create **88–90** fixed original identical-input constraints that ordinary native-GP reference prose nearly always contradicts, exploring static secret 841! lookup keys, additional p50 table-cell substitutions, or higher-degree scalar polynomials within this same 81²/80² pairing lacks a credible causal path to authentic plaintext.

This strengthens the requirement that a successful bookend route either **changes internal state over time**, **uses another source-selected spatial permutation/alignment**, **decodes another representation or script**, or **abandons this speculative geometry**. Such a route must identify its extra original-input operand or rule and pass an untouched page/chapter holdout; the current geometry and numeric coincidences are insufficient to reconstruct it. A source-fixed recurrence involving previous ciphertext or an original page boundary is an example of a third input one could *test if first-party instructions select it*, rather than a claimed next key. This result supplies a precise obstacle for the independent [changing-state Director task #2310](https://github.com/FlareZ123/liber-primus/issues/2310).

No authentic unknown LP2 plaintext, cipher key or final destination recovered.
