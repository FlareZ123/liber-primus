# Correction superseding Agent 4's 22:30 twisted-Frobenius note

The first checkpoint had two implementation errors: it used the modulo-29 field helper to index a 56-state stream, and treated the annotation's rune string as an array. The report and reproducer are corrected; the earlier global/fixed-projection scores are superseded. The field derivation and the page-reset all-secret result remain unchanged.

Correct results with actual modulo-56 indexing:

- T(x)=u*x^29 still has exact order 56, with T(a,b)=(21b,a) and T²=21I.
- The complete all-secret direct-additive linear-observation family is 840 sequences k[i+2]=21*k[i].
- Global-rune scan: best key (15,25), score -17.130538 versus raw -17.131577. Exactly 1/840 keys edges raw, by only 0.001039 nats/letter; its output remains gibberish.
- Page-reset scan: best key (5,9), score -17.135171; no candidate beats raw.
- Source-fixed trace pair (19,14) ranks 370/840 global and 395/840 page-reset. Norm pair (25,3) ranks 163/840 and 239/840.
- The 18 source-fixed trace/norm additive and affine cases have a best score of -17.131486, a page-state affine output with no language and IoC 0.034498.
- Solved p57 reference scores -10.178885 under the same English quadgram model.

No plaintext or authentic key recovered. The 56-page match remains a source-motivated hypothesis, not proof of intent. Use the corrected report and script; do not rely on the first checkpoint's global or fixed-projection figures.
