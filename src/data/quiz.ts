import type { QuizQuestion } from "@/types/domain";

export const quizQuestions: QuizQuestion[] = [
  {
    id: "purpose",
    question: { es: "¿Para qué la quieres?", en: "What is it for?" },
    options: [
      { value: "uso", label: { es: "Para usar", en: "To use" } },
      { value: "decor", label: { es: "Para decorar", en: "To decorate" } },
      { value: "regalo", label: { es: "De regalo", en: "As a gift" } },
    ],
  },
  {
    id: "style",
    question: { es: "¿Qué estilo te gusta?", en: "What style do you like?" },
    options: [
      { value: "color", label: { es: "Colorido y alegre", en: "Colorful and joyful" } },
      { value: "sobrio", label: { es: "Sobrio y elegante", en: "Understated and elegant" } },
      { value: "tradicion", label: { es: "Muy tradicional", en: "Very traditional" } },
    ],
  },
  {
    id: "budget",
    question: { es: "¿Cuál es tu presupuesto?", en: "What is your budget?" },
    options: [
      { value: "270", label: { es: "Hasta S/ 270", en: "Up to S/ 270" } },
      { value: "300", label: { es: "Hasta S/ 300", en: "Up to S/ 300" } },
      { value: "Infinity", label: { es: "Sin límite", en: "No limit" } },
    ],
  },
];
