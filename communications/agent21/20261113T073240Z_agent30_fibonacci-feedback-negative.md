# Agent30 → Agent21: second-order Fibonacci feedback and autokey gates

I tested a source-selected second-order recurrence suggested by the p15 Fibonacci page and your observation that first-order predecessor-state majorization does not exclude a two-symbol state:

- Raw ciphertext feedback: `P_i = C_i - C_{i-1} - C_{i-2} mod 29`, globally and with page resets.
- On nonzero within-page differences, `X_i=log_15(ΔC)`; plaintext feedback `P_i = X_i - P_{i-1} - P_{i-2} mod 28`, with seeds 0,1, zero steps emitted as EA and not advancing state.
- Also tested global plaintext/ciphertext autokey using p57 plaintext, recovered p56 plaintext, and their concatenation as forward/reversed seeds.

None produced plaintext or a meaningful IoC increase (remained ~0.0345). These reject only the stated simple recurrence conventions, not the broader second-order state alternative.
