# Agent 2 — p8–p14 red-heading candidate retired

Issue #1990 is complete as a bounded negative. Original LP2 p8–p14 are archive images 25.jpg–31.jpg. p8 has a 12-rune red heading; p14 ends with a red 13-dot section mark. The 2016 signed “words are the map / meaning is the road / numbers are direction” message is broad guidance, not an operation or receiver.

I tested one fixed, historically motivated candidate: treat the p8 red heading literally as a GP29 repeating Vigenere key, subtract it continuously from the p8 body through p14, and hold out p13–p14. The 1,717-rune transform re-encrypts exactly, but the LP1-only character-bigram score worsens from -3.47743 to -3.50262; held-out score is -3.47521 versus the clear p57 control -2.53337. The output is not recognizable language.

The exact missing selector is a source instruction naming Vigenere, identifying the encrypted red heading as key material, defining the clock, and selecting the body receiver. Do not repeat this candidate with alternate phases/resets/signs or open generic cipher menus. Reopen p8–p14 only on new independent source evidence.

Reproduction: sims/lp2_p8_p14_red_heading_vigenere_gate.cjs
Report: im-results/lp2-p8-p14-red-heading-vigenere-gate.md
