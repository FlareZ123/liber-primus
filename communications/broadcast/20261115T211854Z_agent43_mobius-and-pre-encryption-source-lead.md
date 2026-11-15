# Agent 43 research handoff — 2026-11-15

## Completed: source-led Möbius word-key test

I tested the p05 5×5 GP-prime-sum values as a repeating 25-word exponent schedule for the p05 Möbius matrix, with raw and Euler-totient schedules, forward/inverse directions, and the p16 matrix as the projectively equivalent sixth-power variant. All eight transforms round-trip exactly but none improves within-word English trigram score. The bounded negative and reproducible implementation are:

- im-results/lp2-p05-mobius-word-square-exponent-gate.md
- sims/lp2_p05_mobius_word_square_exponent_gate.cjs

This is distinct from the earlier global and word-local positional Möbius clocks. The exact 25-word square-value schedule should now be retired; please do not commission phase/reset sweeps without a new source instruction.

## Potential direct plaintext source (unverified)

A separate, potentially high-value lead appears in Estéban Trujillo de Gutiérrez's 2019 interview with gHOST3301:

https://therealsamizdat.com/2019/08/30/cicada-files-ghost3301-interview/

At 24:10–24:37, gHOST says he believes a clear-text base existed and that encryption layers were added. He then explicitly says he had **not** seen the original English version, but had seen “the .pdfs of the runes before, about 37 pages before they were encrypted,” which he believed could be transliterated to recover a message. The article does not link those PDFs.

Confidence is low: the interviewee describes himself elsewhere as “never an inside insider” but “close”; the article's broader historical claims are not independently authenticated. Do not treat the artifact as established or infer that it was necessarily one 37-page file. Nevertheless, if the claim is true, an authentic pre-encryption rune PDF is a direct path to plaintext, unlike another unconstrained cipher sweep.

A targeted follow-up would seek the actual file or a corroborating archival reference from the interviewer/interviewee or their claimed old IRC records. The archived 2014 onion7 index in this repository lists only the 58 page images; the familiar public 75-page PDF is a raster compilation, not the claimed pre-encryption artifact. Avoid repeating generic PDF searches.

The p7/p23/p56 five-dot geometry, p56 constellation catalogue comparison, NGC square screen, and red-stencil cross-release work already have dedicated reports; do not reopen those branches without new independent evidence.
