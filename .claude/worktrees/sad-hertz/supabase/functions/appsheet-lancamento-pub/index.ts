import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento de contratos PUBLICO
const CONTRACT_MAPPING: { [key: string]: string | null } = {
  'GERAL': null,
  'DRF-PV': 'f9ef85e6-a442-4b35-bb82-004cbe331fa4',
  'TRE-AC': '01c53ae7-2236-4fa0-b63f-27137a05189c',
  'LACEN': 'e5a473bc-1ba6-4e37-a451-78f871e348d7',
  'LACEN-AC': 'e5a473bc-1ba6-4e37-a451-78f871e348d7',
  'GINASIOS': '2196fb07-7126-4793-8240-a57d7a5fed15',
  'GINASIOS-AC': '2196fb07-7126-4793-8240-a57d7a5fed15',
  'SOP-GINASIOS': '2196fb07-7126-4793-8240-a57d7a5fed15',
  'GINASIOS-SOP': '2196fb07-7126-4793-8240-a57d7a5fed15',
  'HTR': '3142ffab-1005-4710-9fb0-e838ba069e97',
  'FES-HTR': '3142ffab-1005-4710-9fb0-e838ba069e97',
  'PRODESP': '65598f7a-0883-4cc5-89e0-ff3efeaba35c',
  'PRODESP PAISAGISMO': 'a37cd798-df75-4152-96eb-3a0ccb6cb328',
  'CELESC-TUBARAO': 'bbf35b14-5047-4ea5-ad21-d9e9733a5040',
  'CELESC_TUBARAO': 'bbf35b14-5047-4ea5-ad21-d9e9733a5040',
  'CELESC-EST CENTRAL': 'a602e340-23e8-4b2d-bf4e-d06c26f9dc3c',
  'CELESC-ESTUDO': 'a602e340-23e8-4b2d-bf4e-d06c26f9dc3c',
  'CELESC-RS': 'bbf35b14-5047-4ea5-ad21-d9e9733a5040',
  'SPRF-AL': '60a49d27-05d9-4e60-aa18-accffc94cca1',
  'SPF-RO': '04e09afb-8b45-4ab8-b6ff-8e57dd0ed0b5',
  'UNESPAR-ELE': 'ae4caf7d-730c-4d22-991d-0a255bfeb695',
  'UNESPAR - ESTRUTURA METALICA': '9de6e94a-bce4-4ab5-9923-1081d0a9eba1',
  // Projetos finalizados
  'IBC-RJ': '46195969-2413-4782-8753-0002fd633655',
  'IBC': '46195969-2413-4782-8753-0002fd633655',
  'CIAP-SP': '0083d03a-01f4-4d35-bb8e-e8501a17109e',
  'CIAP': '0083d03a-01f4-4d35-bb8e-e8501a17109e',
  'CMB-SP': null,
  'ZOOTECNIA-USP': '91a2dfd8-d0e1-4bb0-8b0d-f9d43ac0d3a3',
  'ZOOTECNIA': '91a2dfd8-d0e1-4bb0-8b0d-f9d43ac0d3a3',
  'UNESPAR-EST.MET': '9de6e94a-bce4-4ab5-9923-1081d0a9eba1',
  'UNESPAR-EST': '9de6e94a-bce4-4ab5-9923-1081d0a9eba1',
  'LORENA-SP': '67c376a8-f269-4529-8cc0-26d99cd7bd28',
  'LORENA': '67c376a8-f269-4529-8cc0-26d99cd7bd28',
  // Outros aliases
  'FHEMIG-BH': '8f05c236-6a68-4326-84d3-bfed1e62c3dd',
  'FHEMIG': '8f05c236-6a68-4326-84d3-bfed1e62c3dd',
  'SANTA MARIA-RS': '5d68fb6e-1e5f-4d3d-9fd6-e5bcef8c3ca6',
  'SANTA MARIA': '5d68fb6e-1e5f-4d3d-9fd6-e5bcef8c3ca6',
  'SEPOL-RJ': 'db9e101e-2460-4d0f-9483-4537ba16fb63',
  'SEPOL': 'db9e101e-2460-4d0f-9483-4537ba16fb63',
  'CIDPOL': 'db9e101e-2460-4d0f-9483-4537ba16fb63',
  'IRIS-REFORCO': '7638c70a-7a2b-4608-b7b0-b198edb584dd',
  'BRENO-CASA': '03990012-9e4a-443d-97a6-7dc0ad5bf269',
  'BRENO': '03990012-9e4a-443d-97a6-7dc0ad5bf269',
  // REFORCO COLEGIO - SOP (aliases)
  'SOP-REFORCO': '80deac2b-928f-4177-ab77-984d76944b06',
  'REFORCO COLEGIO': '80deac2b-928f-4177-ab77-984d76944b06',
  'REFORCO COLEGIO - SOP': '80deac2b-928f-4177-ab77-984d76944b06',
};

