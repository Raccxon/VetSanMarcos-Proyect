package cl.veterinaria.sanmarcos.controller;

import cl.veterinaria.sanmarcos.dto.AuthResponse;
import cl.veterinaria.sanmarcos.dto.LoginRequest;
import cl.veterinaria.sanmarcos.dto.RegistroRequest;
import cl.veterinaria.sanmarcos.model.Usuario;
import cl.veterinaria.sanmarcos.repository.UsuarioRepository;
import cl.veterinaria.sanmarcos.security.JwtUtil;
import cl.veterinaria.sanmarcos.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UsuarioRepository usuarioRepository,
            UsuarioService usuarioService,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest datos) {
        Usuario usuario = usuarioRepository.findByEmail(datos.email().trim().toLowerCase())
                .filter(u -> passwordEncoder.matches(datos.password(), u.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos"));
        return ResponseEntity.ok(respuesta(usuario));
    }

    // POST /api/auth/registro (siempre crea un cliente)
    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registro(@Valid @RequestBody RegistroRequest datos) {
        Usuario nuevo = new Usuario();
        nuevo.setNombre(datos.nombre());
        nuevo.setEmail(datos.email());
        nuevo.setPassword(datos.password());
        nuevo.setRol("cliente");

        Usuario creado = usuarioService.crear(nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta(creado));
    }

    private AuthResponse respuesta(Usuario u) {
        return new AuthResponse(jwtUtil.generar(u), u.getId(), u.getNombre(), u.getEmail(), u.getRol());
    }
}