import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Upload, Check, AlertTriangle } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Company {
  id: number;
  name: string;
}

interface Region {
  id: number;
  name: string;
  company_id: number;
}

interface Tier {
  id: number;
  name: string;
}

interface ColumnMapping {
  [key: string]: string;
}

interface CsvRow {
  [key: string]: string;
}

const LEAD_FIELDS = [
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'headline', label: 'Headline' },
  { value: 'job_title', label: 'Job Title' },
  { value: 'location', label: 'Location' },
  { value: 'work_email', label: 'Work Email' },
  { value: 'priority', label: 'Priority' },
  { value: 'follow_company', label: 'Follow Company' },
];

export default function AccountsImport() {
  const { companies, regions, tiers } = usePage().props;

  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'select' | 'mapping' | 'review'>('upload');

  const typedCompanies = companies as Company[];
  const typedRegions = regions as Region[];
  const typedTiers = tiers as Tier[];

  const filteredRegions = selectedCompany
    ? typedRegions.filter((r) => r.company_id === parseInt(selectedCompany))
    : [];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    parseCSV(selectedFile);
  };

  const parseCSV = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.trim().split('\n');
        
        if (lines.length < 2) {
          setError('CSV file must contain headers and at least one row');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim());
        setCsvHeaders(headers);

        const data: CsvRow[] = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim());
          const row: CsvRow = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        setCsvData(data);
        setStep('select');
        setError(null);
      } catch (err) {
        setError('Error parsing CSV file. Please ensure it is properly formatted.');
      }
    };
    reader.readAsText(csvFile);
  };

  const handleProceedToMapping = () => {
    if (!selectedCompany || !selectedRegion || !selectedTier) {
      setError('Please select Company, Region, and Tier');
      return;
    }
    setStep('mapping');
    setError(null);
  };

  const handleMappingChange = (csvColumn: string, leadField: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [csvColumn]: leadField,
    }));
  };

  const handleProceedToReview = () => {
    const mappedFields = Object.values(columnMapping).filter(Boolean);
    if (mappedFields.length === 0) {
      setError('Please map at least one CSV column to a Lead field');
      return;
    }
    setStep('review');
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        company_id: selectedCompany,
        region_id: selectedRegion,
        tier_id: selectedTier,
        column_mapping: columnMapping,
        csv_data: csvData,
      };

      router.post('/accounts/import', payload, {
        onError: (errors) => {
          setError(errors.message || 'Failed to import leads');
          setLoading(false);
        },
        onSuccess: () => {
          setLoading(false);
          // Reset form
          setFile(null);
          setCsvData([]);
          setCsvHeaders([]);
          setColumnMapping({});
          setStep('upload');
        },
      });
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Import Leads</h1>
          <p className="text-muted-foreground">
            Upload a CSV file to import multiple leads and accounts
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Indicators */}
        <div className="flex gap-2">
          <Badge variant={step === 'upload' ? 'default' : 'secondary'}>
            1. Upload
          </Badge>
          <Badge variant={step === 'select' ? 'default' : 'secondary'}>
            2. Select
          </Badge>
          <Badge variant={step === 'mapping' ? 'default' : 'secondary'}>
            3. Map Columns
          </Badge>
          <Badge variant={step === 'review' ? 'default' : 'secondary'}>
            4. Review
          </Badge>
        </div>

        {/* STEP 1: Upload */}
        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Select a CSV file containing lead information. Headers are required.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-semibold">Drag and drop your CSV file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
              </div>

              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />

              {file && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span>{file.name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Select Company, Region, Tier */}
        {step === 'select' && (
          <Card>
            <CardHeader>
              <CardTitle>Select Organization Details</CardTitle>
              <CardDescription>
                Choose the company, region, and tier for the imported leads
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* CSV Preview */}
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold">CSV Preview</h3>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted">
                        {csvHeaders.map((header) => (
                          <th key={header} className="px-4 py-2 text-left font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 3).map((row, idx) => (
                        <tr key={idx} className="border-b">
                          {csvHeaders.map((header) => (
                            <td key={`${idx}-${header}`} className="px-4 py-2 text-muted-foreground">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  Showing 3 of {csvData.length} records
                </p>
              </div>

              {/* Selection Fields */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <label htmlFor="company" className="font-semibold text-sm">
                    Company *
                  </label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger id="company">
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {typedCompanies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="region" className="font-semibold text-sm">
                    Region *
                  </label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger id="region" disabled={!selectedCompany}>
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRegions.map((region) => (
                        <SelectItem key={region.id} value={region.id.toString()}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="tier" className="font-semibold text-sm">
                    Tier *
                  </label>
                  <Select value={selectedTier} onValueChange={setSelectedTier}>
                    <SelectTrigger id="tier">
                      <SelectValue placeholder="Select a tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {typedTiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id.toString()}>
                          {tier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Back
                </Button>
                <Button onClick={handleProceedToMapping}>
                  Proceed to Column Mapping
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Column Mapping */}
        {step === 'mapping' && (
          <Card>
            <CardHeader>
              <CardTitle>Map CSV Columns to Lead Fields</CardTitle>
              <CardDescription>
                Match your CSV columns with the corresponding Lead fields. You can leave some unmapped.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Mapping Fields */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {csvHeaders.map((header) => (
                  <div key={header} className="flex flex-col gap-2">
                    <label className="font-semibold text-sm text-muted-foreground">
                      {header}
                    </label>
                    <Select
                      value={columnMapping[header] || ''}
                      onValueChange={(value) => handleMappingChange(header, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Skip this column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Skip --</SelectItem>
                        {LEAD_FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {/* Mapped Summary */}
              {Object.keys(columnMapping).length > 0 && (
                <div className="flex flex-col gap-2 rounded-md bg-muted p-4">
                  <h4 className="font-semibold text-sm">Mapping Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(columnMapping).map(([csvCol, leadField]) => (
                      leadField && (
                        <div key={csvCol} className="flex items-center gap-2">
                          <span className="rounded bg-blue-100 px-2 py-1 text-blue-700">
                            {csvCol}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="rounded bg-green-100 px-2 py-1 text-green-700">
                            {LEAD_FIELDS.find((f) => f.value === leadField)?.label}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('select')}>
                  Back
                </Button>
                <Button onClick={handleProceedToReview}>
                  Review Import
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Review & Submit */}
        {step === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>
                Review your import settings and submit to create leads and accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Settings Summary */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-semibold">
                    {typedCompanies.find((c) => c.id === parseInt(selectedCompany))?.name}
                  </p>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="font-semibold">
                    {typedRegions.find((r) => r.id === parseInt(selectedRegion))?.name}
                  </p>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Tier</p>
                  <p className="font-semibold">
                    {typedTiers.find((t) => t.id === parseInt(selectedTier))?.name}
                  </p>
                </div>
              </div>

              {/* Data Preview */}
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold">Data Preview</h4>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted">
                        {csvHeaders.map((header) => (
                          <th
                            key={header}
                            className="px-4 py-2 text-left font-semibold text-xs"
                          >
                            {columnMapping[header] ? (
                              <span className="text-green-700">
                                {LEAD_FIELDS.find((f) => f.value === columnMapping[header])?.label}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">{header} (skipped)</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="border-b">
                          {csvHeaders.map((header) => (
                            <td
                              key={`${idx}-${header}`}
                              className={`px-4 py-2 ${
                                columnMapping[header]
                                  ? 'text-foreground'
                                  : 'text-muted-foreground italic'
                              }`}
                            >
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  Preview showing {Math.min(5, csvData.length)} of {csvData.length} records
                </p>
              </div>

              {/* Submit Alert */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This will create {csvData.length} new leads and corresponding accounts. This action
                  cannot be undone.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Importing...' : 'Import Leads'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
