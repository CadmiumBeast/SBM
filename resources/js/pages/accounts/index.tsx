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
import { AlertCircle, Upload, FileText, ChevronRight, Mail, Briefcase, MapPin } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

interface Account {
  id: number;
  name: string;
  domain: string;
  company_id: number;
  region_id: number;
  tier_id: number;
}

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  headline: string;
  job_title: string;
  location: string;
  work_email: string;
  account_id: number;
  full_name?: string;
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
  const { companies, regions, tiers, accounts, leads } = usePage().props;

  // Modal and Upload State
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});

  // Organization Selection State
  const [selectedCompany, setSelectedCompany] = useState<string>('none');
  const [selectedRegion, setSelectedRegion] = useState<string>('none');
  const [selectedTier, setSelectedTier] = useState<string>('none');

  // Account and Leads View State
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountLeads, setAccountLeads] = useState<Lead[]>([]);

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
  const typedAccounts = accounts as Account[];
  const typedLeads = leads as Lead[];

  // Filter regions based on selected company
  const filteredRegions =
    selectedCompany !== 'none'
      ? typedRegions.filter((r) => r.company_id === parseInt(selectedCompany))
      : [];

  // Handle account click - show leads from this account
  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
    const accountLeadsList = typedLeads.filter((lead) => lead.account_id === account.id);
    setAccountLeads(accountLeadsList);
  };

  // Close account details
  const handleCloseAccountDetails = () => {
    setSelectedAccount(null);
    setAccountLeads([]);
  };

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

        // Auto-detect and map columns based on header names
        const autoMapping: ColumnMapping = {};
        headers.forEach((header) => {
          const lowerHeader = header.toLowerCase().trim();
          
          // Define mapping rules for auto-detection
          let mappedField = 'skip';
          
          if (lowerHeader.includes('profile') && lowerHeader.includes('url')) {
            mappedField = 'profile_url';
          } else if (lowerHeader.includes('first') && lowerHeader.includes('name')) {
            mappedField = 'first_name';
          } else if (lowerHeader.includes('last') && lowerHeader.includes('name')) {
            mappedField = 'last_name';
          } else if (lowerHeader === 'full name' || lowerHeader === 'fullname') {
            mappedField = 'full_name';
          } else if (lowerHeader.includes('headline')) {
            mappedField = 'headline';
          } else if (lowerHeader.includes('job') && lowerHeader.includes('title')) {
            mappedField = 'job_title';
          } else if (lowerHeader.includes('location')) {
            mappedField = 'location';
          } else if (lowerHeader === 'company') {
            mappedField = 'company';
          } else if (lowerHeader.includes('domain') && lowerHeader.includes('company')) {
            mappedField = 'company_domain';
          } else if (lowerHeader.includes('email') || lowerHeader.includes('work email')) {
            mappedField = 'work_email';
          }
          
          autoMapping[header] = mappedField;
        });

        setColumnMapping(autoMapping);

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
            <p className="text-muted-foreground mt-1">
              {selectedAccount
                ? `${selectedAccount.name} - Leads (${accountLeads.length})`
                : `Manage your accounts and leads (${typedAccounts.length} accounts)`}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedAccount && (
              <Button variant="outline" onClick={handleCloseAccountDetails}>
                Back to Accounts
              </Button>
            )}
            <Button onClick={() => setShowImportModal(true)} size="lg">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>

        {/* Accounts List View */}
        {!selectedAccount ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {typedAccounts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No accounts found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Import leads to create accounts
                </p>
              </div>
            ) : (
              typedAccounts.map((account) => {
                const accountLeadCount = typedLeads.filter((l) => l.account_id === account.id).length;
                const company = typedCompanies.find((c) => c.id === account.company_id);
                const tier = typedTiers.find((t) => t.id === account.tier_id);
                const region = typedRegions.find((r) => r.id === account.region_id);

                return (
                  <Card
                    key={account.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleAccountClick(account)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{account.name}</span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription className="truncate">{account.domain}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{company?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{region?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Tier:</span>
                        <span className="text-sm text-muted-foreground">{tier?.name || 'Unknown'}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <span className="text-lg font-bold text-primary">{accountLeadCount}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {accountLeadCount === 1 ? 'lead' : 'leads'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        ) : (
          /* Leads Details View */
          <div className="space-y-4">
            {accountLeads.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No leads found</CardTitle>
                  <CardDescription>
                    Import leads or add them manually to see them here
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-4">
                {accountLeads.map((lead) => (
                  <Card key={lead.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Name */}
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Name</p>
                          <p className="text-base font-semibold">
                            {lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || '-'}
                          </p>
                        </div>

                        {/* Job Title */}
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Job Title</p>
                          <p className="text-base">{lead.job_title || '-'}</p>
                        </div>

                        {/* Email */}
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Email</p>
                          {lead.work_email ? (
                            <a
                              href={`mailto:${lead.work_email}`}
                              className="text-base text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Mail className="h-4 w-4" />
                              {lead.work_email}
                            </a>
                          ) : (
                            <p className="text-base">-</p>
                          )}
                        </div>

                        {/* Headline */}
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Headline</p>
                          <p className="text-base text-muted-foreground line-clamp-2">{lead.headline || '-'}</p>
                        </div>

                        {/* Location */}
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Location</p>
                          <p className="text-base flex items-center gap-1">
                            {lead.location ? (
                              <>
                                <MapPin className="h-4 w-4" />
                                {lead.location}
                              </>
                            ) : (
                              '-'
                            )}
                          </p>
                        </div>

                        {/* First Name */}
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">First Name</p>
                          <p className="text-base">{lead.first_name || '-'}</p>
                        </div>

                        {/* Last Name */}
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Last Name</p>
                          <p className="text-base">{lead.last_name || '-'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

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
                      <Button onClick={handleProceedToReview} disabled={loading}>
                        {loading ? 'Processing...' : 'Continue to Review'}
                      </Button>
                    </DialogFooter>
                  </>
                )}

                {/* Review Step */}
                {step === 'review' && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Review Import</DialogTitle>
                      <DialogDescription>
                        Review the data before importing to your system.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border rounded p-3 bg-muted/30">
                          <p className="text-xs text-muted-foreground font-medium">Company</p>
                          <p className="text-sm font-semibold mt-1">
                            {typedCompanies.find((c) => c.id.toString() === selectedCompany)?.name || '-'}
                          </p>
                        </div>
                        <div className="border rounded p-3 bg-muted/30">
                          <p className="text-xs text-muted-foreground font-medium">Region</p>
                          <p className="text-sm font-semibold mt-1">
                            {typedRegions.find((r) => r.id.toString() === selectedRegion)?.name || '-'}
                          </p>
                        </div>
                        <div className="border rounded p-3 bg-muted/30">
                          <p className="text-xs text-muted-foreground font-medium">Tier</p>
                          <p className="text-sm font-semibold mt-1">
                            {typedTiers.find((t) => t.id.toString() === selectedTier)?.name || '-'}
                          </p>
                        </div>
                      </div>

                      {/* Import Stats */}
                      <div className="border rounded p-3 bg-primary/5">
                        <p className="text-xs text-muted-foreground font-medium">Total Rows</p>
                        <p className="text-2xl font-bold text-primary mt-1">{csvData?.rows.length}</p>
                      </div>

                      {/* Mapped Fields */}
                      <div className="border rounded p-3">
                        <p className="text-sm font-semibold mb-3">Mapped Fields</p>
                        <div className="space-y-2">
                          {Object.entries(columnMapping)
                            .filter(([_, field]) => field !== 'skip')
                            .map(([csv, field]) => (
                              <div key={csv} className="flex items-center justify-between text-sm">
                                <span className="font-medium text-muted-foreground">{csv}</span>
                                <span className="text-primary">
                                  {LEAD_FIELDS.find((f) => f.value === field)?.label}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setStep('mapping')}>
                        Back
                      </Button>
                      <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Importing...' : 'Confirm Import'}
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
