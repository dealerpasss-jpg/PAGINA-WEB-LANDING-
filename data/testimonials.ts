// Contenido proporcionado por el cliente.
// Daniela R. queda sin foto por ahora (iniciales) hasta tener una foto de mujer adicional.
export interface Testimonial {
  name: string;
  quote: string;
  stars: number; // 1 a 5
  avatarUrl?: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Carlos R.",
    quote: "Yo al principio no entendía casi nada de subastas, pero aquí me explicaron todo paso a paso y ya me siento más seguro.",
    stars: 5,
    avatarUrl: "/avatars/carlos-r.jpg",
  },
  {
    name: "María G.",
    quote: "La verdad yo no sabía nada de carros y pensé que esto no era para mí, pero explican todo fácil y pude entender.",
    stars: 5,
    avatarUrl: "/avatars/maria-g.jpg",
  },
  {
    name: "Andrés M.",
    quote: "Yo pensaba que solamente era comprar el carro y ya 😂 No sabía todo lo que había que revisar antes.",
    stars: 5,
    avatarUrl: "/avatars/andres-m.jpg",
  },
  {
    name: "Laura P.",
    quote: "Mi esposo y yo queríamos comenzar, pero nos daba miedo perder la plata. Con lo que aprendimos ya sabemos qué revisar.",
    stars: 5,
    avatarUrl: "/avatars/laura-p.jpg",
  },
  {
    name: "Miguel A.",
    quote: "Muy buena información. Hay muchas cosas que uno no sabe y por eso termina perdiendo plata por hacer las cosas a la loca.",
    stars: 5,
    avatarUrl: "/avatars/miguel-a.jpg",
  },
  {
    name: "José L.",
    quote: "Lo que más me gustó fue que pude preguntar todas mis dudas y siempre me respondieron. Muy recomendado.",
    stars: 5,
    avatarUrl: "/avatars/jose-l.jpg",
  },
  {
    name: "Daniela R.",
    quote: "Ya había visto muchos videos, pero quedaba igual de confundida. Aquí sí entendí cómo funciona todo desde el principio.",
    stars: 5,
    avatarUrl: "/avatars/daniela-r.jpg",
  },
  {
    name: "Luis F.",
    quote: "Gracias a ustedes ya no me voy de una por el carro más barato. Ahora reviso bien el título y todos los gastos.",
    stars: 5,
    avatarUrl: "/avatars/luis-f.jpg",
  },
  {
    name: "Kevin S.",
    quote: "Está muy bueno para los que estamos empezando desde cero porque explican fácil y sin tanta vuelta.",
    stars: 5,
    avatarUrl: "/avatars/kevin-s.jpg",
  },
  {
    name: "Alejandro P.",
    quote: "Pensaba comprar sin saber nada de los fees y el transporte. Menos mal aprendí esto antes porque iba a cometer un error.",
    stars: 5,
    avatarUrl: "/avatars/alejandro-p.jpg",
  },
  {
    name: "Sebastián G.",
    quote: "Ya hice mi primera compra y me fue bien porque sabía hasta cuánto podía apostar. Gracias por toda la ayuda 🙏",
    stars: 5,
    avatarUrl: "/avatars/sebastian-g.jpg",
  },
  {
    name: "Felipe H.",
    quote: "Se nota que ellos sí trabajan en esto de verdad. No es solo teoría como otros cursos que había visto.",
    stars: 5,
    avatarUrl: "/avatars/felipe-h.jpg",
  },
];
