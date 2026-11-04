import type { Product, QuizAnswers } from "@/types/domain";

/**
 * Puntaje del recomendador "Encuentra tu pieza":
 * +2 si coincide el uso, +2 si coincide el estilo, +1 si entra en el presupuesto (−2 si no).
 */
export function scoreProduct(product: Product, answers: QuizAnswers): number {
  return (
    (product.quizTags.purpose === answers.purpose ? 2 : 0) +
    (product.quizTags.style === answers.style ? 2 : 0) +
    (product.price <= answers.budget ? 1 : -2)
  );
}

/** Devuelve la pieza con mayor puntaje (en empate gana la primera del catálogo). */
export function recommendProduct(products: Product[], answers: QuizAnswers): Product | undefined {
  let best: Product | undefined;
  let bestScore = -Infinity;
  for (const product of products) {
    const score = scoreProduct(product, answers);
    if (score > bestScore) {
      best = product;
      bestScore = score;
    }
  }
  return best;
}
