/*
 * LP2 p55 moth-wing 16-block source-cover and JSteg-style gate.
 * Original scans: 70.jpg (LP2 p53), 71.jpg (LP2 p54), 72.jpg (LP2 p55).
 * The p53->p55 moth translation is fixed at (+66,+67) source pixels.
 * Target p55 luma blocks: columns 227,228; rows 349..356 (16 blocks).
 *
 * Build: cc -O2 -Wall -Wextra file.c -ljpeg -lm -o /tmp/lp2_moth_sft
 * Run:   /tmp/lp2_moth_sft analyze <original-jpeg-dir>
 *        /tmp/lp2_moth_sft plant <72.jpg> <output.jpg> <payload.bin>
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <math.h>
#include <fenv.h>
#include <jpeglib.h>

static const int ZIGZAG[64] = {
  0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,
  12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,
  35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,
  58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63
};
#define W 2400
#define H 3600
#define N_BLOCKS 16

typedef struct { unsigned char *y; int w,h; } YPlane;
typedef struct { JCOEF block[N_BLOCKS][64]; UINT16 q[64]; } TargetCoeffs;

static void die(const char *s) { fprintf(stderr,"ERROR: %s\n",s); exit(2); }

static void read_y(const char *path, YPlane *out) {
  FILE *f=fopen(path,"rb"); if(!f) die("open Y source");
  struct jpeg_decompress_struct c; struct jpeg_error_mgr e;
  c.err=jpeg_std_error(&e); jpeg_create_decompress(&c); jpeg_stdio_src(&c,f);
  jpeg_read_header(&c,TRUE);
  if(c.image_width!=W || c.image_height!=H || c.num_components!=3) die("unexpected image geometry/color");
  c.out_color_space=JCS_YCbCr; jpeg_start_decompress(&c);
  if(c.output_width!=W || c.output_height!=H || c.output_components!=3) die("unexpected YCbCr output");
  out->w=W; out->h=H; out->y=(unsigned char*)malloc((size_t)W*H); if(!out->y) die("malloc Y");
  unsigned char *row=(unsigned char*)malloc(W*3); if(!row) die("malloc row");
  JSAMPROW rows[1]={row};
  while(c.output_scanline<c.output_height) {
    JDIMENSION yy=c.output_scanline;
    jpeg_read_scanlines(&c,rows,1);
    for(int x=0;x<W;x++) out->y[(size_t)yy*W+x]=row[x*3];
  }
  free(row); jpeg_finish_decompress(&c); jpeg_destroy_decompress(&c); fclose(f);
}

static void read_target_coeffs(const char *path, TargetCoeffs *out) {
  FILE *f=fopen(path,"rb"); if(!f) die("open coefficient source");
  struct jpeg_decompress_struct c; struct jpeg_error_mgr e;
  c.err=jpeg_std_error(&e); jpeg_create_decompress(&c); jpeg_stdio_src(&c,f);
  jpeg_read_header(&c,TRUE);
  if(c.image_width!=W || c.image_height!=H || c.num_components!=3 ||
     c.comp_info[0].h_samp_factor!=2 || c.comp_info[0].v_samp_factor!=2) die("unexpected coefficient geometry");
  jvirt_barray_ptr *a=jpeg_read_coefficients(&c);
  if(!c.comp_info[0].quant_table) die("missing Y quant table");
  memcpy(out->q,c.comp_info[0].quant_table->quantval,sizeof(out->q));
  int n=0;
  for(int y=349;y<=356;y++) {
    JBLOCKARRAY row=(*c.mem->access_virt_barray)((j_common_ptr)&c,a[0],(JDIMENSION)y,1,FALSE);
    for(int x=227;x<=228;x++) memcpy(out->block[n++],row[0][x],64*sizeof(JCOEF));
  }
  if(n!=N_BLOCKS) die("target block count");
  jpeg_finish_decompress(&c); jpeg_destroy_decompress(&c); fclose(f);
}

static void dct_quant(const double *pixels, int stride, double center, const UINT16 q[64], int out[64]) {
  const double pi=3.1415926535897932384626433832795;
  double basis[8][8];
  for(int u=0;u<8;u++) for(int x=0;x<8;x++) {
    double a=(u==0)?sqrt(1.0/8.0):0.5;
    basis[u][x]=a*cos(((2*x+1)*u*pi)/16.0);
  }
  for(int u=0;u<8;u++) for(int v=0;v<8;v++) {
    double s=0.0;
    for(int y=0;y<8;y++) for(int x=0;x<8;x++)
      s += (pixels[y*stride+x]-center)*basis[u][y]*basis[v][x];
    double z=s/(double)q[u*8+v];
    out[u*8+v]=(int)lrint(z);
  }
}

static int abs_i(int x) { return x<0?-x:x; }

static void jsteg_extract(const TargetCoeffs *c, unsigned char *bytes,
                          size_t cap, size_t *bit_count) {
  size_t n=0; memset(bytes,0,cap);
  for(int bi=0;bi<N_BLOCKS;bi++) for(int k=1;k<64;k++) {
    int v=c->block[bi][ZIGZAG[k]], mag=abs_i(v);
    if(mag<=1) continue;
    if(n/8>=cap) die("extract buffer too small");
    bytes[n/8]=(unsigned char)((bytes[n/8]<<1)|(mag&1));
    n++;
  }
  *bit_count=n;
  if(n%8) bytes[n/8] <<= (8-(n%8));
}

static int plant_copy(const char *inpath,const char *outpath,const char *payload_path) {
  FILE *pf=fopen(payload_path,"rb"); if(!pf) die("open payload");
  fseek(pf,0,SEEK_END); long plen=ftell(pf); rewind(pf);
  if(plen<0) die("payload length");
  unsigned char *payload=(unsigned char*)malloc((size_t)plen); if(!payload) die("payload alloc");
  if(fread(payload,1,(size_t)plen,pf)!=(size_t)plen) die("payload read");
  fclose(pf);
  FILE *in=fopen(inpath,"rb"); if(!in) die("open plant input");
  struct jpeg_decompress_struct src; struct jpeg_error_mgr se;
  src.err=jpeg_std_error(&se); jpeg_create_decompress(&src); jpeg_stdio_src(&src,in); jpeg_read_header(&src,TRUE);
  jvirt_barray_ptr *coef=jpeg_read_coefficients(&src);
  size_t bitpos=0,total=(size_t)plen*8;
  for(int y=349;y<=356 && bitpos<total;y++) {
    JBLOCKARRAY row=(*src.mem->access_virt_barray)((j_common_ptr)&src,coef[0],(JDIMENSION)y,1,TRUE);
    for(int x=227;x<=228 && bitpos<total;x++) {
      JCOEF *block=row[0][x];
      for(int k=1;k<64 && bitpos<total;k++) {
        int idx=ZIGZAG[k],v=block[idx],mag=abs_i(v);
        if(mag<=1) continue;
        unsigned bit=(payload[bitpos/8]>>(7-(bitpos%8)))&1U;
        if(((unsigned)mag&1U)!=bit) {
          if(v>0) block[idx]=(JCOEF)(v<32767?v+1:v-1);
          else block[idx]=(JCOEF)(v>-32768?v-1:v+1);
        }
        bitpos++;
      }
    }
  }
  if(bitpos!=total) die("target region capacity too small");
  FILE *out=fopen(outpath,"wb"); if(!out) die("open plant output");
  struct jpeg_compress_struct dst; struct jpeg_error_mgr de;
  dst.err=jpeg_std_error(&de); jpeg_create_compress(&dst); jpeg_stdio_dest(&dst,out);
  jpeg_copy_critical_parameters(&src,&dst); jpeg_write_coefficients(&dst,coef); jpeg_finish_compress(&dst);
  fclose(out); jpeg_finish_decompress(&src); jpeg_destroy_compress(&dst); jpeg_destroy_decompress(&src); fclose(in); free(payload);
  printf("PLANTED %ld bytes (%zu bits) into the 16 source-selected blocks\n",plen,total);
  return 1;
}

static int extract_file(const char *path, unsigned char *bytes,size_t cap,size_t *bits);

static int analyze(const char *dir) {
  char p53[1024],p54[1024],p55[1024];
  snprintf(p53,sizeof(p53),"%s/70.jpg",dir); snprintf(p54,sizeof(p54),"%s/71.jpg",dir); snprintf(p55,sizeof(p55),"%s/72.jpg",dir);
  YPlane y53={0},y54={0},y55={0}; read_y(p53,&y53); read_y(p54,&y54); read_y(p55,&y55);
  TargetCoeffs c53,c54,c55; read_target_coeffs(p53,&c53); read_target_coeffs(p54,&c54); read_target_coeffs(p55,&c55);
  if(memcmp(c53.q,c55.q,sizeof(c53.q)) || memcmp(c54.q,c55.q,sizeof(c54.q))) die("Y quant tables differ");
  long p53p54=0, p53p55=0, changed_blocks=0, changed_dc=0, changed_ac=0;
  long visible_nonzero=0, visible_exact=0, visible_maxres=0;
  long cover_exact=0, cover_resid_nonzero=0, cover_resid_abs_sum=0, cover_resid_max=0;
  long aligned_gt10=0, aligned_max=0; double aligned_abs_sum=0;
  int cover_pred[N_BLOCKS][64];
  int visible_pred[N_BLOCKS][64];
  unsigned char differential_bits[256]={0}; size_t differential_n=0; long differential_ones=0;
  int idx=0;
  for(int by=349;by<=356;by++) for(int bx=227;bx<=228;bx++,idx++) {
    int x=bx*8,y=by*8;
    int block_changed=0;
    for(int k=0;k<64;k++) {
      int a=c53.block[idx][k], b=c54.block[idx][k], z=c55.block[idx][k];
      if(a!=b) p53p54++;
      if(a!=z) { p53p55++; block_changed=1; if(k==0) changed_dc++; else changed_ac++; }
    }
    if(block_changed) changed_blocks++;
    /* Visible same-coordinate pixel delta: p55 wing entering p53's blank frame. */
    double delta[64], source[64];
    for(int yy=0;yy<8;yy++) for(int xx=0;xx<8;xx++) {
      delta[yy*8+xx]=(double)y55.y[(size_t)(y+yy)*W+x+xx]-(double)y53.y[(size_t)(y+yy)*W+x+xx];
    }
    dct_quant(delta,8,0.0,c55.q,visible_pred[idx]);
    /* Source-known cover: translate p53's moth by the measured (+66,+67). */
    int sx=x-66,sy=y-67;
    for(int yy=0;yy<8;yy++) for(int xx=0;xx<8;xx++)
      source[yy*8+xx]=(double)y53.y[(size_t)(sy+yy)*W+sx+xx];
    dct_quant(source,8,128.0,c55.q,cover_pred[idx]);
    for(int k=1;k<64;k++) {
      int ci=ZIGZAG[k], av=abs_i((int)c55.block[idx][ci]), pv=abs_i(cover_pred[idx][ci]);
      if(av>1 && pv>1) {
        unsigned bit=(unsigned)((av&1)^(pv&1));
        differential_bits[differential_n/8]=(unsigned char)((differential_bits[differential_n/8]<<1)|bit);
        differential_ones+=bit; differential_n++;
      }
    }
    for(int k=0;k<64;k++) {
      int actual_delta=(int)c55.block[idx][k]-(int)c53.block[idx][k];
      if(visible_pred[idx][k]!=0) visible_nonzero++;
      if(actual_delta==visible_pred[idx][k]) visible_exact++;
      int vr=abs_i(actual_delta-visible_pred[idx][k]); if(vr>visible_maxres) visible_maxres=vr;
      if(c55.block[idx][k]==cover_pred[idx][k]) cover_exact++;
      int cr=abs_i((int)c55.block[idx][k]-cover_pred[idx][k]);
      if(cr) cover_resid_nonzero++;
      cover_resid_abs_sum+=cr; if(cr>cover_resid_max) cover_resid_max=cr;
    }
    for(int yy=0;yy<8;yy++) for(int xx=0;xx<8;xx++) {
      int a=(int)y55.y[(size_t)(y+yy)*W+x+xx];
      int b=(int)y53.y[(size_t)(sy+yy)*W+sx+xx];
      int d=abs_i(a-b); aligned_abs_sum+=d; if(d>10) aligned_gt10++; if(d>aligned_max) aligned_max=d;
    }
  }
  printf("target blocks: 16 (Y columns 227-228, rows 349-356; p55 pixels x=1816..1831 y=2792..2855)\n");
  printf("p53 vs p54 same-coordinate coefficient differences: %ld/1024\n",p53p54);
  printf("p53 vs p55 same-coordinate changed coefficients: %ld/1024 in %ld/16 blocks (%ld DC + %ld AC)\n",p53p55,changed_blocks,changed_dc,changed_ac);
  printf("visible pixel-delta DCT: nonzero predicted coefficients=%ld; exact observed delta matches=%ld/1024; max quantized residual=%ld\n",visible_nonzero,visible_exact,visible_maxres);
  printf("p53 translated known-cover DCT: exact coefficient matches=%ld/1024; residual nonzero=%ld; residual abs sum=%ld; max residual=%ld\n",cover_exact,cover_resid_nonzero,cover_resid_abs_sum,cover_resid_max);
  printf("p53->p55 translated pixel control over 1024 samples: abs diff>10=%ld; max abs diff=%ld; mean abs diff=%.6f\n",aligned_gt10,aligned_max,aligned_abs_sum/1024.0);
  unsigned char stream[256]; size_t bits=0; jsteg_extract(&c55,stream,sizeof(stream),&bits);
  size_t full_bytes=bits/8, trailing_bits=bits%8, printable=0;
  printf("fixed JSteg-style order: raster blocks, zigzag AC, skip |c|<=1, MSB-first; bits=%zu complete_bytes=%zu trailing_bits=%zu\n",bits,full_bytes,trailing_bits);
  printf("original p55 16-block complete bytes:"); for(size_t i=0;i<full_bytes;i++) { printf("%02x",stream[i]); if(stream[i]>=32&&stream[i]<=126) printable++; } puts("");
  if(trailing_bits) printf("trailing partial byte (not a complete source byte): %02x\n",stream[full_bytes]);
  printf("original p55 complete-byte printable ASCII fraction=%.3f\n",full_bytes?(double)printable/(double)full_bytes:0.0);
  size_t diff_full=differential_n/8, diff_tail=differential_n%8;
  if(diff_tail) differential_bits[diff_full] <<= (8-diff_tail);
  printf("known-cover differential parity residual: %zu bits (%zu complete bytes + %zu trailing bits), ones=%ld\n",differential_n,diff_full,diff_tail,differential_ones);
  printf("known-cover differential parity bytes:"); for(size_t i=0;i<diff_full;i++) printf("%02x",differential_bits[i]); puts("");
  if(diff_tail) printf("known-cover differential trailing partial byte: %02x\n",differential_bits[diff_full]);
  free(y53.y);free(y54.y);free(y55.y);
  if(p53p54!=0 || p53p55!=311 || changed_blocks!=16 || changed_dc!=16 || changed_ac!=295 ||
     visible_nonzero!=311 || visible_exact<1010 || visible_maxres>1 ||
     cover_exact<900 || cover_resid_max>2 || aligned_gt10!=0 || aligned_max>10) return 1;
  return 0;
}

