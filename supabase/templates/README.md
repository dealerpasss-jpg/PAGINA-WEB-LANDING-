# Recovery email

Install `recovery.html` in the hosted Supabase project's Authentication → Emails → Reset password template.
Subject: `Restablece tu contraseña | DealerPass`.
This file is prepared source; committing it does not update hosted Auth settings.
Keep the `{{ .ConfirmationURL }}` variable. The application sets the callback destination to `/auth/nueva-contrasena`.
Ensure the existing production `/auth/callback` URL pattern remains allowed in Auth URL Configuration.
Sender display name: DealerPass. Configure a verified business sender and custom SMTP before claiming branded delivery is active. Do not put SMTP credentials in this repository.
