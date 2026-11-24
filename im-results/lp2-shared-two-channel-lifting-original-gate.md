# Shared two-channel cross-pair inverse: predecessor-lane feedback bound

**Director #2470 decision (Agent14, 24 November 2026):** The fixed two-coefficient lifting architecture recovers every independently held-out solved-native plant but fails original LP2 training-to-holdout. A stronger exact combinatorial obstruction covers **every arbitrary GP29 predecessor-lane feedback table, followed by every stationary reversible 841-symbol pair substitution**, even with an unknown initial state, on the intact p33–39 chapter. No unknown plaintext or authentic key recovered.

[Read-only CJS reproduction](../sims/lp2_shared_two_channel_lifting_sft.cjs) (algorithm executed using JavaScript on the pinned repository input files during this invocation; standalone Node runner supplied).

## One reversible two-channel model

Original cuneiform two-row numerical material and the 1,680-rune (840-pair) p33–39 chapter motivate a paired register; the authentic 2014 squares make field mixing historically plausible. Neither artifact selects the lifting coefficients or establishes this algorithm. The rival remains evolving state or a different source alignment. The [static Hill2/pair-substitution theorem](lp2-p33-39-allsecret-affine-hill2-original-bound.md) excludes maps of each pair alone; the [three-row floral projection](lp2-floral203-blind-3sparse-gf29-projection-native-exclusion.md) addresses a different register, and the [256-tap convolution](lp2-fullgrid256-causal-convolution-original-gate.md) uses fixed source table coefficients. Here each pair incorporates its preceding *ciphertext* second lane.

Write plaintext pairs (u_i,v_i) and ciphertext pairs (x_i,y_i). With a,b in GF29, define the encoder and inverse:
 
- x_i = u_i + a y_(i-1); y_i = v_i + b u_i.
- u_i = x_i - a y_(i-1); v_i = y_i - b u_i.

All arithmetic mod29. Set y_(-1)=0 at book start; maintain the register across printed page and word boundaries. A terminal singleton uses only the first equation, so no padding/fringe is invented. All 841 keys are reversible.

The original training chapter is the first 729 runes (physical pp0–2); holdout is physical pp33–39, global offsets [7960,9640). The source transcription and canonical corpus were asserted exactly equal on all 12,956 unknown runes and 2,896 complete printed words. Lexical score is the proportion of rune positions in complete printed words of length >=3 that match a frozen 6,900-type lexicon from Gibran, Shakespeare and solved native GP sections. Latin donor spelling uses the existing native GP normalization (ING and IO first; QU→CW, V→U, K/Q→C, Z→S), not a claim that the donors were authored in runes. Training excludes every word of the held-out native source section in each plant, except types independently present in other sources; the recovery function gets ciphertext, word spans and dictionary, never the planted parameters. Ties are counted, not broken by a known key. Each plant learns on its first half and predicts the second with unchanged parameters.

| Native solved section | Runes per plant | Keys recovered | Training coverage | Untouched second-half coverage |
|---|---:|---:|---:|---:|
| WELCOME | 515 | 2/2 | 78.38% | 87.29% |
| KOAN 1 | 780 | 2/2 | 95.81% | 80.17% |
| LOSS OF DIVINITY | 755 | 2/2 | 83.02% | 73.93% |
| jpg107–167 | 319 | 2/2 | 84.17% | 85.38% |

Eight unique winning keys, all **4,738/4,738** planted runes recovered (two keys per source). The pinned external KOAN1 donor has 780 runes; a subsequent exact original-cipher audit found that its two WHAT/WHO variants differ from the actual 778-rune source, so these are exact external-native plants, not literal 780-rune original-Cicada plaintext controls. This does not alter key recovery or the original obstruction. [Source correction](lp1-widsom-error-history-original-gate.md). On real original pp0–2 the unique best lexical key is (22,16), **18/668** scored runes across five of 125 eligible words (2.695%). Applied unchanged to held-out pp33–39 it gives **0/1,547** scored runes across 307 eligible words (0%). No connected original prose. All 12,956 original runes re-encrypt exactly; this is a property of every key and does not validate the selected key.

## Stronger mathematical decision: arbitrary feedback + unrestricted pair bijection

Generalize the first inverse shear to an **arbitrary** secret table f:GF29→GF29:
 
    T_i = (x_i - f(y_(i-1)), y_i).
    P_i = pi(T_i).
 
Here pi is ANY stationary bijection of all 841 GP29 pairs. This family has at most 29^29 × 841! keys (gauge redundancy allowed); the explicit two-coefficient model is a subfamily. It includes nonlinear predecessor-lane feedback and arbitrary fixed nonlinear postmixing. It does not include feedback depending on both prior ciphertext runes, plaintext state, multiple changing pair alphabets, or reordering/segmentation.

Let H_r(x,y) count pairs observed with prior ciphertext second lane r. The pair-collision count Q(P)=sum_z choose(count(P=z),2) equals Q(T), since pi is bijective. For pairs in the same context r, shifting all first coordinates by f(r) leaves collisions invariant. For different contexts r,s, their contribution depends only on one relative shift d, with cross-correlation
 
    C_rs(d) = sum_(x,y) H_r(x,y) H_s(x+d mod29,y).
 
Therefore every f and pi satisfies
 
    Q(P) <= sum_(r,x,y) choose(H_r(x,y),2)
            + sum_(r<s) max_(d=0..28) C_rs(d).
 
The RHS deliberately grants each context pair an independent best shift; real f must also satisfy simultaneous cycle consistency, so this is an upper bound, not a claim of attainable optimum. It requires only integer histogram arithmetic, no language model and no secret key search.

On the exact p33–39 register (840 pairs), the actual continuous predecessor y is 12. The invariant same-context component is **11**, cross-context relaxed maximum **1,394**, hence Q <= **1,405**. Chapter-reset IV=0 gives the same bound. Over **all 29 possible IVs** the maximum is **1,409** (IV9). For the special linear first shear, all 29 coefficients have original Q <=461. Compare the native-GP reference windows under the identical 840-pair framing, stepped by 211 rune positions:

| Register | Windows | Minimum Q |
|---|---:|---:|
| Original, any f and pi and IV | All secrets | **Upper bound 1,409** |
| Gibran | 289 | 2,025 |
| Shakespeare | 1,021 | 1,687 |

All 1,310 finite, partly overlapping ordinary-GP reference windows exceed the all-secret upper bound by at least278 pair collisions. This is a deterministic incompatibility with these specific reference windows, not a p-value or a universal theorem about English.

For sensitivity, a separate planted native control uses a deterministic independently shuffled 841-entry pair permutation and nonlinear 29-entry feedback table (seed 0x33012470), unknown IV17. Gibran and Shakespeare plants recover **1,680/1,680** each. Their ciphertext Q is697 and826; correct removal of feedback gives native Q2225 and2301. The relaxed all-key bounds admit these true native counts (3014 and3291), demonstrating that the obstruction does not erroneously reject its own genuinely nonlinear transport.

## Research decision

Retire this specific shared feedback + stationary pair-substitution architecture as a direct route to ordinary GP-native LP2 prose. No original key, source-selected lifting law or plaintext was found. The exact finite collision obstruction is stronger than the failed language fit, and does not justify escalating to more secret tables of the same kind. A genuinely source-selected operation whose state depends on more than the preceding second lane, or a different reversible framing, remains outside scope.
