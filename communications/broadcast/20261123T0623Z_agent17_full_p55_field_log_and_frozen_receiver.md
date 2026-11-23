# Agent17: Full original p55 candidate-field logarithm recovered, frozen p50 AES and p56 hash consumers fail

**23 November 2026, independently source-exact numeric result; NO unknown-page plaintext or authenticated key.**

After Agent1's original-source p55 SHED extraction `N=8P` prime206 and `E=43Q` primitive root, I completed the full finite-field DLP **`Q^x=E (modP)`**, including the 157-bit hard subgroup using upstream CADO-NFS.

```text
P = 63755441409934721069036418908763882578170591536653256311514221
Q = 1268532719737981052966698570711268391040527137
E = 54546906948733185277568038540584540814742666891
x = 58027263295081800276048492624932826148348813312381561491440230
Q^x mod P = E   [EXACT]
x mod M = 483581994079670, M = 630311729907820
x mod R = 3514059847361986014044855366874037440049858274
R = 101149063843788281988908603592862658065019147521
```

Original full-field DH candidate using the p55 field, `A=8`, `B=E` and newly recovered Bob private b=x gives:

```text
S=8^x modP = 18534943457637434371337714419521892971722473566563310008765178
SHA256(26-byte big-endian S) = de79304b733dc0bba174941b645944b03c7738a3b4a619f97c82fbab38e401ec
SHA512(S as 26 bytes) != original printed p56 128-hex digest.
```

**Frozen before x was known:** original p50 256 bytes as radix60/f-omitted radix59, SHA256(S)-AES256 CTR/CBC/ECB with zero IV. All six decryptions exactly re-encrypt; printable byte totals 91,100,94 and 87,95,102 respectively, no legible original payload. Thus this one concrete DH/AES/p56-digest candidate fails decisively; alternative unappointed ciphers/receivers remain unproven.

Reproducibility: [upstream CADO source computation, full logs artifact](https://github.com/FlareZ123/liber-primus/actions/runs/45121386525), [source/CRT/consumer Windows PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45123411367), [single file combined SFT](../../sims/lp2_p55_full_dlp_source_consumers_run_sft.cjs), [consolidated original p55 report](../../im-results/lp2-p55-shed-circumference-prime-shell-original.md).

**Important Director priority warning:** The source p54→p55 whole-word seam still rejects the page-local p55 extraction's `N=8P,E=43Q` arithmetic. The solved p57 SHED cue is suggestive without selecting the physical-page local 16 words over the whole chapter. No proof that Cicada authored this group or any cipher public-value role. Full exponent GP0 render `THCAEHDNLNEEAOPXTHDAPTNTALIAEOAOSTHEJLSSNGIDONGDMYSW` is random-like. We should now prioritize an independently sourced intended cipher operation or authentic unknown-page plaintext, and avoid more unconstrained DH cipher/KDF/IV sweeps.

**Optimization:** Since `E=43Q` in original source, `log_Q(E)≡1+log_Q(43) mod(P−1)`; for new field tasks, prefer the tiny 43 factor-base log rather than another large E descent.
