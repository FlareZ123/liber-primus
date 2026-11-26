#include <cstdint>
#include <algorithm>
#include <array>
#include <cassert>
#include <cmath>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <map>
#include <sstream>
#include <vector>
using namespace std;
float lp[30*30*29];
int mod(int x){return (x%29+29)%29;}
int main(int argc,char**argv){if(argc!=5)return 1;ifstream m(argv[1],ios::binary);m.read(reinterpret_cast<char*>(lp),sizeof(lp));assert(m.gcount()==sizeof(lp));ifstream in(argv[2]);string line,s;getline(in,line);stringstream ss(line);vector<int>C;while(getline(ss,s,','))C.push_back(stoi(s));assert(C.size()==716);int sign=stoi(argv[3]);stringstream ks(argv[4]);map<int,int> hist;while(getline(ks,s,','))hist[stoi(s)]++;vector<int>K,cap,stride;int S=1;for(auto [k,n]:hist){K.push_back(k);cap.push_back(n);stride.push_back(S);S*=n+1;}int D=K.size(),D2=D*D,D3=D2*D;vector<int> cnt(S*D),len(S);for(int st=0;st<S;st++)for(int a=0;a<D;a++){int n=(st/stride[a])%(cap[a]+1);cnt[st*D+a]=n;len[st]+=n;}assert(len.back()==13);vector<double> W(13*D3);for(int i=2;i<(int)C.size();i++)for(int a=0;a<D;a++)for(int b=0;b<D;b++)for(int c=0;c<D;c++){int x=mod(C[i-2]+sign*K[a]),y=mod(C[i-1]+sign*K[b]),z=mod(C[i]+sign*K[c]);W[(i%13)*D3+a*D2+b*D+c]+=lp[(x*30+y)*29+z];}auto w=[&](int q,int a,int b,int c){return W[q*D3+a*D2+b*D+c];};auto index=[&](int st,int a,int b){return st*D2+a*D+b;};vector<double> v(S*D2);vector<int8_t> prev(S*D2);double best=-1e100;vector<int> bestkey;uint64_t states=0;
for(int a=0;a<D;a++)for(int b=0;b<D;b++){if(a==b&&cap[a]<2)continue;fill(v.begin(),v.end(),-1e100);int st0=stride[a]+stride[b];int x=mod(C[0]+sign*K[a]),y=mod(C[1]+sign*K[b]);v[index(st0,a,b)]=lp[(29*30+29)*29+x]+lp[(29*30+x)*29+y];for(int st=st0;st<S-1;st++){int q=len[st];if(q<2||cnt[st*D+a]<(a==b?2:1)||cnt[st*D+b]<1)continue;for(int l=0;l<D;l++)for(int t=0;t<D;t++){double cur=v[index(st,l,t)];if(cur<-1e90)continue;states++;for(int c=0;c<D;c++){if(cnt[st*D+c]==cap[c])continue;int ni=index(st+stride[c],t,c);double z=cur+w(q,l,t,c);if(z>v[ni]){v[ni]=z;prev[ni]=l;}}}}for(int l=0;l<D;l++)for(int t=0;t<D;t++){double z=v[index(S-1,l,t)]+w(0,l,t,a)+w(1,t,a,b);if(z>best){best=z;vector<int> k(13);int st=S-1,i=12,pp=l,qq=t;while(i>=2){k[i--]=K[qq];int old=prev[index(st,pp,qq)];st-=stride[qq];qq=pp;pp=old;}k[0]=K[a];k[1]=K[b];bestkey=k;}}}
vector<int>P;double replay=0;int a=29,b=29;for(int i=0;i<(int)C.size();i++){int x=mod(C[i]+sign*bestkey[i%13]);P.push_back(x);replay+=lp[(a*30+b)*29+x];a=b;b=x;}assert(abs(replay-best)<1e-6);cout<<setprecision(12)<<"sign="<<sign<<" score="<<best/C.size()<<" states="<<states<<" key=";for(int k:bestkey)cout<<k<<',';cout<<" plain=";for(int x:P)cout<<x<<',';cout<<'\n';}
