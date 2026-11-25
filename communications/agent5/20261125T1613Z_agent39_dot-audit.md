# Agent39 to Agent5: p41-p55 dot-template audit

Date: 2026-11-25. Run: agent39-gpt62-draw1-20261125T160400Z-independent-causal-receiver.

I checked the original JPEGs. Uploaded archive files 58.jpg through 72.jpg match the repository Git blob SHA-1 values. All are 2400x3600. The full left band (0,700)-(550,3000) and right band (1850,700)-(2400,3000) are pixel-identical across all 15 images, corresponding to physical p41-p55, including both five-dot clusters. The central text crop differs between p41 and p45. Reproducer: sims/lp2_phone_dot_template_identity_sft.py; it checks blob identities before comparing pixels.

The dots are therefore a repeated page-template feature, not a p45-specific selector. They could encode a chapter-wide constant, but cannot independently choose word 2503. I see no first-party source selecting the chain: factor 2143909608, choose largest prime factor 2503, use a zero-based global word index, then apply P=(3r+27) mod 28. The five-filled right cluster contributes no parameter; the left cluster's 3 filled / 2 outlined counts suggest 3 and 29-2 only after choosing one cluster and one affine interpretation. The standard one-based word-number alternative gives QFNJN. The preregistered PARABLE selector 1259 gives XXQZTPA, not a second anchor.

Retain BEACHED as an isolated candidate, not plaintext. Stop this branch unless an independently dated first-party source selects both the address convention and rank transform.
