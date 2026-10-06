import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Search,
  Building2,
  Bell,
  LockKeyhole,
  FileText,
  Palette,
  History,
  Link2,
  Download,
  Mail,
} from "lucide-react";
import { QuoteDocument } from "@/components/quotes/QuoteDocument";
import { SAMPLE_BUSINESS, SAMPLE_QUOTE } from "@/lib/demo/seed";
import { templateById } from "@/lib/domain/templates";
const quotes = [
  {
    title: "Identidad visual",
    client: "Café Aurora",
    status: "Aceptada",
    tone: "accepted",
    total: "$5,568.00",
  },
  {
    title: "Diseño de catálogo",
    client: "Casa Oliva",
    status: "Vista",
    tone: "viewed",
    total: "$8,352.00",
  },
  {
    title: "Papelería comercial",
    client: "Taller Punto",
    status: "Borrador",
    tone: "draft",
    total: "$2,088.00",
  },
];
const workflowQuote = {
  ...SAMPLE_QUOTE,
  title: "Identidad visual",
  customer: { ...SAMPLE_QUOTE.customer, name: "Café Aurora" },
  items: [
    {
      ...SAMPLE_QUOTE.items[0],
      description: "Diseño de identidad",
      quantity: 1,
      unit_price: 4800,
      discount: 0,
    },
  ],
};
export function WorkflowPreview({
  step,
  demoAvailable,
}: {
  step: number;
  demoAvailable: boolean;
}) {
  return (
    <div className="flow-window">
      <div className="flow-window-bar">
        <span className="flow-dots">
          <i />
          <i />
          <i />
        </span>
        <span>
          <LockKeyhole size={10} />
          cotiza smart /{" "}
          {
            [
              "inicio",
              "registro",
              "negocio",
              "plantillas",
              "editor",
              "compartir",
              "cotizaciones",
            ][step]
          }
        </span>
        <small>Vista de ejemplo</small>
      </div>
      <div className="flow-app">
        <aside className="flow-rail" aria-hidden="true">
          <span>
            CS<span>•</span>
          </span>
          <FileText />
          <Palette />
          <History />
          <div>MT</div>
        </aside>
        <div className="flow-main">
          {step === 0 ? (
            <div className="flow-discover">
              <span className="flow-eyebrow">COTIZA SMART</span>
              <h4>
                Tu siguiente oportunidad
                <br />
                empieza con una propuesta.
              </h4>
              <p>Crea, personaliza y comparte desde un mismo espacio.</p>
              <Link
                href={demoAvailable ? "/demo" : "/register"}
                className="flow-button"
              >
                Explorar producto <ArrowUpRight size={14} />
              </Link>
              <div className="flow-mini-ledger">
                <span>Tu marca</span>
                <span>Tu PDF</span>
                <span>Tu seguimiento</span>
              </div>
            </div>
          ) : step === 1 ? (
            <div className="flow-form">
              <span className="flow-eyebrow">TU ESPACIO DE TRABAJO</span>
              <h4>Crea tu cuenta</h4>
              <div className="flow-two">
                <label>
                  Nombre
                  <input
                    value="María Torres"
                    readOnly
                    aria-label="Nombre de ejemplo"
                  />
                </label>
                <label>
                  Correo
                  <input
                    value="maria@example.com"
                    readOnly
                    aria-label="Correo de ejemplo"
                  />
                </label>
              </div>
              <label>
                Contraseña
                <input
                  value="••••••••••"
                  readOnly
                  aria-label="Contraseña de ejemplo"
                />
              </label>
              <Link href="/register" className="flow-button">
                Comenzar gratis <ArrowUpRight size={14} />
              </Link>
              <p>También puedes continuar con Google.</p>
            </div>
          ) : step === 2 ? (
            <div className="flow-form">
              <span className="flow-eyebrow">CONFIGURA TU NEGOCIO · 1 / 2</span>
              <div className="flow-business">
                <span>
                  <Building2 size={28} />
                </span>
                <div>
                  <h4>Estudio Norte</h4>
                  <p>Diseño e ideas que conectan.</p>
                </div>
              </div>
              <label>
                Nombre comercial
                <input
                  value="Estudio Norte"
                  readOnly
                  aria-label="Negocio de ejemplo"
                />
              </label>
              <div className="flow-choice">
                <span>Productos</span>
                <span className="selected">
                  <Check size={13} />
                  Servicios
                </span>
                <span>Ambos</span>
              </div>
              <Link href="/register" className="flow-button">
                Configurar mi negocio <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : step === 3 ? (
            <div className="flow-catalog">
              <div className="flow-product-heading">
                <div>
                  <span className="flow-eyebrow">ELIGE TU IDENTIDAD</span>
                  <h4>Una forma de destacar.</h4>
                </div>
                <span>36 diseños</span>
              </div>
              <div className="flow-template-row">
                {["essential", "studio", "editorial"].map((id) => {
                  const t = templateById(id);
                  return (
                    <div key={id}>
                      <div>
                        <QuoteDocument
                          thumbnail
                          quote={{
                            ...workflowQuote,
                            template_id: t.id,
                            design: {
                              ...SAMPLE_QUOTE.design,
                              color: t.defaultColor,
                              font: t.defaultFont,
                            },
                          }}
                          business={SAMPLE_BUSINESS}
                        />
                      </div>
                      <strong>{t.name}</strong>
                    </div>
                  );
                })}
              </div>
              <Link href="#plantillas" className="flow-text-link">
                Explorar catálogo <ArrowUpRight size={13} />
              </Link>
            </div>
          ) : step === 4 ? (
            <div className="flow-editor">
              <div>
                <span className="flow-eyebrow">CONCEPTOS · PASO 2 / 4</span>
                <h4>Identidad visual</h4>
                <label>
                  Producto o servicio
                  <input
                    readOnly
                    value="Diseño de identidad"
                    aria-label="Servicio de ejemplo"
                  />
                </label>
                <div className="flow-two">
                  <label>
                    Cantidad
                    <input
                      readOnly
                      value="1"
                      aria-label="Cantidad de ejemplo"
                    />
                  </label>
                  <label>
                    Precio MXN
                    <input
                      readOnly
                      value="$4,800.00"
                      aria-label="Precio de ejemplo"
                    />
                  </label>
                </div>
                <div className="flow-sum">
                  <span>IVA 16%</span>
                  <b>$768.00</b>
                </div>
                <div className="flow-sum total">
                  <span>Total</span>
                  <b>$5,568.00</b>
                </div>
                <Link
                  href={demoAvailable ? "/demo/nueva" : "/register"}
                  className="flow-text-link"
                >
                  Probar el editor <ArrowUpRight size={13} />
                </Link>
              </div>
              <div className="flow-live-paper">
                <QuoteDocument
                  thumbnail
                  quote={workflowQuote}
                  business={SAMPLE_BUSINESS}
                />
                <span>
                  <Check size={11} />
                  Vista previa actualizada
                </span>
              </div>
            </div>
          ) : step === 5 ? (
            <div className="flow-share">
              <div className="flow-share-icon">
                <Link2 size={26} />
              </div>
              <h4>Lista para llegar.</h4>
              <p>Identidad visual · Café Aurora</p>
              <div className="flow-link">
                <LockKeyhole size={12} />
                Enlace privado de tu propuesta
                <Check size={14} />
              </div>
              <div className="flow-delivery">
                <span>
                  <Mail size={17} />
                  Compartir enlace
                </span>
                <span>
                  <Download size={17} />
                  Documento PDF
                </span>
              </div>
              <div className="flow-response">
                <Check size={24} />
                <div>
                  <strong>Cotización aceptada</strong>
                  <span>Una respuesta. Todo actualizado.</span>
                </div>
              </div>
              <Link
                href={demoAvailable ? "/demo" : "/register"}
                className="flow-text-link"
              >
                Explorar el flujo <ArrowUpRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="flow-workspace">
              <div className="flow-product-heading">
                <div>
                  <span className="flow-eyebrow">TU ESPACIO DE TRABAJO</span>
                  <h4>Hola, María.</h4>
                </div>
                <span className="flow-notification">
                  <Bell size={20} />
                  <b>1</b>
                </span>
              </div>
              <div className="flow-search-bar">
                <Search size={13} />
                <span>Buscar por cliente, título o folio</span>
              </div>
              <div className="flow-status-filters">
                <strong>Todas · 3</strong>
                <span>Borradores · 1</span>
                <span>Aceptadas · 1</span>
              </div>
              {quotes.map((q) => (
                <div className="flow-row" key={q.title}>
                  <div>
                    <strong>{q.title}</strong>
                    <span>{q.client}</span>
                  </div>
                  <b className={`flow-status flow-${q.tone}`}>{q.status}</b>
                  <strong>{q.total}</strong>
                </div>
              ))}
              <Link
                href={demoAvailable ? "/demo" : "/register"}
                className="flow-text-link"
              >
                Abrir mi espacio de ejemplo <ArrowUpRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
