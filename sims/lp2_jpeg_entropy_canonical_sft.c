// Source-only, exact JPEG entropy serialization audit for LP2 originals.
// Build with libjpeg: cc -std=c11 -O2 -Wall -Wextra sims/lp2_jpeg_entropy_canonical_sft.c -ljpeg -o lp2_jpeg_entropy_canonical_sft
// Run from the repository root. No files are written.
#include <stdio.h>
#include <stdlib.h>
#include <jpeglib.h>
#include <string.h>
#include <stdint.h>

static unsigned char *first_icc = NULL;
static size_t first_icc_len = 0;

static unsigned char *load(const char *name, size_t *length) {
  FILE *f = fopen(name, "rb");
  if (!f) { fprintf(stderr, "Cannot open %s\n", name); exit(2); }
  if (fseek(f, 0, SEEK_END)) exit(2);
  long n = ftell(f);
  if (n < 0 || fseek(f, 0, SEEK_SET)) exit(2);
  unsigned char *b = malloc((size_t)n);
  if (!b || fread(b, 1, (size_t)n, f) != (size_t)n) exit(2);
  fclose(f);
  *length = (size_t)n;
  return b;
}

static unsigned char *optimized_coefficients(const unsigned char *src, size_t len, unsigned long *out_len) {
  struct jpeg_decompress_struct d;
  struct jpeg_compress_struct c;
  struct jpeg_error_mgr de, ce;
  unsigned char *result = NULL;
  d.err = jpeg_std_error(&de);
  jpeg_create_decompress(&d);
  jpeg_mem_src(&d, src, (unsigned long)len);
  jpeg_read_header(&d, TRUE);
  jvirt_barray_ptr *blocks = jpeg_read_coefficients(&d);
  c.err = jpeg_std_error(&ce);
  jpeg_create_compress(&c);
  jpeg_mem_dest(&c, &result, out_len);
  jpeg_copy_critical_parameters(&d, &c);
  c.optimize_coding = TRUE;
  jpeg_write_coefficients(&c, blocks);
  jpeg_finish_compress(&c);
  jpeg_destroy_compress(&c);
  jpeg_finish_decompress(&d);
  jpeg_destroy_decompress(&d);
  return result;
}

// Copy the entire original bitstream except its single APP2 ICC segment.
// The entropy-coded bytes following SOS are copied verbatim (never parsed or regenerated here).
static unsigned char *without_app2(const unsigned char *src, size_t len, size_t *outlen, int *app2_count) {
  if (len < 6 || src[0] != 0xff || src[1] != 0xd8) exit(3);
  unsigned char *out = malloc(len);
  if (!out) exit(3);
  size_t i=2, j=2;
  out[0]=src[0]; out[1]=src[1];
  *app2_count = 0;
  while (i + 4 <= len) {
    size_t start=i;
    if (src[i++] != 0xff) exit(3);
    while (i<len && src[i]==0xff) i++;
    if (i>=len) exit(3);
    unsigned int marker=src[i++];
    if (marker == 0xda) {
      // The complete SOS header and all entropy data through EOI remain untouched.
      memcpy(out+j,src+start,len-start);
      j += len-start;
      i=len;
      break;
    }
    if (marker == 0xd9 || (marker>=0xd0 && marker<=0xd7)) exit(3);
    if (i + 2 > len) exit(3);
    size_t field = ((size_t)src[i] << 8) | src[i+1];
    if (field < 2 || i+field>len) exit(3);
    size_t end = i + field;
    if (marker == 0xe2) {
      size_t count=end-start;
      if (first_icc == NULL) {
        first_icc=malloc(count);
        if (!first_icc) exit(3);
        memcpy(first_icc,src+start,count);
        first_icc_len=count;
      } else if (count!=first_icc_len || memcmp(first_icc,src+start,count)) {
        fprintf(stderr,"APP2 differed from first source page\n"); exit(3);
      }
      ++*app2_count;
    } else {
      memcpy(out+j,src+start,end-start);
      j += end-start;
    }
    i=end;
  }
  if (i!=len) exit(3);
  *outlen=j;
  return out;
}

