export const getPageTitle = (pathname) => {
    switch (pathname) {
        /* Menu Usuario */
        case '/BasesDeDatos':
            return 'Bases De Datos';
        case '/ControlUsuarios':
            return 'Control de Usuarios';
        /* Inicio */
        case '/':
            return 'Sicte CCOT';
        case '/ReportingCenter':
            return 'Sicte CCOT';
        /* Login */
        case '/Login':
            return 'Iniciar Sesion';
        /* Aplicativos */
        case '/Capacidades':
            return 'Capacidades';
        case '/SupervisionPrincipal':
            return 'Supervisión';
        case '/SupervisionAgregar':
            return 'Supervisión';
        case '/MaterialPrincipal':
            return 'Solicitud Materiales';
        case '/MaterialAgregar':
            return 'Solicitud Materiales'
        case '/ReporteMaterialPrincipal':
            return 'Reporte Material Ferretero';
        case '/ReporteMaterialAgregar':
            return 'Reporte Material Ferretero'
        case '/ChatBot':
            return 'ChatBot'
        case '/Carnetizacion':
            return 'Carnetizacion'
        /* Facturacion */
        case '/ConsolidadoNacionalFacturacion':
            return 'Consolidado Nacional Facturacion';
        case '/Proyectos':
            return 'Proyectos Facturacion';
        case '/CorporativoFacturacion':
            return 'Corporativo Facturacion';
        case '/MantenimientoFacturacion':
            return 'Mantenimiento Facturacion';
        case '/OperacionesFacturacion':
            return 'Operaciones Facturacion';
        case '/MinticFacturacion':
            return 'Mintic Facturacion';
        case '/SMU':
            return 'SMU Facturacion';
        case '/ImplementacionesFacturacion':
            return 'Implementaciones Facturacion';
        case '/MedicionesFacturacion':
            return 'Mediciones Facturacion';
        case '/ObraCivilFacturacion':
            return 'Obra Civil Facturacion';
        /* Productividad */
        case '/ProductividadNacional':
            return 'Productividad Nacional';
        case '/PlaneacionFinanciero':
            return 'Planeacion Financiero';
        case '/CorporativoFinanciero':
            return 'Corporativo Financiero';
        case '/MantenimientoFinanciero':
            return 'Mantenimiento Financiero';
        case '/ReingenieriaFinanciero':
            return 'Reingenieria Financiero';
        case '/OperacionesFinanciero':
            return 'Operaciones Financiero';
        /* Indicadores */
        case '/HistoricoKPI':
            return 'Historico KPI';
        case '/MantenimientoTecnico':
            return 'Mantenimiento Tecnico';
        case '/NPS':
            return 'NPS';
        case '/G2G8MasivoCentro':
            return 'G2-G8 Masivo Centro'
        /* Puntuacion */
        case '/PlaneacionPuntuacion':
            return 'Planeacion Puntuacion';
        case '/CorporativoPuntuacion':
            return 'Corporativo Puntuacion';
        case '/MantenimientoPuntuacion':
            return 'Mantenimiento Puntuacion';
        case '/ReingenieriasPuntuacion':
            return 'Reingenierias Puntuacion';
        /* Operacion */
        case '/MantenimientoBacklogFO':
            return 'Mantenimiento Backlog FO';
        case '/MantenimientoBacklogHFC':
            return 'Mantenimiento Backlog HFC';
        case '/MantenimientoPuntuacionTMRF':
            return 'Mantenimiento Puntuacion TMRF';
        case '/RecursoOperaciones':
            return 'Recurso Operaciones';
        case '/SeguimientoOperacionesCentro':
            return 'Seguimiento Operaciones Centro';
        case '/SeguimientoOperacionesNorte':
            return 'Seguimiento Operaciones Norte';
        case '/SeguimientoSMU':
            return 'Seguimiento SMU';
        case '/SMU_Tecnico':
            return 'SMU Tecnico';
        case '/EnelCronograma':
            return 'Enel Cronograma';
        /* Logistica */
        case '/EquiposMoviles':
            return 'Equipos Moviles';
        case '/DesmonteMantenimiento':
            return 'DesmonteMantenimiento';
        case '/InventariosMaterialPrincipal':
            return 'Inventarios Material';
        case '/InventariosMaterialAgregar':
            return 'Inventarios Material'
        case '/EstadoProyectosR4':
            return 'Estado Proyectos R4'
        case '/Activos':
            return 'Activos'
        case '/ReporteSicte':
            return 'Reporte Sicte'
        case '/CriticidadEquipos':
            return 'Criticidad Equipos'
        /* Direccion */
        case '/Penalizaciones':
            return 'Penalizaciones';
        case '/Centro_de_costos':
            return 'Centro de costos';
        case '/ComposicionMoviles':
            return 'Composicion Moviles';
        case '/Compras':
            return 'Compras';
        case '/CapacidadesTablero':
            return 'Capacidades';
        /* HSEQ */
        case '/SSTA':
            return 'SSTA';
        case '/CursosDeAlturas':
            return 'Cursos de Alturas';
        case '/EntregasPendientesDotacion':
            return 'Entregas Pendientes Dotacion'
        case '/UbicacionDeActividades':
            return 'Ubicacion de Actividades'
        case '/InspeccionesEnel':
            return 'Inspecciones Enel';
        /* Parque Automotor */
        case '/Moviles':
            return 'Moviles'
        /* Recuperar Contrasena */
        case '/RecuperarContrasena':
            return 'Recuperar Contrasena';
        default:
            return 'Validar';
    }
};