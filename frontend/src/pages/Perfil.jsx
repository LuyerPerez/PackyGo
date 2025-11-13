import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { actualizarFotoPerfil, getImagenUrl, cambiarContrasena } from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTag, faCalendarAlt, faIdCard } from '@fortawesome/free-solid-svg-icons';
import '../assets/PerfilUnico.css';

const Perfil = () => {
  const { nombreCompleto } = useParams();
  
  const getUserFromStorage = () => {
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      const userData = JSON.parse(userStorage);
      return {
        id: userData.id || '',
        primer_nombre: userData.primer_nombre || 'Usuario',
        segundo_nombre: userData.segundo_nombre || '',
        primer_apellido: userData.primer_apellido || 'Usuario',
        segundo_apellido: userData.segundo_apellido || '',
        correo: userData.correo || '',
        telefono: userData.telefono || '',
        noDocumento: userData.noDocumento || '',
        tipoDocumento: userData.tipoDocumento || '',
        rol: userData.rol || 'cliente',
        fecha_registro: userData.fecha_registro || new Date().toISOString(),
        foto: userData.foto || '',
      };
    }

    const [nombre = 'Usuario', apellido = 'Usuario'] = nombreCompleto ? nombreCompleto.split('-') : [];
    return {
      id: '',
      primer_nombre: nombre,
      segundo_nombre: '',
      primer_apellido: apellido,
      segundo_apellido: '',
      correo: 'usuario@email.com',
      telefono: '',
      noDocumento: '',
      tipoDocumento: '',
      rol: 'cliente',
      fecha_registro: new Date().toISOString(),
      foto: '',
    };
  };

  const [user, setUser] = useState(getUserFromStorage());
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(user);
  const [showPassword, setShowPassword] = useState(false);
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    actual: '',
    nueva: '',
    repetir: '',
    error: '',
    exito: '',
  });

  useEffect(() => {
    const userData = getUserFromStorage();
    setUser(userData);
    setForm(userData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombreCompleto]);


  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === 'foto' && files && files[0]) {
      setCargandoFoto(true);
      try {
        const storedRaw = localStorage.getItem('user');
        const storedUser = storedRaw ? JSON.parse(storedRaw) : null;
        if (!storedUser?.token) {
          alert('Tu sesión ha expirado o no estás autenticado. Por favor inicia sesión nuevamente.');
          window.location.href = '/login';
          return;
        }
        // Subir foto al backend y actualizar user + localStorage
        const resp = await actualizarFotoPerfil(user.id, files[0]);
        const nuevaFoto = resp?.foto || '';
        const updated = { ...form, foto: nuevaFoto };
        setForm(updated);
        setUser(updated);
        localStorage.setItem('user', JSON.stringify({ ...storedUser, foto: nuevaFoto }));
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('userUpdated'));
        }
      } catch (err) {
        alert('No se pudo actualizar la foto: ' + (err?.response?.data?.error || err.message));
      } finally {
        setCargandoFoto(false);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };


  const guardarCambios = () => {
    // Validaciones simples
    if (!form.primer_nombre.trim() || !form.primer_apellido.trim() || !form.correo.trim()) {
      alert('Nombre, apellido y email son obligatorios');
      return;
    }
    setGuardandoPerfil(true);
    // Simular un pequeño delay para mostrar la animación
    setTimeout(() => {
      setUser(form);
      // Actualizar localStorage con los nuevos datos
      const updatedUser = { ...form };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditando(false);
      setGuardandoPerfil(false);
    }, 500);
  };

  // Formatear fecha de registro
  const formatearFechaMiembro = () => {
    try {
      const fecha = new Date(user.fecha_registro || user.fecha_creacion);
      const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
      return fecha.toLocaleDateString('es-ES', opciones);
    } catch {
      return 'No disponible';
    }
  };

  // Obtener rol en español
  const getRolEspanol = () => {
    const roles = {
      cliente: 'Cliente',
      camionero: 'Camionero',
      admin: 'Administrador'
    };
    return roles[user.rol] || 'Usuario';
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value, error: '', exito: '' });
  };

  const cambiarPassword = async () => {
    // Validaciones básicas
    if (!passwordForm.actual || !passwordForm.nueva || !passwordForm.repetir) {
      setPasswordForm({ ...passwordForm, error: 'Todos los campos son obligatorios', exito: '' });
      return;
    }
    
    if (passwordForm.nueva.length < 6) {
      setPasswordForm({ ...passwordForm, error: 'La nueva contraseña debe tener al menos 6 caracteres', exito: '' });
      return;
    }
    
    if (passwordForm.nueva !== passwordForm.repetir) {
      setPasswordForm({ ...passwordForm, error: 'Las contraseñas no coinciden', exito: '' });
      return;
    }

    setCambiandoPassword(true);
    try {
      // Verificar token antes de cambiar
      const storedRaw = localStorage.getItem('user');
      const storedUser = storedRaw ? JSON.parse(storedRaw) : null;
      if (!storedUser?.token) {
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        window.location.href = '/login';
        return;
      }

      // Llamar al backend para cambiar la contraseña
      await cambiarContrasena(user.id, passwordForm.actual, passwordForm.nueva);
      
      setPasswordForm({ actual: '', nueva: '', repetir: '', error: '', exito: 'Contraseña cambiada con éxito' });
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err.message || 'Error al cambiar la contraseña';
      setPasswordForm({ ...passwordForm, error: errorMsg, exito: '' });
    } finally {
      setCambiandoPassword(false);
    }
  };

  return (
    <div className="perfil-unico-container">
      <div className="perfil-unico-wrapper">
        {/* Sidebar izquierdo */}
        <div className="perfil-unico-sidebar">
          <div className="perfil-unico-card">
            <div className="perfil-unico-header">
              <div className="perfil-unico-foto">
                {user.foto ? (
                  <img src={getImagenUrl(user.foto) || user.foto} alt="Foto de perfil" />
                ) : (
                  <div className="perfil-unico-foto-placeholder">
                    {user.primer_nombre?.[0] || 'U'}{user.primer_apellido?.[0] || 'S'}
                  </div>
                )}
              </div>
              <h2>{user.primer_nombre} {user.segundo_nombre && `${user.segundo_nombre} `}{user.primer_apellido} {user.segundo_apellido}</h2>
              <p className="perfil-unico-resumen" style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#0097a7', fontWeight: 600}}>
                {getRolEspanol()}
              </p>
            </div>

            <div className="perfil-unico-stats">
              <div className="perfil-stat-item">
                <span className="perfil-stat-value">{user.tipoDocumento}</span>
                <span className="perfil-stat-label">Tipo Doc.</span>
              </div>
              <div className="perfil-stat-item">
                <span className="perfil-stat-value">{user.noDocumento}</span>
                <span className="perfil-stat-label">N° Documento</span>
              </div>
            </div>
          </div>

          <div className="perfil-unico-card">
            <h3 className="perfil-section-title">Información Adicional</h3>
            <div className="perfil-extra-info">
              <div className="perfil-extra-item">
                <div className="perfil-extra-icon">
                  <FontAwesomeIcon icon={faUserTag} />
                </div>
                <span className="perfil-extra-value">{getRolEspanol()}</span>
                <span className="perfil-extra-label">Tipo de usuario</span>
              </div>
              <div className="perfil-extra-item">
                <div className="perfil-extra-icon">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
                <span className="perfil-extra-value">{formatearFechaMiembro()}</span>
                <span className="perfil-extra-label">Miembro desde</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="perfil-unico-main">
          {/* Información personal */}
          <div className="perfil-unico-card">
            <h3 className="perfil-section-title">Información Personal</h3>
            {editando ? (
              <div className="perfil-info-grid">
                <div className="perfil-file-input perfil-info-item">
                  <label className="perfil-info-label">Foto de perfil</label>
                  <input 
                    type="file" 
                    name="foto" 
                    accept="image/*" 
                    onChange={handleChange}
                    disabled={cargandoFoto}
                  />
                  {cargandoFoto && <span className="perfil-uploading">Subiendo foto...</span>}
                </div>
                <div className="perfil-info-item">
                  <label className="perfil-info-label">Primer Nombre *</label>
                  <input 
                    name="primer_nombre" 
                    value={form.primer_nombre} 
                    onChange={handleChange} 
                    placeholder="Primer nombre" 
                    required 
                  />
                </div>
                <div className="perfil-info-item">
                  <label className="perfil-info-label">Segundo Nombre</label>
                  <input 
                    name="segundo_nombre" 
                    value={form.segundo_nombre} 
                    onChange={handleChange} 
                    placeholder="Segundo nombre (opcional)" 
                  />
                </div>
                <div className="perfil-info-item">
                  <label className="perfil-info-label">Primer Apellido *</label>
                  <input 
                    name="primer_apellido" 
                    value={form.primer_apellido} 
                    onChange={handleChange} 
                    placeholder="Primer apellido" 
                    required 
                  />
                </div>
                <div className="perfil-info-item">
                  <label className="perfil-info-label">Segundo Apellido</label>
                  <input 
                    name="segundo_apellido" 
                    value={form.segundo_apellido} 
                    onChange={handleChange} 
                    placeholder="Segundo apellido (opcional)" 
                  />
                </div>
                <div className="perfil-info-item">
                  <label className="perfil-info-label">Email *</label>
                  <input 
                    name="correo" 
                    value={form.correo} 
                    onChange={handleChange} 
                    placeholder="Email" 
                    required 
                    type="email" 
                  />
                </div>
                <div className="perfil-info-item">
                  <label className="perfil-info-label">Teléfono *</label>
                  <input 
                    name="telefono" 
                    value={form.telefono} 
                    onChange={handleChange} 
                    placeholder="Teléfono" 
                    required
                  />
                </div>
                <div className="perfil-info-item">
                  <label className="perfil-info-label">Tipo de Documento</label>
                  <select 
                    name="tipoDocumento" 
                    value={form.tipoDocumento} 
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar</option>
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="TI">Tarjeta de Identidad (TI)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PA">Pasaporte (PA)</option>
                  </select>
                </div>
                <div className="perfil-info-item">
                  <label className="perfil-info-label">Número de Documento</label>
                  <input 
                    name="noDocumento" 
                    value={form.noDocumento} 
                    onChange={handleChange} 
                    placeholder="Número de documento" 
                  />
                </div>
                {/* Biografía eliminada */}
                <div className="perfil-actions">
                  <button 
                    className="perfil-btn perfil-btn-primary" 
                    onClick={guardarCambios}
                    disabled={guardandoPerfil}
                  >
                    {guardandoPerfil ? (
                      <>
                        <span className="spinner"></span>
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                  <button 
                    className="perfil-btn perfil-btn-secondary" 
                    onClick={() => setEditando(false)}
                    disabled={guardandoPerfil}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="perfil-info-grid">
                <div className="perfil-info-item">
                  <span className="perfil-info-label">Primer Nombre</span>
                  <span className="perfil-info-value">{user.primer_nombre}</span>
                </div>
                <div className="perfil-info-item">
                  <span className="perfil-info-label">Segundo Nombre</span>
                  <span className="perfil-info-value">{user.segundo_nombre || 'No especificado'}</span>
                </div>
                <div className="perfil-info-item">
                  <span className="perfil-info-label">Primer Apellido</span>
                  <span className="perfil-info-value">{user.primer_apellido}</span>
                </div>
                <div className="perfil-info-item">
                  <span className="perfil-info-label">Segundo Apellido</span>
                  <span className="perfil-info-value">{user.segundo_apellido || 'No especificado'}</span>
                </div>
                <div className="perfil-info-item">
                  <span className="perfil-info-label">Email</span>
                  <span className="perfil-info-value">{user.correo}</span>
                </div>
                <div className="perfil-info-item">
                  <span className="perfil-info-label">Teléfono</span>
                  <span className="perfil-info-value">{user.telefono}</span>
                </div>
                <div className="perfil-info-item">
                  <span className="perfil-info-label">Tipo de Documento</span>
                  <span className="perfil-info-value">{user.tipoDocumento}</span>
                </div>
                <div className="perfil-info-item">
                  <span className="perfil-info-label">Número de Documento</span>
                  <span className="perfil-info-value">{user.noDocumento}</span>
                </div>
                {/* Biografía eliminada */}
                <div className="perfil-actions">
                  <button className="perfil-btn perfil-btn-primary" onClick={() => setEditando(true)}>
                    Editar Perfil
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cambiar contraseña */}
          <div className="perfil-unico-card">
            <h3 className="perfil-section-title">Seguridad</h3>
            <div className="perfil-password-inputs">
              <div className="perfil-password-item">
                <label className="perfil-info-label">Contraseña actual</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="actual"
                  value={passwordForm.actual}
                  onChange={handlePasswordChange}
                  placeholder="Ingresa tu contraseña actual"
                />
              </div>
              <div className="perfil-password-item">
                <label className="perfil-info-label">Nueva contraseña</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="nueva"
                  value={passwordForm.nueva}
                  onChange={handlePasswordChange}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="perfil-password-item">
                <label className="perfil-info-label">Repetir nueva contraseña</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="repetir"
                  value={passwordForm.repetir}
                  onChange={handlePasswordChange}
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>
              <label className="perfil-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={showPassword} 
                  onChange={() => setShowPassword(!showPassword)} 
                /> 
                Mostrar contraseñas
              </label>
              <div className="perfil-actions">
                <button 
                  className="perfil-btn perfil-btn-primary" 
                  onClick={cambiarPassword}
                  disabled={cambiandoPassword}
                >
                  {cambiandoPassword ? (
                    <>
                      <span className="spinner"></span>
                      Cambiando...
                    </>
                  ) : (
                    'Cambiar Contraseña'
                  )}
                </button>
              </div>
              {passwordForm.error && (
                <div className="perfil-message perfil-message-error">
                  {passwordForm.error}
                </div>
              )}
              {passwordForm.exito && (
                <div className="perfil-message perfil-message-success">
                  {passwordForm.exito}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
