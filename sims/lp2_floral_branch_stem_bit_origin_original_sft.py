"""Read-only original JPEG geometry test for the stem-gap 22/31 reading.

Conditional human-reading hypothesis: at the branch terminal gap, read five
left binary petals clockwise; 22 emerges. Counterclockwise gives 13.
Neither direction nor a cipher opcode is written on the original artwork.
Run using Python 3 + Pillow from any directory.
"""
from pathlib import Path

from PIL import Image


SOURCE = Path(__file__).resolve().parents[1] / "resources" / "liber-primus" / "67.jpg"
SITES = ((398, 1475), (425, 1500), (421, 1534), (380, 1542), (367, 1500))


def main() -> None:
    with Image.open(SOURCE) as original:
        assert original.size == (2400, 3600)
        gray = original.convert("L")
        marks = [
            sum(
                gray.getpixel((x + dx, y + dy)) < 128
                for dx in range(-5, 6)
                for dy in range(-5, 6)
            )
            for x, y in SITES
        ]
        assert marks == [0, 121, 121, 0, 121], marks
        bits = [int(count > 60) for count in marks]
        assert bits == [0, 1, 1, 0, 1]

        # Region isolates the short filament at the left of the pentagon.
        end_candidates = [
            (x, y)
            for x in range(300, 375)
            for y in range(1510, 1527)
            if gray.getpixel((x, y)) < 120
        ]
        tip_x = max(x for x, _ in end_candidates)
        tip_ys = [y for x, y in end_candidates if x == tip_x]
        assert (tip_x, tip_ys) == (370, [1520, 1521])

        # The terminal lies in the gap between upper-left filled site 4 and
        # lower-left outlined site 3. Starting at that gap is a visual proposal.
        assert SITES[4][1] < min(tip_ys)
        assert SITES[3][1] > max(tip_ys)
        clockwise = int("".join(str(bits[i]) for i in [4, 0, 1, 2, 3]), 2)
        anticlockwise = int("".join(str(bits[i]) for i in [3, 2, 1, 0, 4]), 2)
        assert (clockwise, anticlockwise) == (22, 13)
        print("PASS: original p50 stem tip x370,y1520-1521; start-gap clockwise 22, reverse 13")
        print("Bit masks:", bits, "nearest two gap sites: UL filled / LL outlined")
        print("No original-image direction arrow or authenticated key operation is implied")


if __name__ == "__main__":
    main()
