// Si agregas KG The Fighter en src/assets/fonts, se registra solo (también para la imagen exportada).
const found = import.meta.glob('/src/assets/fonts/*.{ttf,otf,woff,woff2}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const entry = Object.entries(found).find(([path]) => /kg.?the.?fighter/i.test(path));
if (entry) {
  const style = document.createElement('style');
  style.textContent = `@font-face{font-family:'KG The Fighter';src:url('${entry[1]}');font-display:swap;}`;
  document.head.appendChild(style);
}
