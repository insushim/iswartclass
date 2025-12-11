'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Wand2,
  Sparkles,
  Settings2,
  Download,
  Save,
  Share2,
  Loader2,
  RefreshCw,
  ZoomIn,
  Printer,
  Heart,
  Info,
  Check,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ART_TECHNIQUES } from '@/lib/constants/artTechniques';
import { THEMES } from '@/lib/constants/themes';
import { AGE_GROUPS } from '@/lib/constants/ageGroups';

interface GeneratedSheet {
  id?: string;
  imageUrl: string;
  thumbnailUrl: string;
  prompt: string;
  metadata: {
    technique: string;
    theme: string;
    subTheme: string;
    ageGroup: string;
    difficulty: number;
  };
}

const popularTechniques = ['COLORING', 'MANDALA', 'DOT_TO_DOT', 'ORIGAMI', 'MAZE', 'PATTERN'];

export default function GeneratePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSheets, setGeneratedSheets] = useState<GeneratedSheet[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [credits, setCredits] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [technique, setTechnique] = useState('COLORING');
  const [theme, setTheme] = useState('ANIMALS');
  const [subTheme, setSubTheme] = useState('');
  const [ageGroup, setAgeGroup] = useState('LOWER_ELEM');
  const [prompt, setPrompt] = useState('');
  const [complexity, setComplexity] = useState([50]);
  const [quantity, setQuantity] = useState([1]);
  const [paperSize, setPaperSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [includeInstructions, setIncludeInstructions] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(false);

  const selectedTechnique = ART_TECHNIQUES[technique as keyof typeof ART_TECHNIQUES];
  const selectedTheme = THEMES[theme as keyof typeof THEMES];
  const selectedSheet = generatedSheets[selectedIndex];

  // Fetch credits on mount
  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch('/api/user/credits');
        if (res.ok) {
          const data = await res.json();
          setCredits(data.credits);
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      }
    }
    fetchCredits();
  }, []);

  const handleGenerate = async () => {
    if (!technique || !theme || !ageGroup) {
      toast.error('모든 필수 항목을 선택해주세요');
      return;
    }

    if (credits !== null && credits < quantity[0]) {
      toast.error(`크레딧이 부족합니다. 필요: ${quantity[0]}, 보유: ${credits}`);
      return;
    }

    setIsGenerating(true);
    setGeneratedSheets([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          technique,
          theme,
          subTheme,
          ageGroup,
          prompt,
          complexity: complexity[0],
          quantity: quantity[0],
          paperSize,
          orientation,
          includeInstructions,
          includeWatermark,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '도안 생성에 실패했습니다');
      }

      setGeneratedSheets(data.sheets || []);
      setSelectedIndex(0);
      setCredits(data.creditsRemaining);
      toast.success(`${data.sheets?.length || 0}개의 도안이 생성되었습니다!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '도안 생성에 실패했습니다';
      toast.error(message);
      console.error('Generate error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSheet) return;
    toast.success('라이브러리에 저장되었습니다');
  };

  const handleDownload = async () => {
    if (!selectedSheet) return;

    try {
      // For data URLs, we can download directly
      if (selectedSheet.imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = selectedSheet.imageUrl;
        link.download = `artsheet_${technique}_${theme}_${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('다운로드가 시작되었습니다');
      } else {
        // For regular URLs
        const response = await fetch(selectedSheet.imageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `artsheet_${technique}_${theme}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('다운로드가 시작되었습니다');
      }
    } catch (error) {
      toast.error('다운로드에 실패했습니다');
      console.error('Download error:', error);
    }
  };

  const handlePrint = () => {
    if (!selectedSheet) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('팝업이 차단되었습니다. 팝업을 허용해주세요.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ArtSheet Pro - 인쇄</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              img { max-width: 100%; height: auto; page-break-inside: avoid; }
            }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${selectedSheet.imageUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShare = async () => {
    if (!selectedSheet) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ArtSheet Pro 도안',
          text: `${selectedTheme?.name || theme} 주제의 ${selectedTechnique?.name || technique} 도안`,
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('공유에 실패했습니다');
        }
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('링크가 클립보드에 복사되었습니다');
      } catch {
        toast.error('클립보드 복사에 실패했습니다');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            AI 도안 생성
          </h1>
          <p className="text-muted-foreground">
            AI를 활용하여 맞춤형 미술 도안을 생성하세요
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          남은 크레딧: {credits !== null ? credits : '...'}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                생성 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Technique Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  기법 선택
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>36가지 미술 기법 중 선택하세요</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {popularTechniques.map((tech) => {
                    const techData = ART_TECHNIQUES[tech as keyof typeof ART_TECHNIQUES];
                    return (
                      <Button
                        key={tech}
                        variant={technique === tech ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTechnique(tech)}
                        className="gap-1"
                      >
                        <span>{techData?.icon}</span>
                        {techData?.name}
                      </Button>
                    );
                  })}
                </div>
                <Select value={technique} onValueChange={setTechnique}>
                  <SelectTrigger>
                    <SelectValue placeholder="더 많은 기법 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ART_TECHNIQUES).map(([key, tech]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span>{tech.icon}</span>
                          {tech.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTechnique && (
                  <p className="text-xs text-muted-foreground">
                    {selectedTechnique.description}
                  </p>
                )}
              </div>

              <Separator />

              {/* Theme Selection */}
              <div className="space-y-3">
                <Label>테마 선택</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="테마 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(THEMES).map(([key, themeData]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span>{themeData.icon}</span>
                          {themeData.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTheme?.subThemes && (
                  <Select value={subTheme} onValueChange={setSubTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="세부 테마 선택 (선택사항)" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTheme.subThemes.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Separator />

              {/* Age Group */}
              <div className="space-y-3">
                <Label>연령대</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(AGE_GROUPS).map(([key, group]) => (
                    <Button
                      key={key}
                      variant={ageGroup === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAgeGroup(key)}
                      className="flex-col h-auto py-2"
                    >
                      <span className="text-xs font-medium">{group.nameKo}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {group.ageRange}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Prompt */}
              <div className="space-y-3">
                <Label htmlFor="prompt">추가 설명 (선택사항)</Label>
                <Textarea
                  id="prompt"
                  placeholder="예: 귀여운 강아지가 꽃밭에서 놀고 있는 장면"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  더 구체적인 설명을 입력하면 원하는 도안을 얻을 확률이 높아져요
                </p>
              </div>

              {/* Advanced Settings */}
              <Accordion type="single" collapsible>
                <AccordionItem value="advanced">
                  <AccordionTrigger className="text-sm">
                    고급 설정
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    {/* Complexity */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>복잡도</Label>
                        <span className="text-sm text-muted-foreground">
                          {complexity[0]}%
                        </span>
                      </div>
                      <Slider
                        value={complexity}
                        onValueChange={setComplexity}
                        max={100}
                        step={10}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>단순</span>
                        <span>복잡</span>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>생성 개수</Label>
                        <span className="text-sm text-muted-foreground">
                          {quantity[0]}장
                        </span>
                      </div>
                      <Slider
                        value={quantity}
                        onValueChange={setQuantity}
                        min={1}
                        max={4}
                        step={1}
                      />
                    </div>

                    {/* Paper Size */}
                    <div className="space-y-3">
                      <Label>용지 크기</Label>
                      <Select value={paperSize} onValueChange={setPaperSize}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4 (210 x 297mm)</SelectItem>
                          <SelectItem value="A3">A3 (297 x 420mm)</SelectItem>
                          <SelectItem value="B5">B5 (176 x 250mm)</SelectItem>
                          <SelectItem value="Letter">Letter (216 x 279mm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Orientation */}
                    <div className="space-y-3">
                      <Label>방향</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={orientation === 'portrait' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOrientation('portrait')}
                        >
                          세로
                        </Button>
                        <Button
                          variant={orientation === 'landscape' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOrientation('landscape')}
                        >
                          가로
                        </Button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="instructions">활동 안내문 포함</Label>
                        <Switch
                          id="instructions"
                          checked={includeInstructions}
                          onCheckedChange={setIncludeInstructions}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="watermark">워터마크 추가</Label>
                        <Switch
                          id="watermark"
                          checked={includeWatermark}
                          onCheckedChange={setIncludeWatermark}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Generate Button */}
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    도안 생성하기 ({quantity[0]} 크레딧)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="min-h-[600px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">미리보기</CardTitle>
                {generatedSheets.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      다시 생성
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">AI가 도안을 생성하고 있어요</p>
                    <p className="text-sm text-muted-foreground">
                      잠시만 기다려주세요...
                    </p>
                  </div>
                </div>
              ) : generatedSheets.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Preview */}
                  <div
                    className="relative aspect-[3/4] bg-white rounded-lg overflow-hidden border cursor-pointer"
                    onClick={() => setShowPreview(true)}
                  >
                    {selectedSheet && (
                      <img
                        src={selectedSheet.imageUrl}
                        alt="생성된 도안"
                        className="w-full h-full object-contain"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button variant="secondary" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setShowPreview(true); }}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {generatedSheets.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {generatedSheets.map((sheet, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedIndex(index)}
                          className={`relative h-20 w-20 rounded-lg border-2 overflow-hidden shrink-0 ${
                            selectedIndex === index
                              ? 'border-primary'
                              : 'border-muted'
                          }`}
                        >
                          <img
                            src={sheet.thumbnailUrl}
                            alt={`도안 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {selectedIndex === index && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button variant="outline" className="gap-1" onClick={handleSave}>
                      <Save className="h-4 w-4" />
                      저장
                    </Button>
                    <Button variant="outline" className="gap-1" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                      다운로드
                    </Button>
                    <Button variant="outline" className="gap-1" onClick={handlePrint}>
                      <Printer className="h-4 w-4" />
                      인쇄
                    </Button>
                    <Button variant="outline" className="gap-1" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                      공유
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] gap-4 text-center">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                    <Wand2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">도안을 생성해보세요</p>
                    <p className="text-sm text-muted-foreground">
                      왼쪽에서 설정을 선택하고 생성 버튼을 클릭하세요
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technique Info */}
          {selectedTechnique && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">{selectedTechnique.icon}</span>
                  {selectedTechnique.name} 기법 안내
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2">필요한 재료</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTechnique.materials.map((material) => (
                        <Badge key={material} variant="secondary" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">발달 영역</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTechnique.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {selectedTechnique.tips && selectedTechnique.tips.length > 0 && (
                    <div className="sm:col-span-2">
                      <h4 className="text-sm font-medium mb-2">활동 팁</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {selectedTechnique.tips.slice(0, 3).map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Full Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>도안 미리보기</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  다운로드
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-1" />
                  인쇄
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedSheet && (
            <div className="flex justify-center">
              <img
                src={selectedSheet.imageUrl}
                alt="생성된 도안"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
