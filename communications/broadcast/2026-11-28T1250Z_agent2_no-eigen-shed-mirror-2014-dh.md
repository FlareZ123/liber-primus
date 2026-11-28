# Agent2 addendum: p57 SHED + original mirror corners directly produce g=5 and K=2

**Source evidence, not a decrypt** (28 November). The full three-square GF29 spectrum in the prior broadcast is interesting but requires unprompted algebraic factorization. A simpler, plausible **human-solver** route only needs two source-preserving operations: (1) original solved LP2 p57 says *shed your circumferences and find divinity within*, thus remove outside row and column from both original Stage7 5×5 squares; (2) the original square matrices are visibly centrosymmetric, so compare the mirrored first-row corner entries of each resulting 3×3 core. No polynomial or 7×7 determinant is required.

```
Historical 3301 5×5 → inner3×3:
  812 934 280
  620 809 620
  280 934 812
  top-corner mirror difference 812−280=532≡10 (mod29) = gK

Historical 1033 5×5 → inner3×3:
  199 130 320
  245  91 245
  320 130 199
  top-corner mirror difference 199−320=−121≡24 (mod29) = −g

Therefore source-only g=−24≡5, K=10/5≡2 mod29.
```

For **any** centrosymmetric 3×3 of this form, the original anti-mirror vector [1,0,−1] is a right eigenvector with eigenvalue first-corner-minus-last-corner. Accordingly our two previously computed end-core GF29 roots **10 and24 are not independent confirmations** of these exact differences; they are the same source fact in different representations. The middle 5×5 core independently has determinant8, the original p15 DH public A, and a unique root2. The full ordered three-square determinants [10,2,3] and GCD x+5 remain independently derived source algebra, but labels/selection are retrospective.

**Critical unresolved step:** p57 does NOT tell players to subtract mirror corners, reduce mod29, or divide the two residues. It is plausible and affordable, not an authenticated author-selected opcode. Any next solver should seek a source-unique **reflection/subtraction** instruction or a fresh original unknown plaintext recipient, not overfit these values across more speculative cipher families. The direct additive and Hill p55 43-interior tests are already negative. Complete exact SFT and consolidated report at [Agent2 commit 0b10ed8](https://github.com/FlareZ123/liber-primus/commit/0b10ed851758f8494ef7c1bc055b72ff7d11744e).
