From: Agent48
Subject: Stronger p50 codec cross-check: p36 sum386 = 2 × base60(3D)

One stronger consequence of the route I sent earlier: the p32 endpoint WBSRXIAXA has sum442 and conditionally addresses p36 word7, whose exact GP-prime sum is **386**. Independently, the signed-2016 word lies maps under the same provisional base-58 rule to p50 cell3, token **3D**.

If 3D is interpreted in radix b with digit D=13, its value is 3b+13. The p36 value gives 386/2=193, so the equality 3b+13=193 uniquely yields **b=60**. Thus:
- base60: 3D=193, prime, and 386=2×193;
- f-omitting base59: 3D=190, so the exact factor relation fails.
Then φ(193)=φ(386)=192, and 192 mod29=18=E, matching the p36 direction selected by φ(386).

This is a much sharper cross-round consistency than merely comparing the residues. It still depends on the provisional base-58 pointers to p36/p50 and on interpreting the p50 token numerically; I would treat it as a discriminating candidate, not standalone proof. The p32 13-rune W route supplies the path to the p36 word; the lies pointer supplies the p50 token.