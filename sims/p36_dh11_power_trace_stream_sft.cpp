#include <array>
#include <vector>
#include <string>
#include <iostream>
#include <fstream>
#include <algorithm>
#include <cstdint>
#include <cassert>
#include <boost/multiprecision/cpp_int.hpp>
using namespace std;
using boost::multiprecision::cpp_int;
constexpr int D=238;
using A=array<int,D>;

// Lower coefficients of the monic degree-238 factor R238, ascending order.
// SHA256 of these 238 coefficients as bytes:
// 65cb6ea001c65a85b38d24bca37049c806e52efd24b334fb3ad0d0087213184c
// R238 is derived from the original base60-grid.json table polynomial.
// The p36 printed rune-index seed is likewise ascending field coefficients;
// SHA256 of its 238 bytes: a53ded5a907795ae4c57a2a75bd3fba5a5c7093ac092d40fb7f7f8a7eda91491
const A Q = {5,9,18,5,15,8,11,3,19,21,8,13,12,28,12,22,22,23,2,18,10,10,28,26,4,6,12,14,28,8,22,24,24,20,12,17,2,15,25,17,20,24,3,5,28,12,5,17,9,22,19,12,28,3,18,22,28,10,28,24,26,7,17,19,28,1,0,19,13,19,17,18,14,21,0,26,0,12,24,15,27,2,8,4,0,1,16,6,21,1,15,8,4,15,26,11,1,6,8,18,6,25,20,19,17,3,16,12,27,21,12,3,20,3,25,3,26,6,11,27,7,19,10,2,25,4,18,6,4,2,11,12,28,10,22,5,13,12,20,27,6,7,4,1,24,16,7,22,14,12,25,21,25,3,8,26,12,15,24,22,26,6,18,6,19,22,18,18,14,0,4,16,0,17,6,16,11,16,6,4,15,25,28,19,21,12,8,26,11,25,11,25,12,24,20,15,4,10,16,7,16,16,9,18,25,5,2,9,22,1,18,24,16,1,0,17,4,1,17,5,17,13,0,5,3,4,27,26,27,6,2,22,8,15,27,26,15,11};
const A SEED = {26,9,1,7,21,8,6,26,4,3,10,20,9,14,9,3,13,0,28,25,25,3,14,9,15,22,25,20,9,25,2,1,28,26,25,13,10,12,1,4,11,13,22,11,24,21,13,2,13,24,21,26,19,22,14,17,1,16,12,19,13,25,26,14,25,26,4,25,26,0,0,19,27,14,18,4,1,16,6,1,26,4,27,1,3,12,10,11,0,13,11,23,10,2,3,8,27,6,8,20,2,12,22,24,25,28,19,14,8,5,14,24,16,2,25,14,3,15,5,23,16,26,7,9,22,16,14,7,10,22,11,0,10,3,10,4,15,14,9,19,24,27,4,13,15,23,10,22,8,18,16,1,7,28,22,23,22,11,10,21,27,11,4,23,19,17,3,5,3,2,22,4,1,20,1,2,15,1,23,20,6,10,26,21,3,22,10,18,26,18,0,12,21,17,20,10,1,26,0,22,9,22,17,22,6,11,24,9,19,25,26,2,0,10,17,21,13,9,10,4,6,11,12,25,8,24,4,14,14,3,20,9,25,23,26,17,9,24};

