/* Authenticated LP1 illustration parent vs LP2 native JPEG-block phase.
 * No source mutation. Input: repository resources/liber-primus JPEG directory.
 * Uses libjpeg jpeg_read_coefficients on original 2400x3600 scans.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>

typedef struct {
  struct jpeg_decompress_struct jpeg;
  struct jpeg_error_mgr error;
  FILE *input;
  jvirt_barray_ptr *coeff;
} Source;

static void open_source(Source *s, const char *dir, int scan) {
  char path[4096];
  memset(s, 0, sizeof(*s));
  snprintf(path, sizeof(path), "%s/%02d.jpg", dir, scan);
  s->input = fopen(path, "rb");
  if (!s->input) { perror(path); exit(2); }
  s->jpeg.err = jpeg_std_error(&s->error);
  jpeg_create_decompress(&s->jpeg);
  jpeg_stdio_src(&s->jpeg, s->input);
  if (jpeg_read_header(&s->jpeg, TRUE) != JPEG_HEADER_OK) exit(3);
  if (s->jpeg.image_width != 2400 || s->jpeg.image_height != 3600) exit(4);
  s->coeff = jpeg_read_coefficients(&s->jpeg);
  if (s->jpeg.comp_info[0].width_in_blocks != 300) exit(5);
}
static void close_source(Source *s) {
  jpeg_finish_decompress(&s->jpeg);
  jpeg_destroy_decompress(&s->jpeg);
  fclose(s->input);
}
static int mod8(int n) { return ((n % 8) + 8) % 8; }

int main(int argc, char **argv) {
  const char *dir = argc > 1 ? argv[1] : "resources/liber-primus";
  Source p09, p16, p19;
  long compared = 0, different = 0;
  open_source(&p09, dir, 9);
  open_source(&p16, dir, 16);
  open_source(&p19, dir, 19);
  if (!p09.jpeg.quant_tbl_ptrs[0] || !p16.jpeg.quant_tbl_ptrs[0] ||
      !p19.jpeg.quant_tbl_ptrs[0]) exit(6);
  if (memcmp(p09.jpeg.quant_tbl_ptrs[0]->quantval,
             p16.jpeg.quant_tbl_ptrs[0]->quantval, sizeof(p09.jpeg.quant_tbl_ptrs[0]->quantval)) ||
      memcmp(p09.jpeg.quant_tbl_ptrs[0]->quantval,
             p19.jpeg.quant_tbl_ptrs[0]->quantval, sizeof(p09.jpeg.quant_tbl_ptrs[0]->quantval))) exit(7);

  /* LP1 scan09 insect [835,1935] 690x185 is an exact gray-pixel copy in
   * LP1 scan16 [859,1455]. dx=+24, dy=-480 preserve both 8x8 phases. */
  for (int y = 1944; y + 7 < 2120; y += 8) {
    const int y2 = y - 480;
    JBLOCKARRAY a = (*p09.jpeg.mem->access_virt_barray)(
      (j_common_ptr)&p09.jpeg, p09.coeff[0], (JDIMENSION)(y/8), 1, FALSE);
    JBLOCKARRAY b = (*p16.jpeg.mem->access_virt_barray)(
      (j_common_ptr)&p16.jpeg, p16.coeff[0], (JDIMENSION)(y2/8), 1, FALSE);
    for (int x = 840; x + 7 < 1525; x += 8) {
      for (int k = 0; k < 64; ++k) {
        if (a[0][x/8][k] != b[0][(x+24)/8][k]) ++different;
        ++compared;
      }
    }
  }
  if (compared != 119680 || different != 0) exit(8);
  printf("LP1 09->16 native-grid positive: %ld Y DCT coefficients, %ld differences\n", compared, different);

  /* All exactly documented same-size LP1 parents of the LP2 p2 insect.
   * For horizontal mirror x_target=t-x_source, whole-block alignment
   * requires t mod8=7; for ordinary translation dx mod8=0.
   * In both cases vertical shift dy must be divisible by 8.
   * The coordinates and 690x185 outline are established by the independent
   * original raster source test lp1_lp2_illustration_raster_reuse_sft.py.
   */
  const struct { int scan, sx, sy, tx, ty, mirror; } parent[] = {
    {9, 835, 1935, 876, 2642, 1},
    {13, 851, 1079, 876, 2642, 0},
    {16, 859, 1455, 876, 2642, 1}
  };
  int comparable = 0;
  for (unsigned i = 0; i < sizeof(parent)/sizeof(parent[0]); ++i) {
    const int horizontal = parent[i].mirror
      ? parent[i].sx + parent[i].tx + 690 - 1
      : parent[i].tx - parent[i].sx;
    const int horizontal_phase = mod8(horizontal);
    const int vertical_phase = mod8(parent[i].ty - parent[i].sy);
    const int horizontal_valid = parent[i].mirror
      ? horizontal_phase == 7 : horizontal_phase == 0;
    const int valid = horizontal_valid && vertical_phase == 0;
    comparable += valid;
    printf("LP1 %02d->LP2 p2: %s transform=%d mod8=%d; dy mod8=%d; native-grid=%s\n",
      parent[i].scan, parent[i].mirror ? "mirror" : "translate",
      horizontal, horizontal_phase, vertical_phase, valid ? "YES" : "NO");
  }
  if (comparable) exit(9);
  printf("DECISION: 0/3 exact same-size LP1 insect parents are native-DCT comparable to original LP2 p2.\n");
  close_source(&p19); close_source(&p16); close_source(&p09);
  return 0;
}
