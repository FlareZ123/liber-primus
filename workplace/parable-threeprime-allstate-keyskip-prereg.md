# Full three-prime Parable BBS state search with collision-only GP29 key skips

**Status: completed; no intelligible shortlisted plaintext. Broader conditional shared-page receiver now excluded by the exact lexical gate.** This is a bounded exhaustive test of one source-motivated receiver family.

## Upstream evidence

The 2013 audio ID3 Parable value and solved p57 body-clause GP-prime sums give N = 1259×1031×1229 = 1,595,277,641. Earlier work established:
- fixed-seed three-prime BBS searches found no original LP2 plaintext;
- the full two-factor Blum subset has already been exhaustively searched under the collision-only GP29 keyskip inverse;
- a blind planted positive for the full three-prime modulus, seed 3301, five LSBs packed MSB-first and collision-only skips recovered 1260/1260 runes;
- the full three-prime unknown-state collision-only keyskip family has not been exhaustively searched.

## Frozen search

- Modulus: full N = 1,595,277,641 only.
- State domain: every x1 = x0² mod N, represented exactly by CRT over the three component quadratic-residue sets (sizes 630, 516, 615; 199,924,200 states). The established generator initializes x=seed² and squares once more before emitting the first bit; its seed-3301 control therefore starts from x=3301⁴ mod N, which is checked inside this exhaustive x1 domain.
- Key extraction: five successive state LSBs packed MSB-first, then value mod29. This is the source-native planted-positive format; no other output format is searched.
- Cipher: GP29 additive, both signs.
- Clock: page-reset.
- Collision model: hidden key consumption only when the proposed ciphertext would repeat the preceding ciphertext; at most four skips in the first 28-rune head screen, penalty 3.5.
- Screen: p0 first 28 runes, independent Shakespeare trigram model, top 800 states.
- Validation: exact 130-rune fit / 80-rune heldout split on p0 for all 800 shortlisted candidates.
- Positive controls: verify the fivebits-msb key stream for seed 3301 against the established JS generator and run the existing blind 1260-rune planted control.

## Decision rule

A candidate is not a solution on score alone. Require coherent heldout plaintext and independent source support. If no top-800 candidate has intelligible heldout text, retire only this full-N, fivebits-msb, page-reset, GP29-additive collision-keyskip receiver. Do not expand to other output modes, bit order, moduli, clocks or skip rules in this experiment.


The first workflow attempt (45415294259) stopped at the positive key-stream alignment assertion before enumerating any states. The established BBS generator initializes x=seed² and squares once more before its first output; the corrected seed-3301 state is x=3301⁴ mod N. The corrected run is https://github.com/FlareZ123/liber-primus/actions/runs/45415630592.
## Completed decision

The completed [run 45415630592](https://github.com/FlareZ123/liber-primus/actions/runs/45415630592) screened 199,924,200 CRT square-residue states / 399,848,400 signed decodes, then fully scored only 800 shortlisted states. Best held-out log/rune −5.003249 was nonlinguistic; the 1,260/1,260 plant scored −2.446623 held-out. [Raw report](../im-results/parable-threeprime-allstate-keyskip.json). This is an exhaustive state *screen*, not a full-length exhaustive key rejection. Its seed metadata labels seed²=10,896,601 as first state; the actual generator first emitted state is seed⁴=993811212, checked by the C++ stream-alignment control. The exact shared-page lexical gate now supplies a broader conditional exclusion without heuristic shortlisting.

**Collision-skip extension (Agent25, 24 November 2026):** for shared physical-page reset GP29 additive encryption, even arbitrary unknown pad material with optional collision-triggered key redraws cannot satisfy the first printed complete multi-rune groups in the fixed 35,700-form literary/native register. Original p0–39 has 5 → 0 surviving key prefixes; disjoint p40–55 has 23 → 91 → 3 → 0. Every singleton and every cross-page fragment is free. Unlimited consecutive collision retries leave 5 → 0 and 23 → 91 → 38 → 31 → 31 → 31 → 31 → 31; with all red groups unconstrained, 13 → 0 and 26 → 234 → 220 → 195 → 195 → 195 → 195 → 195. Two independent original-shaped modular-squaring plants uniquely recover all eight fitted signed-pad digits and transfer them to the held-out pages. Retire this shared reset receiver under the stated finite lexicon, regardless of BBS seed, modulus, or extraction; other clocks and out-of-register words remain outside the result. [Exact gate](../im-results/lp2-shared-page-reset-additive-pad-heldout-gate.md#collision-triggered-key-skip-extension-agent25-24-november) · [SFT](../sims/lp2_page_reset_collision_keyskip_lexical_sft.cjs) · [raw](../im-results/lp2-page-reset-collision-keyskip-lexical.json).

## Completed decision

The completed [full-three-prime run 45415630592](https://github.com/FlareZ123/liber-primus/actions/runs/45415630592) screened all 199,924,200 CRT square-residue states (399,848,400 signed candidates), then fully evaluated only 800 shortlisted states. The best held-out score was −5.003249 nats/rune, nonlinguistic, versus the 1,260/1,260 planted control's −2.446623. [Raw report](../im-results/parable-threeprime-allstate-keyskip.json). The raw seed metadata labels seed²=10,896,601 as first state, but the actual first emitted state is seed⁴=993,811,212, checked by the C++ stream-alignment assertion. This is an exhaustive state screen, not an exhaustive full-length decoder. The separate all-key lexical result now retires the shared-page collision-only additive receiver without relying on language-score shortlisting.

**Shared reset with collision-triggered key skips (Agent25, 24 November):** the exact all-key lexical inverse over 35,700 length-2–12 GP forms rejects every shared signed additive pad on original p0–39 after just two consumed key digits (5 → 0 surviving prefixes), even with unlimited consecutive collision retries. All singleton and page-carry groups are unconstrained. Dropping every red-ink group still gives 13 → 0; seven black-body page openings p11/12/13/14/18/21/35 independently suffice. Disjoint p40–55 rejects the one-retry model by digit four (23 → 91 → 3 → 0); unlimited retries leave 31 prefixes at digit eight and are not independently excluded on those late pages. The eight literal dollar-delimited source sections, tested as a distinct shared-reset hypothesis, have 15 → 2 → 0 prefixes even with unlimited retries. Two original-shaped modular-squaring plants uniquely recover both eight-digit signed keys and admit all disjoint planted late pages. This is a conditional intact-group finite-lexicon exclusion, not a recovered key or plaintext. [Consolidated exact gate](../im-results/lp2-shared-page-reset-additive-pad-heldout-gate.md#collision-triggered-key-skip-extension-agent25-24-november) · [SFT](../sims/lp2_page_reset_collision_keyskip_lexical_sft.cjs) · [raw](../im-results/lp2-page-reset-collision-keyskip-lexical.json).
