# Original p28 and p33 share one cubic GF29 syndrome encoding a signed-2013 DH state

**Agent 2, 23 November 2026. Status: exact original-ciphertext arithmetic and provisional key-state interpretation; no unknown LP2 plaintext, authenticated manuscript operation, or final destination.** The proposed decoding of the residue as three cumulative DH numbers was discovered after examining the residue. Its historical operands are independently established, but the composition and receiver are conjectural.

## Original clue and the fixed polynomial

The original physical p39 (scan 56.jpg) brackets a three-rune red inscription at page-local offsets 119–121. Its GP29 indices are [27,5,15]. Reading its digits as ascending coefficients gives G(X)=27+5X+15X²=15(X−24)² modulo29. This red-root24 factor, its exact divisibility into original p29, and its factorization of the original p50 numeric grid are previous reproducible research.

The already recovered authenticated 2013 Cicada TCP-server DH23 exercise fixes p=23, generator g=5, server public A=8, client public B=19, and shared secret K=2; the small discrete logarithms uniquely recover exponents a=6 and b=15 on the documented example. The pre-existing p28 GP29 cube bridge derives e=3 by both g−K=3 and a/K=3 modulo29, an individually reversible x³ operation. Applying this source-constrained value as a *polynomial root* supplies one new monic-factor candidate X−3.

Therefore define the exact source-labeled, high-coefficient-first cubic

    Q(X) = G(X)(X−3) = 15X³ + 18X² + 12X + 6  (mod29)
    coefficient array [15,18,12,6].

The **weakest assumption** is that a scalar exponent from a prospective GP29 cube transform should also designate the added zero at X=3 for polynomial division. No recovered Cicada instruction explicitly selects this cross-register multiplication.

## Original untouched-page result and a complete source census

Treat every rune-bearing unknown physical page p0–55 as one GF29 polynomial, its first original GP29 rune the highest-degree coefficient. Long-division by the unchanged Q gives exact three-rune remainders:

| Original page | Total GP runes | Q quotient runes | Three-symbol remainder | Quotient GP29 IoC |
| --- | ---: | ---: | --- | ---: |
| p28, scan45.jpg | 269 | 266 | **[17,27,12]** | 0.033933891 |
| p33, scan50.jpg | 214 | 211 | **[17,27,12]** | 0.035025954 |
| p29, scan46.jpg | 277 | 274 | **[0,0,0]** | 0.033635464 |

Across **all 55 original rune-bearing unknown physical pages**, **p28 and p33 are the only distinct pages with the same three-symbol Q remainder**, and **p29 is the only Q-divisible page**. Every other page has a unique nonzero remainder. Full long division and polynomial reconstruction reproduce every original symbol exactly. The two p28/p33 pages already have an independently proposed content link: p33's source-conditioned “THEIR RISE” route joins p28's source-conditioned “THEIR NUMBERS ARE THE” → “DIRECTION” route. Those earlier English readouts are conditional, not independently verified original plaintext; their agreement supplies a reason to inspect these named pages, not proof that the cubic was intended.

The G-only Taylor jets at root24 on pp28 and33 are also *exactly identical*, P(24)=12 and P′(24)=2; p29 has [0,0]. Their equality is algebraically implied by shared Q remainder because Q has the factor (X−24)², so it is **not** additional independent evidence.

## Source-native reconstruction of the historical DH packet

Let the common original cubic remainder be R=[r0,r1,r2]=[17,27,12]. A concise **retrospectively noticed** triangular reading assigns

    Ka = r2                   = 12
    g  = (r0 − r2) mod29      = 5
    b  = (r1 − r2) mod29      = 15
    K  = P28′(24)            = 2
    a  = Ka / K mod29         = 6.

Using the **historically specified** modulus p=23 and actual DH operation then forces

    A = 5^6 mod23  = 8
    B = 5^15 mod23 = 19
    A^15 mod23 = B^6 mod23 = 2 = K.

Thus the full authenticated 2013 toy tuple [p,g,a,b,A,B,K] can be reconstructed exactly from the shared original page remainder and its root24 jet, with the single historically sourced modulus supplied from outside LP2. This is striking concordance but **not an independently source-selected bytecode/field-order convention**; simpler rival interpretations of R, or coincidence following extensive arithmetic research, remain live.

An independent exact original consequence is now visible on physical p29: it opens [2,23,6]=[K,p,a] and closes [5,18,12,6,8,19]=[g,H(A,B)[0],Ka,a,A,B], where the proposed p28 operation H(x,y)=(x−y,x+y) modulo29 gives H(A,B)[0]=18. More strongly, G division of p29's **first 275 original runes only**, setting its final two positions to zero, predicts the unique G-divisible terminal suffix **[8,19]**, exactly the historical DH public values [A,B]. Across all 55 original rune pages p29 alone predicts that particular terminal pair under G and also actually ends with it. This integrates the newly found cubic state with [the independently described p29 2|269|6 edge frame](lp2-p29-dhframe-p28-exact-inner-original-gate.md), whose intact 269-rune interior has exactly the p28 length.

## Cryptanalytic receiver gate and interpretation limits

Direct polynomial quotient does **not** reveal readable GP-native prose on pp28,29,33; each quotient's IoC is essentially 1/29. The independent positive control repeatedly encodes the 95 source-clear p57 GP runes to each original quotient length, appends the actual declared three-symbol remainder, multiplies by Q, and exactly recovers the entire planted native quotient and original remainder. All three original replays similarly reconstruct each page byte-for-byte. The separate elementary p28/p29 269-rune paired-page additive and cube transforms fail native-English readout under all 18 declared variants; see the linked receiver gate. These gates rule out those **direct** interpretations without excluding a real, independently keyed subsequent cipher stage.

No original manuscript page explicitly directs readers to interpret Q remainders as cumulative values or to execute this DH example on LP2. The p28/p33 association, cubic selection, selected residue interpretation and p29 outer packet are not statistically independent. An implausibly small **fixed-model** probability should not be presented as an authorial-discovery p-value after the large hypothesis search. The only justified promotion is a source-grounded **testable, exact algebraic key-state candidate**. It is not genuine unknown plaintext.

## Focused next step

If a first-party clue selects a *specific cipher consumption* of this recovered DH packet, freeze its target and forward/inverse before reading unknown output, and demand at least 100 contiguous original unknown runes of independently understandable prose with a distinct chapter control. In particular test whether the p29 original 2|269|6 packet dictates an operation consuming the 269-rune p28 field. Avoid fitting alternate field orders or arbitrary extra ciphers to the values already observed.

**Reproduction:** [read-only Windows Node.js 22 source SFT](../sims/lp2_p28_p33_p29_dh_cubic_syndrome_sft.cjs) reads original p28,p29,p33,p39 and all 55 source pages, tests unique exact remainder classes, authentic original GP29 arithmetic, historical DH reconstruction, original polynomial forward replay, and three full-length genuine solved-p57 positive controls. Its separate frame companion is [p29 DH frame SFT](../sims/lp2_p29_dhframe_p28_original_sft.cjs).
