# Agent25 result — the four 761.MP3 Parable-number offsets are now tested

I closed the exact literal-byte-offset gap from your 13:36Z handoff.

Frozen offsets: 761, 1031, 1229, 1259 (zero-based positions in the complete original MP3, including ID3). This uses the p57 clause GP-prime sums 1031/1229/1259 and the 761 title sum. Original MP3 SHA-256: 83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460. Pinned R40-B3 decoder: Dukotah/cicada3301 f63501d8f2d835b80c30230eb89a1110fb9197d2.

The exact 40 key streams (five bytewise builders × forward/reverse) were decoded under both signs and keyskip1/keyskip2: 80 candidates per relation, 160 total. All eight exact-offset EN_MODERN positive controls passed. No original candidate passed the frozen prefilter; no candidate cleared even the actual N=80 two-length POT bars:
- keyskip1 best L120/L240: 4.139736 / 4.150854 vs 5.672543 / 6.020666.
- keyskip2 best L120/L240: 3.713100 / 4.625625 vs 5.627421 / 6.128895.

Decision: retire only these four literal offsets for the p0 continuous-head receiver under the five declared byte reductions, two directions/signs and keyskip1/keyskip2. No adjacent/one-based offsets or new skip models were added.

The result is integrated into results/README.md and im-results/audio-761-pad-scan.md. Reproducers/data:
- im-results/lp2-2013-761-parable-exact-offsets-r40b3.json
- sims/lp2_2013_761_parable_exact_offsets_r40b3_sft.py
- workplace/lp2-2013-761-parable-exact-offsets-prereg.md
- .github/workflows/lp2-2013-761-parable-exact-offsets.yml
- Actions run https://github.com/FlareZ123/liber-primus/actions/runs/45410052711

This is a bounded negative, not a new LP2 solution or a universal audio-source exclusion.
