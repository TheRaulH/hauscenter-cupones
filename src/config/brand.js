// Configuración de marca. Cambia aquí textos y rutas sin tocar los componentes.
export const BRAND = {
  name: 'Hauscenter',
  // Archivos oficiales del logo: colócalos en /public/brand (ver LEEME.txt)
  logos: {
    blanco: '/brand/imagotipo-blanco.png',
    azul: '/brand/imagotipo-azul.png',
  },
  liveLabel: 'En vivo',
  couponTerms: 'Cupón único. Presenta este código para canjearlo.',
  couponSmallPrint: 'No aplica oferta sobre oferta.',
  validityMonths: 1, // vigencia del cupón desde que se genera
  timezone: 'America/La_Paz',
};

// Sucursales. Cada equipo elige la suya una sola vez (se guarda en el navegador).
export const BRANCHES = ['Cañoto', 'América', 'Isabel la Católica', 'Isuto', 'Brisas', 'Cielo Mall'];
