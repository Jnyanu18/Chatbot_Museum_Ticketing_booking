'use client';

import { useState } from 'react';
import { QrCode, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export default function ScannerPage() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [message, setMessage] = useState('Point the camera at a QR code to scan.');

  const handleScan = () => {
    setStatus('scanning');
    setMessage('Verifying ticket...');

    // Simulate API call
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2; // 80% success rate
      if (isSuccess) {
        setStatus('success');
        setMessage('Check-in Successful! Welcome.');
      } else {
        setStatus('error');
        setMessage('Invalid or Expired Ticket.');
      }
    }, 1500);
  };

  const handleReset = () => {
    setStatus('idle');
    setMessage('Point the camera at a QR code to scan.');
  };

  const statusConfig = {
    idle: {
      icon: <QrCode className="h-24 w-24 text-muted-foreground" />,
      color: 'text-muted-foreground',
    },
    scanning: {
      icon: <Loader2 className="h-24 w-24 animate-spin text-primary" />,
      color: 'text-primary',
    },
    success: {
      icon: <CheckCircle className="h-24 w-24 text-green-500" />,
      color: 'text-green-500',
    },
    error: {
      icon: <XCircle className="h-24 w-24 text-destructive" />,
      color: 'text-destructive',
    },
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <CardTitle className="text-3xl font-headline">Ticket Scanner</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 p-8">
                <div className="relative flex h-64 w-64 items-center justify-center rounded-lg border-4 border-dashed bg-muted">
                    {/* In a real app, a camera view would be here */}
                    {statusConfig[status].icon}
                </div>
                <p className={cn('text-lg font-medium', statusConfig[status].color)}>
                {message}
                </p>
                {status === 'idle' ? (
                <Button size="lg" onClick={handleScan}>
                    <QrCode className="mr-2 h-5 w-5" />
                    Scan Ticket
                </Button>
                ) : (
                <Button size="lg" onClick={handleReset} variant="outline">
                    Scan Next
                </Button>
                )}
            </CardContent>
            </Card>
        </main>
    </div>
  );
}