static unsigned char *synthetic_nonoptimized(unsigned long *size) {
  struct jpeg_compress_struct c;
  struct jpeg_error_mgr err;
  unsigned char *result = NULL;
  c.err = jpeg_std_error(&err);
  jpeg_create_compress(&c);
  jpeg_mem_dest(&c,&result,size);
  c.image_width=96; c.image_height=96; c.input_components=1; c.in_color_space=JCS_GRAYSCALE;
  jpeg_set_defaults(&c);
  c.optimize_coding=FALSE;
  jpeg_start_compress(&c,TRUE);
  JSAMPLE samples[96];
  while(c.next_scanline < c.image_height) {
    unsigned int y=c.next_scanline;
    for(unsigned int x=0;x<96;x++) samples[x]=(JSAMPLE)((x*71 + y*29 + (x*y)%251) & 255);
    JSAMPROW rows[1]={samples};
    jpeg_write_scanlines(&c,rows,1);
  }
  jpeg_finish_compress(&c);
  jpeg_destroy_compress(&c);
  return result;
}

static void ensure_native_known_payload_detected(int image_number) {
  char path[128];
  snprintf(path,sizeof(path),"resources/liber-primus/%02d.jpg",image_number);
  size_t len=0;
  unsigned char *src=load(path,&len);
  unsigned long norm_len=0;
  unsigned char *norm=optimized_coefficients(src,len,&norm_len);
  size_t strip_len=0;
  int ct=0;
  unsigned char *clean=without_app2(src,len,&strip_len,&ct);
  // LP1 05.jpg has a known appended payload and a reversed JPEG copy;
  // LP1 10.jpg includes four concatenated complete JPEGs. Both must fail.
  if (strip_len == norm_len && !memcmp(clean,norm,strip_len)) {
    fprintf(stderr,"Known LP1 original anomaly %02d was not detected\n",image_number);exit(4);
  }
  printf("native LP1 %02d noncanonical (expected), original=%zu normalized=%lu\n",image_number,len,norm_len);
  free(src); free(norm); free(clean);
}

int main(void) {
  unsigned long syn_len=0;
  unsigned char *syn=synthetic_nonoptimized(&syn_len);
  unsigned long syn_opt_len=0;
  unsigned char *syn_opt=optimized_coefficients(syn,syn_len,&syn_opt_len);
  if (syn_len==syn_opt_len && memcmp(syn,syn_opt,syn_len)==0) {
    fprintf(stderr,"Synthetic nonoptimized negative was not detected\n");return 5;
  }
  printf("synthetic nonoptimized JPEG detected, sizes %lu -> %lu\n",syn_len,syn_opt_len);
  free(syn);free(syn_opt);

  unsigned long long total_bytes=0;
  for(int p=0;p<58;p++) {
    char path[128];
    snprintf(path,sizeof(path),"resources/liber-primus/%02d.jpg",p+17);
    size_t len=0;
    unsigned char *src=load(path,&len);
    unsigned long norm_len=0;
    unsigned char *norm=optimized_coefficients(src,len,&norm_len);
    size_t strip_len=0;
    int app2=0;
    unsigned char *clean=without_app2(src,len,&strip_len,&app2);
    if (app2!=1 || first_icc_len!=2594 || norm_len!=strip_len || memcmp(clean,norm,strip_len)) {
      fprintf(stderr,"LP2 p%d failed exact optimized-DCT serialization: original %zu, APP2 %d, strip %zu, regenerated %lu\n",p,len,app2,strip_len,norm_len);
      return 6;
    }
    total_bytes+=len;
    printf("LP2 p%02d original=%zu APP2=%zu optimized-exact=yes\n",p,len,first_icc_len);
    free(src);free(norm);free(clean);
  }
  // Controls use the same optimized comparison and intentionally fail on known LP1 byte-tail payloads.
  ensure_native_known_payload_detected(5);
  ensure_native_known_payload_detected(10);
  printf("PASS: 58/58 original LP2 JPEGs are byte-exact libjpeg coefficient-preserving optimized encodings after removal of one common 2594-byte APP2; %llu original bytes; synthetic and two historical-source negatives detected.\n",total_bytes);
  free(first_icc);
  return 0;
}
