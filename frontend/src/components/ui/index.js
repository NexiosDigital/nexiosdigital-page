// Arquivo de barrel para exportar todos os componentes
export { default as LoadingSpinner } from "./LoadingSpinner";
export { default as EmptyState } from "./EmptyState";
export { default as Card } from "./Card";
export { default as StatCard } from "./StatCard";
export { default as Badge } from "./Badge";
export { default as Button } from "./Button";
export { default as Modal } from "./Modal";
export { default as Tooltip } from "./Tooltip";
export { default as Progress } from "./Progress";
export { default as Breadcrumb } from "./Breadcrumb";

// Exemplo de uso dos componentes:
/*
import { Card, StatCard, Button, LoadingSpinner, EmptyState } from '../ui';

const MyDashboard = () => {
  return (
    <div className="dashboard">
      <Card title="Estatísticas" subtitle="Resumo mensal">
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            icon="fas fa-users" 
            value="1,234" 
            label="Usuários Ativos"
            trend="positive"
            trendValue="+12%"
          />
          <StatCard 
            icon="fas fa-revenue" 
            value="R$ 45.6k" 
            label="Receita"
            trend="positive"
            trendValue="+8%"
          />
        </div>
      </Card>

      <Card title="Ações">
        <div className="flex gap-2">
          <Button variant="primary">Criar Novo</Button>
          <Button variant="secondary">Exportar</Button>
        </div>
      </Card>

      <Card>
        <EmptyState 
          icon="fas fa-robot"
          title="Nenhuma automação encontrada"
          description="Crie sua primeira automação para começar"
          action={<Button variant="primary">Criar Automação</Button>}
        />
      </Card>
    </div>
  );
};
*/
