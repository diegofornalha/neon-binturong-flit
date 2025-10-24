export const locales = ['en', 'pt', 'es'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'pt'

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    clients: 'Clients',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',

    // Common
    'common.update': 'Update',
    'common.export': 'Export',
    'common.print': 'Print',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.no.content': 'No content.',

    // Dashboard
    'dashboard.greeting': 'Welcome back, Admin',
    'dashboard.greeting.subtitle': 'Here is an overview of your advertising performance today.',
    'dashboard.insights.today': "Today's Insights",
    'dashboard.updated.now': 'Updated just now',
    'dashboard.sales.funnel': 'Sales Funnel',
    'dashboard.intelligent.leads': 'Intelligent Leads',
    'dashboard.latest.leads': 'Latest leads identified by our AI',
    'dashboard.view.all': 'View All',
    'dashboard.campaign.performance': 'Campaign Performance',

    // KPIs
    'kpi.total.spend': 'Total Spend',
    'kpi.appointments': 'Appointments',
    'kpi.conversion.rate': 'Conversion Rate',
    'kpi.qualified.leads': 'Qualified Leads',

    // Charts
    'chart.spend.over.time': 'Spend Over Time',
    'chart.daily.spend': 'Daily advertising spend',
    'chart.clicks.over.time': 'Clicks Over Time',
    'chart.daily.clicks': 'Daily clicks',

    // Facebook Ads
    'fb.title': 'Facebook Ads',
    'fb.updated': 'Updated',
    'fb.not.configured': 'Facebook Ads not configured',
    'fb.go.settings': 'Go to Settings',
    'fb.filters.campaigns': 'Campaigns',
    'fb.filters.adsets': 'Ad Sets',
    'fb.filters.clear': 'Clear filters',

    // KPIs
    'fb.kpi.impressions': 'Impressions',
    'fb.kpi.clicks': 'Clicks',
    'fb.kpi.spend': 'Total Spend',
    'fb.kpi.roas': 'ROAS',
    'fb.kpi.ctr': 'CTR',
    'fb.kpi.cpc': 'CPC',
    'fb.kpi.cpm': 'CPM',
    'fb.kpi.conversions': 'Conversions',
    'fb.kpi.reach': 'Reach',
    'fb.kpi.frequency': 'Avg. Frequency',
    'fb.kpi.cpp': 'Avg. CPP',
    'fb.kpi.cpa': 'Avg. CPA',

    // FB Charts
    'fb.chart.spendByDay': 'Spend by day',
    'fb.chart.impressionsVsClicks': 'Impressions vs. Clicks',
    'fb.chart.cpcCpm': 'CPC and CPM by day',
    'fb.chart.ctrByDay': 'CTR by day',
    'fb.chart.spendShare': 'Spend share by campaign',
    'fb.chart.byPlatform': 'Spend by platform',
    'fb.chart.byDevice': 'Spend by device',

    // FB Top
    'fb.top.campaigns': 'Top Campaigns by Spend',

    // FB AI
    'fb.ai.generate.analysis': 'Generate Analysis for Period',
    'fb.ai.analysis.placeholder': 'The analysis will appear here after generation.',
    'fb.ai.analysis.generated': 'AI analysis generated.',
    'fb.ai.analysis.failed': 'AI analysis failed.',
  },
  pt: {
    // Navigation
    dashboard: 'Dashboard',
    clients: 'Clientes',
    reports: 'Relatórios',
    settings: 'Configurações',
    logout: 'Sair',

    // Common
    'common.update': 'Atualizar',
    'common.export': 'Exportar',
    'common.print': 'Imprimir',
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.no.content': 'Sem conteúdo.',

    // Dashboard
    'dashboard.greeting': 'Bem-vindo de volta, Admin',
    'dashboard.greeting.subtitle': 'Aqui está um resumo da sua performance de anúncios hoje.',
    'dashboard.insights.today': 'Insights de Hoje',
    'dashboard.updated.now': 'Atualizado agora',
    'dashboard.sales.funnel': 'Funil de Vendas',
    'dashboard.intelligent.leads': 'Leads Inteligentes',
    'dashboard.latest.leads': 'Últimos leads identificados por nossa IA',
    'dashboard.view.all': 'Ver Todos',
    'dashboard.campaign.performance': 'Performance das Campanhas',

    // KPIs
    'kpi.total.spend': 'Gasto Total',
    'kpi.appointments': 'Agendamentos',
    'kpi.conversion.rate': 'Taxa de Conversão',
    'kpi.qualified.leads': 'Leads Qualificados',

    // Charts
    'chart.spend.over.time': 'Gastos ao Longo do Tempo',
    'chart.daily.spend': 'Gastos diários de publicidade',
    'chart.clicks.over.time': 'Cliques ao Longo do Tempo',
    'chart.daily.clicks': 'Cliques diários',

    // Facebook Ads
    'fb.title': 'Facebook Ads',
    'fb.updated': 'Atualizado',
    'fb.not.configured': 'Facebook Ads não configurado',
    'fb.go.settings': 'Ir para Configurações',
    'fb.filters.campaigns': 'Campanhas',
    'fb.filters.adsets': 'Conjuntos de Anúncios',
    'fb.filters.clear': 'Limpar filtros',

    // KPIs
    'fb.kpi.impressions': 'Impressões',
    'fb.kpi.clicks': 'Cliques',
    'fb.kpi.spend': 'Gasto Total',
    'fb.kpi.roas': 'ROAS',
    'fb.kpi.ctr': 'CTR',
    'fb.kpi.cpc': 'CPC',
    'fb.kpi.cpm': 'CPM',
    'fb.kpi.conversions': 'Conversões',
    'fb.kpi.reach': 'Alcance',
    'fb.kpi.frequency': 'Frequência Média',
    'fb.kpi.cpp': 'CPP Médio',
    'fb.kpi.cpa': 'CPA Médio',

    // FB Charts
    'fb.chart.spendByDay': 'Gasto por dia',
    'fb.chart.impressionsVsClicks': 'Impressões vs. Cliques',
    'fb.chart.cpcCpm': 'CPC e CPM por dia',
    'fb.chart.ctrByDay': 'CTR por dia',
    'fb.chart.spendShare': 'Participação de gasto por campanha',
    'fb.chart.byPlatform': 'Gasto por plataforma',
    'fb.chart.byDevice': 'Gasto por dispositivo',

    // FB Top
    'fb.top.campaigns': 'Top Campanhas por Gasto',

    // FB AI
    'fb.ai.generate.analysis': 'Gerar Análise do Período',
    'fb.ai.analysis.placeholder': 'A análise aparecerá aqui após gerar.',
    'fb.ai.analysis.generated': 'Análise por IA gerada.',
    'fb.ai.analysis.failed': 'Falha na análise por IA.',
  },
  es: {
    // Navigation
    dashboard: 'Dashboard',
    clients: 'Clientes',
    reports: 'Informes',
    settings: 'Configuración',
    logout: 'Salir',

    // Common
    'common.update': 'Actualizar',
    'common.export': 'Exportar',
    'common.print': 'Imprimir',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.no.content': 'Sin contenido.',

    // Dashboard
    'dashboard.greeting': 'Bienvenido de nuevo, Admin',
    'dashboard.greeting.subtitle': 'Aquí hay un resumen de su rendimiento publicitario hoy.',
    'dashboard.insights.today': 'Insights de Hoy',
    'dashboard.updated.now': 'Actualizado ahora',
    'dashboard.sales.funnel': 'Embudo de Ventas',
    'dashboard.intelligent.leads': 'Leads Inteligentes',
    'dashboard.latest.leads': 'Últimos leads identificados por nuestra IA',
    'dashboard.view.all': 'Ver Todos',
    'dashboard.campaign.performance': 'Rendimiento de Campañas',

    // KPIs
    'kpi.total.spend': 'Gasto Total',
    'kpi.appointments': 'Citas',
    'kpi.conversion.rate': 'Tasa de Conversión',
    'kpi.qualified.leads': 'Leads Calificados',

    // Charts
    'chart.spend.over.time': 'Gastos a lo Largo del Tiempo',
    'chart.daily.spend': 'Gasto diario de publicidad',
    'chart.clicks.over.time': 'Clics a lo Largo del Tiempo',
    'chart.daily.clicks': 'Clics diarios',

    // Facebook Ads
    'fb.title': 'Facebook Ads',
    'fb.updated': 'Actualizado',
    'fb.not.configured': 'Facebook Ads no configurado',
    'fb.go.settings': 'Ir a Configuraciones',
    'fb.filters.campaigns': 'Campañas',
    'fb.filters.adsets': 'Conjuntos de Anuncios',
    'fb.filters.clear': 'Limpiar filtros',

    // KPIs
    'fb.kpi.impressions': 'Impresiones',
    'fb.kpi.clicks': 'Clics',
    'fb.kpi.spend': 'Gasto Total',
    'fb.kpi.roas': 'ROAS',
    'fb.kpi.ctr': 'CTR',
    'fb.kpi.cpc': 'CPC',
    'fb.kpi.cpm': 'CPM',
    'fb.kpi.conversions': 'Conversiones',
    'fb.kpi.reach': 'Alcance',
    'fb.kpi.frequency': 'Frecuencia Media',
    'fb.kpi.cpp': 'CPP Medio',
    'fb.kpi.cpa': 'CPA Medio',

    // FB Charts
    'fb.chart.spendByDay': 'Gasto por día',
    'fb.chart.impressionsVsClicks': 'Impresiones vs. Clics',
    'fb.chart.cpcCpm': 'CPC y CPM por día',
    'fb.chart.ctrByDay': 'CTR por día',
    'fb.chart.spendShare': 'Participación de gasto por campaña',
    'fb.chart.byPlatform': 'Gasto por plataforma',
    'fb.chart.byDevice': 'Gasto por dispositivo',

    // FB Top
    'fb.top.campaigns': 'Top Campañas por Gasto',

    // FB AI
    'fb.ai.generate.analysis': 'Generar Análisis del Período',
    'fb.ai.analysis.placeholder': 'El análisis aparecerá aquí después de la generación.',
    'fb.ai.analysis.generated': 'Análisis de IA generado.',
    'fb.ai.analysis.failed': 'Fallo el análisis de IA.',
  }
}

export function getTranslation(locale: Locale, key: string): string {
  // @ts-ignore
  return translations[locale]?.[key] || key
}