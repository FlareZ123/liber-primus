"""Build a deterministic source-only blind packet from the original archive or scan directory."""
import argparse
import hashlib
from pathlib import Path
from zipfile import ZIP_STORED, ZipFile, ZipInfo

HERE = Path(__file__).resolve().parent


def build(source: Path, output: Path) -> str:
    names = ('66.jpg', '67.jpg', '68.jpg')
    if source.is_dir():
        scans = [(source / name).read_bytes() for name in names]
    else:
        with ZipFile(source) as archive:
            scans = [archive.read(next(path for path in archive.namelist()
                                       if path.rsplit('/', 1)[-1] == name)) for name in names]
    payload = [(name, (HERE / name).read_bytes())
               for name in ('instructions.md', 'historical-context.md')]
    images = [(f'images/{index:02d}.jpg', data) for index, data in enumerate(scans, 1)]
    checksums = ''.join(f'{hashlib.sha256(data).hexdigest()}  {name}\n' for name, data in images)
    payload.extend(images)
    payload.append(('image-sha256.txt', checksums.encode('ascii')))
    with ZipFile(output, 'w', compression=ZIP_STORED) as archive:
        for name, data in payload:
            info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
    with ZipFile(output) as archive:
        assert archive.testzip() is None
        assert [(name, archive.read(name)) for name, _ in payload] == payload
    print(checksums, end='')
    return hashlib.sha256(output.read_bytes()).hexdigest()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Original scan directory or ZIP')
    parser.add_argument('output', type=Path, help='Destination packet ZIP')
    args = parser.parse_args()
    print('Packet SHA-256:', build(args.source, args.output))
