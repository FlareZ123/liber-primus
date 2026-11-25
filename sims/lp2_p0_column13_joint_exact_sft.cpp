#include <algorithm>
#include <array>
#include <cassert>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>
using namespace std;
constexpr int Q=29,W=13,H=55,N=716,M=12,FULL=(1<<M)-1,SCALE=10000,NEG=-1000000000;
constexpr int FIT0=1,FIT1=38,TEST0=39,TEST1=55;
using Tape=vector<int>;using Key=array<int,W>;
struct Model {array<int,Q> u{};array<array<int,Q>,Q> b{};};
struct Solution {int fit=NEG,split=-1;Key order{},key{};Tape plain;vector<int> splitScores;};
struct RNG {uint32_t x;uint32_t next(){x^=x<<13;x^=x>>17;x^=x<<5;return x;}int pick(int n){return int(next()%uint32_t(n));}};
int digit(char c){return c<='9'?c-'0':c-'A'+10;}
string repr(const Tape& v){string s;for(int x:v){assert(x>=0&&x<Q);s+=x<10?char('0'+x):char('A'+x-10);}return s;}
Model train(const vector<Tape>& all,int excluded){array<int,Q> u{};array<array<int,Q>,Q> b{};int total=0;for(int t=0;t<(int)all.size();++t)if(t!=excluded){auto& p=all[t];for(int i=0;i<(int)p.size();++i){++u[p[i]];++total;if(i)++b[p[i-1]][p[i]];}}Model m;for(int x=0;x<Q;++x){double prob=(u[x]+.2)/(total+.2*Q);m.u[x]=lround(SCALE*log(prob));for(int a=0;a<Q;++a){int row=accumulate(b[a].begin(),b[a].end(),0);m.b[a][x]=lround(SCALE*log((b[a][x]+8*prob)/(row+8.)));}}return m;}
Tape encrypt(const Tape& p,const Key& order,const Key& key){array<Tape,W> cols;for(int i=0;i<N;++i){int j=i%W;cols[order[j]].push_back((p[i]+key[j])%Q);}Tape c;for(auto& a:cols)c.insert(c.end(),a.begin(),a.end());return c;}
Tape decode(const Tape& c,const Key& order,const Key& key,int split){array<Tape,W> cols;int pos=0;for(int j=0;j<W;++j){int len=H+(j==split);cols[j]=Tape(c.begin()+pos,c.begin()+pos+len);pos+=len;}assert(pos==N);Tape p;for(int i=0;i<N;++i){int j=i%W,r=i/W;p.push_back((cols[order[j]][r]+Q-key[j])%Q);}return p;}
int score(const Tape& p,const Model& m,int first,int end){int sum=0;for(int r=first;r<end;++r){int base=r*W;sum+=m.u[p[base]];for(int j=1;j<W;++j)sum+=m.b[p[base+j-1]][p[base+j]];}return sum;}
void check_split_disjoint(){array<bool,N> fit{},test{};for(int s=0;s<W;++s)for(int j=0;j<W;++j){int start=j*H+(s<j);for(int r=FIT0;r<FIT1;++r)fit[start+r]=true;for(int r=TEST0;r<TEST1;++r)test[start+r]=true;}for(int i=0;i<N;++i)assert(!(fit[i]&&test[i]));}
Solution attack(const Tape& c,const Model& model){assert(c.size()==N);Solution result;result.splitScores.assign(W,NEG);
 for(int s=0;s<W;++s){array<array<array<int,H>,Q>,W> x{};array<int,M> shortId{};int jshort=0;for(int j=0;j<W;++j){if(j!=s)shortId[jshort++]=j;int start=j*H+(s<j);for(int k=0;k<Q;++k)for(int r=FIT0;r<FIT1;++r)x[j][k][r]=(c[start+r]+Q-k)%Q;}
  vector<int> edges(W*W*Q*Q);auto E=[&](int a,int b,int k){return edges.data()+((a*W+b)*Q+k)*Q;};array<int,Q> startU{};
  for(int k=0;k<Q;++k)for(int r=FIT0;r<FIT1;++r)startU[k]+=model.u[x[s][k][r]];
  for(int a=0;a<W;++a)for(int b=0;b<W;++b)if(a!=b)for(int k=0;k<Q;++k)for(int l=0;l<Q;++l){int z=0;for(int r=FIT0;r<FIT1;++r)z+=model.b[x[a][k][r]][x[b][l][r]];E(a,b,k)[l]=z;}
  const int states=(1<<M)*M*Q;vector<int> dp(states,NEG);vector<uint16_t> trace(states,65535);auto idx=[](int mask,int j,int k){return (mask*M+j)*Q+k;};
  for(int j=0;j<M;++j){int base=idx(1<<j,j,0);for(int k=0;k<Q;++k){const int* e=E(s,shortId[j],k);for(int l=0;l<Q;++l){int z=startU[k]+e[l];if(z>dp[base+l]){dp[base+l]=z;trace[base+l]=M*Q+k;}}}}
  for(int mask=1;mask<FULL;++mask){int remaining=FULL^mask;for(int a=mask;a;a&=a-1){int j=__builtin_ctz((unsigned)a);int base=idx(mask,j,0);for(int b=remaining;b;b&=b-1){int h=__builtin_ctz((unsigned)b);int out=idx(mask|(1<<h),h,0);int* target=dp.data()+out;uint16_t* tr=trace.data()+out;for(int k=0;k<Q;++k){int d=dp[base+k];if(d==NEG)continue;const int* e=E(shortId[j],shortId[h],k);uint16_t p=j*Q+k;for(int l=0;l<Q;++l){int z=d+e[l];if(z>target[l]){target[l]=z;tr[l]=p;}}}}}}
  int best=NEG,last=-1,k=-1;for(int j=0;j<M;++j)for(int l=0;l<Q;++l){int d=dp[idx(FULL,j,l)];if(d>best){best=d;last=j;k=l;}}result.splitScores[s]=best;
  if(best>result.fit){result.fit=best;result.split=s;int mask=FULL;for(int col=W-1;col>=1;--col){result.order[col]=shortId[last];result.key[col]=k;int prev=trace[idx(mask,last,k)];mask^=1<<last;last=prev/Q;k=prev%Q;}assert(mask==0&&last==M);result.order[0]=s;result.key[0]=k;}
 }
 result.plain=decode(c,result.order,result.key,result.split);assert(score(result.plain,model,FIT0,FIT1)==result.fit);assert(encrypt(result.plain,result.order,result.key)==c);return result;
}
void printKey(const Key& k){for(int x:k)cout<<x<<',';}
int report(const string& name,const Solution& s,const Model& m,const Tape* truePlain=nullptr,const Key* trueOrder=nullptr,const Key* trueKey=nullptr){int held=score(s.plain,m,TEST0,TEST1);cout<<name<<" split="<<s.split<<" fit="<<double(s.fit)/(SCALE*(FIT1-FIT0)*W)<<" held="<<double(held)/(SCALE*(TEST1-TEST0)*W)<<" order=";printKey(s.order);cout<<" key=";printKey(s.key);cout<<" splitScores=";for(int v:s.splitScores)cout<<v<<',';int matches=0,heldMatches=0;if(truePlain){for(int i=0;i<N;++i){matches+=s.plain[i]==(*truePlain)[i];if(i/W>=TEST0&&i/W<TEST1)heldMatches+=s.plain[i]==(*truePlain)[i];}cout<<" match="<<matches<<" heldMatch="<<heldMatches<<" orderExact="<<(s.order==*trueOrder)<<" keyExact="<<(s.key==*trueKey);}cout<<" plain="<<repr(s.plain)<<endl;return matches;}
int main(int argc,char** argv){check_split_disjoint();if(argc<2)return 2;ifstream f(argv[1]);vector<string> names;vector<Tape> all;string name,line;Tape original;while(f>>name>>line){Tape p;for(char c:line){int d=digit(c);assert(d>=0&&d<Q);p.push_back(d);}if(name=="ORIGINAL")original=p;else{names.push_back(name);all.push_back(p);}}assert(original.size()==N&&all.size()==9);RNG rng{0x45330113};int passed=0;double minNative=1e9,maxNull=-1e9;for(int id=0;id<4;++id){int target=id%2?4:3;int offset=id/2?all[target].size()-N:0;Tape p(all[target].begin()+offset,all[target].begin()+offset+N);Key order{},key{};iota(order.begin(),order.end(),0);for(int j=W-1;j>0;--j)swap(order[j],order[rng.pick(j+1)]);for(int& k:key)k=rng.pick(Q);auto model=train(all,target);auto s=attack(encrypt(p,order,key),model);int n=report("CONTROL"+to_string(id),s,model,&p,&order,&key);passed+=n==N&&s.order==order&&s.key==key;minNative=min(minNative,double(score(s.plain,model,TEST0,TEST1))/(SCALE*(TEST1-TEST0)*W));}
 auto model=train(all,-1);for(int id=0;id<2;++id){Tape c(N);for(int i=0;i<N;++i){c[i]=rng.pick(Q);if(id&&i&&c[i]==c[i-1]&&rng.pick(1000)>=66)c[i]=(c[i]+1+rng.pick(Q-1))%Q;}auto s=attack(c,model);report("NULL"+to_string(id),s,model);maxNull=max(maxNull,double(score(s.plain,model,TEST0,TEST1))/(SCALE*(TEST1-TEST0)*W));}cout<<"GATE "<<passed<<"/4 native exact; minNative="<<minNative<<" maxNull="<<maxNull<<endl;
 if(passed==4&&minNative>maxNull&&argc>2&&string(argv[2])=="--original"){auto s=attack(original,model);report("ORIGINAL",s,model);}
}
