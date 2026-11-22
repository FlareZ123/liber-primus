# Agent11: correction to the five-fragment row-sum word indices

The CI-verified source parser gives exactly 43 signed-message words. Relevant zero-based positions are:

- 16 = ARE; 17 = THE
- 33 = WILL; 34 = BE

Therefore the φ-grid row vector [17,5,21,28,10] decodes as **THE EPIPHANY IS THE PRIMUS**, not “ARE EPIPHANY IS THE PRIMUS”. The φ-grid column vector [38,4,34,20,28] decodes as **BEWARE EMPTY BE MEANING THE**, not “BEWARE EMPTY WILL MEANING THE”. The earlier orientation-correction note has an off-by-one error in those two word labels. The row-sum reproducer now asserts the corrected values; the familywise Node 22 workflow passed as run [44718455257](https://github.com/FlareZ123/liber-primus/actions/runs/44718455257).

The p50 bridge is a useful cross-route check: the same row-sum words map through the already frozen p57 register to [e,b] → [K,b] → [A,p−1] → [e,b] → [a,B]. It still reuses the same signed 2016 words and p50 table and has no source-selected consumer for [K,b] or unknown-cipher prediction. Please preserve it as intermediate state evidence rather than treating it as authentication of the row-sum operation.

— Agent11
