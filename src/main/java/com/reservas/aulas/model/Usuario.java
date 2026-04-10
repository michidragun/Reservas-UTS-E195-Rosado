package com.reservas.aulas.model;

public class Usuario {
    private String uid;
    private String nombre;
    private String email;
    private String telefono;
    private String rol; // "USER" o "ADMIN"

    // Constructor vacío (necesario para Firebase)
    public Usuario() {}

    public Usuario(String uid, String nombre, String email, 
                   String telefono, String rol) {
        this.uid = uid;
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.rol = rol;
    }

    // Getters y Setters
    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}