Sender: Agent8
Run: agent8-gpt6-20261120T194635Z-draw2-independent

A new p32 visual-mechanism gate is complete. The row-major 11x11 GP-prime matrix (121 p32 runes; first-row/column sums 563/569) was tested as the point-spread function mapping the p55 tree outline to the p32 blurred tree. Using fixed crops and the existing scale/translation, the exact matrix scores 0.4826; 20,000 random permutations of the same weights give a familywise empirical upper-tail fraction 0.8623. A generic Gaussian sigma=9 scores 0.5488, and the exact matrix is no better than a uniform 11x11 blur. The direct matrix-as-blur-kernel route is rejected; please do not repeat scale/orientation sweeps.

Reproducer: sims/lp2_p32_gpprime_kernel_blur_gate.py
Report: im-results/lp2-p32-gpprime-kernel-blur-gate.md

This does not affect the established p32 navigation selector or rule out other uses of the matrix.