// Mapeamento de projetistas (nome -> designer_id)
const DESIGNER_MAPPING: { [key: string]: string } = {
  'NARA': 'b639705e-c87a-4e3d-bee2-d564e4dc5a9c',
  'GUSTAVO': '7526fbed-99da-4d87-b647-422f278e961b',
  'PEDRO/LUCAS': '7b13b7de-68df-4dde-9263-0e2a72d481b0',
  'PEDRO': '7b13b7de-68df-4dde-9263-0e2a72d481b0',
  'PEDRO/LUCAS ': '7b13b7de-68df-4dde-9263-0e2a72d481b0',
  'LUCAS': '7b13b7de-68df-4dde-9263-0e2a72d481b0',
  'LEONARDO': '5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91',
  'RONDINELLY': '905fde13-5c9f-49be-b76a-f76e4ffd124d',
  'THIAGO': '994df657-b61d-4b1e-8a59-416051fd5e99',
  'ELOISY': '6b1b146d-dc85-4030-9558-52b24c1106cb',
  'EDILSON': 'cc32897a-a98d-4319-90c8-15fb63a55665',
  'FERNANDO': '99d8b596-7c2b-44a2-8c08-dfd5ccf9b03f',
  'FABIO': 'e8f3173e-3eb0-4975-81f8-398ca5f593b9',
  'FELIPE MATHEUS': '60a9b85e-a7ec-401a-a04a-5cf6eaec508c',
  'SALOMAO': '719d76a2-b7e8-4b77-877c-81d8e3256a58',
  'ARTHUR': 'b56c5808-5e03-473e-9499-9db5c4fbf428',
  'IGOR': 'cf3a3c2b-8729-405c-9057-8d91fa63ee18',
  'NICOLAS': '0510e615-438d-400e-886c-fed07c997dc9',
  'BESSA': 'c96e4c49-6b7b-4d89-b56d-f8779271d6e0',
  'PHILIP': '6fefce39-d90a-4c2a-abf9-80867ac60772',
  'LISBOA': 'd90fcfdb-4a4f-41af-817c-6e9cd38c2478',
  'PROJETISTA EXTERNO': '4c3ce88b-abf9-45cd-a919-954bea79aa0c',
  'EMPRESA': '4c3ce88b-abf9-45cd-a919-954bea79aa0c',
};

const FALLBACK_DESIGNER_ID = '4c3ce88b-abf9-45cd-a919-954bea79aa0c'; // PROJETISTA EXTERNO

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
}

function parseAmount(valueStr: string): number {
  if (!valueStr) return 0;
  let cleaned = valueStr.replace(/R\$\s?/g, '').trim();
  // Detecta formato BR (virgula como decimal) vs internacional (ponto como decimal)
  if (cleaned.includes(',')) {
    // Formato BR: 1.200,50 -> remove pontos de milhar, troca virgula por ponto
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }
  // Se nao tem virgula, assume que ponto e decimal (formato internacional)
  return parseFloat(cleaned) || 0;
}

