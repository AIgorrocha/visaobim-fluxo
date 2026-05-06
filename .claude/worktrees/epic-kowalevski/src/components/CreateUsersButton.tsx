import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateUsersButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const createUsers = async () => {
    setIsLoading(true);
    try {
      console.log('Chamando função create-users...');
      
      const { data, error } = await supabase.functions.invoke('create-users', {
        body: {}
      });

      if (error) {
        console.error('Erro na função:', error);
        toast({
          title: "Erro",
          description: `Erro ao criar usuários: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Resultado:', data);
      setResults(data);
      
      toast({
        title: "Sucesso!",
        description: `${data.successful} usuários criados com sucesso. ${data.failed} falharam.`,
      });

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: `Erro inesperado: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🚀 Criar Usuários do Sistema</CardTitle>
        <CardDescription>
          Criar todos os usuários (Admins e Projetistas) com as credenciais definidas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={createUsers} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Criando usuários...' : 'Criar Todos os Usuários'}
        </Button>

        {results && (
          <div className="space-y-2">
            <h3 className="font-semibold">Resultados:</h3>
            <p className="text-sm">
              ✅ Criados com sucesso: {results.successful}<br/>
              ❌ Falharam: {results.failed}
            </p>
            
            <details className="text-xs">
              <summary className="cursor-pointer">Ver detalhes</summary>
              <pre className="mt-2 p-2 bg-muted rounded">
                {JSON.stringify(results.results, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>ADMINS:</strong></p>
          <p>• Igor: igor@visaobim.com | admigor@2025</p>
          <p>• Stael: stael@visaobim.com | admstael@2025</p>
          
          <p className="pt-2"><strong>PROJETISTAS:</strong></p>
          <p>• gustavo@visaobim.com | gustavo@2025</p>
          <p>• bessa@visaobim.com | bessa@2025</p>
          <p>• leonardo@visaobim.com | leonardo@2025</p>
          <p>• pedro@visaobim.com | pedro@2025</p>
          <p>• thiago@visaobim.com | thiago@2025</p>
          <p>• nicolas@visaobim.com | nicolas@2025</p>
          <p>• eloisy@visaobim.com | eloisy@2025</p>
          <p>• rondinelly@visaobim.com | rondinelly@2025</p>
          <p>• edilson@visaobim.com | edilson@2025</p>
          <p>• philip@visaobim.com | philip@2025</p>
          <p>• nara@visaobim.com | nara@2025</p>
          <p>• externo@visaobim.com | externo@2025</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateUsersButton;