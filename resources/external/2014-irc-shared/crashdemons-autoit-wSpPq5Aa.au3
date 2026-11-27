#include <Color.au3>

HotKeySet('{F1}','on')
HotKeySet('{F2}','off')

Global $p[2]=[0,0]
Global $on=0

While 1
	If $on Then
		Local $c1=PixelGetColor($p[0]-100,$p[1])
		Local $c2=PixelGetColor($p[0]+100,$p[1])
		Switch cmp($c1,$c2)
			Case +1
				MouseMove($p[0]-100,$p[1],0)
			Case -1
				MouseMove($p[0]+100,$p[1],0)
		EndSwitch
		MouseClick('left')
		Sleep(100)
	EndIf
WEnd


Func on()
	$p=MouseGetPos()
	$on=1
EndFunc
Func off()
	$on=0
EndFunc

Func cmp($c1,$c2)
	Local $a1=_ColorGetRGB ($c1)
	Local $a2=_ColorGetRGB ($c2)
	Local $diff=0
	For $i=0 To 2
		$diff +=  $a1[$i]-$a2[$i]
	Next
	If $diff<0 Then Return -1
	If $diff>0 Then Return +1

EndFunc