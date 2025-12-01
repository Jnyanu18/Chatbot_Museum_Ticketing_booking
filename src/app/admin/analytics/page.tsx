
import { FileDown, VenetianMask } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';

import {
  bookingsOverTimeData,
  revenueByMuseumData,
  peakHoursData,
  languageDistributionData,
  conversionFunnelData,
  qrVerificationData,
  chatbotPerformanceData,
  abandonedBookingsData,
  promotionEffectivenessData,
} from '@/lib/data';

import BookingsOverTimeChart from '@/components/charts/bookings-over-time-chart';
import RevenueByMuseumChart from '@/components/charts/revenue-by-museum-chart';
import PeakHoursChart from '@/components/charts/peak-hours-chart';
import LanguageDistributionChart from '@/components/charts/language-distribution-chart';
import ConversionFunnelChart from '@/components/charts/conversion-funnel-chart';
import QrVerificationChart from '@/components/charts/qr-verification-chart';
import ChatbotPerformanceChart from '@/components/charts/chatbot-performance-chart';
import AbandonedBookingsChart from '@/components/charts/abandoned-bookings-chart';
import PromotionEffectivenessChart from '@/components/charts/promotion-effectiveness-chart';


export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Insights into your museum operations.</p>
        </div>
        <div className="flex items-center gap-2">
            {/* The DateRangePicker component does not exist in shadcn, so we'll use a placeholder button */}
            <Button variant="outline">Date Range</Button>
            <Button>
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue by Museum</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RevenueByMuseumChart data={revenueByMuseumData} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Language Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LanguageDistributionChart data={languageDistributionData} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Conversion Funnel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ConversionFunnelChart data={conversionFunnelData} />
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="bookings" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Bookings Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BookingsOverTimeChart data={bookingsOverTimeData} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Peak Visit Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PeakHoursChart data={peakHoursData} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>QR Verification vs Expected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <QrVerificationChart data={qrVerificationData} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Abandoned Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AbandonedBookingsChart data={abandonedBookingsData} />
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="chatbot" className="space-y-6 mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Chatbot Performance</CardTitle>
                    <CardDescription>Success vs. failed intents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChatbotPerformanceChart data={chatbotPerformanceData} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="promotions" className="space-y-6 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Promotion Effectiveness</CardTitle>
                </CardHeader>
                <CardContent>
                    <PromotionEffectivenessChart data={promotionEffectivenessData} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
