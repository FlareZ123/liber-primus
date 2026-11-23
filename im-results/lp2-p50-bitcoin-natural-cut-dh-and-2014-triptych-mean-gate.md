# Original p50 Bitcoin-key cuts, direct secp256k1 DH receiver and 2014 three-image mean

**Agent 2, 23 November 2026. Classification: original-source conditional clue and two bounded decoder negatives. No unknown LP2 plaintext, authentic author key, specified decoding operation or destination recovered.**

## Distinct source-led route

The original LP2 p49–p51 table physically prints **32 rows of eight base60 tokens**, 256 byte-valued cells. Previously observed runs of consecutive printed tokens 48→49→4A→4B and 4D→4E→4F with missing 4C can conditionally spell HIJK[L]MNO and select the **fifth (L) column**, an exact 32-byte candidate scalar. Its previously documented compressed Bitcoin secp256k1/P2PKH address begins **1Meanpng**. See [the earlier original-source report](lp2-p50-missing-l-secp256k1-address.md). The Bitcoin operation is not authenticated by a Cicada-signed source.

A *different* mechanically natural 32-byte segmentation of the same table consists of its **eight consecutive row-major 32-byte blocks**. The **first block**, source cells 0..31, has the following compressed P2PKH address:

    1DHLCi9sjH6mPv1BLseSUiitzr6SQPK1gW

The beginning 1DH can be compared with the actual signed **2013 worked Diffie–Hellman operation DH 23** and physical p28's unique literal-DH line. This is a **post-output-recognized two-character coincidence** under an optional alternate serialization. No signed source selects the row-major block as a Bitcoin secret or instructs an elliptic-curve exchange. The complete set of **16 natural base60 keys** (all eight consecutive row blocks and eight vertical columns) is printed by the single-file reproducer; the only conspicuous seven-character prefix is the pre-existing fifth-column 1Meanpng. The short DH resemblance is not an author instruction.

## Exact conditional rarity of the pre-existing Meanpng prefix

The pre-existing compressed P2PKH address contains an exact seven-character payload prefix, `Meanpng`, after version-zero Base58Check's leading `1`. Under a **hypothetical, uniformly distributed hash-derived 192-bit address integer**, the 34-character form `1Meanpng` fixes seven of the 33 nonleading Base58 digits. All 26 suffix digits are allowed. Its lower/upper interval lies strictly inside the 192-bit bound, so the interval fraction is exactly `58^26 / 2^192 = 1.1255600371908105e-12`. The actual checksum commits the low32 bits to the preceding 160-bit hash. Under the usual independent uniform HASH160-output model, taking that hash plus deterministic checksum changes the interval probability by at most a negligible endpoint effect.

A fully **predeclared** 16-candidate family of eight contiguous row-major 32-byte scalars and eight entire vertical columns would give a conservative union upper bound of **1.8008960595053e-11** for *this exact fixed seven-character prefix*. A broader illustrative text family of four-letter BIP39 English vocabulary words (442 such words in the repository's 2013 English list) in title case immediately followed by `png`, under those same 16 cuts, would give a hypothetical bound **7.9599605830134e-9**. These are arithmetic *conditional baselines*, **not valid discovery p-values**: the Bitcoin encoding, source-column selection, word category, case, PNG suffix and 16-candidate research family were considered after exploring the puzzle or seeing the address. Extensive unrecorded hypotheses could substantially increase discovery-wide chance. The zero-transaction blockchain check in the [prior address report](lp2-p50-missing-l-secp256k1-address.md) does not authenticate an authored vanity address.

Despite those limitations, an unusually legible long exact address prefix is worth preserving as a candidate intended clue; it should motivate discovery of the authentic **consumer**, not a broad enumeration of image groups or decryption variants.

## One fixed complete p55 inverse from the two scalar readings

For a concrete use of **both source operands**, compute the standard secp256k1 ECDH shared X coordinate between the first row-major 32-byte scalar and the missing-L fifth-column scalar. The two parties calculate the same 32-byte value:

    3601bfb835efb6d19432d3a5b18f26d0192182b18923558ae29ccf8ecab27750

The source **76-cell outer circumference** of the numerical table corresponds in length to physical unsolved p55's **76 GP29 runes**. With no fitted clock or IV, freeze **one** direct inverse on p55: for original index i, P[i] = (C[i] - sharedX[i mod 32]) mod 29. Encryption adds the same byte mask. This makes explicit the speculative step of using X-coordinate bytes as a repeating GP29 key. The original 2013 DH example operated with a small prime-field integer, so this elliptic-curve transfer is not an inherited historical algorithm.

**Original result:** p55 all76-rune GP29 IoC **0.037894736842105266** becomes **0.03192982456140351**; the entire output remains nonlinguistic. Exact forward replay recovers **76/76** original ciphertext runes. A source-native 95-rune solved-p57 GP29 plaintext plant recovers **95/95**. The derivation identifies a reproducible source-value pair, but this fixed decoder fails to recover plaintext.

Reproducer: [source-exact Node.js 22 CommonJS SFT](../sims/lp2_p50_16natural_bitcoin_dh_p55_original_sft.cjs). The code asserts the original table SHA-256 and original receiver outcomes. The key arithmetic and p55 inverse were independently calculated from the supplied source using Python cryptography; a separate Windows GitHub Actions run is not claimed.

## An additional historically grouped image receiver

The original January 2014 post-square response HTML links exactly **three** newly served LP1 images named /107.jpg, /167.jpg, /229.jpg, archived as **14.jpg, 15.jpg, 16.jpg**. This is a contemporaneous source-selected packet. If the conditional address substring Meanpng means *take an RGB mean and save as PNG*, this Stage10 image group is a distinct recipient from the already tested 58-image LP2 and 16-image floral sets.

Freeze the three native **2400×3600 JPEGs**, decode to RGB at identical pixel coordinates, take the equal-weight channelwise mean rounded nearest with ties upward, and save directly as PNG. No resizing, registration, masking, contrast, page search or color tuning. Exact mean **RGB-array SHA-256**:

    df08c1b7645d7c6d50c7aedd51d43ca58c5a44dc13893707e64ad887dc0b636b

Exactly **7,541,879 / 8,640,000** pixel coordinates are identical across the three originals; the shared lying-figure illustration stays visible. Distinct rune paragraphs, insect engraving and the original magic square yield visibly superposed content. **No new legible instruction, original unknown-page plaintext or key emerges on direct display.** The mean-array SHA-512 differs from the known p56 deep-web target hash. While the three images genuinely formed one source packet, transferring the later speculative Bitcoin clue to them is conjectural.

Reproducer: [original-triplet Python/Pillow/numpy SFT](../sims/lp2_p50_meanpng_stage10_three_original_sft.py), with pinned original image hashes and atomic locked PNG output. The image was independently computed and visually inspected against the original 75-image ZIP.

## Decision

The **raw secp256k1 ECDH byte-mask on p55** and **literal source-complete Stage10 triplet RGB mean** are retired as direct solutions. The 1Meanpng address remains a distinctive conditional possible instruction, while the first row-block 1DH is a weak secondary observation subject to post-selection. Recovering genuine plaintext requires an original source instruction choosing Bitcoin/ECDH, the image or ciphertext receiver, and a reversible operation. Further arbitrarily tuned keys or image groups would add degrees of freedom without resolving this prerequisite. All 56 unsolved LP2 physical pages remain unrecovered.
