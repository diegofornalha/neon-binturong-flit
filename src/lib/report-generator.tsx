import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

interface ReportData {
  organization: {
    name: string
    branding: {
      logo?: string
      primaryColor: string
      companyName: string
    }
  }
  client: {
    name: string
    email: string
  }
  metrics: {
    totalSpend: number
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    averageCTR: number
    averageCPC: number
    averageCPM: number
    averageROAS: number
  }
  period: {
    start: string
    end: string
  }
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  metricsGrid: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  metricItem: {
    flex: 1,
    margin: 5,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  footer: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
})

export async function generateReportPDF(reportData: ReportData): Promise<Blob> {
  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>{reportData.organization.branding.companyName}</Text>
          <Text style={styles.subtitle}>
            Relatório de Performance - {reportData.client.name}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
            Período: {reportData.period.start} a {reportData.period.end}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Métricas Principais</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                R$ {reportData.metrics.totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.metricLabel}>Investimento Total</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {reportData.metrics.totalImpressions.toLocaleString('pt-BR')}
              </Text>
              <Text style={styles.metricLabel}>Impressões</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {reportData.metrics.totalClicks.toLocaleString('pt-BR')}
              </Text>
              <Text style={styles.metricLabel}>Cliques</Text>
            </View>
          </View>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {reportData.metrics.totalConversions.toLocaleString('pt-BR')}
              </Text>
              <Text style={styles.metricLabel}>Conversões</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {reportData.metrics.averageCTR.toFixed(2)}%
              </Text>
              <Text style={styles.metricLabel}>CTR Médio</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                R$ {reportData.metrics.averageCPC.toFixed(2)}
              </Text>
              <Text style={styles.metricLabel}>CPC Médio</Text>
            </View>
          </View>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                R$ {reportData.metrics.averageCPM.toFixed(2)}
              </Text>
              <Text style={styles.metricLabel}>CPM Médio</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {reportData.metrics.averageROAS.toFixed(1)}x
              </Text>
              <Text style={styles.metricLabel}>ROAS Médio</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.footer}>
            Relatório gerado por Carmen SDR - {new Date().toLocaleDateString('pt-BR')}
          </Text>
          <Text style={styles.footer}>
            {reportData.organization.branding.companyName} - {reportData.client.email}
          </Text>
        </View>
      </Page>
    </Document>
  )

  const blob = await pdf(MyDocument).toBlob()
  return blob
}

export interface ReportTemplate {
  id: string
  name: string
  type: 'executive' | 'detailed' | 'custom'
  metrics: string[]
  layout: 'compact' | 'full'
  includeCharts: boolean
  includeInsights: boolean
}