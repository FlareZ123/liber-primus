# Two-public-state shared involution: exact singleton gate (#3222)

## Scope

A conditional exploration distinct from fixed conjugation (#3194), independent state maps (#3201), and quartic orbit restrictions (#3213). The historical GP29 involution motivates the family, but no authenticated clue selects this specific law or the two-lag state. Use all-consuming continuous rune clock, public zero initial history, one common involution J on Z/29. Define h=C[i-1], a=C[i-2], and C[i]=J(P[i]+h)-J(a) modulo 29. Inverse P[i]=J(C[i]+J(a))-h. Every input rune is recoverable with the key; two public states couple the same secret map rather than independent state maps.

## Exact cancellation and original witness

For a printed one-rune word, the solved native reference permits GP indices 10 (I) or 24 (A). Therefore J(h+10)-J(a)=C[i] OR J(h+24)-J(a)=C[i]. These relations constrain the same 29 values across both frames. A partial assignment J(x)=y simultaneously fixes J(y)=x. The exact search enumerates both singleton possibilities and feasible image values, propagates involution/injectivity, and selects the constraint with the fewest extensions. It stops after two complete keys or at 200,000 nodes. Zero keys with no cutoff is exhaustive. All indices are zero-based.

At original rune offset **644**, a=17, h=5, C[i]=0, and the two permitted inputs h+10 and h+24 are 15 and 0, respectively. Thus J(17) must equal J(15) or J(0), impossible for **any permutation**, even without the involution requirement. This is inside the predeclared first-half training frame [0,6478). Its 47 anchors reject at the root; the full 83 anchors also reject at the root. There is no trained candidate for the held 36 anchors. No plaintext was inferred.

## Native controls

On the 2,979-rune solved-native source (27 singletons), three fixed-seed random 14-transposition involutions were encrypted under this law. The exact solver found the planted key in its returned solution list in all three cases. Cases 0 and 1 had at least two keys (first two decode 2590/2979 and 2979/2979, and 2979/2979 and 2582/2979 respectively); case 2 had exactly one key, decoding 2979/2979. Nodes 174, 539, 608. Three independent-map wrong-law controls rejected exhaustively in 152, 115, 115 nodes. Controls are not matched to original repeat profile; they calibrate the conditional mechanism and do not establish original applicability. Solver was executed in connected JavaScript on repository inputs; standalone Node wrapper not separately executed.

## Decision

Reject this exact differential receiver with the singleton A/I assumption, fixed public state lags and continuous all-consuming clock. The key-independent witness avoids any dependence on language scoring, key size, or the held-out frame. This does not reject alternative state selectors, nulls, wrong printed word boundaries, or other involution families. No authentic key or unsolved plaintext.

Reproducer: [SFT](../sims/lp2_two_state_involution_singleton_sft.cjs), [raw output](lp2-two-state-involution-singleton-output.json). Source: corpus, image-corrected transcription, solved-native reference in the SFT.
