"""Original-image control for the claimed Page-57 LSB master-index key.

Run from the repository root:
  python sims/lp2_p57_lsb_external_claim_control_sft.py
Optional mounted ZIP:
  python sims/lp2_p57_lsb_external_claim_control_sft.py --zip PATH

Reproduce the exact public proposal: grayscale bottom 60%, zero LSB pixels,
take union of their local Y and X coordinates. Test identical extraction on
five other, independently chosen real source pages. Then refute the claimed
Welcome Vigenere key using its original first ciphertext rune.

Sources:
  nexon33/cicada3301/EXTRACTION_DOCUMENTATION.md (2025-10-28)
  nexon33/cicada3301/FINAL_COMPLETE_SOLUTION.md (2025-10-28)
  resources/liber-primus/{17,32,58,72,73,74}.jpg
  resources/transcriptions/liber_primus_master.txt
No decoding model is fitted and no derived source bytes are modified.
"""

import argparse
import io
import json
import zipfile
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CLAIMED_WELCOME = np.array([62, 102, 115, 181, 217, 218, 333, 566, 596, 625, 689])
CLAIMED_KEY = [4, 15, 28, 7, 14, 15, 14, 15, 16, 16, 22]
CLAIMED_SKIPS = [29, 34, 52, 57, 66, 71, 103, 108, 113, 128, 142]


def original_bytes(page: int, source_zip: Path | None) -> bytes:
    filename = f"{page+17:02d}.jpg"
    if source_zip:
        with zipfile.ZipFile(source_zip) as archive:
            return archive.read(f"liber-primus-jpegs/{filename}")
    return (ROOT / "resources" / "liber-primus" / filename).read_bytes()


def public_extraction(page: int, source_zip: Path | None) -> dict:
    with Image.open(io.BytesIO(original_bytes(page, source_zip))) as image:
        grayscale = np.asarray(image.convert("L"))
    assert grayscale.shape == (3600, 2400), (page, grayscale.shape)
    cropped = grayscale[int(grayscale.shape[0] * 0.4):]
    y, x = np.where((cropped & 1) == 0)
    union = np.union1d(np.unique(y), np.unique(x))
    first20 = union[:20].tolist()
    hits = CLAIMED_WELCOME[np.isin(CLAIMED_WELCOME, union)].tolist()
    at333 = int(np.count_nonzero(y == 333) + np.count_nonzero(x == 333))
    return {
        "page": page,
        "extracted_indices": int(union.size),
        "coordinate_range": [int(union[0]), int(union[-1])],
        "lsb_zero_pixels": int(x.size),
        "first20": first20,
        "published_welcome_index_hits": hits,
        "key_index_333_frequency": at333
    }


def source_welcome_first_rune() -> dict:
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    master = (ROOT / "resources/transcriptions/liber_primus_master.txt").read_text(encoding="utf-8")
    welcome_page = master.split("%")[2]
    original_runes = [char for char in welcome_page if char in corpus["runes"]]
    assert "".join(original_runes[:7]) == "ᚢᛠᛝᛋᛇᚠᚳ"
    original_first_index = corpus["runes"].index(original_runes[0])
    assert original_first_index == 1
    assert min(CLAIMED_SKIPS) > 0
    candidate_index = (original_first_index - CLAIMED_KEY[0]) % 29
    decoded_first = corpus["translit"][candidate_index]
    expected_index = corpus["translit"].index("W")
    assert (candidate_index, decoded_first, expected_index) == (26, "Y", 7)
    return {
        "historical_solved_section": "WELCOME",
        "first_cipher_rune": original_runes[0],
        "first_cipher_index": original_first_index,
        "published_key_first_value": CLAIMED_KEY[0],
        "published_first_skip": min(CLAIMED_SKIPS),
        "published_decoder_first_output": decoded_first,
        "historical_plaintext_first_output": "W",
        "same_first_rune": candidate_index == expected_index
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--zip", type=Path)
    args = ap.parse_args()

    # Frozen target p57 and genuine-image controls. P15 is itself a maths
    # illustration page; P41 and P55 contain ciphertext, P56 solved text.
    pages = [57, 15, 41, 55, 0, 56]
    rows = [public_extraction(page, args.zip) for page in pages]
    expected = {
        57: (1543, 8, 484),
        15: (1766, 11, 393),
        41: (2272, 11, 330),
        55: (2304, 11, 558),
        0: (2077, 11, 342),
        56: (1511, 5, 0)
    }
    for row in rows:
        n, hits, freq333 = expected[row["page"]]
        assert row["extracted_indices"] == n, row
        assert len(row["published_welcome_index_hits"]) == hits, row
        assert row["key_index_333_frequency"] == freq333, row

    assert rows[0]["first20"] == list(range(20))
    assert rows[0]["coordinate_range"] == [0, 1791]
    assert len(rows[0]["published_welcome_index_hits"]) == 8
    assert len(rows[1]["published_welcome_index_hits"]) == 11

    first_rune = source_welcome_first_rune()
    assert not first_rune["same_first_rune"]

    print(json.dumps({
        "target": "external Page57 LSB master-index and Welcome-key claims",
        "literal_pixel_rule_reproduced": True,
        "original_image_controls": rows,
        "original_solved_WELCOME_first_rune_gate": first_rune,
        "decision": "The extraction is a nonselective coordinate occupancy statistic; the published key also fails authentic first-rune decryption."
    }, indent=2))


if __name__ == "__main__":
    main()
