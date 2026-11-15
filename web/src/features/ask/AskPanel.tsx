import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../shared/i18n/index.ts";
import { OriginLabel } from "../../shared/components/index.ts";
import type { Rotation } from "../../shared/lib/rotation.ts";
import { rotationName } from "../rotations/labels.ts";
import { ClaimView } from "./ClaimView.tsx";
import { useAsk } from "./useAsk.ts";
import { useStaged } from "./useStaged.ts";
import type { Topic, TopicId } from "./topics.ts";
import "./ask.css";

const MAX_LENGTH = 500;

/** Ask a question about the data. If the service fails or is slow, the pre-generated explanation is shown instead. */
export function AskPanel({
  rotation,
  topics,
}: {
  rotation: Rotation;
  topics: Topic[];
}) {
  const { t } = useI18n();
  const english = t("ask.englishOnly");
  const [question, setQuestion] = useState("");
  const { state, ask } = useAsk(rotation.id);
  const [topicId, setTopicId] = useState<TopicId | null>(null);
  const outcome = useRef<HTMLDivElement>(null);
  const response = state.status === "answered" ? state.response : null;
  const shown = useStaged(response?.claims.length ?? 0, response);

  // The result sits under the form, below the fold of the side panel: bring it into view.
  useEffect(() => {
    if (state.status === "answered" || state.status === "failed")
      outcome.current?.scrollIntoView({ block: "nearest" });
  }, [state, shown]);

  function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (question.trim()) void ask(question.trim());
  }

  function askExample(example: string) {
    setQuestion(example);
    void ask(example);
  }

  const loading = state.status === "loading";
  const topic = topics.find((item) => item.id === topicId);
  const step =
    state.status === "idle" ? (topicId || question.trim() ? 2 : 1) : 3;
  return (
    <div className="ask">
      {english && (
        <p className="ask__language">
          <span aria-hidden="true">ⓘ</span> {english}
        </p>
      )}
      <ol className="ask__steps" aria-label={t("ask.stepsAria")}>
        {(
          ["ask.step.topic", "ask.step.question", "ask.step.answer"] as const
        ).map((key, index) => (
          <li
            key={key}
            aria-current={step === index + 1 ? "step" : undefined}
            className={step > index + 1 ? "is-done" : undefined}
          >
            <span aria-hidden="true">{index + 1}</span> {t(key)}
          </li>
        ))}
      </ol>
      <div
        className="ask__topics"
        role="group"
        aria-label={t("ask.topicsAria")}
      >
        {topics.map((item) => (
          <button
            key={item.id}
            type="button"
            className="ask__topic"
            aria-pressed={topicId === item.id}
            onClick={() => setTopicId(topicId === item.id ? null : item.id)}
          >
            {t(`ask.topic.${item.id}` as const)}
          </button>
        ))}
      </div>
      {topic ? (
        <ul className="ask__examples" aria-label={t("ask.examplesAria")}>
          {topic.questions.map((example) => (
            <li key={example}>
              <button
                type="button"
                className="ask__example"
                disabled={loading}
                onClick={() => askExample(example)}
              >
                <span>{example}</span>
                <span aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="ask__hint">{t("ask.pickTopic")}</p>
      )}
      <form className="ask__form" onSubmit={submit}>
        <label htmlFor="question" className="ask__label">
          {t("ask.question")}
        </label>
        <div className="ask__composer">
          <textarea
            id="question"
            value={question}
            maxLength={MAX_LENGTH}
            rows={2}
            placeholder={t("ask.placeholder")}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit(event);
              }
            }}
          />
          <button
            type="submit"
            className="ask__send"
            aria-label={t("ask.send")}
            disabled={loading || !question.trim()}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
        {loading && (
          <ol className="ask__timeline" role="status">
            <li className="is-done">{t("ask.stage.sent")}</li>
            <li className="is-active">
              <span className="ask__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {t("ask.stage.waiting")}
            </li>
          </ol>
        )}
      </form>

      <div ref={outcome}>
        {response && (
          <div className="ask__result" aria-live="polite">
            <ol className="ask__timeline">
              <li className="is-done">{t("ask.stage.sent")}</li>
              <li className="is-done">
                {t("ask.stage.answer")}
                {response.answered ? (
                  <p className="ask__answer">{response.answer}</p>
                ) : (
                  <p className="ask__nodata">{t("ask.nodata")}</p>
                )}
              </li>
              {response.claims.length > 0 && (
                <li
                  className={
                    shown >= response.claims.length ? "is-done" : "is-active"
                  }
                >
                  {shown >= response.claims.length
                    ? t("ask.stage.checked", {
                        verified: response.claims.filter(
                          (claim) => claim.verified,
                        ).length,
                        total: response.claims.length,
                      })
                    : t("ask.stage.checking", {
                        shown,
                        total: response.claims.length,
                      })}
                  <ul className="ask__claims">
                    {response.claims.slice(0, shown).map((claim) => (
                      <ClaimView key={claim.text} claim={claim} open />
                    ))}
                  </ul>
                </li>
              )}
            </ol>
            {shown >= response.claims.length && (
              <p className="ask__notice">{response.notice}</p>
            )}
          </div>
        )}

        {state.status === "failed" && state.kind === "daily_limit" && (
          <p className="ask__failed" role="status">
            {t("ask.daily")}
          </p>
        )}

        {state.status === "failed" && state.kind === "busy" && (
          <p className="ask__failed" role="status">
            {t("ask.busy")}
          </p>
        )}

        {state.status === "failed" && state.kind === "unavailable" && (
          <div className="ask__result" aria-live="polite">
            <p className="ask__failed">
              {t("ask.unavailable", { name: rotationName(t, rotation) })}
            </p>
            <ul className="ask__claims">
              {rotation.explanation.why.map((statement) => (
                <li key={statement.text}>
                  <OriginLabel origin={statement.origin} /> {statement.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
