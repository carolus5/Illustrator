// ============================================================
// Cuadrícula Isométrica 120° en mm — Versión Compatible MacOS
// ============================================================

(function () {
    if (app.documents.length === 0) {
        alert("No hay ningún documento abierto.");
        return;
    }

    var doc = app.activeDocument;
    var MM = 2.83464567; // Puntos por mm

    // Entrada de datos mediante diálogos nativos
    var inputSize = prompt("Lado del rombo (mm):", "10", "Cuadrícula Isométrica 120°");
    if (inputSize === null) return;

    var inputWidth = prompt("Grosor de línea (mm):", "0.2", "Cuadrícula Isométrica 120°");
    if (inputWidth === null) return;

    var lado_mm = Number(inputSize);
    var strokeW = Number(inputWidth) * MM;

    if (!(isFinite(lado_mm) && lado_mm > 0)) {
        alert("El lado debe ser un número mayor que 0.");
        return;
    }
    if (!(isFinite(strokeW) && strokeW > 0)) {
        alert("El grosor debe ser un número mayor que 0.");
        return;
    }

    // Conversión del lado real del rombo → separación entre líneas
    var sin60 = Math.sin(60 * Math.PI / 180);
    var gridSize = lado_mm * MM * sin60;

    // Ángulos isométricos (120°)
    var slope210 = Math.tan(210 * Math.PI / 180); // negativa
    var slope330 = Math.tan(330 * Math.PI / 180); // positiva

    // Artboard del documento
    var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;
    var left   = ab[0];
    var top    = ab[1];
    var right  = ab[2];
    var bottom = ab[3];
    var height = top - bottom;

    // Capa de guías
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

    // Iterador seguro
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

    // Margen geométrico
    var dx330 = Math.abs(height / slope330);
    var dx210 = Math.abs(height / slope210);
    var margin = dx330 + dx210 + 4 * gridSize;

    var startX = left - margin;
    var endX   = right + margin;

    // Familia 1: Verticales
    forStep(startX, endX, gridSize / 2, function (x) {
        makeGuide(x, bottom, x, top);
    });

    // Familia 2: Diagonales 330°
    forStep(startX, endX, gridSize, function (x0) {
        var xTop = x0 + (top / slope330);
        var xBot = x0 + (bottom / slope330);
        makeGuide(xTop, top, xBot, bottom);
    });

    // Familia 3: Diagonales 210°
    forStep(startX, endX, gridSize, function (x0) {
        var xTop = x0 + (top / slope210);
        var xBot = x0 + (bottom / slope210);
        makeGuide(xTop, top, xBot, bottom);
    });

    // Bloquear capa
    layer.locked = true;

    alert("Cuadrícula isométrica generada correctamente.");
})();
