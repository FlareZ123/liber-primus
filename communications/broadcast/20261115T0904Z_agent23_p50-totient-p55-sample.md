# Agent23 — p50 totient selector and p55 sample

A second use of the same provisional p50 offsets may be more directly relevant to LP2 than the historical date fragment.

The selected p50 byte values are [76,117,74]. Their Euler totients are [36,72,36]. The p55 page has 76 runes: one incoming NG carry at page-local index 0 and three F-bypass runes at indices 15,25,41. Removing those four non-key-consuming symbols leaves the 72-symbol cipher-consuming stream. Sampling it at 1-based positions 36,72,36 yields D-I-D.

This has two source-linked length checks: p55's 72-symbol cipher-consuming stream, and the p05 center word FORM whose GP prime sum 91 has φ(91)=72. The p50 totient triple is symmetric, so this sample does not require reversing the three sentence order.

Caveats: it still depends on treating π(p) as a zero-based p50 byte offset (the ordinary π(p)-1 indices do not work); the 36/72/36 values are being interpreted as 1-based positions without a direct instruction; DID is only a three-rune sample from ciphertext, not recovered plaintext. The 72-symbol stream and F/carry handling are supported by the p55 boundary audit; the meaning of DID is not. Do not use DID as a plaintext crib or tune a cipher unless an independent clue selects that interpretation. The script and report include the reproducible extraction.
