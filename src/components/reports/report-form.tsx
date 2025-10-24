"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Report name must be at least 2 characters.",
  }),
  clientId: z.string().min(1, {
    message: "Please select a client.",
  }),
  format: z.enum(["pdf", "csv"], {
    required_error: "Please select a format.",
  }),
  frequency: z.enum(["daily", "weekly", "monthly"], {
    required_error: "Please select a frequency.",
  }),
  recipients: z.string().min(1, {
    message: "Please enter at least one recipient email.",
  }),
})

interface ReportFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function ReportForm({ initialData, onSubmit, onCancel }: ReportFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      clientId: initialData?.clientId || "",
      format: initialData?.format || "pdf",
      frequency: initialData?.frequency || "weekly",
      recipients: initialData?.recipients?.join(", ") || "",
    },
  })

  async function handleSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      console.log("[ReportForm] Submitting data:", data)
      onSubmit({
        ...data,
        recipients: data.recipients.split(",").map(email => email.trim()),
      })
      toast.success("Report saved successfully")
    } catch (error) {
      toast.error("Failed to save report")
      console.error("[ReportForm]", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Report Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter report name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Acme Corporation</SelectItem>
                  <SelectItem value="2">Globex Inc</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Format</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="recipients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipients</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter email addresses separated by commas" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Separate multiple email addresses with commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Report"}
          </Button>
        </div>
      </form>
    </Form>
  )
}