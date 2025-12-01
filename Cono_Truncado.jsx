// =====================================================
// cono_truncado_UI_simple.jsx
// Generador de desarrollo de cono truncado (1 sola pieza)
// - Resolución adaptativa
// - Sin Pathfinder
// - Sin solapa
// - Sin copias ni cuadrícula
// - ScriptUI minimal
// - Pieza centrada y vertical
// - Autoajuste del artboard
// Compatible CS6 → 2026
// =====================================================

(function () {

    // Usamos el mismo factor que en el PHP para Illustrator: 2.833524
    function mmToPt(v) { return v * 2.833524; }

    function angleStepForRadius(radius_mm, targetSegLen_mm) {
        var circ = 2 * Math.PI * Math.max(radius_mm,0.001);
        var steps = Math.max(6, Math.min(3600, Math.round(circ / targetSegLen_mm)));
        return 360 / steps;
    }

    function pointOnCircle(radius_mm, degrees) {
        var rad = degrees * Math.PI / 180;
        var x = radius_mm * Math.sin(rad);
        var y = radius_mm * Math.cos(rad);
        return [mmToPt(x), mmToPt(y)];
    }

    function makeRGB(r,g,b){
        var c=new RGBColor();
        c.red=r; c.green=g; c.blue=b;
        return c;
    }

    // ============= UI ==============
    var dlg = new Window('dialog','Cono truncado (simple)');
    dlg.orientation='column';
    dlg.margins=12;

    var p1=dlg.add('panel',undefined,'Dimensiones (mm)');
    p1.orientation='column'; p1.margins=10;

    var g1=p1.add('group');
    g1.add('statictext',undefined,'Radio mayor:');
    var inMayor=g1.add('edittext',undefined,'50'); inMayor.characters=8;

    var g2=p1.add('group');
    g2.add('statictext',undefined,'Radio menor:');
    var inMenor=g2.add('edittext',undefined,'20'); inMenor.characters=8;

    var g3=p1.add('group');
    g3.add('statictext',undefined,'Altura:');
    var inAltura=g3.add('edittext',undefined,'80'); inAltura.characters=8;

    var p2=dlg.add('panel',undefined,'Calidad curva');
    p2.orientation='column'; p2.margins=10;

    var g4=p2.add('group');
    g4.add('statictext',undefined,'Segm. objetivo (mm):');
    var inSeg=g4.add('edittext',undefined,'0.7'); inSeg.characters=6;

    // Checkbox para anotaciones
    var chkInfo = p2.add('checkbox', undefined, 'Mostrar anotaciones', true);

    var btns=dlg.add('group');
    btns.alignment='right';
    btns.add('button',undefined,'Cancelar',{name:'cancel'});
    btns.add('button',undefined,'Generar',{name:'ok'});

    if(dlg.show()!==1) return;

    // =========== Read UI ===========
    var mayor  = parseFloat(inMayor.text);
    var menor  = parseFloat(inMenor.text);
    var altura = parseFloat(inAltura.text);
    var segLen = parseFloat(inSeg.text)||0.7;
    var drawInfo = chkInfo.value;

    if(isNaN(mayor)||isNaN(menor)||isNaN(altura) || mayor<=0 || menor<0 || altura<=0){
        alert("Valores no válidos");
        return;
    }
    if(menor>mayor){
        alert("El radio menor no puede ser mayor que el radio mayor.");
        return;
    }

    // ========== Geometría ==========
    var restaradios = mayor - menor;
    var hipo = Math.sqrt(restaradios*restaradios + altura*altura); // generatriz
    var seno = restaradios/hipo;
    var R = (seno===0)? mayor : mayor/seno;    // radio desarrollo
    var r = R - hipo;                          // radio interior
    var ang = 360*mayor/R;
    if(ang>360) ang=360;

    var step = Math.min(
        angleStepForRadius(R,segLen),
        angleStepForRadius(r,segLen)
    );

    // ========== Crear DOC ==========
    var doc;
    try{
        doc = app.documents.add(DocumentColorSpace.RGB, mmToPt(R*2+20), mmToPt(R*2+20));
    }
    catch(e){
        doc = app.documents.add();
    }

    // Intentar que el documento use mm en reglas
    try {
        app.preferences.rulerUnits = RulerUnits.Millimeters;
    } catch(e){}
    try {
        doc.rulerUnits = RulerUnits.Millimeters;
    } catch(e){}

    var layer = doc.layers.add();
    layer.name = "Cono_truncado";

    var gRoot = layer.groupItems.add();
    gRoot.name = "pieza";

    // ======== Generar puntos ========
    var half = ang/2;
    var ptsOuter = [];
    for(var a=-half; a<=half+0.0001; a+=step){
        ptsOuter.push(pointOnCircle(R,a));
    }
    ptsOuter.push(pointOnCircle(R,half));

    var ptsInner = [];
    for(var b=half; b>=-half-0.0001; b-=step){
        ptsInner.push(pointOnCircle(r,b));
    }
    ptsInner.push(pointOnCircle(r,-half));

    var all = [];
    for(var i=0;i<ptsOuter.length;i++) all.push(ptsOuter[i]);
    for(var j=0;j<ptsInner.length;j++) all.push(ptsInner[j]);

    var path = gRoot.pathItems.add();
    path.setEntirePath(all);
    path.closed  = true;
    path.filled  = false;
    path.stroked = true;
    path.strokeWidth = 0.35;
    path.strokeColor = makeRGB(0,0,0);

    // Eje vertical
    var eje = gRoot.pathItems.add();
    eje.setEntirePath([[0, mmToPt(R)],[0,-mmToPt(R)]]);
    eje.stroked = true;
    eje.filled  = false;
    eje.strokeWidth = 0.25;
    eje.strokeColor = makeRGB(150,150,150);

    // =========== Anotaciones ============
    var tf = null;
    if(drawInfo){
        var infoL = doc.layers.add();
        infoL.name = "Anotaciones";
        tf = infoL.textFrames.add();
        tf.contents =
            "Radio mayor: "          + mayor          + " mm\r" +
            "Radio menor: "          + menor          + " mm\r" +
            "Altura (vertical): "    + altura         + " mm\r" +
            "Generatriz (desarrollo): " + hipo.toFixed(2) + " mm\r" +
            "R desarrollo: "         + R.toFixed(2)   + " mm\r" +
            "r interior: "           + r.toFixed(2)   + " mm\r" +
            "Ángulo: "               + ang.toFixed(2) + "°";
        tf.textRange.characterAttributes.size = 9;
        tf.position = [mmToPt(R+10), -mmToPt(R-10)];
    }

    // ========== Calcular bounds de la pieza ==========
    var vb = gRoot.visibleBounds; // [L,T,R,B]
    var w = vb[2]-vb[0];
    var h = vb[1]-vb[3];

    // ========== Ajustar artboard ==========
    var margin = mmToPt(10); // 10 mm de margen
    var finalW = w + margin*2;
    var finalH = h + margin*2;

    try{
        var ab = doc.artboards[0];
        ab.artboardRect = [0, finalH, finalW, 0];
    }catch(e){}

    // ========== Centrar pieza en el artboard ==========
    var currentCenterX = (vb[0] + vb[2]) / 2;
    var currentCenterY = (vb[1] + vb[3]) / 2;

    var targetCenterX = finalW / 2;
    var targetCenterY = finalH / 2;

    var dx = targetCenterX - currentCenterX;
    var dy = targetCenterY - currentCenterY;

    gRoot.translate(dx, dy);
    if (tf) tf.translate(dx, dy);

    alert("Cono truncado generado.");

})();
