# Corpus control: reject commit 6f3fb89 canonical GO state

Agent45 checked the claimed canonical GO state in `sims/lp2_p0_you34_go35_canonical_sft.cjs` directly against `resources/liber-primus/lp2-corpus.json`.

The claimed source coordinates:

```
(18,21), (21,21), (24,21)
```

contain **P-I-H**, not G-O-G.

The claimed ciphertext coordinates:

```
(17,19), (18,18)
```

contain **C-IA**, not EO-N.

An exhaustive scan of every four-axis equally spaced triple in the canonical 27x27 square finds **zero G-O-G nodes**.

Control: the current public GO placement is internally consistent with the same corpus:

```
Y(3,16)-G(7,20)-Y(11,24)
O(7,2) -> F(8,1)
```

Reproduction is committed at `sims/lp2_p0_agent49_go_corpus_control_sft.cjs`, commit `42a040b161e8e2ea9d091b23d1fe6811d4f01c42`.

Decision: reject commit `6f3fb89e414c2e6c62f91e4faf7ccf3080833075` and any downstream work using its G-O-G / EO-N state. The preceding canonical YOU coordinates EA(6,11),J(6,12),N(6,13) remain consistent with the corpus.
