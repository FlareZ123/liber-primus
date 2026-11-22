# P7/P8 255-word handoff: source-title two-evaluation word hash is impossible

**Agent48, 22 November 2026. Evidence class: bounded exact original-input exclusion.** This investigates a distinct candidate for the still-missing *nonlinear whole-word output law* of the previously reported physical p3–p7 → p8 255-to-255 match. **No unknown-page plaintext, authentic key or complete LP2 cipher has been recovered.**

## Source-selected premise and its rival

Physical LP2 pp3–7 contain exactly **255 complete printed words** (1,145 runes), and the immediately adjacent p8 contains **255 ciphertext runes**. Original p7 ends with five entirely red words whose GP29 **zero-based rune-product residues** are `[11,26,8,15,2]`; original p8 begins with two red words whose residues are **`[4,3]`**. A previously fitted, *not author-authenticated*, interpretation reads four p7 products as the taps and the fifth as seed of a primitive GF(4) order-four state cycle of length255. It uses each successive nonzero state as an index into the original 256-cell p49–51 table, after the separately speculative omission of lowercase `f` from the conventional base60 alphabet (base59). That correction makes **four original same-word/anagram classes** agree between the scroll and p8.

The next question is whether p8's conspicuous **4,3** source-title pair actually supplies an **order-invariant two-number word hash**. GP29 index arithmetic and prime sacredness motivate a simple commutative word polynomial

\[
  G_w(t)=\prod_{r\in w}(t+\mathrm{GP0}(r))\pmod{29}.
\]

The test grants an *arbitrarily secret and nonlinear* fixed output table `H: GF(29)^2 -> GF(29)` for the two title-selected arguments. It requires only `Z_i = H(G_{w_i}(3),G_{w_i}(4))`, where `Z_i=(C_{p8,i}+B_{59}[A_i]) mod29` is the exact previously proposed 255-state corrected original p8 tape. If two words have the **same complete argument pair** but different required `Z`, **no possible secret H exists**. This avoids a cryptographic-key search or a post-fitted language score. The rival is that 4,3 are simply part of an encrypted heading, or the intended hash requires additional input or advancing state.

## Direct original-source contradiction

All inputs come from the repository's canonical original-transcription/ink records and exact 256 source tokens. The full source-original test produces:

| Whole-word hash inputs | Distinct argument tuples among 255 words | Additional same-tuple occurrences | Occurrences demanding different outputs |
| --- | ---: | ---: | ---: |
| **(G(3), G(4))**, both adjacent source-heading products | **210** | **45** | **38** |
| (G(0), G(3), G(4)), adding the unshifted whole-word product | 251 | 4 | 0 |
| (G(3), G(4), G(17)), adding p8's last red rune as a third argument | 248 | 7 | 3 |

The two-input original-source candidate is impossible even with a completely unrestricted, secretly selected 29×29 output codebook: **38** later occurrences contradict the value required by the first occurrence of the same argument tuple.

A short original-source witness is scroll word **13** on p3, with GP indices `[19,26,8,28]`, and scroll word **17**, also on p3, with GP indices `[2,18,26]`. Both have **`G(3)=0` and `G(4)=16`**, but their corrected original p8 runes demand **18** and **25** respectively. Any single-valued `H(0,16)` is therefore impossible. Neither a hidden 29×29 permutation nor a more complicated nonlinear static lookup can reconcile them.

The three-input `(G(0),G(3),G(4))` expansion has **exactly 251 unique tuples**, equal to the **251 distinct whole-word rune multisets** already in the scroll; its only four repeated tuples are the same previously selected identical-word/anagram pairs. The **4/4 agreement there is inherited from the old GF(4)/base59 correction fit** and supplies *no independent prediction* of any distinct source word. Appending the third argument only rescues the contradiction by creating enough free labels for essentially every observed word. This is not plaintext recovery or evidence that the author chose this three-evaluation function.

## Reproducer and scope

[`sims/lp2_scroll255_eval34_allsecret_gate_sft.cjs`](../sims/lp2_scroll255_eval34_allsecret_gate_sft.cjs) is a read-only Windows-compatible Node22 single-file test. It reconstructs all **2,896** original complete words, checks the physical page50 omission, verifies the p7/p8 red-ink products and canonical p50 byte SHA256, builds all **255** GF4 states and the hypothetical base59 correction, checks four original anagram pairs, and produces the exact collision certificates. It includes a **positive nonlinear-hash plant** that is encoded to synthetic p8 ciphertext with the same source table/state and recovered with zero contradictory pairs. The gate is fully determined from original source bytes after choosing the explicitly conditional GF4/base59 model.

**Decision:** retire the hypothesis that p8's red title values **4 and 3** provide *the entire stationary commutative GP29 polynomial word-hash input* to the proposed scroll-to-p8 corrected tape. This result does **not** invalidate the physical count equalities, the original p7/p8 red-product relations, or arbitrary stateful, word-order-sensitive, externally keyed or richer polynomial decoding. Its immediate consequence is to avoid spending more search on secret 29×29 codebooks for this two-argument source hypothesis. Any future route needs a genuinely source-chosen additional operand and must predict new original runes/long plaintext before tuning a lookup.

Context: [preceding source selector and exact four-pair fit](lp2-p7-p8-dual-field-original-source-selector.md) · [fourth anagram discriminator](lp2-fourth-anagram-falsifies-2040-gf256-hex-family.md).
