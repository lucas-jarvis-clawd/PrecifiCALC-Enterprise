import { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Database, Zap, AlertTriangle, CheckCircle, Info, Download, Upload, Trash2 } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';

function calcStorageSize() {
  let total = 0;
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('precificalc_')) {
      total += (localStorage.getItem(key) || '').length * 2; // UTF-16
      count++;
    }
  }
  return { size: (total / 1024).toFixed(1) + ' KB', count };
}

export default function Configuracoes() {
  const [config, setConfig] = useState({
    nomeEmpresa: 'Minha Empresa Ltda',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Flores, 123 - Centro',
    telefone: '(11) 99999-9999',
    email: 'contato@empresa.com.br',
    moeda: 'BRL',
    timezone: 'America/Sao_Paulo',
    formatoData: 'dd/MM/yyyy',
    casasDecimais: 2,
    alertasAtivos: true,
    alertaEmail: true,
    backupAutomatico: true,
    frequenciaBackup: 'diario',
  });

  const [storageInfo, setStorageInfo] = useState({ size: '0 KB', count: 0 });

  useEffect(() => {
    setStorageInfo(calcStorageSize());
    // Load saved config from localStorage
    try {
      const saved = localStorage.getItem('precificalc_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(prev => ({ ...prev, ...parsed }));
      }
    } catch { /* ignore */ }
  }, []);

  const [alertas] = useState([
    { id: 1, tipo: 'info', titulo: 'Atualização Disponível', descricao: 'Nova versão do sistema com melhorias na performance', data: '2026-02-01', ativo: true },
    { id: 2, tipo: 'warning', titulo: 'Backup Pendente', descricao: 'Recomendamos exportar seus dados regularmente.', data: '2026-01-30', ativo: true },
    { id: 3, tipo: 'error', titulo: 'Limite do Simples Nacional', descricao: 'Cliente João Silva está próximo do limite (R$ 4.2M de R$ 4.8M)', data: '2026-01-29', ativo: true },
    { id: 4, tipo: 'success', titulo: 'Configuração Salva', descricao: 'Suas preferências foram atualizadas com sucesso', data: '2026-01-28', ativo: false },
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
      case 'error': return 'text-red-700 bg-red-50 border-red-200';
      case 'warning': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'success': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  function salvarConfiguracoes() {
    try {
      localStorage.setItem('precificalc_config', JSON.stringify(config));
      setStorageInfo(calcStorageSize());
      alert('Configurações salvas com sucesso!');
    } catch {
      alert('Erro ao salvar configurações.');
    }
  }

  function exportarDados() {
    const allData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('precificalc_')) {
        try { allData[key] = JSON.parse(localStorage.getItem(key)); } catch { allData[key] = localStorage.getItem(key); }
      }
    }
    if (Object.keys(allData).length === 0) {
      alert('Nenhum dado encontrado para exportar.');
      return;
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `precificalc_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importarDados() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          Object.entries(data).forEach(([key, value]) => {
            if (key.startsWith('precificalc_')) {
              localStorage.setItem(key, JSON.stringify(value));
            }
          });
          setStorageInfo(calcStorageSize());
          alert('Dados importados com sucesso! Recarregue a página para ver os dados atualizados.');
        } catch {
          alert('Erro: arquivo inválido.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function limparDados() {
    if (window.confirm('Tem certeza? Todos os dados salvos serão apagados permanentemente.')) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key.startsWith('precificalc_')) {
          localStorage.removeItem(key);
        }
      }
      alert('Dados limpos com sucesso. A página será recarregada.');
      window.location.reload();
    }
  }

  const inputClass = "w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500";
  const labelClass = "block text-xs font-medium text-slate-600 mb-1.5";

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Settings className="text-brand-600" size={22} />
          Configurações
        </h1>
        <p className="text-slate-500 text-sm mt-1">Personalize o sistema conforme suas necessidades</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={AlertTriangle} label="Alertas Ativos" value={String(alertas.filter(a => a.ativo).length)} subvalue="Requerem atenção" color="red" />
        <StatCard icon={Shield} label="Segurança" value="100%" subvalue="Dados locais" color="green" />
        <StatCard icon={Database} label="Dados" value={storageInfo.size} subvalue={`${storageInfo.count} registro${storageInfo.count !== 1 ? 's' : ''}`} color="blue" />
        <StatCard icon={Zap} label="Performance" value="98%" subvalue="Sistema otimizado" color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Dados da Empresa */}
          <Card>
            <CardHeader><h2 className="text-slate-800 font-medium text-sm">Dados da Empresa</h2></CardHeader>
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
                  <label className={labelClass}>Endereço</label>
                  <input type="text" value={config.endereco} onChange={(e) => setConfig({ ...config, endereco: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Telefone</label>
                  <input type="text" value={config.telefone} onChange={(e) => setConfig({ ...config, telefone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>E-mail</label>
                  <input type="email" value={config.email} onChange={(e) => setConfig({ ...config, email: e.target.value })} className={inputClass} />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sistema */}
          <Card>
            <CardHeader><h2 className="text-slate-800 font-medium text-sm">Configurações do Sistema</h2></CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Fuso Horário</label>
                  <select value={config.timezone} onChange={(e) => setConfig({ ...config, timezone: e.target.value })} className={inputClass}>
                    <option value="America/Sao_Paulo">Brasília (UTC-3)</option>
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
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          {/* Alertas */}
          <Card>
            <CardHeader>
              <h2 className="text-slate-800 font-medium text-sm flex items-center gap-2">
                <Bell size={14} /> Alertas Ativos
              </h2>
            </CardHeader>
            <div className="divide-y divide-slate-100">
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

          {/* Backup e Dados */}
          <Card>
            <CardHeader>
              <h2 className="text-slate-800 font-medium text-sm flex items-center gap-2">
                <Database size={14} /> Backup e Dados
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="bg-slate-50 rounded-md p-3">
                <p className="text-xs text-slate-500">Armazenamento local</p>
                <p className="text-sm font-medium text-slate-800">{storageInfo.size}</p>
                <p className="text-xs text-slate-400">{storageInfo.count} registro{storageInfo.count !== 1 ? 's' : ''} salvo{storageInfo.count !== 1 ? 's' : ''}</p>
              </div>

              <div className="pt-2 space-y-2">
                <button onClick={exportarDados} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm hover:bg-blue-100 transition-colors">
                  <Download size={14} /> Exportar Dados
                </button>
                <button onClick={importarDados} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-sm hover:bg-emerald-100 transition-colors">
                  <Upload size={14} /> Importar Dados
                </button>
              </div>
            </CardBody>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader><h2 className="text-slate-800 font-medium text-sm">Ações do Sistema</h2></CardHeader>
            <CardBody className="space-y-2">
              <button onClick={salvarConfiguracoes} className="w-full px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition-colors">
                Salvar Configurações
              </button>
              <button onClick={limparDados} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm hover:bg-red-100 transition-colors">
                <Trash2 size={14} /> Limpar Todos os Dados
              </button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
