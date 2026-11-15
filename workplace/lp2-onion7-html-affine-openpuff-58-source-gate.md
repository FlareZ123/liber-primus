# Original 2014 Onion7 HTML numerals as an OpenPuff image-order key

**Working status, 15 November 2026:** one independently selected, bounded original-source experiment, now executable. No unknown LP2 plaintext or embedded payload has been claimed.

## Source-to-decipherment path

The original May 2014 Onion7 delivery HTML, preserved verbatim at [the 1,640-byte original index](../resources/historical/stage11-2014-index.html), has exactly **58 publisher image references** in numeric order `0.jpg` to `57.jpg`. Its non-image metadata contains the apparently deliberate numeric pair `<title>133</title>` and `<div id="331">`. These are visible to a 2014 human inspecting the source, and the reversal 133/331 makes them stand out from an ordinary layout. The same earlier 2014 puzzle actually used original OpenPuff 4.00 to expose `magicsquares.txt`, now reproduced [in the historical native source gate](../im-results/openpuff-jpeg-capacity-gate.md) with its exact password A=`33011033`.

A plausible *new* mechanism for the HTML numbers is **ordering the 58 original JPEG carriers** for one OpenPuff multi-image stream. If `133` is a multiplier and `331` an increment, one complete, unambiguous affine image permutation follows:

```
publisher_page(i) = (133*i + 331) mod 58,  i = 0..57
actual_source_image = 17.jpg + publisher_page(i)
```

Because gcd(133,58)=1, the 58 indices are unique. The first five publisher indices are 41, 0, 17, 34, 51. The workflow asserts the original 58-index HTML and exact first two outputs, uses the corresponding byte-original `resources/liber-primus/58.jpg`, `17.jpg`, and so on, and records every input in sequence. Its test uses the *actually authenticated historical* A=`33011033`, B/C disabled and original JPEG Medium 1/5, the 2013-documented OpenPuff default. No bit depth, KDF, orientation, seed, permutation, carrier subset or scoring search is permitted.

This is genuinely distinct from the already negative original 58-image **publisher order** under the identical key/software/bit setting, and from prior numeric-page permutation experiments conducted on *runic ciphertext*. Source-frozen original metadata selects the two coefficients and the actual object count, while the earlier authenticated tool supplies an executable reversible decoder.

**Strongest objection:** no signed or original HTML instruction says to apply an affine map to the page list or hide an OpenPuff stream. The same numbers may instead denote other page/prime operations, and choosing a linear-congruential permutation among many ways to use a pair is a **hypothesis**, not authentication. A negative test rejects only this exact source-based route; other permutations become unjustified without an independently visible instruction.

## Actual test and decisive outcomes

The manually dispatched [fixed original-Windows workflow](../.github/workflows/openpuff-v400-lp2-onion7-affine133331.yml) first proves the same exact OpenPuff v4.00 binary can recover an independently publisher-provided 35-byte JPEG stego message. The existing, separate native two-image Medium Hide→Unhide and reversed-order control is [successful run 43692988537](https://github.com/FlareZ123/liber-primus/actions/runs/43692988537). The proposed original run then inserts **exactly 58** source JPEGs in the frozen affine order. The native GUI must verify **58/58** ordered entries, precise Medium option, actual Unhide attempt and terminal outcome, with raw GUI screenshots, any recovered file and source-index manifest preserved.

- **Decisive success:** native file output with full bytes and CRC, a source-authenticated instruction/key or at least a plausible byte payload; then check originality and apply any recovered key to the untouched 12,956 rune ciphertext with a reproducible inverse.
- **Decisive negative:** native `corrupted stream` and zero files with 58/58 verified, only excluding this exact order/password/bit selection.
- **Unresolved:** timeout, missing carrier, failed same-run JPEG calibration, GUI order mismatch or incomplete native attempt; in that case do not count it as a cryptanalytic negative.

No plaintext, original cipher/key or final Tor destination has yet been recovered. This experiment targets an actual original-message extraction, rather than numerical coincidences alone.