static int extract_file(const char *path, unsigned char *bytes,size_t cap,size_t *bits) {
  FILE *f=fopen(path,"rb"); if(!f) die("open extract JPEG");
  struct jpeg_decompress_struct c; struct jpeg_error_mgr e;
  c.err=jpeg_std_error(&e); jpeg_create_decompress(&c); jpeg_stdio_src(&c,f); jpeg_read_header(&c,TRUE);
  jvirt_barray_ptr *a=jpeg_read_coefficients(&c); TargetCoeffs t; memset(&t,0,sizeof(t)); int n=0;
  for(int y=349;y<=356;y++){JBLOCKARRAY row=(*c.mem->access_virt_barray)((j_common_ptr)&c,a[0],(JDIMENSION)y,1,FALSE);for(int x=227;x<=228;x++)memcpy(t.block[n++],row[0][x],64*sizeof(JCOEF));}
  jsteg_extract(&t,bytes,cap,bits); jpeg_finish_decompress(&c);jpeg_destroy_decompress(&c);fclose(f);return 1;
}

int main(int argc,char **argv) {
  fesetround(FE_TONEAREST);
  if(argc==3 && strcmp(argv[1],"analyze")==0) return analyze(argv[2]);
  if(argc==5 && strcmp(argv[1],"plant")==0) {
    if(!plant_copy(argv[2],argv[3],argv[4])) return 1;
    unsigned char got[256]; size_t bits=0; extract_file(argv[3],got,sizeof(got),&bits);
    FILE *pf=fopen(argv[4],"rb"); if(!pf) die("reopen payload"); fseek(pf,0,SEEK_END);long n=ftell(pf);rewind(pf);unsigned char *want=malloc((size_t)n);fread(want,1,(size_t)n,pf);fclose(pf);
    if(bits<(size_t)n*8 || memcmp(got,want,(size_t)n)!=0) die("planted payload not recovered byte-exactly");
    printf("PASS: planted payload recovered byte-exactly from the same 16 blocks\n");free(want);return 0;
  }
  fprintf(stderr,"usage: %s analyze <jpeg-dir> | plant <input.jpg> <output.jpg> <payload.bin>\n",argv[0]); return 2;
}
