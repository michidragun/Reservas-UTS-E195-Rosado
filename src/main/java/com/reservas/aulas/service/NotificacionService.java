package com.reservas.aulas.service;

import com.google.cloud.firestore.*;
import com.reservas.aulas.model.Notificacion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class NotificacionService {

    @Autowired
    private FirebaseService firebaseService;

    // Crea una notificación para el usuario
    public void crearNotificacion(String usuarioUid, String titulo, 
                                   String mensaje, String tipo, 
                                   String reservaId) 
            throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();
        
        Map<String, Object> data = new HashMap<>();
        DocumentReference docRef = db.collection("notificaciones").document();
        
        data.put("id", docRef.getId());
        data.put("usuarioUid", usuarioUid);
        data.put("titulo", titulo);
        data.put("mensaje", mensaje);
        data.put("tipo", tipo);
        data.put("leida", false);
        data.put("fecha", System.currentTimeMillis());
        data.put("reservaId", reservaId);
        
        docRef.set(data).get();
    }

    // Obtiene las notificaciones de un usuario
    public List<Notificacion> obtenerNotificaciones(String usuarioUid) 
            throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();
        QuerySnapshot query = db.collection("notificaciones")
                                 .whereEqualTo("usuarioUid", usuarioUid)
                                 .orderBy("fecha", Query.Direction.DESCENDING)
                                 .get()
                                 .get();
        
        List<Notificacion> notificaciones = new ArrayList<>();
        for (DocumentSnapshot doc : query.getDocuments()) {
            Notificacion n = new Notificacion();
            n.setId(doc.getString("id"));
            n.setUsuarioUid(doc.getString("usuarioUid"));
            n.setTitulo(doc.getString("titulo"));
            n.setMensaje(doc.getString("mensaje"));
            n.setTipo(doc.getString("tipo"));
            Boolean leida = doc.getBoolean("leida");
            n.setLeida(leida != null && leida);
            Long fecha = doc.getLong("fecha");
            if (fecha != null) n.setFecha(fecha);
            n.setReservaId(doc.getString("reservaId"));
            notificaciones.add(n);
        }
        return notificaciones;
    }

    // Cuenta notificaciones no leídas
    public long contarNoLeidas(String usuarioUid) 
            throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();
        QuerySnapshot query = db.collection("notificaciones")
                                 .whereEqualTo("usuarioUid", usuarioUid)
                                 .whereEqualTo("leida", false)
                                 .get()
                                 .get();
        return query.size();
    }

    // Marca una notificación como leída
    public void marcarComoLeida(String notificacionId) 
            throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();
        db.collection("notificaciones")
          .document(notificacionId)
          .update("leida", true)
          .get();
    }
}