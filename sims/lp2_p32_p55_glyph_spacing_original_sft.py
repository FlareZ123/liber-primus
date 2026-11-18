"""Original LP2 p32/p55 glyph-advance test. Requires numpy and opencv-python.

Read actual 2014 JPEGs and source transcripts. One visible rune is one isolated
component on each selected line. A font-width model tests for altered spacing;
it does not decipher ciphertext or establish author intent.
"""
from collections import Counter, defaultdict
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
ORIG = ROOT / "resources" / "liber-primus"
RUNES = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
INDEX = {r: i for i, r in enumerate(RUNES)}
# The source has 55 rune-bearing unsolved blocks. Physical page 50 is runeless.
SOURCE = {
    49: (32, """ᛚ-ᚦᚫᚹ-ᚫᚢᛈᛡᚳ-ᚹᛝᚻᚹᛒᛗᛋᛟᛖᛁᛡ-ᛟᚹᚦᚻᛒ/
-ᛡᚱᛏᚦᚠ-ᚠᚩᚦ.ᚻᚩᛗᛖᛉᚹᛞᛋᛚᚠᛞ-ᛝᛒᛇᛡ/
ᛚᚪ-ᚹᛞᚾᚫᛉᛏᚣᛗᚷ-ᚦᚹᛉᛡᚦ-ᚹᛒᛋᚱᛉᛡᛉ/
ᚪ-ᚢᛒᚻᛠ-ᚹᛝᚢᚻᛇᛝᛡᛠᛄ-ᛋᛈᚦᛏ-ᛟᛝᚩ/
ᛗᛒᚢᛞᛋ-ᛒᛄ-ᛠᚱᛟ-ᛖᚾ-ᚾᚹᚷᚢᛚᚪᚩᚣ-ᚢᛏ/
ᚠᛄᛏ-ᚪᚷᛒᛇ."""),
    72: (54, """ᛝ-ᚫᛗᛁᚹ-ᛋᛒ-ᛉᛗ-ᛋᛇᚷᛞᚦᚫ-ᚠᛡᚪᛒᚳᚢ-ᚹᚱ-ᛒ/
ᛠᚠᛉᛁᛗᚢᚳᛈᚻᛝᛚᛇ-ᛗᛋᛞᛡᛈᚠ-ᛒᚻᛇᚳ-/
ᛇᛖ-ᛠᛖᛁᚷᛉᚷᛋ-ᛖᛋᛇᚦᚦᛖᛋ-ᚦᛟ-ᚳᛠᛁᛗ/
ᚳᛉ-ᛞᛄᚢ-ᛒᛖᛁ."""),
}
LENGTHS = {49: [25, 23, 23, 21, 22, 7], 72: [24, 22, 22, 8]}
SPACING = {0: 0, 1: 16, 2: 48}

def letters(line):
    values, boundaries, punctuation = [], [], 0
    for ch in line:
        if ch in INDEX:
            values.append(INDEX[ch])
            boundaries.append(punctuation)
            punctuation = 0
        elif ch in "-.":
            punctuation = 2 if ch == "." else 1
    return values, boundaries

def components(path):
    im = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    assert im is not None and im.shape == (3600, 2400), path
    _, _, stats, _ = cv2.connectedComponentsWithStats((im < 140).astype(np.uint8), 8)
    rows = defaultdict(list)
    for x, y, w, h, area in stats[1:]:
        if 600 <= x < 1830 and 500 <= y < 1800 and 60 <= h < 125 and 7 <= w < 95 and area > 140:
            rows[round((int(y) + 30) / 180) * 180].append(int(x))
    return [sorted(rows[y]) for y in sorted(rows)]

def records():
    text = (ROOT / "resources" / "lp2-transcription.txt").read_text(encoding="utf-8")
    blocks = text.split("%")
    out = []
    for jpeg, (block, frozen) in SOURCE.items():
        original = blocks[block].strip().split("&")[0].strip().rstrip("/")
        assert original == frozen, f"Source transcript mismatch for {jpeg}.jpg"
        line_strings = frozen.split("/")
        glyphs = [letters(line) for line in line_strings]
        xs = components(ORIG / f"{jpeg}.jpg")
        assert [len(x) for x in xs] == [len(r[0]) for r in glyphs] == LENGTHS[jpeg]
        for (chars, separators), starts in zip(glyphs, xs):
            for j in range(len(starts) - 1):
                out.append((jpeg, chars[j], separators[j + 1], starts[j + 1] - starts[j]))
    assert len(out) == 187
    return out

def fit(data):
    samples = defaultdict(list)
    for _, glyph, punct, dx in data:
        samples[glyph].append(dx - SPACING[punct])
    advances = {glyph: int(round(np.median(v))) for glyph, v in samples.items()}
    errors = [dx - advances[glyph] - SPACING[punct] for _, glyph, punct, dx in data]
    return advances, errors

def main():
    data = records()
    all_advances, errors = fit(data)
    assert len(all_advances) == 29
    assert Counter(errors) == {-1: 21, 0: 125, 1: 41}
    print("p32=121 runes, p55=76 runes, 187 within-line x-advances")
    print("29 whole-pixel advances:", [all_advances[i] for i in range(29)])
    print("Original residual counts:", dict(sorted(Counter(errors).items())))
    for jpeg in (49, 72):
        known, _ = fit([r for r in data if r[0] != jpeg])
        hold = [r for r in data if r[0] == jpeg and r[1] in known]
        residuals = [dx - known[glyph] - SPACING[punct] for _, glyph, punct, dx in hold]
        expected = (103, 98) if jpeg == 49 else (72, 68)
        assert (len(hold), sum(abs(e) <= 1 for e in residuals)) == expected
        assert max(abs(e) for e in residuals) == 2
        print(f"Held-out {jpeg}.jpg: {expected[1]}/{expected[0]} advances within 1px; largest 2px")
    plant = data.copy()
    jpeg, glyph, punct, dx = plant[-5]
    plant[-5] = (jpeg, glyph, punct, dx + 4)
    assert max(abs(e) for e in fit(plant)[1]) >= 3
    print("Planted +4px shift detected; original 187 source gaps <=1px residual")
    print("PASS: bounded no-large-spacing-signal gate, no key or plaintext")

if __name__ == "__main__":
    main()
