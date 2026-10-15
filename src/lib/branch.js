import { useCallback, useState } from 'react';
import { BRANCHES } from '../config/brand';

const KEY = 'hc_branch_v1';

function read() {
  try {
    const v = localStorage.getItem(KEY);
    return BRANCHES.includes(v) ? v : null;
  } catch {
    return null;
  }
}

// Sucursal de ESTE equipo: se guarda en el navegador y se envía en cada cupón.
export function useBranch() {
  const [branch, setState] = useState(read);
  const setBranch = useCallback((b) => {
    try {
      if (b) localStorage.setItem(KEY, b);
      else localStorage.removeItem(KEY);
    } catch { /* sin storage */ }
    setState(b);
  }, []);
  return [branch, setBranch];
}
