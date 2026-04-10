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
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @Autowired
    private NotificacionService notificacionService;

    // Página principal del usuario
    @GetMapping("/dashboard")
    public String dashboard(Model model, HttpSession session) {
        String uid = (String) session.getAttribute("uid");
        if (uid == null) return "redirect:/login";
        
        model.addAttribute("nombre", session.getAttribute("nombre"));
        model.addAttribute("aulas", ReservaService.AULAS);
        model.addAttribute("bloques", ReservaService.BLOQUES);
        
        try {
            long noLeidas = notificacionService.contarNoLeidas(uid);
            model.addAttribute("notificacionesNoLeidas", noLeidas);
        } catch (Exception e) {
            model.addAttribute("notificacionesNoLeidas", 0);
        }
        
        return "dashboard";
    }

    // Página de nueva reserva
    @GetMapping("/nueva-reserva")
    public String nuevaReserva(Model model, HttpSession session) {
        if (session.getAttribute("uid") == null) return "redirect:/login";
        
        model.addAttribute("nombre", session.getAttribute("nombre"));
        model.addAttribute("aulas", ReservaService.AULAS);
        model.addAttribute("bloques", ReservaService.BLOQUES);
        return "nueva-reserva";
    }

    // API: Crea una nueva reserva
    @PostMapping("/api/reservas/crear")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> crearReserva(
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
            
            Reserva reserva = new Reserva();
            reserva.setUsuarioUid(uid);
            reserva.setUsuarioNombre(body.get("nombre"));
            reserva.setUsuarioEmail((String) session.getAttribute("email"));
            reserva.setUsuarioContacto(body.get("contacto"));
            reserva.setAula(body.get("aula"));
            reserva.setFecha(body.get("fecha"));
            reserva.setHoraInicio(body.get("horaInicio"));
            reserva.setHoraFin(body.get("horaFin"));
            reserva.setMotivo(body.get("motivo"));
            
            String id = reservaService.crearReserva(reserva);
            
            response.put("success", true);
            response.put("id", id);
            response.put("mensaje", "Reserva enviada. Espera la aprobación del administrador.");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    // API: Obtiene los bloques disponibles para un aula y fecha
    @GetMapping("/api/reservas/disponibilidad")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerDisponibilidad(
            @RequestParam String aula,
            @RequestParam String fecha) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Reserva> reservasOcupadas = 
                reservaService.obtenerReservasPorAulaYFecha(aula, fecha);
            
            // Construye lista de horas de inicio ocupadas
            List<String> horasOcupadas = reservasOcupadas.stream()
                .map(Reserva::getHoraInicio)
                .toList();
            
            response.put("success", true);
            response.put("horasOcupadas", horasOcupadas);
            response.put("bloques", ReservaService.BLOQUES);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    // Página: Mis reservas
    @GetMapping("/mis-reservas")
    public String misReservas(Model model, HttpSession session) {
        String uid = (String) session.getAttribute("uid");
        if (uid == null) return "redirect:/login";
        
        try {
            List<Reserva> reservas = reservaService.obtenerReservasDeUsuario(uid);
            model.addAttribute("reservas", reservas);
            model.addAttribute("nombre", session.getAttribute("nombre"));
            
            long noLeidas = notificacionService.contarNoLeidas(uid);
            model.addAttribute("notificacionesNoLeidas", noLeidas);
        } catch (Exception e) {
            model.addAttribute("error", "Error al cargar reservas: " + e.getMessage());
        }
        
        return "mis-reservas";
    }
}