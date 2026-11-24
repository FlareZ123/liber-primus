# Period-8 consuming plaintext-difference inverse: #2617

**Decision:** Reject the q8 model on p54 under the intact-word frozen lexical register, and independently under native GP27 support plus the two native singleton anchors. No unknown plaintext or authentic key recovered. No p55 candidate is scored.

## Receiver and exact change of variables

For each consuming symbol, C = P - Pprev + K[j mod 8] (mod 29); plaintext F emits zero, holds Pprev and the consuming clock. Ciphertext zero can also arise from an ordinary consuming symbol. Pprev before the first symbol is unknown. There are eight independent key coordinates and one independent predecessor.

Let T_i be the cumulative physical ciphertext sum through i, S the sum of the eight key coordinates, and B_r = Pprev(initial) - sum(K_0,...,K_r). For consuming index j, P_i = T_i + B_(j mod 8) - floor(j/8) S. Holds contribute zero to T. The map is bijective: K_0 = S+B_7-B_0, K_r=B_(r-1)-B_r for r>0, Pprev(initial)=S+B_7, all mod29.

## Two independently useful exact prefix gates

Physical p54 has 232 runes, ciphertext zero at 41,65,195 (zero-based). It is the complete development interval; p55's 76 runes are withheld for key selection.

For each of 8 hold masks and 29 cycle sums, intersect the eight phase-offset domains separately. With all 28 nonzero active GP symbols this leaves 36,182,873,406 key/mask tuples in 232 combinations. With native GP27 (EO/OE absent, F held) it leaves 1,027 key/mask tuples in 18 combinations. Requiring the two intact singleton groups at offsets 0 and 122 to be A/I/O/T leaves **zero**. Counts are key/mask tuples, not necessarily distinct keys.

The more permissive lexical gate allows all GP29, builds the greedy normalized GP register from TextBlob, Gibran, Shakespeare, Emerson and Blake plus native sections, and uses complete printed groups of length >=8. For every equal-length candidate word, enumerate every possible number of preceding holds (0 through number of preceding ciphertext zeros) and all 29 S values. Infer all eight B offsets from the consuming positions; reject inconsistent repeated phases. This independently relaxes the clock at every anchor, so an actual global key must be present at every compatible anchor. All eight original anchors necessarily have >=8 consuming symbols: only offset60's 10-rune group contains a ciphertext zero.

| Offset | Length | Distinct anchored key tuples |
|---:|---:|---:|
|1|8|124120|
|9|8|124120|
|60|10|184|
|70|8|372360|
|86|8|372360|
|159|8|372360|
|176|8|372360|
|210|10|388|

The union has 1,738,252 distinct keys; **no key occurs at two anchors**. Every global key must therefore put at least seven of eight long groups outside the frozen lexical register (or abandon the intact boundaries/model). No full-prefix path search or p55 fitting is warranted.

## Recovery controls

Fresh hidden keys and predecessors on native WELCOME, LOSS and second-KOAN (jpg107-167), 232/76 split. Native target section excluded from lexical register. Generate key tuples only from the prefix anchors, require at least two anchors, enumerate all valid prefix paths including generated ciphertext F, rank by complete prefix lexical matches. Decode held-out ciphertext with fixed key and predecessor state, using lexical ranking only to resolve latent hold paths. All three recovered unique best true keys, initial predecessors and prefix plaintext, and all 228 withheld runes, implying exact forward replay under the generating receiver.

| Native control | Paired keys | Valid prefix paths | True best lexical matches | Holdout matches |
|---|---:|---:|---:|---:|
|WELCOME|18|300|56/57|76/76|
|LOSS|11|120|52/54|76/76|
|Second KOAN|3|4|65/65|76/76|

First KOAN was inapplicable: no full-phase anchor in its first 232 runes. The preliminary original alphabet gate was exploratory, not preregistered; the independent anchored recovery run executes controls before original key enumeration. Controls are native plaintext re-encryptions with fresh keys, not claims about historical ciphertext. These are conditional exclusions, not a universal impossibility for unrestricted plaintext or other clock models.

Reproducer: [SFT](../sims/lp2_q8_plaintext_difference_anchor_inverse_sft.cjs), code commit 17b9286d20ccd279181cb9084874ea52cfe61419. Executed connected JavaScript on actual repository inputs, no CI.
