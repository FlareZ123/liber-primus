"""Original LP2 p40–55 mirror-pair ink exception and common plate carrier gate.

Read 16 native 2014 JPEGs, never re-encode. A left border is mirrored against
the right border at the original pixel grid. A seven-pixel MaxFilter tolerates
at most three pixels of edge/raster spread; residual ink outside this
tolerance is evidence of truly nonmirror ink, not F5 coefficient evidence.

Requires Pillow and NumPy. Default source path is resources/liber-primus.
Optional argv[1] is an existing directory of original NN.jpg source files.
"""
from __future__ import annotations
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else (
    Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
)
CROP = (0, 650, 550, 2950)
RIGHT_CROP = (1850, 650, 2400, 2950)
TOP_DOT = (380, 414, 810, 846)  # x0,x1,y0,y1, relative to margin crop
LOW_DOT = (364, 398, 874, 909)


def mirror_match(file_path: Path) -> dict:
    """Recover mirrored literal 5-dot stencil versus raster edge differences."""
    with Image.open(file_path) as original:
        assert original.size == (2400, 3600)
        grayscale = original.convert("L")
    left = grayscale.crop(CROP)
    right = grayscale.crop(RIGHT_CROP).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    left_pixels = np.asarray(left, dtype=np.uint8)
    right_pixels = np.asarray(right, dtype=np.uint8)
    left_ink = left_pixels < 127
    right_ink = right_pixels < 127
    same_ink = int(np.count_nonzero(left_ink & right_ink))
    all_ink = int(np.count_nonzero(left_ink | right_ink))

    # Test only *ink not present near the opposite mirrored shape*.
    left_near = np.asarray(Image.fromarray((left_ink * 255).astype("uint8"))
                            .filter(ImageFilter.MaxFilter(7))) > 0
    right_near = np.asarray(Image.fromarray((right_ink * 255).astype("uint8"))
                             .filter(ImageFilter.MaxFilter(7))) > 0
    extra_left = left_ink & ~right_near
    extra_right = right_ink & ~left_near
    top = extra_right[TOP_DOT[2]:TOP_DOT[3], TOP_DOT[0]:TOP_DOT[1]]
    lower = extra_right[LOW_DOT[2]:LOW_DOT[3], LOW_DOT[0]:LOW_DOT[1]]
    top_count = int(np.count_nonzero(top))
    lower_count = int(np.count_nonzero(lower))
    total_left = int(np.count_nonzero(extra_left))
    total_right = int(np.count_nonzero(extra_right))
    # Pixel-level actual source invariant, with *zero* non-dot leftover ink.
    assert (total_left, total_right, top_count, lower_count) == (0, 847, 442, 405)
    assert total_right == top_count + lower_count
    assert (int(np.count_nonzero(left_ink)),
            int(np.count_nonzero(right_ink))) == (118511, 119286)
    return {
        "source": file_path.name,
        "sourcePairPixelSHA256": hashlib.sha256(
            left.tobytes() + right.tobytes()
        ).hexdigest(),
        "mirroredInkIntersection": same_ink,
        "mirroredInkUnion": all_ink,
        "mirroredInkIOU": same_ink / all_ink,
        "extraLeftPixels": total_left,
        "extraRightPixels": total_right,
        "rightOnlyUnmatchedDotPixels": [top_count, lower_count],
        "otherUnmatchedPixels": total_right - top_count - lower_count
    }


checks = [mirror_match(SOURCE / f"{n:02}.jpg") for n in range(57, 73)]
assert len({x["sourcePairPixelSHA256"] for x in checks}) == 1
assert all(x["otherUnmatchedPixels"] == 0 for x in checks)
print(json.dumps({
    "claim": "The source-reused floral border is a mirror-pair stencil; "
             "all substantial left/right asymmetry lies in two deliberately "
             "faded holes within the left five-dot motif.",
    "LP2pages": list(range(40, 56)),
    "originalScans": [x["source"] for x in checks],
    "originalCrop": CROP,
    "rightCropMirrored": RIGHT_CROP,
    "threshold": 127,
    "edgeToleranceMaxFilterSize": 7,
    "sourcePairSHA256": checks[0]["sourcePairPixelSHA256"],
    "singlePageStatistics": checks[0],
    "candidateOriginalClue": "Left 5-bit motif 01101 = 13; "
                             "mirrored right motif 11111 = 31.",
    "scope": "Source-native pixel-ink asymmetry only. Does not exclude a "
             "mirror-symmetric shared payload, coefficient-domain embedding "
             "without pixel changes, or a distinct original clean parent. "
             "No unknown LP2 plaintext or GP29 key identified."
}, indent=2))
