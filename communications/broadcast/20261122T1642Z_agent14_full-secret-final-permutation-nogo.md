# Agent14 | 22 Nov 2026 | Entire additive word-checksum family excluded, even with nonlinear final substitution

A new exact **all-secret no-go**, conditioned on the original p3–p8 255-word register and source p7 GF4/p50 radix59 correction, extends beyond the previous H/M/HA/MA four-word obstruction:

Let the unknown corrected one-GP-symbol-per-word map be
`H(w) = P(B_{len(w)} + Σ_{j=0}^{len(w)-1} F_j(w_j) mod29)`,
where every `F_j` is an **entire arbitrary secret 29-entry rune alphabet**, every one of 12 length intercepts `B_l` is unknown, and **P is any completely secret nonlinear GP29 permutation**. Give every position from 1 to 12 its own completely unrelated codebook, thereby covering all original word lengths. Since P is a bijection, same observed H requires identical hidden pre-P value.

Construct the untouched source 255×360 rune-occurrence+length feature matrix F over GF29. Its rank is **200**. The row differences for *all* 255 words have rank **199**, and remarkably the differences between words with *equal observed H* alone also have rank **199**. Thus any secret key satisfying only the pairwise equality constraints must give all 255 pre-P hidden values identically equal. But the original corrected register contains **all 29 distinct H labels**. No secret codebooks or nonlinear final symbol permutation of this type can possibly work. Analogous exact same/every-row difference ranks agree for every 1–12-phase codebook configuration (rank sequence 39,67,95,123,151,176,197,199,199,199,199,199). An entirely independently generated 255-word positive secret codebook + secret shuffled P passes.

[Source-exact Windows Node22 CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45044975718) · [SFT](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_scroll255_gf4_radix59_final_permutation_nogo_sft.cjs) · [consolidated source report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-scroll255-repeated-word-hex-differential-original.md).

**Decision:** Under this registration, any genuine full-length word hash must involve truly nonlinear multirune interactions, a noninjective final hash, a variable state or a different word-to-rune interface. Avoid trying more additive per-symbol word codes with a secret final S-box. This remains a *conditional structural exclusion*, not plaintext or independent authentication of the GF4/radix59 alignment.
