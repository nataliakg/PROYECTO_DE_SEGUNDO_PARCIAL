"use strict";

const entradaBusqueda = document.getElementById("buscar-producto");
const botonLimpiar = document.getElementById("limpiar-busqueda");
const resultadoBusqueda = document.getElementById("resultado-busqueda");
const filtroDisponibilidad = document.getElementById("filtro-disponibilidad");
const productos = Array.from(document.querySelectorAll(".productos"));

if (!entradaBusqueda || !botonLimpiar || !resultadoBusqueda || !filtroDisponibilidad) {
    throw new Error("No se encontraron los elementos del buscador.");
}

function normalizarTexto(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function obtenerDisponibilidad(producto) {
    const lineasDisponibilidad = Array.from(producto.querySelectorAll(".inventario p"))
        .map((linea) => normalizarTexto(linea.textContent));
    const lineaDisponibilidad = lineasDisponibilidad.find((linea) =>
        linea.startsWith("disponibilidad:")
    );

    if (!lineaDisponibilidad) {
        return "sin-datos";
    }

    if (lineaDisponibilidad.includes("no disponible") || lineaDisponibilidad.includes("agotado")) {
        return "no-disponible";
    }

    if (lineaDisponibilidad.includes("disponible")) {
        return "disponible";
    }

    return "sin-datos";
}

function buscarProductos() {
    const textoBuscado = normalizarTexto(entradaBusqueda.value);
    const disponibilidadSeleccionada = filtroDisponibilidad.value;
    let productosEncontrados = 0;

    productos.forEach((producto) => {
        const titulo = producto.querySelector("h2");
        const imagen = producto.querySelector("img");
        const textoProducto = `${titulo ? titulo.textContent : ""} ${imagen ? imagen.alt : ""}`;
        const inventario = normalizarTexto(producto.querySelector(".inventario")?.textContent || "");
        const disponibilidad = obtenerDisponibilidad(producto);
        const estaDisponible = disponibilidad === "disponible";
        const estaNoDisponible = disponibilidad === "no-disponible";

        const coincideConTexto = normalizarTexto(textoProducto).includes(textoBuscado);
        const coincideConDisponibilidad =
            disponibilidadSeleccionada === "todos" ||
            (disponibilidadSeleccionada === "disponible" &&
                estaDisponible) ||
            (disponibilidadSeleccionada === "agotado" && inventario.includes("no disponible"));
        const coincide = coincideConTexto && coincideConDisponibilidad;
        producto.classList.toggle("producto-disponible", estaDisponible);
        producto.classList.toggle("producto-no-disponible", estaNoDisponible);
        producto.hidden = !coincide;
        producto.setAttribute("aria-hidden", String(!coincide));

        if (coincide) {
            productosEncontrados += 1;
        }
    });

    if (textoBuscado === "" && disponibilidadSeleccionada === "todos") {
        resultadoBusqueda.textContent = `${productos.length} productos disponibles`;
    } else if (productosEncontrados === 0) {
        resultadoBusqueda.textContent = "No se encontraron productos.";
    } else {
        resultadoBusqueda.textContent = `${productosEncontrados} producto${productosEncontrados === 1 ? "" : "s"} encontrado${productosEncontrados === 1 ? "" : "s"}`;
    }
}

entradaBusqueda.addEventListener("input", buscarProductos);
filtroDisponibilidad.addEventListener("change", buscarProductos);

botonLimpiar.addEventListener("click", () => {
    entradaBusqueda.value = "";
    filtroDisponibilidad.value = "todos";
    buscarProductos();
    entradaBusqueda.focus();
});

buscarProductos();
