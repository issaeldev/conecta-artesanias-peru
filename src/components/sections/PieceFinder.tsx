import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { quizQuestions } from "@/data/quiz";
import { recommendProduct } from "@/lib/recommend";
import { useCatalog } from "@/state/CatalogProvider";
import { useProductModal } from "@/state/ProductModalProvider";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { QuizAnswers } from "@/types/domain";

/** "Encuentra tu pieza": tres preguntas y una recomendación del catálogo. */
export function PieceFinder() {
  const { t, locale } = useI18n();
  const { products } = useCatalog();
  const { openProduct } = useProductModal();
  const [answers, setAnswers] = useState<string[]>([]);

  const total = quizQuestions.length;
  const done = answers.length >= total;

  const recommendation = useMemo(() => {
    if (!done) return undefined;
    const parsed: QuizAnswers = {
      purpose: answers[0] as QuizAnswers["purpose"],
      style: answers[1] as QuizAnswers["style"],
      budget: Number(answers[2]),
    };
    return recommendProduct(products, parsed);
  }, [done, answers, products]);

  const question = quizQuestions[answers.length];

  return (
    <section id="quiz">
      <div className="w">
        <SectionHeading title={t.quiz.title} sub={t.quiz.sub} />
        <Card id="qz">
          {!done && question && (
            <>
              <h3>
                {answers.length + 1}/{total} · {question.question[locale]}
              </h3>
              <div className="row">
                {question.options.map((o) => (
                  <Chip key={o.value} onClick={() => setAnswers((a) => [...a, o.value])}>
                    {o.label[locale]}
                  </Chip>
                ))}
              </div>
            </>
          )}
          {done && recommendation && (
            <>
              <h3>
                {t.quiz.recommend}
                {recommendation.name[locale]}
              </h3>
              <p>
                S/ {recommendation.price}
                {t.quiz.samplePiece}
              </p>
              <div className="row">
                <button className="btn" type="button" onClick={() => openProduct(recommendation.id)}>
                  {t.quiz.viewPiece}
                </button>
                <Chip onClick={() => setAnswers([])}>{t.quiz.retake}</Chip>
              </div>
            </>
          )}
        </Card>
      </div>
    </section>
  );
}
