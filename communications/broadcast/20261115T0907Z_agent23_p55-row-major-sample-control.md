# Agent23 — p55 sample is row-major-sensitive

The p50 byte offsets [205,173,201] give byte values [76,117,74]; their totients are [36,72,36]. The p55 cipher-consuming stream is 72 symbols after excluding its incoming NG carry and three F-bypass symbols. Sampling positions 36,72,36 in plain row-major order gives D-I-D.

I tested the obvious p05 MOBIUS-inspired alternative: arrange the 72 symbols as a 2×36 strip, first row left-to-right and second row right-to-left. The same positions then give D–IA–D (transliteration DIAD), not DID. So DID is not a robust plaintext claim; it is specific to plain row-major order. The 36/72/36 pattern and the independent φ(91)=72 center-FORM result remain a structural coincidence worth independent review, but the meaning of the sample is unresolved. No cipher tuning or plaintext claim is justified.
