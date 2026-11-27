#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>
using namespace std;
using U=uint64_t; using Perm=array<int,9>;
const string A="0123456789abcdefghijklmnopqrs";
int dig(char c){return int(A.find(c));} int mod(int x){return (x+29)%29;}
struct Case{string name,C,P;vector<int>lens;int sign,trans;Perm rp,cp;};
struct Solver{
 const array<int,24389>&LM;const array<int,81>&K;const Case&ca;
 int C[9][9],v[9][9];Perm col,winR,winC;
 int sign,trans,best=-100000000,winSign=0,winTrans=0;
 U columns=0,assigned=0,ties=0;int maxgram;
 Solver(const array<int,24389>&lm,const array<int,81>&k,const Case&c):LM(lm),K(k),ca(c){
  for(int i=0;i<81;i++)C[i/9][i%9]=dig(ca.C[i]);
  maxgram=*max_element(LM.begin(),LM.end());
 }
 // Exact maximum weight bijective row assignment, via Hungarian minimization.
 int assign(Perm& row){
  int u[10]{},w[10]{},p[10]{},way[10]{};
  for(int i=1;i<=9;i++){
   p[0]=i;int j0=0,minv[10];fill(minv,minv+10,100000000);bool used[10]{};
   do{
    used[j0]=true;int i0=p[j0],delta=100000000,j1=0;
    for(int j=1;j<=9;j++)if(!used[j]){
     int cur=-v[i0-1][j-1]-u[i0]-w[j];
     if(cur<minv[j]){minv[j]=cur;way[j]=j0;}
     if(minv[j]<delta){delta=minv[j];j1=j;}
    }
    for(int j=0;j<=9;j++){if(used[j]){u[p[j]]+=delta;w[j]-=delta;}else minv[j]-=delta;}
    j0=j1;
   }while(p[j0]!=0);
   do{int j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!=0);
  }
  int total=0;for(int j=1;j<=9;j++){row[p[j]-1]=j-1;total+=v[p[j]-1][j-1];}return total;
 }
 int key(int r,int c){return trans?K[9*col[c]+r]:K[9*r+col[c]];}
 void check(){
  columns++;int kv[9][9];for(int r=0;r<9;r++)for(int c=0;c<9;c++)kv[r][c]=mod(-sign*key(r,c));
  int bound=0;
  for(int i=0;i<9;i++){
   int mx=-100000000;for(int r=0;r<9;r++){
    int a=mod(C[i][0]+kv[r][0]),b=mod(C[i][1]+kv[r][1]),s=0;
    for(int j=2;j<9;j++){int c=mod(C[i][j]+kv[r][j]);s+=LM[(a*29+b)*29+c];a=b;b=c;}
    v[i][r]=s;mx=max(mx,s);
   }
   bound+=mx;if(bound+(8-i)*7*maxgram<best)return;
  }
  if(bound<best)return;assigned++;Perm row;int s=assign(row);if(s<best)return;
  if(s>best){best=s;ties=0;winR=row;winC=col;winSign=sign;winTrans=trans;}ties++;
 }
 void run(){
  for(trans=0;trans<2;trans++)for(sign=1;sign>=-1;sign-=2){
   iota(col.begin(),col.end(),0);do{check();}while(next_permutation(col.begin(),col.end()));
   cerr<<ca.name<<" family "<<trans<<","<<sign<<" best="<<best<<" assignments="<<assigned<<"\n";
  }
  string P;for(int i=0;i<81;i++){
   int r=i/9,c=i%9;int k=winTrans?K[9*winC[c]+winR[r]]:K[9*winR[r]+winC[c]];
   int x=mod(C[r][c]-winSign*k);P+=A[x];assert(mod(x+winSign*k)==C[r][c]);
  }
  int score=0;for(int r=0;r<9;r++)for(int c=2;c<9;c++)score+=LM[(dig(P[r*9+c-2])*29+dig(P[r*9+c-1]))*29+dig(P[r*9+c])];assert(score==best);
  int correct=-1,trueScore=0;bool trueKey=false;
  if(ca.P!="-"){
   correct=0;for(int i=0;i<81;i++)correct+=P[i]==ca.P[i];
   trueKey=(winR==ca.rp&&winC==ca.cp&&winSign==ca.sign&&winTrans==ca.trans);
   for(int r=0;r<9;r++)for(int c=2;c<9;c++)trueScore+=LM[(dig(ca.P[r*9+c-2])*29+dig(ca.P[r*9+c-1]))*29+dig(ca.P[r*9+c])];assert(best>=trueScore);
  }
  cout<<ca.name<<" columns="<<columns<<" assignments="<<assigned<<" best="<<best<<" mean="<<best/63000.0<<" trueScore="<<trueScore<<" correct="<<correct<<" trueKey="<<trueKey<<" tiedColumnTuples="<<ties<<" sign="<<winSign<<" transpose="<<winTrans<<" rows=";
  for(int i:winR)cout<<i;cout<<" cols=";for(int i:winC)cout<<i;cout<<" P="<<P<<"\n";
 }
};
int main(){
 ios::sync_with_stdio(false);cin.tie(nullptr);array<int,24389>lm;for(int&i:lm)cin>>i;
 string k;cin>>k;array<int,81>K;assert(k.size()==81);for(int i=0;i<81;i++)K[i]=dig(k[i]);
 int cases;cin>>cases;while(cases--){
  Case c;int w;cin>>c.name>>c.C>>w;c.lens.resize(w);for(int&i:c.lens)cin>>i;
  cin>>c.P>>c.sign>>c.trans;for(int&i:c.rp)cin>>i;for(int&i:c.cp)cin>>i;
  Solver(lm,K,c).run();
 }
}
