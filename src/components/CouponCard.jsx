import BrandLogo from "./BrandLogo";
import { BRAND } from "../config/brand";
import { formatDate } from "../lib/format";
import { COUPON_W, COUPON_H } from "../lib/share";

// Modo Vivo: 60% azul · 25% arena · 15% naranja (solo descuento). Dos badges: descuento y "En vivo".
const C = {
  azul: "#123B64",
  arena: "#F3E4CD",
  apoyo: "#DCE3EB",
  blanco: "#FAF7F0",
  naranja: "#E76100",
};
const CHAMFER = 36;

export default function CouponCard({ coupon }) {
  const {
    code,
    discount_percent: pct,
    applies_to: appliesTo,
    tiktok_profile: tiktok,
    created_at: createdAt,
  } = coupon;

  const codeSize = Math.min(170, Math.floor(820 / (code.length * 0.66)));
  const pctSize = String(pct).length >= 3 ? 190 : 250;
  const appliesSize =
    appliesTo.length > 24 ? 54 : appliesTo.length > 16 ? 62 : 72;

  return (
    <div
      style={{
        width: COUPON_W,
        height: COUPON_H,
        background: C.azul,
        color: C.blanco,
        fontFamily: '"Outfit Variable", Outfit, system-ui, sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Formas derivadas del círculo del isotipo */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          border: "2px solid rgba(220,227,235,0.14)",
          top: -380,
          right: -340,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          border: "2px solid rgba(220,227,235,0.10)",
          bottom: -300,
          left: -300,
        }}
      />

      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 72px",
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <BrandLogo variant="blanco" height={76} />
          <div
            style={{
              background: C.arena,
              color: C.azul,
              borderRadius: "9999px 9999px 9999px 0",
              padding: "14px 32px",
              fontSize: 34,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: C.naranja,
              }}
            />
            {BRAND.liveLabel}
          </div>
        </div>

        {/* Titular */}
        <div style={{ textAlign: "center" }}>
          <div
            className="font-accent"
            style={{
              fontSize: 112,
              lineHeight: 1,
              color: C.arena,
              fontWeight: 700,
            }}
          >
            ¡Es tuyo!
          </div>
          <div
            style={{
              fontSize: 50,
              fontWeight: 500,
              color: C.apoyo,
              marginTop: 6,
            }}
          >
            Tu cupón de descuento
          </div>
        </div>

        {/* Descuento */}
        <div
          style={{
            alignSelf: "center",
            width: 500,
            height: 500,
            borderRadius: "50%",
            border: "6px solid rgba(243,228,205,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 450,
              height: 450,
              borderRadius: "50%",
              background: C.naranja,
              color: C.blanco,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  fontSize: pctSize,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {pct}
              </span>
              <span
                style={{
                  fontSize: pctSize * 0.48,
                  fontWeight: 800,
                  lineHeight: 1,
                  marginTop: pctSize * 0.12,
                  marginLeft: 6,
                }}
              >
                %
              </span>
            </div>
          </div>
        </div>

        {/* A qué aplica */}
        <div
          style={{
            textAlign: "center",
            minHeight: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: appliesSize,
            lineHeight: 1.1,
          }}
        >
          <span>
            <span style={{ fontWeight: 400, color: C.apoyo }}>en </span>
            <span style={{ fontWeight: 700 }}>{appliesTo}</span>
          </span>
        </div>

        {/* Código */}
        <div
          style={{
            background: C.arena,
            color: C.azul,
            padding: "24px 48px 20px",
            clipPath: `polygon(0 0, calc(100% - ${CHAMFER}px) 0, 100% ${CHAMFER}px, 100% calc(100% - ${CHAMFER}px), calc(100% - ${CHAMFER}px) 100%, 0 100%)`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              fontSize: 38,
              gap: 24,
            }}
          >
            <span style={{ fontWeight: 500, opacity: 0.8 }}>Tu código</span>
            {tiktok && (
              <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                para @{tiktok}
              </span>
            )}
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: codeSize,
              fontWeight: 800,
              letterSpacing: "0.02em",
              lineHeight: 1.05,
              whiteSpace: "nowrap",
              marginTop: 4,
            }}
          >
            {code}
          </div>
        </div>

        {/* Pie */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            fontSize: 27,
            color: C.apoyo,
            opacity: 0.9,
          }}
        >
          <span>{BRAND.couponTerms}</span>
          <span style={{ whiteSpace: "nowrap" }}>{formatDate(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
