import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface MetricsTableProps {
  data: any[]
}

export function MetricsTable({ data }: MetricsTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead className="text-right">Impressions</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">CTR</TableHead>
            <TableHead className="text-right">CPC</TableHead>
            <TableHead className="text-right">CPM</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Conversions</TableHead>
            <TableHead className="text-right">CPA</TableHead>
            <TableHead className="text-right">ROAS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.campaign}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  row.platform === 'Facebook' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {row.platform}
                </span>
              </TableCell>
              <TableCell className="text-right">{row.impressions?.toLocaleString() || 0}</TableCell>
              <TableCell className="text-right">{row.clicks?.toLocaleString() || 0}</TableCell>
              <TableCell className="text-right">{row.ctr?.toFixed(2) || 0}%</TableCell>
              <TableCell className="text-right">${row.cpc?.toFixed(2) || 0}</TableCell>
              <TableCell className="text-right">${row.cpm?.toFixed(2) || 0}</TableCell>
              <TableCell className="text-right">${row.cost?.toFixed(2) || 0}</TableCell>
              <TableCell className="text-right">{row.conversions?.toLocaleString() || 0}</TableCell>
              <TableCell className="text-right">${row.cpa?.toFixed(2) || 0}</TableCell>
              <TableCell className="text-right">{row.roas?.toFixed(1) || 0}x</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}