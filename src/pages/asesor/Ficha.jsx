import React from "react";

function EditarFicha() {
  // Aquí puedes implementar el formulario de edición.
  return null;
}

function Ficha() {
  // Color principal verde oscuro visto en encabezados y botones
  const primaryGreen = "#123E33";
  const bgLightGreen = "#E5EFE9";
  const bgPage = "#F3F3EE";

  return (
    <main
      className="p-4 p-md-5 min-vh-100"
      style={{ backgroundColor: bgPage, fontFamily: "sans-serif" }}
    >
      {/* Encabezado */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <p className="text-secondary small mb-1">
              Inicio <span className="mx-1">·</span> Mi ficha de asesor
            </p>
          </nav>
          <h1
            className="fw-serif mb-1"
            style={{
              fontFamily: "Georgia, serif",
              color: primaryGreen,
              fontWeight: 700,
            }}
          >
            Mi ficha de asesor
          </h1>
          <p className="text-muted m-0 small">
            Así te ven los estudiantes en el directorio público.
          </p>
        </div>

        <a
          href="#editar"
          className="btn bg-white border px-4 py-2 fw-semibold shadow-sm"
          style={{
            color: primaryGreen,
            borderColor: primaryGreen,
            borderRadius: "8px",
          }}
        >
          Editar ficha
        </a>
      </div>

      {/* Contenido principal */}
      <div className="row g-4 align-items-start">
        {/* Columna izquierda */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-4">
            {/* Información del asesor */}
            <section className="card border-0 shadow-sm p-4 rounded-3 bg-white">
              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-4">
                {/* Avatar circular */}
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-semibold fs-4 flex-shrink-0"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: bgLightGreen,
                    color: primaryGreen,
                  }}
                >
                  MQ
                </div>

                <div className="d-flex flex-column gap-2">
                  <h2
                    className="h3 mb-0"
                    style={{
                      fontFamily: "Georgia, serif",
                      color: primaryGreen,
                      fontWeight: 700,
                    }}
                  >
                    Dra. Mariela Quispe Ramos
                  </h2>

                  <p className="text-secondary small mb-1">
                    Doctor · Departamento de Ingeniería de Sistemas ·{" "}
                    <span className="text-muted">mquispe@ulima.edu.pe</span>
                  </p>

                  <div className="d-flex flex-wrap gap-2 mt-1">
                    <span
                      className="badge font-weight-normal px-3 py-2 fw-semibold"
                      style={{
                        backgroundColor: bgLightGreen,
                        color: primaryGreen,
                        fontSize: "0.825rem",
                      }}
                    >
                      Ciencia de datos aplicada
                    </span>
                    <span
                      className="badge font-weight-normal px-3 py-2 fw-semibold"
                      style={{
                        backgroundColor: bgLightGreen,
                        color: primaryGreen,
                        fontSize: "0.825rem",
                      }}
                    >
                      Innovación educativa
                    </span>
                    <span
                      className="badge font-weight-normal px-3 py-2 fw-semibold"
                      style={{
                        backgroundColor: bgLightGreen,
                        color: primaryGreen,
                        fontSize: "0.825rem",
                      }}
                    >
                      Ingeniería de software
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Experiencia */}
            <section className="card border-0 shadow-sm p-4 rounded-3 bg-white">
              <h2
                className="h4 mb-3"
                style={{
                  fontFamily: "Georgia, serif",
                  color: primaryGreen,
                  fontWeight: 700,
                }}
              >
                Experiencia
              </h2>

              <p className="text-secondary mb-4 lh-base">
                Doce años como docente investigadora en analítica educativa. Ha
                asesorado 34 trabajos de fin de carrera, con publicaciones sobre
                predicción de rendimiento académico y minería de datos en
                plataformas virtuales.
              </p>

              <hr className="text-muted opacity-25 my-3" />

              {/* Estadísticas */}
              <div className="row g-3 pt-2">
                <div className="col-6 col-md-3">
                  <span
                    className="d-block text-uppercase fw-semibold text-muted mb-1"
                    style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
                  >
                    Trabajos asesorados
                  </span>
                  <b className="fs-2 text-dark fw-bold">34</b>
                </div>

                <div className="col-6 col-md-3">
                  <span
                    className="d-block text-uppercase fw-semibold text-muted mb-1"
                    style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
                  >
                    Concluidos
                  </span>
                  <b className="fs-2 text-dark fw-bold">29</b>
                </div>

                <div className="col-6 col-md-3">
                  <span
                    className="d-block text-uppercase fw-semibold text-muted mb-1"
                    style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
                  >
                    Tiempo de revisión
                  </span>
                  <b className="fs-2 text-dark fw-bold">2.4 días</b>
                </div>

                <div className="col-6 col-md-3">
                  <span
                    className="d-block text-uppercase fw-semibold text-muted mb-1"
                    style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
                  >
                    Sustentaciones como jurado
                  </span>
                  <b className="fs-2 text-dark fw-bold">11</b>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Columna derecha */}
        <aside className="col-12 col-lg-4">
          <div className="d-flex flex-column gap-4">
            {/* Cupo de asesoría */}
            <section className="card border-0 shadow-sm p-4 rounded-3 bg-white">
              <span
                className="d-block text-uppercase fw-semibold text-muted mb-2"
                style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
              >
                Cupo de asesoría
              </span>

              <div className="d-flex align-items-baseline mb-2">
                <span
                  className="fw-bold me-2"
                  style={{ fontSize: "2rem", color: "#000" }}
                >
                  3
                </span>
                <span className="text-secondary">disponibles de 6</span>
              </div>

              {/* Barra de progreso personalizada */}
              <div
                className="progress mb-3"
                style={{ height: "8px", backgroundColor: "#E9ECEF" }}
              >
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: "50%",
                    backgroundColor: primaryGreen,
                  }}
                  aria-valuenow={50}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>

              <p className="text-muted small m-0">
                3 trabajos a cargo · 50% del cupo ocupado
              </p>
            </section>

            {/* Pendientes */}
            <section className="card border-0 shadow-sm p-4 rounded-3 bg-white">
              <span
                className="d-block text-uppercase fw-semibold text-muted mb-3"
                style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
              >
                Pendientes de tu rol
              </span>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary">Solicitudes recibidas</span>
                <b className="fw-bold text-dark fs-5">2</b>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary">Avances por revisar</span>
                <b className="fw-bold text-dark fs-5">6</b>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary">Planes sin definir</span>
                <b className="fw-bold text-dark fs-5">1</b>
              </div>

              <a
                href="#revision"
                className="btn w-100 mt-2 py-2 fw-semibold border"
                style={{
                  color: primaryGreen,
                  borderColor: primaryGreen,
                  borderRadius: "8px",
                }}
              >
                Ir a la bandeja de revisión
              </a>
            </section>

            {/* Visibilidad */}
            <section className="card border-0 shadow-sm p-4 rounded-3 bg-white">
              <span
                className="d-block text-uppercase fw-semibold text-muted mb-2"
                style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
              >
                Visibilidad
              </span>

              <p className="text-muted small m-0 lh-base">
                Solo recibes solicitudes de las líneas declaradas en tu ficha.
                Si tu cupo llega a 0, dejas de aparecer en el filtro «Solo con
                cupo».
              </p>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Ficha;