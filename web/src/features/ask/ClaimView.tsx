import { useI18n, type MessageKey } from "../../shared/i18n/index.ts";
import { OriginLabel } from "../../shared/components/index.ts";
import type { Claim } from "../../shared/lib/askApi.ts";
import "./ask.css";

const CHECK_NAMES: Record<string, MessageKey> = {
  cites_evidence: "claim.cites_evidence",
  keys_exist: "claim.keys_exist",
  numbers_match: "claim.numbers_match",
};

/** One claim of an answer: its status, its origins and the checks that decided it. */
export function ClaimView({
  claim,
  open = false,
}: {
  claim: Claim;
  open?: boolean;
}) {
  const { t } = useI18n();
  const passed = claim.checks.filter((check) => check.passed).length;
  return (
    <li
      className={`claim ${claim.verified ? "claim--verified" : "claim--unverified"}`}
    >
      <span className="claim__status">
        {t(claim.verified ? "claim.verified" : "claim.notVerified")}
      </span>{" "}
      {claim.origins.map((origin) => (
        <OriginLabel key={origin} origin={origin} />
      ))}
      <p className="claim__text">{claim.text}</p>
      <details className="claim__checks" open={open}>
        <summary>
          {t("claim.how", { passed, total: claim.checks.length })}
        </summary>
        <ul>
          {claim.checks.map((check) => (
            <li key={check.name}>
              {check.passed ? "✓" : "✗"}{" "}
              {CHECK_NAMES[check.name]
                ? t(CHECK_NAMES[check.name])
                : check.name}
            </li>
          ))}
        </ul>
        {claim.evidence_keys.length > 0 && (
          <p>{t("claim.cited", { keys: claim.evidence_keys.join(", ") })}</p>
        )}
        {claim.citations.map((citation) => (
          <p key={citation}>{t("claim.source", { citation })}</p>
        ))}
      </details>
    </li>
  );
}
