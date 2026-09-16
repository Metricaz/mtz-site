import { createClient } from 'npm:@supabase/supabase-js@2';

type ContactFormPayload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
  source_page?: string;
  source_context?: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
const contactToEmail = Deno.env.get('CONTACT_TO_EMAIL') ?? 'contato@metricaz.com';
const contactFromEmail = Deno.env.get('CONTACT_FROM_EMAIL') ?? 'Metricaz <onboarding@resend.dev>';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderRow = (label: string, value: string) => `
  <tr>
    <td style="padding: 10px 0; font-weight: 600; color: #191825; width: 140px;">${escapeHtml(label)}</td>
    <td style="padding: 10px 0; color: #2e2c3c;">${escapeHtml(value || '-')}</td>
  </tr>
`;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as ContactFormPayload;
    const name = body.name?.trim() || '';
    const company = body.company?.trim() || '';
    const email = body.email?.trim() || '';
    const phone = body.phone?.trim() || '';
    const message = body.message?.trim() || '';
    const sourcePage = body.source_page?.trim() || '/';
    const sourceContext = body.source_context?.trim() || 'site-contact-form';

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Nome, e-mail e mensagem são obrigatórios.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const submissionPayload = {
      name,
      company: company || null,
      email,
      phone: phone || null,
      message,
      source_page: sourcePage,
      source_context: sourceContext,
      status: 'queued',
      payload: body,
    };

    const { data: submission, error: insertError } = await supabaseAdmin
      .from('s_contact_submissions')
      .insert(submissionPayload)
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    if (!resendApiKey) {
      await supabaseAdmin
        .from('s_contact_submissions')
        .update({ status: 'failed', error_message: 'RESEND_API_KEY ausente', updated_at: new Date().toISOString() })
          .update({ status: 'failed', error_message: 'RESEND_API_KEY ausente', updated_at: new Date().toISOString() })

      return new Response(JSON.stringify({ error: 'Email service is not configured.' }), {
        return new Response(
          JSON.stringify({
            ok: true,
            saved: true,
            delivered: false,
            warning: 'Email service is not configured. The submission was saved to the database.',
            id: submission.id,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #191825;">
          <h2 style="margin-bottom: 16px;">Novo contato pelo site Metricaz</h2>
          <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            ${renderRow('Nome', name)}
            ${renderRow('Empresa', company)}
            ${renderRow('E-mail', email)}
            ${renderRow('Telefone', phone)}
            ${renderRow('Página', sourcePage)}
            ${renderRow('Origem', sourceContext)}
          </table>
          <div style="margin-top: 20px; padding: 16px; border-radius: 12px; background: #f7f4ef;">
            <strong>Mensagem</strong>
            <p style="margin: 10px 0 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
        </div>
      `;

      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: contactFromEmail,
            to: [contactToEmail],
            reply_to: email,
            subject: `Novo contato Metricaz: ${name}`,
            html,
          }),
        });

        const resendResult = await resendResponse.json();

        if (!resendResponse.ok) {
          await supabaseAdmin
            .from('s_contact_submissions')
            .update({
              status: 'failed',
              error_message: resendResult?.message || 'Falha ao enviar email via Resend',
              updated_at: new Date().toISOString(),
            })
            .eq('id', submission.id);

          return new Response(
            JSON.stringify({
              ok: true,
              saved: true,
              delivered: false,
              warning: resendResult?.message || 'Falha ao enviar email via Resend',
              id: submission.id,
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        await supabaseAdmin
          .from('s_contact_submissions')
          .update({
            status: 'sent',
            resend_email_id: resendResult?.id || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', submission.id);

        return new Response(
          JSON.stringify({ ok: true, saved: true, delivered: true, id: submission.id }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (sendError) {
        console.error('contact-form resend error:', sendError);

        await supabaseAdmin
          .from('s_contact_submissions')
          .update({
            status: 'failed',
            error_message: sendError instanceof Error ? sendError.message : 'Erro desconhecido ao enviar email',
            updated_at: new Date().toISOString(),
          })
          .eq('id', submission.id);

        return new Response(
          JSON.stringify({
            ok: true,
            saved: true,
            delivered: false,
            warning: 'The submission was saved, but the email could not be sent.',
            id: submission.id,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
        <h2 style="margin-bottom: 16px;">Novo contato pelo site Metricaz</h2>
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
