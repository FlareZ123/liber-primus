/* Exact JPEG source quantized-luminance check for otherwise blank paper.
 * Build: cc -O3 -Wall -Wextra -Werror sims/jpeg_blank_luma_gate.c -ljpeg -o jpeg_blank_luma_gate
 * Run: jpeg_blank_luma_gate resources/liber-primus
 * Detects nonmodal DC or nonzero AC among 8x8 luminance blocks whose
 * 3x3 block neighborhoods decode entirely to RGB 255/255/255.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>

enum { WIDTH=2400, HEIGHT=3600, BW=300, BH=450, BLOCKS=BW*BH };
static unsigned char ink[BLOCKS];
static unsigned char ac[BLOCKS];
static short dc[BLOCKS];

static void die(const char *why) { fprintf(stderr, "ERROR %s\n", why); exit(2); }

static int near_ink(int x, int y) {
  for (int dy=-1; dy<=1; dy++) {
    int yy=y+dy;
    if (yy<0 || yy>=BH) continue;
    for (int dx=-1; dx<=1; dx++) {
      int xx=x+dx;
      if (xx>=0 && xx<BW && ink[yy*BW+xx]) return 1;
    }
  }
  return 0;
}

static int unusual(int i, int modal) {
  return dc[i] != modal || ac[i] != 0;
}

static void read_source(const char *filename) {
  FILE *file=fopen(filename,"rb");
  struct jpeg_decompress_struct j;
  struct jpeg_error_mgr err;
  jvirt_barray_ptr *coeffs;
  if (!file) die("missing original JPEG");
  j.err=jpeg_std_error(&err); jpeg_create_decompress(&j);
  jpeg_stdio_src(&j,file);
  if (jpeg_read_header(&j,TRUE)!=JPEG_HEADER_OK) die("bad JPEG header");
  if (j.image_width!=WIDTH || j.image_height!=HEIGHT) die("unexpected image shape");
  coeffs=jpeg_read_coefficients(&j);
  if (j.comp_info[0].width_in_blocks!=BW ||
      j.comp_info[0].height_in_blocks!=BH) die("unexpected Y block shape");
  for (int y=0; y<BH; y++) {
    JBLOCKARRAY row=(*j.mem->access_virt_barray)(
      (j_common_ptr)&j,coeffs[0],(JDIMENSION)y,1,FALSE);
    for (int x=0; x<BW; x++) {
      int i=y*BW+x;
      dc[i]=row[0][x][0];
      ac[i]=0;
      for (int k=1; k<64; k++) {
        if (row[0][x][k]!=0) {ac[i]=1; break;}
      }
    }
  }
  jpeg_destroy_decompress(&j);
  fclose(file);

  file=fopen(filename,"rb");
  if (!file) die("cannot reopen original JPEG");
  j.err=jpeg_std_error(&err); jpeg_create_decompress(&j);
  jpeg_stdio_src(&j,file);
  if (jpeg_read_header(&j,TRUE)!=JPEG_HEADER_OK) die("bad JPEG header on decode");
  j.out_color_space=JCS_RGB;
  jpeg_start_decompress(&j);
  if (j.output_width!=WIDTH || j.output_height!=HEIGHT ||
      j.output_components!=3) die("unexpected RGB decode shape");
  memset(ink,0,sizeof(ink));
  JSAMPARRAY line=(*j.mem->alloc_sarray)(
    (j_common_ptr)&j,JPOOL_IMAGE,WIDTH*3,1);
  while (j.output_scanline<HEIGHT) {
    jpeg_read_scanlines(&j,line,1);
    int yy=(int)j.output_scanline-1;
    for (int x=0;x<WIDTH;x++) {
      JSAMPLE *rgb=line[0]+3*x;
      if (rgb[0]!=255 || rgb[1]!=255 || rgb[2]!=255)
        ink[(yy/8)*BW+x/8]=1;
    }
  }
  jpeg_finish_decompress(&j);
  jpeg_destroy_decompress(&j);
  fclose(file);
}

int main(int argc, char **argv) {
  unsigned long long total_blank=0, total_exception=0, total_ac=0;
  if (argc!=2) die("usage: jpeg_blank_luma_gate ORIGINAL_JPEG_DIRECTORY");
  for (int number=17;number<=74;number++) {
    char filename[4096];
    int len=snprintf(filename,sizeof(filename),"%s/%02d.jpg",argv[1],number);
    if (len<0 || len>=(int)sizeof(filename)) die("path buffer exceeded");
    read_source(filename);
    unsigned long histogram[65536]={0};
    unsigned long blank=0, exceptional=0, ac_exception=0;
    int modal=0, planted=-1;
    for (int y=0;y<BH;y++) for (int x=0;x<BW;x++) {
      int i=y*BW+x;
      if (near_ink(x,y)) continue;
      blank++;
      histogram[(unsigned short)dc[i]]++;
    }
    for (int i=1;i<65536;i++) if (histogram[i]>histogram[modal]) modal=i;
    if (modal!=339) die("unexpected white-background DC quantizer value");
    for (int y=0;y<BH;y++) for (int x=0;x<BW;x++) {
      int i=y*BW+x;
      if (near_ink(x,y)) continue;
      if (!unusual(i,modal)) {
        if (planted<0) planted=i;
        continue;
      }
      exceptional++;
      ac_exception += ac[i]!=0;
      /* Exactly two repeated 8x8 DC-only one-step deltas in each
       * of five symmetric-decoration images, no other exceptions. */
      if (number<20 || number>24 || y*8!=1328 ||
          (x*8!=296 && x*8!=2096) || dc[i]!=338 || ac[i])
        die("unexpected nonblank luminance DCT exception");
    }
    if (exceptional != ((number>=20 && number<=24) ? 2UL : 0UL))
      die("unexpected number of original anomalies");
    if (planted<0) die("no blank source block for positive control");
    ac[planted]=1;
    if (!unusual(planted,modal)) die("planted hidden AC edit undetected");
    ac[planted]=0;
    if (unusual(planted,modal)) die("planted AC reset failed");
    total_blank+=blank;
    total_exception+=exceptional;
    total_ac+=ac_exception;
    printf("image=%02d.jpg white_field_Y_blocks=%lu DC_only_exceptions=%lu "
           "AC_exceptions=%lu modalDC=%d plantedAC=PASS\n",
           number,blank,exceptional,ac_exception,modal);
  }
  if (total_blank!=5982409ULL || total_exception!=10ULL || total_ac!=0ULL)
    die("original corpus shape changed");
  printf("SUMMARY images=58 source_Y_blocks=7830000 white_field_Y_blocks=%llu "
         "DC_only_exceptions=%llu AC_exceptions=%llu repeated_coords=296:1328,2096:1328 "
         "images=20..24 plantedAC=PASS\n",
         total_blank,total_exception,total_ac);
  return 0;
}
