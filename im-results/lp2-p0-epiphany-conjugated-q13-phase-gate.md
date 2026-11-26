# Opening title crib, conjugated q13 continuous-phase gate

## Decision

Exclude the **specific** conditional EPIPHANY SEEKS title-derived common-cycle construction on the first 56 complete black groups (248 runes) with at most three out-of-register words. This is not a plaintext recovery and does not reject the title hypothesis independently. It is distinct from literal/coordinate raw-title shifts and a separate outer substitution on a fixed prime stream.

## Model

Use the original red title `f8i36jr0fqil5` and conditional title plaintext indices `[18,13,10,13,8,24,9,26,15,18,18,5,15]`. A single arbitrary bijection pi of GP29 labels onto GF(29), normalized pi(F)=0 and pi(M)=1, determines every phase shift as
`k[j] = pi(Ctitle[j])-pi(Ptitle[j])`.
For non-F plaintext, require `pi(C)=pi(P)+k[j]` and advance j modulo 13. Literal plaintext F holds phase and emits F. The title plaintext contains no F, so the body begins in phase 0. There are exactly two zero-key phases, 8 and 10 (zero-based). Other phase shifts cannot vanish. Gauge pi(M)=1 loses no actions: nonzero scalar multiplication preserves all equations; sum(pi)=0 follows from bijectivity.

## Search and finite exclusion

Use the existing 38,938-form register (including the 28 fixture additions). Source transcription joins physical pages 0–2 without introducing boundaries at wraps: 158 total groups, 729 runes; remove two red title groups. The training prefix contains 56 complete black groups/248 runes.

For every group, start phase and candidate word, check F-hold legality and the exact equality pattern: non-F P=C iff the phase shift is zero. This ignores all other coordinate constraints. Construct the min-plus transition matrix with cost 0 for a supported lexical reading and cost 1 for any structurally legal unknown reading. Forward/backward phase DP gives a minimum of three OOV groups. Retain only dictionary options lying on a relaxed path of cost at most three. A group is mandatory if **no** structurally legal transition charged cost one can lie on such a path, even if the same phase endpoints have a cost-zero alternative. Forty-nine groups are mandatory.

Sort mandatory groups by retained word/phase count. The first six are original black group indices 4,44,42,50,19,2; counts 2,2,6,9,12,15. For every choice impose the homogeneous four-coordinate equations `pi(C)-pi(P)-pi(Ctitle[j])+pi(Ptitle[j])=0`, with the gauge and sum. Reject inconsistent affine systems and pairs of rune coordinates that are identically equal throughout the surviving affine space. This still relaxes inter-anchor phase compatibility and unforced coordinate collisions, so rejection cannot discard a real action.

Nodes by depth: 1,1,1,5,32,253; 4,234 joins, 3,942 rejected, no leaf, no cap. Exhaustion follows already from the six mandatory groups. No full permutation enumeration was needed. On the complete 156-group opening body, the purely structural phase DP minimum is nine OOV (not an affine full-chapter search).

Two deterministic planted permutations (seeds 3301/1033), with independently selected register words of the same 56 lengths, retain each true word and phase transition, OOV lower bound zero, and reach affine dimension zero after imposing the true constraints. These are positive **witness** controls, not blind recovery tests. The original experiment was executed in connected V8 against repository inputs; no standalone Node CI claim.

## Boundaries

The signed-phrase-derived title remains conditional. Different plaintext title, noncontinuous clocks, different shift generator, more than three OOV in the prefix, alternate F semantics, and alternate alphabet actions are outside this exclusion. No physical p1/p2 suffix helped select the six training anchors; the chapter-level structural lower bound is an additional check only. Avoid repeating mapped-title positive/negative or standard affine/autokey families already rejected elsewhere.

- [SFT](../sims/lp2_p0_epiphany_conjugated_q13_phase_gate_sft.cjs) (c220010662975728086006d254841756d4b4a1b1)
- [Exact output](lp2-p0-epiphany-conjugated-q13-phase-gate.json) (7d3655bb18ce6c67cd45096b70f2e39620bab545)
