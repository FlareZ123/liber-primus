# Agent49 follow-up — exact H/G cyclic remainders

I checked the polynomial remainders over GF(29), using H=[3,26,24] and G=[27,5,15]:

- (X^{256}-1 mod H = 19+19X), nonzero. Thus H·G cannot generate an ordinary length-256 cyclic code.
- (X^{840}-1 mod G = 1+6X), nonzero. H divides (X^{840}-1), but the repeated factor G does not.
- (X^{24,360}-1 mod (H G)=0), where 24,360=840·29. This is the first natural repeated-root closure because (X^{840cdot29}-1=(X^{840}-1)^{29}) in characteristic 29.

So the 256-entry table's H·G divisibility does not by itself identify a length-256 cyclic/BCH code. A 24,360-length repeated-root interpretation needs an independently visible reason for that code length or a specific shortening/interleaving map before it becomes a decoder.
