// Mapeamento de nomes técnicos para nomes amigáveis
const SOURCE_MAP: Record<string, string> = {
  facebook_messenger_chatwoot: "Facebook Messenger",
  instagram_direct: "Instagram Direct",
  instagram_comment: "Instagram Comentário",
  instagram_comentario: "Instagram Comentário", // Adicionando variação
  facebook_feed: "Facebook Feed",
  whatsapp: "WhatsApp",
  direto: "Direto", // Adicionando a nova categoria
};

/**
 * Formata um nome de origem técnico para um nome amigável.
 * @param source O nome técnico da origem (ex: 'facebook_messenger_chatwoot')
 * @returns O nome formatado (ex: 'Facebook Messenger')
 */
export function formatSourceName(source: string | null | undefined): string {
  if (!source) return "Direto";
  return SOURCE_MAP[source.toLowerCase()] || source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Formata um nome de etapa de funil.
 * @param stage A etapa do funil
 * @returns O nome formatado
 */
export function formatFunnelStageName(stage: string | null | undefined): string {
  if (!stage) return "Não Definido";
  return stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}