inline int mod(long long x){int r=int(x%29);return r<0?r+29:r;}
A mul(const A& a,const A& b){
  array<long long,2*D-1> t{};
  for(int i=0;i<D;i++) if(a[i]) for(int j=0;j<D;j++) if(b[j]) t[i+j]+=(long long)a[i]*b[j];
  for(int k=2*D-2;k>=D;k--){int c=mod(t[k]);if(c)for(int j=0;j<D;j++)t[k-D+j]-=(long long)c*Q[j];t[k]=0;}
  A out{};for(int i=0;i<D;i++)out[i]=mod(t[i]);return out;
}
A pow11(const A& x){A x2=mul(x,x),x4=mul(x2,x2),x8=mul(x4,x4),x10=mul(x8,x2);return mul(x10,x);}
A fieldPow(A a,cpp_int e){A r{};r[0]=1;while(e>0){if((e&1)!=0)r=mul(r,a);e>>=1;if(e>0)a=mul(a,a);}return r;}
cpp_int modPow(cpp_int a,cpp_int e,const cpp_int& m){cpp_int r=1;a%=m;while(e>0){if((e&1)!=0)r=(r*a)%m;e>>=1;if(e>0)a=(a*a)%m;}return r;}
cpp_int egcd(cpp_int a,cpp_int b,cpp_int& x,cpp_int& y){if(b==0){x=1;y=0;return a;}cpp_int x1,y1;cpp_int g=egcd(b,a%b,x1,y1);x=y1;y=x1-(a/b)*y1;return g;}
cpp_int invMod(cpp_int a,const cpp_int& m){cpp_int x,y;cpp_int g=egcd(a,m,x,y);assert(g==1);x%=m;if(x<0)x+=m;return x;}
A tracePowers(){
  A t{};t[0]=238%29;
  for(int k=1;k<D;k++){long long s=(long long)k*Q[D-k];for(int i=1;i<k;i++)s+=(long long)Q[D-i]*t[k-i];t[k]=mod(-s);}
  assert(t[0]==6);assert(t[1]==mod(-Q[D-1]));return t;
}
int trace(const A& x,const A& tr){long long s=0;for(int i=0;i<D;i++)s+=(long long)x[i]*tr[i];return mod(s);}
A addField(const A& a,const A& b){A c{};for(int i=0;i<D;i++)c[i]=mod(a[i]+b[i]);return c;}
int directTrace(const A& x){A cur=x,sum{};for(int j=0;j<D;j++){sum=addField(sum,cur);cur=fieldPow(cur,29);}assert(cur==x);for(int i=1;i<D;i++)assert(sum[i]==0);return sum[0];}
int main(int argc,char**argv){
  int nonzero=0;for(int x:SEED)nonzero+=x!=0;assert(nonzero>0);
  cpp_int N=1;for(int i=0;i<D;i++)N*=29;N-=1;
  cpp_int inv11=invMod(11,N),backExp=modPow(inv11,8706,N),forwardExp=modPow(cpp_int(11),8706,N);
  A start=fieldPow(SEED,backExp);A verify=fieldPow(start,forwardExp);assert(verify==SEED);
  A tr=tracePowers();assert(directTrace(SEED)==trace(SEED,tr));assert(directTrace(start)==trace(start,tr));
  vector<uint8_t> keys;keys.reserve(12718);A state=start;
  // 8,706 ciphertext runes precede p36. Emit S_-8706 ... S_-1.
  for(int i=0;i<8706;i++){keys.push_back((uint8_t)trace(state,tr));state=pow11(state);}
  assert(state==SEED);
  // p36 itself is the field seed and is excluded; the first following rune uses S_0.
  state=SEED;
  for(int i=0;i<4012;i++){keys.push_back((uint8_t)trace(state,tr));state=pow11(state);}
  assert(keys.size()==12718);assert((int)keys[8706]==trace(SEED,tr));
  string outPath=argc>1?argv[1]:"p36_dh11_power_trace_keys.bin";
  ofstream f(outPath,ios::binary);assert(f.good());f.write((const char*)keys.data(),keys.size());f.close();
  array<int,29> hist{};for(auto k:keys)hist[k]++;
  cout<<"{\"N_bits\":"<<boost::multiprecision::msb(N)+1<<",\"backExp_bits\":"<<boost::multiprecision::msb(backExp)+1<<",\"output\":\""<<outPath<<"\",\"keys\":"<<keys.size()<<",\"traceSeed\":"<<trace(SEED,tr)<<",\"keyAtFirstAfterSeed\":"<<(int)keys[8706]<<",\"histogram\":[";
  for(int i=0;i<29;i++){if(i)cout<<",";cout<<hist[i];}
  cout<<"],\"aroundSeed\":[";for(int i=8701;i<8717;i++){if(i!=8701)cout<<",";cout<<(int)keys[i];}
  cout<<"],\"first32\":[";for(int i=0;i<32;i++){if(i)cout<<",";cout<<(int)keys[i];}
  cout<<"],\"last32\":[";for(int i=(int)keys.size()-32;i<(int)keys.size();i++){if(i!=(int)keys.size()-32)cout<<",";cout<<(int)keys[i];}
  cout<<"]}\n";
}
