import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MobileMenuController } from "../components/MobileMenuController";

const optionGroups = [
  {
    name: "symptom",
    label: "Come ti senti la mattina dopo una cena abbondante?",
    options: [
      "Viso gonfio e senso di pesantezza addominale (Segmento: ristagno linfatico)",
      "Forte senso di fame già un'ora dopo il risveglio (Segmento: sbalzi insulinici)",
      "Apatia e totale mancanza di energia (Segmento: letargo metabolico)",
      "Tutte le opzioni precedenti",
    ],
  },
  {
    name: "obstacle",
    label: "Qual è per te l'ostacolo principale verso la forma ideale?",
    options: [
      "La cultura delle cene tarde (non posso dire di no a famiglia/amici)",
      "Voglia incontrollabile di dolci e carboidrati",
      "Metabolismo lento (mangio poco, ma il peso non scende)",
      "Stress e fame emotiva",
    ],
  },
  {
    name: "goal",
    label: "Quale risultato desideri ottenere per primo?",
    options: [
      "Pancia piatta e addio al gonfiore",
      "Glicemia stabile e rinuncia ai dolci senza soffrire",
      "Perdere 5-7 kg di grasso e sentirmi più leggero",
      "Reset totale dell'organismo e ondata di energia",
    ],
  },
] as const;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formHtml() {
  const groups = optionGroups
    .map(
      (group, groupIndex) => `
        <div class="lead-form__step${groupIndex === 0 ? " is-active" : ""}" data-lead-step="${groupIndex}">
          <fieldset class="lead-form__group">
          <legend>${escapeHtml(group.label)}</legend>
          ${group.options
            .map(
              (option, index) => `
                <label class="lead-form__option">
                  <input type="radio" name="${group.name}" value="${escapeHtml(option)}" ${
                    index === 0 ? "required" : ""
                  } />
                  <span>${escapeHtml(option)}</span>
                </label>
              `,
            )
            .join("")}
          </fieldset>
          <button class="lead-form__next" type="button">Más lejos</button>
        </div>
      `,
    )
    .join("");

  return `
    <section class="lead-form-shell">
      <form class="lead-form" data-step-form action="/your-submission-was-successful/" method="post" onsubmit="event.preventDefault(); window.location.href='/your-submission-was-successful/';">
        <div class="lead-form__progress" aria-live="polite">
          <ol class="lead-form__steps" aria-label="Avanzamento modulo">
            <li class="is-active"><span>1</span></li>
            <li><span>2</span></li>
            <li><span>3</span></li>
            <li><span>4</span></li>
          </ol>
        </div>
        ${groups}
        <div class="lead-form__step lead-form__contact" data-lead-step="${optionGroups.length}">
          <h3>Completa la richiesta</h3>
          <div class="lead-form__grid">
            <input type="text" name="fullName" placeholder="nombre completo" required />
            <input type="tel" name="phone" placeholder="número de Teléfono" pattern="[0-9()#+*.=\\-\\s]+" required />
          </div>
          <button type="submit">INVIA LA RICHIESTA</button>
        </div>
      </form>
    </section>
  `;
}

export default function Home() {
  const html = readFileSync(join(process.cwd(), "content/home.html"), "utf8").replace(
    "<!--LEAD_FORM-->",
    formHtml(),
  );

  return (
    <>
      <MobileMenuController />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
