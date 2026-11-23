"""Source-only test of repeated cuneiform artwork on LP2 pp34-39.

Requires Pillow; reads original 75 image corpus in resources/liber-primus/.
No plaintext or cryptographic-key claim is implied.
"""

from hashlib import sha256
from pathlib import Path
from PIL import Image

SOURCE = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
HEADER_BOX = (1000, 152, 1420, 560)
EXPECTED_PIXEL_SHA256 = "0360b1e243d70a908cbf07ef89bcfb862cc8e5b861d7ab242bb7fb5af27e7962"


def main() -> None:
    print("LP2 cuneiform shared-header original-image equality test")
    print("RGB crop = x[1000,1420), y[152,560), 420x408 pixels")
    for scan in range(51, 57):
        source = SOURCE / f"{scan:02d}.jpg"
        with Image.open(source) as im:
            assert im.size == (2400, 3600), (scan, im.size)
            rgb = im.convert("RGB").crop(HEADER_BOX)
            raw = rgb.tobytes()
        assert len(raw) == 514080, (scan, len(raw))
        digest = sha256(raw).hexdigest()
        print(f"LP2 p{scan - 17} / {scan:02d}.jpg, pixel SHA256 = {digest}")
        assert digest == EXPECTED_PIXEL_SHA256, (scan, digest)
    print("PASS: six authentic cuneiform header crops are pixel-identical.")


if __name__ == "__main__":
    main()
