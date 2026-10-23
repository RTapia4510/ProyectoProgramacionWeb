import { Outlet } from 'react-router-dom';
import '@fontsource/inter/700.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/400.css';
import '@fontsource/lora/700.css';
import '@fontsource/lora/600.css';
import '@fontsource/lora/500.css';
import '@fontsource/lora/400.css';

const rol = 'asesor';

const roles ={
    publico: ['Inicio','El proceso','Directorio de asesores','Cronograma','Preguntas frecuentes'],
    estudiante: ['Mi trabajo','Entregables','Retroalimentacion','Directorio de asesores','Mi sustentacion','Mi cuenta'],
    asesor: ['Mis asesorados','Solicitudes','Bandeja de revision','Mi ficha','Mi cuenta'],
    admin: ['Tableros','Trabajos','Carga por asesor','Sustentaciones','Usuarios','Mi cuenta']
};

function Header() {
    return (
        <header className="d-flex align-items-center justify-content-between px-5 bg-white border-bottom" style={{
                height: '72px',
                borderColor: '#E1E3DC',
                color: '#1A211D',
                fontFamily: 'Inter, sans-serif'
            }}>
            <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3 text-white" style={{width: '36px',height: '36px',backgroundColor: '#2C5F4A',fontFamily: 'Lora, serif',fontWeight: 600,fontSize: '14px',flexShrink: 0 }}>Tf</div>
                <div>
                    <b className="d-block" style={{
                            fontFamily: 'Lora, sans-serif',
                            fontSize: '17px',
                            lineHeight: '20px',
                            color: '#1E4534'
                        }}
                    >Trabajos de Fin de Carrera</b>
                    <span className="d-block" style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '13px',
                            lineHeight: '18px',
                            color: '#66716B'
                        }}
                    >Universidad de Lima · Facultad de Ingeniería</span>

                </div>
            </div>  
            <div>

            </div>       
        </header>
    );
}


function NavBar(){
    return(
    <nav className="navbar navbar-expand-lg gap-2 w-100 px-3 px-xl-5" style={{backgroundColor: '#1E4534',height: '56px',fontFamily: 'Inter, sans-serif',fontWeight:'400'}}>
        <div className="container-fluid">
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {rol === 'publico' && roles.publico.map(
                (a) => <li className="nav-item" key={a}>
                            <a className="nav-link text-white" href="#">{a}</a>
                        </li>
                )}
                {rol === 'estudiante' && roles.estudiante.map(
                (a) => <li className="nav-item" key={a}>
                            <a className="nav-link text-white" href="#">{a}</a>
                        </li>
                )}
                {rol === 'asesor' && roles.asesor.map(
                (a) => <li className="nav-item" key={a}>
                            <a className="nav-link text-white" href="#">{a}</a>
                        </li>
                )}
                {rol === 'admin' && roles.admin.map(
                (a) => <li className="nav-item" key={a}>
                            <a className="nav-link text-white" href="#">{a}</a>
                        </li>
                )}
            </ul>
            <ul className="navbar-nav ms-auto align-items-center">
                <li className="nav-item">
                    <span className="navbar-text me-3 text-white">
                        Semestre 2026-2
                    </span>
                </li>
            </ul>
            </div>
        </div>
    </nav>
    );
}

function Layout() {
  return (
    <>
        <Header/>
        <NavBar />
        <Outlet />
    </>
  );
}

export default Layout;