#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
const string A="0123456789abcdefghijklmnopqrs";
using Vec=vector<int>;
int mod(int a){a%=29;return a<0?a+29:a;}
Vec decode(const string &s){Vec v;for(char c:s)v.push_back(A.find(c));return v;}
int inv[29];
// Necessary local linear test: in a homogeneous GF29 system with x0=0,
// no two glyph-coordinate linear forms may be identically equal.
bool linear_ok(const vector<array<int,3>> &eqs){
    int basis[29][29]{};bool used[29]{};
    for(auto &e:eqs){int row[29]{};if(e[0])row[e[0]]++;if(e[1])row[e[1]]--;if(e[2])row[e[2]]--;
        for(int j=1;j<29;j++)row[j]=mod(row[j]);
        for(int p=1;p<29;p++)if(row[p]){
            if(used[p]){int m=row[p];for(int j=p;j<29;j++)row[j]=mod(row[j]-m*basis[p][j]);}
            else {int m=inv[row[p]];for(int j=p;j<29;j++)basis[p][j]=mod(row[j]*m);used[p]=true;break;}
        }
    }
    for(int p=28;p>=1;p--)if(used[p])for(int k=1;k<p;k++)if(used[k]&&basis[k][p]){int m=basis[k][p];for(int j=p;j<29;j++)basis[k][j]=mod(basis[k][j]-m*basis[p][j]);}
    array<array<int,29>,29> form{};
    for(int p=1;p<29;p++)if(!used[p])form[p][p]=1;else for(int j=1;j<29;j++)if(!used[j])form[p][j]=mod(-basis[p][j]);
    for(int a=0;a<29;a++)for(int b=0;b<a;b++)if(form[a]==form[b])return false;
    return true;
}
uint16_t compatible(const Vec &c,const Vec &p,const Vec &k){
    uint16_t mask=0;
    for(int start=0;start<13;start++){
        int j=start;bool ok=true;vector<array<int,3>> eq;
        for(size_t t=0;t<c.size();t++){
            int x=c[t],y=p[t];
            if(y==0){if(x!=0){ok=false;break;}continue;}
            int z=k[j];j=(j+1)%13;
            if(z==0){if(y!=x){ok=false;break;}}
            else if(x==0){if(y!=z){ok=false;break;}}
            else if(y==x||y==z){ok=false;break;}
            else eq.push_back({y,x,z});
        }
        if(ok&&linear_ok(eq))mask|=1<<start;
    }
    return mask;
}
int main(int argc,char**argv){assert(argc==4);for(int i=1;i<29;i++)for(int j=1;j<29;j++)if(i*j%29==1)inv[i]=j;
    vector<vector<pair<string,Vec>>> dictionary(30);
    ifstream din(argv[1]);string w;long freq;while(din>>w>>freq)if(w.size()<dictionary.size()&&(w.size()!=1||w=="3"||w=="a"||w=="o"))dictionary[w.size()].push_back({w,decode(w)});
    ifstream ci(argv[2]);ofstream out(argv[3]);string h1,h2;ci>>h1>>h2;Vec key=decode(h1+h2);assert(key.size()==13);int offset=0;int idx=0;while(ci>>w){Vec c=decode(w);out<<offset<<'\t'<<w<<'\t';int count=0;array<int,13> counts{};for(auto &[s,p]:dictionary[w.size()]){uint16_t m=compatible(c,p,key);if(m){out<<s<<':'<<m<<',';count++;for(int j=0;j<13;j++)if(m&(1<<j))counts[j]++;}}out<<'\n';cerr<<idx++<<" @"<<offset<<" "<<w<<" domain="<<count<<" phases=";for(auto n:counts)cerr<<n<<',';cerr<<'\n';offset+=w.size();}
}
