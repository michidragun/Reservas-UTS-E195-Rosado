package com.reservas.aulas.model;

public class Reserva {
    private String id;
    private String usuarioUid;
    private String usuarioNombre;
    private String usuarioEmail;
    private String usuarioContacto;  // teléfono u otro contacto
    private String aula;             // ej: "Aula 101"
    private String fecha;            // formato: "2024-03-15"
    private String horaInicio;       // formato: "08:00"
    private String horaFin;          // formato: "09:30"
    private String motivo;
    private String estado;           // "PENDIENTE", "APROBADA", "RECHAZADA"
    private String mensajeAdmin;     // mensaje al aprobar/rechazar
    private long fechaCreacion;      // timestamp

    // Constructor vacío
    public Reserva() {}

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsuarioUid() { return usuarioUid; }
    public void setUsuarioUid(String usuarioUid) { this.usuarioUid = usuarioUid; }

    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { 
        this.usuarioNombre = usuarioNombre; }

    public String getUsuarioEmail() { return usuarioEmail; }
    public void setUsuarioEmail(String usuarioEmail) { 
        this.usuarioEmail = usuarioEmail; }

    public String getUsuarioContacto() { return usuarioContacto; }
    public void setUsuarioContacto(String usuarioContacto) { 
        this.usuarioContacto = usuarioContacto; }

    public String getAula() { return aula; }
    public void setAula(String aula) { this.aula = aula; }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }

    public String getHoraInicio() { return horaInicio; }
    public void setHoraInicio(String horaInicio) { this.horaInicio = horaInicio; }

    public String getHoraFin() { return horaFin; }
    public void setHoraFin(String horaFin) { this.horaFin = horaFin; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getMensajeAdmin() { return mensajeAdmin; }
    public void setMensajeAdmin(String mensajeAdmin) { 
        this.mensajeAdmin = mensajeAdmin; }

    public long getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(long fechaCreacion) { 
        this.fechaCreacion = fechaCreacion; }
}