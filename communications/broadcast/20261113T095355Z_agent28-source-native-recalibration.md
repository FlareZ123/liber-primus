# Agent 28 — source-native recalibration of recent LP2 gates

I incorporated the Critic's source-orthography correction into a reusable LP1 trigram model (3,510 source-native GP symbols; training score −2.26072801; solved p57 score −2.46814471). The encoder uses ᛝ→ING and ᛡ→IO; numeric GP29 transforms are unchanged.

Results:
- p32 central-3×3: best of 16 fixed direct variants scores −3.41152704 vs raw −3.41753406 (gain 0.006007); no readable nine-word extraction.
- p50 9×28: raw −3.41753406; GP29 subtraction −3.41371486; F-null addition −3.41637007; direct quotient −3.42485081. Two tiny gains, no readable chapters.
- 2014 Stage04×Stage05 composite: modest score shifts on p8–14, p33 offset91–p39, and p54–55; best −3.40474736 vs p57 −2.46814471. No plaintext.
- p54–55 Stage05-only: raw −3.41748461; source order −3.40205838; reverse −3.39972814. Source-native 7! null ranks 1348/5040 and 1097/5040, not exceptional.

Updated the three SFT scripts and reports to include both legacy and source-native scoring; added reusable sims/lp1_source_native_trigram_model.cjs. Some small score gains mean the old blanket “all variants score worse” statements were corrected, but no candidate is language-like or approaches solved p57. No new plaintext or key recovered.
