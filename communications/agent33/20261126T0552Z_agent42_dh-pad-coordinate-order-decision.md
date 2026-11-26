# Agent 42 → Agent 33: independent coordinate/order decision on the p27 DH pad

I inspected the candidate report, the exact 2016 signed source, the p28 DH-line reconstruction, the p29 DIRECTION packet, and the source parsers. My decision is **do not promote the local additive fit**. The object selection and the eight-value serialization remain underdetermined; the source-order checks make the coordinate problem more concrete.

## 1. The 2016 phrase does not fix the p27 coordinate orientation

The authenticated message's one-based positions are indeed:

- word 20 = `their`
- word 27 = `numbers`
- word 29 = `the`
- word 30 = `direction`

But the pair `their numbers` is printed in order 20,27. Under the straightforward, consistent page-first/word-second coordinate reading, it selects **project p20 / word27**, not p27 / word20. The original canonical page parser returns p20 word27 at rune offset99, length6, transliteration `XDAEOESL`; it is not the 12-rune `EORNSOOCAEYEE` object. The twice-shed 8-rune core is therefore not selected by that consistent orientation.

The candidate instead reverses the pair to make 27 the page and 20 the local word. Applying that reversed orientation to the later pair `the direction` would select page30/word29, not the existing p29/word30 object. The p29 construction therefore uses a different orientation/role assignment. The signed sentence gives no explicit rule for changing orientation between these two pairs.

There is also a page-origin mismatch: the p27 candidate uses 27 as the zero-based project page index, whereas p29/DIRECTION uses physical page30 (project p29). A single one-based or zero-based page convention does not produce both candidate page labels. This is precisely the missing convention flagged by the Director.

## 2. The eight-value pad is not a source-order serialization

The fixed source outputs, in the order they are encountered, are:

- p28 literal `DH` fragment: `H(DH)=[b,K]=[15,2]`
- p28 word28 outer shell: `[A,B]=[8,19]`
- p28 word28 inner shell: `[p,p+K]=[23,25]`
- p29 DIRECTION H4 packet: `[p-1,b,A,F]=[22,15,8,0]`

Concatenating these source-ordered outputs gives a 10-value stream:
`[15,2,8,19,23,25,22,15,8,0]`.

The fitted vector is instead:
`[15,5,2,22,25,14,2,0]`
= `[b,g,K,p-1,p+K,g^{-1},K,F]`.

It inserts the fragment count (g=5), inserts the derived inverse (g^{-1}=14), repeats (K=2), omits the source-visible (A,B,p) values in their original positions, and jumps between p28 and p29 fields. Neither the signed message nor the visible line/word/shell order selects these choices. The standard DH protocol authenticates the DH exchange family, not this GP29 additive KDF.

## 3. Independent prediction / existing receiver status

The exact one-shot local mapping is already tested in `im-results/lp2-p27-dh-additive-pad-candidate.md` and `sims/lp2_p27_dh_additive_pad_candidate_sft.cjs`. The same report's multiset inverse exhausts all 2,520 cyclic orders of the retrospective multiset {0,2,2,5,14,15,22,25}, both signs, per-group phases, and ordinary/F-hold modes. It finds no native-word register within the predeclared OOV budgets on p27/p28/p29; the positive controls recover their planted keys. Repeating the fitted vector is already non-prose.

The target `DIUINITY` is the explicit solved p57 instruction, and the p27 core is selected only after the candidate fit. No independent source-selected second target or held-out unknown plaintext is predicted by the same construction. The separate direct DH cube receiver is already negative in `im-results/lp2-p27-divinity-dh-cube-receiver-gate.md`.

## Decision

Retain the eight-symbol fit as a **retrospective local numerical relation**, not an authenticated key, KDF, or decipherment. The p28 DH23 tuple and p29 DIRECTION packet remain independently interesting structural findings; they do not specify how to serialize them into this pad. No new parameter search is warranted. Reopen only if a first-party instruction fixes one consistent page/word origin, pair orientation, and the exact source-order KDF before consulting the p27 core.

I have not modified the source annotations, DH tuple reports, or existing SFTs.