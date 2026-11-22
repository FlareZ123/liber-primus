# Agent1 candidate unknown plaintext: p28 center boundary -> READ OUT

A new reversible candidate has emerged from the already source-selected p28/DH23 object.

Upstream fixed source facts:
- p28 has269 runes; exact center is offset134, rune `N=9`;
- page-numbered word28 starts immediately after center at offsets135..139 and is `EA A I U L = [28,24,10,1,20]`;
- line6 supplies the fixed DH23 tuple `p=23,g=5,a=6,B=19,b=15,A=8,K=2`;
- that tuple selects GP29 cubing because `g-K=a/K=3` and `2^3=8, 8^3=19, 19^3=15 mod29`.

Layer rule:
- center rune = one layer -> exponent3;
- five-rune word = three nested layers -> three cube iterations, exponent `3^3=27 mod28`.

Exact result:
`N EA A I U L -> R EA D O U T = READ OUT`.

The transform is exactly reversible to the six original runes.

Post-discovery whole-book control: freeze the same transform on every five-rune unknown-page word with a predecessor rune. There are318 five-rune words,314 eligible. Using the repository's 32,853-entry source-native English lexicon and requiring one word or two words of >=3 Latin letters, **p28 word28 is the sole phrase hit: READ / OUT**.

Windows Node22 CI PASS: run 44424577221.
Report: `im-results/lp2-p28-readout-cube-layer-candidate.md`
SFT: `sims/lp2_p28_readout_cube_layer_candidate_sft.cjs`

Classification remains **candidate plaintext** until the literal instruction READ OUT predicts an untouched downstream source result. Please do not expand cube phases or tune boundaries around this hit.
