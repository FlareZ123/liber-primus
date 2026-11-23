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

## Independent 242-black-word rival: three exact anagram obstructions

The manuscript supplies an independently plausible **242-to-242** source alignment. Precisely **242** of the 255 p3–p7 words are entirely black, and the next p8 contains **242 entirely page-contained black runes** at offsets 12–253. Its 243rd black rune begins an authentic word continued on p9; it cannot be dropped without explanation. The five p7 red-word GP0 products, taken **all as taps** modulo3 `[2,2,2,0,2]`, give a primitive five-trit LFSR of period **242** under the conventional source-unselected initial register `[1,0,0,0,0]`. This is the separate GF3 hypothesis described in the existing dual-field source report; its material advantage is that no fifth tap has to be reclassified as a seed.

The 242 black source words contain exactly three pairs of identical rune *multisets* (zero-based indices among black words): **(44,223), (227,228), (43,232)**. Their original unmodified p8 output rune pairs are **(15,17), (27,8), (18,9)**. Thus a **stationary order-invariant whole-word function of the black word alone**, with any arbitrary secret codebook, already contradicts the untouched original p8 values **3/3** times. This negative is completely independent of the speculative GF4/base59 correction.

The most direct proposed evolving state is the source-red GF3 five-tap 242-cycle addressing the source 256-cell byte panel. Under its *frozen* `[1,0,0,0,0]` state and forward source order, apply either `Z_i=C_i+B[A_i] mod29` or `Z_i=C_i-B[A_i] mod29`. Both the canonical **base60** bytes and the separately conjectured **omitted-f base59** bytes leave **all three black anagram pairs unequal**, four cases each giving **0/3 agreements**. Their original address pairs are (123,130), (122,124), (203,143); neither table-reading choice supplies a hidden exact word-hash invariant. In contrast, the SFT's planted deterministic whole-word output agrees across all three pairs.

The crucial remaining phase ambiguity is also small enough to eliminate **exhaustively**, without guessing a new key. The primitive 242-cycle has exactly 242 nonzero start states. Keeping the exact three original anagram equations fixed, the test evaluates both physical forward/backward directions, both printed-table readings (base60/base59), both GP29 signs, and **every one of the 242 phases**: **1,936 source-defined cases**. All **1,936** original outcomes have at least one mismatching anagram pair: the number of cases agreeing on 0, 1, 2, or all 3 pairs is precisely **[1,722, 208, 6, 0]**. The six best cases have only 2/3. A planted source-byte correction at phase37 recovers an independently constructed stationary whole-word plant exactly across all242 positions and all three anagram pairs, so the check is sensitive to the specified model.

**Decision:** the GF3 242-word/242-rune numerical framing remains an observable source equality. This gate rejects **every cyclic phase and both scan directions** of the direct source-table additive word-hash correction under the two documented radices and signs, even when the initial GF3 state is wholly secret. Because every legitimate static anagram-invariant word hash must make all three pairs agree, a secret word-hash codebook cannot rescue this candidate by adding arbitrary nonlinear output labels. A genuinely evolving, order-sensitive or more complex source-specified mechanism would require a fresh authored operation and an independent long original-cipher prediction. This is a bounded impossibility for the stated architecture, not a universal 242-state impossibility.

## Reproducer and scope

[`sims/lp2_scroll255_eval34_allsecret_gate_sft.cjs`](../sims/lp2_scroll255_eval34_allsecret_gate_sft.cjs) is a read-only Windows-compatible Node22 single-file test. It reconstructs all **2,896** original complete words, checks the physical page50 omission, verifies the p7/p8 red-ink products and canonical p50 byte SHA256, builds all **255** GF4 states and the hypothetical base59 correction, checks four original 255-word anagram pairs, independently tests all three black-word GF3 anagram obstructions under both numeric table radices and signs, and produces exact collision certificates. It includes a **positive nonlinear-hash plant** that is encoded to synthetic p8 ciphertext with the same source table/state and recovered with zero contradictory pairs. The gate is fully determined from original source bytes after choosing the explicitly conditional GF4/base59 model. **Source SFT executed successfully** on Windows GitHub Actions (Node.js 22), [manual run 45088208228](https://github.com/FlareZ123/liber-primus/actions/runs/45088208228). This run includes the additional exhaustive 1,936-case black-GF3 gate.

**Decision:** retire the hypothesis that p8's red title values **4 and 3** provide *the entire stationary commutative GP29 polynomial word-hash input* to the proposed scroll-to-p8 corrected tape. This result does **not** invalidate the physical count equalities, the original p7/p8 red-product relations, or arbitrary stateful, word-order-sensitive, externally keyed or richer polynomial decoding. Its immediate consequence is to avoid spending more search on secret 29×29 codebooks for this two-argument source hypothesis. Any future route needs a genuinely source-chosen additional operand and must predict new original runes/long plaintext before tuning a lookup.

Context: [preceding source selector and exact four-pair fit](lp2-p7-p8-dual-field-original-source-selector.md) · [fourth anagram discriminator](lp2-fourth-anagram-falsifies-2040-gf256-hex-family.md).
