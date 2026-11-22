#!/usr/bin/env python3
"""Original-JPEG, self-testing LP2 p23-26 wing-flank orientation discriminator.

Reproduces the pixel relationship of the two printed wing decorations on each
physical p24-26. This is a source-geometry test, not a plaintext decoder.

Dependency: opencv-python (the public OpenCV Python package).
"""
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "resources" / "liber-primus"


def image(number: int) -> np.ndarray:
    path = IMAGES / f"{number:02d}.jpg"
    frame = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    assert frame is not None, f"Unreadable original JPEG: {path}"
    assert frame.shape == (3600, 2400), f"Unexpected original image dimensions: {path}: {frame.shape}"
    return frame


def orientation_scores(frame: np.ndarray) -> dict[str, tuple[float, tuple[int, int]]]:
    # Letter-free source artwork strips; the right strip is deliberately wider
    # and taller to allow a registration difference. No ciphertext is sampled.
    left = frame[1280:2200, 90:520]
    search = frame[1200:2310, 1800:2400]
    transforms = {
        "same": left,
        "left-right": cv2.flip(left, 1),
        "top-bottom": cv2.flip(left, 0),
        "rot180": cv2.flip(left, -1),
    }
    output = {}
    for name, template in transforms.items():
        response = cv2.matchTemplate(search, template, cv2.TM_CCOEFF_NORMED)
        _, value, _, (x, y) = cv2.minMaxLoc(response)
        output[name] = (float(value), (x + 1800, y + 1200))
    return output


def main() -> None:
    frames = {number: image(number) for number in (41, 42, 43)}
    source_results = {}
    for number, frame in frames.items():
        scores = orientation_scores(frame)
        source_results[number] = scores
        print(f"original {number:02d}.jpg:")
        for name, (score, origin) in scores.items():
            print(f"  {name:11s} corr={score:.8f} right-origin={origin}")
        assert scores["same"][0] > 0.989
        assert scores["same"][0] > scores["left-right"][0] + 0.08
        assert scores["same"][0] > scores["top-bottom"][0] + 0.08
        assert scores["same"][0] > scores["rot180"][0] + 0.003
    # Image 41 and 43 mayfly decorations are byte-identical after decoding,
    # despite their original rune text being different.
    for x0, y0, x1, y1 in ((90, 1280, 520, 2200), (1818, 1280, 2248, 2200)):
        assert np.array_equal(frames[41][y0:y1, x0:x1], frames[43][y0:y1, x0:x1])
    # A flipped known image must be recognized as flipped by the same routine.
    planted = np.full((3600, 2400), 255, dtype=np.uint8)
    left = frames[41][1280:2200, 90:520]
    planted[1280:2200, 90:520] = left
    planted[1280:2200, 1880:2310] = cv2.flip(left, 1)
    positive = orientation_scores(planted)
    print("synthetic left-right-flipped receiver:", positive)
    assert positive["left-right"][0] > 0.9999
    assert positive["left-right"][0] > positive["same"][0] + 0.08
    print("PASS: source artwork has repeated same-orientation flanks; synthetic mirror control identified")


if __name__ == "__main__":
    main()
