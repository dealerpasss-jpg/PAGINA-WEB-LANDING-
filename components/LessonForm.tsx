export default function LessonForm({
  lesson,
}: {
  lesson?: {
    id: string;
    title: string;
    module_title: string;
    position: number;
    body: string;
    asset_path: string;
    allowed_plans: string[];
    published: boolean;
  };
}) {
  return (
    <form method="post" action="/api/team" className="account-form">
      <input type="hidden" name="action" value="lesson" />
      <input type="hidden" name="return_to" value="classes" />
      <input type="hidden" name="id" value={lesson?.id || ""} />
      <label>
        Módulo
        <input
          name="module_title"
          maxLength={160}
          required
          defaultValue={lesson?.module_title}
        />
      </label>
      <label>
        Título de la clase
        <input
          name="title"
          maxLength={160}
          required
          defaultValue={lesson?.title}
        />
      </label>
      <label>
        Orden
        <input
          name="position"
          type="number"
          min={0}
          max={10000}
          defaultValue={lesson?.position || 0}
        />
      </label>
      <label>
        Contenido
        <textarea name="body" maxLength={50000} defaultValue={lesson?.body} />
      </label>
      <label>
        Ruta del video o material privado
        <input
          name="asset_path"
          placeholder="modulo-1/clase-1.mp4"
          maxLength={500}
          defaultValue={lesson?.asset_path || ""}
        />
        <small>
          Sube primero el archivo al depósito privado academy-private en
          Supabase.
        </small>
      </label>
      <fieldset>
        <legend>Planes con acceso</legend>
        {["starter", "academy", "pro", "elite"].map((p) => (
          <label className="account-check" key={p}>
            <input
              type="checkbox"
              name="allowed_plans"
              value={p}
              defaultChecked={lesson?.allowed_plans.includes(p)}
            />
            {p}
          </label>
        ))}
      </fieldset>
      <label className="account-check">
        <input
          type="checkbox"
          name="published"
          value="yes"
          defaultChecked={lesson?.published}
        />
        Publicar clase
      </label>
      <p><small>Al desmarcar «Publicar clase», el contenido vuelve a borrador y deja de estar disponible para estudiantes. Los cambios en una clase publicada se aplican al guardar.</small></p>
      <button className="btn-primary">
        {lesson ? "Guardar cambios" : "Crear clase"}
      </button>
    </form>
  );
}
