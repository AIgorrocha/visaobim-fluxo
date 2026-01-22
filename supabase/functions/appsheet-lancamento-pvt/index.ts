import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento de contratos PRIVADO
const CONTRACT_MAPPING: { [key: string]: string | null } = {
  'GERAL': null,
  // Projetos privados ativos
  'BRENO-CASA': '03990012-9e4a-443d-97a6-7dc0ad5bf269',
  'BRENO': '03990012-9e4a-443d-97a6-7dc0ad5bf269',
  'CASA PABLO': 'f2da7595-7d89-4235-8f5d-1160560356ca',
  'PABLO': 'f2da7595-7d89-4235-8f5d-1160560356ca',
  'FENIX-COWORKING': 'd40b2c51-8713-4566-ae13-87c02497f908',
  'FENIX': 'd40b2c51-8713-4566-ae13-87c02497f908',
  'IRIS-REFORCO EST': '7638c70a-7a2b-4608-b7b0-b198edb584dd',
  'IRIS-REFORCO': '7638c70a-7a2b-4608-b7b0-b198edb584dd',
  'IRIS': '7638c70a-7a2b-4608-b7b0-b198edb584dd',
  'PORTAL DA ALEGRIA': 'b940baaf-1bab-481d-925a-98d2479bf334',
  'CARVALHO-PORTAL DA ALEGRIA': 'b940baaf-1bab-481d-925a-98d2479bf334',
  'CARVALHO-PORTAL': 'b940baaf-1bab-481d-925a-98d2479bf334',
  'SERVFAZ-AGROPARQUE': '7cceaad6-63f5-4662-a932-ae3400d6bb35',
  'SERVFAZ': '7cceaad6-63f5-4662-a932-ae3400d6bb35',
  'AGROPARQUE': '7cceaad6-63f5-4662-a932-ae3400d6bb35',
  'TALISMA-ESCOLA': 'cf93d712-1113-4723-8c76-5fe9c28b5f2c',
  'TALISMA': 'cf93d712-1113-4723-8c76-5fe9c28b5f2c',
  'TALISMÃ': 'cf93d712-1113-4723-8c76-5fe9c28b5f2c',
  'THALES-CLEBER&IGOR': 'b33bcd77-e2b5-4259-ad22-799fa193e0c6',
  'CLEBER&IGOR': 'b33bcd77-e2b5-4259-ad22-799fa193e0c6',
  'THALES-GILVANDO&CARINE': '313fb989-27c2-4518-89e6-f013960bba4f',
  'GILVANDO&CARINE': '313fb989-27c2-4518-89e6-f013960bba4f',
  // Aliases adicionais (serão atualizados com IDs reais)
  'THALES-ROSANETE&ESEQUIAS': null, // Precisa buscar ID
  'THALES-LAIS&SAROM': null, // Precisa buscar ID
  'NORBERTO-SALAS COMERCIAIS': null, // Precisa buscar ID
  'NORBERTO': null,
  'ZOOBOTANICO-PARQUE AQUATICO': null, // Precisa buscar ID
  'ZOOBOTANICO': null,
  'ADENILSON-PREDIO COMERCIAL': null, // Precisa buscar ID
  'ADENILSON': null,
  'ANDRE LOSS-ORCAMENTO': null, // Precisa buscar ID
  'ANDRE LOSS': null,
};

// Mapeamento de projetistas (nome -> designer_id) - mesmo do setor público
const DESIGNER_MAPPING: { [key: string]: string } = {
  'NARA': 'b639705e-c87a-4e3d-bee2-d564e4dc5a9c',
  'GUSTAVO': '7526fbed-99da-4d87-b647-422f278e961b',
  'PEDRO/LUCAS': '7b13b7de-68df-4dde-9263-0e2a72d481b0',
  'PEDRO': '7b13b7de-68df-4dde-9263-0e2a72d481b0',
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
  'PROJETISTA EXTERNO': '4c3ce88b-abf9-45cd-a919-954bea79aa0c',
};

const FALLBACK_DESIGNER_ID = '4c3ce88b-abf9-45cd-a919-954bea79aa0c'; // PROJETISTA EXTERNO

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  // Formato: DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
}

