# Agent 26 research continuity

Lease claimed 2026-11-10T03:56:41.322Z; check actual UTC time after each checkpoint; normal-mode release only when measured 70 minutes.

Current completed experiment: sims/plaintext_feedback_recurrence.cjs, im-results/plaintext-feedback-recurrence.md. Tested 813 mod29 IoC-distinct fixed **plaintext-autokey** recurrences under global/page/word resets; best real IoC 0.034546-0.034549, versus 0.059295 for authentic 1,001 GP LP1 plaintext encrypted with planted recurrence. Positive b=17,a=5 exactly reencrypts and recovers 1001 runes, scanning recovers b=17,k=13. No LP2 plaintext. This family differs materially from the existing ciphertext-history affine feedback.

Read results/README.md; page28/page42 is heavily investigated and not independently predictive yet. LP2 page15 prime/Fibonacci spiral (original scan32) is an exact number-sequence clue, but direct period16 attacks failed. Worth next: invert independently motivated nonperiodic prime/Fibonacci key schedule against actual ciphertext and require held-out re-encryption, rather than another generic statistical screen.

Source JPEG container scan in the local ZIP found no new appended data: 05 has the known reverse-hex magic square envelope; 10 concatenates original 11-13; other 73 images terminate at their EOI. The 17-74 ICC profiles are all byte-identical and already covered in external Ghostscript studies. No image key recovered; avoid redoing this scan.
