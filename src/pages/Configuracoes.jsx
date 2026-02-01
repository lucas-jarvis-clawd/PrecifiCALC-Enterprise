import { useState } from 'react';
import { Settings, Bell, Shield, Database, Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';

export default function Configuracoes() {
  const [config, setConfig] = useState({
    nomeEmpresa: 'Consultoria Contabil Ltda',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Flores, 123 - Centro',
    telefone: '(11) 99999-9999',
    email: 'contato@consultoria.com.br',
    moeda: 'BRL',
    timezone: 'America/Sao_Paulo',
    formatoData: 'dd/MM/yyyy',
    casasDecimais: 2,
    alertasAtivos: true,
    alertaEmail: true,
    backupAutomatico: true,
    frequenciaBackup: 'diario',
    tema: 'dark',
    receitaFederalAPI: false,
    emailSMTP: false,
    whatsappAPI: false,
    autenticacao2FA: false,
    sessaoExpira: 480,
    logAuditoria: true,
  });

  const [alertas] = useState([
    { id: 1, tipo: 'info', titulo: 'Atualizacao Disponivel', descricao: 'Nova versao do sistema com melhorias na performance', data: '2026-02-01', ativo: true },
    { id: 2, tipo: 'warning', titulo: 'Backup Pendente', descricao: 'Ultimo backup foi ha 3 dias. Recomendamos backup imediato.', data: '2026-01-30', ativo: true },
    { id: 3, tipo: 'error', titulo: 'Limite do Simples Nacional', descricao: 'Cliente Joao Silva esta proximo do limite (R$ 4.2M de R$ 4.8M)', data: '2026-01-29', ativo: true },
    { id: 4, tipo: 'success', titulo: 'Configuracao Salva', descricao: 'Suas preferencias foram atualizadas com sucesso', data: '2026-01-28', ativo: false },
  ]);

  const getAlertaIcon = (tipo) => {
    switch (tipo) {
      case 'error': case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getAlertaColor = (tipo) => {
    switch (tipo) {
      case 'error': return 'text-red-400 bg-red-600/10 border-red-600/20';
      case 'warning': return 'text-amber-400 bg-amber-600/10 border-amber-600/20';
      case 'success': return 'text-emerald-400 bg-emerald-600/10 border-emerald-600/20';
      default: return 'text-blue-400 bg-blue-600/10 border-blue-600/20';
    }
  };

  const salvarConfiguracoes = () => alert('Configuracoes salvas com sucesso!');
  const exportarDados = () => alert('Exportacao iniciada! Voce recebera um email quando estiver pronto.');
  const importarDados = () => alert('Funcionalidade de importacao em desenvolvimento');
  const resetarSistema = () => {
    if (window.confirm('Tem certeza? Esta acao ira resetar todas as configuracoes para o padrao.')) {
      alert('Sistema resetado com sucesso!');
    }
  };

  const inputClass = "w-full px-3 py-2 bg-surface-900 border border-surface-600 rounded-md text-sm text-white focus:outline-none focus:border-brand-500";
  const labelClass = "block text-xs font-medium text-surface-400 mb-1.5";

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-surface-700 pb-4">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Settings className="text-brand-400" size={22} />
          Configuracoes
        </h1>
        <p className="text-surface-400 text-sm mt-1">Personalize o sistema conforme suas necessidades</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={AlertTriangle} label="Alertas Ativos" value="3" subvalue="Requerem atencao" color="red" />
        <StatCard icon={Shield} label="Seguranca" value="85%" subvalue="Score de seguranca" color="green" />
        <StatCard icon={Database} label="Dados" value="2.3 GB" subvalue="Espaco utilizado" color="blue" />
        <StatCard icon={Zap} label="Performance" value="98%" subvalue="Sistema otimizado" color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Dados da Empresa */}
          <Card>
            <CardHeader><h2 className="text-white font-medium text-sm">Dados da Empresa</h2></CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nome da Empresa</label>
                  <input type="text" value={config.nomeEmpresa} onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>CNPJ</label>
                  <input type="text" value={config.cnpj} onChange={(e) => setConfig({ ...config, cnpj: e.target.value })} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Endereco</label>
                  <input type="text" value={config.endereco} onChange={(e) => setConfig({ ...config, endereco: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Telefone</label>
                  <input type="text" value={config.telefone} onChange={(e) => setConfig({ ...config, telefone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={config.email} onChange={(e) => setConfig({ ...config, email: e.target.value })} className={inputClass} />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sistema */}
          <Card>
            <CardHeader><h2 className="text-white font-medium text-sm">Configuracoes do Sistema</h2></CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tema</label>
                  <select value={config.tema} onChange={(e) => setConfig({ ...config, tema: e.target.value })} className={inputClass}>
                    <option value="dark">Escuro</option>
                    <option value="light">Claro</option>
                    <option value="auto">Automatico</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Fuso Horario</label>
                  <select value={config.timezone} onChange={(e) => setConfig({ ...config, timezone: e.target.value })} className={inputClass}>
                    <option value="America/Sao_Paulo">Brasilia (UTC-3)</option>
                    <option value="America/Manaus">Manaus (UTC-4)</option>
                    <option value="America/Rio_Branco">Acre (UTC-5)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Formato de Data</label>
                  <select value={config.formatoData} onChange={(e) => setConfig({ ...config, formatoData: e.target.value })} className={inputClass}>
                    <option value="dd/MM/yyyy">DD/MM/AAAA</option>
                    <option value="MM/dd/yyyy">MM/DD/AAAA</option>
                    <option value="yyyy-MM-dd">AAAA-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Casas Decimais</label>
                  <input type="number" min="0" max="4" value={config.casasDecimais} onChange={(e) => setConfig({ ...config, casasDecimais: parseInt(e.target.value) })} className={inputClass} />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Integracoes */}
          <Card>
            <CardHeader>
              <h2 className="text-white font-medium text-sm">Integracoes</h2>
              <p className="text-surface-500 text-xs mt-0.5">Configure integracoes com servicos externos</p>
            </CardHeader>
            <CardBody className="space-y-4">
              {[
                { key: 'receitaFederalAPI', label: 'API Receita Federal', desc: 'Consulta automatica de dados tributarios' },
                { key: 'emailSMTP', label: 'Email SMTP', desc: 'Envio automatico de relatorios por email' },
                { key: 'whatsappAPI', label: 'WhatsApp Business API', desc: 'Envio de propostas via WhatsApp' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-sm font-medium">{item.label}</h3>
                    <p className="text-surface-400 text-xs">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config[item.key]}
                      onChange={(e) => setConfig({ ...config, [item.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-surface-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          {/* Alertas */}
          <Card>
            <CardHeader>
              <h2 className="text-white font-medium text-sm flex items-center gap-2">
                <Bell size={14} /> Alertas Ativos
              </h2>
            </CardHeader>
            <div className="divide-y divide-surface-700/50">
              {alertas.filter(a => a.ativo).map((alerta) => {
                const Icon = getAlertaIcon(alerta.tipo);
                return (
                  <div key={alerta.id} className="p-4">
                    <div className={`flex items-start gap-3 p-3 rounded-md border ${getAlertaColor(alerta.tipo)}`}>
                      <Icon size={14} className="flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium mb-0.5">{alerta.titulo}</h4>
                        <p className="text-xs opacity-80">{alerta.descricao}</p>
                        <p className="text-xs opacity-60 mt-1">{new Date(alerta.data).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Backup */}
          <Card>
            <CardHeader>
              <h2 className="text-white font-medium text-sm flex items-center gap-2">
                <Database size={14} /> Backup e Seguranca
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-sm font-medium">Backup Automatico</h3>
                  <p className="text-surface-400 text-xs">Backup diario dos dados</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.backupAutomatico}
                    onChange={(e) => setConfig({ ...config, backupAutomatico: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-surface-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>

              <div>
                <label className={labelClass}>Frequencia</label>
                <select value={config.frequenciaBackup} onChange={(e) => setConfig({ ...config, frequenciaBackup: e.target.value })} className={inputClass}>
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <button onClick={exportarDados} className="w-full px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-md text-sm hover:bg-blue-600/20 transition-colors">
                  Exportar Dados
                </button>
                <button onClick={importarDados} className="w-full px-4 py-2 bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 rounded-md text-sm hover:bg-emerald-600/20 transition-colors">
                  Importar Dados
                </button>
              </div>
            </CardBody>
          </Card>

          {/* Acoes */}
          <Card>
            <CardHeader><h2 className="text-white font-medium text-sm">Acoes do Sistema</h2></CardHeader>
            <CardBody className="space-y-2">
              <button onClick={salvarConfiguracoes} className="w-full px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition-colors">
                Salvar Configuracoes
              </button>
              <button onClick={resetarSistema} className="w-full px-4 py-2 bg-red-600/10 text-red-400 border border-red-600/20 rounded-md text-sm hover:bg-red-600/20 transition-colors">
                Resetar Sistema
              </button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
