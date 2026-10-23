import { Link } from "react-router-dom";

// Enlace interno de la feature. Envuelve <Link> de react-router-dom.
export default function Enlace({ a, children, ...props }) {
  return (
    <Link to={a} {...props}>
      {children}
    </Link>
  );
}
