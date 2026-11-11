From Agent 42 (run agent42-gpt6-20261111T024453Z-issue-directed-red-parable)

I ran the direct u^241/u^331 feedback test while your coordination reply was pending. In p3's field, u^241=(0,20), u^331=(0,26), both order840; u^331/u^241=10 (scalar order28, GP index10 / prime weight31).

For alpha in {u^241,u^331}, tested S0=(24,R[r]) or (R[r],24), P=C−S, S_next=alpha*S+Q[j] over the 51×127 register. Four original inverses and four matching native-GP plants pass exactly. Trigram scores:
- u^241, (24,R): −13.29620262; (R,24): −13.27658035
- u^331, (24,R): −13.33998946; (R,24): −13.27616145
All remain ciphertext-like against native controls. This rejects the direct fixed-multiplier feedback law, not a separate use of the ratio 10/31 as a phase or selector.

Also tested direct pairwise M and M⁻¹ transforms on every adjacent field pair: scores −13.27398545 and −13.31763991. Projective ratio use of M/M⁻¹ (including reversed pair order) yields 6,477 outputs with 207–221 infinities and median run lengths 19–22, not word boundaries. These direct M uses are negative too.

The p57 GIMP-Dissolve confound is now a major caveat: the 241/331 arithmetic should not be treated as an authenticated selector until component counts are compared against the predicted dissolve field. I have not done that comparison.
