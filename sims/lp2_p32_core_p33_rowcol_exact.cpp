#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <numeric>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;
using U=uint64_t;using Perm=array<int,9>;using Row=array<uint8_t,9>;
const string ALPH="0123456789abcdefghijklmnopqrs";int LIMIT=3;
int dig(char c){auto p=ALPH.find(c);assert(p<29);return int(p);}
int mod(int x){return (x+29)%29;}
struct Lex{
 array<vector<uint32_t>,5> small;array<unordered_map<U,uint32_t>,10> big; U pow[10];
 Lex(){pow[0]=1;for(int i=1;i<10;i++)pow[i]=29*pow[i-1];for(int i=1;i<=4;i++)small[i].resize(pow[i]);}
 void add(const string&s,uint32_t freq){int n=s.size();if(n<1||n>9)return;U code=0;for(char c:s)code=29*code+dig(c);if(n<=4)small[n][code]=freq;else big[n][code]=freq;}
 inline uint32_t get(int n,U code)const{if(n<=4)return small[n][code];auto it=big[n].find(code);return it==big[n].end()?0:it->second;}
};
struct Word{int off,len;};struct Cross{int start=0,len=0;};
struct Case{string name,C,P;vector<int>lens;int sign,trans;Perm rp,cp;};
struct Solver{
 const Lex&lex;const array<int,81>&K;const Case&ca;
 array<vector<Word>,9>words;array<Cross,8>cross{};array<int,81>C{};
 Row dec[9][9];int un[9][9],cr[8][9][9],suf[9][9];Perm col,row;
 int sign,trans;U count=0,truth=0,cols=0,passUnary=0,passRelax=0,nodes=0;
 int best=999,bestCorrect=-1;vector<string>witnesses;vector<U>hist=vector<U>(LIMIT+1);array<U,4>countByFamily{};
 Solver(const Lex&l,const array<int,81>&k,const Case&c):lex(l),K(k),ca(c){
  int pos=0;for(int n:ca.lens){assert(n>=1&&n<=9);int r=pos/9,a=pos%9;
   if(a+n<=9)words[r].push_back({a,n});else{assert(r<8&&cross[r].len==0);cross[r]={a,n};}pos+=n;
  }assert(pos==81);for(int i=0;i<81;i++)C[i]=dig(ca.C[i]);
 }
 U wordcode(const Row&r,int off,int len){U code=0;for(int i=off;i<off+len;i++)code=29*code+r[i];return code;}
 U seamcode(const Row&a,const Row&b,const Cross&w){int n=9-w.start;return wordcode(a,w.start,n)*lex.pow[w.len-n]+wordcode(b,0,w.len-n);}
 void found(int miss){
  count++;hist[miss]++;countByFamily[2*trans+(sign==-1)]++;best=min(best,miss);
  string p;for(int r=0;r<9;r++)for(int c=0;c<9;c++){
   int x=dec[r][row[r]][c];p+=ALPH[x];int k=trans?K[col[c]*9+row[r]]:K[row[r]*9+col[c]];assert(mod(x+sign*k)==C[9*r+c]);
  }
  if(ca.P!="-"){int correct=0;for(int i=0;i<81;i++)correct+=(p[i]==ca.P[i]);
   bestCorrect=max(bestCorrect,correct);if(p==ca.P&&row==ca.rp&&col==ca.cp&&trans==ca.trans&&sign==ca.sign)truth++;
  }
  if(witnesses.size()<30){
   string w="sign="+to_string(sign)+" transpose="+to_string(trans)+" OOV="+to_string(miss)+" rows=";
   for(int i:row)w+=char('0'+i);w+=" cols=";for(int i:col)w+=char('0'+i);w+=" P=";int pos=0;
   for(int l:ca.lens){w+=p.substr(pos,l)+" ";pos+=l;}witnesses.push_back(w);
  }
 }
 // The suffix DP relaxes all-different except at each adjacent seam.
 void dfs(int r,int used,int miss){
  nodes++;if(r==9){found(miss);return;}
  for(int k=0;k<9;k++)if(!(used&(1<<k))){
   int x=miss+un[r][k]+(r?cr[r-1][row[r-1]][k]:0);
   if(x+suf[r][k]<=LIMIT){row[r]=k;dfs(r+1,used|(1<<k),x);}
  }
 }
 void check(){
  cols++;int floor=0;Row keyrows[9];
  for(int k=0;k<9;k++)for(int c=0;c<9;c++)keyrows[k][c]=uint8_t(mod(-sign*(trans?K[col[c]*9+k]:K[k*9+col[c]])));
  for(int r=0;r<9;r++){int m=99;for(int k=0;k<9;k++){
   auto&v=dec[r][k];for(int c=0;c<9;c++)v[c]=uint8_t(mod(C[r*9+c]+keyrows[k][c]));
   int miss=0;for(auto w:words[r])miss+=!lex.get(w.len,wordcode(v,w.off,w.len));un[r][k]=miss;m=min(m,miss);
  }floor+=m;if(floor>LIMIT)return;}
  passUnary++;for(int k=0;k<9;k++)suf[8][k]=0;
  for(int r=7;r>=0;r--){const auto&w=cross[r];int lo=99;
   for(int k=0;k<9;k++){int b=99;for(int l=0;l<9;l++)if(k!=l){
    int x=w.len?(!lex.get(w.len,seamcode(dec[r][k],dec[r+1][l],w))):0;cr[r][k][l]=x;b=min(b,x+un[r+1][l]+suf[r+1][l]);
   }suf[r][k]=b;lo=min(lo,un[r][k]+b);}if(lo>LIMIT)return;
  }
  passRelax++;dfs(0,0,0);
 }
 void run(){
  for(trans=0;trans<2;trans++)for(sign=1;sign>=-1;sign-=2){
   iota(col.begin(),col.end(),0);do{check();}while(next_permutation(col.begin(),col.end()));
   cerr<<ca.name<<" finished family "<<trans<<","<<sign<<" count "<<count<<" columns "<<cols<<" unary "<<passUnary<<" relaxed "<<passRelax<<" nodes "<<nodes<<"\n";
  }
  cout<<ca.name<<" cols="<<cols<<" unary="<<passUnary<<" relaxed="<<passRelax<<" nodes="<<nodes<<" keys="<<count<<" true="<<truth<<" maxCorrect="<<bestCorrect<<" bestOOV="<<best<<" hist=";
  for(U a:hist)cout<<a<<",";cout<<" families=";for(U a:countByFamily)cout<<a<<",";cout<<"\n";
  for(auto&w:witnesses)cout<<w<<"\n";
 }
};
int main(int argc,char**argv){
 if(argc>1){LIMIT=stoi(argv[1]);assert(LIMIT>=0&&LIMIT<=21);}
 ios::sync_with_stdio(false);cin.tie(nullptr);Lex l;int n;cin>>n;
 for(int i=0;i<n;i++){string s;uint32_t f;cin>>s>>f;l.add(s,f);}
 string k;cin>>k;array<int,81>K;assert(k.size()==81);for(int i=0;i<81;i++)K[i]=dig(k[i]);
 int cases;cin>>cases;while(cases--){
  Case c;int w;cin>>c.name>>c.C>>w;c.lens.resize(w);for(int&i:c.lens)cin>>i;
  cin>>c.P>>c.sign>>c.trans;for(int&i:c.rp)cin>>i;for(int&i:c.cp)cin>>i;
  Solver(l,K,c).run();cout.flush();
 }
}