function parseAmount(valueStr: string): number {
  if (!valueStr) return 0;
  // Remove "R$", espaços, pontos de milhar e converte vírgula para ponto
  const cleaned = valueStr
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log('📥 Payload recebido (PRIVADO):', JSON.stringify(payload));

    const {
      ID_Lancamento,
      Datas,
      Tipo,
      Valor,
      Descricao,
      Contrato,
      Centro_de_Custo,
      Responsavel, // Quem registrou (IGOR/STAEL)
      Projetista,  // Nome do projetista
      Disciplina
    } = payload;

    const parsedDate = parseDate(Datas);
    const parsedAmount = parseAmount(Valor);
    const projectId = findProjectId(Contrato);
    const designerId = findDesignerId(Projetista);
    const tipoUpper = (Tipo || '').toUpperCase().trim();
    const centroCustoUpper = (Centro_de_Custo || '').toUpperCase().trim();

    console.log(`🔍 Processando (PRIVADO): Tipo=${tipoUpper}, CentroCusto=${centroCustoUpper}, Contrato=${Contrato}, Projetista=${Projetista}`);
    console.log(`🔍 Mapeamento: projectId=${projectId}, designerId=${designerId}`);

    let result;

    // DESPESA + PROJETISTA = Pagamento a projetista
    if (tipoUpper === 'DESPESA' && centroCustoUpper === 'PROJETISTA') {
      console.log('💰 Inserindo pagamento de projetista (PRIVADO)...');
      
      // Buscar precificação existente para vincular automaticamente
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
          // Prioriza precificação com disciplina igual ou similar
          const disciplineUpper = (Disciplina || '').toUpperCase().trim();
          pricingRecord = pricings.find((p: any) => {
            const pricingDisc = (p.discipline_name || '').toUpperCase();
            return pricingDisc.includes(disciplineUpper) || disciplineUpper.includes(pricingDisc);
          }) || pricings[0];
          
          pricingId = pricingRecord.id;
          console.log(`🔗 Precificação encontrada: ${pricingId} (${pricingRecord.discipline_name})`);
        } else {
          console.log('⚠️ Nenhuma precificação encontrada para vincular');
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
          sector: 'privado', // <-- DIFERENÇA DO PÚBLICO
          status: 'pago',
          pricing_id: pricingId
        })
        .select()
        .single();

      if (error) throw error;
      result = { type: 'designer_payment', data, pricing_linked: !!pricingId };
      console.log('✅ Pagamento de projetista inserido (PRIVADO):', data.id);
      
      // Atualizar amount_paid na precificação após inserir pagamento
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
          console.error('⚠️ Erro ao atualizar precificação:', updateError);
        } else {
          console.log(`📊 Precificação atualizada: amount_paid=${newAmountPaid.toFixed(2)}, status=${newStatus}`);
        }
      }
    }
    // RECEITA + PAGAMENTO ou MEDICAO = Receita do contrato
    else if (tipoUpper === 'RECEITA' && (centroCustoUpper === 'PAGAMENTO' || centroCustoUpper === 'MEDICAO')) {
      console.log('💵 Inserindo receita do contrato (PRIVADO)...');
      
      const incomeType = centroCustoUpper === 'MEDICAO' ? 'medicao' : 'entrada';
      
      const { data, error } = await supabase
        .from('contract_income')
        .insert({
          project_id: projectId,
          amount: parsedAmount,
          income_date: parsedDate,
          description: Descricao || ID_Lancamento,
          income_type: incomeType
        })
        .select()
        .single();

      if (error) throw error;
      result = { type: 'contract_income', data };
      console.log('✅ Receita do contrato inserida (PRIVADO):', data.id);
    }
    // DESPESA + Outros centros de custo = Despesa da empresa
    else if (tipoUpper === 'DESPESA') {
      console.log('📊 Inserindo despesa da empresa (PRIVADO)...');
      
      const { data, error } = await supabase
        .from('company_expenses')
        .insert({
          project_id: projectId,
          contract_name: Contrato || 'GERAL',
          description: Descricao || ID_Lancamento,
          amount: parsedAmount,
          expense_date: parsedDate,
          cost_center: Centro_de_Custo || 'OUTROS',
          sector: 'privado', // <-- DIFERENÇA DO PÚBLICO
          responsible: Responsavel
        })
        .select()
        .single();

      if (error) throw error;
      result = { type: 'company_expense', data };
      console.log('✅ Despesa da empresa inserida (PRIVADO):', data.id);
    }
    else {
      console.log('⚠️ Tipo de lançamento não reconhecido:', tipoUpper);
      result = { type: 'unknown', message: 'Tipo de lançamento não reconhecido' };
    }

    // Se contrato não foi encontrado, registrar para revisão manual
    if (projectId === null && Contrato && Contrato !== 'GERAL') {
      console.log('⚠️ Contrato não mapeado (PRIVADO):', Contrato);
      
      await supabase
        .from('unmatched_entries')
        .insert({
          entry_id: result.data?.id || ID_Lancamento,
          source_table: result.type || 'unknown',
          field_type: 'contract',
          original_value: Contrato,
          sector: 'privado', // <-- DIFERENÇA DO PÚBLICO
          status: 'pending'
        });
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao processar webhook (PRIVADO):', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
