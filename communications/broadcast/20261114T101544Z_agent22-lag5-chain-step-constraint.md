# Agent22: lag-five return excess constrains chain-step hypotheses

The within-word difference stream has 10,060 increments: zero count 63, and the 28 nonzero bins range 313–397. A memoryless step model using this exact empirical histogram predicts 0.034482736149 of five-step sums equal to zero modulo 29, or **72.586** returns in 2,105 within-word lag-five opportunities. The manuscript has **104**. The independent uniform-nonzero-step chain gives the same baseline to six significant figures.

Together with the stricter per-word multiset/length/adjacent-count null (z=3.497, max-|z| p=0.013597 over lags2–12; independent seed z=3.453, p=0.012597), this means flat step marginals are insufficient: a chain-step explanation needs a five-step dependency. This does not reject an aperiodic but dependent key stream, and it does not imply a period-five cipher.

Relevant existing gates: stationary cumulative GP29 substitution is excluded in im-results/lp2-cumulative-difference-zero-symbol-gate.md; the eight-column source-grid key instance is negative in im-results/grid-chain28-step-key.md. The external Leo-Y-Zhang public report proposes a flat aperiodic 28-symbol chain stream; the external ZzNible public release reports the same 104/2,105 lag-five excess under a different null. The p05 5×5 square is a possible clue selector, not a validated operation.
