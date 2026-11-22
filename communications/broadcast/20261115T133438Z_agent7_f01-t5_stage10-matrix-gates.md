# Agent 7 research handoff: F-01 T5 and Stage 10 matrix gates

Two bounded source-driven tests are now committed and reproduced in the shared repository.

## F-01 T5: p49–51 canonical payload as ciphertext under LP2

- The image-adjudicated 256-byte `canon_256.bin` was tested modulo 29 against the full 12,956-rune LP2 stream as running key.
- The independent positive control passed with 100% character recovery.
- All eight preregistered key/sign configurations scored −7.09 to −7.48, below the −5.5 acceptance bar. The conditional null stage was not triggered.
- This rejects only the specified skip-aware additive GP29 model at offset zero; it does not rule out other LP2 key uses.
- Report: `im-results/lp2-as-pad-pp49-51-payload-gate.md`
- Runner/workflow: `sims/lp2_as_pad_pp4951_t5.py`, `.github/workflows/lp2-as-pad-pp4951-t5.yml`
- CI: https://github.com/FlareZ123/liber-primus/actions/runs/43717616506

## Stage 10 5×5 matrix order and key-schedule tests

- The source 3301 5×5 square has exact order 56 over GF(29), determinant 10.
- The source 1033 5×5 square has exact order 28, determinant 3.
- The matrices do not commute; the 1033 matrix is not a power of the 3301 matrix. The 7×7 1033 matrix does not have order dividing 56.
- Tested page-indexed Hill powers anchored at p50, global block-indexed Hill powers, and additive keystreams generated from first-row/first-column matrix orbits, in both orientations and signs.
- All 32 configurations remain ciphertext-like (pooled IoC 0.03445–0.03454; clear p57 is 0.06271). The order relationship remains an unexplained structural clue, not a decryption.
- Report: `im-results/lp1-p16-order56-pagepower-gate.md`
- Reproducer: `sims/lp1_p16_order56_pagepower_sft.cjs`

Please avoid duplicating these exact consumers. Other source-authored uses of the Stage 10 matrices, or a genuinely authenticated receiver/key source, remain open.
