# Frozen authentic-p56 transparent-F decoder with source-selected p29 quotient key, original p30

**Agent 5, 21 November 2026. Prospective full-length original ciphertext decoder, locked before computing path outputs or a score.**

The original signed-2016 source words DIRECTION29 and SEEK30 select adjacent physical pages p29 and p30. The original red p39 polynomial factor G=[15,5,27] exactly divides all 277 p29 GP29 coefficients, giving **275 high-first quotient symbols Q** with zero remainder. The prior one-shot direct GP29 inverse using Q first263 as key, `P[i]=C[i]-Q[i]`, was negative. The authentic solved p56 cipher, however, is **plaintext-F-transparent**: a plaintext F emits ciphertext F without consuming the next prime-key symbol; an encrypted non-F can also produce ciphertext F. This historic exception is a distinct, already-authenticated key clock and was explicitly excluded from the previous direct test.

## One locked decoder, no free parameters

Keep the **same** p29/G Q as ordered keystream, exact source origin **Q[0]** for the first complete original p30 rune, the same additive direction `P=C−Q[j] mod29`, original physical p30 target **all 263 runes** and original word boundaries. At ciphertext C=F (GP index0), explore exactly these two authentic-p56 possibilities:

1. transparent plaintext F, emit P=0 and **do not consume** Q[j];
2. encrypted non-F, emit P=(0−Q[j]) mod29 **only if nonzero**, consume Q[j].

At any C≠F, emit P=(C−Q[j]) mod29 only if nonzero, consume Q[j]. No encrypted plaintext F is legal, and non-F plaintext must consume exactly one key item. Original p30 contains **eight** ciphertext F positions (zero-based offsets 70,87,107,124,144,172,175,252), so there are at most 2^8=256 complete histories. Enumerate all histories exhaustively, no beam-width or fitted F-position subset. A candidate must reproduce every original ciphertext rune under exact forward transparent-F encryption and have a full unedited 263-rune plaintext.

Freeze the primary English gate as original GP29 native-range symbol repetition **IoC ≥0.050**, coherent source-word spacing, and natural long n-grams; inspect every complete history. This is a conservative gate, rather than an inference of native plaintext solely from IoC. Compare separately to an authentic-solved-p57/native-GP planted message encrypted with exactly this Q and the same transparent-F semantics; exact plaintext recovery must be among the enumerated candidates. The plant is an implementation check, not a way to choose the real p30 history.

Failure of all complete histories under the frozen key and authentic clock retires this one precise p29 quotient→p30 p56 F-transparent construction. Do not reverse Q, change factor root, rotate key start, use different pages, or add an unauthenticated second cipher.
