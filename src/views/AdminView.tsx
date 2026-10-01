import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  parseJsonRecipes,
  parseCsvRecipes,
  importRecipesBatch,
  BatchRecipeItem,
  ImportResult,
} from '../utils/importer';
import {
  ShieldAlert,
  Users,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  UserX,
  ShieldCheck,
  Lock,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

interface AdminUserItem {
  id: string;
  nome: string | null;
  email: string | null;
  role: 'admin' | 'usuario';
  status: 'active' | 'canceled' | 'trialing' | 'liberado';
  created_at?: string;
}

interface AdminViewProps {
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const { user, profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'import'>('users');

  // Estado da lista de usuários
  const [userList, setUserList] = useState<AdminUserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [userActionMsg, setUserActionMsg] = useState<{ text: string; isError?: boolean } | null>(
    null
  );

  // Estado da importação
  const [importText, setImportText] = useState<string>('');
  const [parsedRecipes, setParsedRecipes] = useState<BatchRecipeItem[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(
    null
  );
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Carregar lista de usuários do Supabase
  const loadUsers = async () => {
    setLoadingUsers(true);
    setUserActionMsg(null);

    if (!isSupabaseConfigured() || !supabase) {
      setLoadingUsers(false);
      return;
    }

    try {
      // 1. Consultar perfis
      const { data: profilesData, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (profErr) {
        console.warn('Erro ao carregar perfis:', profErr.message);
        // Fallback para exibir pelo menos os usuários conhecidos de teste se ainda não migrado
        setUserList([
          {
            id: user?.id || 'usuario_a_id',
            nome: profile?.nome || 'Usuário A (Você)',
            email: user?.email || 'usuario_a@teste.com',
            role: profile?.role || 'admin',
            status: 'liberado',
          },
          {
            id: 'usuario_b_id',
            nome: 'Usuário B',
            email: 'usuario_b@teste.com',
            role: 'usuario',
            status: 'liberado',
          },
        ]);
        setLoadingUsers(false);
        return;
      }

      // 2. Consultar assinaturas
      const { data: subsData } = await supabase.from('subscriptions').select('*');
      const subMap = new Map<string, string>();
      (subsData || []).forEach((s) => {
        subMap.set(s.user_id, s.status);
      });

      const formatted: AdminUserItem[] = (profilesData || []).map((p) => ({
        id: p.id,
        nome: p.nome,
        email: p.id === user?.id ? user?.email ?? null : `${p.nome?.toLowerCase() || 'usuario'}@app.neco`,
        role: p.role,
        status: (subMap.get(p.id) as any) || 'liberado',
        created_at: p.created_at,
      }));

      // Se a lista estiver vazia mas houver o usuário logado, adiciona ele
      if (formatted.length === 0 && user) {
        formatted.push({
          id: user.id,
          nome: profile?.nome || user.email?.split('@')[0] || 'Admin',
          email: user.email ?? null,
          role: 'admin',
          status: 'liberado',
        });
      }

      setUserList(formatted);
    } catch (err: any) {
      console.warn('Erro ao listar usuários no admin:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Ação de promoção ou rebaixamento de papel
  const handleToggleRole = async (targetUser: AdminUserItem) => {
    if (!isSupabaseConfigured() || !supabase) return;

    const newRole = targetUser.role === 'admin' ? 'usuario' : 'admin';
    const confirmMsg =
      newRole === 'admin'
        ? `Deseja realmente promover ${targetUser.nome || targetUser.email} para Administrador?`
        : `Deseja realmente rebaixar ${targetUser.nome || targetUser.email} para Usuário comum?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUser.id);

      if (error) {
        setUserActionMsg({ text: `Falha ao alterar papel: ${error.message}`, isError: true });
      } else {
        setUserActionMsg({
          text: `Papel de ${targetUser.nome || targetUser.email} alterado para ${newRole.toUpperCase()} com sucesso!`,
        });
        await loadUsers();
      }
    } catch (err: any) {
      setUserActionMsg({ text: err.message || 'Erro ao alterar papel.', isError: true });
    }
  };

  // Ação de liberação ou revogação manual de acesso
  const handleToggleAccess = async (targetUser: AdminUserItem) => {
    if (!isSupabaseConfigured() || !supabase) return;

    const newStatus = targetUser.status === 'active' || targetUser.status === 'liberado' ? 'canceled' : 'active';
    const actionLabel = newStatus === 'active' ? 'Liberar acesso' : 'Revogar acesso';

    if (!window.confirm(`Deseja realmente ${actionLabel} de ${targetUser.nome || targetUser.email}?`)) return;

    try {
      await supabase.from('subscriptions').delete().eq('user_id', targetUser.id);
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: targetUser.id,
          status: newStatus,
          manual_override: true,
          periodo_atual_fim: newStatus === 'active' ? '2099-12-31T23:59:59.000Z' : null,
          current_period_end: newStatus === 'active' ? '2099-12-31T23:59:59.000Z' : null,
        });

      if (error) {
        setUserActionMsg({ text: `Falha ao atualizar acesso: ${error.message}`, isError: true });
      } else {
        setUserActionMsg({
          text: `Acesso de ${targetUser.nome || targetUser.email} atualizado para ${newStatus === 'active' ? 'ATIVO / LIBERADO' : 'REVOGADO'}!`,
        });
        await loadUsers();
      }
    } catch (err: any) {
      setUserActionMsg({ text: err.message || 'Erro ao alterar acesso.', isError: true });
    }
  };

  // Processamento de arquivo ou texto colado para importação
  const handleParseContent = (content: string) => {
    setParseErrors([]);
    setParsedRecipes([]);
    setImportResult(null);

    const trimmed = content.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      const res = parseJsonRecipes(trimmed);
      if (res.errors.length > 0) {
        setParseErrors(res.errors);
      } else {
        setParsedRecipes(res.recipes);
      }
    } else {
      const res = parseCsvRecipes(trimmed);
      if (res.errors.length > 0) {
        setParseErrors(res.errors);
      } else {
        setParsedRecipes(res.recipes);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
      handleParseContent(text);
    };
    reader.readAsText(file);
  };

  const handleStartImport = async () => {
    if (parsedRecipes.length === 0) return;

    setIsImporting(true);
    setImportProgress({ current: 0, total: parsedRecipes.length });
    setImportResult(null);

    try {
      const result = await importRecipesBatch(parsedRecipes, (current, total) => {
        setImportProgress({ current, total });
      });
      setImportResult(result);
    } catch (err: any) {
      setImportResult({
        success: false,
        totalProcessed: parsedRecipes.length,
        inserted: 0,
        validationErrors: [],
        errors: [err.message || 'Erro inesperado durante a importação.'],
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 stroke-[2.5]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-[24px] font-bold text-stone-900 dark:text-stone-100">
            Acesso Restrito ao Administrador
          </h1>
          <p className="text-[15px] text-stone-600 dark:text-stone-400">
            Esta área é exclusiva para a administração do aplicativo. Faça login com uma conta com perfil de administrador.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-2xl bg-emerald-700 text-white font-bold text-[16px] inline-flex items-center gap-2 shadow-xs"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          Voltar para o aplicativo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32 max-w-2xl mx-auto px-4 pt-4 sm:pt-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold min-h-[44px] active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Voltar para Mais</span>
        </button>

        <span className="px-3 py-1 rounded-full text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          Área do Administrador
        </span>
      </div>

      <div>
        <h1 className="text-[26px] sm:text-[30px] font-bold text-stone-900 dark:text-stone-100">
          Painel de Controle
        </h1>
        <p className="text-[15px] text-stone-600 dark:text-stone-400 mt-1">
          Gerenciamento simples e minimalista de usuários, acessos e receitas
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 dark:bg-stone-900 rounded-2xl">
        <button
          onClick={() => setActiveTab('users')}
          className={`h-[48px] rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'users'
              ? 'bg-white dark:bg-[#1E2220] text-emerald-800 dark:text-emerald-400 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Usuários e Acessos</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`h-[48px] rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'import'
              ? 'bg-white dark:bg-[#1E2220] text-emerald-800 dark:text-emerald-400 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <UploadCloud className="w-5 h-5" />
          <span>Importar Receitas</span>
        </button>
      </div>

      {/* Tab 1: Usuários */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <span>Lista de Usuários Cadastrados</span>
            </h2>
            <button
              onClick={loadUsers}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
              title="Recarregar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Feedback banner */}
          {userActionMsg && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-2.5 text-[14px] ${
                userActionMsg.isError
                  ? 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200'
              }`}
            >
              {userActionMsg.isError ? (
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              )}
              <span>{userActionMsg.text}</span>
            </div>
          )}

          {/* Note regarding Phase 4 access rule */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-[14px] space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>ℹ️</span> Regra da Fase 4 (Acesso Total de Testes):
            </p>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
              Enquanto a Fase 7 (Pagamentos/Monetização) não estiver ativa, todos os usuários logados possuem acesso completo às receitas para testes. Abaixo você pode gerenciar papéis e testar a liberação/revogação manual de acessos.
            </p>
          </div>

          {loadingUsers ? (
            <div className="p-8 text-center text-stone-500 space-y-2">
              <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Carregando usuários...</p>
            </div>
          ) : userList.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#1E2220] rounded-3xl border border-stone-200 dark:border-stone-800 text-stone-500">
              Nenhum usuário cadastrado encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {userList.map((item) => {
                const isCurrentUser = item.id === user?.id;
                const isItemAdmin = item.role === 'admin';
                const isAccessActive = item.status === 'active' || item.status === 'liberado';

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[17px] font-bold text-stone-900 dark:text-stone-100">
                            {item.nome || 'Usuário Sem Nome'}
                          </h3>
                          {isCurrentUser && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                              Você
                            </span>
                          )}
                        </div>
                        <p className="text-[14px] text-stone-500 dark:text-stone-400 mt-0.5">
                          {item.email || 'E-mail não informado'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Role Badge */}
                        <span
                          className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${
                            isItemAdmin
                              ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                          }`}
                        >
                          {isItemAdmin ? 'ADMIN' : 'USUÁRIO'}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${
                            isAccessActive
                              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {isAccessActive ? 'Acesso Ativo' : 'Revogado'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                      {/* Promover/Rebaixar */}
                      {!isCurrentUser && (
                        <button
                          onClick={() => handleToggleRole(item)}
                          className="px-3.5 py-2 rounded-xl text-[13px] font-bold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center gap-1.5 transition-colors"
                        >
                          {isItemAdmin ? (
                            <>
                              <UserX className="w-4 h-4 text-amber-600" />
                              <span>Rebaixar a Usuário</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                              <span>Promover a Admin</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Liberar / Revogar Acesso */}
                      <button
                        onClick={() => handleToggleAccess(item)}
                        className={`px-3.5 py-2 rounded-xl text-[13px] font-bold flex items-center gap-1.5 transition-colors ${
                          isAccessActive
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}
                      >
                        {isAccessActive ? (
                          <>
                            <UserX className="w-4 h-4" />
                            <span>Revogar Acesso</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>Liberar Acesso Total</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Importar Receitas */}
      {activeTab === 'import' && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <UploadCloud className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
              <h2 className="text-[19px] font-bold text-stone-900 dark:text-stone-100">
                Importação em Lote de Receitas (350 Receitas)
              </h2>
            </div>
            <p className="text-[15px] text-stone-600 dark:text-stone-400 leading-relaxed">
              Você pode carregar um arquivo <strong>.JSON</strong> ou <strong>.CSV</strong> contendo as receitas do Seu Neco. O importador valida os campos obrigatórios, atualiza receitas existentes por número e cadastra ingredientes, utensílios, passos e dicas ordenados.
            </p>

            {/* File Upload Button */}
            <div className="space-y-2">
              <label className="block text-[14px] font-bold text-stone-700 dark:text-stone-300">
                Carregar Arquivo (JSON ou CSV):
              </label>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                disabled={isImporting}
                className="block w-full text-[14px] text-stone-600 dark:text-stone-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[14px] file:font-bold file:bg-emerald-100 file:text-emerald-800 dark:file:bg-emerald-950 dark:file:text-emerald-300 hover:file:bg-emerald-200 cursor-pointer"
              />
            </div>

            {/* Or Paste Content */}
            <div className="space-y-2">
              <label className="block text-[14px] font-bold text-stone-700 dark:text-stone-300">
                Ou cole o conteúdo (JSON / CSV):
              </label>
              <textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  handleParseContent(e.target.value);
                }}
                disabled={isImporting}
                placeholder='Exemplo JSON: [{"numero": 4, "titulo": "INFUSÃO...", "categoria": "Infusões", ...}]'
                rows={6}
                className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[14px] font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Parse Feedback */}
            {parseErrors.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-[14px] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Falha na validação do formato:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {parseErrors.slice(0, 5).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {parsedRecipes.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-[15px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold">
                    {parsedRecipes.length} receita(s) pronta(s) para importação
                  </span>
                </div>
                <span className="text-[13px] bg-emerald-200/60 dark:bg-emerald-900/60 px-2.5 py-1 rounded-full font-bold">
                  Válido
                </span>
              </div>
            )}

            {/* Progress Bar */}
            {isImporting && importProgress && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[14px] font-bold text-stone-700 dark:text-stone-300">
                  <span>Importando para o Supabase...</span>
                  <span>
                    {importProgress.current} / {importProgress.total} (
                    {Math.round((importProgress.current / importProgress.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-200"
                    style={{
                      width: `${(importProgress.current / importProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Final Import Result */}
            {importResult && (
              <div
                className={`p-5 rounded-2xl border text-[14px] space-y-2 ${
                  importResult.success
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'bg-red-50 border-red-200 dark:bg-red-950/40 text-red-900 dark:text-red-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-[16px]">
                  {importResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span>
                    {importResult.success
                      ? 'Importação Concluída com Sucesso!'
                      : 'Houve problemas durante a importação'}
                  </span>
                </div>
                <p>
                  <strong>Total processado:</strong> {importResult.totalProcessed} receitas |{' '}
                  <strong>Inseridas/Atualizadas:</strong> {importResult.inserted} receitas.
                </p>
                {importResult.errors.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="font-bold">Erros registrados:</p>
                    <ul className="list-disc list-inside text-[13px] space-y-0.5">
                      {importResult.errors.slice(0, 5).map((e, idx) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Execute Import Button */}
            <button
              onClick={handleStartImport}
              disabled={isImporting || parsedRecipes.length === 0}
              className="w-full h-[54px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[16px] flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              {isImporting ? (
                <span>Gravando no Supabase...</span>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5 stroke-[2.5]" />
                  <span>
                    Confirmar Importação de {parsedRecipes.length > 0 ? parsedRecipes.length : ''} Receitas
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
