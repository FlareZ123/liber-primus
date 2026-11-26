#include <algorithm>
#include <array>
#include <fstream>
#include <iostream>
#include <string>
#include <unordered_set>
#include <vector>
using namespace std;
const string S="0123456789abcdefghijklmnopqrs";
int main(int n,char**a){unordered_set<string>D;ifstream l(a[1]),h(a[2]),f(a[3]);string w;while(l>>w)D.insert(w);vector<string>C;while(h>>w)C.push_back(w);array<int,8>k{};for(int i=0;i<8;i++)k[i]=S.find(a[4][i]);string line;array<unsigned long long,18>hist{};unsigned long long total=0;while(getline(f,line)){auto pos=line.find("\"candidate\":\"");if(pos==string::npos)continue;auto sig=line.substr(pos+13,29);if(sig.size()!=29)throw 1;array<int,29>I{};for(int i=0;i<29;i++){auto v=S.find(sig[i]);if(v>=29)throw 2;I[v]=i;}int score=0;for(auto&c:C){string p;auto go=[&](auto&&self,int i,int j)->bool{if(i==(int)c.size())return D.count(p);int x=S.find(c[i]);if(x==0){p+='0';if(self(self,i+1,j))return true;p.pop_back();}int y=I[(x+29-k[j])%29];if(y){p+=S[y];if(self(self,i+1,(j+1)%8))return true;p.pop_back();}return false;};bool good=false;for(int j=0;j<8&&!good;j++){p.clear();good=go(go,0,j);}score+=good;}hist[score]++;total++;if(score==17)cout<<sig<<'\n';}cerr<<"total="<<total<<" histogram=";for(int j=0;j<=17;j++)cerr<<j<<":"<<hist[j]<<" ";cerr<<"\n";}
