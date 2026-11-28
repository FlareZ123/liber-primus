# Exact minimum hidden-event count and iid refractory-channel exclusion

Agent 3, 28 November 2026. This is a new restriction on the two live hidden-output models in [Round48](lp2-round48-alternative-erasure-channel-keyed-inverses.md), not a recovered plaintext. Motivation: determine whether extending immediate-repeat rejection to longer memory could repair the existing models' missing higher-order structure, before fitting more keys.

## Exact support, regardless of key

Let the visible rune sequence be x[0..n-1]. A refractory-k sender forbids repeating any of the previous k accepted symbols. The earliest legal accepted-event index for each visible rune is

t[0]=0; t[i]=max(t[i-1]+1, t[j]+k+1), where j is the previous visible occurrence of x[i] (omit the second term if none).

The lower bound follows by induction since both predecessors precede i and every feasible timing must obey both inequalities. The resulting total t[n-1]+1-n is therefore the minimum number of hidden events needed to satisfy all visible equality constraints. Every generated gap contains at most k hidden events. The witness is exact for the seven-silent-symbol alphabet when k<=7: fill all hidden slots globally in cyclic order 29..35. Repeated silent labels have at least seven intervening events: their accepted-event distance is at least eight because no gap exceeds seven. Visible equalities already obey the recurrence. For GP29 deletion and k<=14, precolor every visible slot, then greedily color every hidden slot avoiding all already colored positions within distance k on both sides. At most 2k<=28 labels are forbidden, so this always succeeds and the resulting complete string obeys the refractory condition. This is an event-level witness only, not a key/plaintext witness.

For seven silent symbols and k>=8, even one consecutive visible doublet is impossible: it requires at least k hidden accepted events between copies of the same visible rune, but within those first eight hidden events a silent label repeats. This is independent of key bias, rate, and cipher alphabet order.

Original source: resources/liber-primus/lp2-corpus.json, Git blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. Physical unknown pages 0–55, skipping runeless p50; 12,956 visible runes and 86 adjacent doublets (including zero across physical page joins). Independent page resets are allowed in the second column of counts.

| k | Min hidden, continuous | Min hidden, page resets |
|---:|---:|---:|
|1|86|86|
|2|601|595|
|3|1490|1474|
|4|2684|2654|
|5|4108|4061|
|6|5665|5599|
|7|7332|7246|
|8|9059|8952|
|9|10821|10694|
|10|12603|12455|
|11|14392|14224|
|12|16187|15998|
|13|17987|17777|
|14|19789|19558|

For k>=8 the displayed values apply to GP29 deletion or to unconstrained-label timing; the seven-silent alphabet has no witness. No assumption about word segmentation is used. The implementation constructs and checks the complete witnesses for each applicable k and each page independently.

## Uniform-key exclusion, including dependent histories

Under iid uniform proposals and rejection of the last k accepted symbols, every allowed accepted label is uniform among the available alphabet. Conditional on any complete history ending at visible a, for the next visible symbol to equal a there must be at least k intervening hidden events.

For the mod36 model, the probability of the first k subsequent emissions all being silent is at most product_{j=0}^{k-1} (7-j)/(36-k), since every new silent label stays forbidden during these k events. After those k emissions all remembered labels are silent, hence the first subsequent visible label is uniform across all 29 visible labels by symmetry. Thus the conditional doublet probability is bounded by

p_s(k) <= (7)_k / [29 (36-k)^k].

For GP29 independent post-filter deletion with fixed deletion probability d=7/36, the number of deleted emissions before the next retained emission is geometric. At least k deletions are necessary, and conditional on any such count the final accepted rune is a with probability at most 1/(29-k). Hence

p_d(k) <= d^k/(29-k).

These conditional bounds hold given the entire past including hidden states; independence of the visible doublet indicators is unnecessary. For m transitions and observed R>mp, the iterated conditional MGF bound yields Pr(count>=R) <= exp[-m D(R/m || p)], with Bernoulli relative entropy D. For the 86 observed doublets out of 12,955 transitions:

| k | mod36 probability cap | log10 tail cap | deletion probability cap | log10 tail cap |
|---:|---:|---:|---:|---:|
|1|0.00689655|0|0.00694444|0|
|2|0.00125283|-32.06|0.00140032|-28.73|
|3|0.00020150|-94.43|0.00028276|-82.23|
|4|0.00002762|-167.68|0.00005718|-140.67|
|5|0.00000304|-250.02|0.00001158|-200.05|
|6|2.384e-7|-345.03|2.350e-6|-259.58|
|7|1.008e-8|-463.19|4.777e-7|-319.07|

The deletion bound decreases through k=14. The seven-silent model at k>=8 is structurally impossible. Page resets (12,901 transitions) strengthen k=2 tail caps to -32.19 and -28.85 respectively. This excludes the iid-uniform extension with memory >=2 in the stated ranges, without fitting any parameters to ciphertext. It does not exclude nonuniform/key-correlated emission, variable reset rules within pages, a larger hidden alphabet, or a different deletion rate. Under d=7/36, longer memory cannot be invoked as a free fix for the homogeneous model's observed doublet-gap correlation. The original memory-one model remains open.

Reproduction: `node scripts/lp2-hidden-refractory-minimum.js`. Core executed directly in connected V8 using the pinned corpus, including witness assertions; no separate Node process or CI run. There is no recovered key or unknown plaintext.
