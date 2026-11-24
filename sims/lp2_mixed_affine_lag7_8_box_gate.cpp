#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <map>
#include <numeric>
#include <string>
#include <vector>
using namespace std;
using U=uint32_t; using QCode=__uint128_t;
constexpr U ALL=(1u<<29)-2; constexpr int MAXQ=13;
using Box=array<U,MAXQ>; using State=map<QCode,vector<Box>>;
int q,cap; int inv[29],m29[4096]; U lut[29][29][4][256]; QCode codeMask;
int mod(int x){return x>=-2048&&x<2048?m29[x+2048]:((x%29)+29)%29;}
void init(){for(int x=-2048;x<2048;x++)m29[x+2048]=((x%29)+29)%29; for(int a=1;a<29;a++)for(int b=1;b<29;b++)if(a*b%29==1)inv[a]=b;
 for(int a=0;a<29;a++)for(int b=0;b<29;b++)for(int k=0;k<4;k++)for(int x=1;x<256;x++){int bit=x&-x,z=k*8+__builtin_ctz(bit),v=z<29?mod(a*z+b):0;lut[a][b][k][x]=lut[a][b][k][x^bit]|(v?1u<<v:0);}}
U transform(U x,int a,int b){auto &v=lut[a][b];return v[0][x&255]|v[1][(x>>8)&255]|v[2][(x>>16)&255]|v[3][x>>24];}
QCode push(QCode code,int c){return ((code>>5)|(QCode(c)<<(5*(q-1))))&codeMask;}
void add(State& m,QCode code,const Box& box){auto &a=m[code];for(size_t j=0;j<a.size();){const auto &w=a[j];bool wb=true,bw=true;for(int k=0;k<q;k++){U x=w[k]&box[k];wb&=x==box[k];bw&=x==w[k];if(!wb&&!bw)break;}if(wb)return;if(bw){a[j]=a.back();a.pop_back();}else j++;}a.push_back(box);}
int count(const State& s){int n=0;for(auto&[c,b]:s)n+=b.size();return n;}
struct Result{int status,end,peak;uint64_t visits;};
Result path(const vector<int>& t,int start,int a,int b,int d,bool excludeStatic,int stop){
 QCode code=0;Box initial{};for(int j=0;j<q;j++){assert(t[start+j]);code|=QCode(t[start+j])<<(5*j);initial[j]=ALL;}
 State cur;if(excludeStatic){for(int j=0;j<q;j++){Box x=initial;for(int k=0;k<j;k++)x[k]=1u<<t[start+k];x[j]&=~(1u<<t[start+j]);add(cur,code,x);}}else add(cur,code,initial);
 int peak=count(cur);uint64_t visits=0;
 for(int i=start+q;i<stop;){State next;
 if(!t[i]){for(auto&[code,boxes]:cur)for(const auto &box:boxes){add(next,code,box);U m=transform(box[0],mod(-a),mod(-b*int(code&31)-d));if(m){Box out{};for(int k=0;k<q-1;k++)out[k]=box[k+1];out[q-1]=m;add(next,push(code,0),out);}visits++;}i++;}
 else {int end=i+1;while(end<stop&&t[end])end++;int rot=(end-i)%q;
 for(auto&[initialCode,boxes]:cur){QCode code=initialCode;array<int,MAXQ>A{},B{};Box M{};for(int j=0;j<q;j++){A[j]=1;M[j]=ALL;}bool ok=true;int j=0;
 for(int k=i;k<end;k++){int c=t[k];A[j]=mod(-a*A[j]);B[j]=mod(c-b*int(code&31)-d-a*B[j]);code=push(code,c);if(A[j])M[j]&=~(1u<<mod(-B[j]*inv[A[j]]));else if(!B[j]){ok=false;break;}if(!M[j]){ok=false;break;}if(++j==q)j=0;}
 if(!ok)continue;for(const auto& box:boxes){Box out{};bool legal=true;for(int k=0;k<q;k++){int j=(k+rot)%q;U m=box[j]&M[j];if(!m){legal=false;break;}out[k]=transform(m,A[j],B[j]);assert(out[k]);}if(legal)add(next,code,out);visits++;}}
 i=end;}
 if(next.empty())return {0,i-start,peak,visits};cur.swap(next);peak=max(peak,count(cur));if(peak>cap)return {-1,i-start,peak,visits};}
 return {1,stop-start,peak,visits};}
vector<int> readTape(const string& f){ifstream in(f);string s;in>>s;vector<int> t;for(char x:s){int v=x<='9'?x-'0':x-'A'+10;assert(v>=0&&v<29);t.push_back(v);}assert(!t.empty());return t;}
int main(int argc,char**argv){assert(argc>=6);q=stoi(argv[1]);cap=stoi(argv[2]);int lo=stoi(argv[3]),hi=stoi(argv[4]);vector<int> t=readTape(argv[5]);assert(q>=1&&q<=13);codeMask=(QCode(1)<<(5*q))-1;init();int start=argc>6?stoi(argv[6]):0;int stop=argc>7?stoi(argv[7]):t.size();int onlyB=argc>8?stoi(argv[8]):-1,onlyD=argc>9?stoi(argv[9]):-1;
 for(int a=lo;a<hi;a++){auto begin=chrono::steady_clock::now();int counts[3]={},peak=0,maxEnd=0;uint64_t visits=0;for(int b=0;b<29;b++){if(onlyB>=0&&b!=onlyB)continue;for(int d=0;d<29;d++){if(onlyD>=0&&d!=onlyD)continue;bool cancel=mod(a+b)==0&&!d;if(cancel&&!a)continue;auto z=path(t,start,a,b,d,cancel,stop);counts[z.status+1]++;peak=max(peak,z.peak);maxEnd=max(maxEnd,z.end);visits+=z.visits;if(z.status!=0)cout<<"P "<<a<<' '<<b<<' '<<d<<' '<<z.status<<' '<<z.end<<' '<<z.peak<<' '<<z.visits<<'\n';}}cout<<"A "<<a<<' '<<counts[0]<<' '<<counts[1]<<' '<<counts[2]<<' '<<peak<<' '<<maxEnd<<' '<<visits<<' '<<chrono::duration<double>(chrono::steady_clock::now()-begin).count()<<endl;}
}
