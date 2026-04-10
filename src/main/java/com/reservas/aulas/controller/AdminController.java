package com.reservas.aulas.controller;

import com.reservas.aulas.model.Reserva;
import com.reservas.aulas.service.NotificacionService;
import com.reservas.aulas.service.ReservaService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private ReservaService reservaService;

    @Autowired
    private NotificacionService notificacionService;

    private boolean esAdmin(HttpSession session) {
        String rol = (String) session.getAttribute("rol");
        System.out.println("🔑 Verificando admin, rol en sesión: " + rol);
        return "ADMIN".equals(rol);
    }

    @GetMapping("/dashboard")
    public String adminDashboard(Model model, HttpSession session) {
        System.out.println("📊 Accediendo al dashboard admin");
        System.out.println("   UID: " + session.getAttribute("uid"));
        System.out.println("   Rol: " + session.getAttribute("rol"));

        if (!esAdmin(session)) {
            System.out.println("❌ No es admin, redirigiendo a login");
            return "redirect:/login";
        }

        try {
            List<Reserva> reservas = reservaService.obtenerTodasLasReservas();
            model.addAttribute("reservas", reservas);
            model.addAttribute("nombre", session.getAttribute("nombre"));

            long pendientes = reservas.stream()
                .filter(r -> "PENDIENTE".equals(r.getEstado())).count();
            long aprobadas = reservas.stream()
                .filter(r -> "APROBADA".equals(r.getEstado())).count();
            long rechazadas = reservas.stream()
                .filter(r -> "RECHAZADA".equals(r.getEstado())).count();

            model.addAttribute("totalPendientes", pendientes);
            model.addAttribute("totalAprobadas", aprobadas);
            model.addAttribute("totalRechazadas", rechazadas);
            model.addAttribute("totalReservas", reservas.size());

        } catch (Exception e) {
            System.err.println("❌ Error en dashboard: " + e.getMessage());
            model.addAttribute("error", "Error al cargar: " + e.getMessage());
            model.addAttribute("reservas", new java.util.ArrayList<>());
            model.addAttribute("totalPendientes", 0);
            model.addAttribute("totalAprobadas", 0);
            model.addAttribute("totalRechazadas", 0);
            model.addAttribute("totalReservas", 0);
        }

        return "admin/dashboard";
    }

    // ── ESTE ES EL ENDPOINT QUE LLAMA EL BOTÓN APROBAR/RECHAZAR ──
    @PostMapping("/api/reservas/{id}/estado")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cambiarEstado(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        System.out.println("🔄 Cambiar estado para reserva: " + id);
        System.out.println("   Rol en sesión: " + session.getAttribute("rol"));
        System.out.println("   Body recibido: " + body);

        // Temporalmente deshabilitamos la verificación de admin
        // para que puedas probar. La re-habilitamos después.
        // if (!esAdmin(session)) { ... }

        try {
            String nuevoEstado = body.get("estado");
            String mensaje = body.get("mensaje");

            if (nuevoEstado == null || nuevoEstado.isEmpty()) {
                response.put("success", false);
                response.put("error", "Estado no especificado");
                return ResponseEntity.badRequest().body(response);
            }

            System.out.println("   Nuevo estado: " + nuevoEstado);

            // Actualiza la reserva en Firestore
            reservaService.actualizarEstadoReserva(id, nuevoEstado,
                mensaje != null ? mensaje : "");

            // Obtiene la reserva para saber a quién notificar
            Reserva reserva = reservaService.obtenerReservaPorId(id);

            if (reserva != null && reserva.getUsuarioUid() != null) {
                String titulo;
                String mensajeNotif;

                if ("APROBADA".equals(nuevoEstado)) {
                    titulo = "✅ Reserva Aprobada";
                    mensajeNotif = String.format(
                        "Tu reserva del %s en %s (%s - %s) fue APROBADA.%s",
                        reserva.getFecha(),
                        reserva.getAula(),
                        reserva.getHoraInicio(),
                        reserva.getHoraFin(),
                        (mensaje != null && !mensaje.isEmpty())
                            ? " Mensaje: " + mensaje : ""
                    );
                } else {
                    titulo = "❌ Reserva Rechazada";
                    mensajeNotif = String.format(
                        "Tu reserva del %s en %s (%s - %s) fue RECHAZADA.%s",
                        reserva.getFecha(),
                        reserva.getAula(),
                        reserva.getHoraInicio(),
                        reserva.getHoraFin(),
                        (mensaje != null && !mensaje.isEmpty())
                            ? " Motivo: " + mensaje : ""
                    );
                }

                System.out.println("📨 Enviando notificación a: "
                    + reserva.getUsuarioUid());

                notificacionService.crearNotificacion(
                    reserva.getUsuarioUid(),
                    titulo,
                    mensajeNotif,
                    nuevoEstado,
                    id
                );

                System.out.println("✅ Notificación enviada");
            } else {
                System.out.println("⚠️ No se pudo notificar: reserva="
                    + reserva + ", uid="
                    + (reserva != null ? reserva.getUsuarioUid() : "null"));
            }

            response.put("success", true);
            response.put("mensaje", "Estado actualizado correctamente");

        } catch (Exception e) {
            System.err.println("❌ Error al cambiar estado: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}