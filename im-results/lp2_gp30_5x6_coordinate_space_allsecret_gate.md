# GP30 5×6 secret coordinate interleaving: exact original SPACE-capacity gate

**Agent7, 18 November 2026. Conditional all-key exclusion of one genuinely different reversible cipher family. No unknown LP2 plaintext, key, or destination recovered.**

## Source hypothesis and independent rival

The manuscript uses 29 Gematria Primus runes; treating a true word break as a thirtieth token permits a rectangular **5×6** alphabet. The original five-dot mark and the p2 six-limbed illustration might suggest dimensions, but there is **no authenticated author instruction** relating those graphics to this operation, word-boundary encryption, key layout or step size. A strong independent rival is a genuinely nonperiodic keying/padding channel, or a value-mixing cipher using only 29 GP runes while leaving printed boundaries external.

A fixed invertible coordinate model is worth a bounded test because the earlier [variable-boundary SPACE-code result](lp2-variableboundary-spacecode-capacity-gate.md) explicitly leaves 5×6 coordinate mixing outside its codeword theorem. Each plaintext token occupies a cell \((r_i,c_i)\) of a secret **five-row, six-column permutation** of GP29+SPACE. For \(s\in\{5,6\}\), transmit \(C_i=(r_i,c_{i+s})\) on a cyclic interval (or with an independently supplied boundary state). The inverse is \(P_i=(\operatorname{row}(C_i),\operatorname{col}(C_{i-s}))\). Both temporal orientations and **any secret cell assignment** are covered; even independent secret ciphertext and plaintext label permutations are granted. Original printed breaks are interpreted as the output SPACE token, while the recovered plaintext may have entirely different word breaks. This is a precisely specified reversible family, not an identified historical cipher.

## Exact all-secret theorem

For a source stream \(C\) of \(N\) tokens define the 30×30 count matrix \(T_{ab}=\#\{i:s\le i<N,\ C_i=a,\ C_{i-s}=b\}\). For the inverse to yield plaintext SPACE at position \(i\), the observed current ciphertext token must belong to some complete secret row \(R\) containing six symbols and the lagged ciphertext token to some complete secret column \(K\) containing five symbols. A complete 5×6 bijective grid forces \(|R\cap K|=1\). Thus the **exact maximum recovered SPACE tokens after the first \(s\)** across *every possible secret grid* is

\[
M_s=\max_{\substack{|R|=6,\ |K|=5\\|R\cap K|=1}}\sum_{a\in R,\ b\in K}T_{ab}.
\]

Enumerate all \(\binom{30}{6}=593{,}775\) row sets. For a fixed row, sum its six matrix rows to obtain thirty column weights \(v_b\). The best valid column uses the highest \(v_b\) inside the row and the four largest \(v_b\) outside it. This computes \(M_s\) **without estimating or recovering a cipher key**. Reverse the time order in \(T\) to cover the other coordinate orientation. Permit each of the first \(s\) source tokens to recover as SPACE unconditionally, giving the conservative full-stream ceiling \((M_s+s)/N\).

**Source and parser:** the unchanged [canonical LP2 transcription](../resources/liber-primus/lp2-transcription.txt), with the actual [GP29 glyph order](../resources/liber-primus/lp2-corpus.json). Rune glyphs become GP29 indices 0…28; every printed \`-\` or \`.\` becomes separator29, coalescing adjacent separators, while line wraps and page markers are ignored. The source counts exactly **12,956 original p0–55 rune tokens plus 2,894 separator tokens**, 15,850 total. The rune-free physical p50 is skipped; all subsequent page references are shifted correctly because the 57-section text omits p50. A terminal printed period is treated generously as a separator; this convention is explicit and differs by one token from an exact natural-language word-boundary inventory.

## Original-cipher decisions

Each table maximum is the number of recovered SPACE tokens **after** the first \(s\) positions, already optimized over **all** secret 5×6 assignments. A separate secret grid per original visual chapter is allowed. Columns list forward lag5, forward lag6, backward lag5, backward lag6. The final column is the largest *generous* full-stream ceiling, granting the first five/six tokens all as SPACE.

| Original LP2 physical chapter | Source tokens | 5 forward | 6 forward | 5 reverse | 6 reverse | Greatest SPACE fraction with free start |
|---|---:|---:|---:|---:|---:|---:|
| p0–2 | 887 | 112 | 116 | 113 | 116 | 13.7542% |
| p3–7 | 1,400 | 185 | 171 | 185 | 171 | 13.5714% |
| p8–14 | 2,111 | 256 | 245 | 253 | 244 | 12.3638% |
| p15–22 | 2,339 | 284 | 276 | 285 | 276 | 12.3985% |
| p23–26 | 1,245 | 160 | 157 | 164 | 156 | 13.5743% |
| p27–32 | 1,759 | 216 | 212 | 218 | 211 | 12.6777% |
| p33–39 | 2,058 | 239 | 250 | 242 | 249 | 12.4393% |
| p40–53 | 3,677 | 431 | 406 | 430 | 409 | 11.8575% |
| p54–55 | 374 | 58 | 57 | 58 | 57 | 16.8449% |

For the single-grid, all-book model, the four exact maxima are **[1660, 1596, 1660, 1602]** on 15,850 output tokens, giving at most **10.5047%** full-stream SPACE after granting six free starts.

**Authentic reference registers:** clear original p57 has 95 GP runes and **19 internal word breaks**, SPACE density **19/114 = 16.6667%**. Known p56 plaintext has 85 GP runes and 24 breaks, 24/109 = 22.0183%. The actual hidden LP2 register is unknown; this is a necessary-condition test **conditional** on the unknown plaintext having at least the weaker p57 space frequency. The eight longer chapters cannot meet that reference under either operation/lag, even with secret grids per chapter. The short p54–55 chapter **is not excluded** with arbitrary initial symbols: its conservative ceiling 16.8449% slightly exceeds the weaker source benchmark. No page is claimed decoded; a text with much lower genuine SPACE density, changed token count, nonlinear state, nonbijective map, different clock or another alphabet is outside this theorem.

## Positive and next decision

The [single-file read-only Node.js 22 SFT](../sims/lp2_gp30_5x6_coordinate_space_allsecret_sft.cjs) verifies all 593,775 row sets for each original chapter, both lag orientations and widths, the exact source table, the whole-book bound and its attaining row/column witness. It additionally encrypts the **entire original clear p57's 95 runes plus 19 internal spaces** through a nonidentity secret 30-cell permutation with cyclic shift5/6 and verifies 114/114 exact recovery. This proves the decoder and source-control treatment work under the frozen model; it does not identify Cicada's actual key.

**Decision:** retire **fixed 5×6 row/column interleaving with five/six-token delay, independent per-chapter or one-book secret grids** as a direct producer of ordinary p57-density plaintext on the eight long unknown original chapters. Do not continue a 30! key search or reinterpret arbitrary low-space outputs as English under that model. A further attack must first supply an original, distinct source clue selecting a different reversible operation or a documented plaintext token register with unusually sparse spaces. This result does not settle all 5×6 ciphers.
