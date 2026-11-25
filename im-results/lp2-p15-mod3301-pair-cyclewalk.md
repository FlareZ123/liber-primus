# LP2 p15 spiral as a 3301 paired-rune modular cycle-walk: original inverse and exact all-key envelope

**Decision — Agent8, 25 November 2026.** Neither the literal spiral key nor a blind receiver for an arbitrary repeated sixteen-multiplier key produces readable original p16–22 plaintext. More strongly, an exact all-key within-pair log-likelihood maximum is below every equal-length window in two independent native-GP-normalized literary controls. Retire this precise pair-packing and periodic modular-cycle-walk receiver; the established p15 number-grid mechanism is unchanged. No unknown plaintext or authenticated key was recovered.

## Source premise and fixed receiver

The original p15 scan (archive 32.jpg) has the red 3299 origin of the independently established sixteen-cell Fibonacci-indexed-prime spiral. Its printed spiral order is `3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516`, reconstructed exactly by `abs(3301 - prime(F+1))`. See [the established graphic solution](../results/lp2-p15-fibonacci-prime-spiral.md). The source supplies the prime 3301 and the sixteen quantities. Earlier authenticated Cicada modular arithmetic and BASE29 motivate a typed experiment with two-rune positional integers. The pairing, multiplication, first-return cycle-walk and next-page start are our explicit hypotheses, not historical instructions. The ordinary numeric clue and historical additive prime-shift cipher are competing explanations. This receiver differs from the previous p15 additive/F-hold and four-rune Hill/spiral receivers.

Pack each adjacent two-rune block in canonical GP0 order as x=29a+b (0≤x≤840), the 841-element subset D of GF(3301). For each nonzero multiplier k, apply x→kx mod3301 repeatedly until the output next belongs to D, including at least one multiplication. This first-return map is a permutation of D, and the inverse is the first-return map for k⁻¹. In particular x=0 is fixed. The sixteen printed magnitudes select the successive multipliers modulo3301, repeated continuously from physical p16 rune0. No F exception, key offset, direction swap, page reset or hidden state is introduced. The exact 1,744-rune physical p16–22 source tape has 872 pairs; p16–20 supply 670 fit pairs and p21–22 supply 202 untouched continuation pairs. No separator or word-order assumptions are used.

The implementation enumerates all 3,300 nonzero multipliers and checks every one of the 841 pair values: all **2,775,300** inverse compositions pass. The authentic p56 prime-minus-one/F-hold decode (84 consuming keys, transparent F at offset56) and clear p57 yield a separate 180-rune native control; applying the experimental cipher and inverse recovers all180. This is an implementation check, not historical evidence for cycle-walking.

## Direct inversion

| Metric | Original ciphertext | Fixed spiral inverse | Frozen blind inverse |
|---|---:|---:|---:|
| Full-tape adjacent equalities | 10 | 58 | — |
| Full-tape IoC | .03450960 | .03461882 | — |
| Fit mean trigram log likelihood | — | −3.855062 | −3.655043 |
| Continuation mean trigram log likelihood | — | −3.945330 | −3.827297 |

The fixed inverse starts `OESEAUXEOCRFRLTHOEFTHDEAOWGOCYYSOEAEFMGNGNGHXEOAECNICDMRJNGNXUYWUSMNGPFGTMWSEABT`. The blind inverse begins `DHUOENMOYTIEAINWNGCOEOAENGLFSEATHCEAPFNULNGMAEXYAETLRJCPEORPEAEPCSUSHSSCNGYAWNXCBEAROIINYOUHXB`. Its independently frozen continuation remains incoherent. Both inverse candidates re-encrypt all original 1,744 runes exactly, as every key in this bijective family must.

## Constructive blind recovery and held-out original decision

Train a smoothed GP29 pair/trigram model from 66,147 runes: editor-normalized LP1 plaintext before page56, plus pinned Gibran. Normalize Latin spelling K→C, V→U, Q→C, Z→S and greedily tokenize authentic GP multigraphs within words. This is a declared finite literary reference, not a claim about LP2's unknown language.

The learner receives no hidden multiplier. For each of sixteen pair phases it enumerates all 3,300 inverse multipliers and ranks them by the in-pair log likelihood of the first1,340 runes. Freeze the top32 per phase. Trigram transitions span two adjacent blocks, permitting an exact max-sum cyclic dynamic program over that shortlist with the first pair likelihood included. Freeze the selected key before reading/scoring the 404-rune continuation. The three independently keyed 1,744-rune controls use Emerson offsets10,000 and40,000 and Shakespeare offset20,000 in the normalized rune streams, with the declared xorshift32 seed 0x29163301. The true key was rank1 in every one of the 48 phase domains and the joint search recovered all48 hidden multipliers, with **1,212/1,212 withheld plaintext runes** exactly. Their withheld mean trigram log likelihoods are −2.537869, −2.485754, −2.474937; all passed the prespecified ≥95% continuation accuracy gate. The original fit/holdout outcome is substantially worse than those controls, so it is a calibrated negative, not an optimizer failure on the tested native plants.

## Exact all-key pair-score envelope

The original negative does not depend on the top32 shortlist or trigram optimization. Let L(x)=log of the smoothed training probability of GP pair x and Tₖ be the first-return map above. For original pairs cⱼ and shared period16, the exact independent-phase optimum is

`B = (1/n) * sum_r max_{k=1..3300} sum_{j≡r (mod16)} L(T_k(c_j)).`

The inverse multipliers range over all nonzero field elements. This is the actual global maximum for the pair-only objective: each phase may independently choose any multiplier, so the maxima are simultaneously achievable. There is no language beam, key shortlist, plaintext crib or group framing restriction in this bound. For the continuation calculation even the fit key is discarded and all16 phases can choose new multipliers specifically for the held tape, making the held bound more permissive.

| Original range | Maximum over all 3300^16 keys, nats/pair | Minimum Emerson equal-length window | Minimum Shakespeare equal-length window |
|---|---:|---:|---:|
| p16–22 (1744 runes) | −7.691579 | −5.742439 (322,887 windows) | −5.917363 (217,057 windows) |
| p16–20 (1340 runes) | −7.533710 | −5.777820 (323,291) | −5.945755 (217,461) |
| p21–22 (404 runes) | −6.557529 | −5.930178 (324,227) | −6.189763 (218,397) |

Both possible window pair alignments are included; each possible contiguous start is evaluated once. All phase-wise maximizing multipliers and exact scores are saved in the machine-readable output. The strict gaps, including the short held-out range, exclude every sixteen-period multiplier key relative to these particular normalized contiguous literary controls under the stated pair score. They are not a theorem about all possible English, shuffled pairs, alternative register, different block width/packing, period, additive offset, or a genuinely source-selected alternative cipher. No original key is identifiable from the fit.

## Reproduction and next decision

- [Single-file CommonJS implementation](../sims/lp2_p15_mod3301_pair_cyclewalk_sft.cjs) uses the pinned corpus and four reference text inputs. Run from the repository root.
- [Machine-readable output](lp2-p15-mod3301-pair-cyclewalk-output.json) includes source blob SHAs, full fixed/blind original decodes, hidden-key control results and all-key bounds. Both experiment functions executed in the connected JavaScript runtime; the generated standalone Node wrapper was not separately executed in CI.
- The 16 printed numbers remain a genuine graphic solution. There is no authentic instruction for this pair receiver, and the stronger exact failure removes any justification for extending it with postfit offsets, alternative radix or unconstrained key sweeps. Reopen only if independent source evidence fixes a materially different typed operation.
