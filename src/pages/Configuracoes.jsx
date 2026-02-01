import { useState } from 'react';
import { Settings, Bell, Shield, Database, Mail, Palette, Globe, Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardBody, StatCard } from '../components/Card';

export default function Configuracoes() {
  const [config, setConfig] = useState({
    // Dados da empresa
    nomeEmpresa: 'Consultoria Contábil Ltda',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Flores, 123 - Centro',
    telefone: '(11) 99999-9999',
    email: 'contato@consultoria.com.br',
    
    // Configurações sistema
    moeda: 'BRL',
    timezone: 'America/Sao_Paulo',
    formatoData: 'dd/MM/yyyy',
    casasDecimais: 2,
    
    // Alertas
    alertasAtivos: true,
    alertaEmail: true,
    alertaDesktop: false,
    alertaLimiteReceita: 80, // % do limite para alertar
    
    // Backup
    backupAutomatico: true,
    frequenciaBackup: 'diario',
    manterBackups: 30,
    
    // Aparência
    tema: 'dark',
    corPrimaria: '#10b981',
    logoEmpresa: null,
    
    // Integrações
    receitaFederalAPI: false,
    emailSMTP: false,
    whatsappAPI: false,
    
    // Segurança
    autenticacao2FA: false,
    sessaoExpira: 480, // minutos
    logAuditoria: true
  });

  const [alertas] = useState([
    {
      id: 1,
      tipo: 'info',
      titulo: 'Atualização Disponível',
      descricao: 'Nova versão do sistema com melhorias na performance',
      data: '2026-02-01',
      ativo: true
    },
    {
      id: 2,
      tipo: 'warning',
      titulo: 'Backup Pendente',
      descricao: 'Último backup foi há 3 dias. Recomendamos backup imediato.',
      data: '2026-01-30',
      ativo: true
    },
    {
      id: 3,
      tipo: 'error',
      titulo: 'Limite do Simples Nacional',
      descricao: 'Cliente João Silva está próximo do limite (R$ 4.2M de R$ 4.8M)',
      data: '2026-01-29',
      ativo: true
    },
    {
      id: 4,
      tipo: 'success',
      titulo: 'Configuração Salva',
      descricao: 'Suas preferências foram atualizadas com sucesso',
      data: '2026-01-28',
      ativo: false
    }
  ]);

  const getAlertaIcon = (tipo) => {
    switch (tipo) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getAlertaColor = (tipo) => {
    switch (tipo) {
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'warning': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'success': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const salvarConfiguracoes = () => {
    alert('Configurações salvas com sucesso!');
  };

  const exportarDados = () => {
    alert('Exportação iniciada! Você receberá um email quando estiver pronto.');
  };

  const importarDados = () => {
    alert('Funcionalidade de importação em desenvolvimento');
  };

  const resetarSistema = () => {
    if (window.confirm('Tem certeza? Esta ação irá resetar todas as configurações para o padrão.')) {
      alert('Sistema resetado com sucesso!');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
          <Settings size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Configurações</h1>
          <p className="text-dark-400">Personalize o sistema conforme suas necessidades</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={AlertTriangle}
          label="Alertas Ativos"
          value="3"
          subvalue="Requerem atenção"
          color="red"
        />
        <StatCard
          icon={Shield}
          label="Segurança"
          value="85%"
          subvalue="Score de segurança"
          color="green"
        />
        <StatCard
          icon={Database}
          label="Dados"
          value="2.3 GB"
          subvalue="Espaço utilizado"
          color="blue"
        />
        <StatCard
          icon={Zap}
          label="Performance"
          value="98%"
          subvalue="Sistema otimizado"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Configurações Principais */}
        <div className="xl:col-span-2 space-y-6">
          {/* Dados da Empresa */}
          <Card>
            <div className="px-6 py-4 border-b border-dark-700/30">
              <h2 className="font-semibold text-white">Dados da Empresa</h2>
            </div>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={config.nomeEmpresa}
                  onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={config.cnpj}
                  onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={config.endereco}
                  onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  value={config.telefone}
                  onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                />
              </div>
            </CardBody>
          </Card>

          {/* Configurações do Sistema */}
          <Card>
            <div className="px-6 py-4 border-b border-dark-700/30">
              <h2 className="font-semibold text-white">Configurações do Sistema</h2>
            </div>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Tema
                </label>
                <select
                  value={config.tema}
                  onChange={(e) => setConfig({ ...config, tema: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                >
                  <option value="dark">Escuro</option>
                  <option value="light">Claro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Fuso Horário
                </label>
                <select
                  value={config.timezone}
                  onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                >
                  <option value="America/Sao_Paulo">Brasília (UTC-3)</option>
                  <option value="America/Manaus">Manaus (UTC-4)</option>
                  <option value="America/Rio_Branco">Acre (UTC-5)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Formato de Data
                </label>
                <select
                  value={config.formatoData}
                  onChange={(e) => setConfig({ ...config, formatoData: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                >
                  <option value="dd/MM/yyyy">DD/MM/AAAA</option>
                  <option value="MM/dd/yyyy">MM/DD/AAAA</option>
                  <option value="yyyy-MM-dd">AAAA-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Casas Decimais
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={config.casasDecimais}
                  onChange={(e) => setConfig({ ...config, casasDecimais: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                />
              </div>
            </CardBody>
          </Card>

          {/* Integrações */}
          <Card>
            <div className="px-6 py-4 border-b border-dark-700/30">
              <h2 className="font-semibold text-white">Integrações</h2>
              <p className="text-dark-400 text-sm">Configure integrações com serviços externos</p>
            </div>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">API Receita Federal</h3>
                  <p className="text-dark-400 text-sm">Consulta automática de dados tributários</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.receitaFederalAPI}
                    onChange={(e) => setConfig({ ...config, receitaFederalAPI: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Email SMTP</h3>
                  <p className="text-dark-400 text-sm">Envio automático de relatórios por email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.emailSMTP}
                    onChange={(e) => setConfig({ ...config, emailSMTP: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">WhatsApp Business API</h3>
                  <p className="text-dark-400 text-sm">Envio de propostas via WhatsApp</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.whatsappAPI}
                    onChange={(e) => setConfig({ ...config, whatsappAPI: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Alertas e Backup */}
        <div className="space-y-6">
          {/* Alertas */}
          <Card>
            <div className="px-6 py-4 border-b border-dark-700/30">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Bell size={16} />
                Alertas Ativos
              </h2>
            </div>
            <div className="divide-y divide-dark-700/20">
              {alertas.filter(a => a.ativo).map((alerta) => {
                const Icon = getAlertaIcon(alerta.tipo);
                return (
                  <div key={alerta.id} className="p-4">
                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${getAlertaColor(alerta.tipo)}`}>
                      <Icon size={16} className="flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{alerta.titulo}</h4>
                        <p className="text-sm opacity-80">{alerta.descricao}</p>
                        <p className="text-xs opacity-60 mt-2">
                          {new Date(alerta.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Configurações de Backup */}
          <Card>
            <div className="px-6 py-4 border-b border-dark-700/30">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Database size={16} />
                Backup e Segurança
              </h2>
            </div>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Backup Automático</h3>
                  <p className="text-dark-400 text-sm">Backup diário dos dados</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.backupAutomatico}
                    onChange={(e) => setConfig({ ...config, backupAutomatico: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Frequência do Backup
                </label>
                <select
                  value={config.frequenciaBackup}
                  onChange={(e) => setConfig({ ...config, frequenciaBackup: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                >
                  <option value="diario">Diário</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={exportarDados}
                  className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  Exportar Dados
                </button>
                <button
                  onClick={importarDados}
                  className="w-full px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  Importar Dados
                </button>
              </div>
            </CardBody>
          </Card>

          {/* Ações */}
          <Card>
            <div className="px-6 py-4 border-b border-dark-700/30">
              <h2 className="font-semibold text-white">Ações do Sistema</h2>
            </div>
            <CardBody className="space-y-3">
              <button
                onClick={salvarConfiguracoes}
                className="w-full px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                Salvar Configurações
              </button>
              
              <button
                onClick={resetarSistema}
                className="w-full px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Resetar Sistema
              </button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}