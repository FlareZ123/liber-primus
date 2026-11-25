# Critic — Q4 adjacency is not a key-clock identification

**Decision:** preserve the Round45 W1 length-order result and the observed suppression across printed separators. Retract the inference that printed spaces cannot reset the cipher/key clock. The separate key schedule, output constraint, reading direction, and plaintext segmentation are not identified by this statistic. No original plaintext or authentic key follows; no new cipher sweep is warranted.

## What the pinned source actually computes

[Dukotah W1 results](https://github.com/Dukotah/cicada3301/blob/0335ecf3f0d47c0dc6ecd953bcc729bce6ccad46/liber-primus/analysis/round45/W1-spaces/RESULTS.md) and [Q3/Q4 implementation](https://github.com/Dukotah/cicada3301/blob/0335ecf3f0d47c0dc6ecd953bcc729bce6ccad46/liber-primus/analysis/round45/W1-spaces/q3q4_leak_order.py) report 23/2895 across-group and 63/10060 within-group equalities. Q4 assumes a mixture r_cross = (1-q)*r_in + q/29; qhat = 0.0596133. Its Wilson interval is applied to r_cross while treating the observed r_in as a known constant. Thus the reported ~0.20 upper bound is a model-conditional plug-in result, not an assumption-free statement about the fraction of true historical adjacencies.

As an illustrative calculation under binomial sampling within each class, simultaneously bounding the two unknown rates with one-sided exact 97.5% Clopper–Pearson bounds gives r_cross <= 0.0118972857, r_in >= 0.00481547658, hence q <= 0.238707716 by Bonferroni. Reproduce with scipy.stats.beta.ppf(.975,24,2872), beta.ppf(.025,63,9998), and (upper-lower)/(1/29-lower). The manuscript's event clustering makes binomial coverage itself an assumption; neither number is a distribution-free bound.

## Constructive nonidentifiability

1. Generate uniform masked candidate symbols with independent word-local pads (or independent word-local random streams); reset the key index to zero at every group. Apply a global adjacent-symbol suppression rule with a soft acceptance probability for repeats. The candidate stream remains iid uniform for any fixed plaintext; the output transition law is identical to using a single continuous iid pad with the same output rule. Hence even the entire distribution of output runes cannot distinguish these key-reset and continuous-key constructions without a constraint on pad provenance or generator family. This is a counterexample, not a claim Cicada used independent random pads.
2. A homogeneous symmetric adjacent-symbol transition matrix with uniform initial distribution is reversible. Reversing the whole tape preserves all undirected lag equality counts exactly; if the separator tape is also reversed, all matched boundary equality counts are preserved. Q4 does not establish a directed cipher clock.
3. If rewired pairs are not independent uniform, or the residual rate varies with boundary class, the mixture formula is not identified. This does not negate evidence for suppression of adjacent equalities in print; it limits causal attribution to a particular filter or historical adjacency graph.

## Research consequence

Keep scoped word-reset exclusions (including shared-prefix lexical gates) as independent evidence; neither reopen them indiscriminately nor use Q4 as an extra proof against them. For a motivated layered model, distinguish a key/PRNG reset from a reset of the preceding-output state. A spacing-free algorithm is robust to changed separators alone, but a word permutation can still affect its plaintext model and validation. The independent #2670 result already shows the measured word-length feature cannot distinguish shuffled genuine words from an exchangeable decoy-length multiset. Do not spend CI repeating that result.

The corrective decision is to evaluate source-selected key provenance and reset/constraint ordering independently, rather than treating a marginal doublet count as a clock selector. No new CI, no new task assignment, and no revision to the established unknown-page count.
