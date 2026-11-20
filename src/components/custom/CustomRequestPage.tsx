import { useState, type FormEvent } from "react";
import { countries } from "@/data/countries";
import { peruDepartments } from "@/data/peru";
import { useI18n } from "@/i18n/I18nProvider";
import { isInternational } from "@/lib/orders";
import { fill } from "@/lib/text";
import { navigate, paths } from "@/hooks/useRoute";
import { useCatalog } from "@/state/CatalogProvider";
import { useCurrency } from "@/state/CurrencyProvider";
import { useOrders } from "@/state/OrdersProvider";
import "@/components/checkout/Checkout.css";
import "./Custom.css";

type Field = "size" | "colors" | "notes" | "name" | "email" | "country" | "department";
type Values = Record<Field, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const empty: Values = { size: "", colors: "", notes: "", name: "", email: "", country: "PE", department: "" };
const sample: Values = {
  size: "Más grande, unos 35 cm",
  colors: "Tonos azules y blancos",
  notes: "Con las iniciales A y T en la base",
  name: "Ana Torres Salazar",
  email: "ana.torres@ejemplo.com",
  country: "PE",
  department: "Lima",
};

/** Formulario "Pide tu pieza a medida": la solicitud que se le consulta al artesano por WhatsApp. */
export function CustomRequestPage({ productId }: { productId: string }) {
  const { t, locale } = useI18n();
  const c = t.custom;
  const co = t.checkout;
  const { getProduct, workshops, status } = useCatalog();
  const { format } = useCurrency();
  const { sendRequest } = useOrders();
  const [values, setValues] = useState<Values>(empty);
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<Field | "changes", string>>>({});

  const product = getProduct(productId);
  if (!product) {
    return (
      <section className="co-page">
        <div className="w co-empty">
          {status !== "loading" && (
            <a className="btn" href="#catalogo">
              {c.explore}
            </a>
          )}
        </div>
      </section>
    );
  }

  const workshop = workshops.find((w) => w.id === product.artisanId);
  const artisan = (workshop?.artisanName[locale] ?? product.artisanName).split(" ")[0];
  const intl = isInternational(values.country);

  const set = (field: Field) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setValues((v) =>
      field === "country" && isInternational(value) !== isInternational(v.country)
        ? { ...v, country: value, department: "" }
        : { ...v, [field]: value },
    );
    setErrors((er) => ({ ...er, [field]: undefined, ...(["size", "colors", "notes"].includes(field) ? { changes: undefined } : {}) }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found: Partial<Record<Field | "changes", string>> = {};
    if (![values.size, values.colors, values.notes].some((v) => v.trim())) found.changes = c.needOne;
    for (const f of ["name", "email", "department"] as Field[]) if (!values[f].trim()) found[f] = co.required;
    if (values.email.trim() && !EMAIL_RE.test(values.email.trim())) found.email = co.invalidEmail;
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(found.changes ? "cr-size" : `cr-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    const req = sendRequest({
      product,
      workshop,
      details: { size: values.size.trim(), colors: values.colors.trim(), notes: values.notes.trim() },
      quantity,
      customer: {
        name: values.name.trim(),
        email: values.email.trim(),
        country: values.country,
        department: values.department.trim(),
      },
    });
    navigate(`${paths.request(req.id)}?nuevo`);
  };

  const field = (f: Field, label: string, props: Record<string, string> = {}, textarea = false) => (
    <div className={`field${errors[f] ? " bad" : ""}`}>
      <label htmlFor={`cr-${f}`}>{label}</label>
      {textarea ? (
        <textarea id={`cr-${f}`} rows={3} value={values[f]} onChange={set(f)} {...props} />
      ) : (
        <input id={`cr-${f}`} value={values[f]} onChange={set(f)} aria-invalid={Boolean(errors[f])} {...props} />
      )}
      {errors[f] && <small className="err">{errors[f]}</small>}
    </div>
  );

  return (
    <section className="co-page">
      <div className="w cr">
        <a className="co-back" href="#catalogo">
          {c.back}
        </a>
        <div className="co-head">
          <h1>{c.formTitle}</h1>
          <button type="button" className="chip" onClick={() => setValues(sample)}>
            {c.sample}
          </button>
        </div>

        <div className="cr-product">
          <img src={product.image.src} alt="" style={{ background: product.image.background }} />
          <div>
            <p className="cr-name">{product.name[locale]}</p>
            <p className="cr-meta">
              {product.location} · {fill(c.catalogPrice, { price: format(product.price) })}
            </p>
            <p className="cr-intro">{fill(c.formIntro, { artisan })}</p>
          </div>
        </div>

        <form className="co cr-form" onSubmit={submit} noValidate>
          <div className="co-form">
            <fieldset>
              <legend>{c.formTitle}</legend>
              {field("size", c.size, { placeholder: fill(c.sizeHint, { size: product.size[locale] }) })}
              {field("colors", c.colors, { placeholder: c.colorsPlaceholder })}
              {field("notes", c.notes, { placeholder: c.notesPlaceholder }, true)}
              {errors.changes && (
                <p className="err" role="alert">
                  {errors.changes}
                </p>
              )}
              <div className="field cr-qty">
                <label htmlFor="cr-qty">{c.quantity}</label>
                <select id="cr-qty" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
            </fieldset>

            <fieldset>
              <legend>{c.contact}</legend>
              <div className="pair">
                {field("name", co.name, { autoComplete: "name" })}
                {field("email", co.email, { type: "email", autoComplete: "email" })}
              </div>
              <div className="pair">
                <div className="field">
                  <label htmlFor="cr-country">{co.country}</label>
                  <select id="cr-country" value={values.country} onChange={set("country")}>
                    {countries.map((x) => (
                      <option key={x.code} value={x.code}>
                        {x.name[locale]}
                      </option>
                    ))}
                  </select>
                </div>
                {intl ? (
                  field("department", co.state)
                ) : (
                  <div className={`field${errors.department ? " bad" : ""}`}>
                    <label htmlFor="cr-department">{co.department}</label>
                    <select id="cr-department" value={values.department} onChange={set("department")}>
                      <option value="">{co.departmentPlaceholder}</option>
                      {peruDepartments.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    {errors.department && <small className="err">{errors.department}</small>}
                  </div>
                )}
              </div>
              <p className="hint">{co.emailHint}</p>
            </fieldset>
            <button className="btn" type="submit">
              {c.send} →
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
