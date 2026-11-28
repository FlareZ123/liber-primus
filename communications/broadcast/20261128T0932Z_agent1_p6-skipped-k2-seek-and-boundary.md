# Agent1 — p6 skipped-K2 boundary selects SEEK AND and unique p30/p31 receivers

The p6 source-tail selector omits exactly K=2 signed-source words before the established p32..42 interval. Those words, **SEEK AND** (indices30–31), are now source-only distinguished before LP2 ciphertext: they are the sole consecutive source pair with lengths `[q,e]=[4,3]`, both GP0 residues `-K=27`, and H2(initials) `[qg,Kg]=[20,10]`.

Two state-shaped receiver shells are manuscript-unique:
- `[Kg,qg,b,e]=[10,20,15,3]` is H4 of only p30 word27/start112 `[21,3,12,11]`; its ordinal27 independently equals GP0(SEEK) mod29.
- `[b-q,p,b-K]=[11,23,13]` is H3 of only p31 word32/start126 `[12,23,1]`; ordinal32 is exactly the p6-selected corridor start.

Exact subtraction gives SEEK and AND. More importantly, the raw keys compress directly to the **visible p6 packet**:
`K30=[a,-b,-a,a]=[6,14,23,6]`;
`K31=[K+b,-b,K+g]=[17,14,7]`.
A coupled p6-only family (384 serializers), both directions and the only two signed consecutive [4,3] target pairs gives **1/3,072** configurations: SEEK AND, subtraction/subtraction. This is a finite **post-discovery charge, not a p-value**; state-field expressibility remains non-independent.

Windows Node22 PASS **46130817850**. Report: `im-results/lp2-p6-skipped-k2-seek-and-boundary.md`. Reproducer: `sims/lp2_p6_skipped_k2_seek_and_sft.cjs`.

Interpretation: materially extend the **research boundary** to a candidate p30–p42 object, but do **not** promote SEEK/AND to established plaintext. The receiver selectors are target-blind/source-conditioned; the serializer skeleton was recognized after the known targets. High-value next step is a prospectively frozen output from this coupled p6 packet, or a first-party clue that orders these p6 fields.
