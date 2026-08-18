import LegalLayout from "@/components/LegalLayout";

export default function DisclaimerPage() {
  return (
    <LegalLayout title="Disclaimer de vehículos AS-IS">
      <p>
        Todos los vehículos ofrecidos a través de subastas a las que DealerPass facilita acceso se venden bajo la
        condición AS-IS (&ldquo;tal como está&rdquo;).
      </p>
      <ul>
        <li>DealerPass no garantiza vehículos específicos ni su disponibilidad.</li>
        <li>DealerPass no garantiza precios finales de adjudicación.</li>
        <li>DealerPass no garantiza ahorro alguno ni ganancias en una reventa.</li>
        <li>Los vehículos pueden presentar daños visibles o no declarados.</li>
        <li>Los reportes de historial o condición se utilizan únicamente como referencia.</li>
        <li>El usuario es responsable de su decisión final de pujar.</li>
        <li>
          La plataforma y el acceso disponible dependen del estado, el plan contratado y las reglas de terceros
          (Copart, IAA, ADESA, Manheim u otras).
        </li>
        <li>Los costos de transporte, reparación, impuestos y fees de subasta pueden estar separados del precio ganador.</li>
        <li>Los casos reales presentados no garantizan resultados similares en operaciones futuras.</li>
      </ul>
      <p>[PENDIENTE DE REVISIÓN LEGAL COMPLETA]</p>
    </LegalLayout>
  );
}
