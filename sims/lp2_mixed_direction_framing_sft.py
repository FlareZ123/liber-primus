"""2014 second-onion JPEG framing control and fixed LP2 table receiver gate."""
import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile

SOI = b'\xff\xd8'
EOI = b'\xff\xd9'
REV_EOI = EOI[::-1]
COMPLEMENT = bytes(x ^ 255 for x in range(256))


def git_blob(data):
    return hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()


def jpeg_end(data, start=0):
    """Return exclusive EOI for a structurally framed JPEG; no raw-marker search."""
    if data[start:start + 2] != SOI:
        raise ValueError('no forward SOI')
    i = start + 2
    scan = False
    while i < len(data):
        if scan:
            i = data.find(b'\xff', i)
            if i < 0:
                break
        elif data[i] != 255:
            raise ValueError('expected JPEG marker')
        while i < len(data) and data[i] == 255:
            i += 1
        if i >= len(data):
            break
        marker = data[i]
        i += 1
        if scan and (marker == 0 or 208 <= marker <= 215):
            continue
        if marker == 217:
            return i
        scan = False
        if marker == 1:
            continue
        if marker in (0, 216) or 208 <= marker <= 215 or i + 2 > len(data):
            raise ValueError('invalid marker')
        size = int.from_bytes(data[i:i + 2], 'big')
        if size < 2 or i + size > len(data):
            raise ValueError('invalid segment length')
        i += size
        scan = marker == 218
    raise ValueError('missing EOI')


def historical_reader(data):
    """Historical grammar: complement, consume forward JPEGs, then reverse terminal JPEG."""
    data = data.translate(COMPLEMENT)
    parts = []
    directions = []
    i = 0
    while i < len(data):
        if data[i:i+2] == SOI:
            end = jpeg_end(data, i)
            parts.append(data[i:end]); directions.append('+'); i = end
        elif data[i:i+2] == REV_EOI:
            part = data[i:][::-1]
            if jpeg_end(part) != len(part):
                raise ValueError('reverse suffix is not one complete JPEG')
            parts.append(part); directions.append('-'); i = len(data)
        else:
            raise ValueError(f'no typed boundary at {i}: {data[i:i+2].hex()}')
    return parts, directions


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--zip', type=Path)
    parser.add_argument('--grid', type=Path, default=Path('resources/liber-primus/base60-grid.json'))
    parser.add_argument('--images', type=Path, default=Path('resources/liber-primus'))
    args = parser.parse_args()
    names = [f'{i:02}.jpg' for i in range(3)]
    if args.zip:
        with ZipFile(args.zip) as z:
            images = [z.read(f'liber-primus-jpegs/{name}') for name in names]
    else:
        images = [(args.images / name).read_bytes() for name in names]
    framed = images[0] + images[1] + images[2][::-1]
    carrier = framed.translate(COMPLEMENT)
    assert git_blob(framed) == '0a8cbaca3f3ab80e2315cc60b28b4ecb21096b65'
    assert git_blob(carrier) == 'df7bb000fd295987ca37351b9cceb154569153f6'
    recovered, directions = historical_reader(carrier)
    assert recovered == images and directions == ['+', '+', '-']
    offsets = [0]
    for part in recovered:
        offsets.append(offsets[-1] + len(part))
    assert offsets == [0, 168876, 1645490, 1820649]
    print(json.dumps({'control': {'offsets': offsets, 'directions': directions,
                                  'archive_git_blob': git_blob(carrier),
                                  'complemented_git_blob': git_blob(framed)}}))
    all_forward = b''.join(images).translate(COMPLEMENT)
    parts, flags = historical_reader(all_forward)
    assert parts == images and flags == ['+', '+', '+']
    try:
        historical_reader((images[0][::-1] + images[1] + images[2]).translate(COMPLEMENT))
    except ValueError as exc:
        print('wrong-law control rejected:', exc)
    else:
        raise AssertionError('unexpected wrong-law acceptance')

    grid = json.loads(args.grid.read_text(encoding='utf-8'))
    assert len(grid['rows']) == 32 and all(len(row) == 8 for row in grid['rows'])
    alpha = grid['alphabet']
    values = [alpha.index(t[0])*len(alpha) + alpha.index(t[1]) for row in grid['rows'] for t in row]
    assert values == [v for row in grid['byte_rows'] for v in row]
    tape = bytes(values)
    markers = {'SOI': SOI, 'reverse_EOI': REV_EOI, 'EOI': EOI, 'reverse_SOI': SOI[::-1]}
    results = {}
    for label, data in [('literal', tape), ('historical_complement', tape.translate(COMPLEMENT))]:
        found = {name: [i for i in range(len(data)-1) if data[i:i+2] == marker]
                 for name, marker in markers.items()}
        results[label] = {'prefix': data[:4].hex(), 'suffix': data[-4:].hex(), 'markers': found}
        assert not any(found.values())
    try:
        historical_reader(tape)
    except ValueError as exc:
        results['fixed_inverse'] = str(exc)
    else:
        raise AssertionError('unexpected LP2 grammar match')
    print(json.dumps({'original_p49_51': results}, indent=2))


if __name__ == '__main__':
    main()
