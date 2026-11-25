# Sparse cyclic GF29 filter: exact shared-key chapter attack

Agent9, 2026-11-25; Director [#2816](https://github.com/FlareZ123/liber-primus/issues/2816).

Freeze P_i = C_i + a C_(i-k) + b C_(i+k) modulo 29, indices circular within each complete chapter; k in {8,13}, a,b in GF29. This is exploratory; visual rubric lengths suggest k but do not establish a cyclic filter. Unlike #2466 (continuous raster27 left/above/above-left), #2484 (independent key-increment convolution), or disjoint Hill maps, this acts on both sides of every ciphertext rune and wraps chapter endpoints. No printed word-boundary assumption.

## Exact inverse and key space
The step-k permutation gives d=gcd(n,k) cycles of m=n/d symbols. If b≠0, move along each cycle using C_(j+1)=b^-1(P_j−C_j−a C_(j−1)). Propagate homogeneous basis states to obtain the 2×2 monodromy M, and solve (I−M)s=t for the forced periodic initial state. Its determinant being nonzero is necessary and sufficient for invertibility (equivalent to polynomial coprimality). If b=0, use C_j=P_j−a C_(j−1), with scalar boundary denominator 1−(−a)^m. Every accepted output is re-encoded exactly. Across 1681 distinct candidates (identity counted once), 1621 are invertible at 729 symbols, 1051 at 308, and 1049 at both. Restrict to the shared-length set before fitting.

## Calibration before original fitting
Fixed add-one-smoothed native GP trigram likelihood, trained on 1264 runes from WARNING, WELCOME, WISDOM and two non-target LP1 sections; KOAN1 and LOSS excluded entirely from training. Four planted cases use independent seeded keys and both original chapter lengths, then exact full finite-key fitting without access to planted key. All four recover their true key rank 1 and all 2074/2074 runes. Uniform independent GP29 pad controls are fitted with the same key set. Native scores −2.8074 to −3.1345; best pad fits −3.3486 to −3.3672. These four cases support receiver identifiability, not a universal guarantee.

## Original prediction
Fit complete p0–2 (729 runes), freeze k=8,a=7,b=6. Unique top score −3.3583848963 nats/rune, runner-up −3.3636020459. The winning score is within the matched-pad range and below all four true planted scores. Apply unchanged to untouched p54–55 (308 runes): score −3.3820905687, no connected prose. Both outputs re-encode all 1037 original runes exactly, as expected for an invertible but wrong model. Raw identity scores −3.3847801106/−3.3920628277. All fit-candidate scores and complete frozen outputs preserved. No holdout re-fitting, extra lag, or parameter expansion.

Retire the fixed shared sparse cyclic family as a calibrated language-recovery branch. This is a bounded statistical/model rejection, not a mathematical impossibility for arbitrary plaintext or cross-rune filters. No new plaintext or key.

[SFT](../sims/lp2_sparse_cyclic_filter_sft.cjs) · [Executed results](lp2-sparse-cyclic-filter-output.json). Executed in connected V8, no separate Node CI run.