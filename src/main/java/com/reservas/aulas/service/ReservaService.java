package com.reservas.aulas.service;

import com.google.cloud.firestore.*;
import com.reservas.aulas.model.Reserva;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class ReservaService {

    @Autowired
    private FirebaseService firebaseService;

    // Lista de aulas disponibles
    public static final List<String> AULAS = List.of(
        "Aula 101", "Aula 102", "Aula 103",
        "Aula 201", "Aula 202", "Aula 203",
        "Laboratorio A", "Laboratorio B", "Salón de Conferencias"
    );

    // Bloques horarios de 1.5 horas (7am a 10pm)
    public static final List<String[]> BLOQUES = List.of(
        new String[]{"07:00", "08:30"},
        new String[]{"08:30", "10:00"},
        new String[]{"10:00", "11:30"},
        new String[]{"11:30", "13:00"},
        new String[]{"13:00", "14:30"},
        new String[]{"14:30", "16:00"},
        new String[]{"16:00", "17:30"},
        new String[]{"17:30", "19:00"},
        new String[]{"19:00", "20:30"},
        new String[]{"20:30", "22:00"}
    );

    // Crea una nueva reserva en Firestore
    public String crearReserva(Reserva reserva) throws ExecutionException, 
                                                        InterruptedException {
        Firestore db = firebaseService.getFirestore();
        
        reserva.setEstado("PENDIENTE");
        reserva.setFechaCreacion(System.currentTimeMillis());

        Map<String, Object> data = reservaToMap(reserva);
        
        // Genera un ID automático
        DocumentReference docRef = db.collection("reservas").document();
        reserva.setId(docRef.getId());
        data.put("id", docRef.getId());
        
        docRef.set(data).get();
        return docRef.getId();
    }

    // Obtiene todas las reservas (para el admin)
    public List<Reserva> obtenerTodasLasReservas() throws ExecutionException, 
                                                           InterruptedException {
        Firestore db = firebaseService.getFirestore();
        QuerySnapshot query = db.collection("reservas")
                                 .orderBy("fechaCreacion", Query.Direction.DESCENDING)
                                 .get()
                                 .get();
        
        List<Reserva> reservas = new ArrayList<>();
        for (DocumentSnapshot doc : query.getDocuments()) {
            reservas.add(mapToReserva(doc));
        }
        return reservas;
    }

    // Obtiene las reservas de un usuario específico
    public List<Reserva> obtenerReservasDeUsuario(String uid) 
            throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();
        QuerySnapshot query = db.collection("reservas")
                                 .whereEqualTo("usuarioUid", uid)
                                 .orderBy("fechaCreacion", Query.Direction.DESCENDING)
                                 .get()
                                 .get();
        
        List<Reserva> reservas = new ArrayList<>();
        for (DocumentSnapshot doc : query.getDocuments()) {
            reservas.add(mapToReserva(doc));
        }
        return reservas;
    }

    // Obtiene las reservas aprobadas para un aula y fecha específica
    // (para saber qué bloques están ocupados)
    public List<Reserva> obtenerReservasPorAulaYFecha(String aula, String fecha) 
            throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();
        QuerySnapshot query = db.collection("reservas")
                                 .whereEqualTo("aula", aula)
                                 .whereEqualTo("fecha", fecha)
                                 .whereEqualTo("estado", "APROBADA")
                                 .get()
                                 .get();
        
        List<Reserva> reservas = new ArrayList<>();
        for (DocumentSnapshot doc : query.getDocuments()) {
            reservas.add(mapToReserva(doc));
        }
        return reservas;
    }

    // Actualiza el estado de una reserva (aprobar o rechazar)
    public void actualizarEstadoReserva(String reservaId, String nuevoEstado, 
                                         String mensajeAdmin) 
            throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();
        Map<String, Object> updates = new HashMap<>();
        updates.put("estado", nuevoEstado);
        updates.put("mensajeAdmin", mensajeAdmin);
        
        db.collection("reservas")
          .document(reservaId)
          .update(updates)
          .get();
    }

    // Obtiene una reserva por ID
    public Reserva obtenerReservaPorId(String id) throws ExecutionException, 
                                                          InterruptedException {
        Firestore db = firebaseService.getFirestore();
        DocumentSnapshot doc = db.collection("reservas").document(id).get().get();
        if (doc.exists()) {
            return mapToReserva(doc);
        }
        return null;
    }

    // Convierte Reserva a Map (para guardar en Firestore)
    private Map<String, Object> reservaToMap(Reserva r) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", r.getId());
        map.put("usuarioUid", r.getUsuarioUid());
        map.put("usuarioNombre", r.getUsuarioNombre());
        map.put("usuarioEmail", r.getUsuarioEmail());
        map.put("usuarioContacto", r.getUsuarioContacto());
        map.put("aula", r.getAula());
        map.put("fecha", r.getFecha());
        map.put("horaInicio", r.getHoraInicio());
        map.put("horaFin", r.getHoraFin());
        map.put("motivo", r.getMotivo());
        map.put("estado", r.getEstado());
        map.put("mensajeAdmin", r.getMensajeAdmin());
        map.put("fechaCreacion", r.getFechaCreacion());
        return map;
    }

    // Convierte DocumentSnapshot a Reserva
    private Reserva mapToReserva(DocumentSnapshot doc) {
        Reserva r = new Reserva();
        r.setId(doc.getString("id"));
        r.setUsuarioUid(doc.getString("usuarioUid"));
        r.setUsuarioNombre(doc.getString("usuarioNombre"));
        r.setUsuarioEmail(doc.getString("usuarioEmail"));
        r.setUsuarioContacto(doc.getString("usuarioContacto"));
        r.setAula(doc.getString("aula"));
        r.setFecha(doc.getString("fecha"));
        r.setHoraInicio(doc.getString("horaInicio"));
        r.setHoraFin(doc.getString("horaFin"));
        r.setMotivo(doc.getString("motivo"));
        r.setEstado(doc.getString("estado"));
        r.setMensajeAdmin(doc.getString("mensajeAdmin"));
        Long fc = doc.getLong("fechaCreacion");
        if (fc != null) r.setFechaCreacion(fc);
        return r;
    }
}