function findDesignerId(name: string): string {
  if (!name) return FALLBACK_DESIGNER_ID;
  const upperName = name.toUpperCase().trim();
  return DESIGNER_MAPPING[upperName] || FALLBACK_DESIGNER_ID;
}

function findProjectId(contractName: string): string | null {
  if (!contractName) return null;
  const upperName = contractName.toUpperCase().trim();

  // Tenta match exato
  if (upperName in CONTRACT_MAPPING) {
    return CONTRACT_MAPPING[upperName];
  }

  // Tenta match parcial
  for (const [key, value] of Object.entries(CONTRACT_MAPPING)) {
    if (upperName.includes(key) || key.includes(upperName)) {
      return value;
    }
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log('Payload recebido (PUBLICO):', JSON.stringify(payload));

    const {
      ID_Lancamento,
      Datas,
      Tipo,
      Valor,
      Descricao,
      Contrato,
      Centro_de_Custo,
      Responsavel,
      Projetista,
      Disciplina
    } = payload;

    // FIX: Usar Projetista com fallback para Responsavel
    const nomeProjetista = Projetista || Responsavel;
    const appsheetId = ID_Lancamento ? String(ID_Lancamento) : null;

    const parsedDate = parseDate(Datas);
    const parsedAmount = parseAmount(Valor);
    const projectId = findProjectId(Contrato);
    const designerId = findDesignerId(nomeProjetista);
    const tipoUpper = (Tipo || '').toUpperCase().trim();
    const centroCustoUpper = (Centro_de_Custo || '').toUpperCase().trim();

    console.log(`Processando (PUBLICO): Tipo=${tipoUpper}, CentroCusto=${centroCustoUpper}, Contrato=${Contrato}, Projetista=${nomeProjetista}, AppSheetID=${appsheetId}`);
    console.log(`Mapeamento: projectId=${projectId}, designerId=${designerId}`);

    // PROTECAO ANTI-DUPLICATA: verificar se appsheet_id ja existe
    if (appsheetId) {
      const { data: existingPayment } = await supabase
        .from('designer_payments')
        .select('id')
        .eq('appsheet_id', appsheetId)
        .maybeSingle();

      if (existingPayment) {
        console.log(`DUPLICATA DETECTADA: appsheet_id ${appsheetId} ja existe em designer_payments (${existingPayment.id})`);
        return new Response(
          JSON.stringify({ success: true, duplicate: true, existing_id: existingPayment.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: existingIncome } = await supabase
        .from('contract_income')
        .select('id')
        .eq('appsheet_id', appsheetId)
        .maybeSingle();

      if (existingIncome) {
        console.log(`DUPLICATA DETECTADA: appsheet_id ${appsheetId} ja existe em contract_income (${existingIncome.id})`);
        return new Response(
          JSON.stringify({ success: true, duplicate: true, existing_id: existingIncome.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: existingExpense } = await supabase
        .from('company_expenses')
        .select('id')
        .eq('appsheet_id', appsheetId)
        .maybeSingle();

      if (existingExpense) {
        console.log(`DUPLICATA DETECTADA: appsheet_id ${appsheetId} ja existe em company_expenses (${existingExpense.id})`);
        return new Response(
          JSON.stringify({ success: true, duplicate: true, existing_id: existingExpense.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    let result;

    // DESPESA + PROJETISTA = Pagamento a projetista
    if (tipoUpper === 'DESPESA' && centroCustoUpper === 'PROJETISTA') {
      console.log('Inserindo pagamento de projetista (PUBLICO)...');

      let pricingId: string | null = null;
      let pricingRecord: { id: string; discipline_name: string; designer_value: number; amount_paid: number } | null = null;

      if (projectId && designerId) {
        const { data: pricings } = await supabase
          .from('project_pricing')
          .select('id, discipline_name, designer_value, amount_paid')
          .eq('project_id', projectId)
          .eq('designer_id', designerId)
          .order('created_at', { ascending: true });

        if (pricings && pricings.length > 0) {
          const disciplineUpper = (Disciplina || '').toUpperCase().trim();
          pricingRecord = pricings.find((p: any) => {
            const pricingDisc = (p.discipline_name || '').toUpperCase();
            return pricingDisc.includes(disciplineUpper) || disciplineUpper.includes(pricingDisc);
          }) || pricings[0];

          pricingId = pricingRecord.id;
          console.log(`Precificacao encontrada: ${pricingId} (${pricingRecord.discipline_name})`);
        }
      }

      const { data, error } = await supabase
        .from('designer_payments')
        .insert({
          project_id: projectId,
          project_name: Contrato,
          designer_id: designerId,
          discipline: Disciplina || 'GERAL',
          amount: parsedAmount,
          payment_date: parsedDate,
          description: Descricao || ID_Lancamento,
          sector: 'publico',
          status: 'pago',
          pricing_id: pricingId,
          appsheet_id: appsheetId
        })
        .select()
        .single();

      if (error) throw error;
      result = { type: 'designer_payment', data, pricing_linked: !!pricingId };
      console.log('Pagamento de projetista inserido (PUBLICO):', data.id);

      if (pricingId && pricingRecord) {
        const newAmountPaid = (pricingRecord.amount_paid || 0) + parsedAmount;
        const newStatus = newAmountPaid >= pricingRecord.designer_value ? 'pago' : 'parcial';

        const { error: updateError } = await supabase
          .from('project_pricing')
          .update({
            amount_paid: Math.min(newAmountPaid, pricingRecord.designer_value),
            status: newStatus
          })
          .eq('id', pricingId);

        if (updateError) {
          console.error('Erro ao atualizar precificacao:', updateError);
        } else {
          console.log(`Precificacao atualizada: amount_paid=${newAmountPaid.toFixed(2)}, status=${newStatus}`);
        }
      }
    }
    // RECEITA + PAGAMENTO ou MEDICAO = Receita do contrato
    else if (tipoUpper === 'RECEITA' && (centroCustoUpper === 'PAGAMENTO' || centroCustoUpper === 'MEDICAO')) {
      console.log('Inserindo receita do contrato (PUBLICO)...');

      const incomeType = centroCustoUpper === 'MEDICAO' ? 'medicao' : 'entrada';

      const { data, error } = await supabase
        .from('contract_income')
        .insert({
          project_id: projectId,
          amount: parsedAmount,
          income_date: parsedDate,
          description: Descricao || ID_Lancamento,
          income_type: incomeType,
          appsheet_id: appsheetId
        })
        .select()
        .single();

      if (error) throw error;
      result = { type: 'contract_income', data };
      console.log('Receita do contrato inserida (PUBLICO):', data.id);
    }
    // DESPESA + Outros centros de custo = Despesa da empresa
    else if (tipoUpper === 'DESPESA') {
      console.log('Inserindo despesa da empresa (PUBLICO)...');

      const { data, error } = await supabase
        .from('company_expenses')
        .insert({
          project_id: projectId,
          contract_name: Contrato || 'GERAL',
          description: Descricao || ID_Lancamento,
          amount: parsedAmount,
          expense_date: parsedDate,
          cost_center: Centro_de_Custo || 'OUTROS',
          sector: 'publico',
          responsible: Responsavel,
          appsheet_id: appsheetId
        })
        .select()
        .single();

      if (error) throw error;
      result = { type: 'company_expense', data };
      console.log('Despesa da empresa inserida (PUBLICO):', data.id);
    }
    else {
      console.log('Tipo de lancamento nao reconhecido:', tipoUpper);
      result = { type: 'unknown', message: 'Tipo de lancamento nao reconhecido' };
    }

    if (projectId === null && Contrato && Contrato !== 'GERAL') {
      console.log('Contrato nao mapeado (PUBLICO):', Contrato);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao processar webhook (PUBLICO):', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
