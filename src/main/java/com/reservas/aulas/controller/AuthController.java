package com.reservas.aulas.controller;

import com.google.firebase.auth.FirebaseToken;
import com.reservas.aulas.model.Usuario;
import com.reservas.aulas.service.FirebaseService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class AuthController {

    @Autowired
    private FirebaseService firebaseService;
 // Redirige la raíz "/" automáticamente
    @GetMapping("/")
    public String raiz(HttpSession session) {
        // Si ya hay sesión activa, va al dashboard correspondiente
        String uid = (String) session.getAttribute("uid");
        String rol = (String) session.getAttribute("rol");
        
        if (uid != null) {
            return "ADMIN".equals(rol) ? "redirect:/admin/dashboard" 
                                       : "redirect:/dashboard";
        }
        // Si no hay sesión, va al login
        return "redirect:/login";
    }

    // Muestra la página de login
    @GetMapping("/login")
    public String loginPage() {
        return "login"; // busca templates/login.html
    }

    // Muestra la página de registro
    @GetMapping("/registro")
    public String registroPage() {
        return "registro"; // busca templates/registro.html
    }

    // Recibe el token de Firebase y crea sesión en el servidor
    @PostMapping("/api/auth/session")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createSession(
            @RequestBody Map<String, String> body,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = body.get("token");
            
            if (token == null || token.isEmpty()) {
                response.put("success", false);
                response.put("error", "Token no recibido");
                return ResponseEntity.badRequest().body(response);
            }
            
            System.out.println("🔑 Token recibido, verificando con Firebase...");
            
            FirebaseToken decodedToken = firebaseService.verifyToken(token);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String nombre = decodedToken.getName() != null ? 
                            decodedToken.getName() : email;

            System.out.println("✅ Token válido. UID: " + uid + " | Email: " + email);

            // Guarda en sesión HTTP
            session.setAttribute("uid", uid);
            session.setAttribute("email", email);
            session.setAttribute("token", token);

            // Busca o crea el usuario en Firestore
            Usuario usuario = firebaseService.obtenerUsuario(uid);
            if (usuario == null) {
                System.out.println("👤 Usuario nuevo, creando en Firestore...");
                usuario = new Usuario(uid, nombre, email, "", "USER");
                firebaseService.guardarUsuario(usuario);
            }
            
            session.setAttribute("nombre", usuario.getNombre());
            session.setAttribute("rol", usuario.getRol() != null ? 
                                 usuario.getRol() : "USER");

            System.out.println("📋 Rol del usuario: " + usuario.getRol());

            boolean isAdmin = "ADMIN".equals(usuario.getRol());
            String redirect = isAdmin ? "/admin/dashboard" : "/dashboard";
            
            System.out.println("➡️ Redirigiendo a: " + redirect);
            
            response.put("success", true);
            response.put("redirect", redirect);
            response.put("nombre", usuario.getNombre());
            
        } catch (Exception e) {
            System.err.println("❌ Error en createSession: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("error", "Error al verificar sesión: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    // Cierra sesión
    @PostMapping("/api/auth/logout")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    // Actualiza datos del usuario
    @PostMapping("/api/usuario/actualizar")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarUsuario(
            @RequestBody Map<String, String> body,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String uid = (String) session.getAttribute("uid");
            if (uid == null) {
                response.put("success", false);
                response.put("error", "No autenticado");
                return ResponseEntity.status(401).body(response);
            }
            
            Usuario usuario = firebaseService.obtenerUsuario(uid);
            if (usuario == null) {
                response.put("success", false);
                response.put("error", "Usuario no encontrado");
                return ResponseEntity.status(404).body(response);
            }
            
            if (body.containsKey("nombre")) usuario.setNombre(body.get("nombre"));
            if (body.containsKey("telefono")) usuario.setTelefono(body.get("telefono"));
            
            firebaseService.guardarUsuario(usuario);
            session.setAttribute("nombre", usuario.getNombre());
            
            response.put("success", true);
            response.put("mensaje", "Datos actualizados correctamente");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    @PostMapping("/api/admin/setup")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> setupAdmin(
            @RequestParam String uid) {
        Map<String, Object> response = new HashMap<>();
        try {
            firebaseService.setAdminRole(uid);
            response.put("success", true);
            response.put("mensaje", "Admin configurado. Ahora borra este endpoint.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    // Obtiene datos del usuario actual
    @GetMapping("/api/usuario/actual")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerUsuarioActual(
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String uid = (String) session.getAttribute("uid");
            if (uid == null) {
                response.put("success", false);
                return ResponseEntity.status(401).body(response);
            }
            
            Usuario usuario = firebaseService.obtenerUsuario(uid);
            response.put("success", true);
            response.put("uid", uid);
            response.put("nombre", usuario.getNombre());
            response.put("email", usuario.getEmail());
            response.put("telefono", usuario.getTelefono());
            response.put("rol", usuario.getRol());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}