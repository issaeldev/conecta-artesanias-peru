import { useState, type FormEvent } from "react";
import { siteConfig } from "@/config/site";
import { countries } from "@/data/countries";
import { peruDepartments } from "@/data/peru";
import { useI18n } from "@/i18n/I18nProvider";
import { addBusinessDays, isInternational, shippingQuote, toOrderLine, type CartEntry } from "@/lib/orders";
import { formatAmount, sumBreakdowns } from "@/lib/pricing";
import { requestQuote, requestStatus, requestSummary } from "@/lib/requests";
import { fill, formatDay } from "@/lib/text";
import { navigate, paths } from "@/hooks/useRoute";
import { useCart } from "@/state/CartProvider";
import { useCatalog } from "@/state/CatalogProvider";
import { useOrders } from "@/state/OrdersProvider";
import type { Customer, OrderTotals, PaymentMethod } from "@/types/order";
import { Guarantee } from "./Guarantee";
import { MastercardLogo, VisaLogo, YapeLogo } from "./PaymentLogos";
import { PaymentSummary } from "./PaymentSummary";
import "./Checkout.css";

type Field = keyof Customer | "cardNumber" | "cardExpiry" | "cardCvv" | "yapePhone" | "yapeCode";
type Values = Record<Field, string>;

const emptyValues: Values = {
  name: "",
  email: "",
  phone: "",
  country: "PE",
  department: "",
  postalCode: "",
  city: "",
  address: "",
  reference: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  yapePhone: "",
  yapeCode: "",
};

