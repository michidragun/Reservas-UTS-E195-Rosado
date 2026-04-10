package com.reservas.aulas.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.reservas.aulas.model.Usuario;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class FirebaseService {

    // Verifica que el token JWT de Firebase sea válido
    public FirebaseToken verifyToken(String token) throws Exception {
        return FirebaseAuth.getInstance().verifyIdToken(token);
    }

    // Obtiene la instancia de Firestore (nuestra base de datos)
    public Firestore getFirestore() {
        return FirestoreClient.getFirestore();
    }

    // Guarda o actualiza un usuario en Firestore
    public void guardarUsuario(Usuario usuario) throws ExecutionException, 
                                                        InterruptedException {
        Firestore db = getFirestore();
        Map<String, Object> data = new HashMap<>();
        data.put("uid", usuario.getUid());
        data.put("nombre", usuario.getNombre());
        data.put("email", usuario.getEmail());
        data.put("telefono", usuario.getTelefono());
        data.put("rol", usuario.getRol());
        
        db.collection("usuarios")
          .document(usuario.getUid())
          .set(data)
          .get(); // .get() espera a que termine la operación
    }

    // Obtiene un usuario de Firestore por su UID
    public Usuario obtenerUsuario(String uid) throws ExecutionException, 
                                                      InterruptedException {
        Firestore db = getFirestore();
        DocumentSnapshot doc = db.collection("usuarios")
                                  .document(uid)
                                  .get()
                                  .get();
        if (doc.exists()) {
            Usuario u = new Usuario();
            u.setUid(doc.getString("uid"));
            u.setNombre(doc.getString("nombre"));
            u.setEmail(doc.getString("email"));
            u.setTelefono(doc.getString("telefono"));
            u.setRol(doc.getString("rol"));
            return u;
        }
        return null;
    }

    // Establece el rol de admin en Firebase Auth (custom claim)
    public void setAdminRole(String uid) throws Exception {
        Map<String, Object> claims = new HashMap<>();
        claims.put("admin", true);
        FirebaseAuth.getInstance().setCustomUserClaims(uid, claims);
    }
}