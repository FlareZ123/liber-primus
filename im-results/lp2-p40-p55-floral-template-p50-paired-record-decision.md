# P40–p55 floral plates: exact common template and the p50 paired-record decision

**Agent23 · 22 November 2026 · Director issue #2241. Classification: original-image fact and operational decision, not plaintext or a key.**

## Original source and independently reproducible observation

The sixteen consecutive source JPEGs `resources/liber-primus/57.jpg` through `72.jpg` are the original LP2 physical pages **p40–p55**. Every image has size 2400×3600. Using full-resolution decoded RGB pixels (Pillow 12.3.0), compare every page against p40 (`57.jpg`). The union of all changing pixels lies entirely in **image columns 591–1831**, inclusive. At every one of 3600 vertical positions:

- The **left 591 columns**, x=0–590, are identical across all sixteen pages. SHA-256 of each complete RGB crop: `3487367efc8b098f9dd8d4b878132bab0f56e36bebb7bc168283f7a9669910c1`.
- The **right 568 columns**, x=1832–2399, are identical across all sixteen pages. SHA-256: `d860da957dc1b6dd00319f6b158a6a66884142c0a635bdd5725b5c5af260d089`.
- The sixteen **central regions** (x=591–1831) have sixteen distinct SHA-256 digests, including the rune-free numeric p50. The p40 center digest is `2e82e5bda6e4e278bc5cbe1dc9876b99f8cd8628919eab493fb94b64b59211a2`. The unchanged flank crops contain substantial visible artwork rather than merely blank padding; on the smaller y=500–2999 test strips, 125,351 left pixels and 112,364 right pixels have mean RGB intensity below190.

These are source-image **pixel identities**, rather than a reading of the glyphs or an assumption that the original PDF is recoverable. The all-page original-image SFT, including a varying-center negative control and exact changed-column bounds, is [`sims/lp2_p40_p55_floral_template_exact_original_sft.py`](../sims/lp2_p40_p55_floral_template_exact_original_sft.py). A single copy of the fixed border provides no page-specific left/right color, orientation, missing petal, path or numeric symbol on which to condition a cipher for any of the 16 pages.

## Consequence for the 16 × 16-byte hypothesis

The source p50 object really has **32 rows × 8 bytes**. In row-major order, two rows per page give **16 records of 16 bytes**, and the sixteen consecutive flower-framed pages provide a corresponding set of sixteen **visual positions**. This is an arithmetically valid possible allocation. The identical left/right art supplies no changing 16-page selector, word clock, bit-level alphabet, byte transport, cipher opcode, IV or key/nonce distinction. Furthermore **p50 itself is one of the sixteen plates**, and contains no printed GP rune receiver: a simple one-record-to-one-rune-page cipher must explain why one of its sixteen records is assigned to a rune-free page.

The **exact template result rules out only a border-variation side channel**. It does not disprove intentional use of the *constant* left/right ordering, table rows as positions or two-row pairing. A solvable historical mechanism still requires another original clue specifying a reversible byte-to-rune transport and its role; merely trialling AES modes, row orientations or arbitrary keystream reductions would postselect a model without selecting the intended path.

**Decision:** retain the 16×16-byte alignment as a possible layout clue, **not an authenticated per-page key schedule**. No page-specific border signal or typed cipher operator is present in these tested original-image regions. Do not commission dependent decryptions until an independent first-party instruction supplies both the key/IV role and a legitimate all-rune receiver, explicitly handling the rune-free p50 record. No unknown LP2 plaintext, key, cipher, or destination is recovered.
