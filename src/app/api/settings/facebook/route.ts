import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('[Settings] Salvando configuração do Facebook')
    
    const { appId, appSecret, accessToken, accounts } = await request.json()
    
    console.log('[Settings] Dados recebidos:', { appId, appSecret: !!appSecret, accessToken: !!accessToken, accountsCount: accounts?.length })
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access Token é obrigatório' },
        { status: 400 }
      )
    }

    const db = await getDb()
    
    // Initialize settings if not exists
    if (!db.data.settings) {
      db.data.settings = {}
    }
    
    // Save Facebook settings
    db.data.settings.facebook = {
      appId: appId || "",
      appSecret: appSecret || "",
      accessToken,
      accounts: accounts || [],
      updatedAt: new Date().toISOString()
    }
    
    await db.write()
    
    console.log('[Settings] Configuração do Facebook salva com sucesso')
    
    return NextResponse.json({
      success: true,
      message: 'Facebook settings saved successfully'
    })
  } catch (error) {
    console.error('[Settings] Erro ao salvar configuração do Facebook:', error)
    return NextResponse.json(
      { error: 'Failed to save Facebook settings' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[Settings] Buscando configuração do Facebook')
    
    const db = await getDb()
    const facebookSettings = db.data.settings?.facebook || null
    
    console.log('[Settings] Configurações encontradas:', !!facebookSettings)
    if (facebookSettings) {
      console.log('[Settings] Account ID:', facebookSettings.accounts?.[0]?.account_id)
      console.log('[Settings] Token configurado:', !!facebookSettings.accessToken)
    }
    
    return NextResponse.json({
      success: true,
      data: facebookSettings
    })
  } catch (error) {
    console.error('[Settings] Erro ao buscar configuração do Facebook:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Facebook settings' },
      { status: 500 }
    )
  }
}