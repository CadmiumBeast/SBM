import React, { useState, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, FileText } from 'lucide-react';
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

interface CSVData {
  headers: string[];
  rows: string[][];
}

const LEAD_FIELDS = [
  { value: 'skip', label: 'Do not import' },
  { value: 'profile_url', label: 'Profile Url' },
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'full_name', label: 'Full Name' },
  { value: 'headline', label: 'Headline' },
  { value: 'job_title', label: 'Job Title' },
  { value: 'location', label: 'Location' },
  { value: 'company', label: 'Company' },
  { value: 'company_domain', label: 'Company Domain' },
  { value: 'work_email', label: 'Work Email' },
];

export default function AccountsIndex() {
  const { companies, regions, tiers } = usePage().props;

  // Modal and Upload State
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});

  // Organization Selection State
  const [selectedCompany, setSelectedCompany] = useState<string>('none');
  const [selectedRegion, setSelectedRegion] = useState<string>('none');
  const [selectedTier, setSelectedTier] = useState<string>('none');

  // UI State
  const [step, setStep] = useState<'upload' | 'mapping' | 'review'>('upload');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Type casting
  const typedCompanies = companies as Company[];
  const typedRegions = regions as Region[];
  const typedTiers = tiers as Tier[];

  // Filter regions based on selected company
  const filteredRegions =
    selectedCompany !== 'none'
      ? typedRegions.filter((r) => r.company_id === parseInt(selectedCompany))
      : [];

  // Handle file selection and CSV parsing
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

  // Parse CSV file with proper CSV parsing
  const parseCSV = (csvFile: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim() !== '');

        // Proper CSV parsing that handles quoted fields with commas
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
              // Handle escaped quotes (double quotes)
              if (i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++; // Skip the next quote
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }

          // Add the last field
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]);
        const rows = lines.slice(1).map((line) => parseCSVLine(line));

        if (lines.length < 2) {
          setError('CSV file must contain headers and at least one row');
          setIsProcessing(false);
          return;
        }

        setCsvData({ headers, rows });

        // Initialize column mapping with default 'skip' values
        const initialMapping: ColumnMapping = {};
        headers.forEach((header) => {
          initialMapping[header] = 'skip';
        });
        setColumnMapping(initialMapping);

        setStep('mapping');
        setError(null);
        setIsProcessing(false);
      } catch (err) {
        setError('Error parsing CSV file. Please ensure it is properly formatted.');
        setIsProcessing(false);
      }
    };
    reader.readAsText(csvFile);
  };

  // Proceed from select to mapping
  const handleProceedToMapping = () => {
    if (!selectedCompany || !selectedRegion || !selectedTier) {
      setError('Please select Company, Region, and Tier');
      return;
    }
    setStep('mapping');
    setError(null);
  };

  // Handle column mapping change
  const handleMappingChange = (csvColumn: string, leadField: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [csvColumn]: leadField,
    }));
  };

  // Proceed from mapping to review
  const handleProceedToReview = () => {
    const mappedFields = Object.values(columnMapping).filter(
      (field) => field && field !== 'skip'
    );
    if (mappedFields.length === 0) {
      setError('Please map at least one CSV column to a Lead field');
      return;
    }
    setStep('review');
    setError(null);
  };

  // Submit the import
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        company_id: selectedCompany,
        region_id: selectedRegion,
        tier_id: selectedTier,
        column_mapping: columnMapping,
        csv_headers: csvData?.headers || [],
        csv_rows: csvData?.rows || [],
      };

      router.post('/accounts/import', payload, {
        onError: (errors: any) => {
          setError(errors.message || 'Failed to import leads');
          setLoading(false);
        },
        onSuccess: () => {
          setLoading(false);
          handleCloseModal();
        },
      });
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  // Close modal and reset
  const handleCloseModal = () => {
    setShowImportModal(false);
    // Reset all state
    setTimeout(() => {
      setFile(null);
      setCsvData(null);
      setColumnMapping({});
      setSelectedCompany('none');
      setSelectedRegion('none');
      setSelectedTier('none');
      setStep('upload');
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 300);
  };

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Accounts</h1>
            <p className="text-muted-foreground mt-1">Manage your accounts and leads</p>
          </div>
          <Button onClick={() => setShowImportModal(true)} size="lg">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>

        {/* Import Modal */}
        <Dialog open={showImportModal} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-2xl">
            {isProcessing ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Processing CSV file...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Upload Step */}
                {step === 'upload' && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Import Leads from CSV</DialogTitle>
                      <DialogDescription>
                        Select a CSV file to import leads. Map columns on the next step.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="company-select">Company *</Label>
                        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select a company</SelectItem>
                            {typedCompanies.map((company) => (
                              <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="region-select">Region *</Label>
                        <Select
                          value={selectedRegion}
                          onValueChange={setSelectedRegion}
                          disabled={selectedCompany === 'none'}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select a region</SelectItem>
                            {filteredRegions.map((region) => (
                              <SelectItem key={region.id} value={region.id.toString()}>
                                {region.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="tier-select">Tier *</Label>
                        <Select value={selectedTier} onValueChange={setSelectedTier}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select a tier</SelectItem>
                            {typedTiers.map((tier) => (
                              <SelectItem key={tier.id} value={tier.id.toString()}>
                                {tier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="csv-file">CSV File *</Label>
                        <Input
                          ref={fileInputRef}
                          id="csv-file"
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                        />
                        {file && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            {file.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={handleCloseModal}>
                        Cancel
                      </Button>
                    </DialogFooter>
                  </>
                )}

                {/* Mapping Step */}
                {step === 'mapping' && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Map CSV Columns</DialogTitle>
                      <DialogDescription>
                        Map your CSV columns to lead fields. Preview shows the first 5 rows.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 max-h-96 overflow-y-auto pr-4">
                      {csvData?.headers.map((header, index) => (
                        <div key={header} className="grid gap-2">
                          <Label className="text-sm font-medium">{header}</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <Select
                              value={columnMapping[header] || 'skip'}
                              onValueChange={(value) => handleMappingChange(header, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {LEAD_FIELDS.map((col) => (
                                  <SelectItem key={col.value} value={col.value}>
                                    {col.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="text-sm text-muted-foreground border rounded p-2 max-h-20 overflow-hidden">
                              <div className="font-medium text-xs">Preview:</div>
                              {csvData?.rows.slice(0, 3).map((row, rowIndex) => (
                                <div key={rowIndex} className="truncate text-xs">
                                  {row[index] || '-'}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setStep('upload')}>
                        Back
                      </Button>
                      <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Importing...' : 'Import Data'}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
