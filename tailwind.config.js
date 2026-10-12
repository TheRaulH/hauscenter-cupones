/** Paleta oficial Hauscenter (ver skill línea gráfica) */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        haus: {
          azul: '#123B64',
          arena: '#F3E4CD',
          apoyo: '#DCE3EB',
          blanco: '#FAF7F0',
          naranja: '#E76100',
          oliva: '#7C8861',
        },
      },
      fontFamily: {
        sans: ['"Outfit Variable"', 'Outfit', 'system-ui', 'sans-serif'],
        // KG The Fighter si se agrega el archivo en src/assets/fonts; si no, Caveat como sustituto
        accent: ['"KG The Fighter"', 'Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
};
