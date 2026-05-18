from __future__ import annotations

import argparse
import bz2
import json
import struct
import sys
import zlib
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT_DIR / "assets" / "hero_siege"
OUTPUT_DIR = ROOT_DIR / "public" / "hero_siege_yytex_atlases"
MANIFEST_PATH = ROOT_DIR / "data" / "heroSiegeYytexAtlases.json"
QOI_INDEX_SIZE = 64
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert Hero Siege .yytex atlases into PNG atlases.")
    parser.add_argument("--limit", type=int, default=0, help="Convert only the first N yytex files.")
    parser.add_argument("--force", action="store_true", help="Overwrite existing PNG files.")
    args = parser.parse_args()

    if not SOURCE_DIR.exists():
        print(f"Missing source folder: {SOURCE_DIR}", file=sys.stderr)
        return 1

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)

    yytex_files = sorted(SOURCE_DIR.glob("*.yytex"))
    if args.limit > 0:
        yytex_files = yytex_files[: args.limit]

    atlases = []
    failures = []
    for index, yytex_path in enumerate(yytex_files, start=1):
        png_name = f"{yytex_path.stem}.png"
        png_path = OUTPUT_DIR / png_name
        try:
            header = read_yytex_header(yytex_path)
            if args.force or not png_path.exists():
                rgba = decode_yytex(yytex_path, header)
                write_png(png_path, header["width"], header["height"], rgba)
            atlases.append(
                {
                    "height": header["height"],
                    "name": yytex_path.name,
                    "path": f"hero_siege_yytex_atlases/{png_name}",
                    "sourceSize": yytex_path.stat().st_size,
                    "width": header["width"],
                }
            )
            print(f"[{index}/{len(yytex_files)}] {yytex_path.name} -> {png_name}")
        except Exception as error:  # noqa: BLE001 - importer should continue and report every bad file.
            failures.append({"name": yytex_path.name, "error": str(error)})
            print(f"[{index}/{len(yytex_files)}] failed {yytex_path.name}: {error}", file=sys.stderr)

    manifest = {
        "atlases": atlases,
        "failures": failures,
        "sourceDirectory": str(SOURCE_DIR),
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(atlases)} atlas entries to {MANIFEST_PATH}")
    if failures:
        print(f"{len(failures)} files failed to import.", file=sys.stderr)
        return 1
    return 0


def read_yytex_header(path: Path) -> dict[str, int]:
    data = path.read_bytes()
    if len(data) < 12:
        raise ValueError("file is too small")
    magic = data[:4]
    if magic != b"2zoq":
        raise ValueError(f"unsupported yytex magic {magic!r}")
    width = int.from_bytes(data[4:6], "little")
    height = int.from_bytes(data[6:8], "little")
    decompressed_size = int.from_bytes(data[8:12], "little")
    return {"decompressedSize": decompressed_size, "height": height, "width": width}


def decode_yytex(path: Path, header: dict[str, int]) -> bytearray:
    data = path.read_bytes()
    decompressed = bz2.decompress(data[12:])
    if len(decompressed) != header["decompressedSize"]:
        raise ValueError(f"unexpected decompressed size {len(decompressed)} != {header['decompressedSize']}")
    if decompressed[:4] != b"fioq":
        raise ValueError(f"unsupported texture payload magic {decompressed[:4]!r}")
    payload_size = int.from_bytes(decompressed[8:12], "little")
    if payload_size != len(decompressed) - 12:
        raise ValueError(f"unexpected QOI payload size {payload_size} != {len(decompressed) - 12}")
    return decode_qoi_payload(decompressed[12:], header["width"], header["height"])


