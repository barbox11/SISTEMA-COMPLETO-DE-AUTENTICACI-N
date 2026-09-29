import { useState } from 'react';

// Hook genérico para formularios: maneja valores, errores y carga.
export function useFormulario(valoresIniciales) {
  const [valores, setValores] = useState(valoresIniciales);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function actualizar(campo, valor) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }

  return { valores, actualizar, error, setError, cargando, setCargando };
}