/** Datos ficticios para no tipear en vivo durante la demostración. */
const card = { cardNumber: "4111 1111 1111 1111", cardExpiry: "12/28", cardCvv: "123" };
const samplePeru: Values = {
  ...emptyValues,
  ...card,
  name: "Ana Torres Salazar",
  email: "ana.torres@ejemplo.com",
  phone: "987 654 321",
  department: "Lima",
  city: "Miraflores",
  address: "Av. José Larco 812, dpto. 501",
  reference: "A media cuadra del parque Kennedy",
  yapePhone: "987 654 321",
  yapeCode: "482913",
};
const sampleIntl: Values = {
  ...emptyValues,
  ...card,
  name: "Emily Carter",
  email: "emily.carter@example.com",
  phone: "+1 415 555 0134",
  country: "US",
  department: "California",
  postalCode: "94110",
  city: "San Francisco",
  address: "742 Valencia St",
  reference: "Apt 3",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Checkout del carrito o, con requestId, de una pieza a medida ya cotizada por el artesano
 * (en ese caso el precio y el plazo son los de la cotización).
 */
export function CheckoutPage({ requestId }: { requestId?: string }) {
  const { t, locale } = useI18n();
  const c = t.checkout;
  const cart = useCart();
  const { getProduct, workshops } = useCatalog();
  const { placeOrder, getRequest, acceptRequest } = useOrders();

  const request = requestId ? getRequest(requestId) : undefined;
  const customQuote = request ? requestQuote(request) : null;
  const customReady = Boolean(request && customQuote && requestStatus(request) === "quoted");

  const [values, setValues] = useState<Values>(() =>
    request
      ? {
          ...emptyValues,
          name: request.customer.name,
          email: request.customer.email,
          country: request.customer.country,
          department: request.customer.department,
        }
      : emptyValues,
  );
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [processing, setProcessing] = useState(false);

  const intl = isInternational(values.country);
  // Compradores del extranjero ven y pagan en dólares; Yape solo funciona en Perú.
  const currency = intl ? "USD" : "PEN";
  const money = (amountPen: number) => formatAmount(amountPen, currency, siteConfig.penPerUsd);
  const payMethod: PaymentMethod = intl ? "card" : method;

  const customProduct = request ? getProduct(request.productId) : undefined;
  const entries: CartEntry[] = requestId
    ? customReady && customProduct && request && customQuote
      ? [
          {
            product: {
              ...customProduct,
              price: customQuote.buyerPrice,
              name: { es: `${customProduct.name.es} (a medida)`, en: `${customProduct.name.en} (custom)` },
            },
            quantity: request.quantity,
            custom: { requestId: request.id, details: requestSummary(request), days: customQuote.days },
          },
        ]
      : []
    : Object.entries(cart.items).flatMap(([id, quantity]) => {
        const product = getProduct(id);
        return product ? [{ product, quantity }] : [];
      });

  const byWorkshop = new Map<string, CartEntry[]>();
  for (const e of entries) byWorkshop.set(e.product.artisanId, [...(byWorkshop.get(e.product.artisanId) ?? []), e]);
  const groups = [...byWorkshop.entries()];

  // En Perú el costo depende del departamento; en el extranjero, solo del país.
  const destinationKnown = intl || Boolean(values.department);
  const quote = shippingQuote(values.country, values.department, groups.length);
  const products = sumBreakdowns(entries.map((e) => toOrderLine(e).breakdown));
  const shippingTotal = destinationKnown ? quote.total : 0;
  const totals: OrderTotals = {
    products: products.total,
    artisan: products.artisan,
    commission: products.commission,
    igv: products.igv,
    shipping: shippingTotal,
    total: Math.round((products.total + shippingTotal) * 100) / 100,
  };
  const eta = destinationKnown
    ? addBusinessDays(
        addBusinessDays(new Date(), customQuote?.days ?? siteConfig.logistics.dispatchDays),
        quote.transitDays,
      )
    : null;

  const set = (field: Field) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setValues((v) => {
      // Al cambiar de país, el departamento/estado anterior ya no aplica.
      if (field === "country" && isInternational(value) !== isInternational(v.country)) {
        return { ...v, country: value, department: "", postalCode: "" };
      }
      return { ...v, [field]: value };
    });
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = (): Partial<Record<Field, string>> => {
    const required: Field[] = ["name", "email", "phone", "country", "department", "city", "address"];
    if (intl) required.push("postalCode");
    required.push(...((payMethod === "card" ? ["cardNumber", "cardExpiry", "cardCvv"] : ["yapePhone", "yapeCode"]) as Field[]));
    const found: Partial<Record<Field, string>> = {};
    for (const f of required) if (!values[f].trim()) found[f] = c.required;
    if (values.email.trim() && !EMAIL_RE.test(values.email.trim())) found.email = c.invalidEmail;
    return found;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (processing) return;
    const found = validate();
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    setProcessing(true);
    const detail =
      payMethod === "card"
        ? fill(c.paidCard, { last4: values.cardNumber.replace(/\D/g, "").slice(-4) })
        : fill(c.paidYape, { phone: values.yapePhone });
    // Pausa breve para que se perciba el "procesando pago" de una pasarela real.
    window.setTimeout(() => {
      const order = placeOrder({
        customer: {
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          country: values.country,
          department: values.department.trim(),
          postalCode: values.postalCode.trim(),
          city: values.city.trim(),
          address: values.address.trim(),
          reference: values.reference.trim(),
        },
        payment: { method: payMethod, detail },
        entries,
        workshops,
      });
      if (requestId) acceptRequest(requestId, order.id);
      else cart.clear();
      navigate(`${paths.order(order.id)}?nuevo`);
    }, 1400);
  };

  if (entries.length === 0 && !processing) {
    // A medida: la cotización ya se pagó, se rechazó o aún no existe → volver a la solicitud.
    return (
      <section className="co-page">
        <div className="w co-empty">
          <h1>{requestId ? t.custom.checkoutTitle : c.title}</h1>
          {!requestId && <p>{c.empty}</p>}
          <a className="btn" href={requestId ? paths.request(requestId) : "#catalogo"}>
            {requestId ? t.custom.backToRequest : c.explore}
          </a>
        </div>
      </section>
    );
  }

  const errorText = (field: Field) =>
    errors[field] && (
      <small id={`co-${field}-err`} className="err">
        {errors[field]}
      </small>
    );

  const input = (field: Field, label: string, props: Record<string, string> = {}) => (
    <div className={`field${errors[field] ? " bad" : ""}`}>
      <label htmlFor={`co-${field}`}>{label}</label>
      <input
        id={`co-${field}`}
        value={values[field]}
        onChange={set(field)}
        aria-invalid={Boolean(errors[field])}
        aria-describedby={errors[field] ? `co-${field}-err` : undefined}
        {...props}
      />
      {errorText(field)}
    </div>
  );

  const select = (field: Field, label: string, options: { value: string; label: string }[], placeholder?: string) => (
    <div className={`field${errors[field] ? " bad" : ""}`}>
      <label htmlFor={`co-${field}`}>{label}</label>
      <select id={`co-${field}`} value={values[field]} onChange={set(field)} aria-invalid={Boolean(errors[field])}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {errorText(field)}
    </div>
  );

  return (
    <section className="co-page">
      <div className="w">
        <a className="co-back" href={requestId ? paths.request(requestId) : "#catalogo"}>
          {requestId ? t.custom.backToRequest : c.back}
        </a>
        <div className="co-head">
          <h1>{requestId ? t.custom.checkoutTitle : c.title}</h1>
          {requestId ? (
            // A medida: conserva nombre, correo y destino de la solicitud; completa el resto.
            <button
              type="button"
              className="chip"
              onClick={() =>
                setValues((v) => ({
                  ...(intl ? sampleIntl : samplePeru),
                  name: v.name,
                  email: v.email,
                  country: v.country,
                  department: v.department || (intl ? sampleIntl : samplePeru).department,
                }))
              }
            >
              {t.custom.sample}
            </button>
          ) : (
            <div className="row">
              <button type="button" className="chip" onClick={() => setValues(samplePeru)}>
                {c.demoFill}
              </button>
              <button type="button" className="chip" onClick={() => setValues(sampleIntl)}>
                {c.demoFillIntl}
              </button>
            </div>
          )}
        </div>
        <p className="co-demo">{c.demoNote}</p>

        <form className="co" onSubmit={submit} noValidate>
          <div className="co-form">
            <fieldset>
              <legend>{c.contact}</legend>
              {input("name", c.name, { autoComplete: "name" })}
              <div className="pair">
                {input("email", c.email, { type: "email", autoComplete: "email" })}
                {input("phone", c.phone, { type: "tel", autoComplete: "tel", inputMode: "tel" })}
              </div>
              <p className="hint">
                {c.emailHint} {intl && c.phoneIntl}
              </p>
            </fieldset>

            <fieldset>
              <legend>{c.delivery}</legend>
              {select(
                "country",
                c.country,
                countries.map((x) => ({ value: x.code, label: x.name[locale] })),
              )}
              {intl ? (
                <>
                  {input("address", c.address, { autoComplete: "address-line1" })}
                  {input("reference", c.address2, { autoComplete: "address-line2" })}
                  <div className="pair">
                    {input("city", c.city, { autoComplete: "address-level2" })}
                    {input("department", c.state, { autoComplete: "address-level1" })}
                  </div>
                  <div className="pair">{input("postalCode", c.postalCode, { autoComplete: "postal-code" })}</div>
                  <p className="hint">{fill(c.intlNote, { courier: siteConfig.logistics.international.courier })}</p>
                  <p className="customs">{c.customs}</p>
                </>
              ) : (
                <>
                  <div className="pair">
                    {select(
                      "department",
                      c.department,
                      peruDepartments.map((d) => ({ value: d, label: d })),
                      c.departmentPlaceholder,
                    )}
                    {input("city", c.city, { autoComplete: "address-level2" })}
                  </div>
                  {input("address", c.address, { autoComplete: "street-address" })}
                  {input("reference", c.reference)}
                  <p className="hint">{fill(c.shippingNote, { courier: siteConfig.logistics.courier })}</p>
                </>
              )}
              {eta && <p className="eta">{fill(c.eta, { date: formatDay(eta.toISOString(), locale) })}</p>}
            </fieldset>

            <fieldset>
              <legend>{c.payment}</legend>
              <div className="paym" role="radiogroup">
                {(intl ? (["card"] as const) : (["card", "yape"] as const)).map((m) => (
                  <label key={m} className={`paym-opt${payMethod === m ? " on" : ""}`}>
                    <input type="radio" name="method" checked={payMethod === m} onChange={() => setMethod(m)} />
                    <span className="paym-logos">
                      {m === "card" ? (
                        <>
                          <VisaLogo />
                          <MastercardLogo />
                        </>
                      ) : (
                        <YapeLogo />
                      )}
                    </span>
                    <span className="paym-name">{m === "card" ? c.card : c.yape}</span>
                  </label>
                ))}
              </div>
              {payMethod === "card" ? (
                <>
                  {input("cardNumber", c.cardNumber, { inputMode: "numeric", autoComplete: "cc-number" })}
                  <div className="pair">
                    {input("cardExpiry", c.cardExpiry, { inputMode: "numeric", autoComplete: "cc-exp" })}
                    {input("cardCvv", c.cardCvv, { inputMode: "numeric", autoComplete: "cc-csc" })}
                  </div>
                </>
              ) : (
                <>
                  <div className="pair">
                    {input("yapePhone", c.yapePhone, { type: "tel", inputMode: "tel" })}
                    {input("yapeCode", c.yapeCode, { inputMode: "numeric" })}
                  </div>
                  <p className="hint">{c.yapeHint}</p>
                </>
              )}
            </fieldset>
          </div>

          <aside className="co-sum">
            <h2 className="co-sum-title">{c.summary}</h2>
            {groups.map(([workshopId, list]) => {
              const w = workshops.find((x) => x.id === workshopId);
              return (
                <div className="co-group" key={workshopId}>
                  <p className="co-group-head">
                    {fill(c.fromWorkshop, {
                      artisan: (w?.artisanName[locale] ?? list[0].product.artisanName).split(" ")[0],
                      region: w?.regionName ?? list[0].product.originRegion,
                    })}
                  </p>
                  {list.map(({ product, quantity }) => (
                    <div className="co-line" key={product.id}>
                      <img src={product.image.src} alt="" style={{ background: product.image.background }} />
                      <span>
                        {product.name[locale]}
                        <small>× {quantity}</small>
                      </span>
                      <b>{money(product.price * quantity)}</b>
                    </div>
                  ))}
                </div>
              );
            })}
            <PaymentSummary totals={totals} workshops={groups.length} international={intl} currency={currency} />
            {intl && <p className="co-usd">{fill(c.usdApprox, { rate: siteConfig.penPerUsd.toFixed(2) })}</p>}
            {Object.values(errors).some(Boolean) && (
              <p className="err" role="alert">
                {c.errorSummary}
              </p>
            )}
            <button className="btn co-pay" type="submit" disabled={processing}>
              {processing ? c.processing : fill(c.pay, { amount: money(totals.total) })}
            </button>
            <Guarantee />
          </aside>
        </form>
      </div>
    </section>
  );
}
