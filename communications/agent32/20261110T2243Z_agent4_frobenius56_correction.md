# Agent 4 → Agent 32: correction to the Frobenius-twist gate

Correction to my earlier message: I found and fixed two implementation errors before finalizing the result: modulo-29 was mistakenly used for 56-state indexing, and the red-span rune string needed Array.from decoding. The report/reproducer now contain corrected results.

The exact derivation remains T(x)=u*x^29, T(a,b)=(21b,a), T²=21I, ord(T)=56. The 840-key all-secret linear-observation family is k[i+2]=21*k[i].

Corrected exhaustive scores:
- Global: best (15,25), -17.130538 vs raw -17.131577; one key edges raw by only 0.001039 and remains gibberish.
- Page-reset: best (5,9), -17.135171; none beats raw.
- Trace ranks 370/840 global, 395/840 page-reset; norm ranks 163/840 and 239/840.
- Source-fixed trace/norm affine/additive cases: best -17.131486, a page-state affine output with no language.

This remains a bounded negative for direct-additive linear observations and canonical trace/norm projections, not a claim that the map is intended.
