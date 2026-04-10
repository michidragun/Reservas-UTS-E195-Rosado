package com.reservas.aulas.controller;

import com.reservas.aulas.model.Notificacion;
import com.reservas.aulas.service.NotificacionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class NotificacionController {

    @Autowired
    private NotificacionService notificacionService;

    @GetMapping("/notificaciones")
    public String notificaciones(Model model, HttpSession session) {
        String uid = (String) session.getAttribute("uid");
        if (uid == null) return "redirect:/login";

        // Siempre inicializa con valores por defecto
        // para que la página nunca explote en blanco
        model.addAttribute("nombre", session.getAttribute("nombre"));
        model.addAttribute("notificaciones", new ArrayList<>());
        model.addAttribute("notificacionesNoLeidas", 0L);
        model.addAttribute("errorIndice", false);

        try {
            List<Notificacion> notificaciones =
                notificacionService.obtenerNotificaciones(uid);
            model.addAttribute("notificaciones", notificaciones);

            long noLeidas = notificaciones.stream()
                .filter(n -> !n.isLeida()).count();
            model.addAttribute("notificacionesNoLeidas", noLeidas);

            System.out.println("✅ Notificaciones cargadas: "
                + notificaciones.size() + " para uid: " + uid);

        } catch (Exception e) {
            System.err.println("❌ Error al cargar notificaciones: "
                + e.getMessage());

            // Si es error de índice, muestra mensaje amigable
            if (e.getMessage() != null &&
                e.getMessage().contains("FAILED_PRECONDITION")) {
                model.addAttribute("errorIndice", true);
                model.addAttribute("error",
                    "El sistema está siendo configurado. " +
                    "Intenta de nuevo en 2 minutos.");
            } else {
                model.addAttribute("error",
                    "Error al cargar notificaciones: " + e.getMessage());
            }
        }

        return "notificaciones";
    }

    @PostMapping("/api/notificaciones/{id}/leer")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> marcarLeida(
            @PathVariable String id,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();
        try {
            if (session.getAttribute("uid") == null) {
                response.put("success", false);
                response.put("error", "No autenticado");
                return ResponseEntity.status(401).body(response);
            }
            notificacionService.marcarComoLeida(id);
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/notificaciones/contador")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> contarNoLeidas(
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        try {
            String uid = (String) session.getAttribute("uid");
            if (uid == null) {
                response.put("count", 0);
                return ResponseEntity.ok(response);
            }
            response.put("count", notificacionService.contarNoLeidas(uid));
        } catch (Exception e) {
            // Si falla el conteo (índice no listo), devuelve 0
            // sin romper nada
            System.err.println("⚠️ Error contando notificaciones: "
                + e.getMessage());
            response.put("count", 0);
        }
        return ResponseEntity.ok(response);
    }
}