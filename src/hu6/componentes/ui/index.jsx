// Componentes de interfaz reutilizables (sistema de diseño del PDF).
import { useEffect } from "react";

export function Boton({ variante = "primario", className = "", ...props }) {
  return <button type="button" className={`boton boton--${variante} ${className}`} {...props} />;
}

export function Etiqueta({ tono = "neutro", children }) {
  return <span className={`etiqueta etiqueta--${tono}`}>{children}</span>;
}

const ICONOS = { exito: "✓", aviso: "!", error: "!", info: "i" };

export function Alerta({ tipo = "info", titulo, children, className = "" }) {
  return (
    <div className={`alerta alerta--${tipo} ${className}`} role={tipo === "error" ? "alert" : "status"}>
      <span className="alerta__icono" aria-hidden="true">{ICONOS[tipo]}</span>
      <div>
        {titulo && <strong className="alerta__titulo">{titulo}</strong>}
        {children}
      </div>
    </div>
  );
}

export function Tarjeta({ titulo, etiqueta, acciones, className = "", children }) {
  return (
    <section className={`tarjeta ${className}`}>
      {(titulo || etiqueta) && (
        <header className="tarjeta__cabecera">
          {titulo ? <h2 className="titulo-seccion">{titulo}</h2> : <span className="etiqueta-mayus">{etiqueta}</span>}
          {acciones}
        </header>
      )}
      {children}
    </section>
  );
}

export function Campo({ etiqueta, ayuda, htmlFor, children }) {
  return (
    <div className="campo">
      <label className="etiqueta-mayus" htmlFor={htmlFor}>{etiqueta}</label>
      {children}
      {ayuda && <p className="campo__ayuda">{ayuda}</p>}
    </div>
  );
}

export function Segmentado({ opciones, valor, onChange, deshabilitado = false, nombre }) {
  return (
    <div className="segmentado" role="radiogroup" aria-label={nombre}>
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={valor === o.valor}
          disabled={deshabilitado}
          className={`segmentado__op ${valor === o.valor ? "segmentado__op--activo" : ""}`}
          onClick={() => onChange(o.valor)}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

export function Modal({ titulo, onCerrar, children }) {
  useEffect(() => {
    const alTeclear = (e) => e.key === "Escape" && onCerrar?.();
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [onCerrar]);

  return (
    <div className="dialogo-fondo no-print" onClick={onCerrar}>
      <div className="dialogo" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <h2 className="titulo-seccion">{titulo}</h2>
        {children}
      </div>
    </div>
  );
}

export function Migas({ children }) {
  return <p className="migas">{children}</p>;
}

export function EncabezadoPagina({ titulo, subtitulo, acciones, serif = false }) {
  return (
    <div className="encabezado-pagina">
      <div>
        <h1 className="titulo-pantalla">{titulo}</h1>
        {subtitulo && <p className={`subtitulo-pagina ${serif ? "subtitulo-pagina--serif" : ""}`}>{subtitulo}</p>}
      </div>
      {acciones}
    </div>
  );
}