def decode_qoi_payload(payload: bytes, width: int, height: int) -> bytearray:
    pixel_count = width * height
    output = bytearray(pixel_count * 4)
    index = [(0, 0, 0, 0)] * QOI_INDEX_SIZE
    px = [0, 0, 0, 255]
    output_pos = 0
    payload_pos = 0

    while output_pos < len(output):
        if payload_pos >= len(payload):
            raise ValueError("QOIF payload ended before all pixels were decoded")

        opcode = payload[payload_pos]
        payload_pos += 1

        if opcode & 0x80:
            if not opcode & 0x40:
                px[0] = (px[0] + sign_extend((opcode >> 4) & 0x03, 2)) & 0xFF
                px[1] = (px[1] + sign_extend((opcode >> 2) & 0x03, 2)) & 0xFF
                px[2] = (px[2] + sign_extend(opcode & 0x03, 2)) & 0xFF
            elif not opcode & 0x20:
                if payload_pos >= len(payload):
                    raise ValueError("QOIF 2-byte diff opcode is missing its second byte")
                opcode2 = payload[payload_pos]
                payload_pos += 1
                px[0] = (px[0] + sign_extend(opcode & 0x1F, 5)) & 0xFF
                px[1] = (px[1] + sign_extend((opcode2 >> 4) & 0x0F, 4)) & 0xFF
                px[2] = (px[2] + sign_extend(opcode2 & 0x0F, 4)) & 0xFF
            elif not opcode & 0x10:
                if payload_pos + 1 >= len(payload):
                    raise ValueError("QOIF 3-byte diff opcode is missing payload bytes")
                opcode2 = payload[payload_pos]
                opcode3 = payload[payload_pos + 1]
                payload_pos += 2
                packed = (opcode << 16) | (opcode2 << 8) | opcode3
                px[0] = (px[0] + sign_extend((packed >> 15) & 0x1F, 5)) & 0xFF
                px[1] = (px[1] + sign_extend((packed >> 10) & 0x1F, 5)) & 0xFF
                px[2] = (px[2] + sign_extend((packed >> 5) & 0x1F, 5)) & 0xFF
                px[3] = (px[3] + sign_extend(packed & 0x1F, 5)) & 0xFF
            else:
                if opcode & 0x08:
                    px[0] = payload[payload_pos]
                    payload_pos += 1
                if opcode & 0x04:
                    px[1] = payload[payload_pos]
                    payload_pos += 1
                if opcode & 0x02:
                    px[2] = payload[payload_pos]
                    payload_pos += 1
                if opcode & 0x01:
                    px[3] = payload[payload_pos]
                    payload_pos += 1

            index[qoi_color_hash(px)] = tuple(px)
            output_pos = write_pixel(output, output_pos, px)
        else:
            run = 0
            if not opcode & 0x40:
                px = list(index[opcode])
            elif not opcode & 0x20:
                run = opcode & 0x1F
            else:
                if payload_pos >= len(payload):
                    raise ValueError("QOIF long-run opcode is missing its second byte")
                run = ((opcode & 0x1F) << 8 | payload[payload_pos]) + 32
                payload_pos += 1

            for _ in range(run + 1):
                output_pos = write_pixel(output, output_pos, px)
                if output_pos >= len(output):
                    break

    return output


def qoi_color_hash(px: list[int]) -> int:
    return (px[0] ^ px[1] ^ px[2] ^ px[3]) % QOI_INDEX_SIZE


def sign_extend(value: int, bits: int) -> int:
    sign_bit = 1 << (bits - 1)
    return (value ^ sign_bit) - sign_bit


def write_pixel(output: bytearray, output_pos: int, px: list[int]) -> int:
    if output_pos + 4 > len(output):
        return len(output)
    output[output_pos : output_pos + 4] = bytes(px)
    return output_pos + 4


def write_png(path: Path, width: int, height: int, rgba: bytearray) -> None:
    stride = width * 4
    raw = bytearray((stride + 1) * height)
    for row in range(height):
        source_start = row * stride
        target_start = row * (stride + 1)
        raw[target_start] = 0
        raw[target_start + 1 : target_start + 1 + stride] = rgba[source_start : source_start + stride]

    chunks = [
        png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)),
        png_chunk(b"IDAT", zlib.compress(bytes(raw), level=9)),
        png_chunk(b"IEND", b""),
    ]
    path.write_bytes(PNG_SIGNATURE + b"".join(chunks))


def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    checksum = zlib.crc32(chunk_type)
    checksum = zlib.crc32(data, checksum) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", checksum)


if __name__ == "__main__":
    raise SystemExit(main())
