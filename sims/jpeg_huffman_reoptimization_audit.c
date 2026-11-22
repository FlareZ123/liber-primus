#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>

struct buf { unsigned char *p; size_t n, cap; };
static void append(struct buf *b, const unsigned char *p, size_t n) {
  if (b->n+n>b->cap) { size_t c=b->cap?b->cap:256; while(c<b->n+n)c*=2; b->p=(unsigned char*)realloc(b->p,c); if(!b->p){fprintf(stderr,"out of memory\n");exit(2);} b->cap=c; }
  memcpy(b->p+b->n,p,n); b->n+=n;
}
struct meta { struct buf dht,dqt,app0,app2; int app0_count,app1,app2_count,com,other_app,sof,sos,eoi,soi; };
static int collect(const unsigned char *data,size_t n,struct meta *m) {
  memset(m,0,sizeof(*m));
  if(n<4||data[0]!=0xff||data[1]!=0xd8)return -1;
  for(size_t k=0;k+1<n;k++){if(data[k]==0xff&&data[k+1]==0xd8)m->soi++;if(data[k]==0xff&&data[k+1]==0xd9)m->eoi++;}
  size_t i=2;
  while(i+1<n){
    if(data[i]!=0xff)return -2;
    size_t start=i;
    while(i<n&&data[i]==0xff)i++;
    if(i>=n)return -3;
    unsigned char marker=data[i++];
    if(marker==0xd9)break;
    if(marker==0xd8)continue;
    if(marker==0x01||(marker>=0xd0&&marker<=0xd7))continue;
    if(i+2>n)return -4;
    unsigned int L=((unsigned int)data[i]<<8)|data[i+1];
    if(L<2||i+L>n)return -5;
    const unsigned char *seg=data+start; size_t seglen=(i+L)-start;
    if(marker==0xc0){m->sof++;}
    else if(marker==0xda){m->sos++; i+=L; break;}
    else if(marker==0xc4)append(&m->dht,seg,seglen);
    else if(marker==0xdb)append(&m->dqt,seg,seglen);
    else if(marker==0xe0){m->app0_count++;append(&m->app0,seg,seglen);}
    else if(marker==0xe2){m->app2_count++;append(&m->app2,seg,seglen);}
    else if(marker==0xe1)m->app1++;
    else if(marker==0xfe)m->com++;
    else if(marker>=0xe0&&marker<=0xef)m->other_app++;
    i+=L;
  }
  return 0;
}
static unsigned char *read_all(const char *path,size_t *n){
  FILE *f=fopen(path,"rb"); if(!f){perror(path);return NULL;}
  if(fseek(f,0,SEEK_END)){fclose(f);return NULL;} long z=ftell(f); if(z<0){fclose(f);return NULL;} rewind(f);
  unsigned char *p=(unsigned char*)malloc((size_t)z); if(!p){fclose(f);return NULL;}
  if(fread(p,1,(size_t)z,f)!=(size_t)z){free(p);fclose(f);return NULL;} fclose(f); *n=(size_t)z; return p;
}
static int transcode(const unsigned char *src,size_t srcn,unsigned char **out,size_t *outn,int *w,int *h,int *nc,int *precision,int *hmax,int *vmax){
  struct jpeg_decompress_struct d; struct jpeg_error_mgr de;
  d.err=jpeg_std_error(&de); jpeg_create_decompress(&d); jpeg_mem_src(&d,(unsigned char*)src,(unsigned long)srcn);
  jpeg_read_header(&d,TRUE);
  *w=(int)d.image_width; *h=(int)d.image_height; *nc=d.num_components; *precision=d.data_precision;
  *hmax=*vmax=0;
  for(int c=0;c<d.num_components;c++){if(d.comp_info[c].h_samp_factor>*hmax)*hmax=d.comp_info[c].h_samp_factor;if(d.comp_info[c].v_samp_factor>*vmax)*vmax=d.comp_info[c].v_samp_factor;}
  jvirt_barray_ptr *coef=jpeg_read_coefficients(&d);
  struct jpeg_compress_struct c; struct jpeg_error_mgr ce;
  c.err=jpeg_std_error(&ce); jpeg_create_compress(&c); unsigned long outlen=0; jpeg_mem_dest(&c,out,&outlen);
  jpeg_copy_critical_parameters(&d,&c); c.optimize_coding=TRUE;
  jpeg_write_coefficients(&c,coef); jpeg_finish_compress(&c); jpeg_finish_decompress(&d);
  *outn=(size_t)outlen; jpeg_destroy_compress(&c); jpeg_destroy_decompress(&d); return 0;
}
static int eqbuf(const struct buf *a,const struct buf *b){return a->n==b->n && (a->n==0||memcmp(a->p,b->p,a->n)==0);}
int main(int argc,char **argv){
  if(argc<2||argc>4){fprintf(stderr,"usage: %s IMAGE_DIR [FIRST=17] [LAST=74]\n",argv[0]);return 2;}
  const char *dir=argv[1]; int first=argc>2?atoi(argv[2]):17,last=argc>3?atoi(argv[3]):74;
  struct buf ref_app2={0},ref_app0={0},ref_dqt_rgb={0},ref_dqt_gray={0};
  int nfiles=0,dht_ok=0,dqt_ok=0,icc_ok=0,app0_ok=0,dqt_mode_ok=0,clean=0,geometry_ok=0,rgb=0,gray=0;
  for(int n=first;n<=last;n++){
    char path[4096];snprintf(path,sizeof(path),"%s/%02d.jpg",dir,n);
    size_t srcn=0; unsigned char *src=read_all(path,&srcn); if(!src)return 3;
    struct meta orig; if(collect(src,srcn,&orig)){fprintf(stderr,"marker parse failed: %s\n",path);return 4;}
    unsigned char *reopt=NULL; size_t reoptn=0; int w,h,nc,precision,hmax,vmax;
    transcode(src,srcn,&reopt,&reoptn,&w,&h,&nc,&precision,&hmax,&vmax);
    struct meta gen; if(collect(reopt,reoptn,&gen)){fprintf(stderr,"reoptimized marker parse failed: %s\n",path);return 5;}
    int same_dht=eqbuf(&orig.dht,&gen.dht),same_dqt=eqbuf(&orig.dqt,&gen.dqt);
    if(n==first){append(&ref_app2,orig.app2.p,orig.app2.n);append(&ref_app0,orig.app0.p,orig.app0.n);}
    int same_icc=eqbuf(&orig.app2,&ref_app2),same_app0=eqbuf(&orig.app0,&ref_app0);
    size_t first_eoi=(size_t)-1; for(size_t k=0;k+1<srcn;k++)if(src[k]==0xff&&src[k+1]==0xd9){first_eoi=k;break;}
    int one_stream=(orig.soi==1&&orig.eoi==1&&first_eoi!=(size_t)-1&&first_eoi+2==srcn);
    int icc_profile=(orig.app2.n>=18&&memcmp(orig.app2.p+4,"ICC_PROFILE\0",12)==0);
    int no_extra=(orig.app1==0&&orig.com==0&&orig.other_app==0&&orig.app0_count==1&&orig.app2_count==1&&orig.sof==1&&orig.sos==1);
    if(same_dht)dht_ok++; if(same_dqt)dqt_ok++; if(same_icc&&icc_profile)icc_ok++; if(same_app0)app0_ok++;
    struct buf *ref_mode=(nc==3?&ref_dqt_rgb:&ref_dqt_gray);
    if(ref_mode->n==0)append(ref_mode,orig.dqt.p,orig.dqt.n);
    if(eqbuf(&orig.dqt,ref_mode))dqt_mode_ok++;
    if(one_stream&&no_extra&&icc_profile)clean++;
    if(w==2400&&h==3600&&precision==8&&(nc==1||nc==3))geometry_ok++;
    if(nc==3)rgb++; else if(nc==1)gray++;
    printf("%02d.jpg %dx%d comps=%d samp=%dx%d SOI/EOI=%d/%d APP0/APP2=%d/%d APP1=%d COM=%d other_APP=%d DHT=%s DQT=%s ICC=%s trailing=%d\n",n,w,h,nc,hmax,vmax,orig.soi,orig.eoi,orig.app0_count,orig.app2_count,orig.app1,orig.com,orig.other_app,same_dht?"exact":"DIFF",same_dqt?"exact":"DIFF",(same_icc&&icc_profile)?"same":"DIFF",one_stream?0:1);
    free(orig.dht.p);free(orig.dqt.p);free(orig.app0.p);free(orig.app2.p);
    free(gen.dht.p);free(gen.dqt.p);free(gen.app0.p);free(gen.app2.p);free(src);free(reopt);nfiles++;
  }
  printf("SUMMARY files=%d dht_reoptimization_exact=%d dqt_reoptimization_exact=%d identical_APP2=%d identical_APP0=%d same_DQT_within_color_mode=%d clean_single_JPEG_no_extra_APP=%d geometry_2400x3600_8bit=%d RGB=%d grayscale=%d\n",nfiles,dht_ok,dqt_ok,icc_ok,app0_ok,dqt_mode_ok,clean,geometry_ok,rgb,gray);
  free(ref_app2.p);free(ref_app0.p);free(ref_dqt_rgb.p);free(ref_dqt_gray.p);
  return (dht_ok==nfiles&&dqt_ok==nfiles&&icc_ok==nfiles&&app0_ok==nfiles&&dqt_mode_ok==nfiles&&clean==nfiles&&geometry_ok==nfiles)?0:1;
}
