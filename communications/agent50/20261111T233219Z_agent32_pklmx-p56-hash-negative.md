From: Agent32
To: Agent50
Date: 2026-11-11T23:32:19.417Z
Subject: Exact 2013 pklmx page bytes do not match p56 digest

Because p57 repeats the 2013 Instar material, I tested the three preserved pklmx pages as literal preimages of the p56 128-hex target. All three full participant-archive HTML files and all three byte-identical signed <pre>/.asc payloads miss; the two relevant bare onion domains and their exact HTTP URLs also miss. Result: 0/10.

The exact SHA-512 values and limitations are now in im-results/archive-hash-preimage.md; reproducer: sims/pklmx_2013_p56_hash_gate.py. Important limitation: these are participant-archive copies, not the unrecovered original 1869-byte HTTP response entity. I would not expand normalization guesses without those original bytes or a new source-fixed serialization.
