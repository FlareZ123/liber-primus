# Four-dot-framed variable-length F-pair escape: original all-secret obstruction

**Agent18, 16 November 2026. Director #1223.** This bounded source-first investigation yields **no unknown LP2 plaintext or authentic key**. It excludes a complete, paper-readable 29-to-28 predecessor-excluding *variable-length* GP29 code, even if every local alphabet and escape follower is secret, for two exact choices of visible state: last ciphertext rune alone, or last ciphertext rune plus four-phase clock reset by the 138 genuine four-dot stops.

## Why the receiver could have been tried

Original pp0–55 contain **12,956 ciphertext runes in 2,896 printed words** and **86 adjacent equal-rune pairs**; there are **63 within-word** and **23 across printed words**. The original-image punctuation census identifies **138 actual four-dot diamond full stops**, giving 139 fields. Do not equate those with the 145 derivative `⁘` rows: indices 57–60 were unprinted numeric-row terminators, 91 is a detached ambiguous single mark, 125 is absent, and 127 is a three-dot comma-form. Four-dot marks appear as ordinary punctuation on known solved/clear pp56–57 and do **not** themselves authenticate a cipher receiver.

The original solved GP ciphers sometimes treat plaintext F specially. The authenticated 2013 BASE29 operation makes alphabet-rank coding historically conceivable. Those precedents motivate this **candidate only**: neither supplies the two-rune escape or an LP2 state law.

## Complete frozen reversible candidate

Within each printed word, keep state `q` (last emitted ciphertext GP value, with an initial state). For plaintext GP symbol `p`:

- If `p` is among the 28 **non-F** values, emit one GP ciphertext rune `c ≠ q` using a bijection of the 28 available outputs. In the explicit positive plant, use ascending predecessor-exclusion rank: `rank=p−1`; `c=rank+(rank>=q)`.
- If `p=F`, emit a **two-rune equal pair `[h(q),h(q)]`** where `h(q)≠q`; the plant uses `h(q)=(q+5) mod29` (5 is the historical DH generator). Each printed word remains one word, even though each plaintext F adds one ciphertext rune.
- Decode by detecting two equal adjacent glyphs as one F, otherwise invert the single-rune predecessor-exclusion map. State becomes the last consumed ciphertext rune. No hidden side tape, dropped rune, punctuation change, or freely reconstructed plaintext is permitted.
- Generously permit **all possible secret per-q 28-letter bijections and arbitrary `h(q)`**, so failure cannot be repaired by guessing a different small affine key. Test the stronger source-specific variant `h(q,phase)` with `phase=(ciphertext rune position since preceding confirmed four-dot stop) mod4`; all 116 possible predecessor/phase outputs are likewise arbitrary secrets.

This is a complete code for **all possible GP29 plaintext words**, with deterministic forward and inverse operations. A separate positive uses all 95 genuine clear p57 GP runes repeatedly in 84 synthetically segmented words. Its escape length changes, exact inverse, exact forward reproduction, layout-carried word, and wrong-step rejection are exercised in the Windows-compatible Node22 CJS script. The positive proves the algorithm is implementable, not historically used.

## Source-exact contradiction and heldout

For a repeated pair `[...,q,x,x,...]` *strictly inside a printed word*, the pair must be the single F escape and `x=h(q)` (or `h(q,phase)`). The same state can have only one emitted pair value. We **exclude pairs at word start** when testing this necessary condition, generously allowing any word-initial state.

| Source region | Eligible internal F-pair sites | Prior-q states with incompatible outputs | Four-dot phase-q states with incompatible outputs |
| --- | ---: | ---: | ---: |
| pp0–39 | **43** | **13** | **8** |
| pp40–55, independently withheld | **8** | **2** | 0 |
| Whole 55 rune-bearing pages | **51** | **15** | **10** |

One compact, independently checkable contradiction settles **both** stationary and four-phase families:

- Physical **p0** global rune offset **206** has `NG X X EO`, with preceding genuine stop at **154**, hence four-dot phase **0**. A decoder requires `h(NG,0)=X`.
- Physical **p35** global rune offset **8637** has `NG J J IA`, with preceding genuine stop at **8513**, also phase **0**. It requires `h(NG,0)=J`.

These two authentic original events have the **same source-visible state** and different required outputs, so no key, GP alphabet permutation, or chosen 28-way bijection can satisfy the proposed deterministic pair escape. A variable additional hidden state, different escape grammar, or a genuinely source-derived field-specific program remains possible; none is selected by the four-dot glyphs.

The unchanged original stream also includes twelve further word-initial repeated pairs and 23 cross-word repeats, which the universal obstruction **does not rely on**. Those were never silently reinterpreted as additional codewords.

A corroborating language diagnostic is also unpromising: if every one of the 63 within-word doubles represented one F, the resulting plaintext would contain only 63 F symbols in 12,893 runes (**0.49%**), versus **2.56% F** in the source-native 63,114-rune Gibran reference. This is a register-specific comparison, not a general impossibility theorem.

## Research decision

Close this source-visible **two-rune F-pair** branch. A four-dot boundary does not determine a unique decode opcode, and the most direct stationary and period-four escape receivers are incompatible with untouched original ciphertext **before** language fitting. Previous exact studies already ruled out different byte transports and printed-boundary escape models; this experiment specifically addresses a **length-changing word-preserving GP29 inverse** with deterministic pair emission. Further work should require an independent instruction that selects a different state and can produce grammatical original plaintext with whole-word and page-carry fidelity.

**Reproduction:** [Node22 original-source SFT](../sims/lp2_fourdot_fpair_variablelength_allsecret_sft.cjs), manual-only Windows workflow `.github/workflows/agent18-fourdot-fpair-manual.yml`, original [LP2 corpus](../resources/liber-primus/lp2-corpus.json), [word/page transcription](../resources/liber-primus/lp2-transcription.txt), and [source-audited punctuation](../resources/liber-primus/lp2-punctuation-identity.json). This belongs in intermediate findings, not `results/` as a recovered cipher.
