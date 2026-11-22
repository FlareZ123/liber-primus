/* Original-LP2 JPEG blank-field chroma gate.
 * Build: cc -O2 -Wall -Wextra sims/jpeg_blank_chroma_gate.c -ljpeg -o jpeg_blank_chroma_gate
 * Run: jpeg_blank_chroma_gate resources/liber-primus
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>

#define START_IMAGE 17
#define END_IMAGE 74
#define WIDTH 2400
#define HEIGHT 3600
#define BLOCK_PIXEL 16
#define THRESHOLD 235

typedef struct {
  unsigned char *ink;
  unsigned char *chroma;
  int width;
  int height;
} BlockMap;

static int near_ink(const BlockMap *m, int x, int y) {
  int yy, xx;
  for (yy = y - 1; yy <= y + 1; ++yy) {
    if (yy < 0 || yy >= m->height) continue;
    for (xx = x - 1; xx <= x + 1; ++xx) {
      if (xx >= 0 && xx < m->width && m->ink[yy * m->width + xx]) return 1;
    }
  }
  return 0;
}

static void fail(const char *message) {
  fprintf(stderr, "ERROR %s\n", message);
  exit(1);
}

/* Quantized nonzero chroma coefficients beyond one 16x16 block from source ink. */
static unsigned long count_blank_chroma(const BlockMap *m) {
  unsigned long count = 0;
  int x, y;
  for (y = 0; y < m->height; ++y) {
    for (x = 0; x < m->width; ++x) {
      int k = y * m->width + x;
      if (m->chroma[k] && !near_ink(m, x, y)) ++count;
    }
  }
  return count;
}

static void audit_one(const char *path, int image_no,
                      unsigned long *block_count,
                      unsigned long *total_nonzero,
                      unsigned long *total_distant) {
  FILE *fp = fopen(path, "rb");
  struct jpeg_decompress_struct j;
  struct jpeg_error_mgr err;
  jvirt_barray_ptr *arrays;
  BlockMap map = {0};
  int c, x, y;
  unsigned long nonzero = 0, distant;
  if (!fp) fail("cannot open JPEG for coefficients");
  j.err = jpeg_std_error(&err);
  jpeg_create_decompress(&j);
  jpeg_stdio_src(&j, fp);
  jpeg_read_header(&j, TRUE);
  if (j.image_width != WIDTH || j.image_height != HEIGHT) fail("unexpected source size");
  if (j.num_components == 1) {
    jpeg_destroy_decompress(&j);
    fclose(fp);
    return;
  }
  if (j.num_components != 3) fail("unexpected component count");
  arrays = jpeg_read_coefficients(&j);
  map.width = (int)j.comp_info[1].width_in_blocks;
  map.height = (int)j.comp_info[1].height_in_blocks;
  if (map.width != WIDTH / BLOCK_PIXEL || map.height != HEIGHT / BLOCK_PIXEL ||
      j.comp_info[2].width_in_blocks != (JDIMENSION)map.width ||
      j.comp_info[2].height_in_blocks != (JDIMENSION)map.height)
    fail("expected 4:2:0 JPEG chroma blocks");
  map.ink = calloc((size_t)map.width * map.height, 1);
  map.chroma = calloc((size_t)map.width * map.height, 1);
  if (!map.ink || !map.chroma) fail("allocation failure");
  for (c = 1; c <= 2; ++c) {
    for (y = 0; y < map.height; ++y) {
      JBLOCKARRAY row = (*j.mem->access_virt_barray)(
        (j_common_ptr)&j, arrays[c], (JDIMENSION)y, 1, FALSE);
      for (x = 0; x < map.width; ++x) {
        int z;
        for (z = 0; z < DCTSIZE2; ++z) {
          if (row[0][x][z]) {
            map.chroma[y * map.width + x] = 1;
            break;
          }
        }
      }
    }
  }
  jpeg_destroy_decompress(&j);
  fclose(fp);

  fp = fopen(path, "rb");
  if (!fp) fail("cannot open JPEG for pixels");
  j.err = jpeg_std_error(&err);
  jpeg_create_decompress(&j);
  jpeg_stdio_src(&j, fp);
  jpeg_read_header(&j, TRUE);
  j.out_color_space = JCS_RGB;
  jpeg_start_decompress(&j);
  if (j.output_width != WIDTH || j.output_height != HEIGHT || j.output_components != 3)
    fail("unexpected decoded source shape");
  {
    JSAMPARRAY line = (*j.mem->alloc_sarray)((j_common_ptr)&j, JPOOL_IMAGE,
                                              WIDTH * 3, 1);
    while (j.output_scanline < HEIGHT) {
      int yy, by;
      jpeg_read_scanlines(&j, line, 1);
      yy = (int)j.output_scanline - 1;
      by = yy / BLOCK_PIXEL;
      for (x = 0; x < WIDTH; ++x) {
        JSAMPLE *rgb = &line[0][3 * x];
        if (rgb[0] < THRESHOLD || rgb[1] < THRESHOLD || rgb[2] < THRESHOLD)
          map.ink[by * map.width + (x / BLOCK_PIXEL)] = 1;
      }
    }
  }
  jpeg_finish_decompress(&j);
  jpeg_destroy_decompress(&j);
  fclose(fp);

  for (y = 0; y < map.height * map.width; ++y) nonzero += map.chroma[y] != 0;
  distant = count_blank_chroma(&map);
  *block_count += (unsigned long)map.height * map.width;
  *total_nonzero += nonzero;
  *total_distant += distant;
  printf("RGB original=%02d.jpg chroma_nonzero_blocks=%lu distant_blank_blocks=%lu\n",
         image_no, nonzero, distant);
  /* Synthetic detector control: inject one event into blank macroblock state,
     ensuring exactly one additional violation is observed. */
  {
    int planted = -1;
    for (y = 0; y < map.height * map.width; ++y) {
      x = y % map.width;
      if (!map.chroma[y] && !near_ink(&map, x, y / map.width)) {
        planted = y;
        break;
      }
    }
    if (planted < 0) fail("no blank tile for planted detector control");
    map.chroma[planted] = 1;
    if (count_blank_chroma(&map) != distant + 1)
      fail("planted blank-chroma block not detected exactly");
  }
  free(map.ink);
  free(map.chroma);
}

int main(int argc, char **argv) {
  int n, rgb = 0;
  unsigned long scanned = 0, nonzero = 0, distant = 0;
  if (argc != 2) fail("usage: jpeg_blank_chroma_gate JPEG_DIRECTORY");
  for (n = START_IMAGE; n <= END_IMAGE; ++n) {
    char path[1024];
    unsigned long before = scanned;
    int len = snprintf(path, sizeof(path), "%s/%02d.jpg", argv[1], n);
    if (len < 0 || len >= (int)sizeof(path)) fail("path too long");
    audit_one(path, n, &scanned, &nonzero, &distant);
    rgb += scanned != before;
  }
  printf("SUMMARY originals=58 RGB=%d grayscale=%d total_RGB_chroma_blocks=%lu "
         "nonzero_RGB_chroma_blocks=%lu distant_blank_chroma_blocks=%lu "
         "pixel_threshold=%d ink_halo_blocks=1 synthetic_positive=PASS\n",
         rgb, 58 - rgb, scanned, nonzero, distant, THRESHOLD);
  if (rgb != 35 || distant) fail("source census / blank-chroma gate changed");
  return 0;
}
