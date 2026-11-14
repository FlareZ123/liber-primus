#!/usr/bin/env python3
"""Direct 512-bit hash gate for first-release LP1 page bytes and p05 payload.

Run at repository root:
  python3 sims/anend_lp1_page_payload_hash_gate.py --whirlpool

The default source is resources/liber-primus. --source can point to a folder
containing the exact 00.jpg..16.jpg files. Whirlpool requires OpenSSL 3's
legacy provider; the other four algorithms use Python hashlib.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess

TARGET = ("36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09"
          "a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4")
EXPECTED_SHA256 = {
    "00.jpg": "184e6f9de8695d99435c2bef4fd7e304a8a0f704dbe04439fa8bf13c4da395a7",
    "01.jpg": "71f4bd03c692ede630091272597d2b18702184ed32fdd1977ef0ba7306632b46",
    "02.jpg": "0297572bbc2d234f84df634c6f0474011ff5df66c2ce987c3bb7aa0c635799b4",
    "03.jpg": "b8b142f9b7854ec4f240e076cad03a98a2e3e9cf7c20f1da4fcde1ed25e3be3f",
    "04.jpg": "745c6a46f67de1e5a2a9ac76175c323af82c2432e3b7483a8dc6244f8de9478f",
    "05.jpg": "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7",
    "06.jpg": "913e26462e51942f49ca3ce2e94ef56c5fb65110814442dccc02b0d88af2c5ca",
    "07.jpg": "b50c1536ea1f30847e7875835991d52951bafb599fb1ab04eb78c5c6e6c2b468",
    "08.jpg": "f0edba1084df9983353c11544bbf711f94ed7649edbf94b426c9b78549b64557",
    "09.jpg": "975cda73bbf829b2775f25beb609d34fa429728b2f2a4ce863c129b10b005089",
    "10.jpg": "12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376",
    "11.jpg": "7bd11a2c9f5b512e33c9db170756e3b34cc1e29eb405373eb94957383a61be7d",
    "12.jpg": "a5b58076e169f3f59c8a394dbef37da18226c9c4fff703df3be8dc95cf16291c",
    "13.jpg": "bef0fc4867c2363c835eb4f08029a1eba35c925e2f72659d7353cf8a91089e56",
    "14.jpg": "de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e",
    "15.jpg": "f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9",
    "16.jpg": "984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe",
}


def whirlpool(data):
    out = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool"],
        input=data, capture_output=True, check=True
    ).stdout.decode("ascii").strip().split()[-1].lower()
    if len(out) != 128:
        raise RuntimeError(f"unexpected Whirlpool output: {out}")
    return out


def algorithms(include_whirlpool):
    funcs = {
        "sha512": lambda b: hashlib.sha512(b).hexdigest(),
        "sha3_512": lambda b: hashlib.sha3_512(b).hexdigest(),
        "blake2b_512": lambda b: hashlib.blake2b(b, digest_size=64).hexdigest(),
        "shake256_512": lambda b: hashlib.shake_256(b).hexdigest(64),
    }
    assert funcs["sha512"](b"abc") == "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
    assert funcs["sha3_512"](b"abc") == "b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0"
    assert funcs["blake2b_512"](b"abc") == "ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d17d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923"
    assert funcs["shake256_512"](b"abc") == "483366601360a8771c6863080cc4114d8db44530f8f1e1ee4f94ea37e78b5739d5a15bef186a5386c75744c0527e1faa9f8726e462a12a4feb06bd8801e751e4"
    if include_whirlpool:
        assert whirlpool(b"abc") == "4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4c7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5"
        funcs["whirlpool"] = whirlpool
    return funcs


def p05_components(data):
    assert hashlib.sha256(data).hexdigest() == EXPECTED_SHA256["05.jpg"]
    eoi = data.index(bytes([0xff, 0xd9]))
    assert eoi == 336351
    jpeg = data[:eoi + 2]
    center = data[len(jpeg):len(data) - len(jpeg)]
    reverse_jpeg = data[-len(jpeg):]
    assert len(jpeg) == len(reverse_jpeg) == 336353 and len(center) == 360
    assert reverse_jpeg == jpeg[::-1]
    assert center[:2] == bytes([10, 10])
    hex_text = center[2:].decode("ascii")
    assert re.fullmatch(r"[0-9a-f]{358}", hex_text)
    payload = bytes.fromhex(hex_text)
    assert len(payload) == 179
    assert hashlib.sha256(payload).hexdigest() == "82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa"
    swap = lambda value: ((value & 15) << 4) | (value >> 4)
    intermediate = bytes(swap(value) for value in payload)
    assert hashlib.sha256(intermediate).hexdigest() == "a0af4d3ce0c360da421d2868b04c3c0e771eeeed9799742c6841a0ceed67885c"
    readable = intermediate.decode("ascii")
    assert readable.startswith("\n") and len(readable) == 179
    final_text = re.sub(r"\d+", lambda match: match.group(0)[::-1], readable).encode("ascii")
    assert len(final_text) == 179
    assert hashlib.sha256(final_text).hexdigest() == "71344b0cee96421c1df9a338c08380be5307d790535b502d3f8451c8dd17441b"
    rows = [list(map(int, re.split(r"\s+", line.strip())))
            for line in final_text.decode("ascii").strip().splitlines()]
    expected = [
        [272, 138, 341, 131, 151],
        [366, 199, 130, 320, 18],
        [226, 245, 91, 245, 226],
        [18, 320, 130, 199, 366],
        [151, 131, 341, 138, 272],
    ]
    assert rows == expected
    sums = ([sum(row) for row in rows] +
            [sum(rows[r][c] for r in range(5)) for c in range(5)] +
            [sum(rows[i][i] for i in range(5)), sum(rows[i][4-i] for i in range(5))])
    assert sums == [1033] * 12
    return {
        "jpeg_segment336353": jpeg,
        "reversed_jpeg_tail336353": reverse_jpeg,
        "center360": center,
        "hex_text358": hex_text.encode("ascii"),
        "decoded_payload179": payload,
        "nibble_swapped_intermediate179": intermediate,
        "final_square_text179": final_text,
    }, {"jpeg_bytes": len(jpeg), "center_bytes": len(center),
        "hex_text_chars": len(hex_text), "payload_bytes": len(payload),
        "nibble_swapped_bytes": len(intermediate), "final_square_text_bytes": len(final_text),
        "magic_constant": 1033}


def p10_components(source):
    data = (source / "10.jpg").read_bytes()
    sois = [m.start() for m in re.finditer(bytes([255, 216]), data)]
    eois = [m.start() for m in re.finditer(bytes([255, 217]), data)]
    assert sois == [0, 754662, 1467395, 2170823]
    assert eois == [754660, 1467393, 2170821, 4240955]
    segments = [data[s:e + 2] for s, e in zip(sois, eois)]
    assert [len(x) for x in segments] == [754662, 712733, 703428, 2070134]
    for page, segment in enumerate(segments[1:], start=11):
        assert segment == (source / f"{page:02d}.jpg").read_bytes()
    assert hashlib.sha256(segments[0]).hexdigest() == "07910a858c17314c72c1af0fda25f8a04e5a700a71e25661111fc7bcf87e5210"
    tail = b"".join(segments[1:])
    assert hashlib.sha256(tail).hexdigest() == "8c90214a46cb6fa563bcfb46012c1cf7c4dcbd9d1db62c37c856074c756aafff"
    return {
        "jpeg_segment0_754662": segments[0],
        "tail_pages11_13_3486295": tail,
    }, {"file_bytes": len(data), "jpeg_offsets": sois, "eoi_offsets": eois,
        "segment_bytes": [len(x) for x in segments],
        "trailing_segments_equal_standalone_pages": [11, 12, 13]}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path,
                        default=Path(__file__).resolve().parents[1] / "resources" / "liber-primus")
    parser.add_argument("--whirlpool", action="store_true")
    args = parser.parse_args()
    funcs = algorithms(args.whirlpool)
    matches, page_rows, component_rows = [], [], []
    for page in range(17):
        name = f"{page:02d}.jpg"
        data = (args.source / name).read_bytes()
        sha256 = hashlib.sha256(data).hexdigest()
        assert sha256 == EXPECTED_SHA256[name], f"source mismatch: {name}"
        hit = [alg for alg, fn in funcs.items() if fn(data).lower() == TARGET]
        matches.extend({"candidate": name, "algorithm": alg} for alg in hit)
        page_rows.append({"file": name, "bytes": len(data), "sha256": sha256, "matches": hit})

    p05_objects, p05_envelope = p05_components((args.source / "05.jpg").read_bytes())
    p10_objects, p10_structure = p10_components(args.source)
    for name, data in {**p05_objects, **p10_objects}.items():
        hit = [alg for alg, fn in funcs.items() if fn(data).lower() == TARGET]
        matches.extend({"candidate": name, "algorithm": alg} for alg in hit)
        component_rows.append({"candidate": name, "bytes": len(data), "matches": hit})

    comparisons = (len(page_rows) + len(component_rows)) * len(funcs)
    assert comparisons == (130 if args.whirlpool else 104)
    assert not matches
    print(json.dumps({
        "target": TARGET, "source": str(args.source),
        "algorithms": list(funcs), "raw_lp1_pages": len(page_rows),
        "p05_exact_components": len(p05_objects), "p10_exact_components": len(p10_objects),
        "comparisons": comparisons, "matches": matches,
        "p05_envelope": p05_envelope, "p10_structure": p10_structure,
        "pages": page_rows, "components": component_rows,
    }, indent=2))


if __name__ == "__main__":
    main()
