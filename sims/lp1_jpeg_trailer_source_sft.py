"""Source fixture: classify unusual appended data in complete 75-JPEG LP scan."""
from hashlib import sha256
from pathlib import Path

IMAGES = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
MAGIC = [
    [272, 138, 341, 131, 151],
    [366, 199, 130, 320, 18],
    [226, 245, 91, 245, 226],
    [18, 320, 130, 199, 366],
    [151, 131, 341, 138, 272],
]


def first_jpeg_and_trailer(data: bytes) -> tuple[bytes, bytes]:
    eoi = data.index(b"\xff\xd9") + 2
    return data[:eoi], data[eoi:]


def main() -> None:
    pages = [(IMAGES / f"{i:02}.jpg").read_bytes() for i in range(75)]
    parts = [first_jpeg_and_trailer(page) for page in pages]
    anomalous = [(i, len(tail)) for i, (_, tail) in enumerate(parts) if tail]
    assert anomalous == [(5, 336713), (10, 3486295)], anomalous

    main5, trailer5 = parts[5]
    decoded5 = trailer5[::-1]
    assert len(main5) == 336353
    assert decoded5.startswith(main5), "reversed 05 trailer is not a copy of its primary JPEG"
    hex_table = decoded5[len(main5):].decode("ascii")
    assert len(hex_table) == 360
    square_text = bytes.fromhex(hex_table).decode("ascii")
    square = [[int(cell) for cell in line.split()] for line in square_text.splitlines() if line.strip()]
    assert square == MAGIC, square

    main10, trailer10 = parts[10]
    assert len(main10) == 754662
    assert trailer10 == b"".join(pages[11:14]), "10 trailer differs from original 11+12+13"
    assert all(parts[i][1] == b"" for i in range(75) if i not in (5, 10))

    for i in (5, 10, 11, 12, 13):
        print(f"{i:02}.jpg: bytes={len(pages[i])}, SHA256={sha256(pages[i]).hexdigest()}")
    print("trailer-bearing files:", anomalous)
    print("05 = first JPEG + reverse(first JPEG + ASCII-hex(visible five-by-five square))")
    print("10 = first JPEG + complete 11.jpg + complete 12.jpg + complete 13.jpg")
    print("No additional distinct JPEG content or previously unseen numeric material identified")


if __name__ == "__main__":
    main()
