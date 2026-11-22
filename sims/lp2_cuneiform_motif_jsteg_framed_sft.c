/* Original-source, region-frozen JSteg AC-LSB gate for 2014 LP2 cuneiform.
 * Build with libjpeg. Run with source JPEG directory and disposable plant path.
 * Excludes only a 32-bit-length-framed luma AC stream inside the visible motif.
 */
#include <assert.h>
#include <inttypes.h>
#include <stddef.h>
#include <stdio.h>
#include <jpeglib.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

static const int zigzag[64] = {
 0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,
 34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,
 30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63
};

typedef struct {
 FILE *file;
 struct jpeg_decompress_struct jpeg;
 struct jpeg_error_mgr error;
 jvirt_barray_ptr *coefficients;
} Original;

typedef struct {unsigned char bytes[32768];size_t bits;} Bitstream;

static void open_original(Original *src,const char *file){
 memset(src,0,sizeof(*src));src->file=fopen(file,"rb");assert(src->file);
 src->jpeg.err=jpeg_std_error(&src->error);
 jpeg_create_decompress(&src->jpeg);jpeg_stdio_src(&src->jpeg,src->file);
 assert(jpeg_read_header(&src->jpeg,TRUE)==JPEG_HEADER_OK);
 assert(src->jpeg.image_width==2400&&src->jpeg.image_height==3600);
 assert(src->jpeg.num_components==3);
 src->coefficients=jpeg_read_coefficients(&src->jpeg);assert(src->coefficients);
 assert(src->jpeg.comp_info[0].width_in_blocks==300);
 assert(src->jpeg.comp_info[0].height_in_blocks==450);
}
static void close_original(Original *src){
 jpeg_finish_decompress(&src->jpeg);jpeg_destroy_decompress(&src->jpeg);
 fclose(src->file);
}
static int bit(const Bitstream *s,size_t i){
 assert(i<s->bits);return (s->bytes[i/8]>>(7-(i%8)))&1;
}
static void append(Bitstream *s,int value){
 assert(s->bits<8*sizeof(s->bytes));
 if(value)s->bytes[s->bits/8]|=(unsigned char)(1u<<(7-(s->bits%8)));
 s->bits++;
}
static uint32_t header(const Bitstream *s){
 assert(s->bits>=32);
 return ((uint32_t)s->bytes[0]<<24)|((uint32_t)s->bytes[1]<<16)|
 ((uint32_t)s->bytes[2]<<8)|s->bytes[3];
}
static size_t eligible(Original *src,int start_y,Bitstream *stream,int write){
 const int x0=980/8,x1=(1470+7)/8;
 const int y0=start_y/8,y1=(start_y+430+7)/8;
 size_t n=0;
 for(int y=y0;y<y1;y++){
  JBLOCKARRAY row=(*src->jpeg.mem->access_virt_barray)(
   (j_common_ptr)&src->jpeg,src->coefficients[0],(JDIMENSION)y,1,write);
  for(int x=x0;x<x1;x++)for(int z=1;z<64;z++){
   JCOEF *coefficient=&row[0][x][zigzag[z]];
   int value=*coefficient,magnitude=value<0?-value:value;
   if(magnitude<=1)continue;
   if(write){
    if(n<stream->bits&&((magnitude&1)!=bit(stream,n))){
     *coefficient=(JCOEF)(value>0?value+1:value-1);
    }
   }else append(stream,magnitude&1);
   n++;
  }
 }
 return n;
}
static void save_plant(Original *src,const char *file){
 FILE *out=fopen(file,"wb");assert(out);
 struct jpeg_compress_struct enc;struct jpeg_error_mgr e;memset(&enc,0,sizeof(enc));
 enc.err=jpeg_std_error(&e);jpeg_create_compress(&enc);
 jpeg_stdio_dest(&enc,out);jpeg_copy_critical_parameters(&src->jpeg,&enc);
 jpeg_write_coefficients(&enc,src->coefficients);
 jpeg_finish_compress(&enc);jpeg_destroy_compress(&enc);fclose(out);
}
static Bitstream read(const char *file,int start_y){
 Original src;open_original(&src,file);
 Bitstream s={0};size_t n=eligible(&src,start_y,&s,0);
 assert(n==s.bits);close_original(&src);return s;
}
static void source_file(char *out,size_t size,const char *dir,int n){
 int rc=snprintf(out,size,"%s/%02d.jpg",dir,n);assert(rc>0&&(size_t)rc<size);
}
int main(int argc,char **argv){
 assert(argc==3);
 char path[4096];source_file(path,sizeof(path),argv[1],50);
 Bitstream base=read(path,3039);
 assert(base.bits==20608&&header(&base)==0x93fd8513u);
 printf("source 50: slots=%zu, length-header=%" PRIu32 ", capacity=%zu bytes\n",
  base.bits,header(&base),(base.bits-32)/8);
 Bitstream top={0};
 for(int n=51;n<=56;n++){
  source_file(path,sizeof(path),argv[1],n);
  Bitstream s=read(path,145);
  assert(s.bits==17419&&header(&s)==0x1138e5b1u);
  if(n==51)top=s;
  else assert(memcmp(top.bytes,s.bytes,(s.bits+7)/8)==0);
  printf("source %d: slots=%zu, length-header=%" PRIu32 ", capacity=%zu bytes\n",
   n,s.bits,header(&s),(s.bits-32)/8);
 }
 assert(header(&base)>(base.bits-32)/8);
 assert(header(&top)>(top.bits-32)/8);
 const char *payload="GP29-MOTIF-PLANT-3301";
 Bitstream plant={0};uint32_t len=(uint32_t)strlen(payload);
 for(int i=31;i>=0;i--)append(&plant,(len>>i)&1u);
 for(uint32_t i=0;i<len;i++)for(int z=7;z>=0;z--)
  append(&plant,((unsigned char)payload[i]>>z)&1u);
 source_file(path,sizeof(path),argv[1],51);
 Original src;open_original(&src,path);
 size_t slots=eligible(&src,145,&plant,1);
 assert(slots==top.bits&&plant.bits<=slots);
 save_plant(&src,argv[2]);close_original(&src);
 Bitstream recovered=read(argv[2],145);
 assert(recovered.bits==top.bits);
 assert(header(&recovered)==len);
 assert(memcmp(recovered.bytes+4,payload,len)==0);
 printf("PLANTED POSITIVE: exact %" PRIu32 "-byte body recovered; "
  "all original source headers fail. No original message recovered.\n",len);
 return 0;
}
