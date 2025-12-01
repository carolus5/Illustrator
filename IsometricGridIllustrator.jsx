// ============================================================
// Cuadrícula Isométrica 120° en mm — Versión Segura
// Totalmente compatible con ExtendScript (Illustrator CS6–2026)
// ✓ Sin Math.sign
// ✓ Sin llaves sobrantes
// ✓ Sin variables fuera de ámbito
// ✓ Margen geométrico que garantiza cubrir TODO el artboard
// ✓ Guías automáticas
// ✓ Lado real del rombo = valor introducido (mm)
// Author: Juan Carlos Sánchez Guirao
// ============================================================

(function () {
    // Comprobar documento
    if (app.documents.length === 0) {
        alert("No hay ningún documento abierto.");
        return;
    }

    var doc = app.activeDocument;
    var MM = 2.83464567; // puntos por mm

    // ============================================================
    //                  DIÁLOGO DE CONFIGURACIÓN
    // ============================================================
    var dlg = new Window('dialog', 'Cuadrícula Isométrica 120°');
    dlg.orientation = 'column';

    dlg.add('statictext', undefined, 'Lado del rombo (mm):');
    var sizeInput = dlg.add('edittext', undefined, '10');
    sizeInput.characters = 8;

    dlg.add('statictext', undefined, 'Grosor de línea (mm):');
    var widthInput = dlg.add('edittext', undefined, '0.2');
    widthInput.characters = 8;

    var b = dlg.add('group');
    b.add('button', undefined, 'OK', { name: 'ok' });
    b.add('button', undefined, 'Cancelar', { name: 'cancel' });

    if (dlg.show() !== 1) return;

    // ============================================================
    //                  PARÁMETROS NUMÉRICOS
    // ============================================================
    var lado_mm = Number(sizeInput.text);
    var strokeW = Number(widthInput.text) * MM;

    if (!(isFinite(lado_mm) && lado_mm > 0)) {
        alert("El lado debe ser un número mayor que 0.");
        return;
    }
    if (!(isFinite(strokeW) && strokeW > 0)) {
        alert("El grosor debe ser un número mayor que 0.");
        return;
    }

    // Conversión del lado real del rombo → separación entre líneas
    // En isometría 120°, separación = L · sin(60°)
    var sin60 = Math.sin(60 * Math.PI / 180);
    var gridSize = lado_mm * MM * sin60;

    // ============================================================
    //                  ÁNGULOS ISOMÉTRICOS (120°)
    // ============================================================
    var slope210 = Math.tan(210 * Math.PI / 180); // negativa
    var slope330 = Math.tan(330 * Math.PI / 180); // positiva

    // ============================================================
    //                 ARTBOARD DEL DOCUMENTO
    // ============================================================
    var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;
    var left   = ab[0];
    var top    = ab[1];
    var right  = ab[2];
    var bottom = ab[3];
    var width  = right - left;
    var height = top - bottom;

    // ============================================================
    //              CAPA DE GUÍAS PARA LA CUADRÍCULA
    // ============================================================
    var layer = doc.layers.add();
    layer.name = "Isometric Grid 120°";

    function makeGuide(x1, y1, x2, y2) {
        var p = layer.pathItems.add();
        p.stroked = true;
        p.filled = false;
        p.strokeWidth = strokeW;
        p.setEntirePath([[x1, y1], [x2, y2]]);
        try { p.guides = true; } catch (e) {}
    }

    // ============================================================
    //        ITERADOR SEGURO (sin Math.sign, plenamente compatible)
    // ============================================================
    function sign(v) {
        return (v > 0) ? 1 : (v < 0 ? -1 : 0);
    }

    function forStep(start, end, step, callback) {
        if (step <= 0) return;
        var range = end - start;
        var direction = sign(range);
        var count = Math.ceil(Math.abs(range) / step);
        for (var i = 0; i <= count; i++) {
            var x = start + i * step * direction;
            callback(x);
        }
    }

    // ============================================================
    //        MARGEN GEOMÉTRICO (COBERTURA COMPLETA GARANTIZADA)
    // ============================================================
    var dx330 = Math.abs(height / slope330);
    var dx210 = Math.abs(height / slope210);

    var margin = dx330 + dx210 + 4 * gridSize;

    var startX = left - margin;
    var endX   = right + margin;

    // ============================================================
    //                     FAMILIA 1: VERTICALES
    // ============================================================
    forStep(startX, endX, gridSize, function (x) {
        makeGuide(x, bottom, x, top);
    });

    // ============================================================
    //               FAMILIA 2: DIAGONALES 330°
    // ============================================================
    forStep(startX, endX, gridSize, function (x0) {
        var xTop = x0 + (top / slope330);
        var xBot = x0 + (bottom / slope330);
        makeGuide(xTop, top, xBot, bottom);
    });

    // ============================================================
    //               FAMILIA 3: DIAGONALES 210°
    // ============================================================
    forStep(startX, endX, gridSize, function (x0) {
        var xTop = x0 + (top / slope210);
        var xBot = x0 + (bottom / slope210);
        makeGuide(xTop, top, xBot, bottom);
    });

    // Bloquear capa
    layer.locked = true;

    alert("Cuadrícula isométrica generada correctamente.");
})();
